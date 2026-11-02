// Web Speech API (ja-JP) Pronunciation, Web Audio Tactile Chime & Haptic Vibration Utility

export type HapticPattern = 'tap' | 'select' | 'correct' | 'wrong' | 'milestone';

/**
 * Triggers native device haptic vibration via Web Vibration API (navigator.vibrate)
 * with graceful fallback on desktop/unsupported browsers.
 */
export function triggerHaptic(pattern: HapticPattern = 'tap', enabled: boolean = true): void {
  if (!enabled || typeof window === 'undefined' || !('vibrate' in navigator)) {
    return;
  }

  try {
    switch (pattern) {
      case 'tap':
        navigator.vibrate(8);
        break;
      case 'select':
        navigator.vibrate(14);
        break;
      case 'correct':
        navigator.vibrate([15, 35, 25]);
        break;
      case 'wrong':
        navigator.vibrate([45, 45, 55]);
        break;
      case 'milestone':
        navigator.vibrate([20, 40, 20, 40, 50]);
        break;
    }
  } catch {
    // Ignore vibration errors on restricted devices
  }
}

export function speakJapanese(text: string, rate: number = 0.88): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = rate;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const jpVoice =
      voices.find(
        (v) =>
          v.lang === 'ja-JP' &&
          (v.name.includes('Google') ||
            v.name.includes('Kyoko') ||
            v.name.includes('Otoya') ||
            v.name.includes('Haruka'))
      ) || voices.find((v) => v.lang.startsWith('ja'));

    if (jpVoice) {
      utterance.voice = jpVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch {
    // Ignore speech synthesis errors on restricted devices
  }
}

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playFeedbackTone(type: 'correct' | 'wrong' | 'beat'): void {
  // Pair audio feedback with tactile haptic vibration
  if (type === 'correct') {
    triggerHaptic('correct');
  } else if (type === 'wrong') {
    triggerHaptic('wrong');
  } else {
    triggerHaptic('tap');
  }

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.07); // E5
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'wrong') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now); // A3
      osc.frequency.setValueAtTime(196, now + 0.09); // G3
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    }
  } catch {
    // Ignore audio context errors
  }
}
