const net = require('net');
const http = require('http');
const WebSocket = require('ws');

const VNC_HOST = process.env.VNC_HOST || 'gimp-dev';
const VNC_PORT = parseInt(process.env.VNC_PORT || '5901');
const WEB_PORT = parseInt(process.env.PORT || '8080');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('GIMP Streaming Server is running\n');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');

  const vncSocket = net.createConnection(VNC_PORT, VNC_HOST);

  vncSocket.on('connect', () => {
    console.log(`Connected to VNC server at ${VNC_HOST}:${VNC_PORT}`);
  });

  vncSocket.on('data', (data) => {
    try {
      // console.log(`Received ${data.length} bytes from VNC`);
      ws.send(data);
    } catch (e) {
      console.error('Error sending data to client:', e);
      vncSocket.end();
    }
  });

  vncSocket.on('error', (err) => {
    console.error('VNC socket error:', err);
    ws.close();
  });

  vncSocket.on('close', (hadError) => {
    console.log('VNC socket closed', hadError ? 'with error' : '');
    ws.close();
  });

  ws.on('message', (message) => {
    try {
      // console.log(`Received ${message.length} bytes from Client`);
      vncSocket.write(message);
    } catch (e) {
      console.error('Error sending data to VNC:', e);
      vncSocket.end();
    }
  });

  ws.on('close', (code, reason) => {
    console.log(`Client disconnected: ${code} ${reason}`);
    vncSocket.end();
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
    vncSocket.end();
  });
});

server.listen(WEB_PORT, () => {
  console.log(`Streaming server listening on port ${WEB_PORT}`);
});
