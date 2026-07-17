---
title: Routers
---

# Routers

## What is a Router?

A **router** is a decision point that matches incoming requests against rules and decides which service should handle them. Think of it as a traffic cop standing at an intersection—it looks at each request and directs it down the correct path.

## How Routers Work

```
Incoming Request
    ↓
┌──────────────────────────┐
│ Router Checks Rules:     │
│ ✓ Host match?            │
│ ✓ Path match?            │
│ ✓ Method match?          │
│ ✓ Header match?          │
└──────────────────────────┘
    ↓ (Rule matches!)
┌──────────────────────────┐
│ Route to Service         │
│ (Load balancer)          │
└──────────────────────────┘
    ↓
┌──────────────────────────┐
│ Backend Server Selected  │
│ (One of many)            │
└──────────────────────────┘
```

## Router Rules

Rules use matchers to decide if a request matches:

**Host matcher**: Route by domain name
```yaml
rule: "Host(`api.example.com`)"
```

**Path matcher**: Route by URL path
```yaml
rule: "Path(`/api/*`)"
```

**Method matcher**: Route by HTTP method
```yaml
rule: "Method(`POST`, `PUT`)"
```

**Header matcher**: Route by HTTP header
```yaml
rule: "Header(`Content-Type`, `application/json`)"
```

**Combining matchers**:
```yaml
rule: "Host(`api.example.com`) && Path(`/users`)"
rule: "Host(`api.example.com`) || Host(`api.example.org`)"
rule: "Method(`GET`) && Path(`/public/*`)"
```

## Router Configuration

```yaml
routers:
  myapp:
    entryPoints:
      - web
      - websecure
    rule: "Host(`myapp.com`)"
    service: myapp-service
    middlewares:
      - auth
```

- **entryPoints**: Which ports does this router listen on?
- **rule**: When does this router match?
- **service**: Where to send matched traffic?
- **middlewares**: What to do before/after (optional)

## Common Routing Patterns

**Route by hostname**:
```yaml
routers:
  api:
    rule: "Host(`api.example.com`)"
    service: api-service
    
  www:
    rule: "Host(`www.example.com`)"
    service: www-service
```

**Route by path**:
```yaml
routers:
  api:
    rule: "Path(`/api/*`)"
    service: api-service
    
  static:
    rule: "Path(`/static/*`)"
    service: static-service
```

**Route by method and path**:
```yaml
routers:
  create-user:
    rule: "Path(`/users`) && Method(`POST`)"
    service: user-service
    
  list-users:
    rule: "Path(`/users`) && Method(`GET`)"
    service: user-service
```

**Priority matters**:
```yaml
routers:
  specific:
    rule: "Host(`api.example.com`) && Path(`/users/admin`)"
    service: admin-service
    priority: 10  # Higher priority, evaluated first
    
  generic:
    rule: "Host(`api.example.com`) && Path(`/users*`)"
    service: user-service
    priority: 1
```

## Docker Compose Labels

Instead of YAML config, use container labels:

```yaml
services:
  myapp:
    image: myapp
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.myapp.rule=Host(`myapp.com`)"
      - "traefik.http.routers.myapp.entrypoints=web,websecure"
      - "traefik.http.services.myapp.loadbalancer.server.port=8080"
```

Traefik automatically discovers and configures routing.

## Router Priority

When multiple routers could match, Traefik uses priority:
- Higher number = higher priority (evaluated first)
- Default priority = rule complexity (more specific = higher)

```yaml
routers:
  specific:
    rule: "Host(`api.example.com`) && Path(`/users/{id}`)"
    priority: 100
    
  general:
    rule: "Host(`api.example.com`)"
    priority: 1
```

Request to `/users/123` matches both, but specific router wins.

## Middleware Integration

Apply middlewares to routers:

```yaml
middlewares:
  auth:
    basicAuth:
      users:
        - "user:password"
      
  headers:
    headers:
      customresponseheaders:
        X-Custom: "value"

routers:
  protected:
    rule: "Host(`admin.example.com`)"
    service: admin-service
    middlewares:
      - auth
      - headers
```

Request flow: Middleware 1 → Middleware 2 → Service

## Router Matchers Reference

```yaml
Host(`example.com`)                           # Exact host
HostRegexp(`{host:.*\.example\.com}`)         # Regex host
Path(`/api/*`)                                 # Path prefix
PathPrefix(`/api`)                            # Path prefix
Method(`GET`, `POST`)                         # HTTP method
Header(`User-Agent`, `*Chrome*`)              # Header matching
HeaderRegexp(`User-Agent`, `.*Chrome.*`)      # Regex header
Query(`lang`, `en`)                           # Query parameter
ClientIP(`192.168.0.1`)                       # Source IP
```

## Key Takeaway

Routers are decision points that match incoming requests against rules and send them to appropriate services. They're the intelligence behind Traefik's routing, enabling sophisticated traffic management based on multiple criteria.
