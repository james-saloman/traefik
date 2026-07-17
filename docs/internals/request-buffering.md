---
title: Request Buffering
---

# Request Buffering

## What is Request Buffering?

Buffering = Reading entire request into memory before sending to backend.

No buffering = Streaming directly to backend without waiting.

## Buffering Tradeoffs

**With buffering**:
- Can modify request (compression, validation)
- Can retry if backend fails
- More memory usage
- Slower for large payloads

**Without buffering** (streaming):
- Minimal memory
- Lower latency
- Can't retry after sending starts
- Faster for large files

## When to Buffer

**Buffer when**:
- Need middleware to modify request
- Backend might fail and need retry
- Request is small
- Memory available

**Don't buffer when**:
- Streaming large files
- Memory limited
- Low latency critical
- Backend always available

## Traefik Buffering

Traefik doesn't buffer by default:

```
Request → Traefik → Backend (streaming)
```

Direct streaming for low latency.

## Middleware Impact

Some middlewares require buffering:

**Authentication**: Must read request before forwarding
**Request validation**: Must inspect body
**Rate limiting**: Must count bytes

These force buffering of request body.

## Buffer Size Limits

Set max buffer size:

```yaml
entryPoints:
  web:
    address: ":80"
    http:
      readers:
        maxHeaderBytes: 1048576  # 1MB headers max
```

Larger payloads stream without buffering.

## Streaming Large Files

Upload large files without buffering:

```
Client: POST /upload (10GB file)
  ↓
Traefik: Streams to backend
Backend: Receives streaming, writes to disk
  ↓
Response returned
```

Memory usage = constant, not 10GB!

## Response Buffering

Similarly, response buffering can occur:

**Stream response**: Send to client as received (low memory)
**Buffer response**: Read entire response first (more options)

Traefik typically streams responses.

## Connection Timeouts with Streaming

With streaming, different timeouts:

```yaml
entryPoints:
  web:
    address: ":80"
    http:
      readers:
        readTimeout: 60s      # Time to read entire request
        writeTimeout: 60s     # Time to write entire response
        idleTimeout: 60s      # Time between requests
```

For streaming large files, increase readTimeout.

## Memory Efficiency

Streaming is memory-efficient:

```
File upload: 1GB
Without streaming (buffering):
  Memory usage: 1GB (entire file in RAM)
  
With streaming:
  Memory usage: Constant (chunk by chunk)
```

Essential for resource-limited environments.

## Gzip Compression

Compression requires buffering:

```yaml
middlewares:
  compress:
    compress: {}
```

Traefik must:
1. Read response
2. Compress
3. Send compressed

So compression disables streaming.

## Request/Response Inspection

Monitoring middleware requires buffering:

```yaml
middlewares:
  access-log:
    logging:
      format: common
```

Must capture entire request/response for logging.

## Backend Health Checks

Health checks can use streaming:

```yaml
services:
  api:
    loadBalancer:
      healthCheck:
        path: "/health"
        interval: 10s
```

Small health responses typically streamed.

## Key Takeaway

Traefik streams by default for low latency and memory efficiency. Some middlewares require buffering. For large file transfers, streaming avoids memory bloat. Understanding buffering helps optimize performance.
