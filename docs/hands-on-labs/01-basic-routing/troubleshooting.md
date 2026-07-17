---
title: Troubleshooting
---

# Troubleshooting

## Service doesn't appear in Traefik

**Checklist**:
- [ ] Container running? (`docker-compose ps`)
- [ ] Labels present? (`docker inspect <container>`)
- [ ] `traefik.enable=true`? (Required)
- [ ] Network connected? (Same network as Traefik)

**Fix**:
```bash
docker-compose down
docker-compose up -d
docker logs traefik
```

## 404 error

**Checklist**:
- [ ] Host header correct? (`curl -H "Host: myapp.local"`)
- [ ] Rule matches? Check dashboard
- [ ] Service port correct?

**Test**:
```bash
curl -H "Host: myapp.local" -v http://localhost
# Check response headers
```

## Can't access dashboard

**Checklist**:
- [ ] Traefik running? (`docker-compose ps`)
- [ ] Port 8080 mapped? (`docker-compose.yml`)

**Test**:
```bash
docker logs traefik
# Check for errors
```

## Connection refused

Service exists but can't connect.

**Checklist**:
- [ ] Service listening on configured port?
- [ ] Port exposed correctly?
- [ ] Service and Traefik on same network?

**Test from Traefik container**:
```bash
docker exec traefik_traefik_1 curl http://nginx:80
```

