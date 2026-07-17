---
title: Docker Commands Cheatsheet
---

# Docker Commands Cheatsheet

## Container Management

```bash
# List containers
docker ps
docker ps -a  # Include stopped

# Start/stop
docker start container-name
docker stop container-name
docker restart container-name

# Logs
docker logs container-name
docker logs -f container-name  # Follow
docker logs --tail 100 container-name  # Last 100 lines

# Execute in container
docker exec -it container-name bash
docker exec container-name curl http://localhost:8080
```

## Images

```bash
# List images
docker images

# Pull
docker pull myimage:latest

# Remove
docker rmi image-id
```

## Networks

```bash
# List networks
docker network ls

# Inspect
docker network inspect network-name

# Connect container
docker network connect network-name container-name
```

## Docker Compose

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Logs
docker-compose logs -f traefik

# Restart service
docker-compose restart traefik

# Rebuild
docker-compose build --no-cache
```

## Debugging

```bash
# Inspect container
docker inspect container-name

# Get container IP
docker inspect -f '{{.NetworkSettings.IPAddress}}' container-name

# Check resource usage
docker stats

# View environment variables
docker inspect -f '{{.Config.Env}}' container-name
```

