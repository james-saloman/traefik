---
title: HTTP vs HTTPS
---

# HTTP vs HTTPS

## The Core Difference

**HTTP** = Data sent in plain text, anyone can read it
**HTTPS** = Data encrypted, only the intended recipient can read it

## Why HTTPS Exists

Imagine sending a postcard vs a sealed letter:
- HTTP postcard: Anyone handling it can read your message
- HTTPS sealed letter: Only the recipient can open and read it

## Key Differences

| Feature | HTTP | HTTPS |
|---------|------|-------|
| Encryption | None | TLS/SSL |
| Port | 80 | 443 |
| Security | Vulnerable to eavesdropping | Secure |
| Performance | Slightly faster | Minimal overhead |
| Certificates | Not needed | Required |
| Browser warning | None | Green lock icon |

## How HTTPS Works

1. Client connects to server
2. Server presents SSL/TLS certificate (proves identity)
3. Client and server negotiate encryption
4. All data is encrypted during transmission
5. Only communicating parties can decrypt

## What Gets Encrypted

- Request body (your password, form data)
- Response body (sensitive information)
- **NOT encrypted**: Domain name, IP address, port (visible in DNS/network)

## Why Everyone Uses HTTPS Now

- Browsers show warnings for HTTP sites
- Google ranks HTTPS sites higher
- Protects user privacy and data
- Certificates are free (Let's Encrypt)
- Minimal performance impact

## Key Takeaway

If you're sending any sensitive data (passwords, payment info, personal data), always use HTTPS. HTTP should only be used for local development or non-sensitive public content.
