---
title: Container Networking
---

# Container Networking

## Why Containers Need Networks

Containers are isolated environments. Without networking, they can't talk to each other or the outside world.

Docker provides networking to:
- Allow containers to communicate
- Isolate containers that shouldn't talk
- Give containers external access
- Route traffic between containers

## Docker Network Types

### Bridge Network (Default)

```
Host Machine (192.168.1.100)
    ↓
Docker Bridge (172.17.0.1)
    ├─ Container A (172.17.0.2)
    ├─ Container B (172.17.0.3)
    └─ Container C (172.17.0.4)
```

- Containers get isolated network
- Can talk to each other via container name (DNS)
- Port mapping required to reach from host

### Host Network

Container shares host's network directly:
- No isolation
- Container can access host ports
- Good for performance-critical apps
- Security risk if containers are untrusted

### None Network

Container has no network access:
- Completely isolated
- Used for non-networked apps
- Or as a baseline before manual setup

### Custom Bridge Network

User-defined network with container-to-container DNS:

```yaml
networks:
  app-network:
    driver: bridge

services:
  web:
    networks:
      - app-network
  db:
    networks:
      - app-network
```

Containers can reach each other by name: `web` can reach `db` via hostname `db`

## Docker Compose Networks

When using Docker Compose, a network is created for all services:

```yaml
version: '3'
services:
  traefik:
    image: traefik
    ports:
      - "80:80"
      - "443:443"
    
  app1:
    image: myapp
    # Traefik can reach app1 via hostname "app1"
    
  app2:
    image: myapp
    # Traefik can reach app2 via hostname "app2"
```

All services share a network, talk via service names.

## Port Mapping

Containers have their own ports, separate from host:

```
Host Port 8080 → Container Port 8080
    8080:8080

Host can access via: localhost:8080
Other containers access via: service-name:8080
```

## Internal vs External Access

**Internal** (container-to-container):
- Uses container name (DNS in Docker network)
- No port mapping needed
- Fast, secure (internal network)

**External** (host to container):
- Uses host's IP and mapped port
- Requires port binding
- For public access

## Container IP Addresses

Each container gets an IP within its network:
- 172.17.0.0/16 is default bridge network
- 172.18.0.0/16, 172.19.0.0/16, etc. for custom networks
- Not routable from outside (unless mapped)

## Traefik Container Networking Example

```yaml
version: '3'
services:
  traefik:
    image: traefik:v2.9
    ports:
      - "80:80"      # Host port 80 → Container port 80
      - "443:443"    # Host port 443 → Container port 443
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    networks:
      - web

  webapp:
    image: nginx
    networks:
      - web
    # Traefik reaches it via: http://webapp:80

networks:
  web:
    driver: bridge
```

**Data flow**:
1. User hits localhost:80 → mapped to container port 80
2. Traefik receives request on 0.0.0.0:80
3. Traefik looks up service name `webapp` in DNS
4. Docker network resolves to 172.18.0.2
5. Traefik connects to webapp:80 on that IP
6. Response comes back through same path

## Network Isolation

By default:
- Only containers in same network can reach each other
- Containers can't reach services in other networks
- Solution: Connect services to multiple networks

```yaml
services:
  app:
    networks:
      - frontend
      - backend

  web:
    networks:
      - frontend

  db:
    networks:
      - backend
```

Now `app` can reach both `web` and `db`, but `web` and `db` can't reach each other.

## DNS in Docker

Docker provides built-in DNS server at 127.0.0.11:53 in containers.

When container tries to reach `service-name`:
1. Docker DNS resolves service-name to its IP
2. Connection succeeds if in same network
3. Fails if in different network

## Key Takeaway

Docker networks provide isolated communication for containers. Services reach each other by name within a network. Port mapping exposes container ports to the host for external access.
