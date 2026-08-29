import { AppNotification } from '../types/betting';
import { showLiveToast } from '../components/LiveToastContainer';

// Web Audio API Sound Synthesizer for high reliability
class SoundEffects {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  playGoalSound() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // Goal alert: celebratory rising tones + stadium whistle vibe
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.35);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  playWinSound() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // Win chime: major chord arpeggio (C - E - G - C)
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + i * 0.08;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.35);
      });
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  playPing() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  playAlertSound() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(150, now + 0.25);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  playWhistle() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400, now);
      osc.frequency.setValueAtTime(2800, now + 0.1);
      osc.frequency.setValueAtTime(2400, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }
}

export const soundEffects = new SoundEffects();

export const requestPushPermission = async (): Promise<boolean> => {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    } catch {
      return false;
    }
  }
  return false;
};

export const triggerSystemNotification = (notif: AppNotification, soundEnabled = true) => {
  // Play sound
  if (soundEnabled) {
    if (notif.type === 'GOAL') soundEffects.playGoalSound();
    else if (notif.type === 'BET_WON' || notif.type === 'SLIP_WON') soundEffects.playWinSound();
    else if (notif.type === 'MATCH_START') soundEffects.playWhistle();
    else soundEffects.playPing();
  }

  // Browser notification if allowed
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(notif.title, {
        body: notif.message,
        icon: '/favicon.ico'
      });
    } catch {
      // Ignore
    }
  }
};

export const notificationService = {
  addNotification(notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) {
    try {
      const raw = localStorage.getItem('betprogol_notifications_v1') || localStorage.getItem('tippro_notifications_v1');
      const list: AppNotification[] = raw ? JSON.parse(raw) : [];
      const newNotif: AppNotification = {
        ...notif,
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        read: false
      };
      const updated = [newNotif, ...list].slice(0, 50);
      localStorage.setItem('betprogol_notifications_v1', JSON.stringify(updated));
      triggerSystemNotification(newNotif, true);
      showLiveToast(newNotif);
      return newNotif;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  notifyGoal(homeTeam: string, awayTeam: string, scoringTeam: string, minute: number, score: string, soundEnabled = true) {
    this.addNotification({
      title: `⚽ CANLI GOL! ${scoringTeam} (${minute}')`,
      message: `${homeTeam} ${score} ${awayTeam} — Gol sesi ve skor canlı güncellendi!`,
      type: 'GOAL'
    });
  },

  notifySlipWon(slipId: string, payout: number, totalOdds: number, soundEnabled = true) {
    this.addNotification({
      title: `🎉 TEBRİKLER! KUPONUNUZ KAZANDI!`,
      message: `Kupon #${slipId.substring(0, 8)} sonuçlandı! Oran: ${totalOdds} | ₺${payout.toLocaleString('tr-TR')} kasanıza eklendi.`,
      type: 'SLIP_WON'
    });
  },

  notifySlipLost(slipId: string) {
    this.addNotification({
      title: `❌ KUPONUNUZ KAYBETTİ`,
      message: `Kupon #${slipId.substring(0, 8)} sonuçlandı. Bir dahaki sefere bol şans!`,
      type: 'SLIP_LOST'
    });
  },

  markAllAsRead() {
    try {
      const raw = localStorage.getItem('betprogol_notifications_v1') || localStorage.getItem('tippro_notifications_v1');
      if (raw) {
        const list: AppNotification[] = JSON.parse(raw);
        const updated = list.map(n => ({ ...n, read: true }));
        localStorage.setItem('betprogol_notifications_v1', JSON.stringify(updated));
      }
    } catch (e) {
      console.error(e);
    }
  },

  clearAll() {
    localStorage.setItem('betprogol_notifications_v1', JSON.stringify([]));
  }
};
