---
title: ACME and Let's Encrypt
---

# ACME and Let's Encrypt

## What is ACME?

**ACME** (Automated Certificate Management Environment) is a standardized protocol for automatically issuing and renewing SSL/TLS certificates without human intervention.

**Let's Encrypt** = Free, automated certificate provider using ACME protocol

**Traefik + ACME** = Free, fully automatic HTTPS for your services

## The Problem ACME Solves

```
❌ Traditional Certificates:
   • Expensive ($100+ per year)
   • Manual renewal process
   • Can expire and break sites
   • Complex certificate generation

✅ Let's Encrypt + ACME:
   • Completely free
   • Automatic renewal (you'll never forget)
   • 90-day validity prevents expiration
   • Zero manual work after setup
```

## How ACME Certificate Issuance Works

```
┌─────────────────────────────────────────────┐
│      Certificate Request Flow               │
├─────────────────────────────────────────────┤
│                                             │
│ Step 1: Request                             │
│ Traefik → "I want cert for example.com"     │
│                                             │
│ Step 2: Challenge                           │
│ Let's Encrypt → "Prove you own the domain"  │
│                                             │
│ Step 3: Proof                               │
│ Traefik → Updates DNS or HTTP endpoint      │
│ Let's Encrypt → Verifies ownership ✓        │
│                                             │
│ Step 4: Issuance                            │
│ Let's Encrypt → Issues certificate         │
│ Traefik → Stores in /acme.json              │
│                                             │
│ Step 5: Auto-Renewal (Day 45+)              │
│ Traefik monitors expiration                 │
│ When < 30 days remain → Auto-renew          │
│ Zero downtime, zero manual work             │
│                                             │
└─────────────────────────────────────────────┘
```

## ACME Challenges

**HTTP Challenge**: Let's Encrypt verifies via HTTP

```yaml
certificatesResolvers:
  letsencrypt:
    acme:
      email: admin@example.com
      storage: /acme.json
      httpChallenge:
        entryPoint: web
```

Let's Encrypt hits `http://example.com/.well-known/acme-challenge/` to verify ownership.

**DNS Challenge**: Let's Encrypt verifies via DNS

```yaml
certificatesResolvers:
  letsencrypt:
    acme:
      email: admin@example.com
      storage: /acme.json
      dnsChallenge:
        provider: route53
```

Updates DNS record, Let's Encrypt queries it. Useful for:
- Wildcard certificates
- Internal domains
- Multiple domains

## Configuration Example

```yaml
entryPoints:
  web:
    address: ":80"
  websecure:
    address: ":443"

certificatesResolvers:
  letsencrypt:
    acme:
      email: admin@example.com
      storage: /acme.json
      
      # Use HTTP challenge
      httpChallenge:
        entryPoint: web
      
      # Or use DNS challenge
      # dnsChallenge:
      #   provider: cloudflare

routers:
  myapp:
    rule: "Host(`myapp.com`)"
    service: myapp-service
    entryPoints:
      - web
      - websecure
    tls:
      certResolver: letsencrypt
```

## Storage

Certificates stored in `/acme.json`:

```bash
# In Docker: mount as volume
- ./acme.json:/acme.json

# File permissions important
chmod 600 acme.json
```

Keep this file backed up! Contains your certificates.

## Staging vs Production

**Staging** (for testing):

```yaml
certificatesResolvers:
  letsencrypt:
    acme:
      caServer: https://acme-staging-v02.api.letsencrypt.org/directory
```

Test without hitting production rate limits.

**Production**:

```yaml
certificatesResolvers:
  letsencrypt:
    acme:
      caServer: https://acme-v02.api.letsencrypt.org/directory
```

Default, has rate limits.

## Docker Compose Example

```yaml
version: '3'
services:
  traefik:
    image: traefik:v2.9
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./acme.json:/acme.json
      - /var/run/docker.sock:/var/run/docker.sock
    command:
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--providers.docker=true"
      - "--certificatesResolvers.letsencrypt.acme.email=admin@example.com"
      - "--certificatesResolvers.letsencrypt.acme.storage=/acme.json"
      - "--certificatesResolvers.letsencrypt.acme.httpChallenge.entryPoint=web"
    networks:
      - web

  myapp:
    image: myapp
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.app.rule=Host(`myapp.com`)"
      - "traefik.http.routers.app.entrypoints=web,websecure"
      - "traefik.http.routers.app.tls.certresolver=letsencrypt"
      - "traefik.http.services.app.loadbalancer.server.port=8080"
    networks:
      - web

networks:
  web:
```

## Wildcard Certificates

For `*.example.com`, use DNS challenge:

```yaml
certificatesResolvers:
  letsencrypt:
    acme:
      email: admin@example.com
      storage: /acme.json
      dnsChallenge:
        provider: cloudflare
        resolvers:
          - "1.1.1.1:53"
          - "8.8.8.8:53"
```

Requires DNS provider API credentials.

## Certificate Renewal

Automatic! Traefik renews before expiration:

- Checks expiration daily
- Renews 30 days before expiration
- No downtime
- No manual action needed

## Rate Limits

Let's Encrypt has rate limits:

- 50 certificates per domain per week
- 5 duplicate certificates per week
- Use staging for testing

If you hit limits:

```yaml
caServer: https://acme-staging-v02.api.letsencrypt.org/directory
```

## Troubleshooting

**"Challenge failed"**: Domain not pointing to server IP
**"Rate limit exceeded"**: Use staging or wait a week
**"Certificate not issued"**: Check email, might need action
**DNS not updating**: Some DNS providers are slow

## Key Takeaway

ACME with Let's Encrypt gives you free, automatic HTTPS certificates. Traefik handles everything—requests, renewals, storage. Enables secure HTTPS without cost or manual management.
