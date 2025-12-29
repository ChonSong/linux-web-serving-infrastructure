#!/bin/bash
# scripts/start_battlenet.sh
# Installs and starts Battle.net launcher with Wine

echo "Starting Battle.net setup..."

# Set up environment
export DISPLAY=:0
export WINEPREFIX=/root/.wine
export WINEARCH=win32

# Wait for X server to be ready
echo "Waiting for X server..."
MAX_WAIT=60
WAIT_COUNT=0

while ! xdpyinfo -display :0 > /dev/null 2>&1; do
    sleep 1
    WAIT_COUNT=$((WAIT_COUNT + 1))
    if [ $WAIT_COUNT -ge $MAX_WAIT ]; then
        echo "ERROR: X server not ready after ${MAX_WAIT} seconds"
        exit 1
    fi
done

echo "X server is ready"

# Initialize Wine if needed
if [ ! -d "$WINEPREFIX" ]; then
    echo "Initializing Wine prefix..."
    wineboot --init
    sleep 5
fi

# Battle.net installer path
INSTALLER_PATH="/root/Battle.net-Setup.exe"
BATTLENET_PATH="$WINEPREFIX/drive_c/Program Files (x86)/Battle.net/Battle.net Launcher.exe"

# Check if Battle.net is already installed
if [ ! -f "$BATTLENET_PATH" ]; then
    echo "Battle.net not installed, running installer..."
    
    if [ -f "$INSTALLER_PATH" ]; then
        echo "Running Battle.net installer..."
        wine "$INSTALLER_PATH" --lang=enUS --installpath="C:\\Program Files (x86)\\Battle.net"
        sleep 10
    else
        echo "ERROR: Battle.net installer not found at $INSTALLER_PATH"
        echo "Downloading Battle.net installer..."
        wget -O "$INSTALLER_PATH" "https://www.battle.net/download/getInstallerForGame?os=win&gameProgram=BATTLENET_APP&version=Live"
        if [ -f "$INSTALLER_PATH" ]; then
            wine "$INSTALLER_PATH" --lang=enUS --installpath="C:\\Program Files (x86)\\Battle.net"
            sleep 10
        fi
    fi
fi

# Try to find Battle.net executable
if [ ! -f "$BATTLENET_PATH" ]; then
    ALT_PATH="$WINEPREFIX/drive_c/Program Files (x86)/Battle.net/Battle.net.exe"
    if [ -f "$ALT_PATH" ]; then
        BATTLENET_PATH="$ALT_PATH"
    fi
fi

# Start Battle.net if found
if [ -f "$BATTLENET_PATH" ]; then
    echo "Launching Battle.net..."
    cd "$(dirname "$BATTLENET_PATH")"
    wine "$BATTLENET_PATH"
else
    echo "Battle.net not found. Starting Wine explorer for manual installation..."
    wine explorer
fi

echo "Battle.net process ended"
