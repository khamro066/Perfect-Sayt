let audioContext: AudioContext | null = null;

/**
 * Browsers keep a freshly-created AudioContext "suspended" until a real user
 * gesture (click/keydown/etc.) occurs on the page — call this from a
 * page-wide interaction listener so playDing() reliably works later, without
 * needing the notification-triggering event itself to be the user gesture.
 */
export function unlockNotificationAudio() {
  if (!audioContext) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    audioContext = new Ctor();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume().catch(() => {
      // ignore — will retry on the next unlock attempt
    });
  }
}

/** Short "ding": sine sweep 880Hz -> 1320Hz over ~0.16s with a decay envelope. */
export function playNotificationDing() {
  if (!audioContext || audioContext.state !== "running") return;

  const ctx = audioContext;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = "sine";
  const now = ctx.currentTime;
  oscillator.frequency.setValueAtTime(880, now);
  oscillator.frequency.linearRampToValueAtTime(1320, now + 0.16);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.16, now + 0.05);
  gain.gain.linearRampToValueAtTime(0, now + 0.38);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(now);
  oscillator.stop(now + 0.4);
}
