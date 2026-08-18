/**
 * Pure game logic for Bingo Caller — ported from the original BingoCaller class
 * with all DOM/UI/speech code stripped out.
 * Operates on plain state objects, no side effects.
 */

/**
 * Fisher-Yates shuffle (ported verbatim from the original)
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Create a fresh, ready-to-play game state
 */
function createInitialState() {
  return {
    gameType: 90,
    delayMs: 5000,
    gameRunning: false,
    gamePlaying: false,
    pool: [],           // undrawn numbers — only used internally, never exposed to clients
    calledNumbers: [],  // numbers that have been called
    status: 'Ready'
  };
}

/**
 * Start a new game
 * Initializes the pool, resets called numbers, sets up for play
 */
function startGame(state, { gameType, delayMs }) {
  state.gameType = gameType === 75 ? 75 : 90;
  state.delayMs = Math.min(60000, Math.max(100, Number(delayMs) || 5000));
  state.pool = shuffleArray(Array.from({ length: state.gameType }, (_, i) => i + 1));
  state.calledNumbers = [];
  state.gameRunning = true;
  state.gamePlaying = true;
  state.status = 'Playing';
  return state;
}

/**
 * Call the next number
 * Pops from the pre-shuffled pool; no filtering needed because pool is already shuffled once
 */
function callNext(state) {
  if (!state.gameRunning || state.pool.length === 0) {
    return state;
  }

  const number = state.pool.pop();
  state.calledNumbers.push(number);

  if (state.pool.length === 0) {
    state.status = 'Game Complete!';
    state.gamePlaying = false;
  }

  return state;
}

/**
 * Toggle play/pause
 * Only valid while a game is running
 */
function togglePlay(state) {
  if (!state.gameRunning || state.pool.length === 0) {
    return state;
  }

  state.gamePlaying = !state.gamePlaying;
  state.status = state.gamePlaying ? 'Playing' : 'Paused';
  return state;
}

/**
 * Reset to ready state
 * Clears all game data
 */
function reset(state) {
  state.gameType = 90;
  state.delayMs = 5000;
  state.gameRunning = false;
  state.gamePlaying = false;
  state.pool = [];
  state.calledNumbers = [];
  state.status = 'Ready';
  return state;
}

/**
 * Create the client-facing view of the state
 * Excludes `pool` (undrawn numbers), includes derived fields like lastNumber, lastFive, counts
 */
function publicView(state) {
  const calledCount = state.calledNumbers.length;
  const lastNumber = state.calledNumbers[calledCount - 1] ?? null;
  // Last five numbers excluding the current one, reversed (most recent first)
  const lastFive = state.calledNumbers.slice(-6, -1).reverse();

  return {
    gameType: state.gameType,
    delayMs: state.delayMs,
    gameRunning: state.gameRunning,
    gamePlaying: state.gamePlaying,
    calledNumbers: state.calledNumbers,
    lastNumber,
    lastFive,
    calledCount,
    remainingCount: state.gameType - calledCount,
    status: state.status
  };
}

module.exports = {
  shuffleArray,
  createInitialState,
  startGame,
  callNext,
  togglePlay,
  reset,
  publicView
};
