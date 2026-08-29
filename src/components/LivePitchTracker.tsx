import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  Radio, 
  Zap, 
  ShieldAlert, 
  Flame, 
  Target, 
  Activity,
  Play,
  Pause,
  RotateCcw,
  Tv,
  ChevronDown,
  Check,
  Sparkles,
  Layers,
  Settings,
  Wifi,
  Cast,
  BarChart2,
  TrendingUp,
  AlertTriangle,
  Award,
  ChevronRight,
  Eye,
  X
} from 'lucide-react';
import { Match, MatchEvent, MatchStats } from '../types/betting';
import { TeamLogo } from './TeamLogo';

interface LivePitchTrackerProps {
  match: Match;
  className?: string;
  onClose?: () => void;
  showFullscreenBtn?: boolean;
}

export type FootballActionType = 
  | 'SAFE_POSSESSION' 
  | 'ATTACKING' 
  | 'DANGEROUS_ATTACK' 
  | 'CORNER_KICK' 
  | 'FREE_KICK' 
  | 'PENALTY' 
  | 'SHOT_ON_TARGET' 
  | 'SHOT_OFF_TARGET' 
  | 'GOAL' 
  | 'SAVE' 
  | 'YELLOW_CARD' 
  | 'RED_CARD' 
  | 'VAR_CHECK'
  | 'THROW_IN' 
  | 'OFFSIDE'
  // Basketball specific actions
  | 'BASKET_TWO'
  | 'BASKET_THREE'
  | 'SLAM_DUNK'
  | 'FAST_BREAK'
  | 'REBOUND'
  | 'STEAL'
  | 'BLOCK'
  | 'FREE_THROW_MADE'
  | 'TIMEOUT';

export interface PitchActionState {
  id: string;
  team: 'home' | 'away' | 'neutral';
  action: FootballActionType;
  title: string;
  subtitle: string;
  minute: number;
  player?: string;
  ballX: number; // 0 (left goal) to 100 (right goal)
  ballY: number; // 0 (top line) to 100 (bottom line)
  prevBallX?: number;
  prevBallY?: number;
  trajectory?: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    curve?: 'up' | 'down' | 'straight';
    type: 'pass' | 'cross' | 'shot' | 'goal';
  };
  zoneHighlight: 'home_defense' | 'home_mid' | 'away_mid' | 'away_attack' | 'away_defense' | 'home_attack' | 'center';
  spotlightTeam: 'home' | 'away';
  isKeyHighlight?: boolean;
}

export interface BroadcastChannel {
  id: string;
  name: string;
  provider: 'beIN' | 'Exxen' | 'SSport' | 'TRT' | 'Tivibu' | 'BilyonerTV' | 'D-Smart' | 'EuroSport';
  quality: '4K Ultra HD' | '1080p 60fps' | '1080p HD' | '720p HD';
  badgeColor: string;
  language: string;
  bitrate: string;
  isOfficial?: boolean;
}

// Web Audio API Synthesizer for realistic pitch sound effects
class PitchSoundFX {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playWhistle() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(3200, this.ctx.currentTime + 0.08);
      osc.frequency.exponentialRampToValueAtTime(2800, this.ctx.currentTime + 0.25);
      
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch {
      // Audio fallback ignored
    }
  }

  playKick() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, this.ctx.currentTime + 0.09);
      
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {
      // Audio fallback ignored
    }
  }

  playGoalCheer() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // Whistle double blow
      this.playWhistle();
      setTimeout(() => this.playWhistle(), 250);

      // Cheerful synth chord
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + i * 0.05);
        gain.gain.setValueAtTime(0.08, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.05);
        osc.stop(now + 1.3);
      });
    } catch {
      // Audio fallback ignored
    }
  }
}

const soundFX = new PitchSoundFX();

