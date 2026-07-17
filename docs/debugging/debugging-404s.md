---
title: Debugging 404s
---

# Debugging 404s

## Why 404?

404 means "Not Found". Common causes:

- Domain doesn't match any router rule
- Path doesn't match any router rule
- Router exists but service doesn't

## Debugging Steps

**Step 1: Verify request**

```bash
curl -v http://myapp.com/api/users
# Check Host header
# Check path
```

**Step 2: Check routers**

```bash
# Access Traefik dashboard
http://localhost:8080/dashboard
# See all routers
# Verify rules match your request
```

**Step 3: Check rules**

```yaml
routers:
  api:
    rule: "Host(`myapp.com`) && Path(`/api/*`)"
    service: api-service
```

Does `Host(myapp.com)` match your request?
Does `Path(/api/*)` match `/api/users`?

**Step 4: Check service**

If router matches but 404, check service:

```yaml
services:
  api-service:
    loadBalancer:
      servers:
        - url: "http://api:8080"
```

Can Traefik reach http://api:8080?

## Common Mistakes

**Host mismatch**:
```yaml
rule: "Host(`myapp.com`)"
```

But accessing: `localhost:8080` → No match → 404

**Path mismatch**:
```yaml
rule: "Path(`/api/*`)"
```

But accessing: `/web/page` → No match → 404

**Router priority**:
```yaml
specific:
  rule: "Host(`api.com`) && Path(`/admin/{id}`)"
  priority: 1  # Low priority!

general:
  rule: "Host(`api.com`) && Path(`/admin*`)"
  priority: 100  # High priority, wins
```

Wrong priority selected wrong router.

## Using Debug Logs

Enable debug and make request:

```bash
docker logs traefik | grep "404"
```

See which router (if any) matched.

## Testing Rules

Test rule without full Traefik:

```bash
# Check Host matches
curl -H "Host: myapp.com" http://localhost

# Check Path
curl http://localhost/api/users
```

## Traefik 404 vs Backend 404

**Traefik 404**: Router doesn't match (rules wrong)
**Backend 404**: Router matches, service returns 404 (endpoint doesn't exist)

Check response headers:

```bash
curl -v http://myapp.com/missing
# If Traefik 404: "No matching router"
# If backend 404: Response from service
```

## Fix Process

1. Check Host matches domain
2. Check Path matches route
3. Check Priority if multiple routers
4. Verify service can be reached
5. Check backend endpoint exists

## Key Takeaway

404s indicate no matching router. Debug by checking Host/Path rules, verifying router priority, testing connectivity to backend, and enabling debug logs.
