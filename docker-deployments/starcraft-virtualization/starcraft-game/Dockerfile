# starcraft-game/Dockerfile
FROM fmstrat/webbian:latest

# Install dependencies
RUN apt-get update && apt-get install -y \
    wine-staging \
    wine32 \
    winetricks \
    xdotool \
    wget \
    unzip \
    supervisor \
    curl \
    cabextract \
    && rm -rf /var/lib/apt/lists/*

# Create wine prefix
ENV WINEPREFIX=/home/webbian/.wine
ENV WINEARCH=win32
ENV DISPLAY=:0

# Configure wine for cnc-ddraw
RUN winecfg && \
    wine reg add 'HKEY_CURRENT_USER\Software\Wine\Direct3D' /v 'DirectDrawRenderer' /t REG_SZ /d 'gdi' /f && \
    wine reg add 'HKEY_CURRENT_USER\Software\Wine\DllOverrides' /v 'ddraw' /t REG_SZ /d 'native,builtin' /f

# Install winetricks dependencies for Battle.net
RUN winetricks -q corefonts && \
    winetricks -q vcrun2019 && \
    winetricks -q dxvk

# Download and install Battle.net
WORKDIR /home/webbian
RUN wget -O Battle.net-Setup.exe "https://www.battle.net/download/getInstallerForGame?os=win&gameProgram=BATTLENET_APP&version=Live" && \
    wine Battle.net-Setup.exe --lang=enUS --installpath="C:\\Program Files (x86)\\Battle.net" && \
    rm -f Battle.net-Setup.exe

# Copy Battle.net startup script
COPY scripts/start_battlenet.sh /home/webbian/scripts/

# Install StarCraft
WORKDIR /home/webbian/starcraft
# Note: StarCraft game files should be provided via volume mount or copied during build
# COPY --chown=webbian:webbian starcraft/ .

# Install cnc-ddraw for DirectDraw compatibility
RUN wget -O ddraw.zip https://github.com/FunkyFr3sh/cnc-ddraw/releases/download/v4.5.5/cnc-ddraw.zip && \
    unzip ddraw.zip -d . && \
    rm ddraw.zip

# Configure cnc-ddraw
COPY config/ddraw.ini .
RUN chown webbian:webbian ddraw.ini

# Install BWAPI (for automated lobby control)
RUN mkdir -p bwapi && \
    wget -O bwapi.zip https://github.com/bwapi/bwapi/releases/download/v4.4.0/BWAPI_444_Setup.exe || true && \
    unzip bwapi.zip -d bwapi || true && \
    rm -f bwapi.zip

# Copy game automation scripts
COPY scripts/ /home/webbian/scripts/
RUN chmod +x /home/webbian/scripts/*.sh

# Configure supervisor for multiple processes
COPY config/supervisord.conf /etc/supervisor/conf.d/starcraft.conf

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

EXPOSE 8080
USER webbian

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]
