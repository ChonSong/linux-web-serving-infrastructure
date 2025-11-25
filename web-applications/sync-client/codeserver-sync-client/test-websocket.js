#!/usr/bin/env node

const { io } = require('socket.io-client');
const http = require('http');

// Test configuration
const SYNC_SERVER_URL = 'http://localhost:3010';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4N2Q2NDI4ZS05MWFjLTRjOTItYWM2Mi0zYmZjMDVmM2Y3NjUiLCJpYXQiOjE3NjM5NDk1NDAsImV4cCI6MTc2NjU0MTU0MH0.Rl2PUJr80hjOGIxc4G1MXfgURkrsaQwbu9z4uG1zVuE';

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function assert(condition, message) {
  if (condition) {
    log(`✅ PASS: ${message}`);
    testResults.passed++;
    testResults.tests.push({ status: 'PASS', message });
  } else {
    log(`❌ FAIL: ${message}`);
    testResults.failed++;
    testResults.tests.push({ status: 'FAIL', message });
  }
}

async function testAuthentication() {
  log('\n🔐 Testing Authentication...');

  try {
    // Test login with valid credentials
    const loginResponse = await fetch(`${SYNC_SERVER_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@codeovertcp.com',
        password: 'test123456'
      })
    });

    const loginData = await loginResponse.json();
    assert(loginResponse.ok && loginData.token, 'Valid login should return token');
    assert(loginData.userId, 'Login response should include userId');

    // Test login with invalid credentials
    const invalidLoginResponse = await fetch(`${SYNC_SERVER_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'invalid@test.com',
        password: 'wrongpassword'
      })
    });

    const invalidLoginData = await invalidLoginResponse.json();
    assert(!invalidLoginResponse.ok && invalidLoginData.error, 'Invalid login should return error');

  } catch (error) {
    assert(false, `Authentication test failed: ${error.message}`);
  }
}

async function testWebSocketConnection() {
  log('\n🔌 Testing WebSocket Connection...');

  return new Promise((resolve) => {
    const socket = io(SYNC_SERVER_URL, {
      auth: { token: TEST_TOKEN },
      query: {
        deviceInfo: JSON.stringify({
          name: 'Test Device',
          type: 'desktop',
          userAgent: 'Test Client',
          platform: 'Linux',
          viewport: '1920x1080'
        })
      },
      transports: ['websocket']
    });

    let connected = false;
    let deviceId = null;

    const timeout = setTimeout(() => {
      if (!connected) {
        assert(false, 'WebSocket connection timeout');
        socket.disconnect();
        resolve();
      }
    }, 10000);

    socket.on('connect', () => {
      connected = true;
      clearTimeout(timeout);
      assert(true, 'WebSocket connection established');
      assert(socket.id, 'Socket should have an ID');

      // Test session restoration
      setTimeout(() => {
        socket.disconnect();
        assert(true, 'WebSocket disconnected successfully');
        resolve();
      }, 2000);
    });

    socket.on('connect_error', (error) => {
      clearTimeout(timeout);
      assert(false, `WebSocket connection failed: ${error.message}`);
      resolve();
    });

    socket.on('session-restored', (data) => {
      deviceId = data.deviceId;
      assert(data.sessionData !== undefined, 'Session restoration should include session data');
      assert(deviceId, 'Session restoration should include device ID');
    });
  });
}

