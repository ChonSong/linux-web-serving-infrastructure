#!/bin/bash

# Linux Web Serving Infrastructure - Quick Setup Script
# This script sets up the entire infrastructure for serving Linux apps over the web

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root for system installations
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_warning "Running as root. Some operations will use sudo where needed."
        USE_SUDO=""
    else
        print_status "Running as user. Using sudo for system operations."
        USE_SUDO="sudo"
    fi
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."

    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        echo "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    print_success "Docker found: $(docker --version)"

    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        echo "Visit: https://docs.docker.com/compose/install/"
        exit 1
    fi
    print_success "Docker Compose found: $(docker-compose --version)"

    # Check Node.js (optional)
    if command -v node &> /dev/null; then
        print_success "Node.js found: $(node --version)"
    else
        print_warning "Node.js not found. Some applications may require it."
    fi

    # Check Git
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    print_success "Git found: $(git --version)"
}

# Setup environment files
setup_environment() {
    print_status "Setting up environment files..."

    # Create environment file for realtime sync server
    if [ ! -f "docker-deployments/realtime-sync-server/.env" ]; then
        cat > docker-deployments/realtime-sync-server/.env << EOF
NODE_ENV=production
PORT=3000
REDIS_URL=redis://redis:6379
JWT_SECRET=$(openssl rand -base64 32)
DB_PATH=./data/sync.db
CORS_ORIGIN=https://your-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
        print_success "Created environment file for realtime sync server"
    else
        print_warning "Environment file already exists for realtime sync server"
    fi

    # Create environment file for streaming platform
    if [ ! -f "docker-deployments/gimp-streaming-platform/.env" ]; then
        cat > docker-deployments/gimp-streaming-platform/.env << EOF
NODE_ENV=production
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=gimpuser
POSTGRES_PASSWORD=$(openssl rand -base64 16)
POSTGRES_DB=gimpstream
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=$(openssl rand -base64 32)
STORAGE_PATH=/app/storage
BILLING_WEBHOOK_SECRET=$(openssl rand -base64 32)
EOF
        print_success "Created environment file for streaming platform"
    else
        print_warning "Environment file already exists for streaming platform"
    fi
}

# Setup directories and permissions
setup_directories() {
    print_status "Setting up directories and permissions..."

    # Create necessary directories
    mkdir -p docker-data/{nginx,postgres,redis,uploads}
    mkdir -p logs/{nginx,app,docker}
    mkdir -p backups/{database,files,config}

    # Set appropriate permissions
    $USE_SUDO chown -R $USER:$USER docker-data logs backups 2>/dev/null || true
    chmod 755 docker-data logs backups

    print_success "Created and configured directories"
}

# Setup SSL certificates (self-signed for development)
setup_ssl() {
    print_status "Setting up SSL certificates..."

    # Create SSL directory
    mkdir -p docker-data/ssl

    # Generate self-signed certificate for development
    if [ ! -f "docker-data/ssl/cert.pem" ]; then
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout docker-data/ssl/key.pem \
            -out docker-data/ssl/cert.pem \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost" \
            2>/dev/null || {
            print_warning "Could not generate SSL certificate. You may need openssl."
        }
        if [ -f "docker-data/ssl/cert.pem" ]; then
            print_success "Generated self-signed SSL certificate"
        fi
    else
        print_warning "SSL certificate already exists"
    fi
}

# Setup monitoring and logging
setup_monitoring() {
    print_status "Setting up monitoring and logging..."

    # Create log rotation configuration
    if [ -d "/etc/logrotate.d" ] && [ -w "/etc/logrotate.d" ]; then
        $USE_SUDO tee /etc/logrotate.d/linux-web-serving > /dev/null << EOF
$(pwd)/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
}
EOF
        print_success "Configured log rotation"
    else
        print_warning "Could not configure log rotation (insufficient permissions)"
    fi
}

# Build Docker images
build_images() {
    print_status "Building Docker images..."

    # Build realtime sync server
    if [ -f "docker-deployments/realtime-sync-server/Dockerfile" ]; then
        cd docker-deployments/realtime-sync-server
        docker build -t linux-web-serving/sync-server .
        cd ../../..
        print_success "Built sync server image"
    fi

    # Build streaming platform (if Dockerfiles exist)
    if [ -d "docker-deployments/gimp-streaming-platform" ]; then
        for dockerfile in docker-deployments/gimp-streaming-platform/*/Dockerfile; do
            if [ -f "$dockerfile" ]; then
                service_name=$(basename $(dirname "$dockerfile"))
                cd docker-deployments/gimp-streaming-platform/$service_name
                docker build -t linux-web-serving/$service_name .
                cd ../../..
                print_success "Built $service_name image"
            fi
        done
    fi
}

# Setup systemd services (optional)
setup_systemd() {
    if [ -d "/etc/systemd/system" ] && [ -w "/etc/systemd/system" ]; then
        print_status "Setting up systemd services..."

        # Create systemd service for web serving infrastructure
        $USE_SUDO tee /etc/systemd/system/linux-web-serving.service > /dev/null << EOF
[Unit]
Description=Linux Web Serving Infrastructure
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/docker-compose -f docker-deployments/realtime-sync-server/docker-compose.yml up -d
ExecStop=/usr/bin/docker-compose -f docker-deployments/realtime-sync-server/docker-compose.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

        $USE_SUDO systemctl daemon-reload
        $USE_SUDO systemctl enable linux-web-serving.service
        print_success "Created systemd service"
        print_info "Enable with: sudo systemctl start linux-web-serving"
    else
        print_warning "Could not create systemd services (insufficient permissions)"
    fi
}

# Run health checks
run_health_checks() {
    print_status "Running health checks..."

    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi

    # Test Docker Compose configuration
    if [ -f "docker-deployments/realtime-sync-server/docker-compose.yml" ]; then
        cd docker-deployments/realtime-sync-server
        if docker-compose config > /dev/null 2>&1; then
            print_success "Docker Compose configuration is valid"
        else
            print_error "Docker Compose configuration has errors"
            cd ../../..
            exit 1
        fi
        cd ../../..
    fi

    print_success "Health checks passed"
}

# Display next steps
show_next_steps() {
    print_success "Setup completed successfully!"
    echo
    echo -e "${BLUE}Next Steps:${NC}"
    echo "1. Configure your domain name in server configurations"
    echo "2. Update environment variables with your settings"
    echo "3. Start the infrastructure:"
    echo "   cd docker-deployments/realtime-sync-server"
    echo "   docker-compose up -d"
    echo
    echo -e "${BLUE}Useful Commands:${NC}"
    echo "- View logs: docker-compose logs -f"
    echo "- Stop services: docker-compose down"
    echo "- Restart services: docker-compose restart"
    echo "- Check status: docker-compose ps"
    echo
    echo -e "${BLUE}Documentation:${NC}"
    echo "- Read the README.md for detailed information"
    echo "- Check documentation/ directory for guides"
    echo
    echo -e "${BLUE}Default URLs (after starting):${NC}"
    echo "- Sync Server: http://localhost:3000"
    echo "- Nginx Proxy: http://localhost:80"
    echo "- Redis: localhost:6379"
}

# Main execution
main() {
    print_status "Starting Linux Web Serving Infrastructure setup..."
    echo

    check_root
    check_prerequisites
    setup_environment
    setup_directories
    setup_ssl
    setup_monitoring
    build_images
    setup_systemd
    run_health_checks
    show_next_steps
}

# Handle script interruption
trap 'print_error "Setup interrupted. Please run the script again to complete setup."' INT

# Run main function
main "$@"