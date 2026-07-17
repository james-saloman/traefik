---
title: Middlewares
---

# Middlewares

## What is Middleware?

**Middleware** are request/response interceptors that add functionality and transformations. They sit between the router and service, forming a processing pipeline that can authenticate users, rate-limit traffic, add headers, compress responses, and more.

## Middleware Pipeline

```
┌─────────────────────────────────────────────┐
│              REQUEST FLOW                   │
├─────────────────────────────────────────────┤
│                                             │
│  From Router                                │
│    ↓                                        │
│  ┌─────────────────────────────┐            │
│  │ Middleware 1 (Auth)         │ Verify     │
│  └─────────────────────────────┘ user      │
│    ↓                                        │
│  ┌─────────────────────────────┐            │
│  │ Middleware 2 (Rate Limit)   │ Check     │
│  └─────────────────────────────┘ quota    │
│    ↓                                        │
│  ┌─────────────────────────────┐            │
│  │ Middleware 3 (Headers)      │ Add      │
│  └─────────────────────────────┘ security │
│    ↓                                        │
│  Backend Service                            │
│                                             │
├─────────────────────────────────────────────┤
│              RESPONSE FLOW                  │
├─────────────────────────────────────────────┤
│                                             │
│  Backend Response                           │
│    ↓                                        │
│  ┌─────────────────────────────┐            │
│  │ Middleware 3 (compress)     │ Gzip     │
│  └─────────────────────────────┘ compress │
│    ↓                                        │
│  ┌─────────────────────────────┐            │
│  │ Middleware 2 (no-op)        │ Pass     │
│  └─────────────────────────────┘ through  │
│    ↓                                        │
│  ┌─────────────────────────────┐            │
│  │ Middleware 1 (no-op)        │ Pass     │
│  └─────────────────────────────┘ through  │
│    ↓                                        │
│  To Client                                  │
│                                             │
└─────────────────────────────────────────────┘
```

## Common Middlewares

**Authentication**: Verify user credentials

**Headers**: Add/remove/modify HTTP headers

**Rate Limiting**: Limit requests per second

**Compression**: Gzip responses

**Cors**: Handle cross-origin requests

**Redirect**: Redirect requests to different URL

**Rewrite**: Modify request path

**Circuit Breaker**: Fail fast if service down

## Basic Configuration

```yaml
middlewares:
  auth:
    basicAuth:
      users:
        - "user:hashed-password"

routers:
  myapp:
    rule: "Host(`myapp.com`)"
    service: myapp-service
    middlewares:
      - auth
```

## Authentication Middleware

**Basic Auth**: Username and password

```yaml
middlewares:
  basic:
    basicAuth:
      users:
        - "user1:$apr1$r31......."
        - "user2:$apr1$........"
```

**Digest Auth**: More secure than basic

```yaml
middlewares:
  digest:
    digestAuth:
      users:
        - "user:realm:hashed-password"
```

**Forward Auth**: Delegate to external service

```yaml
middlewares:
  forward:
    forwardAuth:
      address: "http://auth-service:8080/auth"
```

## Headers Middleware

Add security headers:

```yaml
middlewares:
  security:
    headers:
      customRequestHeaders:
        X-Custom-Request: "value"
      customResponseHeaders:
        X-Custom-Response: "value"
      sslRedirect: true
      sslHost: "example.com"
      sslForceHost: true
      stsSeconds: 31536000
      stsIncludeSubdomains: true
```

## Rate Limiting Middleware

Limit requests per second/minute:

```yaml
middlewares:
  ratelimit:
    rateLimit:
      average: 100
      burst: 50
```

- Average: 100 requests per second
- Burst: Allow up to 50 over the limit

## Compression Middleware

Gzip responses automatically:

```yaml
middlewares:
  compress:
    compress:
      minResponseBodyBytes: 1000
```

Only compress responses larger than 1000 bytes.

## Redirect Middleware

Redirect requests:

```yaml
middlewares:
  redirect-https:
    redirectScheme:
      scheme: https
      permanent: true
```

Redirect all HTTP to HTTPS with 301 status.

**Redirect paths**:

```yaml
middlewares:
  redirect-path:
    redirectRegex:
      regex: "^http://example.org/(.*)"
      replacement: "https://example.com/${1}"
      permanent: true
```

## Rewrite Middleware

Modify request path before sending to service:

```yaml
middlewares:
  rewrite:
    rewritePath:
      regex: "^/api/(.*)"
      replacement: "/$1"
```

Request to `/api/users` becomes `/users` when sent to service.

## Circuit Breaker Middleware

Fail fast if service is down:

```yaml
middlewares:
  circuit:
    circuitBreaker:
      expression: "NetworkErrorRatio() > 0.5"
```

If 50% of requests fail, circuit opens and fails requests immediately instead of waiting.

## Middleware Chain Example

```yaml
middlewares:
  auth:
    basicAuth:
      users:
        - "user:password"
  
  ratelimit:
    rateLimit:
      average: 100
  
  headers:
    headers:
      customResponseHeaders:
        X-Powered-By: "Traefik"

routers:
  api:
    rule: "Host(`api.example.com`)"
    service: api-service
    middlewares:
      - auth        # First: check auth
      - ratelimit   # Second: apply rate limit
      - headers     # Third: add headers
```

Request must pass all three before reaching service.

## Docker Compose Middleware

```yaml
services:
  app:
    image: myapp
    labels:
      - "traefik.http.middlewares.auth.basicauth.users=user:password"
      - "traefik.http.routers.app.middlewares=auth"
```

## Key Middleware Types

- **Authentication**: basicAuth, digestAuth, forwardAuth
- **Headers**: headers, cors
- **Traffic**: rateLimit, circuitBreaker
- **Compression**: compress
- **Rewriting**: rewritePath, redirectRegex, redirectScheme
- **Plugins**: Custom middleware via plugins

## Middleware Execution Order

Applied in order specified in router:

```yaml
middlewares:
  - auth        # Executes first
  - ratelimit   # Executes second
  - headers     # Executes third
```

Response flows backward through same middleware.

## Key Takeaway

Middlewares are request/response interceptors that add functionality like authentication, rate limiting, headers, and compression. They form a processing pipeline before traffic reaches your service.
