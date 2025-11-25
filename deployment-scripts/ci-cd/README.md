# Deployment Guide

This guide covers the deployment setup and procedures for the development environment projects.

## 🚀 Quick Start

### Automated Deployment
```bash
# Deploy to staging
./deployment/deploy.sh --project ecommerce-dash --env staging

# Deploy to production
./deployment/deploy.sh --project global-news-ai --env production

# Deploy specific branch
./deployment/deploy.sh --project ecommerce-dash --env staging --branch feature/new-ui
```

### CI/CD Pipeline
The projects are configured with GitHub Actions for automated CI/CD:
- **On Push to `develop`**: Runs tests, builds, and deploys to staging
- **On Push to `main`**: Runs tests, builds, and deploys to production
- **Pull Requests**: Runs tests and security scans

## 📋 Projects and Ports

| Project | Development Port | Production Port | Repository |
|---------|------------------|-----------------|------------|
| E-commerce Dashboard | 3000 | 3001 | `ecommerce-dash` |
| Global News AI | 3002 | 3002 | `global-news-ai` |
| Gemini Assistant | 5173 | 5173 | `gemini-assistant` |
| Sean's Landing Page | 3003 | 3003 | `sean-s-landing-page` |

## 🔧 Environment Setup

### Required Environment Variables

**Staging Environment:**
- `STAGING_HOST`: Staging server host
- `STAGING_USER`: SSH user for staging
- `STAGING_SSH_KEY`: SSH private key for staging
- `SLACK_WEBHOOK_URL`: Slack notifications (optional)

**Production Environment:**
- `PROD_HOST`: Production server host
- `PROD_USER`: SSH user for production
- `PROD_SSH_KEY`: SSH private key for production
- `SLACK_WEBHOOK_URL`: Slack notifications (optional)

**GitHub Secrets:**
- `SNYK_TOKEN`: Snyk security scanning token
- `TEST_API_KEY`: API key for testing
- `STAGING_URL`: Staging URL for API tests

### GitHub Setup

1. **Repository Secrets:**
   ```bash
   # Add these to your GitHub repository settings > Secrets and variables > Actions
   SNYK_TOKEN=your_snyk_token
   STAGING_HOST=your_staging_host
   STAGING_USER=your_staging_user
   STAGING_SSH_KEY=your_staging_ssh_private_key
   PROD_HOST=your_production_host
   PROD_USER=your_production_user
   PROD_SSH_KEY=your_production_ssh_private_key
   SLACK_WEBHOOK_URL=your_slack_webhook_url
   TEST_API_KEY=your_test_api_key
   ```

2. **Environment Protection:**
   - Enable environment protection rules for `production` and `staging`
   - Require approval for production deployments
   - Add required reviewers for production environment

## 🐳 Docker Deployment

### Building Docker Images
```bash
# Build image
docker build -t ecommerce-dash:latest ./ecommerce-dash

# Build with tag
docker build -t global-news-ai:v1.2.0 ./global-news-ai
```

### Running with Docker
```bash
# E-commerce Dashboard
docker run -d \
  --name ecommerce-dash \
  -p 3001:3000 \
  -e NODE_ENV=production \
  ecommerce-dash:latest

# Global News AI
docker run -d \
  --name global-news-ai \
  -p 3002:3000 \
  -e NODE_ENV=production \
  -e OPENAI_API_KEY=your_key \
  global-news-ai:latest
```

### Docker Compose
```yaml
version: '3.8'
services:
  ecommerce-dash:
    build: ./ecommerce-dash
    ports:
      - "3001:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  global-news-ai:
    build: ./global-news-ai
    ports:
      - "3002:3000"
    environment:
      - NODE_ENV=production
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    restart: unless-stopped

  gemini-assistant:
    build: ./gemini-assistant
    ports:
      - "5173:5173"
    restart: unless-stopped
```

## 🔄 Deployment Process

