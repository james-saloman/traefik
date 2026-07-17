---
title: Tracing
---

# Tracing

## What is Tracing?

Tracing follows a request through your entire system:

Request enters Traefik → Routed to service → Service calls database → Response returns

Trace captures timing and events at each step.

## Distributed Tracing

Tools like Jaeger track requests across multiple services:

```
Client → Traefik → API Service → Database
  ↓         ↓              ↓              ↓
 [trace spans recorded at each service]
```

Visualization shows bottleneck.

## Enabling Tracing in Traefik

```yaml
tracing:
  jaeger:
    samplingServerURL: "http://jaeger:6831"
    samplingType: "const"
    samplingParam: 1
```

All requests traced (samplingParam: 1 = 100%).

## Trace Data

Each trace contains:

- **Trace ID**: Unique per request
- **Span ID**: Unique per operation
- **Duration**: How long operation took
- **Service name**: Which service
- **Status**: Success/failure

## Jaeger Setup

```yaml
services:
  jaeger:
    image: jaegertracing/all-in-one
    ports:
      - "6831:6831/udp"
      - "16686:16686"
    environment:
      COLLECTOR_ZIPKIN_HOST_PORT: ":9411"
```

Access at: http://localhost:16686

## Sampling

Don't trace 100% (performance overhead):

```yaml
tracing:
  jaeger:
    samplingParam: 0.1  # Trace 10% of requests
```

Reduces overhead while still collecting data.

## Tracing Middleware

Middleware adds spans to trace:

```
GET /api/users
  └─ Router (api) span
     └─ BasicAuth middleware span
        └─ RateLimit middleware span
           └─ Service (api-service) span
              └─ Backend response time
```

See time spent in each stage.

## Key Takeaway

Tracing follows requests through Traefik and services. Tools like Jaeger visualize request flows and identify performance bottlenecks. Essential for microservices debugging.
