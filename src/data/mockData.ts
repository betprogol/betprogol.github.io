import { Match, ProCoupon, AppNotification, BetSlip, TeamInfo } from '../types/betting';
import { FULL_COMPREHENSIVE_FIXTURES } from './fullFixtures';

export const TEAMS_DATABASE: TeamInfo[] = [
  // Trendyol Süper Lig
  {
    id: 'team-gs',
    name: 'Galatasaray',
    shortName: 'GS',
    logo: '🦁',
    form: ['W', 'W', 'W', 'D', 'W'],
    leagueRank: 1,
    points: 64,
    leagueId: 'tr-superlig',
    leagueName: 'Trendyol Süper Lig',
    country: 'Türkiye',
    primaryColor: '#FDB912',
    missingPlayers: [{ name: 'Mauro Icardi', reason: 'Injury', importance: 'High' }]
  },
  {
    id: 'team-fb',
    name: 'Fenerbahçe',
    shortName: 'FB',
    logo: '🟡🔵',
    form: ['W', 'W', 'D', 'W', 'W'],
    leagueRank: 2,
    points: 61,
    leagueId: 'tr-superlig',
    leagueName: 'Trendyol Süper Lig',
    country: 'Türkiye',
    primaryColor: '#002D72'
  },
  {
    id: 'team-bjk',
    name: 'Beşiktaş',
    shortName: 'BJK',
    logo: '🦅',
    form: ['W', 'D', 'W', 'L', 'W'],
    leagueRank: 3,
    points: 50,
    leagueId: 'tr-superlig',
    leagueName: 'Trendyol Süper Lig',
    country: 'Türkiye',
    primaryColor: '#000000'
  },
  {
    id: 'team-ts',
    name: 'Trabzonspor',
    shortName: 'TS',
    logo: '🔴🔵',
    form: ['D', 'W', 'L', 'W', 'D'],
    leagueRank: 4,
    points: 44,
    leagueId: 'tr-superlig',
    leagueName: 'Trendyol Süper Lig',
    country: 'Türkiye',
    primaryColor: '#800020'
  },
  {
    id: 'team-basaksehir',
    name: 'Başakşehir',
    shortName: 'İBFK',
    logo: '🟠🔵',
    form: ['W', 'L', 'D', 'W', 'L'],
    leagueRank: 5,
    points: 41,
    leagueId: 'tr-superlig',
    leagueName: 'Trendyol Süper Lig',
    country: 'Türkiye',
    primaryColor: '#F58220'
  },
  {
    id: 'team-samsun',
    name: 'Samsunspor',
    shortName: 'SAM',
    logo: '🔴⚪',
    form: ['W', 'W', 'D', 'L', 'W'],
    leagueRank: 6,
    points: 39,
    leagueId: 'tr-superlig',
    leagueName: 'Trendyol Süper Lig',
    country: 'Türkiye',
    primaryColor: '#E30613'
  },
  {
    id: 'team-eyup',
    name: 'Eyüpspor',
    shortName: 'EYP',
    logo: '🟣🟡',
    form: ['W', 'D', 'W', 'W', 'L'],
    leagueRank: 7,
    points: 36,
    leagueId: 'tr-superlig',
    leagueName: 'Trendyol Süper Lig',
    country: 'Türkiye'
  },
  // Premier League
  {
    id: 'team-mci',
    name: 'Manchester City',
    shortName: 'MCI',
    logo: '👑',
    form: ['W', 'W', 'W', 'D', 'W'],
    leagueRank: 1,
    points: 66,
    leagueId: 'eng-premier',
    leagueName: 'Premier League',
    country: 'İngiltere',
    primaryColor: '#6CABDD'
  },
  {
    id: 'team-liv',
    name: 'Liverpool',
    shortName: 'LIV',
    logo: '🔴',
    form: ['W', 'D', 'W', 'W', 'W'],
    leagueRank: 2,
    points: 65,
    leagueId: 'eng-premier',
    leagueName: 'Premier League',
    country: 'İngiltere',
    primaryColor: '#C8102E'
  },
  {
    id: 'team-ars',
    name: 'Arsenal',
    shortName: 'ARS',
    logo: '🔴⚪',
    form: ['W', 'W', 'L', 'W', 'W'],
    leagueRank: 3,
    points: 62,
    leagueId: 'eng-premier',
    leagueName: 'Premier League',
    country: 'İngiltere',
    primaryColor: '#EF0107'
  },
  {
    id: 'team-che',
    name: 'Chelsea',
    shortName: 'CHE',
    logo: '🦁',
    form: ['D', 'W', 'W', 'L', 'W'],
    leagueRank: 4,
    points: 54,
    leagueId: 'eng-premier',
    leagueName: 'Premier League',
    country: 'İngiltere',
    primaryColor: '#034694'
  },
  {
    id: 'team-mun',
    name: 'Manchester United',
    shortName: 'MUN',
    logo: '👹',
    form: ['L', 'W', 'D', 'W', 'L'],
    leagueRank: 6,
    points: 46,
    leagueId: 'eng-premier',
    leagueName: 'Premier League',
    country: 'İngiltere',
    primaryColor: '#DA291C'
  },
  {
    id: 'team-tot',
    name: 'Tottenham',
    shortName: 'TOT',
    logo: '⚪',
    form: ['W', 'L', 'W', 'D', 'W'],
    leagueRank: 5,
    points: 49,
    leagueId: 'eng-premier',
    leagueName: 'Premier League',
    country: 'İngiltere'
  },
  // La Liga
  {
    id: 'team-rma',
    name: 'Real Madrid',
    shortName: 'RMA',
    logo: '👑',
    form: ['W', 'W', 'W', 'W', 'D'],
    leagueRank: 1,
    points: 69,
    leagueId: 'esp-laliga',
    leagueName: 'La Liga',
    country: 'İspanya',
    primaryColor: '#FFFFFF'
  },
  {
    id: 'team-bar',
    name: 'Barcelona',
    shortName: 'BAR',
    logo: '🔵🔴',
    form: ['W', 'W', 'D', 'W', 'W'],
    leagueRank: 2,
    points: 66,
    leagueId: 'esp-laliga',
    leagueName: 'La Liga',
    country: 'İspanya',
    primaryColor: '#004D98'
  },
  {
    id: 'team-atm',
    name: 'Atletico Madrid',
    shortName: 'ATM',
    logo: '🔴⚪',
    form: ['W', 'L', 'W', 'W', 'D'],
    leagueRank: 3,
    points: 58,
    leagueId: 'esp-laliga',
    leagueName: 'La Liga',
    country: 'İspanya',
    primaryColor: '#CB3524'
  },
  // Serie A
  {
    id: 'team-int',
    name: 'Inter Milan',
    shortName: 'INT',
    logo: '🔵⚫',
    form: ['W', 'W', 'W', 'W', 'W'],
    leagueRank: 1,
    points: 68,
    leagueId: 'ita-seriea',
    leagueName: 'Serie A',
    country: 'İtalya',
    primaryColor: '#001489'
  },
  {
    id: 'team-juv',
    name: 'Juventus',
    shortName: 'JUV',
    logo: '⚪⚫',
    form: ['D', 'W', 'W', 'D', 'W'],
    leagueRank: 2,
    points: 60,
    leagueId: 'ita-seriea',
    leagueName: 'Serie A',
    country: 'İtalya',
    primaryColor: '#000000'
  },
  {
    id: 'team-mil',
    name: 'AC Milan',
    shortName: 'MIL',
    logo: '🔴⚫',
    form: ['W', 'D', 'L', 'W', 'W'],
    leagueRank: 3,
    points: 55,
    leagueId: 'ita-seriea',
    leagueName: 'Serie A',
    country: 'İtalya'
  },
  // Bundesliga
  {
    id: 'team-bay',
    name: 'Bayern Münih',
    shortName: 'BAY',
    logo: '🔴⚪',
    form: ['W', 'W', 'W', 'L', 'W'],
    leagueRank: 1,
    points: 62,
    leagueId: 'ger-bundesliga',
    leagueName: 'Bundesliga',
    country: 'Almanya',
    primaryColor: '#DC052D'
  },
  {
    id: 'team-lev',
    name: 'Bayer Leverkusen',
    shortName: 'B04',
    logo: '🔴⚫',
    form: ['W', 'W', 'D', 'W', 'W'],
    leagueRank: 2,
    points: 59,
    leagueId: 'ger-bundesliga',
    leagueName: 'Bundesliga',
    country: 'Almanya',
    primaryColor: '#E32221'
  },
  {
    id: 'team-bvb',
    name: 'Borussia Dortmund',
    shortName: 'BVB',
    logo: '🟡⚫',
    form: ['W', 'D', 'W', 'W', 'L'],
    leagueRank: 3,
    points: 53,
    leagueId: 'ger-bundesliga',
    leagueName: 'Bundesliga',
    country: 'Almanya',
    primaryColor: '#FDE100'
  }
];

