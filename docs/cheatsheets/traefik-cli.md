---
title: Traefik CLI Cheatsheet
---

# Traefik CLI Cheatsheet

## Common Commands

```bash
# Print version, codename, Go version, build date
traefik version

# Run Traefik with a static config file
traefik --configfile=/etc/traefik/traefik.yml

# Show all available flags
traefik --help

# Show help for a specific subcommand
traefik healthcheck --help

# Call the /ping endpoint and exit 0/1 (needs --ping=true) — used in
# Docker HEALTHCHECK / Kubernetes probes
traefik healthcheck --ping
```

Inside a running container:

```bash
# Check the version Traefik is actually running
docker exec traefik traefik version

# Run the same health check the container's HEALTHCHECK uses
docker exec traefik traefik healthcheck --ping

# Tail logs
docker logs -f traefik
```

No reload command is needed after editing a file provider's dynamic config — Traefik watches the file and picks up changes automatically.

## Common Flags

```bash
# Port configuration
--entrypoints.web.address=:80
--entrypoints.websecure.address=:443

# Provider setup
--providers.docker=true
--providers.docker.exposedByDefault=false
--providers.file.filename=/config.yml

# API/Dashboard
--api.dashboard=true
--api.insecure=true  # Development only!

# Logging
--log.level=DEBUG
--accesslog=true

# ACME/Let's Encrypt
--certificatesresolvers.letsencrypt.acme.email=admin@example.com
--certificatesresolvers.letsencrypt.acme.storage=/acme.json
--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web
```

## Environment Variables

```bash
TRAEFIK_API_DASHBOARD=true
TRAEFIK_LOG_LEVEL=DEBUG
TRAEFIK_PROVIDERS_DOCKER=true
TRAEFIK_ENTRYPOINTS_WEB_ADDRESS=:80
```

## Config File

Use `traefik.yml`:

```yaml
entryPoints:
  web:
    address: ":80"

providers:
  docker: {}

api:
  dashboard: true
```

Run with:

```bash
traefik --configFile=traefik.yml
```
