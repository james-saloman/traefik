---
title: Docker Networking
---

# Docker Networking

## Bridge Network Topology

```
Host Machine (192.168.1.100)
    |
    | ports: "80:80", "443:443"
    ↓
Docker Bridge Network "web" (172.18.0.0/16)
    |
    ├─ traefik        (172.18.0.2)  ← entry point, only container with published ports
    ├─ webapp         (172.18.0.3)
    ├─ api            (172.18.0.4)
    └─ Docker DNS     (127.0.0.11)  ← resolves container names to IPs
```

- Only Traefik publishes ports to the host (`80:80`, `443:443`) — backends stay unreachable from outside the network.
- Every container on the network can resolve every other container by **name**, via Docker's built-in DNS server at `127.0.0.11:53`.

## Request Path: Host → Traefik → Backend

```
Client
  |
  | GET http://192.168.1.100/
  ↓
Host port 80  ──(port mapping)──→  traefik container, port 80
  |
  | Traefik looks up router → service "webapp"
  ↓
Docker DNS: "webapp" → 172.18.0.3
  |
  ↓
webapp container, port 80
  |
  | response
  ↓
back through the same path to the client
```

The client never sees `172.18.0.3` — it only ever talks to the host's public IP. Traefik and Docker's internal DNS are the only things that know the container's real address.

## Multi-Network Isolation

Splitting services across networks controls who can reach whom:

```
frontend network              backend network
┌───────────────┐            ┌───────────────┐
│ traefik       │            │               │
│ webapp ───────┼────────────┼─── db         │
└───────────────┘            └───────────────┘
     ↑                              ↑
  reachable from                only reachable
  the host (published)          from "webapp"
                                (not from traefik)
```

`webapp` sits on both networks and acts as the bridge; `traefik` and `db` never connect directly. This is the same pattern used to keep databases off the edge network entirely.

## Why This Matters

- **Isolation by default**: containers on different Docker networks can't reach each other at all, no firewall rules needed.
- **Name-based discovery**: Traefik never hardcodes a backend IP — it re-resolves the service name through Docker DNS on every request, so replacing a container doesn't require any config change.
- **One published surface**: only Traefik's ports are exposed to the host; every backend stays private unless explicitly attached to a network that reaches the host.

## Related Concepts

- [Container Networking](../networking-fundamentals/container-networking.md) — the full concepts write-up this diagram summarizes
- [Docker Provider](../traefik-core/docker-provider.md) — how Traefik discovers containers on these networks
- [Docker Event Watching](../internals/docker-event-watching.md) — how Traefik reacts when containers join or leave a network
