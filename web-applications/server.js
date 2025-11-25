import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import sqlite3 from 'sqlite3';
import { createClient } from 'redis';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const PORT = process.env.PORT || 3010;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Initialize Express app
const app = express();
const server = createServer(app);

// Security and performance middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "wss:", "ws:", "https:"],
    },
  },
}));
app.use(compression());
app.use(cors({
  origin: ['https://dev.codeovertcp.com', 'https://mobile.codeovertcp.com', 'https://sync.codeovertcp.com'],
  credentials: true
}));

// Serve static files
app.use(express.static(join(__dirname, 'public')));

app.use(express.json({ limit: '10mb' }));

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: ['https://dev.codeovertcp.com', 'https://mobile.codeovertcp.com'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Initialize SQLite database
const db = new sqlite3.Database(join(__dirname, 'database.sqlite'));

// Initialize Redis client
const redisClient = createClient({
  url: REDIS_URL
});

// User session storage
const userSessions = new Map(); // userId -> Set of socket connections
const deviceSessions = new Map(); // deviceId -> { userId, socketId, metadata }

// Database schema initialization
async function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Devices table
      db.run(`
        CREATE TABLE IF NOT EXISTS devices (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          name TEXT,
          type TEXT,
          last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
          metadata TEXT, -- JSON string for additional device info
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // User sessions table for persistence
      db.run(`
        CREATE TABLE IF NOT EXISTS user_sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          device_id TEXT,
          data TEXT, -- JSON string for session state
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id),
          FOREIGN KEY (device_id) REFERENCES devices (id)
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database initialized successfully');
          resolve();
        }
      });
    });
  });
}

// Utility functions
function generateDeviceId() {
  return uuidv4();
}

function generateUserId() {
  return uuidv4();
}

function createJWT(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}

function verifyJWT(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Authentication middleware
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const decoded = verifyJWT(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  req.userId = decoded.userId;
  next();
}

// REST API Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Check if user already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (user) {
        return res.status(409).json({ error: 'User already exists' });
      }

      // Create new user
      const userId = generateUserId();
      const passwordHash = await bcrypt.hash(password, 10);

      db.run(
        'INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)',
        [userId, email, passwordHash],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to create user' });
          }

          const token = createJWT(userId);
          res.status(201).json({
            message: 'User created successfully',
            token,
            userId
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    db.get(
      'SELECT id, password_hash FROM users WHERE email = ?',
      [email],
      async (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = createJWT(user.id);
        res.json({
          message: 'Login successful',
          token,
          userId: user.id
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's devices
app.get('/api/devices', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM devices WHERE user_id = ? ORDER BY last_seen DESC',
    [req.userId],
    (err, devices) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({ devices });
    }
  );
});

// Get persisted session data
app.get('/api/session', authenticateToken, (req, res) => {
  db.get(
    'SELECT data FROM user_sessions WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1',
    [req.userId],
    (err, session) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (session && session.data) {
        res.json({ sessionData: JSON.parse(session.data) });
      } else {
        res.json({ sessionData: {} });
      }
    }
  );
});

// Socket.IO connection handling
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const decoded = verifyJWT(token);
    if (!decoded) {
      return next(new Error('Invalid or expired token'));
    }

    socket.userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
});

