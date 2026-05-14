<!-- markdownlint-disable line-length table-column-style -->
<!-- cspell: words qlarr namecheap vcpu usermod newgrp STARTTLS psql -->
# Qlarr Deployment

Qlarr can be deployed locally for development and testing, or on a cloud server for production use. Both options use Docker Compose to run the full stack (frontend, backend, and PostgreSQL).

- **[Local Deployment](#local-development)** -- Run Qlarr on your machine with a single command. Includes Mailhog for email testing and pre-configured default credentials.
- **[Cloud Deployment](#production-deployment)** -- Deploy to a cloud server (AWS, DigitalOcean, etc.) with a custom domain and automatic TLS via Caddy.

---

## Local Development

### Prerequisites

- Docker and Docker Compose installed

### Start

```bash
cd deploy
docker compose -f docker-compose.local.yml up -d
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| Mailhog UI | http://localhost:8025 |

### Default Login

- **Email**: `admin@admin.admin`
- **Password**: `admin`

### Stop

```bash
docker compose -f docker-compose.local.yml down
```

### Reset Database

```bash
docker compose -f docker-compose.local.yml down -v
docker compose -f docker-compose.local.yml up -d
```

---

## Production Deployment

### Prerequisites

- **Domain name** registered (e.g., from GoDaddy, Namecheap, Cloudflare)
- **Server**: AWS EC2 (t3.small+) or DigitalOcean droplet (basic-2vcpu)
- **DNS**: A records pointing to your server's public IP for both frontend and API subdomains

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

### Step 5: Ensure Docker Compose is installed

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

### Environment Variables

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

---

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

## Security Recommendations

1. **Enable automatic security updates**: `sudo apt install unattended-upgrades`
1. **Use strong passwords**: Generate with `openssl rand -base64 32`
1. **Limit SSH access**: Use key-based authentication, disable password login
1. **Configure fail2ban**: Block brute force SSH attempts
