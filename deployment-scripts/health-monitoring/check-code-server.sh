#!/bin/bash
# Script to verify code-server is running and accessible

echo "=== Code-Server Health Check ==="
echo ""

# Check if code-server service is running
echo "1. Checking systemd service status..."
if systemctl is-active --quiet code-server@seanos1a; then
    echo "   ✓ code-server service is RUNNING"
else
    echo "   ✗ code-server service is NOT running"
    echo "   To fix: sudo systemctl start code-server@seanos1a"
fi

echo ""

# Check if port 8080 is listening
echo "2. Checking if port 8080 is listening..."
if sudo lsof -i :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "   ✓ Port 8080 is LISTENING"
else
    echo "   ✗ Port 8080 is NOT listening"
fi

echo ""

# Check if code-server responds to HTTP requests
echo "3. Testing HTTP response on localhost:8080..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080)
if [ "$HTTP_CODE" = "302" ]; then
    echo "   ✓ code-server is responding (HTTP $HTTP_CODE)"
else
    echo "   ✗ code-server returned unexpected code: HTTP $HTTP_CODE"
fi

echo ""

# Check Caddy service
echo "4. Checking Caddy reverse proxy..."
if systemctl is-active --quiet caddy; then
    echo "   ✓ Caddy service is RUNNING"
else
    echo "   ✗ Caddy service is NOT running"
    echo "   To fix: sudo systemctl start caddy"
fi

echo ""
echo "=== Summary ==="
echo "Server IP: $(curl -s -4 ifconfig.me)"
echo "code-server should be accessible at: http://$(curl -s -4 ifconfig.me):8080"
echo "Via Cloudflare: https://code.codeovertcp.com"
echo ""
echo "If Cloudflare shows HTTP 522, check DNS points to: $(curl -s -4 ifconfig.me)"
