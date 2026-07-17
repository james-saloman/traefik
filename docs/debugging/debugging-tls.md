---
title: Debugging TLS
---

# Debugging TLS

## TLS Connection Issues

**Could not establish SSL connection**
**Certificate verify failed**
**Protocol mismatch**

## Certificate Verification

Test certificate:

```bash
echo | openssl s_client -servername myapp.com \
  -connect myapp.com:443
```

Check:

- Certificate valid (dates)
- Domain matches
- Issuer trusted

## Self-Signed Certs

Bypass verification for testing:

```bash
curl -k https://myapp.com
```

`-k` ignores certificate errors (for testing only!).

## Let's Encrypt Issues

**Certificate not issued**:

```bash
docker logs traefik | grep acme
```

Check:

- Domain pointing to server IP
- Port 80 open for HTTP challenge
- Email configured

**Rate limit hit**:

Use staging:

```yaml
caServer: https://acme-staging-v02.api.letsencrypt.org/directory
```

## Certificate Chain

Verify complete chain:

```bash
echo | openssl s_client -servername myapp.com \
  -connect myapp.com:443 -showcerts
```

Should show:
1. Server certificate
2. Intermediate certificate
3. Root certificate

## Cipher Suite Issues

Check supported ciphers:

```bash
echo | openssl s_client -connect myapp.com:443 \
  | grep -A1 "Cipher"
```

Ensure strong cipher suite (avoid deprecated).

## TLS Version

Check TLS version:

```bash
echo | openssl s_client -connect myapp.com:443 \
  | grep "Protocol"
```

Should be TLS 1.2 or 1.3 (not SSL, not old TLS).

## ACME Challenges

Enable debug to see challenge process:

```yaml
log:
  level: DEBUG
```

Look for:

```
[acme] acme challenge...
[acme] http challenge...
```

## Key Takeaway

TLS debugging uses openssl client to test certificates. Verify certificates are valid, domains match, and complete chain present. For Let's Encrypt issues, check domain DNS and port 80 accessibility.
