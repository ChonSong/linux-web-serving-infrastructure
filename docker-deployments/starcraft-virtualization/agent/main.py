# agent/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import docker
import asyncio
import logging
from typing import Dict, Optional
import os

app = FastAPI(
    title="StarCraft Virtualization Agent",
    description="API for managing virtualized StarCraft: Brood War instances",
    version="1.0.0"
)
docker_client = docker.from_env()
logger = logging.getLogger(__name__)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)


class InstanceConfig(BaseModel):
    instance_id: str
    map_file: str
    game_type: str = "melee"
    speed: str = "fastest"
    vnc_password: Optional[str] = "vncpassword"


class InstanceResponse(BaseModel):
    instance_id: str
    status: str
    vnc_url: Optional[str] = None


class InstanceStatus(BaseModel):
    instance_id: str
    status: str
    cpu_percent: float
    memory_usage: int
    memory_limit: int
    vnc_url: str


instances: Dict[str, dict] = {}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "instances_count": len(instances)}


@app.post("/instances/launch", response_model=InstanceResponse)
async def launch_instance(config: InstanceConfig):
    """Launch a new StarCraft instance"""
    try:
        max_instances = int(os.getenv("MAX_INSTANCES", 10))
        if len(instances) >= max_instances:
            raise HTTPException(
                status_code=429,
                detail=f"Maximum instances ({max_instances}) reached"
            )

        if config.instance_id in instances:
            raise HTTPException(
                status_code=409,
                detail=f"Instance {config.instance_id} already exists"
            )

        # Generate unique VNC port
        base_port = 5900
        used_ports = {inst["vnc_port"] for inst in instances.values()}
        vnc_port = base_port + 1
        while vnc_port in used_ports:
            vnc_port += 1

        host_ip = os.getenv("HOST_IP", "localhost")

        # Launch container
        container = docker_client.containers.run(
            "psvs/starcraft-game:latest",
            detach=True,
            environment={
                "INSTANCE_ID": config.instance_id,
                "MAP_FILE": config.map_file,
                "GAME_TYPE": config.game_type,
                "VNC_PASSWORD": config.vnc_password or "vncpassword",
                "VNC_RESOLUTION": "1024x768"
            },
            ports={"8080/tcp": vnc_port},
            name=f"starcraft-{config.instance_id}",
            mem_limit="2g",
            cpu_period=100000,
            cpu_quota=100000,  # 1 CPU core
            cap_add=["SYS_PTRACE"],
            network="psvs-network",
        )

        # Store instance info
        instances[config.instance_id] = {
            "container_id": container.id,
            "vnc_port": vnc_port,
            "status": "starting",
            "url": f"http://{host_ip}:{vnc_port}"
        }

        # Wait for game to be ready in background
        asyncio.create_task(wait_for_game_ready(container, config.instance_id))

        logger.info(f"Launched instance {config.instance_id} on port {vnc_port}")

        return InstanceResponse(
            instance_id=config.instance_id,
            status="starting",
            vnc_url=instances[config.instance_id]["url"]
        )

    except docker.errors.APIError as e:
        logger.error(f"Docker API error: {e}")
        raise HTTPException(status_code=500, detail=f"Container launch failed: {str(e)}")
    except docker.errors.ImageNotFound:
        logger.error("StarCraft game image not found")
        raise HTTPException(
            status_code=500,
            detail="StarCraft game image not found. Please build the image first."
        )


@app.post("/instances/{instance_id}/terminate", response_model=InstanceResponse)
async def terminate_instance(instance_id: str):
    """Terminate an instance"""
    if instance_id not in instances:
        raise HTTPException(status_code=404, detail="Instance not found")

    try:
        container = docker_client.containers.get(
            instances[instance_id]["container_id"]
        )
        container.stop(timeout=10)
        container.remove()
        del instances[instance_id]

        logger.info(f"Terminated instance {instance_id}")

        return InstanceResponse(
            instance_id=instance_id,
            status="terminated"
        )

    except docker.errors.NotFound:
        # Container already removed, clean up our records
        del instances[instance_id]
        return InstanceResponse(
            instance_id=instance_id,
            status="terminated"
        )
    except Exception as e:
        logger.error(f"Termination error: {e}")
        raise HTTPException(status_code=500, detail=f"Termination failed: {str(e)}")