async function testMultiClientConnection() {
  log('\n👥 Testing Multi-Client Connection...');

  return new Promise((resolve) => {
    const clients = [];
    const connectionCount = 3;
    let connectedCount = 0;

    const timeout = setTimeout(() => {
      assert(false, 'Multi-client connection timeout');
      clients.forEach(client => client.disconnect());
      resolve();
    }, 15000);

    for (let i = 0; i < connectionCount; i++) {
      const socket = io(SYNC_SERVER_URL, {
        auth: { token: TEST_TOKEN },
        query: {
          deviceInfo: JSON.stringify({
            name: `Test Device ${i + 1}`,
            type: i % 2 === 0 ? 'desktop' : 'mobile',
            userAgent: `Test Client ${i + 1}`,
            platform: 'Linux',
            viewport: `${1920 + i * 100}x1080`
          })
        },
        transports: ['websocket']
      });

      clients.push(socket);

      socket.on('connect', () => {
        connectedCount++;
        log(`Client ${i + 1} connected`);

        if (connectedCount === connectionCount) {
          clearTimeout(timeout);
          assert(connectedCount === connectionCount, 'All clients should connect successfully');

          // Test device connection notifications
          let deviceConnectCount = 0;

          clients.forEach((client, index) => {
            client.on('device-connected', (data) => {
              deviceConnectCount++;
              log(`Client ${index + 1} received device-connected: ${data.deviceId}`);
            });
          });

          // Wait for device connection events
          setTimeout(() => {
            assert(deviceConnectCount > 0, 'Clients should receive device connection notifications');
            clients.forEach(client => client.disconnect());
            resolve();
          }, 3000);
        }
      });

      socket.on('connect_error', (error) => {
        clearTimeout(timeout);
        assert(false, `Client ${i + 1} connection failed: ${error.message}`);
        resolve();
      });
    }
  });
}

async function testSessionSynchronization() {
  log('\n🔄 Testing Session Synchronization...');

  return new Promise((resolve) => {
    const client1 = io(SYNC_SERVER_URL, {
      auth: { token: TEST_TOKEN },
      query: {
        deviceInfo: JSON.stringify({
          name: 'Sync Test Device 1',
          type: 'desktop',
          userAgent: 'Test Client 1',
          platform: 'Linux'
        })
      }
    });

    const client2 = io(SYNC_SERVER_URL, {
      auth: { token: TEST_TOKEN },
      query: {
        deviceInfo: JSON.stringify({
          name: 'Sync Test Device 2',
          type: 'mobile',
          userAgent: 'Test Client 2',
          platform: 'Linux'
        })
      }
    });

    let sessionUpdateReceived = false;
    const timeout = setTimeout(() => {
      client1.disconnect();
      client2.disconnect();
      resolve();
    }, 10000);

    client2.on('session-updated', (data) => {
      if (data.sessionKey === 'test-key' && data.state.value === 'test-value') {
        sessionUpdateReceived = true;
        assert(true, 'Session update received by other client');
        assert(data.sessionKey === 'test-key', 'Session update should contain correct key');
        assert(data.state.value === 'test-value', 'Session update should contain correct state');
      }
    });

    Promise.all([
      new Promise(resolve1 => {
        client1.on('connect', resolve1);
      }),
      new Promise(resolve2 => {
        client2.on('connect', resolve2);
      })
    ]).then(() => {
      log('Both clients connected, testing session sync');

      // Send session update from client1
      client1.emit('session-update', {
        sessionKey: 'test-key',
        state: { value: 'test-value', timestamp: Date.now() }
      });

      setTimeout(() => {
        clearTimeout(timeout);
        assert(sessionUpdateReceived, 'Session synchronization should work across clients');
        client1.disconnect();
        client2.disconnect();
        resolve();
      }, 3000);
    });
  });
}

async function testRealtimeEvents() {
  log('\n⚡ Testing Real-time Events...');

  return new Promise((resolve) => {
    const sender = io(SYNC_SERVER_URL, {
      auth: { token: TEST_TOKEN },
      query: {
        deviceInfo: JSON.stringify({
          name: 'Event Sender',
          type: 'desktop',
          userAgent: 'Test Client'
        })
      }
    });

    const receiver = io(SYNC_SERVER_URL, {
      auth: { token: TEST_TOKEN },
      query: {
        deviceInfo: JSON.stringify({
          name: 'Event Receiver',
          type: 'mobile',
          userAgent: 'Test Client'
        })
      }
    });

    let realtimeEventReceived = false;
    const timeout = setTimeout(() => {
      sender.disconnect();
      receiver.disconnect();
      resolve();
    }, 10000);

    receiver.on('realtime-event', (data) => {
      if (data.type === 'cursor-position') {
        realtimeEventReceived = true;
        assert(true, 'Real-time event received by other client');
        assert(data.payload.line === 10, 'Real-time event should contain correct payload');
        assert(data.payload.column === 20, 'Real-time event should contain correct payload');
      }
    });

    Promise.all([
      new Promise(resolve1 => {
        sender.on('connect', resolve1);
      }),
      new Promise(resolve2 => {
        receiver.on('connect', resolve2);
      })
    ]).then(() => {
      log('Both clients connected, testing real-time events');

      // Send real-time event from sender
      sender.emit('realtime-event', {
        type: 'cursor-position',
        payload: { line: 10, column: 20, file: 'test.js' }
      });

      setTimeout(() => {
        clearTimeout(timeout);
        assert(realtimeEventReceived, 'Real-time events should work across clients');
        sender.disconnect();
        receiver.disconnect();
        resolve();
      }, 3000);
    });
  });
}

