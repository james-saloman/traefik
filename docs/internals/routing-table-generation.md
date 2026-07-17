---
title: Routing Table Generation
---

# Routing Table Generation

## What is a Routing Table?

A routing table is Traefik's internal mapping:

```
Request properties → Which router matches? → Which service handles it?
```

Traefik builds this table from configuration and uses it to make fast routing decisions.

## Building the Routing Table

```
1. Traefik starts
2. Reads all providers (Docker labels, K8s annotations, files)
3. Extracts routers and their rules
4. Builds internal routing table
5. Router A matches Host(api.com)
6. Router B matches Host(web.com) && Path(/api/*)
7. Router C matches Host(admin.com) && Header(X-Auth)
8. Sorts by priority
9. Stores for quick lookup
```

## Rule Matching Compilation

Traefik compiles rules for fast evaluation:

```yaml
rule: "Host(`api.example.com`) && Path(`/users/*`) && Method(`GET`)"
```

Compiled to optimized matcher:
- Check if Host matches (DNS lookup if needed)
- If matches, check Path (regex match)
- If matches, check Method (string comparison)
- If all match → use this router

## Priority Resolution

Multiple routers might match. Priority decides which one wins:

```yaml
routers:
  specific:
    rule: "Host(`api.example.com`) && Path(`/users/{id}`)"
    priority: 100
    service: user-service
  
  general:
    rule: "Host(`api.example.com`) && Path(`/users/*`)"
    priority: 50
    service: users-service
```

Request to `/users/123`:
- Both routers match
- Specific has priority 100 > General's 50
- Specific router wins

## Trie-based Matching

Traefik uses trie structure for efficient matching:

```
Host matching:
  example.com
    ├── api
    │   └── (route to api-service)
    ├── web
    │   └── (route to web-service)
    └── admin
        └── (route to admin-service)
```

Extremely fast lookups for thousands of routes.

## Middleware Integration

Routing table includes middleware assignment:

```
Router → Middlewares → Service
  ↓              ↓         ↓
api        [auth, rate]  api-service
web        [compress]     web-service
admin      [auth, log]    admin-service
```

Once router selected, middleware pipeline defined.

## Hot-Reload Process

Configuration changes trigger rebuild:

```
1. Docker container starts
2. Traefik detects change
3. Reads updated labels
4. Rebuilds routing table
5. Old table still used for in-flight requests
6. New table becomes active
7. Future requests use new table
8. Old table cleaned up
```

Seamless update, no dropped connections.

## Routing Table Size

Large deployments need optimization:

- 100 routers: Very fast
- 1000 routers: Still fast
- 10000+ routers: May need optimization (grouping)

Traefik handles thousand-router setups efficiently.

## Complexity Analysis

Matching complexity:

**Host-only rule**: O(1) - Direct lookup
**Host + Path**: O(1) + O(log n) - Host lookup then path trie search
**Complex rule**: O(n) worst case - May need to evaluate all matchers

In practice, very fast due to optimization.

## Debugging Routing Table

Enable debug logging to see table:

```yaml
log:
  level: DEBUG
```

Logs show:
- Routers loaded
- Rules compiled
- Priority ordering
- Selected router for request

## Updating Without Downtime

Routing table updates designed for zero-downtime:

```
Existing connection: Old routing table
New connection: New routing table
(Graceful transition)
```

Old table remains until all connections close.

## Key Takeaway

Routing table is Traefik's compiled routing decision logic. Built from configuration, optimized for fast matching, updated without downtime. Enables sub-millisecond routing decisions for thousands of routes.
