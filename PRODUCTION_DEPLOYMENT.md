# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Configuration

Create a production `.env` file with secure values:

```bash
# Copy example and edit
cp .env.example .env
```

**Required Variables:**

- `SECRET_KEY` - **CRITICAL**: Generate a strong 32+ character key
  ```bash
  # Generate using OpenSSL
  openssl rand -base64 32
  ```

- `API_KEY` - **CRITICAL**: Generate strong API key(s) for authentication
  ```bash
  # Generate one or more API keys
  openssl rand -base64 32
  ```

- `SOLANA_RPC_URL` - Use a premium RPC provider:
  - [QuickNode](https://quicknode.com) - Recommended
  - [Helius](https://helius.dev)
  - [Alchemy](https://alchemy.com)
  - Avoid public endpoints for production

- `ALLOWED_ORIGINS` - Restrict to your frontend domain(s)
  ```
  ALLOWED_ORIGINS=https://your-domain.com,https://app.your-domain.com
  ```

- `NODE_ENV=production` - **CRITICAL**: Enables authentication and security features

### 2. Security Hardening

**File Permissions:**
```bash
# Protect sensitive files
chmod 600 .env
chmod 600 db.json
chmod 700 logs/
```

**Firewall Configuration:**
```bash
# Only allow necessary ports
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 3001/tcp    # Application (adjust as needed)
sudo ufw enable
```

**Disable Root Login:**
```bash
# Edit /etc/ssh/sshd_config
PermitRootLogin no
PasswordAuthentication no  # Use SSH keys only
```

### 3. Database Backup

**Automated Backup Script:**

Create `scripts/backup-db.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/cotton-candy-bot"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cp db.json "$BACKUP_DIR/db_$DATE.json"

# Keep only last 30 days
find $BACKUP_DIR -name "db_*.json" -mtime +30 -delete
```

**Cron Job (Daily at 2 AM):**
```bash
crontab -e
# Add:
0 2 * * * /path/to/scripts/backup-db.sh
```

### 4. Install Dependencies

```bash
# Install Node.js 18+ (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
npm install -g pm2

# Install application dependencies
cd /path/to/cotton-candy-bot
npm install --production
```

### 5. PM2 Setup

```bash
# Start application with PM2
pm2 start ecosystem.config.cjs --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Run the command output by the above

# Monitor application
pm2 monit

# View logs
pm2 logs cotton-candy-bot

# Restart application
pm2 restart cotton-candy-bot
```

### 6. Monitoring & Logging

**PM2 Monitoring:**
```bash
# Real-time monitoring
pm2 monit

# Application status
pm2 status

# View specific logs
pm2 logs cotton-candy-bot --lines 100
```

**Log Rotation:**

Create `/etc/logrotate.d/cotton-candy-bot`:
```
/path/to/cotton-candy-bot/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 <user> <group>
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 7. Nginx Reverse Proxy (Optional)

**Install Nginx:**
```bash
sudo apt-get install nginx certbot python3-certbot-nginx
```

**Nginx Configuration** (`/etc/nginx/sites-available/cotton-candy-bot`):
```nginx
upstream cotton_candy_backend {
    server 127.0.0.1:3001;
}

server {
    listen 80;
    server_name api.your-domain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.your-domain.com;

    # SSL Configuration (Certbot will add these)
    ssl_certificate /etc/letsencrypt/live/api.your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.your-domain.com/privkey.pem;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

    location / {
        limit_req zone=api_limit burst=20 nodelay;

        proxy_pass http://cotton_candy_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.io WebSocket Support
    location /socket.io/ {
        proxy_pass http://cotton_candy_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**Enable Site:**
```bash
sudo ln -s /etc/nginx/sites-available/cotton-candy-bot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d api.your-domain.com
```

### 8. Health Monitoring

**Uptime Monitoring Services:**
- [UptimeRobot](https://uptimerobot.com) - Free tier available
- [Pingdom](https://pingdom.com)
- [StatusCake](https://statuscake.com)

**Monitor Endpoint:**
```
GET https://api.your-domain.com/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": 1640000000000
}
```

### 9. Deployment Process

**Initial Deployment:**
```bash
# 1. Clone repository
git clone <repository-url> /opt/cotton-candy-bot
cd /opt/cotton-candy-bot

# 2. Install dependencies
npm install --production

# 3. Configure environment
cp .env.example .env
nano .env  # Edit with production values

# 4. Start with PM2
pm2 start ecosystem.config.cjs --env production
pm2 save

# 5. Verify
pm2 status
pm2 logs cotton-candy-bot
curl http://localhost:3001/api/health
```

**Updates/Redeployment:**
```bash
# 1. Pull latest code
cd /opt/cotton-candy-bot
git pull origin main

# 2. Install dependencies
npm install --production

# 3. Reload application (zero-downtime)
pm2 reload cotton-candy-bot

# 4. Verify
pm2 status
curl http://localhost:3001/api/health
```

### 10. Rollback Procedure

**Quick Rollback:**
```bash
# 1. Checkout previous version
git log --oneline  # Find commit hash
git checkout <commit-hash>

# 2. Reinstall dependencies
npm install --production

# 3. Reload application
pm2 reload cotton-candy-bot
```

**Database Rollback:**
```bash
# 1. Stop application
pm2 stop cotton-candy-bot

# 2. Restore backup
cp /var/backups/cotton-candy-bot/db_YYYYMMDD_HHMMSS.json db.json

# 3. Restart application
pm2 start cotton-candy-bot
```

## Performance Optimization

### Node.js Memory Limits

Edit `ecosystem.config.cjs`:
```javascript
{
  max_memory_restart: '1G',  // Adjust based on server resources
  node_args: '--max-old-space-size=1024'
}
```

### Database Optimization

**Enable Compression (if using larger datasets):**

The current `lowdb` implementation is suitable for development and small-scale production. For high-volume production:

1. Consider migrating to PostgreSQL or MongoDB
2. Implement connection pooling
3. Add database indexes
4. Enable query caching

## Security Best Practices

1. **Never commit `.env` to version control**
   ```bash
   # Verify .env is in .gitignore
   git check-ignore .env
   ```

2. **Rotate API keys regularly** (every 90 days)
   ```bash
   # Generate new key
   openssl rand -base64 32

   # Update .env
   # Reload application
   pm2 reload cotton-candy-bot
   ```

3. **Monitor logs for suspicious activity**
   ```bash
   # Watch for authentication failures
   pm2 logs cotton-candy-bot | grep FORBIDDEN

   # Monitor rate limiting
   pm2 logs cotton-candy-bot | grep RATE_LIMIT_EXCEEDED
   ```

4. **Keep dependencies updated**
   ```bash
   # Check for vulnerabilities
   npm audit

   # Update dependencies
   npm update

   # Fix vulnerabilities
   npm audit fix
   ```

## Troubleshooting

### Application Won't Start

```bash
# Check PM2 logs
pm2 logs cotton-candy-bot --err

# Common issues:
# - Missing environment variables (check validateEnvironment errors)
# - Port already in use (check: lsof -i :3001)
# - Database file permissions (check: ls -la db.json)
```

### High Memory Usage

```bash
# Monitor memory
pm2 monit

# Restart to clear memory
pm2 restart cotton-candy-bot

# If persistent, lower max_memory_restart in ecosystem.config.cjs
```

### WebSocket Connection Issues

```bash
# Check firewall
sudo ufw status

# Check Nginx WebSocket config
sudo nginx -t
sudo tail -f /var/log/nginx/error.log

# Verify Socket.io is accessible
curl -I http://localhost:3001/socket.io/
```

### Database Corruption

```bash
# Stop application
pm2 stop cotton-candy-bot

# Restore from backup
cp /var/backups/cotton-candy-bot/db_<latest>.json db.json

# Restart
pm2 start cotton-candy-bot
```

## Support & Maintenance

- **Logs Location:** `./logs/` and PM2 logs
- **Database Location:** `./db.json`
- **Backups Location:** `/var/backups/cotton-candy-bot/`
- **PM2 Status:** `pm2 status`
- **PM2 Dashboard:** `pm2 monit`

## Emergency Shutdown

```bash
# Graceful shutdown
pm2 stop cotton-candy-bot

# Force shutdown (if graceful fails)
pm2 delete cotton-candy-bot

# Verify ports released
lsof -i :3001
```

---

**Last Updated:** 2025-12-29
**Version:** 2.0.0
