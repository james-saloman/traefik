---
title: Curl Debugging Cheatsheet
---

# Curl Debugging Cheatsheet

## Basic Requests

```bash
# GET
curl http://localhost:8080

# POST with data
curl -X POST -d "key=value" http://localhost:8080

# Headers
curl -H "Host: myapp.com" http://localhost:8080
curl -H "Authorization: Bearer token" http://localhost:8080
```

## Debugging

```bash
# Verbose (shows headers)
curl -v http://localhost:8080

# Very verbose (includes response body)
curl -vvv http://localhost:8080

# Show headers only
curl -i http://localhost:8080

# Follow redirects
curl -L http://localhost:8080

# Insecure HTTPS (self-signed)
curl -k https://localhost:443
```

## Testing Services

```bash
# Test backend health
curl http://backend:8080/health

# Test Traefik routing
curl -H "Host: myapp.local" http://localhost/

# DNS testing
curl -H "Host: example.com" http://localhost/

# HTTPS
curl https://localhost:443 -k

# Specific TLS version
curl --tlsv1.2 https://localhost:443
```

## Response Analysis

```bash
# Save response
curl http://localhost:8080 -o response.html

# Headers only
curl -I http://localhost:8080

# Status code only
curl -o /dev/null -s -w "%{http_code}\n" http://localhost:8080
```

