#!/usr/bin/env node

/**
 * Smoke test for Bingo Caller HTTP API
 * Run with: node scripts/smoke-test.js
 * Assumes the server is already running on localhost:3000
 */

const http = require('http');
const assert = require('assert');

const BASE_URL = 'http://localhost:3000';

// Helper to make HTTP requests
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: data ? JSON.parse(data) : null,
            raw: data
          });
        } catch (err) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Test suite
async function runTests() {
  console.log('🧪 Running Bingo Caller API smoke tests...\n');

  try {
    // Test 1: GET /api/state (initial ready state)
    console.log('Test 1: GET /api/state (initial)');
    let res = await makeRequest('GET', '/api/state');
    assert.strictEqual(res.statusCode, 200, 'Status should be 200');
    assert.strictEqual(res.body.game.status, 'Ready', 'Game should start as Ready');
    assert.strictEqual(res.body.game.calledCount, 0, 'Initial calledCount should be 0');
    console.log('  ✓ Initial state correct\n');

    // Test 2: POST /api/start
    console.log('Test 2: POST /api/start');
    res = await makeRequest('POST', '/api/start', { gameType: 90, delayMs: 5000 });
    assert.strictEqual(res.statusCode, 200, 'Status should be 200');
    assert.strictEqual(res.body.ok, true, 'Should return ok:true');
    console.log('  ✓ Game started\n');

    // Test 3: GET /api/state (after start)
    console.log('Test 3: GET /api/state (after start)');
    res = await makeRequest('GET', '/api/state');
    assert.strictEqual(res.body.game.gameRunning, true, 'gameRunning should be true');
    assert.strictEqual(res.body.game.gameType, 90, 'gameType should be 90');
    console.log('  ✓ Game state reflects running state\n');

    // Test 4: POST /api/call-next (5 times)
    console.log('Test 4: POST /api/call-next (calling 5 numbers)');
    for (let i = 0; i < 5; i++) {
      res = await makeRequest('POST', '/api/call-next', {});
      assert.strictEqual(res.statusCode, 200, 'Status should be 200');
    }
    res = await makeRequest('GET', '/api/state');
    assert.strictEqual(res.body.game.calledCount, 5, 'Should have called 5 numbers');
    assert.strictEqual(res.body.game.remainingCount, 85, 'Should have 85 remaining');
    assert(res.body.game.lastNumber !== null, 'lastNumber should be set');
    assert(Array.isArray(res.body.game.calledNumbers), 'calledNumbers should be an array');
    assert.strictEqual(res.body.game.calledNumbers.length, 5, 'calledNumbers should have 5 items');
    console.log(`  ✓ Called 5 numbers: ${res.body.game.calledNumbers.join(', ')}\n`);

    // Test 5: POST /api/toggle-play
    console.log('Test 5: POST /api/toggle-play (pause)');
    res = await makeRequest('POST', '/api/toggle-play', {});
    assert.strictEqual(res.statusCode, 200, 'Status should be 200');
    res = await makeRequest('GET', '/api/state');
    assert.strictEqual(res.body.game.gamePlaying, false, 'gamePlaying should be false');
    console.log('  ✓ Game paused\n');

    // Test 6: POST /api/toggle-play (resume)
    console.log('Test 6: POST /api/toggle-play (resume)');
    res = await makeRequest('POST', '/api/toggle-play', {});
    res = await makeRequest('GET', '/api/state');
    assert.strictEqual(res.body.game.gamePlaying, true, 'gamePlaying should be true');
    console.log('  ✓ Game resumed\n');

    // Test 7: POST /api/reset
    console.log('Test 7: POST /api/reset');
    res = await makeRequest('POST', '/api/reset', {});
    assert.strictEqual(res.statusCode, 200, 'Status should be 200');
    res = await makeRequest('GET', '/api/state');
    assert.strictEqual(res.body.game.status, 'Ready', 'Game should be Ready after reset');
    assert.strictEqual(res.body.game.calledCount, 0, 'calledCount should be 0');
    assert.strictEqual(res.body.game.gameRunning, false, 'gameRunning should be false');
    console.log('  ✓ Game reset successfully\n');

    // Test 8: Test 75-ball game
    console.log('Test 8: POST /api/start with gameType=75');
    res = await makeRequest('POST', '/api/start', { gameType: 75, delayMs: 3000 });
    res = await makeRequest('GET', '/api/state');
    assert.strictEqual(res.body.game.gameType, 75, 'gameType should be 75');
    assert.strictEqual(res.body.game.remainingCount, 75, 'remainingCount should be 75');
    console.log('  ✓ 75-ball game works\n');

    // Test 9: POST /api/device/mute (requires a device to be connected via SSE)
    console.log('Test 9: POST /api/device/mute (non-existent device)');
    res = await makeRequest('POST', '/api/device/mute', {
      clientId: 'test-device-123',
      muted: true
    });
    // Should fail because device doesn't exist (no SSE connection)
    assert.strictEqual(res.statusCode, 404, 'Should return 404 for non-existent device');
    console.log('  ✓ Correctly returned 404 for non-existent device\n');

    console.log('✅ All smoke tests passed!\n');
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  }
}

// Run tests
runTests().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
