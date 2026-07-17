---
title: Debug Logs
---

# Debug Logs

## Debug Logs vs Access Logs

Easy to mix these up:

- **Access logs**: one line per *client request* (who asked for what, what came back)
- **Debug logs**: Traefik's own *internal* logging — config loading, provider events, routing decisions, TLS/ACME activity

Access logs tell you what happened to a request. Debug logs tell you what Traefik itself was doing at the time.

## Enabling Debug Logs

```yaml
log:
  level: DEBUG
```

Or as a CLI flag / Docker Compose command:

```yaml
services:
  traefik:
    image: traefik:v2.9
    command:
      - "--log.level=DEBUG"
```

## Log Levels

From least to most verbose:

```
PANIC → FATAL → ERROR → WARN → INFO → DEBUG → TRACE
```

- **INFO** (default): startup, config changes, major events only
- **DEBUG**: adds provider events, routing decisions, middleware execution
- **TRACE**: everything, including internal Go library chatter — very noisy, rarely needed

Start with `DEBUG`. Reach for `TRACE` only when `DEBUG` genuinely isn't enough.

## What You'll See at DEBUG Level

**Provider events** — a container was discovered or removed:

```
DEBU Provider event received event="&{Status:start ...}" providerName=docker
DEBU Configuration received from provider providerName=docker
```

**Router matching** — why a request went where it did:

```
DEBU Adding route for api Host(`api.example.com`) && PathPrefix(`/v1`)
DEBU No matching route found for host myapp.internal
```

**Middleware execution** — each middleware in the chain firing:

```
DEBU Setting up basicAuth middleware routerName=admin
DEBU rateLimit: request allowed count=42 limit=100
```

**ACME / certificate activity**:

```
DEBU Loading ACME challenges
DEBU Domain "myapp.com" certificate obtained
```

## Reading Logs in Docker

```bash
docker logs traefik --follow
```

Filter for a specific concern:

```bash
docker logs traefik 2>&1 | grep -i "acme"
docker logs traefik 2>&1 | grep -i "myapp.com"
docker logs traefik 2>&1 | grep -i "error"
```

## Structured (JSON) Logs

For log aggregation tools (ELK, Loki), switch the output format:

```yaml
log:
  level: DEBUG
  format: json
```

Each line becomes a parseable JSON object instead of plain text — easier to query in a log pipeline, harder to eyeball directly in a terminal.

## When to Reach for Debug Logs

- A router isn't matching the way you expect — DEBUG shows every routing decision
- A container isn't being discovered — DEBUG shows provider events as they arrive
- ACME/Let's Encrypt certificate issuance is failing — DEBUG shows each challenge step
- A middleware seems to be silently doing nothing — DEBUG confirms whether it even ran

## Turning It Back Down

DEBUG logging has a real cost at high traffic volumes (disk I/O, log storage). Once the issue is diagnosed, drop back to `INFO`:

```yaml
log:
  level: INFO
```

## Key Takeaway

Debug logs are Traefik's internal diagnostic trail — distinct from access logs, which only record client requests. Use `DEBUG` level to see routing decisions, provider events, and ACME activity while troubleshooting, then return to `INFO` once resolved.
