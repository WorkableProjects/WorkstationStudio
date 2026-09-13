class AudioManager {
  private audio: HTMLAudioElement | null = null;
  private volume: number = 0.5;
  private muted: boolean = false;

  constructor() {
    const savedVolume = localStorage.getItem("workstation_audio_volume");
    if (savedVolume !== null) {
      this.volume = parseFloat(savedVolume);
    }
    const savedMute = localStorage.getItem("workstation_audio_muted");
    if (savedMute !== null) {
      this.muted = savedMute === "true";
    }

    if (typeof window !== "undefined") {
      this.audio = new Audio("/assets/Windows 3.1 Error Sound.mp3");
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    localStorage.setItem("workstation_audio_volume", String(this.volume));
  }

  public getVolume(): number {
    return this.volume;
  }

  public setMuted(mute: boolean) {
    this.muted = mute;
    localStorage.setItem("workstation_audio_muted", String(this.muted));
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public playErrorSound() {
    // Visual error indication fallback (flashes desktop border/background momentarily)
    const flashVisualError = () => {
      const activeEl = document.activeElement as HTMLElement;
      if (activeEl) {
        activeEl.style.outline = "2px solid red";
        setTimeout(() => {
          activeEl.style.outline = "";
        }, 300);
      }
    };

    flashVisualError();

    if (this.muted || this.volume === 0 || !this.audio) {
      return;
    }

    try {
      this.audio.currentTime = 0;
      this.audio.volume = this.volume;
      this.audio.play().catch((err) => {
        console.warn("Audio playback prevented or failed:", err);
      });
    } catch (err) {
      console.warn("Audio playback error:", err);
    }
  }
}

export const audioManager = new AudioManager();
