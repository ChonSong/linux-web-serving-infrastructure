#!/bin/bash

# Backup Management Utility
# Provides easy access to backup operations

BACKUP_DIR="/home/seanos1a/backups"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to show menu
show_menu() {
    clear
    echo -e "${BLUE}===================================${NC}"
    echo -e "${BLUE}     BACKUP MANAGEMENT UTILITY${NC}"
    echo -e "${BLUE}===================================${NC}"
    echo ""
    echo "1. [C] Create backup now"
    echo "2. [L] List available backups"
    echo "3. [R] Restore from backup"
    echo "4. [D] Delete old backups"
    echo "5. [S] Show backup statistics"
    echo "6. [T] Test backup integrity"
    echo "7. [Q] Quit"
    echo ""
    echo -n "Choose an option: "
}

# Function to create backup
create_backup() {
    echo -e "${BLUE}Creating backup...${NC}"
    /home/seanos1a/backup/create-backup.sh
    echo -e "${GREEN}Backup completed!${NC}"
    echo "Press Enter to continue..."
    read -r
}

# Function to list backups
list_backups() {
    echo -e "${BLUE}Available Backups:${NC}"
    echo "========================================"

    if [[ ! -d "$BACKUP_DIR" ]] || [[ -z "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]]; then
        echo -e "${YELLOW}No backups found.${NC}"
        echo ""
        echo "Press Enter to continue..."
        read -r
        return
    fi

    for backup_dir in "$BACKUP_DIR"/*/; do
        if [[ -d "$backup_dir" ]]; then
            backup_name=$(basename "$backup_dir")
            backup_size=$(du -sh "$backup_dir" 2>/dev/null | cut -f1)
            backup_date=$(echo "$backup_name" | sed 's/_/ /' | sed 's/-/:/g')

            # Check if backup has metadata
            if [[ -f "$backup_dir/metadata.json" ]]; then
                backup_type=$(grep -o '"backup_type": "[^"]*"' "$backup_dir/metadata.json" | cut -d'"' -f4)
                echo -e "${GREEN}📦 $backup_name${NC} (${backup_size}) - Type: $backup_type"
            else
                echo -e "${GREEN}📦 $backup_name${NC} (${backup_size})"
            fi
        fi
    done

    echo ""
    echo "Total backups: $(find "$BACKUP_DIR" -maxdepth 1 -type d -name "20*" | wc -l)"
    echo "Total size: $(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)"
    echo ""
    echo "Press Enter to continue..."
    read -r
}

# Function to restore backup
restore_backup() {
    echo -e "${BLUE}Restore from Backup${NC}"
    echo "========================================"

    if [[ ! -d "$BACKUP_DIR" ]] || [[ -z "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]]; then
        echo -e "${YELLOW}No backups found.${NC}"
        echo "Press Enter to continue..."
        read -r
        return
    fi

    # List available backups with numbers
    local backup_list=()
    local count=0

    for backup_dir in "$BACKUP_DIR"/*/; do
        if [[ -d "$backup_dir" ]]; then
            backup_name=$(basename "$backup_dir")
            backup_size=$(du -sh "$backup_dir" 2>/dev/null | cut -f1)
            count=$((count + 1))
            backup_list+=("$backup_name")

            echo "$count. $backup_name (${backup_size})"
        fi
    done

    echo ""
    echo -n "Enter backup number to restore (0 to cancel): "
    read -r choice

    if [[ "$choice" == "0" ]]; then
        return
    fi

    if [[ "$choice" =~ ^[0-9]+$ ]] && [[ $choice -ge 1 ]] && [[ $choice -le $count ]]; then
        selected_backup="${backup_list[$((choice - 1))]}"
        echo ""
        echo -e "${YELLOW}You selected: $selected_backup${NC}"
        echo -e "${RED}⚠️  WARNING: This will overwrite current files!${NC}"
        echo ""
        read -p "Are you sure? (yes/no): " confirm

        if [[ "$confirm" == "yes" ]]; then
            echo ""
            echo -e "${BLUE}Restoring backup...${NC}"
            /home/seanos1a/backup/restore-backup.sh "$selected_backup"
            echo -e "${GREEN}Restore completed!${NC}"
        else
            echo "Restore cancelled."
        fi
    else
        echo -e "${RED}Invalid selection!${NC}"
    fi

    echo "Press Enter to continue..."
    read -r
}

# Function to delete old backups
delete_old_backups() {
    echo -e "${BLUE}Delete Old Backups${NC}"
    echo "========================================"

    echo "Select cleanup option:"
    echo "1. Delete backups older than 7 days"
    echo "2. Delete backups older than 30 days"
    echo "3. Delete all backups except last 3"
    echo "4. Manual selection"
    echo ""
    echo -n "Choose option (1-4): "
    read -r option

    case $option in
        1)
            echo "Deleting backups older than 7 days..."
            find "$BACKUP_DIR" -maxdepth 1 -type d -name "20*" -mtime +7 -exec rm -rf {} \; 2>/dev/null
            echo -e "${GREEN}Cleanup completed!${NC}"
            ;;
        2)
            echo "Deleting backups older than 30 days..."
            find "$BACKUP_DIR" -maxdepth 1 -type d -name "20*" -mtime +30 -exec rm -rf {} \; 2>/dev/null
            echo -e "${GREEN}Cleanup completed!${NC}"
            ;;
        3)
            echo "Keeping only last 3 backups..."
            cd "$BACKUP_DIR" && ls -1t | tail -n +4 | xargs -r rm -rf
            echo -e "${GREEN}Cleanup completed!${NC}"
            ;;
        4)
            echo "Manual deletion not implemented in this script."
            echo "Use: rm -rf $BACKUP_DIR/backup_name"
            ;;
        *)
            echo -e "${RED}Invalid option!${NC}"
            ;;
    esac

    echo "Press Enter to continue..."
    read -r
}

