/**
 * Text-to-speech helper
 * Ported from the original BingoCaller.speakNumber() method
 * Restructured as a callback-based standalone function (no DOM coupling)
 */

function speakNumber(number, options = {}) {
  const { onEnd } = options;

  // If speech synthesis is unavailable, just callback
  if (!('speechSynthesis' in window) || !window.SpeechSynthesisUtterance) {
    if (onEnd) onEnd();
    return;
  }

  try {
    const name = BINGO_NAMES[number] || `Number ${number}`;

    // Try to get a better voice if available
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;

    // Try to find an English voice with good quality (Google, Microsoft, Samantha)
    for (let voice of voices) {
      if (
        voice.lang.includes('en') &&
        (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.name.includes('Samantha'))
      ) {
        selectedVoice = voice;
        break;
      }
    }

    // Fallback to any English voice
    if (!selectedVoice) {
      for (let voice of voices) {
        if (voice.lang.includes('en')) {
          selectedVoice = voice;
          break;
        }
      }
    }

    // Create the utterance
    const textToSpeak = `${name}, number ${number}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.0;
    utterance.pitch = 0.9;
    utterance.volume = 1.0;
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // Handle end
    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    // Handle errors
    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.log('Speech synthesis error:', err);
    if (onEnd) onEnd();
  }
}
