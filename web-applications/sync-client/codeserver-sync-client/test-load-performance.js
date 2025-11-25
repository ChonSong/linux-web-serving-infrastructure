#!/usr/bin/env node

const { io } = require('socket.io-client');
const SYNC_SERVER_URL = 'http://localhost:3010';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4N2Q2NDI4ZS05MWFjLTRjOTItYWM2Mi0zYmZjMDVmM2Y3NjUiLCJpYXQiOjE3NjM5NDk1NDAsImV4cCI6MTc2NjU0MTU0MH0.Rl2PUJr80hjOGIxc4G1MXfgURkrsaQwbu9z4uG1zVuE';

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

class PerformanceTester {
  constructor() {
    this.metrics = {
      connections: [],
      messages: [],
      latencies: [],
      errors: []
    };
  }

  async testConcurrentConnections(clientCount = 50) {
    log(`\n🚀 Testing ${clientCount} concurrent WebSocket connections...`);

    const startTime = Date.now();
    const clients = [];
    let connectedCount = 0;

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        log(`❌ Connection timeout after 30 seconds`);
        clients.forEach(client => client.disconnect());
        resolve({ success: false, connectedCount, totalTime: Date.now() - startTime });
      }, 30000);

      for (let i = 0; i < clientCount; i++) {
        const socket = io(SYNC_SERVER_URL, {
          auth: { token: TEST_TOKEN },
          query: {
            deviceInfo: JSON.stringify({
              name: `Load Test Client ${i}`,
              type: 'desktop',
              userAgent: 'Load Test Client',
              platform: 'Linux'
            })
          },
          transports: ['websocket']
        });

        clients.push(socket);

        const connectTime = Date.now();
        socket.on('connect', () => {
          connectedCount++;
          const latency = Date.now() - connectTime;
          this.metrics.connections.push(latency);
          this.metrics.latencies.push(latency);

          log(`Client ${i} connected (${connectedCount}/${clientCount}) - Latency: ${latency}ms`);

          if (connectedCount === clientCount) {
            clearTimeout(timeout);
            const totalTime = Date.now() - startTime;
            log(`✅ All ${clientCount} clients connected in ${totalTime}ms`);

            // Disconnect all clients
            clients.forEach(client => client.disconnect());
            resolve({ success: true, connectedCount, totalTime });
          }
        });

        socket.on('connect_error', (error) => {
          clearTimeout(timeout);
          this.metrics.errors.push({ type: 'connection_error', message: error.message, client: i });
          log(`❌ Client ${i} failed to connect: ${error.message}`);
          resolve({ success: false, connectedCount, error: error.message, totalTime: Date.now() - startTime });
        });
      }
    });
  }

  async testMessageThroughput(clientCount = 20, messagesPerClient = 100) {
    log(`\n📨 Testing message throughput: ${clientCount} clients, ${messagesPerClient} messages each...`);

    const clients = [];
    let connectedCount = 0;
    let totalMessagesReceived = 0;
    const expectedMessages = clientCount * messagesPerClient;

    return new Promise((resolve) => {
      const startTime = Date.now();
      const timeout = setTimeout(() => {
        log(`❌ Message test timeout after 60 seconds`);
        clients.forEach(client => client.disconnect());
        resolve({
          success: false,
          totalMessagesReceived,
          expectedMessages,
          totalTime: Date.now() - startTime
        });
      }, 60000);

      // Connect clients
      for (let i = 0; i < clientCount; i++) {
        const socket = io(SYNC_SERVER_URL, {
          auth: { token: TEST_TOKEN },
          query: {
            deviceInfo: JSON.stringify({
              name: `Throughput Test Client ${i}`,
              type: 'mobile',
              userAgent: 'Throughput Test Client'
            })
          }
        });

        clients.push(socket);

        socket.on('connect', () => {
          connectedCount++;

          if (connectedCount === clientCount) {
            log(`✅ All ${clientCount} clients connected, starting message test`);

            // Setup message reception on first client
            clients[0].on('session-updated', (data) => {
              totalMessagesReceived++;
            });

            clients[0].on('realtime-event', (data) => {
              totalMessagesReceived++;
            });

            // Send messages from all clients
            const messageStartTime = Date.now();
            let messagesSent = 0;

            for (let clientIndex = 0; clientIndex < clientCount; clientIndex++) {
              for (let msgIndex = 0; msgIndex < messagesPerClient; msgIndex++) {
                setTimeout(() => {
                  // Alternate between session updates and realtime events
                  if (msgIndex % 2 === 0) {
                    clients[clientIndex].emit('session-update', {
                      sessionKey: `test-key-${clientIndex}-${msgIndex}`,
                      state: { value: `message-${msgIndex}`, timestamp: Date.now() }
                    });
                  } else {
                    clients[clientIndex].emit('realtime-event', {
                      type: 'test-message',
                      payload: { clientId: clientIndex, messageId: msgIndex }
                    });
                  }

                  messagesSent++;
                  if (messagesSent === expectedMessages) {
                    const messageEndTime = Date.now();
                    const messageTime = messageEndTime - messageStartTime;

                    setTimeout(() => {
                      clearTimeout(timeout);
                      const totalTime = Date.now() - startTime;
                      log(`✅ Message test completed in ${totalTime}ms`);
                      log(`📊 Messages sent: ${messagesSent}, Messages received: ${totalMessagesReceived}`);

                      clients.forEach(client => client.disconnect());
                      resolve({
                        success: true,
                        totalMessagesReceived,
                        expectedMessages,
                        messageTime,
                        totalTime
                      });
                    }, 2000); // Wait for messages to propagate
                  }
                }, msgIndex * 10); // Small delay between messages
              }
            }
          }
        });

        socket.on('connect_error', (error) => {
          clearTimeout(timeout);
          this.metrics.errors.push({ type: 'connection_error', message: error.message });
          log(`❌ Throughput test client ${i} failed to connect: ${error.message}`);
          resolve({ success: false, error: error.message });
        });
      }
    });
  }

  async testAuthLoad(requestCount = 100) {
    log(`\n🔐 Testing authentication load: ${requestCount} concurrent login requests...`);

    const startTime = Date.now();
    const promises = [];

    for (let i = 0; i < requestCount; i++) {
      promises.push(
        fetch(`${SYNC_SERVER_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@codeovertcp.com',
            password: 'test123456'
          })
        }).then(response => {
          return {
            status: response.status,
            success: response.ok,
            latency: Date.now() - startTime
          };
        }).catch(error => {
          this.metrics.errors.push({ type: 'auth_error', message: error.message });
          return { success: false, error: error.message };
        })
      );
    }

    const results = await Promise.all(promises);
    const successful = results.filter(r => r.success).length;
    const totalTime = Date.now() - startTime;

    log(`✅ Auth load test completed: ${successful}/${requestCount} successful in ${totalTime}ms`);

    return {
      success: true,
      totalRequests: requestCount,
      successful,
      failed: requestCount - successful,
      totalTime,
      averageLatency: totalTime / requestCount
    };
  }

  generateReport() {
    log('\n📊 Performance Test Report');
    log('============================');

    // Connection metrics
    if (this.metrics.connections.length > 0) {
      const avgConnectionTime = this.metrics.connections.reduce((a, b) => a + b, 0) / this.metrics.connections.length;
      const minConnectionTime = Math.min(...this.metrics.connections);
      const maxConnectionTime = Math.max(...this.metrics.connections);

      log('\n🔌 Connection Performance:');
      log(`  Average connection time: ${avgConnectionTime.toFixed(2)}ms`);
      log(`  Min connection time: ${minConnectionTime}ms`);
      log(`  Max connection time: ${maxConnectionTime}ms`);
      log(`  Total connections tested: ${this.metrics.connections.length}`);
    }

    // Latency metrics
    if (this.metrics.latencies.length > 0) {
      const avgLatency = this.metrics.latencies.reduce((a, b) => a + b, 0) / this.metrics.latencies.length;
      const p50 = this.metrics.latencies.sort((a, b) => a - b)[Math.floor(this.metrics.latencies.length * 0.5)];
      const p95 = this.metrics.latencies.sort((a, b) => a - b)[Math.floor(this.metrics.latencies.length * 0.95)];

      log('\n⚡ Latency Metrics:');
      log(`  Average latency: ${avgLatency.toFixed(2)}ms`);
      log(`  50th percentile: ${p50}ms`);
      log(`  95th percentile: ${p95}ms`);
    }

    // Error summary
    if (this.metrics.errors.length > 0) {
      log('\n❌ Errors:');
      const errorTypes = {};
      this.metrics.errors.forEach(error => {
        errorTypes[error.type] = (errorTypes[error.type] || 0) + 1;
      });
      Object.entries(errorTypes).forEach(([type, count]) => {
        log(`  ${type}: ${count}`);
      });
    } else {
      log('\n✅ No errors encountered');
    }
  }
}

async function runPerformanceTests() {
  log('🏁 Starting Performance & Load Tests');
  log('===================================');

  const tester = new PerformanceTester();

  // Test 1: Concurrent connections
  const connectionTest = await tester.testConcurrentConnections(25);

  // Test 2: Message throughput
  const throughputTest = await tester.testMessageThroughput(10, 50);

  // Test 3: Authentication load
  const authTest = await tester.testAuthLoad(50);

  // Generate comprehensive report
  tester.generateReport();

  // Individual test summaries
  log('\n📋 Individual Test Results');
  log('============================');

  log('\n🔌 Concurrent Connections Test:');
  if (connectionTest.success) {
    log(`  ✅ Success: ${connectionTest.connectedCount} clients connected`);
    log(`  ⏱️  Total time: ${connectionTest.totalTime}ms`);
    log(`  📈 Average per client: ${(connectionTest.totalTime / connectionTest.connectedCount).toFixed(2)}ms`);
  } else {
    log(`  ❌ Failed: ${connectionTest.error || 'Timeout'}`);
  }

  log('\n📨 Message Throughput Test:');
  if (throughputTest.success) {
    const throughput = (throughputTest.expectedMessages / (throughputTest.messageTime / 1000)).toFixed(2);
    log(`  ✅ Success: ${throughputTest.totalMessagesReceived}/${throughputTest.expectedMessages} messages received`);
    log(`  ⚡ Throughput: ${throughput} messages/second`);
    log(`  ⏱️  Message time: ${throughputTest.messageTime}ms`);
  } else {
    log(`  ❌ Failed: ${throughputTest.error || 'Timeout'}`);
  }

  log('\n🔐 Authentication Load Test:');
  if (authTest.success) {
    log(`  ✅ Success: ${authTest.successful}/${authTest.totalRequests} requests successful`);
    log(`  ⏱️  Total time: ${authTest.totalTime}ms`);
    log(`  📈 Average latency: ${authTest.averageLatency.toFixed(2)}ms`);
    log(`  🚀 Requests/second: ${(authTest.totalRequests / (authTest.totalTime / 1000)).toFixed(2)}`);
  } else {
    log(`  ❌ Failed: ${authTest.error || 'Unknown error'}`);
  }

  log('\n🏁 Performance tests completed');
}

runPerformanceTests().catch(error => {
  console.error('Performance test runner failed:', error);
  process.exit(1);
});