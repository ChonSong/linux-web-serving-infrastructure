#!/bin/bash
# build.sh - Build StarCraft virtualization infrastructure images

set -e

echo "=== StarCraft Virtualization Infrastructure Build ==="
echo ""

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Build game image
echo "Building StarCraft game image..."
docker build -t psvs/starcraft-game:latest -f starcraft-game/Dockerfile starcraft-game/
echo "Game image built successfully"
echo ""

# Build agent image
echo "Building StarCraft agent image..."
docker build -t psvs/starcraft-agent:latest -f agent/Dockerfile agent/
echo "Agent image built successfully"
echo ""

echo "=== Build Complete ==="
echo ""
echo "Available images:"
docker images | grep psvs
echo ""
echo "To start the agent:"
echo "  docker-compose up -d starcraft-agent"
echo ""
echo "To test a single game instance:"
echo "  docker run -d \\"
echo "    --name starcraft-test \\"
echo "    -p 5901:8080 \\"
echo "    -e INSTANCE_ID=test1 \\"
echo "    -e MAP_FILE=\"(2)Showdown.scm\" \\"
echo "    psvs/starcraft-game:latest"
