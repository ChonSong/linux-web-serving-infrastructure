# Linux Web Serving Infrastructure

Comprehensive collection of tools, configurations, and applications for serving Linux applications over the web with enterprise-grade security, scalability, and automation.

## 🏗️ Architecture Overview

This infrastructure supports multiple deployment patterns:
- **Static Web Applications** (React, Vue, SPA)
- **Real-time Services** (WebSocket, Socket.IO)
- **Microservices** (Docker Compose orchestration)
- **API Endpoints** (RESTful services with authentication)
- **Containerized Applications** (Docker + Kubernetes ready)

## 📁 Project Structure

```
├── 🗂️ server-configurations/     # Nginx, Caddy, HAProxy configs
├── 🐳 docker-deployments/        # Multi-service Docker setups
├── 🚀 deployment-scripts/        # CI/CD, automation, health checks
├── 🌐 web-applications/          # Sample apps and client libraries
├── ⚙️ build-tools/              # Build systems and development tools
├── 🔧 system-services/          # Service management and monitoring
├── 📊 monitoring-backup/        # Health checks and backup systems
└── 📚 documentation/           # Guides and infrastructure docs
```

## 🚀 Quick Start

### Development Environment
```bash
# Clone and setup development environment
git clone [<repository-url>](https://github.com/ChonSong/linux-web-serving-infrastructure.git)
cd linux-web-serving-infrastructure

# Start development stack (Redis + App + Nginx)
cd docker-deployments/realtime-sync-server
docker-compose -f docker-compose.dev.yml up -d

# Run health checks
./scripts/health-check.sh
```

### Production Deployment
```bash
# Deploy with full monitoring stack
cd docker-deployments/realtime-sync-server
./deploy.sh production

# Setup SSL certificates
./scripts/setup-ssl.sh your-domain.com
```

## 🎯 Key Features

### 🔒 Security
- **SSL/TLS Termination** - Automatic HTTPS with certificate management
- **Rate Limiting** - Configurable request rate limits per endpoint
- **Security Headers** - HSTS, CSP, and OWASP security headers
- **Authentication** - JWT-based authentication with Redis sessions
- **Firewall Rules** - Configurable security policies

### 📈 Scalability
- **Load Balancing** - HAProxy and Nginx load balancing
- **Container Orchestration** - Docker Compose multi-service setups
- **Caching Layers** - Redis caching for session and data storage
- **Database Optimization** - PostgreSQL and SQLite configurations
- **Auto-scaling** - PM2 process management and monitoring

### 🔧 Automation
- **CI/CD Pipelines** - GitHub Actions for automated deployment
- **Health Monitoring** - Comprehensive health check systems
- **Backup Systems** - Automated backup and recovery procedures
- **Log Management** - Centralized logging with rotation
- **Zero-downtime Deployment** - Rolling updates and rollbacks

### 🛠️ Development Tools
- **Code-server Integration** - Web-based IDE with mobile optimization
- **Hot Reload** - Development servers with live reload
- **Build Optimization** - Vite, Webpack, and TypeScript configurations
- **Testing Frameworks** - Jest, Cypress, and automated testing
- **Mobile Development** - Touch-optimized interfaces and workflows

## 🌟 Included Applications

### 1. Real-time Sync Server
- **WebSocket Communication** - Socket.IO real-time data sync
- **Cross-device Synchronization** - VS Code extension integration
- **Multi-user Support** - Concurrent session management

### 2. Streaming Platform
- **VNC Streaming** - Desktop application streaming over web
- **Microservices Architecture** - Auth, session, storage, billing services
- **Monitoring Stack** - Prometheus + Grafana dashboard

### 3. Development Environments
- **Portfolio Sites** - React + TypeScript applications
- **E-commerce Platforms** - Shopping cart and payment integration
- **AI Applications** - News aggregation and chat interfaces

## 📋 Supported Technologies

### Web Servers
- ✅ **Nginx** - High-performance HTTP/2 server with load balancing
- ✅ **Caddy** - Modern server with automatic HTTPS
- ✅ **HAProxy** - Advanced load balancing and proxy

### Containerization
- ✅ **Docker** - Full container support with multi-stage builds
- ✅ **Docker Compose** - Multi-service orchestration
- ✅ **Health Checks** - Container health monitoring

### Databases & Caching
- ✅ **PostgreSQL** - Production relational database
- ✅ **Redis** - In-memory caching and session storage
- ✅ **SQLite** - Lightweight embedded database
- ✅ **RabbitMQ** - Message queuing for microservices

### Development Tools
- ✅ **Node.js** - JavaScript runtime and Express.js framework
- ✅ **React** - Frontend framework with TypeScript
- ✅ **Vite** - Fast build tool and dev server
- ✅ **PM2** - Process management and monitoring

## 🔧 Configuration Templates

### Nginx Configuration
```nginx
# HTTP/2 support with rate limiting
server {
    listen 443 ssl http2;
    rate_limit api 10r/s;

    # WebSocket proxy support
    location /socket.io/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
    }
}
```

### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]

  redis:
    image: redis:alpine
    persist: true
```

### Deployment Script
```bash
#!/bin/bash
# Automated deployment with rollback
deploy() {
    ./health-check.sh
    docker-compose pull
    docker-compose up -d --no-deps app
    ./validate-setup.sh
}
```

## 📊 Monitoring & Health Checks

### Health Monitoring
- **Application Health** - HTTP endpoint monitoring
- **Database Connectivity** - Connection pool monitoring
- **Service Dependencies** - Inter-service health checks
- **Resource Usage** - CPU, memory, and disk monitoring

### Backup Systems
- **Automated Backups** - Scheduled database and file backups
- **Point-in-time Recovery** - Restore to specific timestamps
- **Backup Verification** - Automated backup integrity checks

## 🌐 Mobile Support

### Mobile-Optimized Development
- **Touch Interface** - Optimized for tablet and phone use
- **Responsive Design** - Mobile-first application development
- **Code-server Mobile** - Full IDE experience in mobile browsers

### Mobile Development Workflow
```bash
# Start mobile-optimized development environment
cdev                    # Claude Code with strict autonomy
mobile.codeovertcp.com  # Mobile-optimized code-server
```

## 🔒 Security Best Practices

### Security Headers
```http
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'self'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
```

### Rate Limiting
- **API Endpoints** - 10 requests per second
- **Authentication** - 5 requests per second
- **Static Content** - No rate limiting

### Container Security
- **Non-root Users** - All containers run as non-root
- **Minimal Base Images** - Alpine Linux distributions
- **Health Checks** - Container health monitoring

## 📚 Documentation

- [Deployment Guide](./documentation/DEPLOYMENT_GUIDE.md)
- [Security Configuration](./documentation/SECURITY_GUIDE.md)
- [Monitoring Setup](./documentation/MONITORING_GUIDE.md)
- [Mobile Development](./documentation/MOBILE_GUIDE.md)
- [Troubleshooting](./documentation/TROUBLESHOOTING.md)

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Test** your changes thoroughly
4. **Submit** a pull request with detailed description

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

---

**Status**: ✅ Production Ready
**Last Updated**: 2025-11-25
**Maintainer**: Infrastructure Team