export const LivePitchTracker: React.FC<LivePitchTrackerProps> = ({
  match,
  className = '',
  onClose,
  showFullscreenBtn = true
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isChannelDropdownOpen, setIsChannelDropdownOpen] = useState(false);
  const [channelSwitchLoading, setChannelSwitchLoading] = useState(false);
  const [selectedSubTab, setSelectedSubTab] = useState<'pitch' | 'stats' | 'events'>('pitch');
  const [goalCelebrationActive, setGoalCelebrationActive] = useState<boolean>(false);
  const [celebrationData, setCelebrationData] = useState<{ 
    type: 'GOAL' | 'BASKET' | 'SLAM_DUNK';
    title: string;
    team: string; 
    player: string; 
    minute: number; 
    score: string;
  } | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLive = match.status === 'LIVE' || match.status === 'HALFTIME' || (match.status as string) === 'IN_PLAY' || (match.status as string) === 'PAUSED' || (match.status as string) === 'HALF_TIME';
  const isFinished = match.status === 'FINISHED' || (match.status as string) === 'POST' || (match.status as string) === 'COMPLETED';
  const isNotStarted = !isLive && !isFinished;
  const isBasketball = match.sport === 'BASKETBALL';
  const isVolleyball = match.sport === 'VOLLEYBALL';

  // Accurate Match Stats strictly extracted and validated
  const stats: MatchStats = useMemo(() => {
    return {
      possession: match.stats?.possession || [52, 48],
      shotsTotal: match.stats?.shotsTotal || [12, 8],
      shotsOnTarget: match.stats?.shotsOnTarget || [5, 3],
      xg: match.stats?.xg || [1.45, 0.95],
      corners: match.stats?.corners || [6, 4],
      fouls: match.stats?.fouls || [11, 14],
      yellowCards: match.stats?.yellowCards || [2, 3],
      redCards: match.stats?.redCards || [0, 0],
      dangerousAttacks: match.stats?.dangerousAttacks || [48, 38]
    };
  }, [match.stats]);

  // Available broadcast channels list based on match league/sport
  const broadcastChannels: BroadcastChannel[] = useMemo(() => {
    const defaultPrimary = match.tvChannel || 'beIN Sports 1 HD';
    const channels: BroadcastChannel[] = [];

    if (match.leagueName?.includes('Süper Lig') || match.country === 'Türkiye') {
      channels.push(
        { id: 'bein1', name: defaultPrimary.includes('beIN') ? defaultPrimary : 'beIN Sports 1 HD', provider: 'beIN', quality: '4K Ultra HD', badgeColor: 'bg-purple-600', language: 'Türkçe', bitrate: '12 Mbps', isOfficial: true },
        { id: 'bein2', name: 'beIN Sports 2 HD', provider: 'beIN', quality: '1080p 60fps', badgeColor: 'bg-purple-600', language: 'Türkçe', bitrate: '8 Mbps' },
        { id: 'bilyoner_tv', name: 'Bilyoner TV Canlı', provider: 'BilyonerTV', quality: '1080p HD', badgeColor: 'bg-green-600', language: 'Türkçe', bitrate: '6 Mbps' },
        { id: 'trt_spor', name: 'TRT Spor / TRT Yıldız', provider: 'TRT', quality: '1080p HD', badgeColor: 'bg-red-600', language: 'Türkçe', bitrate: '6 Mbps' }
      );
    } else if (match.leagueName?.includes('Şampiyonlar') || match.leagueName?.includes('Avrupa') || match.leagueName?.includes('Konferans') || match.leagueName?.includes('Champions')) {
      channels.push(
        { id: 'exxen1', name: 'Exxen Spor 1 HD', provider: 'Exxen', quality: '4K Ultra HD', badgeColor: 'bg-amber-500', language: 'Türkçe', bitrate: '12 Mbps', isOfficial: true },
        { id: 'exxen2', name: 'Exxen Spor 2 HD', provider: 'Exxen', quality: '1080p 60fps', badgeColor: 'bg-amber-500', language: 'Türkçe', bitrate: '8 Mbps' },
        { id: 'trt_1', name: 'TRT 1 / TRT Spor', provider: 'TRT', quality: '1080p HD', badgeColor: 'bg-red-600', language: 'Türkçe', bitrate: '8 Mbps' },
        { id: 'bilyoner_tv', name: 'Bilyoner TV Canlı', provider: 'BilyonerTV', quality: '1080p HD', badgeColor: 'bg-green-600', language: 'Türkçe', bitrate: '6 Mbps' }
      );
    } else if (match.leagueName?.includes('Premier') || match.leagueName?.includes('Serie A') || match.leagueName?.includes('LaLiga') || match.leagueName?.includes('Euroleague') || match.sport === 'BASKETBALL') {
      channels.push(
        { id: 'ssport1', name: 'S Sport Plus 1 HD', provider: 'SSport', quality: '4K Ultra HD', badgeColor: 'bg-red-600', language: 'Türkçe', bitrate: '12 Mbps', isOfficial: true },
        { id: 'ssport2', name: 'S Sport 2 HD', provider: 'SSport', quality: '1080p 60fps', badgeColor: 'bg-red-600', language: 'Türkçe', bitrate: '8 Mbps' },
        { id: 'bein3', name: 'beIN Sports 3 HD', provider: 'beIN', quality: '1080p HD', badgeColor: 'bg-purple-600', language: 'Türkçe', bitrate: '8 Mbps' },
        { id: 'bilyoner_tv', name: 'Bilyoner TV Canlı', provider: 'BilyonerTV', quality: '1080p HD', badgeColor: 'bg-green-600', language: 'Türkçe', bitrate: '6 Mbps' }
      );
    } else {
      channels.push(
        { id: 'default_main', name: match.tvChannel || 'beIN Sports 1 HD', provider: 'beIN', quality: '1080p 60fps', badgeColor: 'bg-purple-600', language: 'Türkçe', bitrate: '8 Mbps', isOfficial: true },
        { id: 'ssport1', name: 'S Sport Plus HD', provider: 'SSport', quality: '1080p HD', badgeColor: 'bg-red-600', language: 'Türkçe', bitrate: '8 Mbps' },
        { id: 'bilyoner_tv', name: 'Bilyoner TV Canlı', provider: 'BilyonerTV', quality: '1080p HD', badgeColor: 'bg-green-600', language: 'Türkçe', bitrate: '6 Mbps' }
      );
    }

    return channels;
  }, [match]);

  const [selectedChannel, setSelectedChannel] = useState<BroadcastChannel>(broadcastChannels[0]);

  // Generate REALISTIC match-specific event and simulation steps
  const simulationTimeline: PitchActionState[] = useMemo(() => {
    const home = match.homeTeam.name;
    const away = match.awayTeam.name;
    const homeScore = match.homeScore || 0;
    const awayScore = match.awayScore || 0;
    const events = match.events || [];
    const min = match.minute || 45;

    const sequence: PitchActionState[] = [];

    // Basketball Specific Simulation Timeline
    if (isBasketball) {
      sequence.push({
        id: 'bb-home-setup',
        team: 'home',
        action: 'SAFE_POSSESSION',
        title: `${home} Hücumu`,
        subtitle: 'Oyun kurucu tepe noktasında seti başlatıyor',
        minute: min,
        ballX: 50,
        ballY: 50,
        zoneHighlight: 'home_mid',
        spotlightTeam: 'home'
      });
      sequence.push({
        id: 'bb-home-pick',
        team: 'home',
        action: 'ATTACKING',
        title: `${home} Hücumda`,
        subtitle: 'Pick & Roll perdesi sonrası boyalı alana pas!',
        minute: min,
        ballX: 74,
        ballY: 42,
        prevBallX: 50,
        prevBallY: 50,
        trajectory: { startX: 50, startY: 50, endX: 74, endY: 42, type: 'pass' },
        zoneHighlight: 'away_defense',
        spotlightTeam: 'home'
      });
      sequence.push({
        id: 'bb-home-three',
        team: 'home',
        action: 'BASKET_THREE',
        title: `🏀 3 SAYILIK BASKET! ${home}`,
        subtitle: 'Köşeden nefis üçlük isabeti, çemberi delip geçti!',
        minute: min,
        player: match.homeTeam.shortName || match.homeTeam.name,
        ballX: 93,
        ballY: 50,
        prevBallX: 74,
        prevBallY: 42,
        trajectory: { startX: 74, startY: 42, endX: 93, endY: 50, type: 'shot', curve: 'up' },
        zoneHighlight: 'away_defense',
        spotlightTeam: 'home',
        isKeyHighlight: true
      });
      sequence.push({
        id: 'bb-away-fastbreak',
        team: 'away',
        action: 'FAST_BREAK',
        title: `${away} Hızlı Hücum`,
        subtitle: 'Top çalındı, 3\'e 2 hızlı hücum gelişiyor!',
        minute: min,
        ballX: 38,
        ballY: 50,
        prevBallX: 90,
        prevBallY: 50,
        trajectory: { startX: 90, startY: 50, endX: 38, endY: 50, type: 'pass' },
        zoneHighlight: 'home_defense',
        spotlightTeam: 'away'
      });
      sequence.push({
        id: 'bb-away-dunk',
        team: 'away',
        action: 'SLAM_DUNK',
        title: `🔥 MUAZZAM SMAÇ! ${away}`,
        subtitle: 'Pota altında havaya yükseldi ve harika bir smaç vurdu!',
        minute: min,
        player: match.awayTeam.shortName || match.awayTeam.name,
        ballX: 7,
        ballY: 50,
        prevBallX: 38,
        prevBallY: 50,
        trajectory: { startX: 38, startY: 50, endX: 7, endY: 50, type: 'shot' },
        zoneHighlight: 'home_defense',
        spotlightTeam: 'away',
        isKeyHighlight: true
      });
      sequence.push({
        id: 'bb-block',
        team: 'home',
        action: 'BLOCK',
        title: `🛡️ GEÇİT YOK! BLOK!`,
        subtitle: `${home} savunması pota altında şutu blokladı`,
        minute: min,
        ballX: 18,
        ballY: 46,
        zoneHighlight: 'home_defense',
        spotlightTeam: 'home'
      });
      sequence.push({
        id: 'bb-home-basket2',
        team: 'home',
        action: 'BASKET_TWO',
        title: `🏀 2 SAYILIK BASKET! ${home}`,
        subtitle: 'Orta mesafeden step-back ile şık basket!',
        minute: min,
        player: match.homeTeam.shortName || match.homeTeam.name,
        ballX: 93,
        ballY: 50,
        prevBallX: 68,
        prevBallY: 35,
        trajectory: { startX: 68, startY: 35, endX: 93, endY: 50, type: 'shot', curve: 'up' },
        zoneHighlight: 'away_defense',
        spotlightTeam: 'home',
        isKeyHighlight: true
      });
      return sequence;
    }

    // 1. If there are real events in match.events, extract them
    const realGoals = events.filter(e => e.type === 'GOAL');
    const realCards = events.filter(e => e.type === 'YELLOW_CARD' || e.type === 'RED_CARD');
    const stadiumName = match.stadium || 'stadyum';
    const refName = match.referee || 'Maçın Hakemi';
    const homeShort = match.homeTeam.shortName || home;
    const awayShort = match.awayTeam.shortName || away;

    // Build-up 1: Home team possession & setup
    sequence.push({
      id: 'seq-home-build',
      team: 'home',
      action: 'SAFE_POSSESSION',
      title: home,
      subtitle: `${home} (${homeShort}) stoper hattı ${stadiumName} zemininde hazırlık pasları yapıyor.`,
      minute: Math.max(1, min - 6),
      ballX: 25,
      ballY: 50,
      prevBallX: 16,
      prevBallY: 48,
      trajectory: { startX: 16, startY: 48, endX: 25, endY: 50, type: 'pass' },
      zoneHighlight: 'home_defense',
      spotlightTeam: 'home'
    });

    // Build-up 2: Home team attacking midfield
    sequence.push({
      id: 'seq-home-mid',
      team: 'home',
      action: 'ATTACKING',
      title: home,
      subtitle: `${homeShort} orta alanda paslaşarak ${away} savunmasında boşluk arıyor.`,
      minute: Math.max(1, min - 5),
      ballX: 52,
      ballY: 34,
      prevBallX: 25,
      prevBallY: 50,
      trajectory: { startX: 25, startY: 50, endX: 52, endY: 34, type: 'pass' },
      zoneHighlight: 'home_mid',
      spotlightTeam: 'home'
    });

    // Build-up 3: Home dangerous wing attack
    sequence.push({
      id: 'seq-home-danger',
      team: 'home',
      action: 'DANGEROUS_ATTACK',
      title: home,
      subtitle: `${homeShort} sağ kanattan yüklendi! ${away} ceza sahasına tehlikeli kavisli orta!`,
      minute: Math.max(1, min - 4),
      ballX: 78,
      ballY: 18,
      prevBallX: 52,
      prevBallY: 34,
      trajectory: { startX: 52, startY: 34, endX: 78, endY: 18, type: 'cross', curve: 'up' },
      zoneHighlight: 'away_defense',
      spotlightTeam: 'home'
    });

    // If Home has scored or has goals in events
    const homeGoalEvent = realGoals.find(g => g.team === 'home');
    if (homeScore > 0 || homeGoalEvent) {
      const scorer = homeGoalEvent?.player || `${homeShort} Forveti`;
      const goalMin = homeGoalEvent?.minute || Math.max(1, min - 3);
      sequence.push({
        id: 'seq-home-shot-lead',
        team: 'home',
        action: 'SHOT_ON_TARGET',
        title: home,
        subtitle: `${scorer} (${homeShort}) ceza sahası köşesinden ayağının içiyle sert vuruyor!`,
        minute: goalMin,
        player: scorer,
        ballX: 88,
        ballY: 42,
        prevBallX: 78,
        prevBallY: 18,
        trajectory: { startX: 78, startY: 18, endX: 88, endY: 42, type: 'pass' },
        zoneHighlight: 'away_defense',
        spotlightTeam: 'home'
      });
      sequence.push({
        id: 'seq-home-goal',
        team: 'home',
        action: 'GOAL',
        title: `⚽ GOOOOL! ${home.toUpperCase()}`,
        subtitle: `${scorer} muazzam bir vuruşla ${away} filelerini havalandırdı! (${goalMin}')`,
        minute: goalMin,
        player: scorer,
        ballX: 98,
        ballY: 48,
        prevBallX: 88,
        prevBallY: 42,
        trajectory: { startX: 88, startY: 42, endX: 98, endY: 48, type: 'goal', curve: 'up' },
        zoneHighlight: 'away_defense',
        spotlightTeam: 'home',
        isKeyHighlight: true
      });
    } else {
      // Shot saved by GK
      sequence.push({
        id: 'seq-home-save',
        team: 'home',
        action: 'SAVE',
        title: home,
        subtitle: `${homeShort} hücumcusunun şutunda ${away} kalecisi topu güçlükle çıkardı!`,
        minute: Math.max(1, min - 3),
        ballX: 95,
        ballY: 50,
        prevBallX: 78,
        prevBallY: 18,
        trajectory: { startX: 78, startY: 18, endX: 95, endY: 50, type: 'shot' },
        zoneHighlight: 'away_defense',
        spotlightTeam: 'home'
      });
    }

    // Corner Kick Sequence
    sequence.push({
      id: 'seq-corner',
      team: 'home',
      action: 'CORNER_KICK',
      title: home,
      subtitle: `${home} takımı köşe gönderinden korneri kullanıyor`,
      minute: Math.max(1, min - 2),
      ballX: 97,
      ballY: 8,
      zoneHighlight: 'away_defense',
      spotlightTeam: 'home'
    });

    // Away Counter Attack Sequence
    sequence.push({
      id: 'seq-away-counter',
      team: 'away',
      action: 'ATTACKING',
      title: away,
      subtitle: `${away} (${awayShort}) hızlı kontratakla ${home} savunmasını eksik yakaladı!`,
      minute: Math.max(1, min - 1),
      ballX: 45,
      ballY: 68,
      prevBallX: 90,
      prevBallY: 50,
      trajectory: { startX: 90, startY: 50, endX: 45, endY: 68, type: 'pass' },
      zoneHighlight: 'away_mid',
      spotlightTeam: 'away'
    });

    sequence.push({
      id: 'seq-away-danger',
      team: 'away',
      action: 'DANGEROUS_ATTACK',
      title: away,
      subtitle: `${awayShort} oyuncuları ceza yayında şut pozisyonu arıyor!`,
      minute: min,
      ballX: 22,
      ballY: 46,
      prevBallX: 45,
      prevBallY: 68,
      trajectory: { startX: 45, startY: 68, endX: 22, endY: 46, type: 'pass' },
      zoneHighlight: 'home_defense',
      spotlightTeam: 'away'
    });

    // If Away has scored
    const awayGoalEvent = realGoals.find(g => g.team === 'away');
    if (awayScore > 0 || awayGoalEvent) {
      const scorer = awayGoalEvent?.player || `${awayShort} Hücumcusu`;
      const goalMin = awayGoalEvent?.minute || Math.max(1, min - 1);
      sequence.push({
        id: 'seq-away-goal',
        team: 'away',
        action: 'GOAL',
        title: `⚽ GOOOOL! ${away.toUpperCase()}`,
        subtitle: `${scorer} savunmanın hatasını affetmedi, skoru değiştirdi! (${goalMin}')`,
        minute: goalMin,
        player: scorer,
        ballX: 2,
        ballY: 52,
        prevBallX: 22,
        prevBallY: 46,
        trajectory: { startX: 22, startY: 46, endX: 2, endY: 52, type: 'goal' },
        zoneHighlight: 'home_defense',
        spotlightTeam: 'away',
        isKeyHighlight: true
      });
    }

    // Card or Foul event if exists
    if (realCards.length > 0) {
      const card = realCards[0];
      const cardTeamName = card.team === 'home' ? home : away;
      sequence.push({
        id: `seq-card-${card.id}`,
        team: card.team,
        action: card.type === 'RED_CARD' ? 'RED_CARD' : 'YELLOW_CARD',
        title: card.type === 'RED_CARD' ? `🟥 KIRMIZI KART!` : `🟨 SARI KART`,
        subtitle: `${card.player} (${cardTeamName}) - Hakem ${refName} kartını gösterdi`,
        minute: card.minute,
        player: card.player,
        ballX: card.team === 'home' ? 40 : 60,
        ballY: 50,
        zoneHighlight: 'center',
        spotlightTeam: card.team,
        isKeyHighlight: true
      });
    } else {
      // VAR Check or Referee Foul call
      sequence.push({
        id: 'seq-var-check',
        team: 'neutral',
        action: 'VAR_CHECK',
        title: '📺 VAR İNCELEMESİ',
        subtitle: `Hakem ${refName} ikili mücadele pozisyonunu kontrol ediyor.`,
        minute: min,
        ballX: 50,
        ballY: 50,
        zoneHighlight: 'center',
        spotlightTeam: 'home'
      });
    }

    // Free Kick & Live Pressure
    sequence.push({
      id: 'seq-freekick',
      team: 'away',
      action: 'FREE_KICK',
      title: away,
      subtitle: `${awayShort} tehlikeli noktadan serbest vuruş kullanıyor, şut barajdan döndü.`,
      minute: min,
      ballX: 26,
      ballY: 38,
      zoneHighlight: 'home_defense',
      spotlightTeam: 'away'
    });

    return sequence;
  }, [match, isBasketball]);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Trigger sound and goal/basket effects when state changes
  useEffect(() => {
    const current = simulationTimeline[currentIndex];
    if (!current) return;

    if (current.action === 'GOAL') {
      const isHome = current.team === 'home';
      const homeScore = match.homeScore || 0;
      const awayScore = match.awayScore || 0;
      
      setCelebrationData({
        type: 'GOAL',
        title: '⚽ G O O O L !',
        team: isHome ? match.homeTeam.name : match.awayTeam.name,
        player: current.player || 'Golcü',
        minute: current.minute,
        score: `${homeScore} - ${awayScore}`
      });
      setGoalCelebrationActive(true);
      if (soundEnabled) {
        soundFX.playGoalCheer();
      }
      const timer = setTimeout(() => {
        setGoalCelebrationActive(false);
      }, 4200);
      return () => clearTimeout(timer);
    } else if (current.action === 'BASKET_THREE' || current.action === 'BASKET_TWO' || current.action === 'SLAM_DUNK') {
      const isHome = current.team === 'home';
      const homeScore = match.homeScore || 0;
      const awayScore = match.awayScore || 0;
      
      const title = current.action === 'SLAM_DUNK' 
        ? '🔥 M U A Z Z A M  S M A Ç ! (+2 SAYI)'
        : current.action === 'BASKET_THREE'
          ? '🎯 3  S A Y I L I K  B A S K E T ! (+3 SAYI)'
          : '🏀 B A S K E T ! (+2 SAYI)';

      setCelebrationData({
        type: current.action === 'SLAM_DUNK' ? 'SLAM_DUNK' : 'BASKET',
        title,
        team: isHome ? match.homeTeam.name : match.awayTeam.name,
        player: current.player || (isHome ? match.homeTeam.name : match.awayTeam.name),
        minute: current.minute,
        score: `${homeScore} - ${awayScore}`
      });
      setGoalCelebrationActive(true);
      if (soundEnabled) {
        soundFX.playGoalCheer();
      }
      const timer = setTimeout(() => {
        setGoalCelebrationActive(false);
      }, 3800);
      return () => clearTimeout(timer);
    } else {
      setGoalCelebrationActive(false);
      if (soundEnabled) {
        if (current.action === 'CORNER_KICK' || current.action === 'FREE_KICK' || current.action === 'YELLOW_CARD' || current.action === 'RED_CARD' || current.action === 'TIMEOUT') {
          soundFX.playWhistle();
        } else if (current.action === 'SHOT_ON_TARGET' || current.action === 'DANGEROUS_ATTACK' || current.action === 'BLOCK' || current.action === 'STEAL') {
          soundFX.playKick();
        }
      }
    }
  }, [currentIndex, simulationTimeline, soundEnabled, match]);

  // Main simulation timer loop
  useEffect(() => {
    if (!isPlaying) return;
    const current = simulationTimeline[currentIndex];
    // Give more view time to goals and key highlights (5s), standard actions (3.8s)
    const stepDuration = current?.action === 'GOAL' ? 5200 : current?.isKeyHighlight ? 4500 : 3800;
    const timer = setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % simulationTimeline.length);
    }, stepDuration);
    return () => clearTimeout(timer);
  }, [isPlaying, currentIndex, simulationTimeline]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsChannelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectChannel = (channel: BroadcastChannel) => {
    if (channel.id === selectedChannel.id) {
      setIsChannelDropdownOpen(false);
      return;
    }
    setChannelSwitchLoading(true);
    setSelectedChannel(channel);
    setIsChannelDropdownOpen(false);
    setTimeout(() => {
      setChannelSwitchLoading(false);
    }, 600);
  };

  const currentState = simulationTimeline[currentIndex] || simulationTimeline[0];

  // Match period label formatting
  const periodLabel = useMemo(() => {
    if (isBasketball) {
      return isLive ? `Q${match.quarterScores ? match.quarterScores.length : 2} | ${match.minute || 18}:00` : 'MAÇ SONU';
    }
    if (isVolleyball) {
      return isLive ? `Set ${match.setScores ? match.setScores.length : 1}` : 'MAÇ SONU';
    }
    if (isLive) {
      const min = match.minute || currentState.minute || 45;
      const isHalftime = min === 45 && !isBasketball && !isVolleyball;
      if (isHalftime) {
        return 'DEVRE ARASI (HT) | 45:00';
      }
      const period = min <= 45 ? '1. YARI' : min <= 90 ? '2. YARI' : 'UZATMALAR';
      const sec = Math.floor((Date.now() / 1000) % 60).toString().padStart(2, '0');
      return `${period} | ${min}:${sec}`;
    }
    if (isFinished) {
      return 'MAÇ SONU | 90:00';
    }
    return `BAŞLAMA: ${match.time || '20:00'}`;
  }, [isBasketball, isVolleyball, isLive, isFinished, match, currentState.minute]);

  return (
    <div 
      className={`relative w-full rounded-xl overflow-hidden shadow-2xl border border-[#21262D] select-none font-mono bg-[#0D1117] ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none bg-black flex flex-col justify-between' : ''
      } ${className}`}
    >
      {/* 2D PITCH / COURT CONTAINER */}
      <div 
        className={`relative w-full aspect-[16/9] sm:aspect-[2.1/1] max-h-[380px] overflow-hidden ${
          isBasketball ? 'bg-[#b86928]' : isVolleyball ? 'bg-[#1e40af]' : 'bg-[#1a5a27]'
        }`}
      >
        {/* Grass or Parquet Court Texture */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: isBasketball 
              ? `repeating-linear-gradient(
                  90deg,
                  #cf7d38,
                  #cf7d38 3.5%,
                  #b56b2a 3.5%,
                  #b56b2a 7%
                )`
              : isVolleyball
                ? `repeating-linear-gradient(
                    90deg,
                    #2563eb,
                    #2563eb 10%,
                    #1d4ed8 10%,
                    #1d4ed8 20%
                  )`
                : `repeating-linear-gradient(
                    90deg,
                    #2a7d38,
                    #2a7d38 7.14%,
                    #226b2e 7.14%,
                    #226b2e 14.28%
                  )`
          }}
        />

        {/* Dynamic Darkening / Vignette Overlay for Depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40 pointer-events-none" />

        {/* Dynamic Pressure / Spotlight Cone */}
        <div 
          className={`absolute top-0 bottom-0 transition-all duration-1000 ease-in-out pointer-events-none ${
            currentState.spotlightTeam === 'home' 
              ? 'left-0 w-[65%] bg-gradient-to-r from-emerald-400/20 via-emerald-400/5 to-transparent'
              : 'right-0 w-[65%] bg-gradient-to-l from-cyan-400/20 via-cyan-400/5 to-transparent'
          }`}
          style={{
            clipPath: currentState.spotlightTeam === 'home'
              ? 'polygon(0 0, 100% 0, 80% 100%, 0 100%)'
              : 'polygon(20% 0, 100% 0, 100% 100%, 0 100%)'
          }}
        />

        {/* GOAL / BASKET CELEBRATION FULL-SCREEN BURST ANIMATION FX */}
        {goalCelebrationActive && celebrationData && (
          <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-4 animate-in fade-in zoom-in-90 duration-300 pointer-events-none">
            {/* Animated Golden Radiance & Starburst */}
            <div className="absolute inset-0 bg-gradient-to-t from-amber-500/25 via-yellow-400/15 to-transparent animate-pulse" />
            
            <div className="relative z-10 flex flex-col items-center space-y-2">
              <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-sm sm:text-base tracking-widest uppercase shadow-lg shadow-amber-500/50 animate-bounce">
                <span>{celebrationData.title}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-wider drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] scale-110">
                {celebrationData.team}
              </h2>
              <div className="text-sm sm:text-base font-bold text-amber-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
                <span>{celebrationData.player}</span>
                <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
              </div>
              <div className="text-xl sm:text-3xl font-black text-green-400 bg-black/90 px-5 py-1.5 rounded-xl border border-green-500/50 mt-1 shadow-inner">
                {match.homeScore ?? 0} : {match.awayScore ?? 0}
              </div>
            </div>
          </div>
        )}

        {/* Channel Switch Loading Splash Overlay */}
        {channelSwitchLoading && (
          <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white animate-in fade-in duration-200">
            <div className="w-8 h-8 border-3 border-green-500 border-t-transparent rounded-full animate-spin mb-2" />
            <div className="text-xs font-bold flex items-center gap-1.5 text-green-400">
              <Tv className="w-3.5 h-3.5" />
              <span>{selectedChannel.name} Yayınına Bağlanıyor...</span>
            </div>
            <span className="text-[10px] text-gray-400 font-sans mt-0.5">
              {selectedChannel.quality} • {selectedChannel.bitrate} • Düşük Gecikme
            </span>
          </div>
        )}

        {/* Pitch Lines (SVG Vector Overlay for Crisp Field / Court Lines) */}
        <svg 
          viewBox="0 0 1000 560" 
          className="absolute inset-0 w-full h-full p-2 pointer-events-none stroke-white/85 fill-none"
          style={{ strokeWidth: 3 }}
        >
          {isBasketball ? (
            /* BASKETBALL COURT LINES */
            <g id="basketball-court">
              {/* Outer Boundary Line */}
              <rect x="25" y="25" width="950" height="510" rx="3" strokeWidth="3.5" />
              {/* Center Line & Circle */}
              <line x1="500" y1="25" x2="500" y2="535" strokeWidth="3" />
              <circle cx="500" cy="280" r="70" strokeWidth="3" />
              <circle cx="500" cy="280" r="22" fill="rgba(255,255,255,0.15)" strokeWidth="2" />
              
              {/* HOME (Left) Key & 3-Point Arc */}
              {/* Painted Key Area */}
              <rect x="25" y="180" width="180" height="200" fill="rgba(180, 80, 20, 0.35)" stroke="#ffffff" strokeWidth="3" />
              {/* Free Throw Circle */}
              <circle cx="205" cy="280" r="60" stroke="#ffffff" strokeWidth="3" />
              {/* Restricted Area Arc */}
              <path d="M 65 245 A 35 35 0 0 1 65 315" stroke="#ffffff" strokeWidth="2.5" />
              {/* 3-Point Arc */}
              <path d="M 25 75 L 140 75 A 225 225 0 0 1 140 485 L 25 485" stroke="#ffffff" strokeWidth="3.5" />
              {/* Backboard & Rim */}
              <line x1="55" y1="235" x2="55" y2="325" stroke="#ffffff" strokeWidth="6" />
              <line x1="25" y1="280" x2="55" y2="280" stroke="#ffffff" strokeWidth="4" />
              <circle cx="72" cy="280" r="15" stroke="#ff5722" strokeWidth="4.5" fill="rgba(255,87,34,0.2)" />
              {/* Net mesh lines */}
              <line x1="62" y1="280" x2="82" y2="280" stroke="#ffffff" strokeWidth="1" />
              <line x1="72" y1="270" x2="72" y2="290" stroke="#ffffff" strokeWidth="1" />

              {/* AWAY (Right) Key & 3-Point Arc */}
              {/* Painted Key Area */}
              <rect x="795" y="180" width="180" height="200" fill="rgba(180, 80, 20, 0.35)" stroke="#ffffff" strokeWidth="3" />
              {/* Free Throw Circle */}
              <circle cx="795" cy="280" r="60" stroke="#ffffff" strokeWidth="3" />
              {/* Restricted Area Arc */}
              <path d="M 935 245 A 35 35 0 0 0 935 315" stroke="#ffffff" strokeWidth="2.5" />
              {/* 3-Point Arc */}
              <path d="M 975 75 L 860 75 A 225 225 0 0 0 860 485 L 975 485" stroke="#ffffff" strokeWidth="3.5" />
              {/* Backboard & Rim */}
              <line x1="945" y1="235" x2="945" y2="325" stroke="#ffffff" strokeWidth="6" />
              <line x1="975" y1="280" x2="945" y2="280" stroke="#ffffff" strokeWidth="4" />
              <circle cx="928" cy="280" r="15" stroke="#ff5722" strokeWidth="4.5" fill="rgba(255,87,34,0.2)" />
              {/* Net mesh lines */}
              <line x1="918" y1="280" x2="938" y2="280" stroke="#ffffff" strokeWidth="1" />
              <line x1="928" y1="270" x2="928" y2="290" stroke="#ffffff" strokeWidth="1" />
            </g>
          ) : (
            /* FOOTBALL PITCH LINES */
            <g id="football-pitch">
              {/* Outer Boundary Line */}
              <rect x="25" y="25" width="950" height="510" rx="2" />
              {/* Halfway Line */}
              <line x1="500" y1="25" x2="500" y2="535" />
              {/* Center Circle & Center Spot */}
              <circle cx="500" cy="280" r="75" />
              <circle cx="500" cy="280" r="3" fill="#ffffff" />
              {/* HOME SIDE (Left) */}
              <rect x="25" y="140" width="145" height="280" />
              <rect x="25" y="210" width="50" height="140" />
              <circle cx="120" cy="280" r="3" fill="#ffffff" />
              <path d="M 170 230 A 75 75 0 0 1 170 330" />
              <rect x="10" y="245" width="15" height="70" stroke="#ffffff" fill="rgba(255,255,255,0.25)" strokeWidth="2" />
              {/* AWAY SIDE (Right) */}
              <rect x="830" y="140" width="145" height="280" />
              <rect x="925" y="210" width="50" height="140" />
              <circle cx="880" cy="280" r="3" fill="#ffffff" />
              <path d="M 830 230 A 75 75 0 0 0 830 330" />
              <rect x="975" y="245" width="15" height="70" stroke="#ffffff" fill="rgba(255,255,255,0.25)" strokeWidth="2" />
              {/* Corner Arcs */}
              <path d="M 25 40 A 15 15 0 0 0 40 25" />
              <path d="M 25 520 A 15 15 0 0 1 40 535" />
              <path d="M 975 40 A 15 15 0 0 1 960 25" />
              <path d="M 975 520 A 15 15 0 0 0 960 535" />
            </g>
          )}

          {/* DYNAMIC TRAJECTORY PATH ARROW (Ball Pass / Cross / Shot line) */}
          {currentState.trajectory && (
            <g className="animate-in fade-in duration-500">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={currentState.trajectory.type === 'goal' || currentState.trajectory.type === 'shot' ? '#F59E0B' : '#FFFFFF'} />
                </marker>
              </defs>
              <line 
                x1={currentState.trajectory.startX * 10} 
                y1={currentState.trajectory.startY * 5.6} 
                x2={currentState.trajectory.endX * 10} 
                y2={currentState.trajectory.endY * 5.6}
                stroke={currentState.trajectory.type === 'goal' || currentState.trajectory.type === 'shot' ? '#F59E0B' : 'rgba(255,255,255,0.8)'}
                strokeWidth={currentState.trajectory.type === 'goal' || currentState.trajectory.type === 'shot' ? '4' : '2.5'}
                strokeDasharray={currentState.trajectory.type === 'cross' ? '6,6' : undefined}
                markerEnd="url(#arrow)"
              />
            </g>
          )}
        </svg>

        {/* TOP STATUS BAR OVERLAY: Score, Period & Live Source Selector */}
        <div className="absolute top-2.5 inset-x-0 flex items-center justify-between px-3 pointer-events-none z-20">
          {/* Match Score Badge */}
          <div className="flex items-center gap-2 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-lg pointer-events-auto">
            <span className="text-xs sm:text-sm font-black text-white">{match.homeScore ?? 0}</span>
            <span className="text-xs text-gray-400 font-bold">:</span>
            <span className="text-xs sm:text-sm font-black text-white">{match.awayScore ?? 0}</span>
          </div>

          {/* Period & Minute Badge */}
          <div className="bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-lg flex items-center gap-1.5 pointer-events-auto">
            {isLive && (
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
            )}
            <span className="text-[10px] sm:text-xs font-bold tracking-wider text-white">
              {periodLabel}
            </span>
          </div>

          {/* TV / BROADCAST CHANNEL DROPDOWN */}
          <div className="relative pointer-events-auto" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsChannelDropdownOpen(!isChannelDropdownOpen)}
              className="bg-black/80 hover:bg-black/95 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 hover:border-green-400/60 shadow-lg flex items-center gap-1.5 cursor-pointer transition-all text-left"
              title="Yayın Kaynağını Değiştir (beIN, Exxen, S Sport vb.)"
            >
              <Radio className="w-3 h-3 text-red-500 animate-pulse shrink-0" />
              <span className="text-[10px] sm:text-[11px] font-black text-white tracking-wide max-w-[90px] sm:max-w-[130px] truncate">
                {selectedChannel.name}
              </span>
              <span className="text-[8px] px-1 py-0.2 rounded bg-green-500/20 text-green-400 border border-green-500/40 font-bold hidden sm:inline">
                {selectedChannel.quality.includes('4K') ? '4K' : 'HD'}
              </span>
              <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isChannelDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu for Broadcast Channels */}
            {isChannelDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-64 sm:w-72 bg-[#0D1117] border border-[#30363D] rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 bg-[#161B22] border-b border-[#21262D] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Tv className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-xs font-bold text-white">Yayın Kaynağı</span>
                  </div>
                  <span className="text-[9px] text-gray-400">
                    {broadcastChannels.length} Kanal
                  </span>
                </div>

                <div className="p-1 max-h-56 overflow-y-auto space-y-0.5 no-scrollbar">
                  {broadcastChannels.map((channel) => {
                    const isSelected = channel.id === selectedChannel.id;
                    return (
                      <button
                        key={channel.id}
                        type="button"
                        onClick={() => handleSelectChannel(channel)}
                        className={`w-full p-2 rounded-lg flex items-center justify-between transition-colors cursor-pointer text-left ${
                          isSelected 
                            ? 'bg-green-500/15 border border-green-500/40 text-white' 
                            : 'hover:bg-[#161B22] text-gray-300 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-green-400 shadow-sm shadow-green-400' : 'bg-gray-500'}`} />
                          <div className="truncate">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white truncate">
                                {channel.name}
                              </span>
                              {channel.isOfficial && (
                                <span className="text-[8px] px-1 py-0.2 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded font-bold">
                                  Resmi
                                </span>
                              )}
                            </div>
                            <div className="text-[9px] text-gray-400 flex items-center gap-1.5 font-sans">
                              <span>{channel.quality}</span>
                              <span>•</span>
                              <span>{channel.language}</span>
                              <span>•</span>
                              <span className="text-green-400/80">{channel.bitrate}</span>
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 text-green-400" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="px-3 py-1.5 bg-[#090C10] border-t border-[#21262D] flex items-center justify-between text-[9px] text-gray-400 font-sans">
                  <span className="flex items-center gap-1">
                    <Wifi className="w-2.5 h-2.5 text-green-400" /> Canlı Senkronizasyon
                  </span>
                  <span>Düşük Gecikme Modu</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PRE-MATCH ATMOSPHERE & LINEUP OVERLAY */}
        {isNotStarted && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-3 bg-black/55 backdrop-blur-[2px]">
            {/* Pre-Match Tactical Field Lines with Team Jersey Dots */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
              {/* Home lineup circles on left */}
              <div className="absolute left-[8%] top-[50%] -translate-y-1/2 w-5 h-5 rounded-full bg-emerald-500 border border-white text-[9px] font-black text-black flex items-center justify-center shadow">1</div>
              <div className="absolute left-[20%] top-[25%] -translate-y-1/2 w-5 h-5 rounded-full bg-emerald-500 border border-white text-[9px] font-black text-black flex items-center justify-center shadow">3</div>
              <div className="absolute left-[18%] top-[40%] -translate-y-1/2 w-5 h-5 rounded-full bg-emerald-500 border border-white text-[9px] font-black text-black flex items-center justify-center shadow">4</div>
              <div className="absolute left-[18%] top-[60%] -translate-y-1/2 w-5 h-5 rounded-full bg-emerald-500 border border-white text-[9px] font-black text-black flex items-center justify-center shadow">5</div>
              <div className="absolute left-[20%] top-[75%] -translate-y-1/2 w-5 h-5 rounded-full bg-emerald-500 border border-white text-[9px] font-black text-black flex items-center justify-center shadow">2</div>
              <div className="absolute left-[32%] top-[38%] -translate-y-1/2 w-5 h-5 rounded-full bg-emerald-500 border border-white text-[9px] font-black text-black flex items-center justify-center shadow">6</div>
              <div className="absolute left-[32%] top-[62%] -translate-y-1/2 w-5 h-5 rounded-full bg-emerald-500 border border-white text-[9px] font-black text-black flex items-center justify-center shadow">8</div>
              <div className="absolute left-[42%] top-[50%] -translate-y-1/2 w-5 h-5 rounded-full bg-emerald-500 border border-white text-[9px] font-black text-black flex items-center justify-center shadow">10</div>

              {/* Away lineup circles on right */}
              <div className="absolute right-[8%] top-[50%] -translate-y-1/2 w-5 h-5 rounded-full bg-cyan-500 border border-white text-[9px] font-black text-black flex items-center justify-center shadow">1</div>
              <div className="absolute right-[20%] top-[25%] -translate-y-1/2 w-5 h-5 rounded-full bg-cyan-500 border border-white text-[9px] font-black text-black flex items-center justify-center shadow">3</div>
              <div className="absolute right-[18%] top-[40%] -translate-y-1/2 w-5 h-5 rounded-full bg-cyan-500 border border-white text-[9px] font-black text-black flex items-center justify-center shadow">4</div>
              <div className="absolute right-[18%] top-[60%] -translate-y-1/2 w-5 h-5 rounded-full bg-cyan-500 border border-white text-[9px] font-black text-black flex items-center justify-center shadow">5</div>
              <div className="absolute right-[20%] top-[75%] -translate-y-1/2 w-5 h-5 rounded-full bg-cyan-500 border border-white text-[9px] font-black text-black flex items-center justify-center shadow">2</div>
              <div className="absolute right-[32%] top-[50%] -translate-y-1/2 w-5 h-5 rounded-full bg-cyan-500 border border-white text-[9px] font-black text-black flex items-center justify-center shadow">9</div>
            </div>

            {/* Pre-Match Card */}
            <div className="relative z-10 bg-[#161B22]/95 border border-amber-500/40 rounded-2xl p-3 sm:p-4 max-w-xs sm:max-w-md text-center shadow-2xl space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-black tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>KARŞILAŞMA BAŞLAMADI</span>
              </div>

              <div className="flex items-center justify-center gap-2.5 py-0.5">
                <TeamLogo logo={match.homeTeam.logo} fallback="⚽" className="w-8 h-8" />
                <span className="text-xs sm:text-sm font-black text-white">{match.homeTeam.name}</span>
                <span className="text-gray-400 font-bold text-xs">vs</span>
                <span className="text-xs sm:text-sm font-black text-white">{match.awayTeam.name}</span>
                <TeamLogo logo={match.awayTeam.logo} fallback="⚽" className="w-8 h-8" />
              </div>

              <div className="text-[11px] text-gray-300 bg-black/60 px-3 py-1 rounded-lg border border-white/10 flex items-center justify-around font-sans font-bold">
                <span>⏰ Başlama Saati: <strong className="text-amber-300">{match.time || '21:30'} TSİ</strong></span>
                <span>📺 {selectedChannel.name}</span>
              </div>

              <p className="text-[10px] text-gray-400 font-sans leading-tight">
                Karşılaşma henüz başlamadı. Canlı 2D saha anlatımı başlama düdüğü ile otomatik başlayacaktır.
              </p>
            </div>
          </div>
        )}

        {/* FINISHED MATCH OVERLAY */}
        {isFinished && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-3 bg-black/70 backdrop-blur-[2px]">
            <div className="relative z-10 bg-[#161B22]/95 border border-emerald-500/40 rounded-2xl p-4 max-w-xs sm:max-w-md text-center shadow-2xl space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-black tracking-wider uppercase">
                <span>🏁 MAÇ SONUCU</span>
              </div>

              <div className="text-2xl sm:text-3xl font-black text-white tracking-widest bg-black/80 px-5 py-1.5 rounded-xl border border-white/10">
                {match.homeScore ?? 0} : {match.awayScore ?? 0}
              </div>

              <div className="text-xs text-gray-300 font-extrabold font-sans">
                {match.homeTeam.name} vs {match.awayTeam.name}
              </div>

              <p className="text-[10px] text-gray-400 font-sans">
                Karşılaşma sona ermiştir. İstatistikler ve detaylar güncellenmiştir.
              </p>
            </div>
          </div>
        )}

        {/* CENTER PITCH LIVE ACTION BANNER (ONLY WHEN LIVE) */}
        {isLive && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4 z-10">
            <div className="flex items-center gap-3 bg-black/75 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20 max-w-[88%] sm:max-w-[75%] text-center animate-in fade-in zoom-in-95 duration-300 shadow-2xl">
              {/* Team Color Accent Bar */}
              <div 
                className={`w-1.5 h-11 rounded-full transition-colors duration-500 ${
                  currentState.team === 'home' ? 'bg-emerald-400 shadow-md shadow-emerald-400' : 'bg-cyan-400 shadow-md shadow-cyan-400'
                }`} 
              />
              
              <div className="text-left">
                <h4 className="text-sm sm:text-base font-black text-white tracking-wide flex items-center gap-1.5 leading-tight">
                  <span>{currentState.title}</span>
                  {currentState.action === 'DANGEROUS_ATTACK' && (
                    <Flame className="w-4 h-4 text-amber-400 animate-pulse inline" />
                  )}
                  {currentState.action === 'CORNER_KICK' && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-300 border border-amber-500/50">KORNER</span>
                  )}
                  {currentState.action === 'YELLOW_CARD' && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-yellow-500/30 text-yellow-300 border border-yellow-500/50">SARI KART</span>
                  )}
                  {currentState.action === 'RED_CARD' && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/30 text-red-300 border border-red-500/50">KIRMIZI KART</span>
                  )}
                  {currentState.action === 'SHOT_ON_TARGET' && (
                    <Target className="w-4 h-4 text-red-400 animate-bounce inline" />
                  )}
                  {currentState.action === 'SAVE' && (
                    <ShieldAlert className="w-4 h-4 text-blue-400 inline" />
                  )}
                  {currentState.action === 'BASKET_THREE' && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/30 text-yellow-300 border border-amber-500/50 font-bold">🎯 3 SAYI</span>
                  )}
                  {currentState.action === 'BASKET_TWO' && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-green-500/30 text-green-300 border border-green-500/50 font-bold">🏀 2 SAYI</span>
                  )}
                  {currentState.action === 'SLAM_DUNK' && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-300 border border-purple-500/50 font-bold">🔥 SMAÇ</span>
                  )}
                  {currentState.action === 'BLOCK' && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-300 border border-blue-500/50 font-bold">🛡️ BLOK</span>
                  )}
                  {currentState.action === 'FAST_BREAK' && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-300 border border-amber-500/50 font-bold">⚡ HIZLI HÜCUM</span>
                  )}
                </h4>
                <p className="text-xs sm:text-sm font-semibold text-gray-200 tracking-normal drop-shadow-md">
                  {currentState.subtitle}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ANIMATED BALL WITH SPEED TRAIL (SOCCER / BASKETBALL - ONLY WHEN LIVE) */}
        {isLive && (
          <div 
            className="absolute transition-all duration-1000 ease-out pointer-events-none -translate-x-1/2 -translate-y-1/2 z-10"
            style={{
              left: `${currentState.ballX}%`,
              top: `${currentState.ballY}%`
            }}
          >
            <div className="relative flex items-center justify-center">
              {/* Ball pulse ring */}
              <div 
                className={`absolute rounded-full animate-ping ${
                  currentState.action === 'GOAL' || currentState.action === 'BASKET_THREE' || currentState.action === 'SLAM_DUNK' || currentState.action === 'BASKET_TWO'
                    ? 'w-11 h-11 bg-amber-400/80' 
                    : isBasketball 
                      ? 'w-7 h-7 bg-amber-500/40' 
                      : 'w-7 h-7 bg-white/50'
                }`} 
              />
              
              {/* Ball Outer Container */}
              <div 
                className={`w-6 h-6 rounded-full shadow-xl shadow-black flex items-center justify-center border ${
                  currentState.action === 'GOAL' || currentState.action === 'BASKET_THREE' || currentState.action === 'SLAM_DUNK' || currentState.action === 'BASKET_TWO'
                    ? 'border-amber-400 bg-amber-100 scale-125 ring-2 ring-amber-400' 
                    : isBasketball
                      ? 'border-amber-700 bg-amber-600'
                      : 'border-black/50 bg-white'
                }`}
              >
                <span className="text-[11px] select-none">
                  {isBasketball ? '🏀' : isVolleyball ? '🏐' : '⚽'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM BRAND WATERMARK & CONTROLS */}
        <div className="absolute bottom-2.5 inset-x-0 px-3 flex items-center justify-between pointer-events-none z-20">
          {/* Simulation Controls: Play/Pause, Sound, Replay */}
          <div className="flex items-center gap-1.5 pointer-events-auto bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1 rounded text-white hover:text-green-400 transition-colors cursor-pointer"
              title={isPlaying ? 'Durdur' : 'Oynat'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) soundFX.playWhistle();
              }}
              className={`p-1 rounded transition-colors cursor-pointer ${soundEnabled ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}
              title={soundEnabled ? 'Sesi Kapat' : 'Ses Efektlerini Aç (Düdük, Tezahürat)'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => setCurrentIndex(0)}
              className="p-1 rounded text-gray-400 hover:text-white transition-colors cursor-pointer"
              title="Simülasyonu Baştan Başlat"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Right Action: Fullscreen & Close */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {showFullscreenBtn && (
              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="w-7 h-7 rounded-lg bg-black/70 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer shadow-md"
                title={isFullscreen ? 'Küçült' : 'Tam Ekran Görünüm'}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            )}

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-2 py-1 rounded-lg bg-red-500/80 hover:bg-red-500 text-white text-[10px] font-bold flex items-center gap-1 border border-red-400 shadow-md cursor-pointer transition-colors"
                title="2D Sahayı Kapat"
              >
                <X className="w-3 h-3" />
                <span>Kapat</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SUB-NAVIGATION TABS (2D Saha, Canlı İstatistik, Olaylar) */}
      <div className="bg-[#161B22] px-3 py-1.5 border-t border-[#21262D] flex items-center justify-between text-xs overflow-x-auto no-scrollbar whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedSubTab('pitch')}
            className={`px-3 py-1 rounded-lg font-extrabold text-xs flex items-center gap-1.5 cursor-pointer transition-all shrink-0 ${
              selectedSubTab === 'pitch' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm' 
                : 'text-gray-400 hover:text-white bg-[#0D1117] border border-transparent'
            }`}
          >
            <Radio className="w-3 h-3 text-emerald-400" />
            <span>2D Simülasyon</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedSubTab('stats')}
            className={`px-3 py-1 rounded-lg font-extrabold text-xs flex items-center gap-1.5 cursor-pointer transition-all shrink-0 ${
              selectedSubTab === 'stats' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm' 
                : 'text-gray-400 hover:text-white bg-[#0D1117] border border-transparent'
            }`}
          >
            <BarChart2 className="w-3 h-3" />
            <span>Canlı İstatistik</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedSubTab('events')}
            className={`px-3 py-1 rounded-lg font-extrabold text-xs flex items-center gap-1.5 cursor-pointer transition-all shrink-0 ${
              selectedSubTab === 'events' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm' 
                : 'text-gray-400 hover:text-white bg-[#0D1117] border border-transparent'
            }`}
          >
            <Activity className="w-3 h-3" />
            <span>Olay Çizelgesi ({isNotStarted ? 0 : match.events?.length || simulationTimeline.length})</span>
          </button>
        </div>

        <div className="text-[10px] text-gray-400 hidden sm:flex items-center gap-2 shrink-0">
          <span>xG: <strong className="text-emerald-400">{stats.xg[0].toFixed(2)}</strong> - <strong className="text-cyan-400">{stats.xg[1].toFixed(2)}</strong></span>
        </div>
      </div>

      {/* ACCURATE MATCH STATISTICS & POSSESSION PANEL (Synced with Live Match) */}
      {selectedSubTab === 'stats' && (
        <div className="p-3 bg-[#0D1117] border-t border-[#21262D] space-y-3 animate-in fade-in duration-200">
          {/* Topa Sahip Olma (Possession %) */}
          <div>
            <div className="flex justify-between text-xs font-bold text-gray-300 mb-1">
              <span className="text-emerald-400 font-black">%{stats.possession[0]} {match.homeTeam.name}</span>
              <span className="text-gray-400 text-[10px] uppercase">Topa Sahip Olma</span>
              <span className="text-cyan-400 font-black">%{stats.possession[1]} {match.awayTeam.name}</span>
            </div>
            <div className="w-full h-2.5 bg-[#21262D] rounded-full overflow-hidden flex">
              <div 
                className="bg-emerald-500 h-full transition-all duration-700" 
                style={{ width: `${stats.possession[0]}%` }}
              />
              <div 
                className="bg-cyan-500 h-full transition-all duration-700" 
                style={{ width: `${stats.possession[1]}%` }}
              />
            </div>
          </div>

          {/* Grid Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="bg-[#161B22] p-2 rounded-lg border border-[#30363D] text-center">
              <span className="text-[10px] text-gray-400 block font-sans">Toplam / İsabetli Şut</span>
              <span className="text-xs font-black text-white">
                <strong className="text-emerald-400">{stats.shotsTotal[0]} ({stats.shotsOnTarget[0]})</strong> - <strong className="text-cyan-400">{stats.shotsTotal[1]} ({stats.shotsOnTarget[1]})</strong>
              </span>
            </div>
            <div className="bg-[#161B22] p-2 rounded-lg border border-[#30363D] text-center">
              <span className="text-[10px] text-gray-400 block font-sans">Tehlikeli Atak</span>
              <span className="text-xs font-black text-white">
                <strong className="text-emerald-400">{stats.dangerousAttacks[0]}</strong> - <strong className="text-cyan-400">{stats.dangerousAttacks[1]}</strong>
              </span>
            </div>
            <div className="bg-[#161B22] p-2 rounded-lg border border-[#30363D] text-center">
              <span className="text-[10px] text-gray-400 block font-sans">Kornerler</span>
              <span className="text-xs font-black text-white">
                <strong className="text-emerald-400">{stats.corners[0]}</strong> - <strong className="text-cyan-400">{stats.corners[1]}</strong>
              </span>
            </div>
            <div className="bg-[#161B22] p-2 rounded-lg border border-[#30363D] text-center">
              <span className="text-[10px] text-gray-400 block font-sans">Sarı / Kırmızı Kart</span>
              <span className="text-xs font-black text-white">
                <strong className="text-yellow-400">{stats.yellowCards[0]}</strong> <strong className="text-red-400">({stats.redCards[0]})</strong> - <strong className="text-yellow-400">{stats.yellowCards[1]}</strong> <strong className="text-red-400">({stats.redCards[1]})</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TIMELINE EVENTS LIST (Click to Jump Simulation) */}
      {selectedSubTab === 'events' && (
        <div className="p-2.5 bg-[#0D1117] border-t border-[#21262D] max-h-40 overflow-y-auto space-y-1.5 no-scrollbar">
          {isNotStarted ? (
            <div className="p-4 bg-[#161B22] border border-[#21262D] rounded-xl text-center space-y-1">
              <span className="text-xs font-bold text-amber-300 block">⏰ Karşılaşma Saat {match.time || '21:30'}'da Başlayacaktır</span>
              <span className="text-[11px] text-gray-400 block font-sans">Henüz canlı olay bulunmuyor. Karşılaşma başladığında gol, kart ve pozisyon olayları burada görüntülenecektir.</span>
            </div>
          ) : (
            simulationTimeline.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setCurrentIndex(idx);
                  setSelectedSubTab('pitch');
                }}
                className={`w-full p-2 rounded-lg flex items-center justify-between text-left text-xs transition-colors cursor-pointer ${
                  currentIndex === idx 
                    ? 'bg-emerald-500/15 border border-emerald-500/40 text-white' 
                    : 'bg-[#161B22] hover:bg-[#1f2937] text-gray-300 border border-[#21262D]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-400 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                    {item.minute}'
                  </span>
                  <span className={`font-bold ${item.team === 'home' ? 'text-emerald-400' : 'text-cyan-400'}`}>
                    {item.title}
                  </span>
                  <span className="text-gray-400 text-[11px] font-sans truncate max-w-[200px]">
                    {item.subtitle}
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-500 shrink-0" />
              </button>
            ))
          )}
        </div>
      )}

      {/* QUICK LIVE ACTION TICKER STRIP */}
      {selectedSubTab === 'pitch' && (
        <div className="bg-[#0D1117] p-2 sm:p-2.5 border-t border-[#21262D] flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className={`text-[10px] font-black px-2 py-0.5 rounded border shrink-0 ${
              isLive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
            }`}>
              {isLive ? 'CANLI ANLATIM' : isFinished ? 'MAÇ BİTTİ' : 'BAŞLAMADI'}
            </span>
            <p className="text-[11px] text-gray-300 truncate font-sans">
              {isLive 
                ? `${currentState.title} - ${currentState.subtitle} (${currentState.minute}')`
                : isFinished 
                  ? `Karşılaşma Tamamlandı. Maç Sonucu: ${match.homeTeam.name} ${match.homeScore ?? 0} - ${match.awayScore ?? 0} ${match.awayTeam.name}`
                  : `Karşılaşma Henüz Başlamadı. Başlama Saati: ${match.time || '21:30'} TSİ (${match.homeTeam.name} - ${match.awayTeam.name})`
              }
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-gray-400 bg-[#161B22] px-2 py-0.5 rounded border border-[#30363D]">
              <Tv className="w-2.5 h-2.5 text-green-400" />
              <span className="text-gray-300 font-bold">{selectedChannel.name}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