export const SPORTS_LIST = [
  { id: 'ALL', name: 'Tüm Sporlar', icon: '🌐' },
  { id: 'FOOTBALL', name: 'Futbol', icon: '⚽' },
  { id: 'BASKETBALL', name: 'Basketbol', icon: '🏀' },
  { id: 'VOLLEYBALL', name: 'Voleybol', icon: '🏐' },
  { id: 'TENNIS', name: 'Tenis', icon: '🎾' },
  { id: 'TABLE_TENNIS', name: 'Masa Tenisi', icon: '🏓' }
];

export const LEAGUES_LIST = [
  { id: 'all', name: 'Tüm Bülten', icon: '🌍', country: 'Tümü', sport: 'ALL' },
  { id: 'live-only', name: '⚡ Canlılar', icon: '🔴', country: 'Canlı', sport: 'ALL' },
  { id: 'kral-oran', name: '👑 Kral Oran', icon: '👑', country: 'Avantajlı', sport: 'ALL' },
  // Futbol - Popüler Ligler
  { id: 'tr-superlig', name: 'Trendyol Süper Lig', icon: '🇹🇷', country: 'Türkiye', sport: 'FOOTBALL' },
  { id: 'tr-1lig', name: 'Trendyol 1. Lig', icon: '🇹🇷', country: 'Türkiye', sport: 'FOOTBALL' },
  { id: 'tr-kupa', name: 'Ziraat Türkiye Kupası', icon: '🏆', country: 'Türkiye', sport: 'FOOTBALL' },
  { id: 'eng-premier', name: 'İngiltere Premier League', icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'İngiltere', sport: 'FOOTBALL' },
  { id: 'esp-laliga', name: 'İspanya La Liga', icon: '🇪🇸', country: 'İspanya', sport: 'FOOTBALL' },
  { id: 'ita-seriea', name: 'İtalya Serie A', icon: '🇮🇹', country: 'İtalya', sport: 'FOOTBALL' },
  { id: 'ger-bundesliga', name: 'Almanya Bundesliga', icon: '🇩🇪', country: 'Almanya', sport: 'FOOTBALL' },
  { id: 'fra-ligue1', name: 'Fransa Ligue 1', icon: '🇫🇷', country: 'Fransa', sport: 'FOOTBALL' },
  { id: 'ned-eredivisie', name: 'Hollanda Eredivisie', icon: '🇳🇱', country: 'Hollanda', sport: 'FOOTBALL' },
  { id: 'eng-championship', name: 'İngiltere Championship', icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'İngiltere', sport: 'FOOTBALL' },
  { id: 'uefa-cl', name: 'UEFA Şampiyonlar Ligi', icon: '⭐', country: 'Avrupa', sport: 'FOOTBALL' },
  { id: 'uefa-el', name: 'UEFA Avrupa Ligi', icon: '🏆', country: 'Avrupa', sport: 'FOOTBALL' },
  // Basketbol
  { id: 'euroleague', name: 'EuroLeague', icon: '🏀', country: 'Avrupa', sport: 'BASKETBALL' },
  { id: 'tr-bsl', name: 'Türkiye Basketbol Süper Ligi', icon: '🇹🇷', country: 'Türkiye', sport: 'BASKETBALL' },
  { id: 'nba', name: 'NBA', icon: '🇺🇸', country: 'ABD', sport: 'BASKETBALL' },
  { id: 'eurocup', name: 'EuroCup', icon: '🏀', country: 'Avrupa', sport: 'BASKETBALL' },
  // Voleybol
  { id: 'tr-sultanlar', name: 'Vodafone Sultanlar Ligi', icon: '🏐', country: 'Türkiye', sport: 'VOLLEYBALL' },
  { id: 'tr-efeler', name: 'SMS Grup Efeler Ligi', icon: '🏐', country: 'Türkiye', sport: 'VOLLEYBALL' },
  { id: 'cev-cl', name: 'CEV Şampiyonlar Ligi', icon: '⭐', country: 'Avrupa', sport: 'VOLLEYBALL' },
  // Tenis
  { id: 'atp-tour', name: 'ATP Dünya Turu', icon: '🎾', country: 'Uluslararası', sport: 'TENNIS' },
  { id: 'wta-tour', name: 'WTA Dünya Turu', icon: '🎾', country: 'Uluslararası', sport: 'TENNIS' },
  { id: 'grand-slam', name: 'Grand Slam Turnuvaları', icon: '🏆', country: 'Uluslararası', sport: 'TENNIS' }
];

