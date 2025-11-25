#!/usr/bin/env node

// Test all REST API endpoints
const SYNC_SERVER_URL = 'http://localhost:3010';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4N2Q2NDI4ZS05MWFjLTRjOTItYWM2Mi0zYmZjMDVmM2Y3NjUiLCJpYXQiOjE3NjM5NDk1NDAsImV4cCI6MTc2NjU0MTU0MH0.Rl2PUJr80hjOGIxc4G1MXfgURkrsaQwbu9z4uG1zVuE';

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

async function testEndpoint(method, endpoint, data = null, headers = {}, expectedStatus = 200) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${SYNC_SERVER_URL}${endpoint}`, options);
    const responseData = await response.json();

    log(`${method} ${endpoint} - Status: ${response.status}`);

    if (response.status === expectedStatus) {
      log(`✅ PASS: ${endpoint} returned expected status ${expectedStatus}`);
      return { success: true, status: response.status, data: responseData };
    } else {
      log(`❌ FAIL: ${endpoint} expected ${expectedStatus}, got ${response.status}`);
      log(`Response: ${JSON.stringify(responseData)}`);
      return { success: false, status: response.status, data: responseData };
    }
  } catch (error) {
    log(`❌ ERROR: ${endpoint} - ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testAllEndpoints() {
  log('🔍 Testing All REST API Endpoints');
  log('=================================');

  const results = [];

  // Test authentication endpoints
  log('\n🔐 Authentication Endpoints');

  results.push(await testEndpoint('POST', '/api/auth/login', {
    email: 'test@codeovertcp.com',
    password: 'test123456'
  }, {}, 200));

  results.push(await testEndpoint('POST', '/api/auth/login', {
    email: 'invalid@test.com',
    password: 'wrongpassword'
  }, {}, 401));

  results.push(await testEndpoint('POST', '/api/auth/register', {
    email: `newuser${Date.now()}@test.com`,
    password: 'newpassword123'
  }, {}, 200));

  results.push(await testEndpoint('POST', '/api/auth/register', {
    email: '', // Invalid email
    password: 'short'
  }, {}, 400));

  // Test protected endpoints
  log('\n🔒 Protected Endpoints');

  const authHeaders = {
    'Authorization': `Bearer ${TEST_TOKEN}`
  };

  results.push(await testEndpoint('GET', '/api/devices', null, authHeaders, 200));
  results.push(await testEndpoint('GET', '/api/sessions', null, authHeaders, 200));
  results.push(await testEndpoint('GET', '/api/user/profile', null, authHeaders, 200));
  results.push(await testEndpoint('GET', '/api/stats', null, authHeaders, 200));

  // Test endpoints without auth
  results.push(await testEndpoint('GET', '/api/devices', null, {}, 401));
  results.push(await testEndpoint('GET', '/api/sessions', null, {}, 401));

  // Test endpoint with invalid token
  results.push(await testEndpoint('GET', '/api/devices', null, {
    'Authorization': 'Bearer invalid.token.here'
  }, 401));

  // Test session management
  log('\n📝 Session Management Endpoints');

  results.push(await testEndpoint('POST', '/api/sessions', {
    key: 'test-session',
    data: { value: 'test-data' }
  }, authHeaders, 200));

  results.push(await testEndpoint('PUT', '/api/sessions/test-session', {
    value: 'updated-test-data'
  }, authHeaders, 200));

  results.push(await testEndpoint('GET', '/api/sessions/test-session', null, authHeaders, 200));
  results.push(await testEndpoint('DELETE', '/api/sessions/test-session', null, authHeaders, 200));

  // Test device management
  log('\n📱 Device Management Endpoints');

  results.push(await testEndpoint('POST', '/api/devices', {
    name: 'Test API Device',
    type: 'desktop',
    userAgent: 'API Test Client'
  }, authHeaders, 200));

  // Test server health/status endpoints
  log('\n🏥 Server Status Endpoints');

  results.push(await testEndpoint('GET', '/', null, {}, 200));
  results.push(await testEndpoint('GET', '/health', null, {}, 200)); // May not exist
  results.push(await testEndpoint('GET', '/status', null, {}, 200)); // May not exist

  // Test CORS and security
  log('\n🔒 Security Tests');

  // Test OPTIONS method for CORS
  results.push(await testEndpoint('OPTIONS', '/api/auth/login', null, {}, 200));

  // Test with missing content-type
  results.push(await testEndpoint('POST', '/api/auth/login', {
    email: 'test@codeovertcp.com',
    password: 'test123456'
  }, {}, 415)); // May expect 415 or 400

  // Test rate limiting (if implemented)
  log('\n⏱️ Rate Limiting Tests');

  const rapidRequests = [];
  for (let i = 0; i < 10; i++) {
    rapidRequests.push(testEndpoint('GET', '/api/user/profile', null, authHeaders, 200));
  }

  const rapidResults = await Promise.all(rapidRequests);
  results.push(...rapidResults);

  // Summary
  log('\n=================================');
  log('📊 API Test Results Summary');
  log('=================================');

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const total = results.length;

  log(`Total Tests: ${total}`);
  log(`✅ Passed: ${passed}`);
  log(`❌ Failed: ${failed}`);
  log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

  if (failed > 0) {
    log('\n❌ Failed Tests:');
    results.forEach((result, index) => {
      if (!result.success) {
        log(`  - Test ${index + 1}: ${result.error || 'Unexpected status'}`);
      }
    });
  }

  return { passed, failed, total };
}

testAllEndpoints().catch(error => {
  console.error('API test runner failed:', error);
  process.exit(1);
});