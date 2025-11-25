#!/bin/bash

# Automated Backup Script for Development Environment
# Backs up code repositories, configurations, and important data

BACKUP_DIR="/home/seanos1a/backups"
DATE=$(date '+%Y-%m-%d_%H-%M-%S')
BACKUP_LOG="$BACKUP_DIR/backup.log"

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$BACKUP_LOG"
}

# Function to create backup directory
setup_backup_dir() {
    BACKUP_PATH="$BACKUP_DIR/$DATE"
    mkdir -p "$BACKUP_PATH"
    log "Created backup directory: $BACKUP_PATH"
}

# Function to backup code repositories
backup_repositories() {
    log "Starting repository backup..."

    # List of repositories to backup
    REPOS=(
        "/home/seanos1a/ecommerce-dash"
        "/home/seanos1a/global-news-ai"
        "/home/seanos1a/gemini-assistant"
        "/home/seanos1a/portfolio-hub"
        "/home/seanos1a/sean-s-landing-page"
        "/home/seanos1a/h2h"
        "/home/seanos1a/yahtzee"
    )

    for repo in "${REPOS[@]}"; do
        if [[ -d "$repo" ]]; then
            repo_name=$(basename "$repo")
            log "Backing up $repo_name..."

            # Create tarball of repository
            tar -czf "$BACKUP_PATH/${repo_name}_${DATE}.tar.gz" \
                -C "$(dirname "$repo")" \
                "$(basename "$repo")" \
                --exclude=node_modules \
                --exclude=.next \
                --exclude=dist \
                --exclude=build \
                --exclude=coverage \
                --exclude=.git/objects/pack/*.pack

            if [[ $? -eq 0 ]]; then
                log "✅ Successfully backed up $repo_name"
            else
                log "❌ Failed to backup $repo_name"
            fi
        else
            log "⚠️ Repository not found: $repo"
        fi
    done
}

# Function to backup configurations
backup_configurations() {
    log "Starting configuration backup..."

    CONFIGS=(
        "/home/seanos1a/.bashrc"
        "/home/seanos1a/.ai-keys.env"
        "/home/seanos1a/ecosystem.config.js"
        "/home/seanos1a/CLAUDE.md"
        "/home/seanos1a/AI_MODEL_INTEGRATION_GUIDE.md"
        "/home/seanos1a/IMPLEMENTATION_COMPLETE.md"
        "/home/seanos1a/monitoring"
        "/home/seanos1a/bin"
    )

    mkdir -p "$BACKUP_PATH/configs"

    for config in "${CONFIGS[@]}"; do
        if [[ -e "$config" ]]; then
            config_name=$(basename "$config")
            log "Backing up configuration: $config_name"

            if [[ -d "$config" ]]; then
                tar -czf "$BACKUP_PATH/configs/${config_name}_${DATE}.tar.gz" -C "$(dirname "$config")" "$(basename "$config")"
            else
                cp "$config" "$BACKUP_PATH/configs/"
            fi

            if [[ $? -eq 0 ]]; then
                log "✅ Successfully backed up $config_name"
            else
                log "❌ Failed to backup $config_name"
            fi
        else
            log "⚠️ Configuration not found: $config"
        fi
    done
}

# Function to backup PM2 configuration and logs
backup_pm2() {
    log "Backing up PM2 configuration and logs..."

    mkdir -p "$BACKUP_PATH/pm2"

    # Backup PM2 ecosystem file
    if [[ -f "/home/seanos1a/ecosystem.config.js" ]]; then
        cp "/home/seanos1a/ecosystem.config.js" "$BACKUP_PATH/pm2/"
        log "✅ Backed up PM2 ecosystem configuration"
    fi

    # Backup PM2 logs
    if [[ -d "/var/log/pm2" ]]; then
        tar -czf "$BACKUP_PATH/pm2/logs_${DATE}.tar.gz" -C /var/log pm2/
        log "✅ Backed up PM2 logs"
    fi

    # Export PM2 process list
    if command -v pm2 &> /dev/null; then
        pm2 save
        pm2 list > "$BACKUP_PATH/pm2/process_list_${DATE}.txt"
        log "✅ Exported PM2 process list"
    fi
}

# Function to backup databases (if any)
backup_databases() {
    log "Checking for databases to backup..."

    # MongoDB backup (if running)
    if pgrep -x "mongod" > /dev/null; then
        log "MongoDB detected, creating backup..."
        mkdir -p "$BACKUP_PATH/databases"

        # List all databases
        mongosh --eval "db.adminCommand('listCollections')" --quiet 2>/dev/null | while read -r db; do
            mongodump --db "$db" --out "$BACKUP_PATH/databases/mongodb_$DATE" 2>/dev/null
            if [[ $? -eq 0 ]]; then
                log "✅ Backed up MongoDB database: $db"
            else
                log "❌ Failed to backup MongoDB database: $db"
            fi
        done
    fi

    # PostgreSQL backup (if running)
    if pgrep -x "postgres" > /dev/null; then
        log "PostgreSQL detected, creating backup..."
        mkdir -p "$BACKUP_PATH/databases"

        # List all databases
        sudo -u postgres psql -t -c "SELECT datname FROM pg_database WHERE datistemplate = false;" 2>/dev/null | while read -r db; do
            db=$(echo "$db" | xargs)  # Trim whitespace
            if [[ -n "$db" ]]; then
                sudo -u postgres pg_dump "$db" > "$BACKUP_PATH/databases/postgres_${db}_${DATE}.sql"
                if [[ $? -eq 0 ]]; then
                    log "✅ Backed up PostgreSQL database: $db"
                else
                    log "❌ Failed to backup PostgreSQL database: $db"
                fi
            fi
        done
    fi

    # SQLite databases (common in development)
    find /home/seanos1a -name "*.db" -o -name "*.sqlite" -o -name "*.sqlite3" 2>/dev/null | while read -r db_file; do
        if [[ -f "$db_file" ]]; then
            db_name=$(basename "$db_file")
            mkdir -p "$BACKUP_PATH/databases/sqlite"
            cp "$db_file" "$BACKUP_PATH/databases/sqlite/"
            log "✅ Backed up SQLite database: $db_name"
        fi
    done
}

# Function to create backup metadata
create_metadata() {
    log "Creating backup metadata..."

    cat > "$BACKUP_PATH/metadata.json" << EOF
{
    "backup_date": "$(date -Iseconds)",
    "hostname": "$(hostname)",
    "user": "$(whoami)",
    "disk_usage": "$(df -h / | awk 'NR==2 {print $5}')",
    "memory_info": "$(free -h | grep Mem)",
    "load_average": "$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')",
    "pm2_status": "$(pm2 list 2>/dev/null | grep -E 'online|stopped' | wc -l) processes",
    "backup_type": "automated",
    "backup_version": "1.0"
}
EOF

    log "✅ Created backup metadata"
}

# Function to cleanup old backups
cleanup_old_backups() {
    log "Starting cleanup of old backups..."

    # Keep last 7 days of daily backups
    find "$BACKUP_DIR" -maxdepth 1 -type d -name "20*" -mtime +7 -exec rm -rf {} \; 2>/dev/null

    # Keep last 4 weeks of weekly backups (created on Sundays)
    find "$BACKUP_DIR" -maxdepth 1 -type d -name "*Sun*" -mtime +28 -exec rm -rf {} \; 2>/dev/null

    # Compress backups older than 1 day
    find "$BACKUP_DIR" -maxdepth 2 -name "*.tar.gz" -mtime +1 -exec gzip {} \; 2>/dev/null

    log "✅ Cleanup completed"
}

# Function to create backup summary
create_summary() {
    BACKUP_SIZE=$(du -sh "$BACKUP_PATH" | cut -f1)
    FILE_COUNT=$(find "$BACKUP_PATH" -type f | wc -l)

    log "=== BACKUP SUMMARY ==="
    log "Backup Path: $BACKUP_PATH"
    log "Total Size: $BACKUP_SIZE"
    log "Files Backed Up: $FILE_COUNT"
    log "Backup Completed Successfully!"

    # Send notification if webhook is configured
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"✅ Backup completed successfully!\\nSize: $BACKUP_SIZE\\nFiles: $FILE_COUNT\"}" \
            "$SLACK_WEBHOOK_URL" 2>/dev/null
    fi
}

# Main execution
main() {
    log "=== STARTING AUTOMATED BACKUP ==="

    setup_backup_dir
    backup_repositories
    backup_configurations
    backup_pm2
    backup_databases
    create_metadata
    cleanup_old_backups
    create_summary

    log "=== BACKUP COMPLETED ==="
}

# Error handling
set -e
trap 'log "❌ Backup failed with error on line $LINENO"' ERR

# Run main function
main