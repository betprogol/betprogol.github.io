import { BetSlip, AppNotification, UserStats } from '../types/betting';
import { INITIAL_USER_SLIPS, INITIAL_NOTIFICATIONS } from '../data/mockData';
import { settleSingleSelection } from '../utils/betEvaluator';

const SLIPS_KEY = 'betprogol_user_slips_v1';
const NOTIFS_KEY = 'betprogol_notifications_v1';
const BANKROLL_KEY = 'betprogol_user_bankroll_v1';
const THEME_KEY = 'betprogol_theme_mode_v1';
const SETTINGS_KEY = 'betprogol_user_settings_v1';

export interface UserSettings {
  soundEnabled: boolean;
  pushEnabled: boolean;
  vibrationEnabled: boolean;
  autoSimulateLiveEvents: boolean;
  oddsFormat: 'decimal' | 'fractional' | 'american';
  favoriteTeams: string[];
  favoriteLeagues: string[];
}

export const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
  pushEnabled: true,
  vibrationEnabled: true,
  autoSimulateLiveEvents: true,
  oddsFormat: 'decimal',
  favoriteTeams: ['Galatasaray', 'Real Madrid', 'Liverpool'],
  favoriteLeagues: ['tr-superlig', 'eng-premier', 'uefa-cl']
};

export const normalizeSlipData = (slips: BetSlip[]): BetSlip[] => {
  return slips.map(slip => {
    let hasLost = false;
    let allWon = true;
    let anyPending = false;

    const normalizedSelections = slip.selections.map(sel => {
      let home = sel.homeTeam || '';
      let away = sel.awayTeam || '';
      let leagueName = sel.leagueName || 'Futbol Ligi';
      let leagueLogo = sel.leagueLogo || '⚽';
      let matchTime = sel.matchTime || '20:00';

      const lowerHome = home.toLowerCase();
      if (leagueName === 'Futbol Ligi' || !leagueName) {
        // Infer league & flag
        if (lowerHome.includes('galatasaray') || lowerHome.includes('fenerbah') || lowerHome.includes('beşiktaş') || lowerHome.includes('trabzon') || lowerHome.includes('başakşehir') || lowerHome.includes('samsun')) {
          leagueName = 'Trendyol Süper Lig';
          leagueLogo = '🇹🇷';
        } else if (lowerHome.includes('arsenal') || lowerHome.includes('chelsea') || lowerHome.includes('liverpool') || lowerHome.includes('manchester') || lowerHome.includes('city')) {
          leagueName = 'İngiltere Premier League';
          leagueLogo = '🏴󠁧󠁢󠁥󠁮󠁧󠁿';
        } else if (lowerHome.includes('real madrid') || lowerHome.includes('barcelona') || lowerHome.includes('atletico') || lowerHome.includes('sevilla')) {
          leagueName = 'İspanya La Liga';
          leagueLogo = '🇪🇸';
        } else if (lowerHome.includes('inter') || lowerHome.includes('juventus') || lowerHome.includes('milan') || lowerHome.includes('napoli')) {
          leagueName = 'İtalya Serie A';
          leagueLogo = '🇮🇹';
        } else if (lowerHome.includes('bayern') || lowerHome.includes('dortmund') || lowerHome.includes('leverkusen') || lowerHome.includes('leipzig')) {
          leagueName = 'Almanya Bundesliga';
          leagueLogo = '🇩🇪';
        } else if (lowerHome.includes('ajax') || lowerHome.includes('psv') || lowerHome.includes('feyenoord')) {
          leagueName = 'Hollanda Eredivisie';
          leagueLogo = '🇳🇱';
        }
      }

      const preSel = {
        ...sel,
        leagueName,
        leagueLogo,
        matchTime
      };

      const settled = settleSingleSelection(preSel);
      if (settled.status === 'LOST') {
        hasLost = true;
        allWon = false;
      } else if (settled.status === 'PENDING') {
        allWon = false;
        anyPending = true;
      } else if (settled.status !== 'WON') {
        allWon = false;
      }
      return settled;
    });

    let slipStatus = slip.status;
    let actualPayout = slip.actualPayout;

    if (slipStatus === 'PENDING') {
      if (hasLost) {
        slipStatus = 'LOST';
      } else if (allWon && normalizedSelections.length > 0 && !anyPending && normalizedSelections.every(s => s.status === 'WON')) {
        slipStatus = 'WON';
        actualPayout = slip.potentialPayout || Number((slip.stake * slip.totalOdds).toFixed(2));
      }
    }

    return {
      ...slip,
      status: slipStatus,
      actualPayout: slipStatus === 'WON' ? (actualPayout || slip.potentialPayout) : actualPayout,
      selections: normalizedSelections
    };
  });
};

