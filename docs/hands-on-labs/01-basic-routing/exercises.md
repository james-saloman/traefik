---
title: Exercises
---

# Exercises

## Exercise 1: Verify Setup

```bash
# Start services
docker-compose up -d

# Check running
docker-compose ps

# Access via curl
curl -H "Host: myapp.local" http://localhost

# Check dashboard
open http://localhost:8080/dashboard
```

## Exercise 2: Add Custom Service

Modify docker-compose.yml:

```yaml
custom:
  image: httpbin:latest
  labels:
    - "traefik.enable=true"
    - "traefik.http.routers.custom.rule=Host(`custom.local`)"
    - "traefik.http.routers.custom.entrypoints=web"
    - "traefik.http.services.custom.loadbalancer.server.port=80"
  networks:
    - web
```

Restart:

```bash
docker-compose down
docker-compose up -d
curl -H "Host: custom.local" http://localhost
```

## Exercise 3: Multiple Hosts

Create second hostname routing to same service:

```yaml
labels:
  - "traefik.http.routers.myapp.rule=Host(`myapp.local`) || Host(`localhost`)"
```

Test both hosts.

## Exercise 4: Health Checks

Add health check:

```yaml
labels:
  - "traefik.http.services.nginx.loadbalancer.healthcheck.path=/"
  - "traefik.http.services.nginx.loadbalancer.healthcheck.interval=10s"
```

Stop service, watch Traefik remove it from load balancer.

