---
title: Static vs Dynamic Configuration
---

# Static vs Dynamic Configuration

## The Core Difference

```
┌────────────────────────────────────────────────────────┐
│              TRAEFIK CONFIGURATION                     │
├─────────────────────────┬──────────────────────────────┤
│   STATIC CONFIG         │   DYNAMIC CONFIG             │
├─────────────────────────┼──────────────────────────────┤
│ Traefik's own settings  │ Your services' routing       │
│ (ports, log level)      │ (routers, services)          │
│                         │                              │
│ Change how?             │ Change how?                  │
│ → Edit + Restart        │ → Auto hot-reload            │
│   (slow, downtime)      │ (fast, no downtime)          │
│                         │                              │
│ How often change?       │ How often change?            │
│ Rarely (setup once)     │ Often (as services change)   │
└─────────────────────────┴──────────────────────────────┘
```

## Static Configuration

Defines Traefik itself:
- Which ports to listen on (entrypoints)
- Which providers to use
- Log levels
- Metrics/dashboard
- Global settings

Set via:
- Command-line flags
- Environment variables
- config.yml file

Example:

```yaml
# Static config (traefik.yml)
entryPoints:
  web:
    address: ":80"
  websecure:
    address: ":443"

providers:
  docker: {}
  file:
    filename: "/etc/traefik/dynamic.yml"

api:
  dashboard: true
  insecure: true
```

Changes require Traefik restart.

## Dynamic Configuration

Defines routing for your services:
- Routers (matching rules)
- Services (load balancers)
- Middlewares (transformations)

Set via:
- Docker labels
- Kubernetes annotations
- File provider (separate file)
- API calls

Example:

```yaml
# Dynamic config (dynamic.yml or docker labels)
routers:
  myapp:
    rule: "Host(`myapp.com`)"
    service: myapp-service
    middlewares:
      - auth

services:
  myapp-service:
    loadBalancer:
      servers:
        - url: "http://backend1:8080"
        - url: "http://backend2:8080"

middlewares:
  auth:
    basicAuth:
      users:
        - "user:password"
```

Changes apply immediately without restart.

## Static Configuration Sources

**Command-line flags**:

```bash
traefik \
  --entrypoints.web.address=:80 \
  --providers.docker=true \
  --api.dashboard=true
```

**Environment variables**:

```bash
TRAEFIK_ENTRYPOINTS_WEB_ADDRESS=:80
TRAEFIK_PROVIDERS_DOCKER=true
TRAEFIK_API_DASHBOARD=true
```

**Config file** (traefik.yml):

```yaml
entryPoints:
  web:
    address: ":80"
providers:
  docker: {}
api:
  dashboard: true
```

## Dynamic Configuration Sources

**Docker labels**:

```yaml
services:
  app:
    labels:
      - "traefik.http.routers.app.rule=Host(`app.com`)"
      - "traefik.http.services.app.loadbalancer.server.port=8080"
```

**File provider**:

```yaml
providers:
  file:
    filename: "/etc/traefik/dynamic.yml"
    watch: true
```

**Kubernetes annotations**:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    traefik.ingress.kubernetes.io/router.entrypoints: web,websecure
```

## Docker Compose Example

```yaml
version: '3'
services:
  traefik:
    image: traefik:v2.9
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./traefik.yml:/traefik.yml  # Static config
      - ./dynamic.yml:/dynamic.yml   # Dynamic config
    command:
      - "--configFile=/traefik.yml"

  api:
    image: myapi
    labels:
      # Dynamic config (no restart needed)
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(`api.local`)"
      - "traefik.http.services.api.loadbalancer.server.port=8080"
```

## Hot-Reload Behavior

Static config changes:
```bash
# Edit traefik.yml
# Restart Traefik
docker-compose restart traefik
```

Dynamic config changes:
```bash
# Edit docker labels or dynamic.yml
# Traefik auto-detects and reloads
# No restart needed!
```

## Common Static Configuration

```yaml
# traefik.yml
entryPoints:
  web:
    address: ":80"
  websecure:
    address: ":443"
    http:
      tls:
        certResolver: letsencrypt

providers:
  docker:
    exposedByDefault: false
  file:
    directory: "/etc/traefik/config"
    watch: true

api:
  dashboard: true
  debug: true

log:
  level: DEBUG

certificatesResolvers:
  letsencrypt:
    acme:
      email: admin@example.com
      storage: /acme.json
      httpChallenge:
        entryPoint: web
```

Rarely changes after initial setup.

## Common Dynamic Configuration

```yaml
# dynamic.yml
routers:
  api:
    rule: "Host(`api.example.com`)"
    service: api-service
    entryPoints:
      - web
      - websecure
    tls:
      certResolver: letsencrypt

  web:
    rule: "Host(`example.com`)"
    service: web-service

services:
  api-service:
    loadBalancer:
      servers:
        - url: "http://api-1:8080"
        - url: "http://api-2:8080"

  web-service:
    loadBalancer:
      servers:
        - url: "http://web-1:3000"
```

Changes as services are added/removed.

## Key Differences Summary

| Aspect | Static | Dynamic |
|--------|--------|---------|
| Defines | Traefik itself | Your services |
| Change method | Restart Traefik | Auto hot-reload |
| Frequency | Rarely | Often |
| Providers | None | Docker, K8s, File |
| Examples | Ports, log level, ACME | Routes, services, middlewares |

## Key Takeaway

Static configuration sets up Traefik's core features (ports, providers, ACME). Dynamic configuration defines your service routing rules. Separate them so you can change service routing without restarting Traefik.
