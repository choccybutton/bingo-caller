/**
 * Keep-awake helper for display screens.
 *
 * Displays connect over plain http://<lan-ip> (not a secure context), so the
 * standard Screen Wake Lock API is frequently unavailable — same constraint
 * already noted in client-id.js for crypto.randomUUID(). We try multiple
 * fallbacks:
 * 1. Native Screen Wake Lock API (HTTPS only)
 * 2. Hidden video from canvas stream (works on most mobile/TV)
 * 3. Animated canvas (keeps GPU active)
 * 4. RequestAnimationFrame loop (prevents CPU sleep)
 * 5. Periodic mouse movement (some systems respond to input)
 */

let wakeLockSentinel = null;
let fallbackVideo = null;
let fallbackStream = null;
let animationFrameId = null;
let animationCanvas = null;
let lastMouseMoveTime = 0;

async function requestNativeWakeLock() {
  if (!('wakeLock' in navigator)) return false;
  try {
    wakeLockSentinel = await navigator.wakeLock.request('screen');
    wakeLockSentinel.addEventListener('release', () => {
      wakeLockSentinel = null;
    });
    console.log('Screen Wake Lock API enabled');
    return true;
  } catch (err) {
    console.warn('Screen Wake Lock unavailable:', err.message);
    return false;
  }
}

function startFallbackVideo() {
  if (fallbackVideo) {
    fallbackVideo.play().catch(() => {});
    return;
  }

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.fillRect(0, 0, 1, 1);

    fallbackStream = canvas.captureStream(1);

    const video = document.createElement('video');
    video.srcObject = fallbackStream;
    video.muted = true;
    video.setAttribute('muted', '');
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;';
    document.body.appendChild(video);

    video.play().catch((err) => {
      console.warn('Wake-lock fallback video could not start:', err.message);
    });

    fallbackVideo = video;
    console.log('Video fallback started');
  } catch (err) {
    console.warn('Wake-lock fallback video unavailable:', err.message);
    // Still run other fallbacks
  }
}

function startAnimatedCanvas() {
  if (animationFrameId) return;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    canvas.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;';
    document.body.appendChild(canvas);
    animationCanvas = canvas;

    const ctx = canvas.getContext('2d');
    let tick = 0;

    function animate() {
      // Draw alternating pixels to keep canvas active
      ctx.fillStyle = tick % 2 === 0 ? '#000' : '#fff';
      ctx.fillRect(0, 0, 1, 1);
      tick++;
      animationFrameId = requestAnimationFrame(animate);
    }

    animate();
    console.log('Animated canvas fallback started');
  } catch (err) {
    console.warn('Animated canvas fallback unavailable:', err.message);
  }
}

function startMouseMoveFallback() {
  // Periodically trigger mouse events to keep system from sleeping
  setInterval(() => {
    const now = Date.now();
    if (now - lastMouseMoveTime > 30000) {  // Every 30 seconds
      const event = new MouseEvent('mousemove', {
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(event);
      lastMouseMoveTime = now;
    }
  }, 5000);
}

function resumeFallbackVideoIfNeeded() {
  if (fallbackVideo && fallbackVideo.paused) {
    fallbackVideo.play().catch(() => {});
  }
}

function resumeAnimatedCanvasIfNeeded() {
  if (!animationFrameId && animationCanvas) {
    startAnimatedCanvas();
  }
}

/**
 * Request the screen stay awake. Safe to call multiple times.
 * Uses multiple fallbacks to maximize compatibility across platforms.
 */
async function requestWakeLock() {
  console.log('Requesting screen wake lock...');

  // Try native API first
  const nativeSuccess = await requestNativeWakeLock();

  // Always run multiple fallbacks
  // Video fallback works best on mobile/TV
  startFallbackVideo();

  // Animated canvas keeps GPU busy (helps on some Linux systems)
  startAnimatedCanvas();

  // Mouse movement helps some systems
  startMouseMoveFallback();

  console.log(`Wake lock initialized (native: ${nativeSuccess}, fallbacks: video+canvas+mouse)`);
}

/**
 * Release the wake lock and stop all fallbacks.
 */
function releaseWakeLock() {
  console.log('Releasing wake lock...');

  if (wakeLockSentinel) {
    wakeLockSentinel.release().catch(() => {});
    wakeLockSentinel = null;
  }
  if (fallbackVideo) {
    fallbackVideo.pause();
    fallbackVideo.remove();
    fallbackVideo = null;
  }
  if (fallbackStream) {
    fallbackStream.getTracks().forEach((track) => track.stop());
    fallbackStream = null;
  }
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  if (animationCanvas) {
    animationCanvas.remove();
    animationCanvas = null;
  }
}

// Resume wake locks when tab becomes visible again
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;

  console.log('Tab became visible, resuming wake lock...');
  if (!wakeLockSentinel) requestNativeWakeLock();
  resumeFallbackVideoIfNeeded();
  resumeAnimatedCanvasIfNeeded();
});
