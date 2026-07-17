---
title: Access Logs
---

# Access Logs

## What Are Access Logs?

Access logs record every request passing through Traefik:

- Client IP
- Request method (GET, POST, etc)
- Request path
- Response status code
- Response time
- Bytes sent/received

## Enabling Access Logs

```yaml
accessLog:
  filePath: "/var/log/traefik/access.log"
```

Or to stdout:

```yaml
accessLog: {}
```

## Docker Compose Setup

```yaml
services:
  traefik:
    image: traefik:v2.9
    command:
      - "--accesslog=true"
    volumes:
      - /var/log/traefik:/var/log/traefik
```

## Log Format

Default format (JSON):

```json
{
  "ClientAddr": "192.168.1.100:52000",
  "ClientHost": "192.168.1.100",
  "ClientPort": "52000",
  "ClientUsername": "-",
  "RequestAddr": "myapp.com",
  "RequestHost": "myapp.com",
  "RequestMethod": "GET",
  "RequestPath": "/api/users",
  "RequestProtocol": "HTTP/1.1",
  "RequestScheme": "http",
  "RequestContentSize": 0,
  "ResponseStatus": 200,
  "ResponseContentSize": 1024,
  "Duration": 5000000,
  "RouterName": "api",
  "ServiceName": "api-service"
}
```

## Custom Format

Define custom format:

```yaml
accessLog:
  filePath: "/var/log/traefik/access.log"
  format: "common"
```

Or use Common Log Format (CLF):

```
192.168.1.100 - - [01/Jan/2024:12:00:00 +0000] "GET /api/users HTTP/1.1" 200 1024
```

## Filtering Logs

Only log certain requests:

```yaml
accessLog:
  filePath: "/var/log/traefik/access.log"
  filters:
    statusCodes:
      - "200"
      - "500"  # Only log 200 and 500 status codes
    retryAttempts: true  # Log retry attempts
    minDuration: 100ms   # Only log requests taking >100ms
```

## Analyzing Logs

Find slow requests:

```bash
cat /var/log/traefik/access.log | jq '.Duration | max'
```

Find errors:

```bash
cat /var/log/traefik/access.log | \
  jq 'select(.ResponseStatus >= 400)'
```

Count requests per status:

```bash
cat /var/log/traefik/access.log | \
  jq -r '.ResponseStatus' | \
  sort | uniq -c
```

## Log Rotation

Prevent logs from growing too large:

```bash
# Use logrotate
cat > /etc/logrotate.d/traefik << 'EOF'
/var/log/traefik/access.log {
  daily
  rotate 7
  compress
  delaycompress
  notifempty
  missingok
}
EOF
```

## Key Takeaway

Access logs record every request Traefik handles: client, method, path, status, duration, and which router/service served it. Enable JSON format for easy `jq` filtering, add filters to keep volume down, and rotate logs so they don't fill the disk.
