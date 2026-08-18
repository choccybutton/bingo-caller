/**
 * Client ID generation and persistence
 * Critical: crypto.randomUUID() requires a secure context (HTTPS or localhost)
 * but displays connect over plain http://192.168.x.x on the LAN.
 * Use crypto.getRandomValues() instead, which has no such restriction.
 */

function getClientId() {
  const key = 'bingoClientId';

  // Check if we already have a saved ID
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem(key);
    if (saved) return saved;
  }

  // Generate a new UUIDv4 using crypto.getRandomValues() (no secure-context requirement)
  let id;
  try {
    id = generateUUID();
  } catch (err) {
    // Fallback to Math.random() if crypto is unavailable (shouldn't happen in modern browsers)
    id = 'uuid-' + Math.random().toString(36).substr(2, 9);
  }

  // Save it
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(key, id);
    } catch (err) {
      // localStorage might be disabled; just use the in-memory ID
    }
  }

  return id;
}

/**
 * Generate a UUIDv4 using crypto.getRandomValues()
 * Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
function generateUUID() {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);

  // Set version to 4 (UUID v4)
  arr[6] = (arr[6] & 0x0f) | 0x40;
  // Set variant to RFC 4122
  arr[8] = (arr[8] & 0x3f) | 0x80;

  const hex = Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return (
    hex.substr(0, 8) +
    '-' +
    hex.substr(8, 4) +
    '-' +
    hex.substr(12, 4) +
    '-' +
    hex.substr(16, 4) +
    '-' +
    hex.substr(20, 12)
  );
}
