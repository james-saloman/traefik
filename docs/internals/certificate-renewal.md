---
title: Certificate Renewal
---

# Certificate Renewal

## Why Renewal?

Certificates expire. Let's Encrypt issues 90-day certificates. Renewal happens automatically before expiration.

## Renewal Process

**Day 1**: Certificate issued, valid for 90 days

**Day 60**: Traefik checks: "Certificate expires in 30 days"

**Day 60**: Start renewal
```
1. Create CSR (Certificate Signing Request)
2. Prove domain ownership (HTTP challenge)
3. Send to Let's Encrypt
4. Receive new certificate
5. Store in acme.json
6. Load new certificate
```

**Day 60**: New certificate installed, valid for 90 days

**Day 90 (old cert)**: Old certificate expires, but new one active

## Renewal Methods

**Proactive renewal**: Check expiration, renew 30 days before

**Reactive renewal**: Only renew when expired (risky)

Traefik uses proactive (safe).

## Let's Encrypt Validation

To renew, prove domain ownership (same as initial):

**HTTP Challenge** (common):
```
1. Traefik generates challenge token
2. Traefik serves at http://example.com/.well-known/acme-challenge/
3. Let's Encrypt requests challenge
4. Let's Encrypt validates, issues certificate
```

**DNS Challenge**:
```
1. Traefik creates DNS record
2. Let's Encrypt queries DNS
3. Let's Encrypt validates, issues certificate
```

## Certificate Storage

Certificates stored in `/acme.json`:

```json
{
  "example.com": {
    "Certificates": [{
      "domain": {
        "main": "example.com",
        "sans": ["www.example.com"]
      },
      "certificate": "-----BEGIN CERTIFICATE-----...",
      "key": "-----BEGIN PRIVATE KEY-----...",
      "expires": "2024-09-01T12:00:00Z"
    }]
  }
}
```

Keep this file backed up and secure!

## Renewal Failures

If renewal fails:

```
Day 60: Renewal attempt fails
Day 65: Retry
Day 70: Another retry
...
Day 90: Certificate expires, connection fails
```

Configure monitoring to alert if renewal fails.

## Multiple Domains

Wildcard certificate covers multiple subdomains:

```
*.example.com → covers api.example.com, web.example.com, etc.
```

Renews automatically before expiration.

## Staging vs Production

**Staging** (for testing):
```yaml
caServer: https://acme-staging-v02.api.letsencrypt.org/directory
```

Test without rate limits. Use for development.

**Production** (for real):
```yaml
caServer: https://acme-v02.api.letsencrypt.org/directory
```

Has rate limits. Use when ready.

## Rate Limits

Let's Encrypt has rate limits:

- 50 certificates per domain per week
- 5 duplicate certificates per week

If you hit limits:

```
Error: "too many certificates already issued for..."
Action: Use staging or wait a week
```

## Renewal Timing

```
Day 1: Certificate issued
  └─ Expiration: Day 90

Day 60: Check (30 days before expiration)
  └─ Start renewal

Day 62: Renewal succeeds
  └─ New certificate installed
  └─ New expiration: Day 152

Day 150: Check again
  └─ Start new renewal

Day 152 (old cert): Expires (new cert already active)
  └─ No downtime
```

## Monitoring Renewal

Check certificate expiration:

```bash
echo | openssl s_client -servername example.com \
  -connect traefik:443 2>/dev/null | \
  openssl x509 -noout -dates
```

Or check acme.json:

```bash
cat /acme.json | jq '.[] | .Certificates[] | .expires'
```

## Renewal Troubleshooting

**"Invalid domain"**: Domain not pointing to Traefik IP
**"Challenge failed"**: Firewall blocking port 80 for HTTP challenge
**"Rate limit exceeded"**: Too many renewal attempts, wait
**"Authorization denied"**: DNS doesn't show proof

Enable debug logging:

```yaml
log:
  level: DEBUG
```

See exactly what's failing.

## Key Takeaway

Certificate renewal is automatic and proactive. Traefik checks 30 days before expiration, renews via ACME challenge, stores new certificate. Ensures you never have expired certificates.
