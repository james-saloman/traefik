---
title: Performance Considerations
---

# Performance Considerations

## Traefik Performance Goals

- Sub-millisecond routing decisions
- Minimal CPU overhead
- Low memory footprint
- Handles thousands of concurrent connections

## Routing Table Optimization

Traefik uses optimized data structures:

**Trie for path matching**: O(log n) instead of O(n)
**Direct lookup for hosts**: O(1) using hash tables
**Priority ordering**: Skip lower-priority rules early

Result: Routing decision in microseconds even with 10,000 routes.

## Concurrent Connections

Traefik uses goroutines (lightweight threads):

```
Each connection → one goroutine
Millions of goroutines possible
Minimal memory per goroutine (~2KB)
```

Can handle 100,000+ concurrent connections on modern hardware.

## Middleware Performance

Apply expensive operations selectively:

**Fast middlewares** (should always apply):
- BasicAuth: ~10 microseconds
- Header checks: ~1 microsecond

**Slow middlewares** (apply only when needed):
- Compression: ~100 milliseconds (depends on payload size)
- Rate limiting: ~10 microseconds (but needs state tracking)

Order matters: filter fast first.

## Load Balancing Algorithms

**Round-robin**: O(1) - fastest
**Least connections**: O(n) where n = backend count - slower, more fair
**IP hash**: O(1) - fast

For many backends, round-robin fastest.

## CPU Bottlenecks

TLS handshake is most expensive:

```
TLS 1.2 handshake: CPU-intensive (elliptic curve math)
TLS 1.3 handshake: 25% less CPU than TLS 1.2
```

Use TLS 1.3 for better performance.

## Memory Usage

Traefik memory breakdown:

- Base: ~20MB
- Per route: ~1KB
- Per service: ~5KB
- Per middleware: ~2KB

10,000 routes ≈ 50MB total (very reasonable).

## Buffering

Request buffering can improve performance:

```yaml
entryPoints:
  web:
    address: ":80"
    http:
      readers:
        idleTimeout: 60s
        readTimeout: 60s
      writers:
        writeTimeout: 60s
```

Prevents slow client issues.

## Connection Pooling

Traefik reuses connections to backends:

```
Request 1 → Connect to backend1
Request 2 → Reuse connection to backend1 (no new TCP/TLS handshake)
Request 3 → Reuse connection
```

Dramatically faster than creating new connection each time.

## DNS Performance

Domain lookups can be slow:

```yaml
providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    network: "web"  # Specify network, avoid DNS lookup
```

Specifying network avoids DNS resolution.

## Metrics Monitoring

Track performance:

```yaml
metrics:
  prometheus:
    addEntryPointsLabels: true
    addServicesLabels: true
```

Collect metrics on routing time, backend response time, request count.

## Caching

HTTP caching headers can reduce backend load:

```yaml
middlewares:
  cache:
    caching:
      maxAge: 86400
```

Traefik caches responses, serves from cache on subsequent requests.

## HTTP/2 Performance

Enable HTTP/2 for better performance:

```yaml
entryPoints:
  websecure:
    address: ":443"
    http:
      versions:
        - "h2"
        - "http/1.1"
```

HTTP/2 multiplexing reduces overhead.

## Compression Trade-off

Compression trades CPU for bandwidth:

```
High CPU, low bandwidth → compress
Low CPU, high bandwidth → don't compress
```

Set minimum size:

```yaml
middlewares:
  compress:
    compress:
      minResponseBodyBytes: 1000  # Only compress >1KB
```

## Key Takeaway

Traefik is highly optimized for performance. Routing decisions are sub-millisecond, TLS 1.3 reduces handshake overhead, connection pooling improves throughput. For most workloads, default performance is excellent.
