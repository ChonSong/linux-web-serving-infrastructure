#!/bin/bash

# Universal Deployment Script
# Supports multiple projects and deployment environments

set -e  # Exit on any error

# Configuration
PROJECT_NAME=""
ENVIRONMENT=""
BACKUP_BEFORE_DEPLOY=true
HEALTH_CHECK_TIMEOUT=30
ROLLBACK_ON_FAILURE=true

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to log messages
log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] ${BLUE}$1${NC}"
}

log_success() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] ${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] ${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] ${RED}❌ $1${NC}"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 --project <project_name> --env <environment> [options]"
    echo ""
    echo "Required arguments:"
    echo "  --project <name>     Project name (ecommerce-dash, global-news-ai, etc.)"
    echo "  --env <env>          Environment (staging, production)"
    echo ""
    echo "Optional arguments:"
    echo "  --no-backup          Skip backup before deployment"
    echo "  --no-rollback        Don't rollback on failure"
    echo "  --timeout <seconds>  Health check timeout (default: 30)"
    echo "  --branch <name>      Git branch to deploy (default: main for prod, develop for staging)"
    echo ""
    echo "Examples:"
    echo "  $0 --project ecommerce-dash --env production"
    echo "  $0 --project global-news-ai --env staging --branch feature/new-api"
    exit 1
}

# Function to parse command line arguments
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --project)
                PROJECT_NAME="$2"
                shift 2
                ;;
            --env)
                ENVIRONMENT="$2"
                shift 2
                ;;
            --no-backup)
                BACKUP_BEFORE_DEPLOY=false
                shift
                ;;
            --no-rollback)
                ROLLBACK_ON_FAILURE=false
                shift
                ;;
            --timeout)
                HEALTH_CHECK_TIMEOUT="$2"
                shift 2
                ;;
            --branch)
                DEPLOY_BRANCH="$2"
                shift 2
                ;;
            -h|--help)
                show_usage
                ;;
            *)
                log_error "Unknown argument: $1"
                show_usage
                ;;
        esac
    done

    # Set default branch based on environment
    if [[ -z "$DEPLOY_BRANCH" ]]; then
        if [[ "$ENVIRONMENT" == "production" ]]; then
            DEPLOY_BRANCH="main"
        else
            DEPLOY_BRANCH="develop"
        fi
    fi

    # Validate required arguments
    if [[ -z "$PROJECT_NAME" ]] || [[ -z "$ENVIRONMENT" ]]; then
        log_error "Missing required arguments"
        show_usage
    fi
}

# Function to validate project exists
validate_project() {
    local project_path="/home/seanos1a/$PROJECT_NAME"

    if [[ ! -d "$project_path" ]]; then
        log_error "Project not found: $PROJECT_NAME"
        exit 1
    fi

    if [[ ! -f "$project_path/package.json" ]]; then
        log_error "Project package.json not found: $PROJECT_NAME"
        exit 1
    fi
}

# Function to validate environment
validate_environment() {
    if [[ ! "$ENVIRONMENT" =~ ^(staging|production)$ ]]; then
        log_error "Invalid environment: $ENVIRONMENT. Must be 'staging' or 'production'"
        exit 1
    fi
}

# Function to get project port
get_project_port() {
    case $PROJECT_NAME in
        "ecommerce-dash")
            echo "3001"
            ;;
        "global-news-ai")
            echo "3002"
            ;;
        "gemini-assistant")
            echo "5173"
            ;;
        "sean-landing")
            echo "3003"
            ;;
        *)
            log_error "Unknown project: $PROJECT_NAME"
            exit 1
            ;;
    esac
}

# Function to backup current deployment
backup_deployment() {
    if [[ "$BACKUP_BEFORE_DEPLOY" == "true" ]]; then
        log "Creating backup before deployment..."

        if [[ -f "/home/seanos1a/backup/create-backup.sh" ]]; then
            /home/seanos1a/backup/create-backup.sh
            log_success "Backup completed"
        else
            log_warning "Backup script not found, skipping backup"
        fi
    fi
}

