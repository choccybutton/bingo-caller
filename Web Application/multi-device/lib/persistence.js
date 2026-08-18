/**
 * Crash recovery via persistent state file
 * Saves the full game state (including the undrawn pool) to disk on every mutation
 * Loads on server startup to resume interrupted games
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const STATE_FILE = path.join(DATA_DIR, 'game-state.json');
const TMP_FILE = path.join(DATA_DIR, 'game-state.json.tmp');

/**
 * Ensure the data directory exists
 */
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Save the current game state to disk atomically
 * Writes to a temp file first, then renames (prevents corruption on crash mid-write)
 */
function saveState(state) {
  try {
    ensureDataDir();

    // Write to temp file first
    const json = JSON.stringify(state, null, 2);
    fs.writeFileSync(TMP_FILE, json, 'utf-8');

    // Atomically rename temp to real file
    // On Windows, this may fail if the file exists; use fs.renameSync which handles this
    fs.renameSync(TMP_FILE, STATE_FILE);
  } catch (err) {
    console.error('Error saving game state:', err.message);
    // Don't crash the server — just log and continue
  }
}

/**
 * Load the game state from disk if it exists
 * Returns null if no saved game exists or if it's corrupted
 */
function loadState() {
  try {
    if (!fs.existsSync(STATE_FILE)) {
      return null; // No saved game
    }

    const json = fs.readFileSync(STATE_FILE, 'utf-8');
    const state = JSON.parse(json);

    // Validate that this is a well-formed state object with expected keys
    if (
      typeof state === 'object' &&
      state !== null &&
      'gameType' in state &&
      'calledNumbers' in state &&
      'pool' in state
    ) {
      return state;
    }

    console.warn('Saved game state is malformed or incomplete, starting fresh');
    return null;
  } catch (err) {
    console.warn('Could not load saved game state:', err.message);
    return null;
  }
}

/**
 * Clear any saved game state
 * Called when resetting or when explicitly requested
 */
function clearSaved() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      fs.unlinkSync(STATE_FILE);
    }
    if (fs.existsSync(TMP_FILE)) {
      fs.unlinkSync(TMP_FILE);
    }
  } catch (err) {
    console.error('Error clearing saved game state:', err.message);
  }
}

module.exports = {
  saveState,
  loadState,
  clearSaved
};
