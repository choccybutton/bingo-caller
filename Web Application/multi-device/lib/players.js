/**
 * Player management and prize tracking
 * Persists to data/players.json for cross-game tracking
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const PLAYERS_FILE = path.join(DATA_DIR, 'players.json');
const TMP_FILE = path.join(DATA_DIR, 'players.json.tmp');

/**
 * Ensure the data directory exists
 */
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Load players from disk
 */
function loadPlayers() {
  try {
    if (!fs.existsSync(PLAYERS_FILE)) {
      return [];
    }

    const json = fs.readFileSync(PLAYERS_FILE, 'utf-8');
    const players = JSON.parse(json);

    if (Array.isArray(players)) {
      return players;
    }

    console.warn('Players file is malformed, starting fresh');
    return [];
  } catch (err) {
    console.warn('Could not load players:', err.message);
    return [];
  }
}

/**
 * Save players to disk atomically
 */
function savePlayers(players) {
  try {
    ensureDataDir();

    const json = JSON.stringify(players, null, 2);
    fs.writeFileSync(TMP_FILE, json, 'utf-8');
    fs.renameSync(TMP_FILE, PLAYERS_FILE);
  } catch (err) {
    console.error('Error saving players:', err.message);
  }
}

/**
 * Get all players
 */
function getPlayers() {
  return loadPlayers();
}

/**
 * Add a new player
 */
function addPlayer(name) {
  if (!name || typeof name !== 'string') {
    throw new Error('Invalid player name');
  }

  const players = loadPlayers();
  const id = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

  const player = {
    id,
    name: name.trim().slice(0, 50),
    lineCount: 0,
    houseCount: 0,
    createdAt: Date.now()
  };

  players.push(player);
  savePlayers(players);

  return player;
}

/**
 * Delete a player
 */
function deletePlayer(playerId) {
  const players = loadPlayers();
  const filtered = players.filter((p) => p.id !== playerId);

  if (filtered.length === players.length) {
    throw new Error('Player not found');
  }

  savePlayers(filtered);
  return true;
}

/**
 * Add a prize to a player
 */
function addPrize(playerId, prizeType) {
  if (prizeType !== 'line' && prizeType !== 'house') {
    throw new Error('Invalid prize type');
  }

  const players = loadPlayers();
  const player = players.find((p) => p.id === playerId);

  if (!player) {
    throw new Error('Player not found');
  }

  if (prizeType === 'line') {
    player.lineCount = (player.lineCount || 0) + 1;
  } else if (prizeType === 'house') {
    player.houseCount = (player.houseCount || 0) + 1;
  }

  savePlayers(players);
  return player;
}

/**
 * Reset all players (clear the file)
 */
function resetPlayers() {
  try {
    if (fs.existsSync(PLAYERS_FILE)) {
      fs.unlinkSync(PLAYERS_FILE);
    }
    if (fs.existsSync(TMP_FILE)) {
      fs.unlinkSync(TMP_FILE);
    }
  } catch (err) {
    console.error('Error resetting players:', err.message);
  }
}

module.exports = {
  getPlayers,
  addPlayer,
  deletePlayer,
  addPrize,
  resetPlayers
};