const getTeam = (id: string): TeamInfo => {
  const found = TEAMS_DATABASE.find(t => t.id === id);
  if (found) return found;
  return {
    id,
    name: id,
    shortName: id.slice(0, 3).toUpperCase(),
    logo: '⚽',
    form: ['W', 'D', 'L', 'W', 'W'],
    leagueId: 'unknown',
    leagueName: 'Lig',
    country: 'Uluslararası'
  };
};

export const TODAY_DATE_STR = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' });
const tomorrowDate = new Date();
tomorrowDate.setDate(tomorrowDate.getDate() + 1);
export const TOMORROW_DATE_STR = tomorrowDate.toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' });

// Comprehensive fixtures across all sports & leagues
export const MOCK_FIXTURES: Match[] = FULL_COMPREHENSIVE_FIXTURES;

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

const NOW_DATE = new Date();
const FORMATTED_NOW_TS = NOW_DATE.toLocaleString('tr-TR', {
  timeZone: 'Europe/Istanbul',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

export const INITIAL_USER_SLIPS: BetSlip[] = [
  {
    id: 'demo-slip-1',
    createdAt: FORMATTED_NOW_TS,
    type: 'COMBINED',
    status: 'WON',
    totalOdds: 4.23,
    stake: 500,
    potentialPayout: 2116.80,
    actualPayout: 2116.80,
    selections: [
      {
        matchId: 'ned-er-nec-exc',
        homeTeam: 'NEC Nijmegen',
        awayTeam: 'SBV Excelsior',
        matchDate: TODAY_DATE_STR,
        matchTime: '15:30',
        leagueName: 'Hollanda Eredivisie',
        leagueLogo: '🇳🇱',
        matchCode: '584110',
        mbs: 1,
        tvChannel: 'TV8.5',
        sport: 'FOOTBALL',
        market: 'OVER_25',
        marketLabel: '2.5 Gol Üstü',
        odds: 1.68,
        status: 'WON',
        finalScore: '2-1',
        matchStatus: 'FINISHED'
      },
      {
        matchId: 'arch-mil-nor',
        homeTeam: 'Millwall FC',
        awayTeam: 'Norwich City',
        matchDate: TODAY_DATE_STR,
        matchTime: '17:00',
        leagueName: 'İngiltere Championship',
        leagueLogo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
        matchCode: '584111',
        mbs: 1,
        tvChannel: 'beIN Sports 4',
        sport: 'FOOTBALL',
        market: 'MS1',
        marketLabel: 'Millwall FC Galibiyeti (MS1)',
        odds: 1.50,
        status: 'WON',
        finalScore: '3-0',
        matchStatus: 'FINISHED'
      }
    ]
  },
  {
    id: 'demo-slip-2',
    createdAt: FORMATTED_NOW_TS,
    type: 'SINGLE',
    status: 'WON',
    totalOdds: 1.95,
    stake: 500,
    potentialPayout: 975.00,
    actualPayout: 975.00,
    selections: [
      {
        matchId: 'tr-sl-basak-samsun',
        homeTeam: 'Başakşehir',
        awayTeam: 'Samsunspor',
        matchDate: TODAY_DATE_STR,
        matchTime: '17:00',
        leagueName: 'Trendyol Süper Lig',
        leagueLogo: '🇹🇷',
        matchCode: '584103',
        mbs: 1,
        tvChannel: 'beIN Sports 2',
        sport: 'FOOTBALL',
        market: 'OVER_25',
        marketLabel: '2.5 Gol Üstü',
        odds: 1.95,
        status: 'WON',
        finalScore: '2-1',
        matchStatus: 'FINISHED'
      }
    ]
  }
];

export const PRO_COUPONS: ProCoupon[] = [];

// Historical Matches Archive
export const HISTORICAL_ARCHIVE_MATCHES: Match[] = [
  {
    id: 'arch-1',
    leagueId: 'tr-superlig',
    leagueName: 'Trendyol Süper Lig',
    leagueLogo: '🇹🇷',
    country: 'Türkiye',
    homeTeam: getTeam('team-gs'),
    awayTeam: getTeam('team-bjk'),
    date: '2024-10-28',
    time: '20:00',
    status: 'FINISHED',
    homeScore: 2,
    awayScore: 1,
    halftimeScore: [1, 0],
    odds: { ms1: 1.80, msX: 3.60, ms2: 3.90, over25: 1.65, under25: 2.10, bttsYes: 1.58, bttsNo: 2.20 }
  },
  {
    id: 'arch-2',
    leagueId: 'tr-superlig',
    leagueName: 'Trendyol Süper Lig',
    leagueLogo: '🇹🇷',
    country: 'Türkiye',
    homeTeam: getTeam('team-fb'),
    awayTeam: getTeam('team-ts'),
    date: '2024-11-03',
    time: '19:00',
    status: 'FINISHED',
    homeScore: 3,
    awayScore: 2,
    halftimeScore: [1, 1],
    odds: { ms1: 1.50, msX: 4.10, ms2: 5.50, over25: 1.52, under25: 2.35, bttsYes: 1.62, bttsNo: 2.10 }
  },
  {
    id: 'arch-3',
    leagueId: 'eng-premier',
    leagueName: 'Premier League',
    leagueLogo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    country: 'İngiltere',
    homeTeam: getTeam('team-mci'),
    awayTeam: getTeam('team-che'),
    date: '2024-08-18',
    time: '18:30',
    status: 'FINISHED',
    homeScore: 2,
    awayScore: 0,
    halftimeScore: [1, 0],
    odds: { ms1: 1.45, msX: 4.40, ms2: 6.20, over25: 1.50, under25: 2.40, bttsYes: 1.68, bttsNo: 2.05 }
  },
  {
    id: 'arch-4',
    leagueId: 'esp-laliga',
    leagueName: 'La Liga',
    leagueLogo: '🇪🇸',
    country: 'İspanya',
    homeTeam: getTeam('team-rma'),
    awayTeam: getTeam('team-bar'),
    date: '2024-10-26',
    time: '22:00',
    status: 'FINISHED',
    homeScore: 0,
    awayScore: 4,
    halftimeScore: [0, 0],
    odds: { ms1: 2.00, msX: 3.75, ms2: 3.20, over25: 1.45, under25: 2.50, bttsYes: 1.40, bttsNo: 2.70 }
  }
];

export const MOCK_ARCHIVE_MATCHES: Match[] = HISTORICAL_ARCHIVE_MATCHES;