io.on('connection', async (socket) => {
  const { userId } = socket;
  const deviceId = generateDeviceId();

  // Device metadata from client
  const deviceInfo = socket.handshake.query.deviceInfo ?
    JSON.parse(socket.handshake.query.deviceInfo) : {};

  console.log(`User ${userId} connected from device ${deviceId}`);

  // Track session
  if (!userSessions.has(userId)) {
    userSessions.set(userId, new Set());
  }
  userSessions.get(userId).add(socket.id);

  // Store device info
  deviceSessions.set(socket.id, {
    userId,
    deviceId,
    socketId: socket.id,
    metadata: {
      userAgent: socket.handshake.headers['user-agent'],
      ip: socket.handshake.address,
      connectedAt: new Date().toISOString(),
      ...deviceInfo
    }
  });

  // Save device to database
  db.run(
    `INSERT OR REPLACE INTO devices (id, user_id, name, type, last_seen, metadata)
     VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?)`,
    [
      deviceId,
      userId,
      deviceInfo.name || `Device ${Date.now()}`,
      deviceInfo.type || 'unknown',
      JSON.stringify(deviceSessions.get(socket.id).metadata)
    ]
  );

  // Join user's personal room
  socket.join(`user:${userId}`);

  // Load persisted session data from database
  db.get(
    'SELECT data FROM user_sessions WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1',
    [userId],
    (err, session) => {
      if (!err && session && session.data) {
        socket.emit('session-restored', {
          sessionData: JSON.parse(session.data),
          deviceId
        });
      }
    }
  );

  // Notify user's other devices about new connection
  socket.to(`user:${userId}`).emit('device-connected', {
    deviceId,
    deviceInfo: deviceSessions.get(socket.id).metadata
  });

  // Handle session state updates
  socket.on('session-update', async (data) => {
    try {
      const { sessionKey, state } = data;

      // Broadcast to all user's devices (including sender for confirmation)
      io.to(`user:${userId}`).emit('session-updated', {
        sessionKey,
        state,
        deviceId,
        timestamp: Date.now()
      });

      // Persist to Redis for quick access
      await redisClient.setEx(
        `session:${userId}:${sessionKey}`,
        3600, // 1 hour TTL
        JSON.stringify(state)
      );

      // Persist to database periodically
      db.run(
        `INSERT OR REPLACE INTO user_sessions (id, user_id, device_id, data, updated_at)
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          `${userId}:${sessionKey}`,
          userId,
          deviceId,
          JSON.stringify({ [sessionKey]: state })
        ]
      );

    } catch (error) {
      console.error('Error handling session update:', error);
      socket.emit('error', { message: 'Failed to update session' });
    }
  });

  // Handle real-time events (cursor position, text changes, etc.)
  socket.on('realtime-event', (data) => {
    const { type, payload, targetDeviceId } = data;

    // Broadcast to all user's devices or specific device
    const targetRoom = targetDeviceId ?
      `device:${targetDeviceId}` :
      `user:${userId}`;

    socket.to(targetRoom).emit('realtime-event', {
      type,
      payload,
      sourceDeviceId: deviceId,
      timestamp: Date.now()
    });
  });

  // Handle device-specific messages
  socket.on('device-message', (data) => {
    const { targetDeviceId, message } = data;

    // Send to specific device
    socket.to(`device:${targetDeviceId}`).emit('device-message', {
      message,
      sourceDeviceId: deviceId,
      timestamp: Date.now()
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User ${userId} disconnected from device ${deviceId}`);

    // Clean up session tracking
    if (userSessions.has(userId)) {
      userSessions.get(userId).delete(socket.id);
      if (userSessions.get(userId).size === 0) {
        userSessions.delete(userId);
      }
    }

    deviceSessions.delete(socket.id);

    // Update device last seen
    db.run(
      'UPDATE devices SET last_seen = CURRENT_TIMESTAMP WHERE id = ?',
      [deviceId]
    );

    // Notify other devices
    socket.to(`user:${userId}`).emit('device-disconnected', {
      deviceId,
      timestamp: Date.now()
    });
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    activeConnections: io.sockets.sockets.size
  });
});

// Start server
async function startServer() {
  try {
    // Connect to Redis
    await redisClient.connect();
    console.log('Connected to Redis');

    // Initialize database
    await initializeDatabase();

    // Start server
    server.listen(PORT, () => {
      console.log(`Real-time sync server running on port ${PORT}`);
      console.log(`WebSocket endpoint: wss://your-domain.com:${PORT}`);
      console.log(`API endpoint: https://your-domain.com:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');

  await redisClient.quit();
  db.close();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

startServer();