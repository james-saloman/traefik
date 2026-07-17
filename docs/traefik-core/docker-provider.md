---
title: Docker Provider
---

# Docker Provider

## What is Docker Provider?

The **Docker provider** enables Traefik to watch the Docker daemon continuously and automatically configure routing based on container labels. Containers self-register—no manual configuration needed.

## Docker Provider Workflow

```
┌──────────────────────────────────────────────┐
│     Docker Container Lifecycle               │
├──────────────────────────────────────────────┤
│                                              │
│ Step 1: Container Starts                     │
│ docker run ... -l "traefik.enable=true"      │
│                                              │
│ Step 2: Traefik Detects                      │
│ Watches /var/run/docker.sock                 │
│ Sees new container with labels ✓             │
│                                              │
│ Step 3: Reads Labels                         │
│ traefik.http.routers.app.rule=Host(...)     │
│ traefik.http.services.app.port=8080          │
│                                              │
│ Step 4: Auto-Configuration                   │
│ Creates router + service automatically       │
│ No restart needed                            │
│                                              │
│ Step 5: Traffic Flows                        │
│ Requests route to container immediately      │
│                                              │
│ Step 6: Container Stops                      │
│ Traefik detects removal                      │
│ Removes routing automatically                │
│                                              │
└──────────────────────────────────────────────┘
```

## Configuration

Enable in Traefik:

```yaml
providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
    network: "web"
```

- `endpoint`: Path to Docker socket
- `exposedByDefault`: Expose all containers? (usually false)
- `network`: Which Docker network to use

## Container Labels

Define routing via labels:

```yaml
services:
  myapp:
    image: myapp
    labels:
      # Enable Traefik
      - "traefik.enable=true"
      
      # Router configuration
      - "traefik.http.routers.myapp.rule=Host(`myapp.com`)"
      - "traefik.http.routers.myapp.entrypoints=web,websecure"
      - "traefik.http.routers.myapp.tls=true"
      - "traefik.http.routers.myapp.tls.certresolver=letsencrypt"
      
      # Service configuration
      - "traefik.http.services.myapp.loadbalancer.server.port=8080"
      - "traefik.http.services.myapp.loadbalancer.healthcheck.path=/health"
      - "traefik.http.services.myapp.loadbalancer.healthcheck.interval=10s"
      
      # Middleware
      - "traefik.http.routers.myapp.middlewares=auth"
      - "traefik.http.middlewares.auth.basicauth.users=user:password"
```

## Basic Example

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
    command:
      - "--providers.docker=true"
      - "--providers.docker.exposedByDefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--api.insecure=true"
    networks:
      - web

  api:
    image: myapi
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(`api.local`)"
      - "traefik.http.services.api.loadbalancer.server.port=8080"
    networks:
      - web

  web:
    image: myweb
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.web.rule=Host(`web.local`)"
      - "traefik.http.services.web.loadbalancer.server.port=3000"
    networks:
      - web

networks:
  web:
    driver: bridge
```

Traefik automatically routes:
- api.local → api container:8080
- web.local → web container:3000

## Multiple Instances

```yaml
services:
  api:
    image: myapi
    deploy:
      replicas: 3
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(`api.local`)"
      - "traefik.http.services.api.loadbalancer.server.port=8080"
```

All 3 api containers automatically load-balanced.

## Port Detection

If container exposes single port, no need to specify:

```dockerfile
# Dockerfile
EXPOSE 8080
```

```yaml
labels:
  - "traefik.http.services.myapp.loadbalancer.server.port=8080"
```

Auto-detected from EXPOSE.

## Docker Swarm Mode

In Swarm, use service labels (not container):

```bash
docker service create \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.api.rule=Host(\`api.local\`)" \
  --label "traefik.http.services.api.loadbalancer.server.port=8080" \
  -p 8080:8080 \
  --name api \
  myapi
```

## Health Checks

Traefik can monitor container health:

```yaml
labels:
  - "traefik.http.services.myapp.loadbalancer.healthcheck.path=/health"
  - "traefik.http.services.myapp.loadbalancer.healthcheck.interval=10s"
  - "traefik.http.services.myapp.loadbalancer.healthcheck.timeout=5s"
```

If `/health` fails, container removed from load balancer.

## Network Selection

Specify which Docker network for backend communication:

```yaml
providers:
  docker:
    network: "web"
```

Traefik will use IPs from "web" network for routing.

## Constraints

Only route containers matching constraint:

```yaml
providers:
  docker:
    constraints: "tag==web"
```

Only containers with `tag=web` label are exposed:

```yaml
labels:
  - "traefik.tags=web"
```

## Troubleshooting

**Container not showing up**:
- Check `traefik.enable=true` label
- Check Docker socket permissions
- Check Docker network connectivity
- Verify `traefik.http.routers.*.rule` is valid

**Check logs**:

```bash
docker logs traefik-container
```

**Test connectivity**:

```bash
docker exec traefik-container \
  curl http://api:8080/health
```

## Key Takeaway

Docker provider enables zero-config service discovery. Containers with appropriate labels automatically get routed. No need to manually configure Traefik when services change.
