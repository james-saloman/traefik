---
title: TLS Termination
---

# TLS Termination

## What is TLS Termination?

TLS termination is where an encrypted HTTPS connection ends and becomes plain HTTP to the backend.

**Encrypted**: Client ↔ Proxy (HTTPS)
**Unencrypted**: Proxy ↔ Backend (HTTP)

The proxy decrypts the data for the backend server.

## Why Terminate TLS at the Proxy?

**Single certificate location**: Manage certs in one place, not on every backend
- Backend servers don't need to know about HTTPS
- Add new backends without managing certificates

**Performance**: Backends don't waste CPU on encryption
- Encryption/decryption is CPU-intensive
- Proxy does it once, backends do plain HTTP

**Simplified backend configuration**: Backends just serve HTTP
- Easier setup
- Faster development
- Less to maintain per server

**Central certificate management**: Traefik handles certificate renewal
- Automatic Let's Encrypt integration
- One place to update certificates
- Prevents certificate expiration issues

## How It Works

```
Client (HTTPS encrypted)
    ↓
[Traefik with TLS certificate]
    ↓ (decrypts HTTPS, re-encrypts as HTTP or plain HTTP)
Backend service (HTTP, unencrypted internally)
```

## Common Setup

```
User on internet (encrypted HTTPS)
    ↓
Traefik on port 443 (handles SSL/TLS)
    ↓ (decrypted)
Internal Docker network
    ↓
Backend service on port 8080 (plain HTTP, no encryption needed)
```

The internal network is trusted (same container network), so encryption isn't necessary.

## Certificate Storage

Traefik stores certificates in:
- ACME provider (Let's Encrypt)
- Local file system
- External certificate service

Traefik automatically handles renewal before expiration.

## SSL/TLS Handshake at Proxy

When client connects:
1. Client initiates TLS handshake with Traefik
2. Traefik presents SSL certificate
3. Client verifies certificate (green lock icon)
4. They negotiate encryption method
5. Encrypted connection established
6. Proxy forwards decrypted requests to backend

## Backend Communication

After TLS is terminated:
- Traefik sends plain HTTP requests to backend
- Backend sends plain HTTP responses back
- Traefik encrypts response and sends to client

## Traefik Example

```yaml
entryPoints:
  websecure:
    address: ":443"
    http:
      tls:
        certResolver: letsencrypt

certResolvers:
  letsencrypt:
    acme:
      email: your@email.com
      storage: acme.json
      httpChallenge:
        entryPoint: web
```

This tells Traefik to:
- Listen on port 443 (HTTPS)
- Use Let's Encrypt for certificates
- Store certificates in acme.json
- Forward to backend as HTTP

## Benefits for Your Architecture

- Clients get secure HTTPS connection
- Backends stay simple with HTTP
- No certificate management per backend
- Automatic certificate renewal
- Better performance

## Key Takeaway

TLS termination at a reverse proxy (like Traefik) centralizes certificate management, improves performance, and simplifies backend configuration. It's the standard pattern for modern applications.
