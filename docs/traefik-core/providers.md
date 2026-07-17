---
title: Providers
---

# Providers

## What is a Provider?

A **provider** is a source of configuration that tells Traefik about your services. Providers watch your infrastructure continuously and dynamically tell Traefik: "These services exist now—route traffic to them." When services change, providers notify Traefik automatically.

## Provider Concept

```
┌──────────────┐
│   Provider   │ ← Watches infrastructure
│  (watcher)   │
└──────┬───────┘
       │ "New service found"
       │ "Service removed"
       │ "Config changed"
       ↓
    TRAEFIK ← Hot-reload (no restart needed)
       ↓
    Routes updated automatically
```

## Provider Types at a Glance

| Provider | Watches | Best For | Hot-Reload |
| --- | --- | --- | --- |
| **Docker** | Container labels | Docker Compose, dev | ✅ Yes |
| **Docker Swarm** | Swarm service labels | Docker Swarm clusters | ✅ Yes |
| **Kubernetes** | Ingress resources | K8s clusters | ✅ Yes |
| **File** | YAML/TOML files | Infrastructure-as-code | ✅ Yes |
| **Consul** | Consul services | Consul deployments | ✅ Yes |
| **API** | REST calls | Programmatic config | ✅ Direct |

## Docker Provider

Traefik watches Docker daemon for running containers:

```yaml
providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
```

Container labels define routing:

```yaml
services:
  myapp:
    image: myapp
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.myapp.rule=Host(`myapp.com`)"
      - "traefik.http.services.myapp.loadbalancer.server.port=8080"
```

When container starts, Traefik discovers it. When it stops, Traefik removes it.

## Kubernetes Provider

Traefik watches Kubernetes API for Ingress resources:

```yaml
providers:
  kubernetes:
    endpoint: "https://kubernetes.default"
    inClusterConfig: true
```

Define routing with Ingress:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp
spec:
  rules:
  - host: myapp.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: myapp
            port:
              number: 8080
```

## File Provider

Traefik reads configuration from files:

```yaml
providers:
  file:
    filename: "/etc/traefik/config.yml"
    watch: true
```

The config.yml file contains all routing rules. Changes trigger reload automatically.

**Dynamic configuration example**:

```yaml
routers:
  myapp:
    entryPoints:
      - web
    rule: "Host(`myapp.com`)"
    service: myapp-service

services:
  myapp-service:
    loadBalancer:
      servers:
        - url: "http://backend1:8080"
        - url: "http://backend2:8080"
```

## Consul Provider

Service discovery via Consul:

```yaml
providers:
  consul:
    endpoint: "consul:8500"
    prefix: "traefik"
```

Services register themselves in Consul, Traefik discovers them.

## Configuration Priority

If multiple providers enabled, first match wins:

```yaml
providers:
  file:
    filename: "/etc/traefik/config.yml"
  docker: {}
  kubernetes: {}
```

File config takes priority, then Docker, then Kubernetes.

## Docker Compose Example

```yaml
version: '3'
services:
  traefik:
    image: traefik:v2.9
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    command:
      - "--providers.docker=true"
      - "--providers.docker.exposedByDefault=false"
      - "--entrypoints.web.address=:80"
    ports:
      - "80:80"

  myapp:
    image: myapp
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.app.rule=Host(`app.local`)"
      - "traefik.http.services.app.loadbalancer.server.port=8080"
```

Traefik watches Docker socket, discovers myapp, routes traffic.

## Multiple Providers

Combine providers for flexibility:

```yaml
providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
  kubernetes: {}
  file:
    filename: "/etc/traefik/static.yml"
```

Services from Docker, Kubernetes, and files all work together.

## Provider Hot-Reload

Changes detected automatically (if watch enabled):

1. Service added/removed in Docker
2. Provider detects change
3. Traefik reconfigures routing
4. No restart needed
5. Existing connections not dropped

## Key Points

- Provider = Service discovery source
- Multiple providers can run simultaneously
- Hot-reload supported (no restart for config changes)
- Docker labels, K8s annotations, or files define routing
- Traefik stays in sync with infrastructure

## Key Takeaway

Providers are how Traefik discovers services and learns routing rules. Docker provider for containers, Kubernetes for K8s clusters, File provider for static configuration. They enable automatic, dynamic service discovery.
