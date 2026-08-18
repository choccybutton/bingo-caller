/**
 * Announcer logic — shared between caller and display pages
 * Detects when a new number has been called and speaks it locally (if not muted)
 */

class Announcer {
  constructor(clientId) {
    this.clientId = clientId;
    this.lastSeenCalledCount = 0;
    this.isSpeaking = false;
  }

  /**
   * Process an incoming state update
   * If a genuinely new call happened and this device is not muted, speak it
   */
  onStateUpdate(payload) {
    const game = payload.game;
    const devices = payload.devices;

    // On the very first update after connecting, just baseline the count
    // without speaking the backlog
    if (this.lastSeenCalledCount === 0 && game.calledCount > 0) {
      this.lastSeenCalledCount = game.calledCount;
      return; // Don't speak the backlog
    }

    // Check if a new number was called
    if (game.calledCount > this.lastSeenCalledCount) {
      this.lastSeenCalledCount = game.calledCount;

      // Find this device's mute flag
      const thisDevice = devices.find((d) => d.id === this.clientId);
      const isMuted = thisDevice ? thisDevice.muted : true;

      // Speak only if not muted
      if (!isMuted && game.lastNumber !== null) {
        this.speak(game.lastNumber);
      }
    }
  }

  /**
   * Speak a number (called when a new one is detected and we're not muted)
   */
  speak(number) {
    if (this.isSpeaking) return; // Already speaking

    this.isSpeaking = true;
    speakNumber(number, {
      onEnd: () => {
        this.isSpeaking = false;
      }
    });
  }
}
