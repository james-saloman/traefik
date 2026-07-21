---
title: TLS Certificates
---

# TLS Certificates

## What is a TLS Certificate?

A **TLS certificate** is a digital credential that proves your server's identity and enables encrypted HTTPS connections. It's like a passport for your website—browsers check it to verify you are who you claim to be before sending sensitive data.

## What's Inside a Certificate

```
┌──────────────────────────────────┐
│     TLS Certificate File         │
├──────────────────────────────────┤
│ Domain: example.com              │
│ Subdomains: *.example.com        │
│ Public Key: (encryption key)     │
│ Issuer: Let's Encrypt            │
│ Valid From: Jan 1, 2024          │
│ Valid Until: Apr 1, 2024         │
│ Signature: (CA's guarantee)      │
│ Serial: 1234567890               │
└──────────────────────────────────┘
```

## Certificate Types

**Single Domain**:
- Covers: example.com only
- Cost: Usually cheapest
- Use: Single website

**Wildcard**:
- Covers: *.example.com (any subdomain)
- Covers: example.com itself
- Use: Multiple subdomains

**Multi-SAN**:
- Covers: example.com, api.example.com, www.example.com
- Use: Multiple specific domains

## Certificate Providers

**Let's Encrypt**: Free, automatic, 90-day validity
**Self-signed**: Free, not trusted by browsers, development only
**Commercial**: Paid, longer validity, insurance

## Traefik Certificate Management

**Automatic (Let's Encrypt)**:

```yaml
certificatesResolvers:
  letsencrypt:
    acme:
      email: admin@example.com
      storage: /acme.json
      httpChallenge:
        entryPoint: web
```

Traefik handles everything.

**Manual (provided certificates)**:

```yaml
tls:
  certificates:
    - certFile: /etc/traefik/certs/example.crt
      keyFile: /etc/traefik/certs/example.key
```

You provide certificate files.

## TLS Configuration in Routers

Enable TLS on router:

```yaml
routers:
  myapp:
    rule: "Host(`myapp.com`)"
    service: myapp-service
    entryPoints:
      - websecure
    tls:
      certResolver: letsencrypt
```

Traffic on port 443 requires TLS.

## Multiple Certificates

```yaml
tls:
  stores:
    default:
      defaultCertificate:
        certFile: /certs/default.crt
        keyFile: /certs/default.key
  
  certificates:
    - certFile: /certs/myapp.crt
      keyFile: /certs/myapp.key
      domains:
        - main: myapp.com
    
    - certFile: /certs/api.crt
      keyFile: /certs/api.key
      domains:
        - main: api.example.com
```

Different certificates for different domains.

## SNI (Server Name Indication)

When client connects via HTTPS:

```
Client: "I want to access myapp.com"
         (via SNI extension)
     ↓
Traefik: "Oh, they want myapp.com cert"
         (selects appropriate certificate)
     ↓
Server: Sends myapp.com certificate
```

Allows one server with multiple certificates.

## Self-Signed Certificates (Development)

`localtest.me` (and any subdomain of it, e.g. `app.localtest.me`) is a public DNS name that always resolves to `127.0.0.1`, so it's a convenient stand-in for a real domain during local development — no `/etc/hosts` edits needed.

```bash
# Generate self-signed cert for app.localtest.me
openssl req -x509 -newkey rsa:4096 -nodes \
  -out /etc/traefik/certs/localtest-me.crt \
  -keyout /etc/traefik/certs/localtest-me.key \
  -days 365 \
  -subj "/CN=app.localtest.me" \
  -addext "subjectAltName=DNS:app.localtest.me,DNS:*.localtest.me"
```

The `subjectAltName` is required — without it, modern browsers and curl reject the cert's hostname even though it's otherwise valid.

Configure in Traefik:

```yaml
tls:
  certificates:
    - certFile: /etc/traefik/certs/localtest-me.crt
      keyFile: /etc/traefik/certs/localtest-me.key
```

Route to it:

```yaml
http:
  routers:
    app:
      rule: "Host(`app.localtest.me`)"
      service: app
      tls: {}
```

Visit `https://app.localtest.me`. Browser still shows a warning (expected for self-signed — the CA isn't trusted, only the hostname matches).

## Certificate Chain

Your certificate points to intermediate certificate, which points to root certificate.

```
Let's Encrypt Root
        ↓
  Intermediate Cert
        ↓
  Your Certificate (myapp.com)
```

Traefik sends entire chain to client.

## Certificate Expiration

Check when certificates expire:

```bash
openssl x509 -in /path/to/cert.crt -noout -dates
# Output:
# notBefore=Jan 1 12:00:00 2024 GMT
# notAfter=Jan 1 12:00:00 2025 GMT
```

With Let's Encrypt, Traefik renews automatically.

## HTTPS Redirect

Redirect HTTP to HTTPS:

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

All HTTP requests → HTTPS.

## TLS 1.2 vs 1.3

**TLS 1.2**: Older, widely supported
**TLS 1.3**: Newer, faster, more secure

Traefik supports both. Modern clients use TLS 1.3.

## Certificate Storage Structure

```
/acme.json (Let's Encrypt)
/certs/
  ├── myapp.crt
  ├── myapp.key
  ├── api.crt
  ├── api.key
```

Keep keys secure (600 permissions):

```bash
chmod 600 /certs/*.key
chmod 600 /acme.json
```

## Docker Compose with Certificates

```yaml
version: '3'
services:
  traefik:
    image: traefik:v2.9
    volumes:
      - ./acme.json:/acme.json
      - ./certs:/etc/traefik/certs
    ports:
      - "443:443"
```

Mount certificate directories as volumes.

## Certificate Validation

Browsers validate:
- Certificate not expired
- Domain matches
- Certificate signed by trusted CA
- Certificate chain valid

Invalid = Warning or block access.

## Key Takeaway

TLS certificates enable encrypted HTTPS connections. Traefik can manage them automatically (Let's Encrypt) or use provided certificates. Proper certificate management is essential for production security.
