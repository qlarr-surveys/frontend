<!-- markdownlint-disable line-length table-column-style -->
<!-- cspell: words qlarr namecheap vcpu usermod newgrp STARTTLS psql -->
# Qlarr Deployment Guide

## Overview

This guide covers deploying Qlarr (frontend + backend + PostgreSQL) on a cloud server with a custom domain name and automatic TLS via Caddy.

## Production Deployment (EC2 / DigitalOcean)

### Prerequisites

- **Domain name** registered (e.g., from GoDaddy, Namecheap, Cloudflare)
- **Server**: AWS EC2 (t3.small+) or DigitalOcean droplet (basic-2vcpu)
- **DNS**: A record pointing to your server's public IP

### Step 1: Provision Server

**DigitalOcean**:

- Image: Ubuntu 24.04 LTS
- Size: Basic (2 vCPU, 4GB RAM)
- Region: Near your users

**AWS EC2**:

- AMI: Ubuntu Server 24.04 LTS
- Type: t4g.medium (2 vCPU, 4GB)
- Security Group: Open ports 22, 80, 443
- Allocate and associate an Elastic IP to your instance

### Step 2: Configure DNS

In your domain registrar's DNS settings:

| Type | Name | Value |
|-|-|-|
| A | your-domain.com or a subdomain | your server's public IPv4 address |

Verify with: `dig +short your-domain.com`

### Step 3: SSH into Server

```bash
ssh ubuntu@your-server-ip
```

### Step 4: Install Docker

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker ubuntu
newgrp docker
```

### Step 5: Ensure Docker compose is installed

```bash
docker compose version

# or install it if not present
sudo apt install docker-compose-plugin -y
```

### Step 6: Configure Firewall (UFW)

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Step 7: Transfer Deployment Files

```bash
scp -r deploy/ ubuntu@your-server-ip:~/deploy
```

### Step 8: Create Environment Variables

```bash
cd ~/deploy

cat > .env << 'EOF'
CADDY_FRONTEND_HOSTNAME=your-domain.com
CADDY_API_HOSTNAME=api.your-domain.com

POSTGRES_DB=qlarr
POSTGRES_USER=qlarr
POSTGRES_PASSWORD=change_me_in_production

JWT_SECRET=change_me_to_a_secure_random_string

# optional mail settings, keep dummy values if not sending emails
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_SMTP_SSL=false
MAIL_SMTP_STARTTLS=false
MAIL_USERNAME=dummy@example.com
MAIL_PASSWORD=dummy_password
EOF
```

To generate a secure JWT_SECRET, you can run:

```bash
openssl rand -base64 32
```

### Step 9: Deploy

```bash
cd ~/deploy
docker compose up -d
docker compose logs -f
```

### Step 10: Verify

```bash
docker compose ps
```

- First run: Caddy provisions TLS certificate (may take ~30 seconds)
- Access `https://your-domain.com`

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `CADDY_FRONTEND_HOSTNAME` | Yes | Frontend domain name | `app.example.com` |
| `CADDY_API_HOSTNAME` | Yes | API domain name | `api.example.com` |
| `POSTGRES_USER` | Yes | Database user | `qlarr` |
| `POSTGRES_PASSWORD` | Yes | Database password | `secure_password` |
| `POSTGRES_DB` | No | Database name | `qlarr` |
| `JWT_SECRET` | Yes | Secret for JWT auth | Generated string |
| `MAIL_HOST` | No* | SMTP server | `smtp.gmail.com` |
| `MAIL_PORT` | No* | SMTP port | `587` |
| `MAIL_SMTP_SSL` | No* | Use SSL | `false` |
| `MAIL_SMTP_STARTTLS` | No* | Use STARTTLS | `false` |
| `MAIL_USERNAME` | No* | SMTP username | `user@gmail.com` |
| `MAIL_PASSWORD` | No* | SMTP password | `password` |

*Mail variables are optional but required if sending emails.

## Maintenance

### Update Deployment

```bash
cd ~/deploy
docker compose down
docker compose pull
docker compose up -d
```

### View Resource Usage

```bash
docker stats
```

### Backup Database

```bash
docker exec postgres-db pg_dump -U qlarr qlarr > backup.sql
```

### Restore Database

```bash
docker exec -i postgres-db psql -U qlarr qlarr < backup.sql
```

## Troubleshooting

### View Logs

```bash
docker compose logs -f
docker compose logs -f backend-app
docker compose logs -f caddy
docker compose logs -f postgres-db
```

### Reset Database

```bash
docker compose down -v
docker compose up -d
```

### DNS Not Resolving

```bash
dig +short your-domain.com
```

### Port Already in Use

```bash
sudo lsof -i :80
sudo lsof -i :443
```

### TLS Certificate Issues

```bash
docker exec qlarr-caddy caddy list-certificates
```

## Single Container (Frontend Only)

If you already have a backend running elsewhere, you can run just the frontend:

```bash
docker run -p 80:80 -p 443:443 -p 443:443/udp \
  -e CADDY_FRONTEND_HOSTNAME="app.example.com" \
  -e VITE_PROTOCOL="https" \
  -e VITE_FRONT_END_HOST="app.example.com" \
  -e VITE_BE_URL="http://your-backend.com:8080" \
  -v caddy-config:/config \
  -v caddy-data:/data \
  public.ecr.aws/qlarr/frontend:ee4df20d551b761b169449864382c9abe9aec686
```

## Security Recommendations

1. **Enable automatic security updates**: `sudo apt install unattended-upgrades`
1. **Use strong passwords**: Generate with `openssl rand -base64 32`
1. **Limit SSH access**: Use key-based authentication, disable password login
1. **Configure fail2ban**: Block brute force SSH attempts
