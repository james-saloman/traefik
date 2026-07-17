---
title: Traefik Routing
---

# Traefik Routing

## Full Decision Pipeline

```
Incoming Request
    ↓
┌─────────────────────────┐
│ EntryPoint              │  which port? (web :80, websecure :443)
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ Router matching         │  evaluate rules by priority, highest first
│  Host(`api.example.com`)│
│  && PathPrefix(`/v1`)   │
└─────────────────────────┘
    ↓ (first match wins)
┌─────────────────────────┐
│ Middleware chain        │  auth → rate-limit → headers → ...
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ Service load balancer   │  round-robin across healthy replicas
└─────────────────────────┘
    ↓
Backend replica handles the request
```

Every request passes through all four stages in order — a router can't skip straight to a service, and a service never runs before its router's middlewares have.

## Router Priority: Why Order Matters

When more than one router's rule matches the same request, priority breaks the tie:

```
Request: GET api.example.com/users/admin

Router "admin-users"                Router "all-users"
rule: Host(`api.example.com`)        rule: Host(`api.example.com`)
      && Path(`/users/admin`)              && PathPrefix(`/users`)
priority: 100                        priority: 1
      │                                    │
      └──────────── both match ───────────┘
                       ↓
         higher priority wins → admin-users
```

Traefik defaults priority to rule *specificity* when you don't set it explicitly, but explicit priorities remove any ambiguity — the example above works even though `/users/admin` also satisfies the `PathPrefix(/users)` rule.

## Middleware Chain Order

Middlewares run strictly in the order they're listed — each one can modify, reject, or pass along the request:

```
Request
  ↓
[auth]         → 401 if missing/invalid credentials, else continue
  ↓
[rate-limit]   → 429 if over threshold, else continue
  ↓
[add-headers]  → inject security headers, always continues
  ↓
Service
```

Reordering `auth` after `rate-limit` would let unauthenticated traffic consume the rate-limit budget meant for real users — chain order is a deliberate part of the configuration, not cosmetic.

## Load Balancing Across Replicas

Once a service is chosen, Traefik spreads requests across its healthy replicas:

```
Service "web-app" (3 replicas)

Request 1 → replica app-1
Request 2 → replica app-2
Request 3 → replica app-3
Request 4 → replica app-1   (cycle repeats)

If app-2 fails its healthcheck:
Request N → skips app-2, alternates app-1 / app-3 only
```

## Why This Matters

- **Deterministic, not magical**: given the same request and the same dynamic config, the router/middleware/service path it takes is always identical — useful when debugging a "why did this request do X" question.
- **Priority prevents ambiguity**: without it, two equally-valid rules matching the same request would have an undefined winner.
- **Failed replicas disappear automatically**: load balancing only ever sends traffic to replicas currently passing their health check.

## Related Concepts

- [Routers](../traefik-core/routers.md) — rule syntax, matchers, and priority in depth
- [Middlewares](../traefik-core/middlewares.md) — the full catalog of available middlewares
- [Services](../traefik-core/services.md) — load-balancing strategies and health checks
- [Routing Table Generation](../internals/routing-table-generation.md) — how Traefik builds this pipeline from dynamic config
