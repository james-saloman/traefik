---
title: File Provider
---

# File Provider

## What is File Provider?

The **File provider** loads routing configuration from YAML or TOML files on disk. It's ideal for infrastructure-as-code setups where you want to version control and audit all configuration changes.

## When to Use File Provider

```
Use File Provider when:
   • Configuration is static/infrastructure-as-code
   • You want git history for all changes
   • Not using Docker or Kubernetes
   • Need to audit who changed what, when
   • Want to integrate with CI/CD pipelines
   • Running multiple environments (dev, staging, prod)

Not ideal for:
   • Frequently changing service lists
   • Auto-scaling scenarios
   • Container-based deployments (use Docker provider)
```

## Configuration

Enable file provider:

```yaml
providers:
  file:
    filename: "/etc/traefik/dynamic.yml"
    watch: true
```

- `filename`: Path to config file
- `watch`: Reload on file change automatically

Or directory of files:

```yaml
providers:
  file:
    directory: "/etc/traefik/config"
    watch: true
```

## File Format

Supports YAML or TOML. YAML example:

```yaml
# File config
http:
  routers:
    myapp:
      entryPoints:
        - web
        - websecure
      rule: "Host(`myapp.com`)"
      service: myapp-service
      middlewares:
        - auth

  services:
    myapp-service:
      loadBalancer:
        servers:
          - url: "http://backend1:8080"
          - url: "http://backend2:8080"
        healthCheck:
          path: "/health"
          interval: "10s"

  middlewares:
    auth:
      basicAuth:
        users:
          - "user:hashed-password"
```

## Docker Compose with File Provider

```yaml
version: '3'
services:
  traefik:
    image: traefik:v2.9
    volumes:
      - ./traefik.yml:/traefik.yml
      - ./dynamic.yml:/dynamic.yml
    command:
      - "--configFile=/traefik.yml"
    ports:
      - "80:80"
      - "443:443"

  myapp:
    image: myapp
    networks:
      - web

networks:
  web:
```

**traefik.yml** (static config):

```yaml
entryPoints:
  web:
    address: ":80"
  websecure:
    address: ":443"

providers:
  file:
    filename: "/dynamic.yml"
    watch: true

api:
  dashboard: true
  insecure: true
```

**dynamic.yml** (routing config):

```yaml
http:
  routers:
    myapp:
      rule: "Host(`myapp.local`)"
      service: myapp-service

  services:
    myapp-service:
      loadBalancer:
        servers:
          - url: "http://myapp:8080"
```

## Multiple Files

Load all files from directory:

```yaml
providers:
  file:
    directory: "/etc/traefik/config"
    watch: true
```

Directory structure:

```
/etc/traefik/config/
├── api.yml
├── web.yml
├── admin.yml
└── middlewares.yml
```

All files merged into single config.

## File Updates

With `watch: true`, changes apply automatically:

```bash
# Edit dynamic.yml
# Traefik detects change
# Reloads config
# No restart needed
```

Useful for:
- Adding/removing services
- Changing routing rules
- Updating middleware config

## Complex Routing Example

```yaml
http:
  routers:
    # Public API
    api-public:
      rule: "Host(`api.example.com`) && Path(`/public/*`)"
      service: api-service
      entryPoints:
        - web
        - websecure
      tls: {}

    # Admin panel (protected)
    api-admin:
      rule: "Host(`api.example.com`) && Path(`/admin/*`)"
      service: api-service
      entryPoints:
        - web
        - websecure
      middlewares:
        - admin-auth
      tls: {}

    # Static files (cached)
    static:
      rule: "Host(`example.com`) && Path(`/static/*`)"
      service: static-service
      middlewares:
        - cache

  services:
    api-service:
      loadBalancer:
        servers:
          - url: "http://api-1:8080"
          - url: "http://api-2:8080"
          - url: "http://api-3:8080"
        healthCheck:
          path: "/health"
          interval: "10s"

    static-service:
      loadBalancer:
        servers:
          - url: "http://static:8080"

  middlewares:
    admin-auth:
      basicAuth:
        users:
          - "admin:hashed-password"

    cache:
      caching:
        maxAge: 86400
```

## Versioning Config

Store in git for version control:

```bash
git init
git add traefik.yml dynamic.yml
git commit -m "Initial Traefik config"
```

Track changes over time, easy to rollback.

## Environment Variables in Files

Use environment variables:

```yaml
services:
  myapp-service:
    loadBalancer:
      servers:
        - url: "http://${BACKEND_HOST}:${BACKEND_PORT}"
```

Set via `.env` or in docker-compose.

## TCP/UDP Routing

File provider supports TCP and UDP:

```yaml
tcp:
  routers:
    mysql:
      rule: "HostSNI(`mysql.example.com`)"
      service: mysql-service
      entryPoints:
        - db

  services:
    mysql-service:
      loadBalancer:
        servers:
          - address: "db1:3306"
          - address: "db2:3306"
```

## Mixing Providers

Combine file with Docker:

```yaml
providers:
  docker: {}
  file:
    filename: "/etc/traefik/static-routes.yml"
```

Docker services + file-based routes work together.

## Key Takeaway

File provider enables configuration-as-code for Traefik. Define routing in version-controlled files, auto-reload on changes. Great for infrastructure that doesn't use Docker or Kubernetes.
