#!/bin/bash

# Restore Backup Script for Development Environment
# Restores code repositories, configurations, and data from backups

if [[ $# -eq 0 ]]; then
    echo "Usage: $0 <backup_date>"
    echo "Example: $0 2024-01-15_14-30-00"
    echo ""
    echo "Available backups:"
    ls -1 /home/seanos1a/backups/ | grep "20"
    exit 1
fi

BACKUP_DATE=$1
BACKUP_PATH="/home/seanos1a/backups/$BACKUP_DATE"

if [[ ! -d "$BACKUP_PATH" ]]; then
    echo "Error: Backup not found: $BACKUP_PATH"
    exit 1
fi

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to restore repositories
restore_repositories() {
    log "Restoring repositories..."

    if [[ -d "$BACKUP_PATH" ]]; then
        # Find all repository tarballs
        for tarball in "$BACKUP_PATH"/*.tar.gz; do
            if [[ -f "$tarball" ]]; then
                repo_name=$(basename "$tarball" | sed "s/_${BACKUP_DATE}.tar.gz//")
                log "Restoring repository: $repo_name"

                # Extract to original location
                tar -xzf "$tarball" -C "/home/seanos1a/"

                if [[ $? -eq 0 ]]; then
                    log "✅ Successfully restored $repo_name"
                else
                    log "❌ Failed to restore $repo_name"
                fi
            fi
        done
    fi
}

# Function to restore configurations
restore_configurations() {
    log "Restoring configurations..."

    if [[ -d "$BACKUP_PATH/configs" ]]; then
        # Backup current configs first
        mkdir -p "/home/seanos1a/backups/pre-restore-$(date '+%Y-%m-%d_%H-%M-%S')"
        cp -r /home/seanos1a/.bashrc /home/seanos1a/.ai-keys.env "/home/seanos1a/backups/pre-restore-$(date '+%Y-%m-%d_%H-%M-%S')/" 2>/dev/null || true

        # Extract config tarballs
        for tarball in "$BACKUP_PATH/configs"/*.tar.gz; do
            if [[ -f "$tarball" ]]; then
                tar -xzf "$tarball" -C "/home/seanos1a/"
                log "✅ Restored configuration from $(basename "$tarball")"
            fi
        done

        # Copy individual config files
        for config_file in "$BACKUP_PATH/configs"/*; do
            if [[ -f "$config_file" ]]; then
                config_name=$(basename "$config_file")
                cp "$config_file" "/home/seanos1a/"
                log "✅ Restored configuration: $config_name"
            fi
        done
    fi
}

# Function to restore PM2 configuration
restore_pm2() {
    log "Restoring PM2 configuration..."

    if [[ -d "$BACKUP_PATH/pm2" ]]; then
        # Restore ecosystem configuration
        if [[ -f "$BACKUP_PATH/pm2/ecosystem.config.js" ]]; then
            cp "$BACKUP_PATH/pm2/ecosystem.config.js" "/home/seanos1a/"
            log "✅ Restored PM2 ecosystem configuration"
        fi

        # Restore PM2 logs if needed
        if [[ -f "$BACKUP_PATH/pm2/logs_${BACKUP_DATE}.tar.gz" ]]; then
            sudo tar -xzf "$BACKUP_PATH/pm2/logs_${BACKUP_DATE}.tar.gz" -C "/var/log/"
            log "✅ Restored PM2 logs"
        fi

        # Restart PM2 with restored configuration
        if [[ -f "/home/seanos1a/ecosystem.config.js" ]]; then
            pm2 kill
            pm2 start /home/seanos1a/ecosystem.config.js
            log "✅ Restarted PM2 with restored configuration"
        fi
    fi
}

# Function to restore databases
restore_databases() {
    log "Restoring databases..."

    if [[ -d "$BACKUP_PATH/databases" ]]; then
        # Restore MongoDB
        if [[ -d "$BACKUP_PATH/databases/mongodb_$BACKUP_DATE" ]]; then
            log "Restoring MongoDB databases..."
            mongorestore --drop "$BACKUP_PATH/databases/mongodb_$BACKUP_DATE"
            log "✅ Restored MongoDB databases"
        fi

        # Restore PostgreSQL
        for sql_file in "$BACKUP_PATH/databases"/postgres_*.sql; do
            if [[ -f "$sql_file" ]]; then
                db_name=$(basename "$sql_file" | sed "s/postgres_//" | sed "s/_${BACKUP_DATE}.sql//")
                log "Restoring PostgreSQL database: $db_name"
                sudo -u postgres psql "$db_name" < "$sql_file"
                log "✅ Restored PostgreSQL database: $db_name"
            fi
        done

        # Restore SQLite databases
        if [[ -d "$BACKUP_PATH/databases/sqlite" ]]; then
            cp -r "$BACKUP_PATH/databases/sqlite"/* /home/seanos1a/
            log "✅ Restored SQLite databases"
        fi
    fi
}

# Function to verify restore
verify_restore() {
    log "Verifying restore..."

    # Check if key directories exist
    if [[ -d "/home/seanos1a/ecommerce-dash" ]]; then
        log "✅ E-commerce dashboard restored"
    else
        log "⚠️ E-commerce dashboard not found"
    fi

    if [[ -d "/home/seanos1a/global-news-ai" ]]; then
        log "✅ Global News AI restored"
    else
        log "⚠️ Global News AI not found"
    fi

    if [[ -f "/home/seanos1a/.bashrc" ]]; then
        log "✅ Bash configuration restored"
    else
        log "⚠️ Bash configuration not found"
    fi

    # Check PM2 status
    if command -v pm2 &> /dev/null; then
        pm2_count=$(pm2 list | grep -E "online|stopped" | wc -l)
        log "✅ PM2 processes: $pm2_count"
    else
        log "⚠️ PM2 not available"
    fi

    log "=== RESTORE VERIFICATION COMPLETED ==="
}

# Warning and confirmation
echo "⚠️  WARNING: This will overwrite current files and configurations!"
echo "Backup to restore: $BACKUP_DATE"
echo "Backup path: $BACKUP_PATH"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [[ "$confirm" != "yes" ]]; then
    echo "Restore cancelled."
    exit 0
fi

# Main execution
main() {
    log "=== STARTING RESTORE FROM BACKUP: $BACKUP_DATE ==="

    restore_repositories
    restore_configurations
    restore_pm2
    restore_databases
    verify_restore

    log "=== RESTORE COMPLETED ==="
    echo ""
    echo "✅ Restore completed successfully!"
    echo "📝 Please review the logs above for any warnings or errors."
    echo "🔄 You may need to restart some services manually."
}

# Run main function
main