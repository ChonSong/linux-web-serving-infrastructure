#!/bin/bash
# scripts/start_starcraft.sh
# Starts StarCraft: Brood War with Wine

echo "Starting StarCraft: Brood War..."

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

# Navigate to StarCraft directory
cd /home/webbian/starcraft

# Check if StarCraft executable exists
if [ ! -f "StarCraft.exe" ]; then
    echo "WARNING: StarCraft.exe not found in /home/webbian/starcraft"
    echo "Please ensure StarCraft game files are mounted or copied to the container"
    # Keep container running for debugging
    sleep infinity
fi

# Start StarCraft with Wine
echo "Launching StarCraft with Wine..."
wine StarCraft.exe

echo "StarCraft process ended"
