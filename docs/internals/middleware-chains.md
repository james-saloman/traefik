---
title: Middleware Chains
---

# Middleware Chains

## Middleware Execution Order

Middlewares form a pipeline. Requests flow through them in order:

```
Request
  ↓
[Middleware 1] (auth)
  ↓
[Middleware 2] (rate-limit)
  ↓
[Middleware 3] (headers)
  ↓
Service (backend)
  ↓
[Middleware 3] (response headers)
  ↓
[Middleware 2] (still active)
  ↓
[Middleware 1] (still active)
  ↓
Response
```

## Defining Chains

```yaml
routers:
  api:
    rule: "Host(`api.example.com`)"
    service: api-service
    middlewares:
      - auth
      - ratelimit
      - headers
```

Executed in order: auth → ratelimit → headers

## Middleware Context

Each middleware sees:

**Request**: Original request with possible modifications from previous middleware

**Response**: Service response with possible modifications from previous middleware

Example: Auth middleware rejects → never reaches service

## Request Flow Example

```
Original request to GET /users/123

Auth middleware: Check credentials
  ✓ Valid → Continue
  
Rate limit middleware: Check request count
  ✓ Under limit → Continue
  
Headers middleware: Add/remove headers
  Add: X-Forwarded-For
  Add: X-Trace-ID
  → Service receives request with headers

Service processes request
Service returns response

Headers middleware (response): Modify response headers
  Add: X-Powered-By: Traefik
  
Rate limit middleware: Log stats
  
Auth middleware: Add auth headers to response

Response returned to client
```

## Early Exit

Middleware can reject request early:

```yaml
middlewares:
  auth:
    basicAuth:
      users:
        - "user:password"

routers:
  protected:
    middlewares:
      - auth
      - other-middleware  # Never reached if auth fails
```

Invalid credentials → auth rejects → stops pipeline

## Composition

Reuse middleware across routes:

```yaml
middlewares:
  app-auth:
    basicAuth:
      users:
        - "user:password"
  
  app-ratelimit:
    rateLimit:
      average: 100

routers:
  api:
    rule: "Host(`api.local`)"
    service: api-service
    middlewares:
      - app-auth
      - app-ratelimit
  
  admin:
    rule: "Host(`admin.local`)"
    service: admin-service
    middlewares:
      - app-auth
```

Both routes share auth middleware.

## Middleware State

Middlewares are stateless:

```
Request 1: Middleware processes, produces output
Request 2: Same middleware, fresh processing (no memory)
```

But some track state (rate limiter):

```
Rate limiter: Tracks count per IP
Request 1 from 10.0.0.1: Count = 1
Request 2 from 10.0.0.1: Count = 2
Request 3 from 10.0.0.1: Count = 3
If count > 100/sec → reject
```

## Error Handling in Chain

If middleware errors:

```
Auth middleware: Can't connect to auth service
  → Return 500 error
  → Other middlewares not executed
  → Service not contacted
```

Some errors are retryable.

## Performance Considerations

Middleware order affects performance:

```yaml
# Fast first (filtering)
middlewares:
  - ratelimit  # Quick check
  - auth       # Quick validation
  - compress   # Slower (CPU intensive)

# vs

# Slow first (wasting CPU)
middlewares:
  - compress   # CPU intensive
  - ratelimit  # Quick check
  - auth       # Quick validation
```

Put cheap operations first, expensive last.

## Key Takeaway

Middleware chains form processing pipelines. Requests flow through middlewares in order, each possibly modifying request/response. Design chains efficiently with fast operations first.
