---
title: Architecture
---

# Architecture

## Components

```
Host Machine
├── Traefik (port 80, 8080)
│   ├── Entrypoint: web (port 80)
│   └── Dashboard (port 8080)
└── Docker Network (web)
    ├── nginx container
    └── whoami container
```

## Request Flow

```
Host:
  myapp.local → 127.0.0.1:80
  whoami.local → 127.0.0.1:80

Traefik receives on :80
├─ Host = myapp.local? → Route to nginx
├─ Host = whoami.local? → Route to whoami

Container receives request
Responds with content
Traefik forwards response to client
```

## Network Isolation

- All services on 'web' network
- Traefik connects to docker.sock for discovery
- Services auto-discovered via labels

## Service Discovery Flow

```
1. Container starts with traefik labels
2. Docker emits event
3. Traefik reads labels
4. Creates router config
5. Adds to routing table
```

