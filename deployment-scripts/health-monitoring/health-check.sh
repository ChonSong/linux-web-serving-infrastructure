#!/bin/bash

# Health Check Script for Development Environment
# Monitors applications, system resources, and services

LOG_FILE="/var/log/apps/health-check.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Function to log messages
log() {
    echo "[$DATE] $1" >> "$LOG_FILE"
    echo "[$DATE] $1"
}

# Function to check PM2 applications
check_pm2_apps() {
    log "=== PM2 Application Health Check ==="

    if ! command -v pm2 &> /dev/null; then
        log "ERROR: PM2 is not installed"
        return 1
    fi

    # Get PM2 status
    pm2 status | while read -r line; do
        if [[ $line =~ "online" ]]; then
            app_name=$(echo "$line" | awk '{print $2}')
            log "✅ $app_name: ONLINE"
        elif [[ $line =~ "stopped" ]]; then
            app_name=$(echo "$line" | awk '{print $2}')
            log "❌ $app_name: STOPPED"
        fi
    done
}

# Function to check system resources
check_system_resources() {
    log "=== System Resource Check ==="

    # CPU usage
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
    log "CPU Usage: ${CPU_USAGE}%"

    # Memory usage
    MEMORY_INFO=$(free -m | grep Mem)
    TOTAL_MEM=$(echo $MEMORY_INFO | awk '{print $2}')
    USED_MEM=$(echo $MEMORY_INFO | awk '{print $3}')
    MEMORY_PERCENT=$((USED_MEM * 100 / TOTAL_MEM))
    log "Memory Usage: ${MEMORY_PERCENT}% (${USED_MEM}MB/${TOTAL_MEM}MB)"

    # Disk usage
    DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    log "Disk Usage: ${DISK_USAGE}%"

    # Load average
    LOAD_AVG=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
    log "Load Average: $LOAD_AVG"
}

# Function to check network services
check_network_services() {
    log "=== Network Services Check ==="

    # Check if Nginx is running
    if pgrep -x "nginx" > /dev/null; then
        log "✅ Nginx: RUNNING"
    else
        log "❌ Nginx: NOT RUNNING"
    fi

    # Check PM2 API if available
    if curl -s http://localhost:3001 > /dev/null 2>&1; then
        log "✅ E-commerce Dashboard: ACCESSIBLE"
    else
        log "❌ E-commerce Dashboard: NOT ACCESSIBLE"
    fi

    if curl -s http://localhost:3002 > /dev/null 2>&1; then
        log "✅ Global News AI: ACCESSIBLE"
    else
        log "❌ Global News AI: NOT ACCESSIBLE"
    fi

  }

# Function to check log files
check_log_files() {
    log "=== Log File Check ==="

    # Check if log files exist and their sizes
    if [[ -f /var/log/pm2/pm2.log ]]; then
        PM2_LOG_SIZE=$(du -h /var/log/pm2/pm2.log | cut -f1)
        log "PM2 Log Size: $PM2_LOG_SIZE"
    fi

    # Check for large log files that might need rotation
    find /var/log/apps -name "*.log" -size +100M 2>/dev/null | while read -r file; do
        log "⚠️  Large log file detected: $file"
    done
}

# Function to generate summary report
generate_summary() {
    log "=== Health Check Summary ==="
    log "Health check completed at $DATE"

    # Send to monitoring system if configured
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"Health Check Completed for Development Environment\"}" \
            "$SLACK_WEBHOOK_URL" 2>/dev/null
    fi
}

# Main execution
main() {
    log "Starting health check..."
    check_pm2_apps
    check_system_resources
    check_network_services
    check_log_files
    generate_summary
    log "Health check completed."
}

# Run main function
main