#!/bin/bash
# scripts/start_battlenet.sh
# Starts Battle.net launcher with Wine

echo "Starting Battle.net launcher..."

# Set up environment
export DISPLAY=:0
export WINEPREFIX=/home/webbian/.wine
export WINEARCH=win32

# Wait for X server to be ready
echo "Waiting for X server..."
MAX_WAIT=30
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

# Battle.net executable path
BATTLENET_PATH="/home/webbian/.wine/drive_c/Program Files (x86)/Battle.net/Battle.net Launcher.exe"

# Check if Battle.net is installed
if [ ! -f "$BATTLENET_PATH" ]; then
    echo "WARNING: Battle.net Launcher not found at $BATTLENET_PATH"
    echo "Attempting to find Battle.net installation..."
    
    # Try alternative paths
    ALT_PATH="/home/webbian/.wine/drive_c/Program Files (x86)/Battle.net/Battle.net.exe"
    if [ -f "$ALT_PATH" ]; then
        BATTLENET_PATH="$ALT_PATH"
        echo "Found Battle.net at: $BATTLENET_PATH"
    else
        echo "ERROR: Battle.net installation not found"
        echo "Please ensure Battle.net is properly installed"
        # Keep container running for debugging
        sleep infinity
    fi
fi

# Start Battle.net with Wine
echo "Launching Battle.net with Wine..."
cd "/home/webbian/.wine/drive_c/Program Files (x86)/Battle.net"
wine "$BATTLENET_PATH"

echo "Battle.net process ended"
