---
title: Load Balancing
---

# Load Balancing

## What is Load Balancing?

Load balancing distributes incoming requests across multiple servers so no single server gets overwhelmed.

**Without load balancing**: All traffic → one server → bottleneck
**With load balancing**: Traffic → distributed across multiple servers → faster responses

## Why You Need It

- **Prevent bottlenecks**: One server can only handle so many requests per second
- **High availability**: If one server fails, others handle traffic
- **Scale horizontally**: Add more servers instead of buying bigger hardware
- **Better performance**: Each server handles fewer requests, responds faster

## Load Balancing Algorithms

**Round Robin**: Send requests to servers in sequence
```
Request 1 → Server A
Request 2 → Server B
Request 3 → Server C
Request 4 → Server A
```

**Least Connections**: Send to server handling fewest active connections
- Good for long-lived connections (WebSocket, persistent connections)

**IP Hash**: Route based on client IP
- Same client always goes to same server (good for sessions without sticky cookies)

**Random**: Send to random server
- Simple but less predictable

**Weighted**: Some servers get more traffic
```
Server A (4GB RAM): 60% traffic
Server B (2GB RAM): 40% traffic
```

## Health Checks

The load balancer periodically checks if servers are alive:
```
Load Balancer: "Are you alive?"
Server: "Yes! 200 OK"
```

If server doesn't respond, remove it from rotation temporarily.

## Session Persistence (Sticky Sessions)

Sometimes clients need to stick with same server (shared in-memory state):

**Cookie-based**: Server tells client "remember me on Server A"
**IP-based**: Route same IP to same server

Without this, a user's session might be lost if routed to different server.

## Traefik Load Balancing

In Traefik, a service can have multiple backends:

```yaml
services:
  myapp:
    - server1:8080
    - server2:8080
    - server3:8080
```

Traefik automatically distributes traffic (round-robin by default).

## Load Balancer Types

**Layer 4 (TCP/UDP)**: Routes based on IP and port only
- Fast, less intelligent
- No knowledge of HTTP protocol

**Layer 7 (Application/HTTP)**: Routes based on HTTP data
- Can route by hostname, path, headers
- More overhead but very flexible
- Traefik operates here

## Real-World Example

```
Users → Load Balancer (traefik)
           ↓
     ┌─────┼─────┐
     ↓     ↓     ↓
   App1  App2  App3
    |     |     |
   DB   DB   DB (shared database)
```

Each app server handles 1/3 of traffic, all share same database.

## Key Metrics

- **Throughput**: Requests per second handled
- **Latency**: Response time
- **Error rate**: % of failed requests
- **Availability**: % of time all servers are healthy

## Key Takeaway

Load balancing distributes traffic to prevent overload and ensures high availability. Traefik provides sophisticated layer-7 load balancing across your services.
