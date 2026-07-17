---
title: Dashboard
---

# Dashboard

## What is the Dashboard?

The **Traefik Dashboard** is a real-time web interface that shows you everything happening in Traefik. It's your control center for monitoring and understanding your routing configuration.

## What You See

```
┌──────────────────────────────────────────────┐
│         Traefik Dashboard                    │
├──────────────────────────────────────────────┤
│                                              │
│ Overview                                     │
│    • Total routers active                    │
│    • Total services running                  │
│    • Middlewares in use                      │
│                                              │
│ HTTP Routers                                 │
│    • myapp: Host(example.com)                │
│    • api: Host(api.example.com)              │
│    • blog: Path(/blog/*)                     │
│                                              │
│ Services                                     │
│    • myapp-service → [server1, server2]      │
│    • api-service → [api1, api2, api3]        │
│                                              │
│ Middlewares                                  │
│    • basicAuth (admin routes)                │
│    • rateLimit (api routes)                  │
│                                              │
│ Real-time Stats                              │
│    • Requests/sec                            │
│    • Memory usage                            │
│    • Active connections                      │
│                                              │
└──────────────────────────────────────────────┘
```

**Access at:** `http://localhost:8080/dashboard/`

## Enabling the Dashboard

**Enable in configuration**:

```yaml
api:
  dashboard: true
  insecure: true  # Only for development!
  entryPoint: api

entryPoints:
  api:
    address: ":8080"
```

Or with flags:

```bash
traefik --api.dashboard=true --api.insecure=true
```

## Security

**For development only**, use insecure mode:

```yaml
api:
  dashboard: true
  insecure: true
```

**For production**, add authentication:

```yaml
middlewares:
  auth:
    basicAuth:
      users:
        - "user:hashed-password"

api:
  dashboard: true
  entryPoint: api

entryPoints:
  api:
    address: ":8080"
    http:
      middlewares:
        - auth
```

## Docker Compose Setup

```yaml
version: '3'
services:
  traefik:
    image: traefik:v2.9
    command:
      - "--api.dashboard=true"
      - "--api.insecure=true"
      - "--entrypoints.traefik.address=:8080"
    ports:
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
```

Dashboard at: http://localhost:8080/dashboard/

## Dashboard Features

**Routers section**: Shows all configured routers
- Rule (matching condition)
- Entrypoint
- Service it routes to
- Status (active/inactive)

**Services section**: Shows all services
- Backend servers
- Load balancing algorithm
- Health status
- Weights

**Middlewares section**: Shows applied middlewares
- Type (auth, ratelimit, etc)
- Configuration
- Where applied

## API Endpoint

Dashboard uses Traefik API:

- GET `/api/entrypoints` - List entrypoints
- GET `/api/routers` - List routers
- GET `/api/services` - List services
- GET `/api/middlewares` - List middlewares
- GET `/api/status` - Current status

Access via curl:

```bash
curl http://localhost:8080/api/entrypoints
curl http://localhost:8080/api/routers
curl http://localhost:8080/api/services
```

## Dashboard Screenshots Info

**Home page**: Overview of your infrastructure
- Total routers, services, middlewares
- System information

**HTTP section**: HTTP routing configuration
- Routers and their rules
- Services and backends
- Middleware chains

**TCP/UDP section**: Advanced protocols
- TCP routing
- UDP load balancing

**Health**: System health
- Memory usage
- Request count
- Active connections

## Real-Time Monitoring

Dashboard updates in real-time as:
- Containers start/stop
- Services change
- Requests are processed

Useful for debugging routing issues during development.

## Production Considerations

- Don't expose dashboard to internet
- Use authentication (basic auth, OAuth)
- Monitor via metrics (Prometheus) instead
- Consider removing insecure flag in production

## Key Takeaway

The Traefik Dashboard provides visual overview of your routing configuration and real-time status. Great for development and debugging, but secure it properly in production.