# Function to deploy project
deploy_project() {
    local project_path="/home/seanos1a/$PROJECT_NAME"

    log "Deploying $PROJECT_NAME to $ENVIRONMENT (branch: $DEPLOY_BRANCH)..."

    cd "$project_path"

    # Stash any local changes
    if [[ -n "$(git status --porcelain)" ]]; then
        log "Stashing local changes..."
        git stash push -m "Deployment stash $(date)"
    fi

    # Pull latest code
    log "Fetching latest code..."
    git fetch origin
    git checkout "$DEPLOY_BRANCH"
    git pull origin "$DEPLOY_BRANCH"

    # Install dependencies
    log "Installing dependencies..."
    npm ci --production

    # Build project
    log "Building project..."
    npm run build

    # Restart application with PM2
    log "Restarting application..."
    pm2 restart "$PROJECT_NAME" || pm2 start "/home/seanos1a/ecosystem.config.js"

    log_success "Deployment completed"
}

# Function to perform health check
health_check() {
    local port=$(get_project_port)
    local url="http://localhost:$port"
    local max_attempts=$((HEALTH_CHECK_TIMEOUT / 5))
    local attempt=1

    log "Performing health check..."

    while [[ $attempt -le $max_attempts ]]; do
        if curl -f -s "$url/health" > /dev/null 2>&1 || curl -f -s "$url" > /dev/null 2>&1; then
            log_success "Health check passed"
            return 0
        fi

        log_warning "Health check attempt $attempt/$max_attempts failed"
        sleep 5
        ((attempt++))
    done

    log_error "Health check failed after $HEALTH_CHECK_TIMEOUT seconds"
    return 1
}

# Function to rollback deployment
rollback_deployment() {
    if [[ "$ROLLBACK_ON_FAILURE" == "true" ]]; then
        log_error "Deployment failed, initiating rollback..."

        # Get latest backup
        latest_backup=$(find /home/seanos1a/backups -maxdepth 1 -type d -name "20*" | sort | tail -n 1)

        if [[ -n "$latest_backup" ]]; then
            backup_name=$(basename "$latest_backup")
            log "Rolling back to backup: $backup_name"

            /home/seanos1a/backup/restore-backup.sh "$backup_name"
            log_success "Rollback completed"
        else
            log_error "No backup found for rollback"
        fi
    else
        log_error "Deployment failed, rollback disabled"
    fi
}

# Function to show deployment summary
show_summary() {
    local port=$(get_project_port)

    log_success "=== DEPLOYMENT SUMMARY ==="
    log_success "Project: $PROJECT_NAME"
    log_success "Environment: $ENVIRONMENT"
    log_success "Branch: $DEPLOY_BRANCH"
    log_success "Port: $port"
    log_success "URL: http://localhost:$port"
    log_success "Deployed at: $(date)"
    echo ""
    log "To monitor the application:"
    log "  pm2 logs $PROJECT_NAME"
    log "  pm2 monit"
    echo ""
    log "To check application status:"
    log "  curl http://localhost:$port/health"
}

# Main deployment function
main() {
    log "=== STARTING DEPLOYMENT ==="
    log "Project: $PROJECT_NAME"
    log "Environment: $ENVIRONMENT"
    log "Branch: $DEPLOY_BRANCH"
    echo ""

    # Validate inputs
    validate_project
    validate_environment

    # Backup current deployment
    backup_deployment

    # Deploy project
    deploy_project

    # Health check
    if health_check; then
        show_summary
        log_success "=== DEPLOYMENT COMPLETED SUCCESSFULLY ==="
    else
        rollback_deployment
        log_error "=== DEPLOYMENT FAILED ==="
        exit 1
    fi
}

# Parse arguments
parse_arguments "$@"

# Run main function
main