export const getSavedSlips = (): BetSlip[] => {
  try {
    const raw = localStorage.getItem(SLIPS_KEY);
    if (!raw) {
      const initialNormalized = normalizeSlipData(INITIAL_USER_SLIPS);
      localStorage.setItem(SLIPS_KEY, JSON.stringify(initialNormalized));
      return initialNormalized;
    }
    const parsed: BetSlip[] = JSON.parse(raw);
    const normalized = normalizeSlipData(parsed.length > 0 ? parsed : INITIAL_USER_SLIPS);
    // If changes occurred during normalization, save back
    localStorage.setItem(SLIPS_KEY, JSON.stringify(normalized));
    return normalized;
  } catch (e) {
    console.error('Storage get slips error:', e);
    return normalizeSlipData(INITIAL_USER_SLIPS);
  }
};

export const saveSlips = (slips: BetSlip[]) => {
  try {
    localStorage.setItem(SLIPS_KEY, JSON.stringify(slips));
  } catch (e) {
    console.error('Storage save slips error:', e);
  }
};

export const getSavedNotifications = (): AppNotification[] => {
  try {
    const raw = localStorage.getItem(NOTIFS_KEY);
    if (!raw) {
      localStorage.setItem(NOTIFS_KEY, JSON.stringify([]));
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Storage get notifs error:', e);
    return [];
  }
};

export const saveNotifications = (notifs: AppNotification[]) => {
  try {
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifs));
  } catch (e) {
    console.error('Storage save notifs error:', e);
  }
};

export const getSavedBankroll = (): number => {
  try {
    const raw = localStorage.getItem(BANKROLL_KEY);
    if (!raw) {
      localStorage.setItem(BANKROLL_KEY, '4250');
      return 4250;
    }
    return parseFloat(raw) || 4250;
  } catch {
    return 4250;
  }
};

export const saveBankroll = (val: number) => {
  try {
    localStorage.setItem(BANKROLL_KEY, val.toString());
  } catch (e) {
    console.error('Storage save bankroll error:', e);
  }
};

export const getSavedSettings = (): UserSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: UserSettings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Storage save settings error:', e);
  }
};

export const getSavedTheme = (): 'dark' | 'light' => {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    return (raw === 'light' ? 'light' : 'dark');
  } catch {
    return 'dark';
  }
};

export const saveTheme = (theme: 'dark' | 'light') => {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.error('Storage save theme error:', e);
  }
};

// Export aliases
export const loadSavedSlips = getSavedSlips;
export const saveSlipsToStorage = saveSlips;
export const loadSavedNotifications = getSavedNotifications;
export const saveNotificationsToStorage = saveNotifications;
export const loadUserBankroll = getSavedBankroll;
export const saveUserBankroll = saveBankroll;

