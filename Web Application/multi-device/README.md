# Bingo Caller — Multi-Device Edition

A lightweight Node.js-based bingo calling system that syncs multiple display screens across a local WiFi network. One person controls the game on a "Caller" device, and all connected display screens update instantly when numbers are called.

## Features

- **Zero Dependencies** — Runs on plain Node.js built-ins (`node:http`, `node:fs`), no `npm install` needed
- **Local Network Only** — Caller's laptop hosts a small server; displays connect via LAN IP (no internet required)
- **Live Sync** — All displays update in lockstep when a number is called (via Server-Sent Events)
- **Per-Device Audio Control** — Each connected device can independently announce called numbers, with mute/unmute controls from the caller's panel
- **Crash Recovery** — Game state saves to disk on every call; if the server crashes mid-game, restart it to resume
- **Responsive Design** — Works on tablets, phones, TVs, and desktop browsers
- **Fullscreen Mode** — Display screens can go fullscreen for presentation on a big screen

## Running the Server

### Quickstart

1. **On the caller's laptop**, navigate to this folder and start the server:
   ```bash
   node server.js
   ```
   Or if you prefer to specify a port:
   ```bash
   node server.js 8080
   ```

   The server will print something like:
   ```
   Bingo Caller server running on port 8080
     On this laptop:  http://localhost:8080/caller.html
     On the venue WiFi (share with displays): http://192.168.1.42:8080/display.html
   ```

2. **On the caller's laptop**, open the browser to **`http://localhost:8080/caller.html`** (or the URL shown above)

3. **On each display device** (tablets, TVs, phones), open a browser and navigate to the LAN IP shown in step 1, with `/display.html` at the end. For example:
   - **`http://192.168.1.42:8080/display.html`** (replace IP with the one shown by the server)
   - Or just go to **`http://192.168.1.42:8080/`** and tap the "Display Screen" link

### Configuration

- **Port**: Pass a port number as the first argument: `node server.js 3000` (default: 8080)
- **Environment variable**: `PORT=3000 node server.js`

## How It Works

### Server

The server maintains a single authoritative game state in memory. When the caller:
- Clicks "Start Game" — a new game is initialized with the chosen game type (75 or 90 ball) and call delay
- Clicks "Call Next" — the server draws the next number and broadcasts it to all connected devices
- Clicks "Pause" or "Resume" — the auto-timer starts/stops
- Changes a device's mute flag — the server updates that device's setting and re-broadcasts

Every mutation (start, call, pause, reset, mute) is saved to `data/game-state.json` for crash recovery.

### Caller Device

The "Caller Control" page (`caller.html`) provides:
- **Game Settings** — Choose 75-ball or 90-ball, set call delay (100–60,000ms, default 5,000ms)
- **Controls** — Start, Pause/Resume, Call Next, Reset
- **Status Display** — Shows the last number called and the game status
- **Called Numbers Log** — Scrollable list of all called numbers
- **Connected Devices Panel** — Table showing all connected devices, with mute/unmute buttons and inline rename capability

### Display Device(s)

The "Display Screen" page (`display.html`) shows:
- **Ball Grid** — All numbers for the game type, colored green when called
- **Last Number** — Large display of the most recently called number + its bingo call name
- **Last 5 Numbers** — The 5 most recently called numbers in blue
- **Status Bar** — Current game status and counts (called vs. remaining)
- **Fullscreen Button** — Toggle fullscreen mode for big-screen presentation
- **Auto-Announce** — When a new number is called, the device speaks it (using Web Speech API), unless muted by the caller

## Game Modes

### Auto-Mode (Default)

After starting a game, numbers are automatically called at the configured delay (default 5 seconds). The pause button lets the caller pause and resume auto-calling.

### Manual Mode

Click "Call Next" to call one number at a time without waiting for the auto-timer.

### Pause Between Calls

Click "Pause" to stop auto-calling. Click "Resume" to start again. You can also manually call numbers while paused.

## Audio/Speech

- **Announcement**: When a number is called, the device speaks the bingo call name (e.g. "Kelly's eye, number 1") using the browser's built-in Web Speech API
- **Mute Control**: The caller can mute/unmute any connected device from the "Connected Devices" panel
  - Muted devices will not speak when a new number is called
  - Display and caller devices can be muted independently
  - Useful if one screen is connected to a PA system (unmute it), and others are just for visuals (mute them)

## Crash Recovery

If the server crashes or is restarted mid-game:

