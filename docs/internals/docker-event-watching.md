---
title: Docker Event Watching
---

# Docker Event Watching

## How Traefik Watches Docker

Traefik connects to Docker daemon and listens for events:
- Container start
- Container stop
- Container update (labels change)
- Network changes

When events occur, Traefik reconfigures routing automatically.

## Docker Socket Connection

```yaml
providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
```

Traefik connects to Docker socket and stays open, listening for events.

## Event Types Traefik Cares About

**Container Events**:
- `start`: New container with traefik labels → add to routing
- `die/stop`: Container stops → remove from routing
- `update`: Labels changed → reconfigure routing

**Network Events**:
- Container connected to network
- Container disconnected from network

## Event Flow

```
1. Container starts with traefik labels
2. Docker emits "container start" event
3. Traefik receives event
4. Traefik reads container labels
5. Traefik adds router/service configuration
6. Traffic now routes to container
7. Container stops
8. Docker emits "container stop" event
9. Traefik receives event
10. Traefik removes configuration
```

## Label Detection

When container starts, Traefik checks labels:

```yaml
labels:
  - "traefik.enable=true"  # Must have this
  - "traefik.http.routers.app.rule=Host(`app.local`)"
  - "traefik.http.services.app.loadbalancer.server.port=8080"
```

Without `traefik.enable=true`, container ignored.

## Container Updates

If you update container labels (not recommended):

```bash
docker run -d --label "traefik.enable=true" myapp
# Later: update labels
docker inspect myapp  # Check current labels
```

Container must be recreated for label changes (no hot-update).

## Watching Multiple Docker Hosts

```yaml
providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    
  docker-remote:
    endpoint: "tcp://remote-host:2375"
```

Traefik watches multiple Docker daemons simultaneously.

## Docker Socket Security

The socket is sensitive:

```bash
# Only root can write to socket
ls -la /var/run/docker.sock
# srw-rw---- 1 root docker

# Run Traefik as user in docker group
groups traefik-user
# traefik-user : docker
```

Or use root container (not recommended).

## Event Buffering

High-frequency events buffered:

```bash
# Start many containers at once
for i in {1..10}; do
  docker run -d myapp
done

# Traefik receives all 10 events, processes them
# Updates configuration once, not 10 times
```

Efficient batching prevents thrashing.

## Debugging Events

Enable debug logging:

```yaml
log:
  level: DEBUG
```

See events in logs:

```
INFO    [docker] (re)creating provider
DEBUG   [docker] event triggered: ...
DEBUG   [docker] loading containers...
```

## Health Checks During Updates

Traefik tracks container health via Docker:

```bash
docker inspect myapp | grep -A 5 Health
```

Only healthy containers receive traffic.

## Key Takeaway

Docker event watching is how Traefik discovers and tracks containers. Listens to Docker socket, reacts to events, hot-reloads configuration without restart.
