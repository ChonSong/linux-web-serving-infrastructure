#!/bin/bash

# Monitoring Dashboard - Real-time system overview
# Provides a comprehensive view of the development environment

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored status
print_status() {
    local status=$1
    local message=$2

    case $status in
        "OK")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "WARN")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "ERROR")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  $message${NC}"
            ;;
    esac
}

# Function to show header
show_header() {
    clear
    echo -e "${BLUE}===================================${NC}"
    echo -e "${BLUE}   DEVELOPMENT MONITORING DASHBOARD${NC}"
    echo -e "${BLUE}===================================${NC}"
    echo -e "${BLUE}Updated: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
    echo ""
}

# Function to show PM2 status
show_pm2_status() {
    echo -e "${BLUE}🚀 PM2 APPLICATIONS${NC}"
    echo "----------------------------------------"

    if ! command -v pm2 &> /dev/null; then
        print_status "ERROR" "PM2 is not installed"
        return
    fi

    # Parse PM2 status
    pm2 jlist | jq -r '.[] | "\(.name): \(.pm2_env.status) (CPU: \(.monit.cpu | floor)%, Memory: \(.monit.memory/1024/1024 | floor)MB)"' 2>/dev/null | while read -r line; do
        if [[ $line == *"online"* ]]; then
            print_status "OK" "$line"
        else
            print_status "ERROR" "$line"
        fi
    done
    echo ""
}

# Function to show system resources
show_system_resources() {
    echo -e "${BLUE}💻 SYSTEM RESOURCES${NC}"
    echo "----------------------------------------"

    # CPU usage
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
    if (( $(echo "$CPU_USAGE > 80" | bc -l) )); then
        print_status "WARN" "CPU Usage: ${CPU_USAGE}%"
    elif (( $(echo "$CPU_USAGE > 90" | bc -l) )); then
        print_status "ERROR" "CPU Usage: ${CPU_USAGE}%"
    else
        print_status "OK" "CPU Usage: ${CPU_USAGE}%"
    fi

    # Memory usage
    MEMORY_INFO=$(free -m | grep Mem)
    TOTAL_MEM=$(echo $MEMORY_INFO | awk '{print $2}')
    USED_MEM=$(echo $MEMORY_INFO | awk '{print $3}')
    MEMORY_PERCENT=$((USED_MEM * 100 / TOTAL_MEM))

    if (( MEMORY_PERCENT > 80 )); then
        print_status "WARN" "Memory Usage: ${MEMORY_PERCENT}% (${USED_MEM}MB/${TOTAL_MEM}MB)"
    elif (( MEMORY_PERCENT > 90 )); then
        print_status "ERROR" "Memory Usage: ${MEMORY_PERCENT}% (${USED_MEM}MB/${TOTAL_MEM}MB)"
    else
        print_status "OK" "Memory Usage: ${MEMORY_PERCENT}% (${USED_MEM}MB/${TOTAL_MEM}MB)"
    fi

    # Disk usage
    DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    if (( DISK_USAGE > 80 )); then
        print_status "WARN" "Disk Usage: ${DISK_USAGE}%"
    elif (( DISK_USAGE > 90 )); then
        print_status "ERROR" "Disk Usage: ${DISK_USAGE}%"
    else
        print_status "OK" "Disk Usage: ${DISK_USAGE}%"
    fi

    # Load average
    LOAD_AVG=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
    print_status "INFO" "Load Average: $LOAD_AVG"
    echo ""
}

# Function to show network services
show_network_services() {
    echo -e "${BLUE}🌐 NETWORK SERVICES${NC}"
    echo "----------------------------------------"

    # Check Caddy
    if pgrep -x "caddy" > /dev/null; then
        print_status "OK" "Caddy Web Server"
    else
        print_status "ERROR" "Caddy Web Server"
    fi

    # Check application ports
    declare -A ports=(
        ["3001"]="E-commerce Dashboard"
        ["3002"]="Global News AI"
        ["5173"]="Gemini Assistant"
        ["8080"]="code-server"
        ["8081"]="code-server Mobile"
    )

    for port in "${!ports[@]}"; do
        if netstat -tuln 2>/dev/null | grep -q ":$port "; then
            print_status "OK" "${ports[$port]} (Port $port)"
        else
            print_status "WARN" "${ports[$port]} (Port $port) - Not listening"
        fi
    done
    echo ""
}

# Function to show recent errors
show_recent_errors() {
    echo -e "${BLUE}📋 RECENT SYSTEM ACTIVITY${NC}"
    echo "----------------------------------------"

    # PM2 logs (last 5 errors if any)
    if [[ -f /var/log/pm2/pm2.log ]]; then
        ERROR_COUNT=$(grep -c "ERROR\|FATAL" /var/log/pm2/pm2.log 2>/dev/null || echo "0")
        if (( ERROR_COUNT > 0 )); then
            print_status "WARN" "PM2: $ERROR_COUNT errors in logs"
        else
            print_status "OK" "PM2: No recent errors"
        fi
    fi

    # System journal errors
    SYS_ERRORS=$(journalctl --since "1 hour ago" -p err --no-pager -q | wc -l)
    if (( SYS_ERRORS > 0 )); then
        print_status "WARN" "System: $SYS_ERRORS errors in last hour"
    else
        print_status "OK" "System: No recent errors"
    fi

    # Large log files warning
    LARGE_LOGS=$(find /var/log/apps -name "*.log" -size +50M 2>/dev/null | wc -l)
    if (( LARGE_LOGS > 0 )); then
        print_status "WARN" "$LARGE_LOGS large log files detected"
    fi
    echo ""
}

# Function to show quick actions
show_quick_actions() {
    echo -e "${BLUE}⚡ QUICK ACTIONS${NC}"
    echo "----------------------------------------"
    echo "1. [H] Run full health check"
    echo "2. [R] Restart all PM2 apps"
    echo "3. [L] View PM2 logs"
    echo "4. [T] Run application tests"
    echo "5. [Q] Quit"
    echo ""
    echo -n "Choose an action: "
}

# Function to handle actions
handle_action() {
    local choice=$1

    case $choice in
        "H"|"h")
            echo "Running health check..."
            /home/seanos1a/monitoring/health-check.sh
            echo "Press Enter to continue..."
            read -r
            ;;
        "R"|"r")
            echo "Restarting PM2 applications..."
            pm2 restart all
            echo "Press Enter to continue..."
            read -r
            ;;
        "L"|"l")
            echo "PM2 Logs (last 20 lines):"
            pm2 logs --lines 20 --nostream
            echo "Press Enter to continue..."
            read -r
            ;;
        "T"|"t")
            echo "Running tests..."
            /home/seanos1a/ecommerce-dash/npm test 2>/dev/null || echo "Tests not available"
            echo "Press Enter to continue..."
            read -r
            ;;
        "Q"|"q")
            exit 0
            ;;
    esac
}

# Main loop
main() {
    while true; do
        show_header
        show_pm2_status
        show_system_resources
        show_network_services
        show_recent_errors
        show_quick_actions

        read -n 1 -r choice
        echo ""  # New line after input
        handle_action "$choice"
    done
}

# Check dependencies
if ! command -v jq &> /dev/null; then
    echo "Installing jq for better JSON parsing..."
    sudo apt-get update && sudo apt-get install -y jq
fi

# Run main function
main