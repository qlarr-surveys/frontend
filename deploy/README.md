<!-- markdownlint-disable line-length -->
<!-- cspell: words qlarr -->
# Qlarr Deployment Guide

## Full Stack Deployment with Docker Compose

Copy `docker-compose.yml` to your server and run:

```bash
docker compose up -d
```

This will start:

- **postgres-db** - PostgreSQL 15.1 database (internal)
- **backend-app** - Qlarr backend on port 8080
- **react-app** - Qlarr frontend on port 80
- **mailhog** - Mail server (internal SMTP on port 1025)

### First Run Setup

1. Create a `.env` file with required variables:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and set:
   - `POSTGRES_USER` - Database user
   - `POSTGRES_PASSWORD` - Database password
   - `JWT_SECRET` - Secret key for JWT authentication
   - `CADDY_HOSTNAME` - Your domain name

3. Start the services:
   ```bash
   docker compose up -d
   ```

4. Access the frontend at <http://localhost>

## Production

### Requirements

- DNS configured pointing to your server
- Ports 80, 443, and 443/udp open
- Caddy requires `/config` and `/data` folders to persist between container restarts (for TLS certificates and configuration)

### Environment Variables

Update the environment variables in `.env` or `docker-compose.yml` for your domain:

| Variable | Description | Example |
| -------- | ----------- | ------- |
| `CADDY_HOSTNAME` | Your domain name | `app.example.com` |
| `POSTGRES_USER` | Database user | `qlarr` |
| `POSTGRES_PASSWORD` | Database password | `secure_password` |
| `JWT_SECRET` | Secret key for JWT authentication | `random_secret_key` |

### Production Docker Run (Frontend Only)

```bash
docker run -p 80:80 -p 443:443 -p 443:443/udp \
  -e CADDY_HOSTNAME="app.example.com" \
  -e CADDY_PORT="80" \
  -e VITE_FRONT_END_HOST="app.example.com" \
  -e VITE_PROTOCOL="https" \
  -e VITE_BE_URL="http://backend:8080" \
  -e VITE_CLOUD_URL="" \
  -v caddy-config:/config \
  -v caddy-data:/data \
  public.ecr.aws/u2n3x2r5/frontend:ee4df20d551b761b169449864382c9abe9aec686
```

## Troubleshooting

### View Logs

```bash
docker compose logs -f
```

### Reset Database

```bash
docker compose down -v
docker compose up -d
```