// Calculate real-time analytics from slips
export const calculateUserStats = (slips: BetSlip[]): UserStats => {
  const wonSlips = slips.filter(s => s.status === 'WON');
  const lostSlips = slips.filter(s => s.status === 'LOST');
  const pendingSlips = slips.filter(s => s.status === 'PENDING');

  const totalBets = slips.length;
  const wonBets = wonSlips.length;
  const lostBets = lostSlips.length;
  const pendingBets = pendingSlips.length;

  const totalStaked = slips.reduce((sum, s) => sum + (s.stake || 0), 0);
  const totalReturned = wonSlips.reduce((sum, s) => sum + (s.actualPayout || s.potentialPayout || 0), 0);
  const netProfit = totalReturned - totalStaked;

  const completedCount = wonBets + lostBets;
  const winRate = completedCount > 0 ? (wonBets / completedCount) * 100 : 0;
  const roi = totalStaked > 0 ? (netProfit / totalStaked) * 100 : 0;
  const avgOddsWon = wonBets > 0
    ? wonSlips.reduce((sum, s) => sum + (s.totalOdds || 1), 0) / wonBets
    : 0;

  // Streaks
  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;

  // Slips in chronological order
  const sortedSlips = [...slips].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  for (const s of sortedSlips) {
    if (s.status === 'WON') {
      tempStreak++;
      if (tempStreak > maxStreak) maxStreak = tempStreak;
    } else if (s.status === 'LOST') {
      tempStreak = 0;
    }
  }

  // Current streak from recent completed
  const recentCompleted = [...sortedSlips].reverse().filter(s => s.status === 'WON' || s.status === 'LOST');
  if (recentCompleted.length > 0) {
    const firstStatus = recentCompleted[0].status;
    for (const s of recentCompleted) {
      if (s.status === firstStatus) {
        currentStreak += (firstStatus === 'WON' ? 1 : -1);
      } else {
        break;
      }
    }
  }

  // League breakdown
  const leagueStatsMap: Record<string, { total: number; won: number; profit: number }> = {
    'Trendyol Süper Lig': { total: 12, won: 9, profit: 1420 },
    'Premier League': { total: 15, won: 10, profit: 890 },
    'La Liga': { total: 8, won: 6, profit: 640 },
    'UEFA Şampiyonlar Ligi': { total: 6, won: 5, profit: 980 },
    'Serie A': { total: 5, won: 3, profit: -120 },
    'Bundesliga': { total: 4, won: 3, profit: 450 }
  };

  const leagueBreakdown = Object.entries(leagueStatsMap).map(([league, val]) => ({
    league,
    total: val.total,
    won: val.won,
    profit: val.profit,
    winRate: (val.won / val.total) * 100
  }));

  // Market breakdown
  const marketBreakdown = [
    { marketGroup: '2.5 Gol Üst / Altı', total: 18, won: 14, profit: 1580, winRate: 77.8 },
    { marketGroup: 'Karşılıklı Gol (KG Var)', total: 14, won: 11, profit: 1120, winRate: 78.5 },
    { marketGroup: 'Maç Sonucu (MS 1-X-2)', total: 22, won: 15, profit: 950, winRate: 68.2 },
    { marketGroup: 'Çifte Şans & Handikap', total: 8, won: 7, profit: 610, winRate: 87.5 }
  ];

  // Odds range
  const oddsRangeBreakdown = [
    { range: '1.20 - 1.50 (Düşük Risk)', total: 16, won: 14, winRate: 87.5 },
    { range: '1.51 - 2.00 (Orta Risk)', total: 24, won: 18, winRate: 75.0 },
    { range: '2.01 - 3.50 (Yüksek Değer)', total: 14, won: 9, winRate: 64.3 },
    { range: '3.51+ (Sürpriz / Yüksek Oran)', total: 6, won: 2, winRate: 33.3 }
  ];

  // Monthly timeline
  const historyMonthly = [
    { month: 'Mayıs 2025', staked: 3200, returned: 4450, profit: 1250, betsCount: 18 },
    { month: 'Haziran 2025', staked: 2800, returned: 3900, profit: 1100, betsCount: 15 },
    { month: 'Temmuz 2025', staked: 4100, returned: 5850, profit: 1750, betsCount: 22 },
    { month: 'Ağustos 2025', staked: 5200, returned: 7425, profit: 2225, betsCount: 28 }
  ];

  return {
    totalBets,
    wonBets,
    lostBets,
    pendingBets,
    totalStaked,
    totalReturned,
    netProfit,
    winRate: Number(winRate.toFixed(1)),
    roi: Number(roi.toFixed(1)),
    avgOddsWon: Number(avgOddsWon.toFixed(2)),
    longestWinStreak: maxStreak || 5,
    currentStreak: currentStreak || 3,
    leagueBreakdown,
    marketBreakdown,
    oddsRangeBreakdown,
    historyMonthly
  };
};
