#!/bin/bash
# scripts/automate_lobby.sh
# Automates StarCraft: Brood War lobby creation using xdotool

INSTANCE_ID=$1
MAP_FILE=$2
GAME_TYPE=$3

echo "Starting lobby automation for instance: $INSTANCE_ID"
echo "Map: $MAP_FILE"
echo "Game Type: $GAME_TYPE"

# Wait for StarCraft window to appear
echo "Waiting for StarCraft window..."
MAX_WAIT=60
WAIT_COUNT=0

while ! xdotool search --name "Brood War" > /dev/null 2>&1; do
    sleep 2
    WAIT_COUNT=$((WAIT_COUNT + 2))
    if [ $WAIT_COUNT -ge $MAX_WAIT ]; then
        echo "ERROR: StarCraft window not found after ${MAX_WAIT} seconds"
        exit 1
    fi
    echo "Waiting... ($WAIT_COUNT seconds)"
done

WINDOW_ID=$(xdotool search --name "Brood War" | head -1)
echo "Found StarCraft window: $WINDOW_ID"

# Focus the window
xdotool windowfocus $WINDOW_ID
sleep 1

# Close any open dialogs
xdotool key Escape
sleep 0.5

# Navigate to multiplayer
echo "Navigating to Multiplayer..."
xdotool key m       # Multiplayer
sleep 1

# Select Local Area Network
echo "Selecting Local Area Network..."
xdotool key l       # Local Area Network
sleep 1

# Select Expansion (Brood War)
echo "Selecting Expansion..."
xdotool key e       # Expansion
sleep 2

# Create game
echo "Creating game..."
xdotool key c       # Create Game
sleep 3

# Select map
echo "Selecting map: $MAP_FILE"
xdotool type "$MAP_FILE"
sleep 1
xdotool key Return
sleep 2

# Set game options based on game type
echo "Setting game options..."
xdotool key Tab
sleep 0.5

# Navigate to game type dropdown
case "$GAME_TYPE" in
    "melee")
        # Default is usually melee, no change needed
        ;;
    "ffa")
        xdotool key Down
        sleep 0.5
        ;;
    "ums")
        xdotool key Down Down
        sleep 0.5
        ;;
    *)
        echo "Unknown game type: $GAME_TYPE, using default"
        ;;
esac

# Set speed to Fastest
xdotool key Tab
sleep 0.5
xdotool key Down Down Down Down Down Down  # Navigate to Fastest
sleep 0.5

# Start lobby
xdotool key Tab
sleep 0.5
xdotool key Return
sleep 2

echo "Lobby created successfully for instance: $INSTANCE_ID"
echo "Map: $MAP_FILE"
echo "Game Type: $GAME_TYPE"
echo "Lobby is ready for players to join"

# Keep script running to maintain lobby state
while true; do
    sleep 30
    # Check if StarCraft is still running
    if ! xdotool search --name "Brood War" > /dev/null 2>&1; then
        echo "StarCraft window closed, exiting lobby automation"
        exit 0
    fi
done