@app.get("/instances/{instance_id}/status", response_model=InstanceStatus)
async def get_instance_status(instance_id: str):
    """Get instance status and metrics"""
    if instance_id not in instances:
        raise HTTPException(status_code=404, detail="Instance not found")

    try:
        container = docker_client.containers.get(
            instances[instance_id]["container_id"]
        )
        stats = container.stats(stream=False)

        return InstanceStatus(
            instance_id=instance_id,
            status=container.status,
            cpu_percent=calculate_cpu_percent(stats),
            memory_usage=stats["memory_stats"].get("usage", 0),
            memory_limit=stats["memory_stats"].get("limit", 0),
            vnc_url=instances[instance_id]["url"]
        )

    except docker.errors.NotFound:
        # Container was removed externally
        instances[instance_id]["status"] = "not_found"
        raise HTTPException(
            status_code=404,
            detail="Container not found - may have been removed externally"
        )
    except Exception as e:
        logger.error(f"Status error: {e}")
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")


@app.get("/instances")
async def list_instances():
    """List all running instances"""
    result = []
    for instance_id, info in instances.items():
        try:
            container = docker_client.containers.get(info["container_id"])
            result.append({
                "instance_id": instance_id,
                "status": container.status,
                "vnc_url": info["url"],
                "vnc_port": info["vnc_port"]
            })
        except docker.errors.NotFound:
            result.append({
                "instance_id": instance_id,
                "status": "not_found",
                "vnc_url": info["url"],
                "vnc_port": info["vnc_port"]
            })
    return {"instances": result, "count": len(result)}


@app.post("/instances/{instance_id}/restart", response_model=InstanceResponse)
async def restart_instance(instance_id: str):
    """Restart an instance"""
    if instance_id not in instances:
        raise HTTPException(status_code=404, detail="Instance not found")

    try:
        container = docker_client.containers.get(
            instances[instance_id]["container_id"]
        )
        container.restart(timeout=10)
        instances[instance_id]["status"] = "restarting"

        logger.info(f"Restarted instance {instance_id}")

        return InstanceResponse(
            instance_id=instance_id,
            status="restarting",
            vnc_url=instances[instance_id]["url"]
        )

    except Exception as e:
        logger.error(f"Restart error: {e}")
        raise HTTPException(status_code=500, detail=f"Restart failed: {str(e)}")


async def wait_for_game_ready(container, instance_id: str, timeout: int = 45):
    """Wait for game to reach lobby ready state"""
    for _ in range(timeout):
        try:
            # Check if container is still running
            container.reload()
            if container.status != "running":
                instances[instance_id]["status"] = "failed"
                logger.error(f"Container for {instance_id} stopped unexpectedly")
                return False

            # Check container logs for specific patterns
            logs = container.logs().decode()
            if "Brood War" in logs or "Lobby" in logs or "StarCraft" in logs:
                instances[instance_id]["status"] = "ready"
                logger.info(f"Instance {instance_id} is ready")
                return True
        except Exception as e:
            logger.warning(f"Error checking game status: {e}")

        await asyncio.sleep(1)

    # Timeout reached, but container might still be running
    instances[instance_id]["status"] = "running"
    logger.warning(f"Game ready check timed out for {instance_id}, but container is running")
    return True


def calculate_cpu_percent(stats: dict) -> float:
    """Calculate CPU percentage from docker stats"""
    try:
        cpu_delta = stats["cpu_stats"]["cpu_usage"]["total_usage"] - \
                    stats["precpu_stats"]["cpu_usage"]["total_usage"]
        system_delta = stats["cpu_stats"]["system_cpu_usage"] - \
                       stats["precpu_stats"]["system_cpu_usage"]

        if system_delta > 0 and cpu_delta > 0:
            online_cpus = stats["cpu_stats"].get("online_cpus", 1)
            return (cpu_delta / system_delta) * 100 * online_cpus
    except (KeyError, TypeError):
        pass
    return 0.0


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("AGENT_PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
