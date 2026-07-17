---
title: Security Best Practices
---

# Security Best Practices

## HTTPS Always

Always use HTTPS in production:

```yaml
routers:
  api:
    rule: "Host(`api.example.com`)"
    entryPoints:
      - websecure
    tls:
      certResolver: letsencrypt
```

Never expose sensitive endpoints on HTTP.

## Redirect HTTP to HTTPS

```yaml
entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entrypoint:
          to: websecure
          scheme: https
```

Enforce HTTPS.

## Authentication

Protect admin endpoints:

```yaml
middlewares:
  admin-auth:
    basicAuth:
      users:
        - "admin:hashed-password"

routers:
  admin:
    rule: "Host(`admin.example.com`)"
    middlewares:
      - admin-auth
```

Use strong passwords (hash with htpasswd).

## Dashboard Security

Don't expose dashboard publicly:

```yaml
api:
  dashboard: true
  insecure: false  # Require auth
  entryPoint: admin

entryPoints:
  admin:
    address: "127.0.0.1:8080"  # Local only
```

Restrict to localhost or protected network.

## Docker Socket Permissions

Docker socket is sensitive:

```bash
# Don't run Traefik as root
docker run --user traefik:traefik \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  traefik
```

Use read-only access.

## Certificate Security

Protect acme.json:

```bash
chmod 600 acme.json
chown traefik:traefik acme.json
```

Contains private keys. Don't commit to git.

## Rate Limiting

Prevent abuse:

```yaml
middlewares:
  rate-limit:
    rateLimit:
      average: 100
      burst: 50
```

Limit requests per second.

## IP Filtering

Restrict to known IPs:

```yaml
middlewares:
  ip-whitelist:
    ipWhiteList:
      sourceRange:
        - "192.168.1.0/24"
        - "10.0.0.0/8"
```

Only allow specific networks.

## Headers Security

Add security headers:

```yaml
middlewares:
  headers:
    headers:
      customResponseHeaders:
        X-Content-Type-Options: "nosniff"
        X-Frame-Options: "DENY"
        X-XSS-Protection: "1; mode=block"
        Strict-Transport-Security: "max-age=31536000"
```

Protect against XSS, clickjacking, etc.

## Logging Security

Don't log sensitive data:

```yaml
accessLog:
  fields:
    defaultMode: keep
    names:
      Authorization: drop  # Don't log auth headers
```

Prevent credentials in logs.

## Update Regularly

Keep Traefik updated:

```bash
docker pull traefik:v2.9  # Latest version
```

Security patches released regularly.

## Key Takeaway

Security best practices: always HTTPS, protect dashboard, authenticate admin endpoints, secure docker socket, backup certificates, rate limit, add security headers, update regularly.
