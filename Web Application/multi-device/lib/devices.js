/**
 * Device registry — tracks all connected clients (caller and displays)
 * Devices persist across disconnects (only marked as disconnected, not deleted)
 * so that mute/rename settings survive refreshes.
 */

const devices = new Map();
let nextCaller = 1;
let nextDisplay = 1;

/**
 * Register/reconnect a device
 * Generates a friendly name on first connect if one doesn't exist
 */
function connect(clientId, role, res) {
  let device = devices.get(clientId);

  if (!device) {
    // First time connecting — auto-assign a name based on role
    const name = role === 'caller' ? `Caller ${nextCaller++}` : `Display ${nextDisplay++}`;
    device = {
      id: clientId,
      role,
      name,
      muted: false,
      connected: true,
      res,
      connectedAt: Date.now()
    };
    devices.set(clientId, device);
  } else {
    // Reconnecting — update the connection details
    device.res = res;
    device.connected = true;
    device.role = role; // in case it changed
  }

  return device;
}

/**
 * Mark a device as disconnected
 * Note: device persists in the registry with connected=false
 */
function disconnect(clientId) {
  const device = devices.get(clientId);
  if (device) {
    device.res = null;
    device.connected = false;
  }
}

/**
 * Update a device's mute flag
 */
function setMuted(clientId, muted) {
  const device = devices.get(clientId);
  if (device) {
    device.muted = !!muted;
  }
  return device;
}

/**
 * Update a device's display name
 */
function setName(clientId, name) {
  const device = devices.get(clientId);
  if (device) {
    // Trim and limit length, but keep the auto-generated name as fallback
    const newName = (name || '').trim().slice(0, 40);
    device.name = newName || device.name;
  }
  return device;
}

/**
 * Get all devices in a format safe to broadcast
 * Strips the raw SSE response object since clients don't need it
 */
function listPublic() {
  return [...devices.values()].map(({ res, ...rest }) => rest);
}

/**
 * Get all devices (internal use only)
 * Includes the raw `res` object needed for broadcasting
 */
function all() {
  return devices;
}

/**
 * Clear all devices (used for testing/reset)
 */
function clear() {
  devices.clear();
  nextCaller = 1;
  nextDisplay = 1;
}

module.exports = {
  connect,
  disconnect,
  setMuted,
  setName,
  listPublic,
  all,
  clear
};
