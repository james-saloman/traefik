---
title: Prometheus Metrics
---

# Prometheus Metrics

## Logs, Metrics, and Traces

Three different ways to observe Traefik, each answering a different question:

- **Access logs**: what happened to *this one* request?
- **Metrics** (this page): what's the aggregate request rate, error rate, and latency *over time*?
- **Tracing**: how did *this one* request move through multiple services?

Metrics are what you put on a dashboard and alert on — they're cheap to store and built for graphing trends, not inspecting individual requests.

## Enabling Prometheus Metrics

```yaml
metrics:
  prometheus:
    entryPoint: metrics
    addEntryPointsLabels: true
    addRoutersLabels: true
    addServicesLabels: true

entryPoints:
  metrics:
    address: ":8082"
```

A separate `metrics` entrypoint keeps the Prometheus scrape endpoint off the public `web`/`websecure` entrypoints.

## Docker Compose Setup

```yaml
services:
  traefik:
    image: traefik:v2.9
    command:
      - "--metrics.prometheus=true"
      - "--metrics.prometheus.entrypoint=metrics"
      - "--entrypoints.metrics.address=:8082"
    ports:
      - "8082:8082"
```

Metrics are now available at `http://localhost:8082/metrics`.

## Key Metrics Exposed

```
traefik_entrypoint_requests_total          # requests per entrypoint, by status code
traefik_entrypoint_request_duration_seconds # latency histogram per entrypoint
traefik_service_requests_total             # requests per service, by status code
traefik_service_request_duration_seconds   # latency histogram per service
traefik_service_retries_total              # retry attempts per service
traefik_service_server_up                  # 1 = backend healthy, 0 = unhealthy
traefik_config_reloads_total               # how many times dynamic config reloaded
```

Every metric carries labels (`entrypoint`, `service`, `code`, `method`) so you can slice by any of them in a query.

## Prometheus Scrape Configuration

On the Prometheus side:

```yaml
scrape_configs:
  - job_name: 'traefik'
    static_configs:
      - targets: ['traefik:8082']
    scrape_interval: 15s
```

## Useful PromQL Queries

**Request rate per service (last 5 min)**:

```promql
sum(rate(traefik_service_requests_total[5m])) by (service)
```

**Error rate (5xx as a percentage)**:

```promql
sum(rate(traefik_service_requests_total{code=~"5.."}[5m])) by (service)
/
sum(rate(traefik_service_requests_total[5m])) by (service)
```

**p99 latency per service**:

```promql
histogram_quantile(0.99,
  sum(rate(traefik_service_request_duration_seconds_bucket[5m])) by (service, le)
)
```

**Backends currently down**:

```promql
traefik_service_server_up == 0
```

## Grafana Dashboards

Prometheus stores the numbers; Grafana is what teams typically use to visualize them. Traefik publishes an official community dashboard (search "Traefik" in Grafana's dashboard library) covering request rate, latency, and error rate per service out of the box — a reasonable starting point before building custom panels.

## Metrics vs Debug Logs

Don't reach for `DEBUG` logging to answer "what's our error rate been over the last hour?" — that's a metrics question. Save debug logs for "why did *this specific* request fail," and use metrics for anything aggregate or trend-based.

## Key Takeaway

Prometheus metrics give you aggregate, queryable visibility into request rate, latency, and backend health over time — the foundation for dashboards and alerting. Expose them on a dedicated `metrics` entrypoint, scrape with Prometheus, and visualize with Grafana.
