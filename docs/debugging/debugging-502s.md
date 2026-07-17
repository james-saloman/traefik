---
title: Debugging 502s
---

# Debugging 502s

## Why 502?

502 "Bad Gateway" means Traefik can't reach backend service. Usually:

- Service not running
- Service unreachable on network
- Service returning error

## Debugging Steps

**Step 1: Service running?**

```bash
docker ps | grep api
# Is container running?

kubectl get pods -l app=api
# Are pods running?
```

**Step 2: Port correct?**

```yaml
services:
  api:
    loadBalancer:
      server.port: 8080  # Is service really on 8080?
```

Check:

```bash
docker exec api netstat -tuln | grep 8080
# Is port listening?
```

**Step 3: Network reachable?**

From Traefik container:

```bash
docker exec traefik ping api
# Can resolve hostname?

docker exec traefik curl http://api:8080/health
# Can reach endpoint?
```

**Step 4: Service healthy?**

```bash
curl http://localhost:8080/health  # From service container
# Does health check pass?
```

**Step 5: Load balancer backend?**

Multiple backends?

```yaml
services:
  api:
    loadBalancer:
      servers:
        - url: "http://api-1:8080"
        - url: "http://api-2:8080"
```

Is at least one responding?

## Network Issues

**Docker network**:

```bash
docker network inspect web
# Is Traefik connected?
# Is service connected?
# Do they share network?
```

**Kubernetes network**:

```bash
kubectl describe svc api
# Check endpoints (should have IPs)

kubectl logs <traefik-pod>
# Check for network errors
```

## Port Mapping

If exposing via host port:

```yaml
ports:
  - "8080:8080"
```

But service on different port → 502

Check:

```yaml
labels:
  - "traefik.http.services.api.loadbalancer.server.port=8080"
  # Must match container port!
```

## Health Checks

Enable health checks:

```yaml
services:
  api:
    loadBalancer:
      healthCheck:
        path: "/health"
        interval: "10s"
```

If health check fails, backend removed from load balancer.

Check logs:

```bash
docker logs traefik | grep health
```

## Intermittent 502s

Indicates flaky service:

```
Request 1: OK
Request 2: 502
Request 3: OK
```

Check:

- Service crashing intermittently
- Slow startup
- Memory leaks
- Overload (too much traffic)

## Common Causes Checklist

- [ ] Service container/pod running?
- [ ] Service listening on correct port?
- [ ] Service reachable from Traefik container/pod?
- [ ] Port mapping correct?
- [ ] Network connectivity correct?
- [ ] Health check passing?
- [ ] Service not overloaded?

## Key Takeaway

502s indicate backend unreachable. Debug by checking service is running, port is correct, network is connected, and health checks pass. Use `curl` to test connectivity from Traefik container.
