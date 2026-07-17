---
title: Entrypoints
---

# Entrypoints

## What is an Entrypoint?

An **entrypoint** is a **port + protocol** combination where Traefik listens for incoming traffic. Think of entrypoints as the physical doors of your service—traffic enters through these doors and starts its journey through Traefik.

```
Entrypoint web: 0.0.0.0:80 (HTTP)
Entrypoint websecure: 0.0.0.0:443 (HTTPS)
```

## Entrypoint Visualization

```
Internet Traffic
    ↓ ↓ ↓
┌─────────────────────────┐
│ Entrypoint "web" :80    │  ← HTTP requests enter here
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ Entrypoint "websecure"  │  ← HTTPS requests enter here
│ :443                    │
└─────────────────────────┘
    ↓ ↓
Routers (decide where to go next)
```

## Basic Configuration

Static configuration (in traefik.yml or docker-compose):

```yaml
entryPoints:
  web:
    address: ":80"
  websecure:
    address: ":443"
```

This tells Traefik to:
- Listen on port 80 (HTTP traffic)
- Listen on port 443 (HTTPS traffic)

## Common Entrypoint Names

- **web**: Standard HTTP traffic (port 80)
- **websecure**: Standard HTTPS traffic (port 443)
- **api**: Traefik dashboard/API (port 8080)
- **metrics**: Prometheus metrics (port 8090)
- Custom names: Name them whatever makes sense

## Address Format

`":80"` = Listen on all interfaces, port 80
`"127.0.0.1:8080"` = Listen only on localhost, port 8080
`"192.168.1.1:9000"` = Listen on specific IP, port 9000

## Entrypoint Options

### HTTP to HTTPS Redirect

Auto-redirect HTTP to HTTPS:

```yaml
entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entrypoint:
          to: websecure
          scheme: https
```

When user hits http://example.com → redirects to https://example.com

### TLS Configuration

Enable HTTPS on an entrypoint:

```yaml
entryPoints:
  websecure:
    address: ":443"
    http:
      tls:
        certResolver: letsencrypt
```

Tells Traefik to use Let's Encrypt certificates on this entrypoint.

### Authentication

Require authentication on entrypoint:

```yaml
entryPoints:
  api:
    address: ":8080"
    http:
      basicAuth:
        users:
          - "user:password"
```

Users must authenticate to access this entrypoint.

## Routers and Entrypoints

Routers must specify which entrypoint(s) they listen on:

```yaml
routers:
  myapp:
    entryPoints:
      - web
      - websecure
    rule: "Host(`myapp.com`)"
    service: myapp-service
```

This router handles traffic on both HTTP and HTTPS.

## Port Mapping in Docker

Container ports ≠ host ports. You must expose them:

```yaml
services:
  traefik:
    image: traefik:v2.9
    ports:
      - "80:80"      # Host port 80 → Container port 80
      - "443:443"    # Host port 443 → Container port 443
      - "8080:8080"  # Host port 8080 → Container port 8080
    command:
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
```

## Traefik Dashboard Entrypoint

```yaml
entryPoints:
  api:
    address: ":8080"

api:
  dashboard: true
  entrypoint: api
```

Dashboard accessible at http://localhost:8080/dashboard/

## Multiple Entrypoints Example

```yaml
entryPoints:
  http:
    address: ":80"
  https:
    address: ":443"
  metrics:
    address: ":8090"
  admin:
    address: ":8080"

routers:
  public-api:
    entryPoints:
      - http
      - https
    rule: "Host(`api.example.com`)"
    
  admin-panel:
    entryPoints:
      - admin
    rule: "Host(`admin.example.com`)"
    
  internal-metrics:
    entryPoints:
      - metrics
    rule: "Host(`metrics.example.com`)"
```

Different routers on different entrypoints for different purposes.

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
    command:
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--api.insecure=true"
      - "--api.dashboard=true"
      - "--entrypoints.traefik.address=:8080"
```

## Key Concepts

**Entrypoint = Ingress door**: Traffic enters here

**Static configuration**: Set once, rarely changes

**Port binding required**: Must expose ports from container to host

**Multiple entrypoints**: Different purposes (public API, admin, metrics)

**Router assignment**: Routers must specify which entrypoint(s)

## Key Takeaway

Entrypoints are where traffic enters Traefik. Each entrypoint listens on a specific port and protocol. Routers then decide how to handle traffic arriving on each entrypoint.
