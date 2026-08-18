const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const gameState = require('./lib/game-state');
const devicesRegistry = require('./lib/devices');
const persistence = require('./lib/persistence');
const playersManager = require('./lib/players');

const PORT = process.env.PORT || process.argv[2] || 8080;
const PUBLIC_DIR = path.join(__dirname, 'public');

// In-memory game state (single authoritative game at a time)
let state = gameState.createInitialState();

// Server-owned auto-call timer
let autoTimer = null;

// Content type mapping
const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain'
};

// Helper: get LAN IP address
function getLanIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Helper: safe static file serving
function serveStaticFile(filePath, res) {
  // Prevent path traversal attacks
  const resolvedPath = path.resolve(filePath);
  if (!resolvedPath.startsWith(path.resolve(PUBLIC_DIR))) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  fs.stat(resolvedPath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    const ext = path.extname(resolvedPath);
    const contentType = CONTENT_TYPES[ext] || 'application/octet-stream';

    fs.readFile(resolvedPath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
}

// Helper: read request body
function readBody(req, callback) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    try {
      const data = body ? JSON.parse(body) : {};
      callback(null, data);
    } catch (err) {
      callback(err);
    }
  });
}

// Helper: broadcast current state to all connected devices via SSE
function broadcastState() {
  const payload = {
    type: 'state',
    game: gameState.publicView(state),
    devices: devicesRegistry.listPublic()
  };

  const message = `event: state\ndata: ${JSON.stringify(payload)}\n\n`;

  // Send to all connected devices
  devicesRegistry.all().forEach((device) => {
    if (device.res && device.connected) {
      try {
        device.res.write(message);
      } catch (err) {
        // Device disconnected, mark it
        devicesRegistry.disconnect(device.id);
      }
    }
  });
}

// Helper: start or restart the auto-call timer
function startAutoTimer() {
  if (autoTimer) clearInterval(autoTimer);

  if (!state.gameRunning || !state.gamePlaying) {
    return; // Don't start timer if not playing
  }

  autoTimer = setInterval(() => {
    if (state.gamePlaying && state.gameRunning && state.pool.length > 0) {
      gameState.callNext(state);
      broadcastState();
      persistence.saveState(state);
    }
  }, state.delayMs);
}

// Helper: stop the auto-call timer
function stopAutoTimer() {
  if (autoTimer) {
    clearInterval(autoTimer);
    autoTimer = null;
  }
}

// Keep-alive ping (every 20 seconds) to prevent idle connection timeout
function startKeepAlive() {
  setInterval(() => {
    devicesRegistry.all().forEach((device) => {
      if (device.res && device.connected) {
        try {
          device.res.write(':\n\n');
        } catch (err) {
          devicesRegistry.disconnect(device.id);
        }
      }
    });
  }, 20000);
}

