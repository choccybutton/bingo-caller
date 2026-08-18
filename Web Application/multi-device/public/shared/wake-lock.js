/**
 * Keep-awake helper for display screens.
 *
 * Displays connect over plain http://<lan-ip> (not a secure context), so the
 * standard Screen Wake Lock API is frequently unavailable — same constraint
 * already noted in client-id.js for crypto.randomUUID(). We try it anyway
 * (works if the browser relaxes the requirement, or if served over https),
 * and always also run a fallback that works everywhere: most mobile/TV OSes
 * suppress screen-off while a <video> is actively playing, so we drive a
 * hidden, muted, looping video from a 1x1 canvas stream. No binary/video
 * asset needed — generated entirely in JS, keeping this dependency-free.
 */

let wakeLockSentinel = null;
let fallbackVideo = null;
let fallbackStream = null;

async function requestNativeWakeLock() {
  if (!('wakeLock' in navigator)) return false;
  try {
    wakeLockSentinel = await navigator.wakeLock.request('screen');
    wakeLockSentinel.addEventListener('release', () => {
      wakeLockSentinel = null;
    });
    return true;
  } catch (err) {
    // Not a secure context, or the browser refused (e.g. tab not visible) —
    // the fallback below still runs regardless.
    console.warn('Screen Wake Lock unavailable, relying on fallback:', err.message);
    return false;
  }
}

function startFallbackVideo() {
  if (fallbackVideo) {
    // Already running — just make sure it's still playing
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
  } catch (err) {
    console.warn('Wake-lock fallback unavailable:', err.message);
  }
}

function resumeFallbackVideoIfNeeded() {
  if (fallbackVideo && fallbackVideo.paused) {
    fallbackVideo.play().catch(() => {});
  }
}

/**
 * Request the screen stay awake. Safe to call multiple times.
 */
async function requestWakeLock() {
  await requestNativeWakeLock();
  // Always run the fallback too — harmless alongside a native lock, and
  // covers TVs/browsers where the native API silently doesn't actually
  // prevent screen-off despite being "supported".
  startFallbackVideo();
}

/**
 * Release the wake lock and stop the fallback video.
 */
function releaseWakeLock() {
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
}

// The native Wake Lock API auto-releases when the tab is hidden, and some
// browsers pause the fallback video too — reacquire/resume on return.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  if (!wakeLockSentinel) requestNativeWakeLock();
  resumeFallbackVideoIfNeeded();
});
