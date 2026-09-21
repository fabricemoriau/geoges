// Web Audio API Synthesizer for Alarms and Stark Chimes
class AlarmAudioPlayer {
  private audioCtx: AudioContext | null = null;
  private isAlarmPlaying = false;
  private alarmInterval: any = null;

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Play a single high-tech chime
  public playChime(type: "jarvis_arc" | "gentle_pulse" | "stark_alert" | "iron_man_chime" = "jarvis_arc") {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      if (type === "jarvis_arc") {
        // Futuristic Arc Reactor chime (A5 -> D6 -> E6 harmonic)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = "sine";
        osc2.type = "triangle";

        osc1.frequency.setValueAtTime(880, now); // A5
        osc1.frequency.exponentialRampToValueAtTime(1174.66, now + 0.12); // D6
        osc1.frequency.exponentialRampToValueAtTime(1318.51, now + 0.28); // E6

        osc2.frequency.setValueAtTime(440, now);
        osc2.frequency.exponentialRampToValueAtTime(587.33, now + 0.15);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.7);
        osc2.stop(now + 0.7);
      } else if (type === "gentle_pulse") {
        // Soft morning chime
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.18); // E5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.35); // G5

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.95);
      } else if (type === "stark_alert") {
        // Tactical alert chime
        const freqs = [740, 880, 1108, 1480];
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(f, now + idx * 0.08);
          gain.gain.setValueAtTime(0, now + idx * 0.08);
          gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.3);
        });
      } else {
        // Iron Man HUD confirm
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.linearRampToValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.45);
      }
    } catch (e) {
      console.warn("Audio chime error:", e);
    }
  }

  // Start continuous alarm ringing
  public startAlarmLoop(type: "jarvis_arc" | "gentle_pulse" | "stark_alert" | "iron_man_chime" = "jarvis_arc", onRing?: () => void) {
    if (this.isAlarmPlaying) return;
    this.isAlarmPlaying = true;

    this.playChime(type);
    onRing?.();

    this.alarmInterval = setInterval(() => {
      if (!this.isAlarmPlaying) {
        clearInterval(this.alarmInterval);
        return;
      }
      this.playChime(type);
      onRing?.();
    }, 1800);
  }

  public stopAlarmLoop() {
    this.isAlarmPlaying = false;
    if (this.alarmInterval) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
  }

  public isPlaying(): boolean {
    return this.isAlarmPlaying;
  }
}

export const alarmAudio = new AlarmAudioPlayer();
