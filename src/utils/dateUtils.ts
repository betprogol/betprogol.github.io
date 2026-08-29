/**
 * Utility functions for Turkey Timezone (Europe/Istanbul - TSİ / UTC+3) formatting and calculations
 */

export function getTurkeyTodayIso(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' });
}

export function getTurkeyTodayTr(): string {
  return new Date().toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul' });
}

export function getTurkeyNowFormatted(): string {
  return new Date().toLocaleString('tr-TR', {
    timeZone: 'Europe/Istanbul',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Converts ISO date string (YYYY-MM-DD) or any date string to Turkish format DD.MM.YYYY
 */
export function formatDateToTr(dateStr?: string): string {
  if (!dateStr || dateStr === 'today') {
    return getTurkeyTodayTr();
  }
  // If already DD.MM.YYYY
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) {
    return dateStr;
  }
  // If YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-');
    return `${d}.${m}.${y}`;
  }
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul' });
    }
  } catch {
    // fallback
  }
  return dateStr;
}

/**
 * Returns human-friendly relative day in Turkish (Bugün, Yarın, Dün, Pazartesi, Salı, vb.)
 */
export function getRelativeDayLabel(dateStr?: string): string {
  if (!dateStr || dateStr === 'today') return 'Bugün';
  const todayIso = getTurkeyTodayIso();
  if (dateStr === todayIso) return 'Bugün';

  try {
    const today = new Date(todayIso + 'T00:00:00Z');
    let target: Date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      target = new Date(dateStr + 'T00:00:00Z');
    } else {
      target = new Date(dateStr);
    }
    if (!isNaN(target.getTime())) {
      const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return 'Bugün';
      if (diffDays === 1) return 'Yarın';
      if (diffDays === -1) return 'Dün';
      const dayName = target.toLocaleDateString('tr-TR', { weekday: 'short', timeZone: 'Europe/Istanbul' });
      const dayNum = target.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', timeZone: 'Europe/Istanbul' });
      return `${dayNum} ${dayName}`;
    }
  } catch {
    // fallback
  }
  return formatDateToTr(dateStr);
}

/**
 * Formats match schedule for clean, professional display in fixture lists
 * Example: "Bugün 20:00", "Yarın 19:00", "24 Ağu Pzt 20:00"
 */
export function formatMatchScheduleLabel(dateStr?: string, timeStr?: string): string {
  const dayLabel = getRelativeDayLabel(dateStr);
  const time = timeStr || '20:00';
  return `${dayLabel} ${time}`;
}

/**
 * Checks whether a match has expired (past date/time) without being finished, or has been cancelled/postponed.
 * Used to automatically remove past-dated unplayed/cancelled matches from the system.
 */
export function isExpiredUnplayedMatch(matchDate?: string, matchStatus?: string, matchTime?: string): boolean {
  if (!matchStatus) return false;
  // Cancelled or Postponed matches without completion are removed
  if (matchStatus === 'POSTPONED' || matchStatus === 'CANCELLED') {
    return true;
  }
  if (!matchDate) return false;
  const todayIso = getTurkeyTodayIso(); // e.g. "2026-08-23"

  // If match date is prior to today and match is NOT finished and NOT currently live
  if (matchDate < todayIso && matchStatus !== 'FINISHED' && matchStatus !== 'LIVE') {
    return true;
  }

  // If match date is today, status is still NOT_STARTED, but time was > 4 hours ago, filter it out
  if (matchDate === todayIso && matchStatus === 'NOT_STARTED' && matchTime) {
    try {
      const now = new Date();
      const istanbulNowStr = now.toLocaleTimeString('tr-TR', { timeZone: 'Europe/Istanbul', hour12: false });
      const [nowH, nowM] = istanbulNowStr.split(':').map(Number);
      const [mH, mM] = matchTime.split(':').map(Number);
      if (!isNaN(nowH) && !isNaN(mH)) {
        const nowMins = nowH * 60 + (nowM || 0);
        const matchMins = mH * 60 + (mM || 0);
        if (nowMins - matchMins > 240) { // 4 hours past scheduled kickoff without starting
          return true;
        }
      }
    } catch {
      // fallback
    }
  }

  return false;
}

/**
 * Ensures match time string is 24h formatted (HH:mm)
 */
export function formatTime24(timeStr?: string): string {
  if (!timeStr) return '20:00';
  const parts = timeStr.trim().split(':');
  if (parts.length >= 2) {
    const h = String(parseInt(parts[0], 10)).padStart(2, '0');
    const m = String(parseInt(parts[1], 10)).padStart(2, '0');
    return `${h}:${m}`;
  }
  return timeStr;
}

export interface MatchTimingInfo {
  elapsedMinutes: number;
  isPastKickoff: boolean;
  isLive: boolean;
  isFinished: boolean;
  isFuture: boolean;
  liveMinute?: number;
  status: 'NOT_STARTED' | 'LIVE' | 'FINISHED';
}

/**
 * Calculates exact timing telemetry for any match date/time in Europe/Istanbul (TSİ / UTC+3)
 */