### Automated Deployment (CI/CD)
1. **Code is pushed** to `develop` or `main` branch
2. **GitHub Actions** automatically triggers
3. **Tests run** (unit tests, linting, security scans)
4. **Docker image is built** and pushed to registry
5. **Application is deployed** to appropriate environment
6. **Health check** validates deployment
7. **Notifications** are sent on success/failure

### Manual Deployment
1. **Backup current deployment** (optional but recommended)
2. **Pull latest code** from desired branch
3. **Install dependencies** with `npm ci --production`
4. **Build the application** with `npm run build`
5. **Restart PM2 process** with `pm2 restart app-name`
6. **Verify deployment** with health checks

### Rollback Process
```bash
# Automatic rollback (if deployment fails)
./deployment/deploy.sh --project ecommerce-dash --env production

# Manual rollback to specific backup
./backup/restore-backup.sh 2024-01-15_14-30-00

# Rollback with backup management tool
./backup/manage-backups.sh
```

## 📊 Monitoring and Health Checks

### Health Check Endpoints
All applications include health check endpoints:
- **Health Check**: `GET /health`
- **Status**: Returns 200 if healthy
- **Response**: JSON with status and timestamp

### Monitoring Commands
```bash
# Check application status
pm2 status

# View real-time logs
pm2 logs ecommerce-dash

# Monitor dashboard
pm2 monit

# System monitoring
./monitoring/monitor-dashboard.sh

# Health check
./monitoring/health-check.sh
```

### Log Management
```bash
# View application logs
pm2 logs

# Rotate logs
logrotate /home/seanos1a/monitoring/logrotate.conf

# Clean old logs
find /var/log/apps -name "*.log" -mtime +30 -delete
```

## 🔒 Security Considerations

### Security Scanning
- **Automatic**: Snyk security scans in CI/CD
- **Manual**: `npm audit` for dependency vulnerabilities
- **Code scanning**: GitHub Advanced Security (if enabled)

### API Keys and Secrets
- **Never commit** API keys to git
- **Use environment variables** for all secrets
- **Rotate keys regularly**
- **Use GitHub secrets** for CI/CD

### SSL/TLS Configuration
```nginx
# Caddy configuration example
ecommerce.example.com {
    reverse_proxy localhost:3001
    encode zstd gzip
    header X-Content-Type-Options nosniff
    header X-Frame-Options DENY
}
```

## 🚨 Troubleshooting

### Common Issues

**Application won't start:**
```bash
# Check logs
pm2 logs app-name

# Check port conflicts
netstat -tuln | grep :3001

# Restart PM2
pm2 restart app-name
```

**Health check fails:**
```bash
# Check if application is running
curl http://localhost:3001/health

# Check application logs
pm2 logs --lines 50 app-name

# Verify environment variables
pm2 env app-name
```

**Build failures:**
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Getting Help

1. **Check logs**: `pm2 logs app-name`
2. **Run health check**: `./monitoring/health-check.sh`
3. **Review monitoring dashboard**: `./monitoring/monitor-dashboard.sh`
4. **Check GitHub Actions** for CI/CD issues
5. **Rollback** if necessary: `./backup/restore-backup.sh`

## 📚 Additional Resources

- **PM2 Documentation**: https://pm2.keymetrics.io/docs/
- **GitHub Actions**: https://docs.github.com/en/actions
- **Docker Documentation**: https://docs.docker.com/
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Caddy Server**: https://caddyserver.com/docs/

---

## 🆘 Emergency Procedures

### Full System Recovery
```bash
# 1. Stop all applications
pm2 kill

# 2. Restore from latest backup
cd /home/seanos1a/backup
./restore-backup.sh $(ls -1t | head -n 1)

# 3. Restart services
pm2 start /home/seanos1a/ecosystem.config.js

# 4. Verify all applications
./monitoring/health-check.sh
```

### Emergency Contacts
- **System Administrator**: [Contact Info]
- **DevOps Team**: [Contact Info]
- **Application Support**: [Contact Info]