// HTTP request handler
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  const pathname = url.pathname;

  // SSE: /events?clientId=<uuid>&role=<caller|display>
  if (pathname === '/events' && req.method === 'GET') {
    const clientId = url.searchParams.get('clientId');
    const role = url.searchParams.get('role');

    if (!clientId || !role || (role !== 'caller' && role !== 'display')) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Missing or invalid clientId/role');
      return;
    }

    // Register device and get its entry
    devicesRegistry.connect(clientId, role, res);

    // SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    // Send immediate full snapshot
    broadcastState();

    // Cleanup on disconnect
    req.on('close', () => {
      devicesRegistry.disconnect(clientId);
    });

    return;
  }

  // GET /api/state — read-only snapshot
  if (pathname === '/api/state' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      game: gameState.publicView(state),
      devices: devicesRegistry.listPublic()
    }));
    return;
  }

  // POST /api/start
  if (pathname === '/api/start' && req.method === 'POST') {
    readBody(req, (err, body) => {
      if (err) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid JSON');
        return;
      }

      stopAutoTimer(); // Clear any existing timer
      gameState.startGame(state, {
        gameType: body.gameType || 90,
        delayMs: body.delayMs || 5000
      });

      broadcastState();
      persistence.saveState(state);
      startAutoTimer(); // Start the new game's auto-timer

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    });
    return;
  }

  // POST /api/call-next
  if (pathname === '/api/call-next' && req.method === 'POST') {
    readBody(req, (err) => {
      if (err) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid JSON');
        return;
      }

      if (!state.gameRunning || state.pool.length === 0) {
        res.writeHead(409, { 'Content-Type': 'text/plain' });
        res.end('Game not running or already complete');
        return;
      }

      gameState.callNext(state);
      broadcastState();
      persistence.saveState(state);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    });
    return;
  }

  // POST /api/toggle-play
  if (pathname === '/api/toggle-play' && req.method === 'POST') {
    readBody(req, (err) => {
      if (err) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid JSON');
        return;
      }

      if (!state.gameRunning) {
        res.writeHead(409, { 'Content-Type': 'text/plain' });
        res.end('Game not running');
        return;
      }

      gameState.togglePlay(state);
      broadcastState();
      persistence.saveState(state);

      // Start or stop the auto-timer based on new play state
      if (state.gamePlaying && state.pool.length > 0) {
        startAutoTimer();
      } else {
        stopAutoTimer();
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    });
    return;
  }

  // POST /api/reset
  if (pathname === '/api/reset' && req.method === 'POST') {
    readBody(req, (err) => {
      if (err) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid JSON');
        return;
      }

      stopAutoTimer();
      gameState.reset(state);
      broadcastState();
      persistence.saveState(state);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    });
    return;
  }

  // POST /api/device/mute
  if (pathname === '/api/device/mute' && req.method === 'POST') {
    readBody(req, (err, body) => {
      if (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
        return;
      }

      const clientId = body.clientId;
      const muted = body.muted;

      const device = devicesRegistry.setMuted(clientId, muted);
      if (!device) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Device not found' }));
        return;
      }

      broadcastState();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    });
    return;
  }

  // POST /api/device/rename
  if (pathname === '/api/device/rename' && req.method === 'POST') {
    readBody(req, (err, body) => {
      if (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
        return;
      }

      const clientId = body.clientId;
      const name = body.name;

      const device = devicesRegistry.setName(clientId, name);
      if (!device) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Device not found' }));
        return;
      }

      broadcastState();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    });
    return;
  }

  // GET /api/players
  if (pathname === '/api/players' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(playersManager.getPlayers()));
    return;
  }

  // POST /api/players
  if (pathname === '/api/players' && req.method === 'POST') {
    readBody(req, (err, body) => {
      if (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
        return;
      }

      const name = body.name;
      if (!name || typeof name !== 'string') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing or invalid name' }));
        return;
      }

      try {
        const player = playersManager.addPlayer(name);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(player));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // DELETE /api/players/:id
  if (pathname.startsWith('/api/players/') && req.method === 'DELETE') {
    const playerId = pathname.slice('/api/players/'.length);

    try {
      playersManager.deletePlayer(playerId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    } catch (err) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // POST /api/players/:id/prize
  if (pathname.match(/^\/api\/players\/[^/]+\/prize$/) && req.method === 'POST') {
    const playerId = pathname.split('/')[3];

    readBody(req, (err, body) => {
      if (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
        return;
      }

      const prizeType = body.prizeType;
      if (!prizeType || (prizeType !== 'line' && prizeType !== 'house')) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid or missing prizeType (must be "line" or "house")' }));
        return;
      }

      try {
        const player = playersManager.addPrize(playerId, prizeType);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(player));
      } catch (err) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // POST /api/players/reset
  if (pathname === '/api/players/reset' && req.method === 'POST') {
    readBody(req, (err) => {
      if (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
        return;
      }

      playersManager.resetPlayers();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    });
    return;
  }

  // GET / → hub page
  if (pathname === '/' && req.method === 'GET') {
    serveStaticFile(path.join(PUBLIC_DIR, 'index.html'), res);
    return;
  }

  // GET static files
  if (req.method === 'GET') {
    const filePath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
    serveStaticFile(path.join(PUBLIC_DIR, filePath), res);
    return;
  }

  // Unknown route
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

// Initialize on startup
server.listen(PORT, () => {
  // Try to resume an in-progress game from disk
  const savedState = persistence.loadState();
  if (savedState && savedState.gameRunning) {
    state = savedState;
    console.log(
      `\n✅ Resumed in-progress game: ${state.gameType}-ball, ${state.calledNumbers.length} numbers already called\n`
    );

    // If the resumed game was playing, restart auto-timer
    if (state.gamePlaying && state.pool.length > 0) {
      startAutoTimer();
    }
  } else {
    console.log('\n🆕 Starting fresh game\n');
  }

  const lanIp = getLanIp();
  console.log(`Bingo Caller server running on port ${PORT}`);
  console.log(`  On this laptop:  http://localhost:${PORT}/caller.html`);
  console.log(`  On the venue WiFi (share with displays): http://${lanIp}:${PORT}/display.html`);
  console.log(`\nIf other devices can't connect, check this laptop's firewall`);
  console.log(`is allowing inbound connections on port ${PORT} for Node.js.\n`);

  // Start keep-alive pings
  startKeepAlive();
});

process.on('SIGINT', () => {
  console.log('\nServer shutting down...');
  stopAutoTimer();
  process.exit(0);
});