1. Restart the server: `node server.js`
2. The server will automatically load the saved game state from `data/game-state.json`
3. The game resumes exactly where it left off (same shuffled draw order, same called numbers)
4. Any connected devices automatically re-sync to the recovered state

To start a **fresh game** instead of resuming, either:
- Delete the `data/game-state.json` file before starting the server
- Click "Reset" in the caller control panel once the server is running

## Firewall

If other devices on the WiFi can't connect, check your laptop's firewall:

- **Windows**: Make sure Node.js has permission for inbound connections on the port you're using (Windows Firewall may prompt you automatically)
- **macOS**: System Preferences > Security & Privacy > Firewall, or add Node.js to allowed apps
- **Linux**: Use `iptables` or `ufw` if enabled

You can test connectivity from another device on the same WiFi:
```bash
curl http://192.168.1.42:8080/api/state
```
If you get a response, the server is reachable.

## Testing

Run the included smoke test to verify the HTTP API is working:

```bash
node scripts/smoke-test.js
```

This tests:
- Starting a game
- Calling numbers
- Pausing/resuming
- Resetting
- Toggling between 75 and 90-ball modes

The server must already be running on `localhost:3000` for the smoke test to pass.

## Architecture

```
server.js
├── lib/game-state.js       — Game logic (shuffle, callNext, togglePlay, reset)
├── lib/devices.js          — Device registry (connect, mute, rename)
├── lib/persistence.js      — Crash recovery (load/save to disk)
└── public/
    ├── index.html          — Hub page with links to caller/display
    ├── caller.html         — Caller control panel
    ├── display.html        — Display-only game screen
    └── shared/
        ├── bingo-data.js   — Bingo call names (1–90)
        ├── client-id.js    — UUID generation & persistence
        ├── speech.js       — Text-to-speech helper
        ├── sse-client.js   — SSE client wrapper
        ├── announcer.js    — Auto-announce logic
        └── styles.css      — Shared dark-theme CSS
```

## API Endpoints (for advanced users)

### GET `/api/state`
Returns the current game state and connected devices:
```json
{
  "game": {
    "gameType": 90,
    "delayMs": 5000,
    "gameRunning": true,
    "gamePlaying": true,
    "calledNumbers": [1, 23, 45, ...],
    "lastNumber": 45,
    "lastFive": [45, 23, 5, 2, 1],
    "calledCount": 5,
    "remainingCount": 85,
    "status": "Playing"
  },
  "devices": [
    {"id":"uuid-1","role":"caller","name":"Caller 1","muted":false,"connected":true},
    {"id":"uuid-2","role":"display","name":"Stage TV","muted":false,"connected":true}
  ]
}
```

### GET `/events?clientId=<uuid>&role=<caller|display>`
Server-Sent Events endpoint. Client connects here to receive live state updates.

### POST `/api/start`
Start a new game.
```json
{"gameType": 90, "delayMs": 5000}
```

### POST `/api/call-next`
Manually call the next number.

### POST `/api/toggle-play`
Pause or resume auto-calling.

### POST `/api/reset`
Reset to ready state.

### POST `/api/device/mute`
Mute or unmute a device.
```json
{"clientId": "uuid-...", "muted": true}
```

### POST `/api/device/rename`
Rename a device (max 40 characters).
```json
{"clientId": "uuid-...", "name": "Stage TV"}
```

## Troubleshooting

### Displays don't connect
- Check that both devices are on the same WiFi network
- Verify the LAN IP is correct (shown when server starts)
- Test with `curl http://192.168.1.42:8080/api/state` from the display device
- Check the caller laptop's firewall

### Numbers don't announce
- Check that the display device's volume is on
- Verify the browser supports Web Speech API (most modern browsers do)
- Unmute the device from the caller's "Connected Devices" panel

### Server crashed during a game
- Restart the server: it will automatically resume the game from the last saved state
- If you want a fresh game instead, delete `data/game-state.json` first

### Multiple tabs on the same device
- The same device (same browser profile) will share one client ID, so opening caller.html in two tabs will cause only the newest tab to receive updates
- To test with multiple devices, use different browsers, devices, or incognito/private mode

## Legacy / Offline Mode

The original single-file bingo caller (`../index.html`) is still available at `../` in this repo. It requires no server and works completely offline on a single device. Use it if you don't need multi-device sync or don't want to run a local server.

## License

This is part of the Scues Bingo Night project.
