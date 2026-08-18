/**
 * SSE (Server-Sent Events) client wrapper
 * Handles connection, reconnection, and state dispatch
 */

class SSEClient {
  constructor(clientId, role, onStateUpdate) {
    this.clientId = clientId;
    this.role = role;
    this.onStateUpdate = onStateUpdate;
    this.eventSource = null;
    this.retryCount = 0;
    this.maxRetries = 10;
  }

  connect() {
    const url = `/events?clientId=${encodeURIComponent(this.clientId)}&role=${encodeURIComponent(this.role)}`;

    this.eventSource = new EventSource(url);

    this.eventSource.addEventListener('state', (event) => {
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
      console.warn('SSE connection lost, will reconnect automatically');
      this.eventSource.close();
      // EventSource will automatically reconnect
    };
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
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