async function testDeviceManagement() {
  log('\n📱 Testing Device Management...');

  try {
    // Test getting devices list
    const devicesResponse = await fetch(`${SYNC_SERVER_URL}/api/devices`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const devicesData = await devicesResponse.json();
    assert(devicesResponse.ok, 'Devices API should respond successfully');
    assert(Array.isArray(devicesData.devices), 'Devices response should be an array');

    log(`Found ${devicesData.devices.length} devices`);

  } catch (error) {
    assert(false, `Device management test failed: ${error.message}`);
  }
}

async function testOfflineReconnection() {
  log('\n🔄 Testing Offline Reconnection...');

  return new Promise((resolve) => {
    const socket = io(SYNC_SERVER_URL, {
      auth: { token: TEST_TOKEN },
      query: {
        deviceInfo: JSON.stringify({
          name: 'Reconnection Test',
          type: 'desktop',
          userAgent: 'Test Client'
        })
      },
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 3
    });

    let reconnected = false;
    let disconnectCount = 0;
    const timeout = setTimeout(() => {
      socket.disconnect();
      resolve();
    }, 15000);

    socket.on('connect', () => {
      log('Initial connection established');

      // Simulate disconnection after 2 seconds
      setTimeout(() => {
        log('Simulating network disconnection');
        socket.disconnect();
      }, 2000);
    });

    socket.on('disconnect', (reason) => {
      disconnectCount++;
      log(`Disconnected: ${reason}`);

      // Try to reconnect manually
      if (disconnectCount === 1) {
        setTimeout(() => {
          log('Attempting manual reconnection');
          socket.connect();
        }, 1000);
      }
    });

    socket.on('connect', () => {
      if (disconnectCount > 0) {
        reconnected = true;
        clearTimeout(timeout);
        assert(true, 'Client should be able to reconnect after disconnection');
        socket.disconnect();
        resolve();
      }
    });

    socket.on('connect_error', (error) => {
      clearTimeout(timeout);
      assert(false, `Reconnection test failed: ${error.message}`);
      resolve();
    });
  });
}

async function runAllTests() {
  log('🚀 Starting Sync Server Tests');
  log('================================');

  await testAuthentication();
  await testWebSocketConnection();
  await testMultiClientConnection();
  await testSessionSynchronization();
  await testRealtimeEvents();
  await testDeviceManagement();
  await testOfflineReconnection();

  log('\n================================');
  log('📊 Test Results Summary');
  log('================================');
  log(`Total Tests: ${testResults.passed + testResults.failed}`);
  log(`✅ Passed: ${testResults.passed}`);
  log(`❌ Failed: ${testResults.failed}`);
  log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

  if (testResults.failed > 0) {
    log('\n❌ Failed Tests:');
    testResults.tests
      .filter(test => test.status === 'FAIL')
      .forEach(test => log(`  - ${test.message}`));
  }

  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Install socket.io-client if not available
try {
  require('socket.io-client');
} catch (error) {
  console.log('Installing socket.io-client...');
  const { execSync } = require('child_process');
  execSync('npm install socket.io-client', { stdio: 'inherit' });
}

runAllTests().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});