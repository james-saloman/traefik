---
title: Traefik CLI Cheatsheet
---

# Traefik CLI Cheatsheet

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

