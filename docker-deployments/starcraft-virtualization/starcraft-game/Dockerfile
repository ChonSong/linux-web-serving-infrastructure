# starcraft-game/Dockerfile
# Base image with Wine, X11, and noVNC for browser-based access
FROM solarkennedy/wine-x11-novnc-docker:latest

USER root

# Install additional dependencies
RUN apt-get update && apt-get install -y \
    winetricks \
    xdotool \
    wget \
    unzip \
    curl \
    cabextract \
    && rm -rf /var/lib/apt/lists/*

# Set up Wine environment
ENV WINEPREFIX=/root/.wine
ENV WINEARCH=win32
ENV DISPLAY=:0

# Download Battle.net installer
WORKDIR /root
RUN wget -O Battle.net-Setup.exe "https://www.battle.net/download/getInstallerForGame?os=win&gameProgram=BATTLENET_APP&version=Live" || \
    wget -O Battle.net-Setup.exe "https://eu.battle.net/download/getInstallerForGame?os=win&gameProgram=BATTLENET_APP&version=Live" || true

# Copy startup script that will install Battle.net on first run
COPY scripts/start_battlenet.sh /root/scripts/
RUN mkdir -p /root/scripts && chmod +x /root/scripts/*.sh || true

# Copy configuration files
COPY config/ddraw.ini /root/
COPY config/supervisord.conf /etc/supervisor/conf.d/starcraft.conf

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

EXPOSE 8080

# The base image handles starting Xvfb, x11vnc, and noVNC
# We just need to ensure Battle.net installer is available