export function getMatchTimingInfo(
  dateStr?: string,
  timeStr?: string,
  sport?: string
): MatchTimingInfo {
  const now = new Date();
  const todayIso = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' }); // "YYYY-MM-DD"
  
  let targetDateIso = todayIso;
  if (dateStr) {
    const trimmed = dateStr.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      targetDateIso = trimmed;
    } else if (/^\d{2}\.\d{2}\.\d{4}$/.test(trimmed)) {
      const [d, m, y] = trimmed.split('.');
      targetDateIso = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    } else if (trimmed.toLowerCase() === 'today' || trimmed.toLowerCase() === 'bugün') {
      targetDateIso = todayIso;
    } else if (trimmed.toLowerCase() === 'yesterday' || trimmed.toLowerCase() === 'dün') {
      const yest = new Date(now);
      yest.setDate(now.getDate() - 1);
      targetDateIso = yest.toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' });
    } else {
      try {
        const parsed = new Date(trimmed);
        if (!isNaN(parsed.getTime())) {
          targetDateIso = parsed.toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' });
        }
      } catch {
        targetDateIso = todayIso;
      }
    }
  }

  // Duration in minutes based on sport
  let matchDuration = 115; // Football: 90m + 15m HT + stoppage
  if (sport === 'BASKETBALL') matchDuration = 130;
  if (sport === 'VOLLEYBALL' || sport === 'TENNIS') matchDuration = 150;

  const validTime = formatTime24(timeStr || '20:00');
  const [hours, mins] = validTime.split(':').map(Number);
  const h = isNaN(hours) ? 20 : hours;
  const m = isNaN(mins) ? 0 : mins;

  const dateParts = targetDateIso.split('-').map(Number);
  const y = isNaN(dateParts[0]) ? 2026 : dateParts[0];
  const mo = isNaN(dateParts[1]) ? 8 : dateParts[1];
  const d = isNaN(dateParts[2]) ? 26 : dateParts[2];

  // Istanbul is UTC+3. Match start in UTC is h - 3:
  const matchStartUtc = new Date(Date.UTC(y, mo - 1, d, h - 3, m, 0));
  const diffMs = now.getTime() - matchStartUtc.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  // If match date is strictly before today in Istanbul time
  if (targetDateIso < todayIso) {
    return {
      elapsedMinutes: Math.max(diffMinutes, 120),
      isPastKickoff: true,
      isLive: false,
      isFinished: true,
      isFuture: false,
      status: 'FINISHED'
    };
  }

  if (diffMinutes < 0) {
    return {
      elapsedMinutes: diffMinutes,
      isPastKickoff: false,
      isLive: false,
      isFinished: false,
      isFuture: true,
      status: 'NOT_STARTED'
    };
  } else if (diffMinutes >= 0 && diffMinutes <= matchDuration) {
    let liveMin: number;
    if (sport === 'FOOTBALL' || !sport || sport === 'SOCCER') {
      if (diffMinutes < 45) {
        liveMin = Math.max(1, diffMinutes + 1);
      } else if (diffMinutes >= 45 && diffMinutes < 60) {
        liveMin = 45; // Halftime break (Devre arası)
      } else if (diffMinutes >= 60 && diffMinutes < 105) {
        liveMin = Math.min(90, 46 + (diffMinutes - 60));
      } else {
        liveMin = 90;
      }
    } else {
      liveMin = Math.min(90, Math.max(1, diffMinutes));
    }
    return {
      elapsedMinutes: diffMinutes,
      isPastKickoff: true,
      isLive: true,
      isFinished: false,
      isFuture: false,
      liveMinute: liveMin,
      status: 'LIVE'
    };
  } else {
    return {
      elapsedMinutes: diffMinutes,
      isPastKickoff: true,
      isLive: false,
      isFinished: true,
      isFuture: false,
      status: 'FINISHED'
    };
  }
}

/**
 * Normalizes a match object to guarantee status (NOT_STARTED, LIVE, FINISHED), minute, and scores
 * stay strictly faithful to real-world data without fabricating fake live matches.
 */
export function normalizeMatchTiming<T extends {
  id?: string;
  date?: string;
  time?: string;
  status?: string;
  sport?: string;
  minute?: number;
  homeScore?: number;
  awayScore?: number;
  hasLiveBet?: boolean;
  hasLiveStream?: boolean;
}>(match: T): T {
  if (!match) return match;

  // Preserve postponed/cancelled states
  if (match.status === 'POSTPONED' || match.status === 'CANCELLED') {
    return match;
  }

  // If match was already marked as FINISHED, preserve final scores and status
  if (match.status === 'FINISHED') {
    return {
      ...match,
      status: 'FINISHED',
      homeScore: match.homeScore !== undefined ? Number(match.homeScore) : 0,
      awayScore: match.awayScore !== undefined ? Number(match.awayScore) : 0,
      minute: undefined
    };
  }

  // If match is genuinely LIVE (from real live score API)
  if (match.status === 'LIVE') {
    return {
      ...match,
      status: 'LIVE',
      minute: match.minute || 1,
      homeScore: match.homeScore !== undefined ? Number(match.homeScore) : 0,
      awayScore: match.awayScore !== undefined ? Number(match.awayScore) : 0,
      hasLiveBet: true,
      hasLiveStream: match.hasLiveStream ?? true
    };
  }

  // Standard upcoming / not started fixture in the bulletin
  return {
    ...match,
    status: 'NOT_STARTED',
    minute: undefined,
    homeScore: undefined,
    awayScore: undefined
  };
}

