---
title: Docker Network Debugging
---

# Docker Network Debugging

## Common Docker Network Issues

**Container can't reach another**
**Traefik can't discover services**
**Port not accessible from host**

## Check Docker Networks

```bash
docker network ls
```

List all networks.

## Inspect Network

```bash
docker network inspect web
```

Shows:
- Connected containers
- Subnet
- Gateway
- DNS settings

## Container on Network?

```bash
docker inspect myapp | grep Networks
```

Is container connected to traefik network?

If not:

```bash
docker network connect web myapp
```

Connect container to network.

## Test Connectivity

From Traefik container:

```bash
docker exec traefik ping myapp
# Can resolve hostname?

docker exec traefik curl http://myapp:8080
# Can reach service?
```

If fails, check network connection.

## DNS Issues

```bash
docker exec traefik nslookup myapp
# Does Docker DNS work?

docker exec traefik cat /etc/resolv.conf
# Check nameserver
```

Should point to Docker's embedded DNS server (usually 127.0.0.11).

## Container Network Interface

```bash
docker exec myapp ifconfig
```

Check:
- IP address in correct subnet
- Gateway is network gateway
- No 127.0.0.1 only

## Port Mapping

Container port ≠ host port:

```yaml
ports:
  - "8080:8080"  # Host 8080 → Container 8080
```

Test locally:

```bash
curl localhost:8080  # Host-level
```

From container:

```bash
docker exec myapp curl localhost:8080  # Inside container
```

## Labels Discovery

Traefik reads labels:

```bash
docker inspect myapp | grep -A 20 Labels
```

Check labels are present:

```
traefik.enable: "true"
traefik.http.routers.myapp.rule: Host(`myapp.local`)
```

## Exposed Ports

Check container exposed ports:

```bash
docker inspect myapp | grep ExposedPorts
```

Service must expose port it listens on.

## Network Mode

Check network mode:

```bash
docker inspect myapp | grep NetworkMode
```

Should be bridge (default) unless specifically changed.

## Docker Daemon Reachability

Traefik needs Docker socket:

```bash
docker exec traefik ls -la /var/run/docker.sock
```

Should be readable.

## Logs

Check container logs:

```bash
docker logs myapp
# Service errors?

docker logs traefik
# Discovery errors?
```

## Ping Test

```bash
docker exec traefik ping -c 1 myapp
```

Success means:
- Container on same network
- DNS resolves
- Basic connectivity works

## Key Takeaway

Docker network debugging checks: networks connected, DNS resolving, ports listening, labels present. Use `docker exec` to test from Traefik container perspective.
