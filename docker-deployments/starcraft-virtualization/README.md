# StarCraft Virtualization Infrastructure

A containerized infrastructure for running multiple virtualized StarCraft: Brood War instances with centralized management via a REST API agent.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     StarCraft Agent (FastAPI)                    │
│                         Port 8080                                │
│  - Instance lifecycle management                                 │
│  - Resource monitoring                                           │
│  - Health checks                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Docker API
                              ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Game Instance  │  │  Game Instance  │  │  Game Instance  │
│   (Container)   │  │   (Container)   │  │   (Container)   │
│                 │  │                 │  │                 │
│ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │
│ │   noVNC     │ │  │ │   noVNC     │ │  │ │   noVNC     │ │
│ │  Port 8080  │ │  │ │  Port 8080  │ │  │ │  Port 8080  │ │
│ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────┘ │
│ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │
│ │  StarCraft  │ │  │ │  StarCraft  │ │  │ │  StarCraft  │ │
│ │   + Wine    │ │  │ │   + Wine    │ │  │ │   + Wine    │ │
│ │ + cnc-ddraw │ │  │ │ + cnc-ddraw │ │  │ │ + cnc-ddraw │ │
│ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────┘ │
└─────────────────┘  └─────────────────┘  └─────────────────┘
    Port 5901           Port 5902           Port 5903
```

## Components

### 1. StarCraft Agent (`agent/`)
A FastAPI-based REST API for managing game instances:
- Launch/terminate instances
- Monitor resource usage (CPU, memory)
- Health checks
- Instance listing

### 2. Game Container (`starcraft-game/`)
Docker container running StarCraft: Brood War:
- Wine for Windows compatibility
- cnc-ddraw for DirectDraw rendering
- noVNC for web-based access
- Automated lobby creation via xdotool
- BWAPI support for bot integration

## Quick Start

### 1. Build Images

```bash
chmod +x build.sh
./build.sh
```

### 2. Start the Agent

```bash
docker-compose up -d starcraft-agent
```

### 3. Launch a Game Instance

```bash
curl -X POST http://localhost:8080/instances/launch \
  -H "Content-Type: application/json" \
  -d '{
    "instance_id": "game1",
    "map_file": "(2)Showdown.scm",
    "game_type": "melee"
  }'
```

### 4. Access the Game

Open the returned `vnc_url` in your browser to access the game via noVNC.

## API Reference

### Health Check
```bash
GET /health
```

### Launch Instance
```bash
POST /instances/launch
Content-Type: application/json

{
  "instance_id": "game1",
  "map_file": "(2)Showdown.scm",
  "game_type": "melee",
  "speed": "fastest",
  "vnc_password": "vncpassword"
}
```

### Get Instance Status
```bash
GET /instances/{instance_id}/status
```

### List All Instances
```bash
GET /instances
```

### Terminate Instance
```bash
POST /instances/{instance_id}/terminate
```

### Restart Instance
```bash
POST /instances/{instance_id}/restart
```

## Configuration

### Environment Variables

#### Agent
| Variable | Default | Description |
|----------|---------|-------------|
| `AGENT_PORT` | 8080 | API listen port |
| `MAX_INSTANCES` | 10 | Maximum concurrent instances |
| `HOST_IP` | localhost | Host IP for VNC URLs |

#### Game Container
| Variable | Default | Description |
|----------|---------|-------------|
| `INSTANCE_ID` | default | Unique instance identifier |
| `MAP_FILE` | (2)Showdown.scm | Map to load |
| `GAME_TYPE` | melee | Game type (melee, ffa, ums) |
| `VNC_PASSWORD` | vncpassword | VNC authentication password |
| `VNC_RESOLUTION` | 1024x768 | Display resolution |

### Resource Limits

Each game instance is limited to:
- **CPU**: 1 core
- **Memory**: 2GB

## Verification Checklist

### AC1: Visual Stability
```bash
docker logs starcraft-game1 | grep -i "ddraw\|directdraw\|opengl"
```
Should show successful cnc-ddraw initialization.

### AC2: Parallelization
```bash
# Launch 3 instances
for i in {1..3}; do
  curl -X POST http://localhost:8080/instances/launch \
    -d "{\"instance_id\":\"game$i\",\"map_file\":\"(2)Showdown.scm\"}"
done
```
Monitor with `docker stats`.

### AC3: Web Accessibility
All instances should be accessible at `http://<host>:<vnc_port>` with noVNC interface.

### AC4: Automated Lobby
Container logs should show lobby creation within 45 seconds.

### AC5: Resource Cleanup
After termination, verify:
```bash
docker ps -a | grep starcraft
docker volume ls | grep psvs
```

## Directory Structure

```
starcraft-virtualization/
├── docker-compose.yml          # Main orchestration file
├── build.sh                    # Build script for all images
├── README.md                   # This file
├── agent/                      # Agent service
│   ├── Dockerfile
│   ├── main.py                 # FastAPI application
│   └── requirements.txt
└── starcraft-game/             # Game container
    ├── Dockerfile
    ├── config/
    │   ├── ddraw.ini           # cnc-ddraw configuration
    │   └── supervisord.conf    # Process management
    └── scripts/
        ├── automate_lobby.sh   # Lobby automation
        └── start_starcraft.sh  # Game startup script
```

## Notes

- StarCraft game files must be provided separately (not included due to licensing)
- Mount game files to `/home/webbian/starcraft` or copy during build
- VNC ports are dynamically assigned starting from 5901
- The agent requires access to Docker socket for container management

## Troubleshooting

### Game window not appearing
- Check X server logs: `docker logs <container> | grep -i xvfb`
- Verify Wine configuration: `docker exec <container> wine --version`

### VNC connection issues
- Verify noVNC is running: `docker logs <container> | grep -i novnc`
- Check port mapping: `docker port <container>`

### Lobby automation failing
- Check xdotool availability: `docker exec <container> which xdotool`
- Review automation logs: `docker logs <container> | grep -i lobby`
