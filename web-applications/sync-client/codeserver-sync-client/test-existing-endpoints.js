#!/usr/bin/env node

// Test only the existing endpoints in the sync server
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
      if (responseData.token) log(`Token received: ${responseData.token.substring(0, 20)}...`);
      if (responseData.devices) log(`Devices count: ${responseData.devices.length}`);
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

async function testExistingEndpoints() {
  log('🔍 Testing Existing REST API Endpoints');
  log('=====================================');

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
  }, {}, 201)); // Note: Register returns 201

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
  results.push(await testEndpoint('GET', '/api/session', null, authHeaders, 200));

  // Test endpoints without auth
  results.push(await testEndpoint('GET', '/api/devices', null, {}, 401));
  results.push(await testEndpoint('GET', '/api/session', null, {}, 401));

  // Test endpoint with invalid token
  results.push(await testEndpoint('GET', '/api/devices', null, {
    'Authorization': 'Bearer invalid.token.here'
  }, 403)); // Note: Invalid token returns 403

  // Test health endpoint
  log('\n🏥 Server Status Endpoints');

  results.push(await testEndpoint('GET', '/api/health', null, {}, 200));

  // Test root endpoint (should serve HTML)
  log('\n🏠 Root Endpoint');
  try {
    const response = await fetch(`${SYNC_SERVER_URL}/`);
    log(`GET / - Status: ${response.status}`);
    const text = await response.text();
    if (text.includes('<!DOCTYPE html>')) {
      log(`✅ PASS: Root endpoint serves HTML login page`);
      results.push({ success: true, endpoint: '/', status: response.status });
    } else {
      log(`❌ FAIL: Root endpoint doesn't serve HTML`);
      results.push({ success: false, endpoint: '/', status: response.status });
    }
  } catch (error) {
    log(`❌ ERROR: Root endpoint - ${error.message}`);
    results.push({ success: false, endpoint: '/', error: error.message });
  }

  // Summary
  log('\n=====================================');
  log('📊 API Test Results Summary');
  log('=====================================');

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
        log(`  - Test ${index + 1}: ${result.endpoint || 'Unknown'} - ${result.error || 'Unexpected status'}`);
      }
    });
  }

  return { passed, failed, total };
}

testExistingEndpoints().catch(error => {
  console.error('API test runner failed:', error);
  process.exit(1);
});