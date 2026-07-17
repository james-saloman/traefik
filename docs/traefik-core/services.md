---
title: Services
---

# Services

## What is a Service?

A **service** is an intelligent **load balancer** that receives matched requests from a router and distributes them across multiple backend servers. Each service knows how to spread traffic fairly across its backends.

## Service Architecture

```
Request from Router
    ↓
┌─────────────────────────────────┐
│     Service (Load Balancer)     │
│  Algorithm: Round-robin         │
├─────────────────────────────────┤
│ Backend Pool:                   │
│ ├─ Server 1 (api1:8080)         │
│ ├─ Server 2 (api2:8080)         │
│ ├─ Server 3 (api3:8080)         │
└─────────────────────────────────┘
    ↓ ↓ ↓
Requests distributed fairly
across all backends
```

## Basic Configuration

```yaml
services:
  myapp:
    loadBalancer:
      servers:
        - url: "http://backend1:8080"
        - url: "http://backend2:8080"
        - url: "http://backend3:8080"

routers:
  myapp:
    rule: "Host(`myapp.com`)"
    service: myapp  # Reference the service
```

## Load Balancing Algorithms

**Round Robin** (default): Rotate through servers in sequence
```
Request 1 → Backend 1
Request 2 → Backend 2
Request 3 → Backend 3
Request 4 → Backend 1
```

**Least Conn**: Send to server with fewest active connections
```yaml
services:
  myapp:
    loadBalancer:
      leastconn: {}
```

**Sticky Sessions**: Same client always goes to same backend
```yaml
services:
  myapp:
    loadBalancer:
      sticky:
        cookie:
          name: "traefik"
          httpOnly: true
          secure: true
```

**Weighted**: Distribute traffic by weight
```yaml
services:
  myapp:
    loadBalancer:
      servers:
        - url: "http://backend1:8080"
          weight: 70  # Gets 70% of traffic
        - url: "http://backend2:8080"
          weight: 30  # Gets 30% of traffic
```

## Docker Service Discovery

With Docker, services auto-register:

```yaml
services:
  myapp:
    image: myapp:latest
    labels:
      - "traefik.enable=true"
      - "traefik.http.services.myapp.loadbalancer.server.port=8080"
```

Traefik automatically discovers all containers with this label and adds them to the service.

## Kubernetes Service Discovery

In Kubernetes, Traefik reads Service resources:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp
spec:
  selector:
    app: myapp
  ports:
    - port: 80
      targetPort: 8080
```

Traefik discovers endpoints and load-balances across them.

## Health Checks

Traefik can check if backends are healthy:

```yaml
services:
  myapp:
    loadBalancer:
      servers:
        - url: "http://backend1:8080"
        - url: "http://backend2:8080"
      healthCheck:
        path: "/health"
        interval: "10s"
        timeout: "5s"
```

- Every 10 seconds, Traefik hits `/health` on each backend
- If unhealthy, temporarily removes from load balancer
- Periodically retries to bring back

## Service URL Scheme

**HTTP**: `http://host:port`
**HTTPS**: `https://host:port`
**UNIX socket**: `h2c://unix:/path/to/socket`

```yaml
services:
  myapp:
    loadBalancer:
      servers:
        - url: "http://backend1:8080"      # HTTP
        - url: "https://backend2:8443"     # HTTPS
```

## Passthrough Service

For HTTPS services, Traefik doesn't terminate TLS:

```yaml
services:
  myapp:
    loadBalancer:
      servers:
        - url: "https://backend:8443"  # Encrypted end-to-end
      serversTransport: my-transport

serversTransport:
  my-transport:
    insecureSkipVerify: true  # Don't verify backend cert
```

## Service Weight and Sticky Sessions Example

```yaml
services:
  api:
    loadBalancer:
      sticky:
        cookie:
          name: "lb"
          secure: true
      servers:
        - url: "http://api-1:8080"
          weight: 50
        - url: "http://api-2:8080"
          weight: 50
```

Same client (identified by cookie) always gets routed to same server, but traffic distributed 50/50 across new clients.

## Docker Compose with Services

```yaml
version: '3'
services:
  traefik:
    image: traefik:v2.9
    command:
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"

  api:
    image: myapi:latest
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(`api.example.com`)"
      - "traefik.http.services.api.loadbalancer.server.port=8080"
    deploy:
      replicas: 3  # Three instances
```

Traefik automatically discovers all 3 api containers and load-balances traffic.

## Key Takeaway

Services are load balancers that distribute traffic across multiple backends. They support various algorithms (round-robin, least-conn), health checks, and sticky sessions for sophisticated traffic distribution.
