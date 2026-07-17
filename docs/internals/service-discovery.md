---
title: Service Discovery
---

# Service Discovery

## What is Service Discovery?

Finding backend services and their IP addresses. Essential for dynamic, containerized environments where services constantly change.

## Old Way (Manual)

```yaml
services:
  api-service:
    loadBalancer:
      servers:
        - url: "http://192.168.1.50:8080"  # Fixed IP
        - url: "http://192.168.1.51:8080"
        - url: "http://192.168.1.52:8080"
```

Problems:
- IPs change when containers restart
- Manual maintenance
- Doesn't scale
- Error-prone

## New Way (Automatic Discovery)

```yaml
# In Docker:
services:
  api:
    image: myapi
    # Labels tell Traefik about this service
    labels:
      - "traefik.http.routers.api.rule=Host(`api.local`)"
      - "traefik.http.services.api.loadbalancer.server.port=8080"
```

Traefik discovers:
- Which containers are running
- Their IP addresses
- Their ports
- Their health status

Automatically adds to load balancer.

## Service Registration Patterns

**DNS-based**: Services register in DNS
- Traefik queries DNS, gets IPs
- Example: Kubernetes uses internal DNS

**Event-based**: Services emit events
- Docker containers emit events
- Traefik listens and reacts

**Central registry**: Consul, etcd store services
- All services register with registry
- Traefik queries registry

## DNS Service Discovery (Kubernetes)

In Kubernetes, services have DNS names:

```
api-service.default.svc.cluster.local → 10.0.0.5

Traefik resolves name → queries internal DNS → gets IP
```

Automatically load-balances across pod IPs.

## Container IP Discovery

Docker assigns IPs to containers within network:

```
Docker network 172.18.0.0/16
  - api-1: 172.18.0.2
  - api-2: 172.18.0.3
  - api-3: 172.18.0.4

Traefik looks up "api" in DNS → 172.18.0.2, 172.18.0.3, 172.18.0.4
```

All containers on same network can reach each other.

## Health-based Discovery

Traefik removes unhealthy services:

```yaml
services:
  api:
    loadBalancer:
      servers:
        - url: "http://api-1:8080"
        - url: "http://api-2:8080"
        - url: "http://api-3:8080"
      healthCheck:
        path: "/health"
        interval: "10s"
```

Every 10 seconds:
- Traefik hits `/health` on each backend
- If fails → temporarily remove from load balancer
- Periodically retry

## Consul Discovery

Consul is service registry:

```yaml
providers:
  consul:
    endpoint: "127.0.0.1:8500"
```

Services register with Consul:

```bash
curl -X PUT http://localhost:8500/v1/agent/service/register \
  -d '{"Name":"api","Port":8080,"Address":"10.0.0.5"}'
```

Traefik queries Consul, discovers services.

## Load Balancing Discovery

After discovering services, Traefik load-balances:

```
Request → Traefik discovers backends
          Selects one via algorithm (round-robin)
          Sends to selected backend
```

If backend fails, tries next one.

## Service Lookup Process

```
1. Traefik wants to route to service "api"
2. Queries Docker API / DNS / Consul
3. Gets list: [10.0.0.2, 10.0.0.3, 10.0.0.4]
4. Checks health of each
5. Selects one (round-robin)
6. Connects
7. On failure, tries next in list
```

## ZooKeeper Service Discovery

Like Consul but different:

```yaml
providers:
  zookeeper:
    endpoint: "127.0.0.1:2181"
```

Services register paths in ZooKeeper, Traefik watches for changes.

## Key Takeaway

Service discovery automatically finds backend services and their addresses. Essential for dynamic environments where services change constantly. Traefik supports multiple discovery methods: Docker, Kubernetes, Consul, files.
