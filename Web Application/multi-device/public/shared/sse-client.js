/**
 * SSE (Server-Sent Events) client wrapper
 * Handles connection, reconnection, and state dispatch
 *
 * Reconnection strategy:
 * - Native EventSource's built-in auto-retry only kicks in once a stream has
 *   been successfully opened and then drops — it does NOT retry when the
 *   initial connection fails outright (e.g. server down, refused connection),
 *   it just goes straight to CLOSED. Verified empirically in Chrome. So we
 *   drive reconnection ourselves on 'error' with a short backoff, rather than
 *   trusting the browser to keep trying.
 * - A watchdog also force-reconnects if no activity (a 'state' broadcast or a
 *   server 'ping' heartbeat) has been seen in a while, to recover from
 *   "zombie" connections that look OPEN but are actually dead (e.g. after a
 *   device briefly loses WiFi or sleeps without a clean TCP close, where
 *   neither side ever sees an error).
 * - visibilitychange/online listeners trigger an immediate reconnect attempt
 *   instead of waiting for the next backoff tick, when we know we should.
 * - There is no retry cap — it keeps trying indefinitely until disconnect()
 *   is called, however long that takes.
 */

const SSE_WATCHDOG_CHECK_MS = 15000;
// Server pings every 20s (see server.js startKeepAlive) — allow ~2.5 missed
// heartbeats before treating the connection as dead.
const SSE_STALE_THRESHOLD_MS = 50000;
const SSE_RETRY_BASE_MS = 3000;
const SSE_RETRY_MAX_MS = 30000;

class SSEClient {
  constructor(clientId, role, onStateUpdate, onStatusChange) {
    this.clientId = clientId;
    this.role = role;
    this.onStateUpdate = onStateUpdate;
    this.onStatusChange = onStatusChange || (() => {});
    this.eventSource = null;
    this.lastActivityAt = null;
    this.watchdogTimer = null;
    this.retryTimer = null;
    this.retryDelay = SSE_RETRY_BASE_MS;
    this.stopped = false;
    this._boundVisibilityHandler = () => this._onVisibilityOrOnline();
    this._boundOnlineHandler = () => this._onVisibilityOrOnline();
  }

  connect() {
    this.stopped = false;
    this._clearRetryTimer();

    // Close out any previous connection before starting a new one
    if (this.eventSource) {
      this.eventSource.close();
    }

    const url = `/events?clientId=${encodeURIComponent(this.clientId)}&role=${encodeURIComponent(this.role)}`;

    this.eventSource = new EventSource(url);
    this.lastActivityAt = Date.now();

    this.eventSource.addEventListener('open', () => {
      this.lastActivityAt = Date.now();
      this.retryDelay = SSE_RETRY_BASE_MS; // reset backoff on success
      this.onStatusChange(true);
    });

    this.eventSource.addEventListener('ping', () => {
      this.lastActivityAt = Date.now();
    });

    this.eventSource.addEventListener('state', (event) => {
      this.lastActivityAt = Date.now();
      try {
        const payload = JSON.parse(event.data);
        if (this.onStateUpdate) {
          this.onStateUpdate(payload);
        }
      } catch (err) {
        console.error('Error parsing SSE state:', err);
      }
    });

    this.eventSource.onerror = () => {
      this.onStatusChange(false);
      this._scheduleRetry();
    };

    this._startWatchdog();
    this._addRecoveryListeners();
  }

  disconnect() {
    this.stopped = true;
    this._stopWatchdog();
    this._clearRetryTimer();
    this._removeRecoveryListeners();
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  _scheduleRetry() {
    if (this.stopped || this.retryTimer) return;
    const delay = this.retryDelay;
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      if (this.stopped) return;
      this.connect();
    }, delay);
    this.retryDelay = Math.min(this.retryDelay * 2, SSE_RETRY_MAX_MS);
  }

  _clearRetryTimer() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }

  _startWatchdog() {
    this._stopWatchdog();
    this.watchdogTimer = setInterval(() => {
      if (this.lastActivityAt && Date.now() - this.lastActivityAt > SSE_STALE_THRESHOLD_MS) {
        console.warn('SSE connection looks stale, forcing reconnect');
        this.connect();
      }
    }, SSE_WATCHDOG_CHECK_MS);
  }

  _stopWatchdog() {
    if (this.watchdogTimer) {
      clearInterval(this.watchdogTimer);
      this.watchdogTimer = null;
    }
  }

  _addRecoveryListeners() {
    document.addEventListener('visibilitychange', this._boundVisibilityHandler);
    window.addEventListener('online', this._boundOnlineHandler);
  }

  _removeRecoveryListeners() {
    document.removeEventListener('visibilitychange', this._boundVisibilityHandler);
    window.removeEventListener('online', this._boundOnlineHandler);
  }

  _onVisibilityOrOnline() {
    if (this.stopped) return;
    const isHidden = typeof document !== 'undefined' && document.visibilityState === 'hidden';
    if (isHidden) return;
    if (!this.eventSource || this.eventSource.readyState === EventSource.CLOSED) {
      this._clearRetryTimer();
      this.retryDelay = SSE_RETRY_BASE_MS;
      this.connect();
    }
  }
}

/**
 * Helper: make an action request to the server
 */
function postAction(path, body = {}) {
  return fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
    .then((res) => {
      if (!res.ok) {
        return res.text().then((text) => {
          throw new Error(`${res.status}: ${text}`);
        });
      }
      return res.json();
    })
    .catch((err) => {
      console.error('Action failed:', err);
      throw err;
    });
}
