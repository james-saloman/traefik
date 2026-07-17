---
title: Dynamic Config Reloads
---

# Dynamic Config Reloads

## Hot-reload Concept

Change routing configuration without restarting Traefik. Existing connections continue, new connections use updated config.

## What Triggers Reload?

**Docker provider**: Container start, stop, label change
**File provider**: Configuration file modified
**Kubernetes provider**: Ingress resource created/updated
**API**: Direct API calls

## Reload Process

```
1. Configuration change detected
2. Traefik parses new configuration
3. Validates syntax and rules
4. If invalid → reject, keep old config
5. If valid → build new routing table
6. In-flight requests: Use old table
7. New requests: Use new table
8. Old table garbage collected
```

No downtime, no dropped requests.

## Example: Add New Service

```yaml
# Old config
routers:
  api:
    rule: "Host(`api.local`)"
    service: api-service

services:
  api-service:
    loadBalancer:
      servers:
        - url: "http://api:8080"
```

Container starts with new labels:

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.web.rule=Host(`web.local`)"
  - "traefik.http.services.web.loadbalancer.server.port=3000"
```

Traefik:
1. Detects Docker event
2. Reads new labels
3. Adds new web router to config
4. Reloads routing table
5. Both api and web routes now active

## Validation Before Reload

Traefik validates before reloading:

```
New config: "routers.api.rule = Host(api.com"  # Missing closing paren
            ↓
            Syntax invalid
            ↓
            Old config kept
            ↓
            No reload, no downtime
```

Bad config safely rejected.

## Gradual Rollout

Deploy new version with load balancing:

```
Old version handling 100% traffic
New version starts
Traefik reloads config
New version added to load balancer (0% traffic initially)
Gradually shift traffic via weights or manual intervention
Old version removed when new version stable
```

## Configuration Comparison

Before reload:

```yaml
routers:
  api:
    rule: "Host(`api.local`)"
    service: api-service

  web:
    rule: "Host(`web.local`)"
    service: web-service
```

After reload (web updated):

```yaml
routers:
  api:
    rule: "Host(`api.local`)"
    service: api-service

  web:
    rule: "Host(`web.local`)"
    service: web-service-v2  # Changed!
```

## Connection Persistence

Existing connections not affected:

```
Connection A: Established with old table
  Requests continue on old routing
  
Reload happens

Connection B: New connection
  Uses new routing table
  
Connection A: Eventually closes
  Old table cleaned up
```

## Reload Monitoring

Monitor reloads in logs:

```yaml
log:
  level: INFO
```

Logs show:

```
INFO    Configuration reloaded
DEBUG   [docker] loading containers...
DEBUG   [docker] created router: api (...)
```

## Rate Limiting Reloads

Too many reloads = unstable. Traefik debounces:

```
Event 1: Config changed → schedule reload in 100ms
Event 2: Config changed again → reschedule in 100ms
Event 3: Wait...
100ms passes → only reload once
```

Prevents thrashing from rapid changes.

## File Provider Watch

With watch enabled:

```yaml
providers:
  file:
    filename: "/etc/traefik/dynamic.yml"
    watch: true
```

Edit file:

```bash
echo "
routers:
  new:
    rule: 'Host(\`new.local\`)'
    service: new-service
" >> /etc/traefik/dynamic.yml
```

Traefik detects, reloads, new route active.

## Reload Failures

If reload fails:

```
1. New config parsed
2. Invalid rule detected
3. Reload rejected
4. Old config continues
5. Log shows error
```

Safe failure.

## Zero-Downtime Deployment Pattern

```
1. Start new version of service
2. Traefik detects (Docker event)
3. Adds new version to load balancer
4. Both old and new serve traffic
5. Health check fails on old version
6. Traefik removes old version
7. Only new version serves traffic
8. Done
```

No downtime, users don't notice.

## Key Takeaway

Dynamic reloads enable configuration changes without restart. Traefik validates before reloading, handles in-flight requests safely, enables zero-downtime deployments.