# Function to show backup statistics
show_statistics() {
    echo -e "${BLUE}Backup Statistics${NC}"
    echo "========================================"

    if [[ ! -d "$BACKUP_DIR" ]]; then
        echo -e "${YELLOW}Backup directory not found!${NC}"
        echo "Press Enter to continue..."
        read -r
        return
    fi

    # Count backups
    backup_count=$(find "$BACKUP_DIR" -maxdepth 1 -type d -name "20*" | wc -l)
    total_size=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)

    echo "Total backups: $backup_count"
    echo "Total size: $total_size"
    echo ""

    # Oldest and newest backups
    if [[ $backup_count -gt 0 ]]; then
        oldest_backup=$(find "$BACKUP_DIR" -maxdepth 1 -type d -name "20*" | sort | head -n 1 | xargs basename)
        newest_backup=$(find "$BACKUP_DIR" -maxdepth 1 -type d -name "20*" | sort | tail -n 1 | xargs basename)

        echo "Oldest backup: $oldest_backup"
        echo "Newest backup: $newest_backup"
        echo ""

        # Disk usage analysis
        echo "Disk usage analysis:"
        echo "==================="
        du -sh "$BACKUP_DIR"/* 2>/dev/null | sort -hr | head -n 5
    fi

    echo ""
    echo "Press Enter to continue..."
    read -r
}

# Function to test backup integrity
test_backup_integrity() {
    echo -e "${BLUE}Testing Backup Integrity${NC}"
    echo "========================================"

    if [[ ! -d "$BACKUP_DIR" ]] || [[ -z "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]]; then
        echo -e "${YELLOW}No backups to test.${NC}"
        echo "Press Enter to continue..."
        read -r
        return
    fi

    # Test latest backup
    latest_backup=$(find "$BACKUP_DIR" -maxdepth 1 -type d -name "20*" | sort | tail -n 1)
    backup_name=$(basename "$latest_backup")

    echo "Testing backup: $backup_name"
    echo ""

    # Check if backup directory exists and is not empty
    if [[ -d "$latest_backup" ]]; then
        file_count=$(find "$latest_backup" -type f | wc -l)
        dir_count=$(find "$latest_backup" -type d | wc -l)

        echo -e "${GREEN}✅ Backup directory exists${NC}"
        echo "Files: $file_count"
        echo "Directories: $dir_count"
        echo ""

        # Test tarballs integrity
        tar_count=0
        tar_errors=0

        for tarball in "$latest_backup"/*.tar.gz; do
            if [[ -f "$tarball" ]]; then
                tar_count=$((tar_count + 1))
                if tar -tzf "$tarball" > /dev/null 2>&1; then
                    echo -e "${GREEN}✅ $(basename "$tarball") - OK${NC}"
                else
                    echo -e "${RED}❌ $(basename "$tarball") - CORRUPT${NC}"
                    tar_errors=$((tar_errors + 1))
                fi
            fi
        done

        echo ""
        echo "Archive integrity test:"
        echo "Archives tested: $tar_count"
        echo "Errors found: $tar_errors"

        # Check metadata
        if [[ -f "$latest_backup/metadata.json" ]]; then
            echo -e "${GREEN}✅ Metadata file exists${NC}"
        else
            echo -e "${YELLOW}⚠️  No metadata file found${NC}"
        fi

        # Overall status
        if [[ $tar_errors -eq 0 ]]; then
            echo ""
            echo -e "${GREEN}✅ Backup integrity test PASSED${NC}"
        else
            echo ""
            echo -e "${RED}❌ Backup integrity test FAILED${NC}"
        fi
    else
        echo -e "${RED}❌ Latest backup directory not found!${NC}"
    fi

    echo ""
    echo "Press Enter to continue..."
    read -r
}

# Main loop
main() {
    while true; do
        show_menu
        read -n 1 -r choice
        echo ""  # New line after input

        case $choice in
            "C"|"c")
                create_backup
                ;;
            "L"|"l")
                list_backups
                ;;
            "R"|"r")
                restore_backup
                ;;
            "D"|"d")
                delete_old_backups
                ;;
            "S"|"s")
                show_statistics
                ;;
            "T"|"t")
                test_backup_integrity
                ;;
            "Q"|"q")
                exit 0
                ;;
            *)
                echo -e "${RED}Invalid option!${NC}"
                sleep 1
                ;;
        esac
    done
}

# Run main function
main