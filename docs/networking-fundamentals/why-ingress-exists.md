---
title: Why Ingress Exists
---

# Why Ingress Exists

## The Problem: Exposing Services

Running apps in Kubernetes/Docker, you have a problem:
- Services run inside containers/pods (isolated)
- Users on the internet can't reach them
- How do you expose services to the world?

## Naive Solutions (Why They Don't Work)

### Solution 1: NodePort Service

```
Every node opens a port (e.g., 30000)
User hits: anynode:30000 → gets routed to service
```

**Problems**:
- Uses high ports (30000+), unprofessional
- Any node can serve traffic, no control
- No SSL/TLS termination
- No routing rules (host, path-based)
- Inefficient port usage

### Solution 2: LoadBalancer Service

```
Cloud provider creates external load balancer
For each service, you need a separate load balancer
Service A → LoadBalancer A (cost per LB)
Service B → LoadBalancer B (cost per LB)
```

**Problems**:
- Expensive (one LB per service)
- Lots of external IPs
- Hard to manage many load balancers
- Doesn't scale well

### Solution 3: Port Mapping on Host

```
Service on port 8080 → map to host port 8080
Service on port 8081 → map to host port 8081
Service on port 8082 → map to host port 8082
```

**Problems**:
- Port conflicts
- Doesn't scale (limited ports)
- Manual management
- No SSL/TLS
- No intelligent routing

## The Ingress Solution

**Ingress is a single reverse proxy that**:
- Listens on standard ports (80, 443)
- Routes requests to multiple backend services
- Handles SSL/TLS certificates
- Provides advanced routing (host, path, headers)
- One IP address for all services
- Easy to manage

```
                    Ingress (Single Entrypoint)
                            |
         ┌──────────────┬────┼────┬──────────────┐
         ↓              ↓    ↓    ↓              ↓
      Service A    Service B  Service C    Service D
      (port 8080) (port 8081) (port 3000) (port 5000)
```

User hits ingress on port 80 → ingress decides which service → routes request

## What Ingress Provides

**Routing Intelligence**:
- Route by hostname: api.example.com → api-service
- Route by path: /api/* → api-service, /images/* → image-service
- Route by headers: X-Version: v2 → new-service
- Route by methods: POST → write-service, GET → read-service

**HTTPS/TLS**:
- Centralized certificate management
- Let's Encrypt integration
- Certificate renewal
- SNI (multiple certificates)

**Load Balancing**:
- Distribute traffic across service replicas
- Health checks
- Session stickiness

**Security**:
- Hide internal services
- IP whitelisting
- DDoS protection
- Rate limiting

**Observability**:
- Access logs
- Metrics
- Tracing

## Ingress vs Reverse Proxy vs Load Balancer

All three terms describe similar concepts:

- **Ingress**: Kubernetes-specific concept (resource type)
- **Reverse Proxy**: General term (forwards requests to backends)
- **Load Balancer**: Distributes traffic

**In Kubernetes context**:
- Ingress = configuration declaring routing rules
- Ingress Controller = software implementing those rules (Traefik, Nginx, HAProxy)
- The controller is the reverse proxy

## Traefik as Ingress Controller

Traefik is an Ingress Controller for Kubernetes:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-app
spec:
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /
        backend:
          service:
            name: api-service
            port: 8080
```

Traefik reads this configuration and routes traffic accordingly.

## Docker Compose Equivalent

In Docker, there's no formal "Ingress" concept, but Traefik serves the same role:

```yaml
services:
  traefik:
    image: traefik
    ports:
      - "80:80"
      - "443:443"
    labels:
      - "traefik.http.routers.api.rule=Host(`api.example.com`)"
      - "traefik.http.services.api.loadbalancer.server.port=8080"

  api-service:
    image: myapi
    
  web-service:
    image: myweb
```

Traefik = Ingress
Labels = Ingress configuration

## Evolution

```
1. Manual port mapping
2. NodePort services (expose high ports)
3. LoadBalancer services (expensive, many IPs)
4. Ingress Controller (efficient, centralized)
```

## Key Takeaway

Ingress (or a reverse proxy like Traefik) is necessary because you need intelligent routing, SSL/TLS, and unified access to multiple services. It's the standard pattern for exposing containerized applications to the internet.
