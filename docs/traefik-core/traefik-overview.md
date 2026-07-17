---
title: Traefik Overview
---

# Traefik Overview

## What is Traefik?

**Traefik** is a modern **cloud-native reverse proxy and load balancer** that automatically discovers services and intelligently routes traffic to them. The key word is **automatic**—unlike traditional load balancers, Traefik watches your infrastructure continuously and reconfigures itself as services appear, disappear, or change.

## The Problem Traefik Solves

```
Without Traefik:
   New service added → Manually update load balancer config → Restart load balancer

With Traefik:
   New service added → Traefik auto-discovers it → Traffic flows immediately
```

## How Traefik Works (Simple Flow)

```
    Client Request
         ↓
    ┌─────────────────────┐
    │ Entrypoint (Port 80)│  ← Listens here
    └─────────────────────┘
         ↓
    ┌─────────────────────┐
    │ Router (matching)   │  ← "Where should this go?"
    └─────────────────────┘
         ↓
    ┌─────────────────────┐
    │ Middlewares (auth)  │  ← Modify/enhance request
    └─────────────────────┘
         ↓
    ┌─────────────────────┐
    │ Service (balancer)  │  ← Picks which backend
    └─────────────────────┘
         ↓
    Backend Server
```

## Core Responsibilities

| Responsibility | What Traefik Does | Example |
|---|---|---|
| **Listen** | Accepts incoming requests on defined ports | Port 80 (HTTP), 443 (HTTPS) |
| **Watch** | Monitors infrastructure for changes | Docker daemon, Kubernetes API |
| **Discover** | Finds services automatically | New container started = auto-detected |
| **Route** | Matches requests to rules | Host, path, method, headers |
| **Middleware** | Adds cross-cutting concerns | Auth, rate-limit, compression |
| **Load Balance** | Distributes across backends | Round-robin, least-conn, sticky |
| **Secure** | Manages HTTPS certificates | Auto-renew from Let's Encrypt |

## Key Principles

- **Zero Configuration**: Services auto-register via labels (Docker) or annotations (Kubernetes)
- **Single Source of Truth**: One place to see all routing configuration
- **Cloud-Native**: Built for containers and orchestration
- **Hot Reload**: Update routes without restarting Traefik
- **Extensible**: Middleware pipeline for custom logic

## Traefik Architecture Layers

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃           TRAEFIK CORE               ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                      ┃
┃  Entrypoints  ← WHERE traffic enters ┃
┃     ↓                                ┃
┃  Routers      ← HOW to match traffic ┃
┃     ↓                                ┃
┃  Middlewares  ← WHAT to modify       ┃
┃     ↓                                ┃
┃  Services     ← WHERE to send it     ┃
┃                                      ┃
┃  Providers    ← WHO provides config  ┃
┃                                      ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

## The Five Components

### 1. **Entrypoints**
The doors where traffic enters. Listen on specific ports and protocols.
```
web → :80 (HTTP)
websecure → :443 (HTTPS)
```

### 2. **Routers**
The traffic cops. Define rules to match requests.
```
If Host is api.example.com → Go to api-service
If Path is /blog/* → Go to blog-service
```

### 3. **Middlewares**
The transformers. Modify requests before reaching services.
```
BasicAuth → Require login
RateLimit → Limit requests per second
Headers → Add security headers
```

### 4. **Services**
The load balancers. Distribute requests to backend servers.
```
api-service:
  - backend-1:8080
  - backend-2:8080 (Round-robin between these)
```

### 5. **Providers**
The watchers. Tell Traefik about services.
```
Docker Provider → Reads container labels
Kubernetes Provider → Reads Ingress resources
File Provider → Reads YAML/TOML files
```

## Static vs Dynamic Configuration

```
┌──────────────────────┬──────────────────────┐
│  STATIC CONFIG       │  DYNAMIC CONFIG      │
├──────────────────────┼──────────────────────┤
│ Traefik itself       │ Your services        │
│ Ports, log level     │ Routes, rules        │
│ Certificate resolvers│ Load balancing       │
│ Requires restart     │ Hot-reload (no wait) │
└──────────────────────┴──────────────────────┘
```

**Static** (traefik.yml):
```yaml
entryPoints:
  web:
    address: ":80"
```

**Dynamic** (docker labels, K8s annotations, or files):
```yaml
routers:
  myapp:
    rule: "Host(`myapp.com`)"
    service: myapp-service
```

## Supported Providers

| Provider | Best For | Auto-Reload |
|---|---|---|
| **Docker** | Local dev, Docker Compose | Yes |
| **Kubernetes** | K8s clusters | Yes |
| **File** | Version control, mixed setups | Yes (with watch) |
| **Docker Swarm** | Swarm clusters | Yes |
| **Consul** | Consul users | Yes |

## Real-World Example

```
Scenario: You run 3 microservices

Step 1: Tell Traefik to watch Docker
Step 2: Start api service with label:
  traefik.http.routers.api.rule=Host(`api.example.com`)
Step 3: Start web service with label:
  traefik.http.routers.web.rule=Host(`example.com`)
Step 4: Requests come in → Traefik routes them correctly
Step 5: Stop api service → Traefik removes route automatically
Result: Zero configuration, zero downtime
```

## When to Use Traefik

**Great for:**
- Docker Compose stacks
- Kubernetes deployments
- Microservices architecture
- Need automatic HTTPS
- Want zero-config service discovery
- Building API gateways

**Not ideal for:**
- Single service apps (overkill)
- Low-level TCP routing only (use HAProxy)
- Datacenter load balancing (use hardware LB)

## Key Takeaway

Traefik is the modern solution for routing in containerized environments. It eliminates manual configuration, provides automatic HTTPS, and scales with your infrastructure. Once set up, you add services without touching Traefik—it just works.
