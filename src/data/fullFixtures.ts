import { Match, SportType } from '../types/betting';

export const TODAY_DATE_STR = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' });
const tomorrowDate = new Date();
tomorrowDate.setDate(tomorrowDate.getDate() + 1);
export const TOMORROW_DATE_STR = tomorrowDate.toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' });

// Helper to generate consistent, realistic full bülten fixtures
function buildComprehensiveBulten(): Match[] {
  const list: Match[] = [];
  let codeCounter = 100100;

  const createMatch = (data: {
    id: string;
    sport: SportType;
    leagueId: string;
    leagueName: string;
    leagueLogo: string;
    country: string;
    tvChannel?: string;
    hName: string;
    hShort: string;
    hLogo: string;
    aName: string;
    aShort: string;
    aLogo: string;
    date?: string;
    time: string;
    status?: 'NOT_STARTED' | 'LIVE' | 'FINISHED';
    minute?: number;
    homeScore?: number;
    awayScore?: number;
    halftimeScore?: [number, number];
    quarterScores?: string[];
    setScores?: string[];
    ms1: number;
    msX?: number;
    ms2: number;
    over25?: number;
    under25?: number;
    bttsYes?: number;
    bttsNo?: number;
    totalPointsLine?: number;
    overTotalPoints?: number;
    underTotalPoints?: number;
    handicapHome?: number;
    handicapHomeOdds?: number;
    handicapAwayOdds?: number;
    stadium?: string;
    referee?: string;
    hot?: boolean;
    ai?: boolean;
  }): Match => {
    codeCounter += 3;
    const isLive = data.status === 'LIVE';
    const isFinished = data.status === 'FINISHED';

    return {
      id: data.id,
      sport: data.sport,
      matchCode: String(codeCounter),
      mbs: 1,
      hasLiveBet: true,
      hasKralOran: true,
      hasLiveStream: isLive || data.hot || false,
      tvChannel: data.tvChannel || 'beIN Sports / S Sport',
      marketsCount: isFinished ? 0 : (data.sport === 'FOOTBALL' ? 165 : 60),
      leagueId: data.leagueId,
      leagueName: data.leagueName,
      leagueLogo: data.leagueLogo,
      country: data.country,
      homeTeam: {
        id: `team-h-${data.id}`,
        name: data.hName,
        shortName: data.hShort,
        logo: data.hLogo,
        form: ['W', 'W', 'D', 'L', 'W'],
        leagueId: data.leagueId,
        leagueName: data.leagueName,
        country: data.country
      },
      awayTeam: {
        id: `team-a-${data.id}`,
        name: data.aName,
        shortName: data.aShort,
        logo: data.aLogo,
        form: ['D', 'W', 'W', 'L', 'W'],
        leagueId: data.leagueId,
        leagueName: data.leagueName,
        country: data.country
      },
      date: data.date || TODAY_DATE_STR,
      time: data.time,
      status: data.status || 'NOT_STARTED',
      minute: data.minute,
      homeScore: data.homeScore,
      awayScore: data.awayScore,
      halftimeScore: data.halftimeScore,
      quarterScores: data.quarterScores,
      setScores: data.setScores,
      hotMatch: data.hot ?? true,
      aiSuggested: data.ai ?? true,
      stadium: data.stadium || 'Şehir Stadyumu',
      referee: data.referee || 'Resmi Hakem',
      odds: {
        ms1: data.ms1,
        msX: data.msX,
        ms2: data.ms2,
        over25: data.over25 || 1.75,
        under25: data.under25 || 1.95,
        bttsYes: data.bttsYes || 1.65,
        bttsNo: data.bttsNo || 2.10,
        over15: 1.25,
        under15: 3.40,
        over35: 2.80,
        under35: 1.40,
        iy1: Number((data.ms1 * 1.55).toFixed(2)),
        iyX: 2.15,
        iy2: Number((data.ms2 * 1.55).toFixed(2)),
        tg01: 3.40,
        tg23: 1.88,
        tg45: 3.10,
        tg6plus: 9.50,
        totalPointsLine: data.totalPointsLine,
        overTotalPoints: data.overTotalPoints,
        underTotalPoints: data.underTotalPoints,
        handicapHome: data.handicapHome,
        handicapHomeOdds: data.handicapHomeOdds,
        handicapAwayOdds: data.handicapAwayOdds,
        doubleChance1X: data.msX ? Number((1 / (1 / data.ms1 + 1 / data.msX)).toFixed(2)) : undefined,
        doubleChance12: 1.25,
        doubleChanceX2: data.msX ? Number((1 / (1 / data.ms2 + 1 / data.msX)).toFixed(2)) : undefined
      },
      stats: {
        possession: [52, 48],
        shotsTotal: [12, 10],
        shotsOnTarget: [5, 4],
        xg: [1.45, 1.15],
        corners: [6, 4],
        fouls: [11, 13],
        yellowCards: [2, 2],
        redCards: [0, 0],
        dangerousAttacks: [48, 39]
      }
    };
  };

  // 1. TRENDYOL SÜPER LİG (10 Maç)
  list.push(
    createMatch({ id: 'tr-sl-1', sport: 'FOOTBALL', leagueId: 'tr-superlig', leagueName: 'Trendyol Süper Lig', leagueLogo: '🇹🇷', country: 'Türkiye', tvChannel: 'beIN Sports 1 HD', hName: 'Galatasaray', hShort: 'GS', hLogo: '🦁', aName: 'Fenerbahçe', aShort: 'FB', aLogo: '🟡🔵', time: '20:00', status: 'LIVE', minute: 72, homeScore: 2, awayScore: 1, halftimeScore: [1, 1], ms1: 2.15, msX: 3.40, ms2: 3.10, stadium: 'RAMS Park', referee: 'Halil Umut Meler', hot: true, ai: true }),
    createMatch({ id: 'tr-sl-2', sport: 'FOOTBALL', leagueId: 'tr-superlig', leagueName: 'Trendyol Süper Lig', leagueLogo: '🇹🇷', country: 'Türkiye', tvChannel: 'beIN Sports 1 HD', hName: 'Beşiktaş', hShort: 'BJK', hLogo: '🦅', aName: 'Trabzonspor', aShort: 'TS', aLogo: '🔴🔵', time: '20:30', status: 'NOT_STARTED', ms1: 1.95, msX: 3.45, ms2: 3.60, stadium: 'Tüpraş Stadyumu', referee: 'Ali Şansalan', hot: true, ai: true }),
    createMatch({ id: 'tr-sl-3', sport: 'FOOTBALL', leagueId: 'tr-superlig', leagueName: 'Trendyol Süper Lig', leagueLogo: '🇹🇷', country: 'Türkiye', tvChannel: 'beIN Sports 2 HD', hName: 'Başakşehir', hShort: 'İBFK', hLogo: '🟠🔵', aName: 'Samsunspor', aShort: 'SAM', aLogo: '🔴⚪', time: '19:00', status: 'NOT_STARTED', ms1: 2.10, msX: 3.30, ms2: 3.25, stadium: 'Fatih Terim Stadı' }),
    createMatch({ id: 'tr-sl-4', sport: 'FOOTBALL', leagueId: 'tr-superlig', leagueName: 'Trendyol Süper Lig', leagueLogo: '🇹🇷', country: 'Türkiye', tvChannel: 'beIN Sports 2 HD', hName: 'Eyüpspor', hShort: 'EYP', hLogo: '🟣🟡', aName: 'Göztepe', aShort: 'GÖZ', aLogo: '🟡🔴', time: '16:00', status: 'FINISHED', homeScore: 2, awayScore: 2, halftimeScore: [1, 0], ms1: 2.25, msX: 3.20, ms2: 3.00 }),
    createMatch({ id: 'tr-sl-5', sport: 'FOOTBALL', leagueId: 'tr-superlig', leagueName: 'Trendyol Süper Lig', leagueLogo: '🇹🇷', country: 'Türkiye', tvChannel: 'beIN Sports MAX 1', hName: 'Konyaspor', hShort: 'KON', hLogo: '🟢⚪', aName: 'Sivasspor', aShort: 'SİV', aLogo: '🔴⚪', time: '17:00', ms1: 2.05, msX: 3.25, ms2: 3.40 }),
    createMatch({ id: 'tr-sl-6', sport: 'FOOTBALL', leagueId: 'tr-superlig', leagueName: 'Trendyol Süper Lig', leagueLogo: '🇹🇷', country: 'Türkiye', tvChannel: 'beIN Sports MAX 2', hName: 'Antalyaspor', hShort: 'ANT', hLogo: '🔴⚪', aName: 'Alanyaspor', aShort: 'ALA', aLogo: '🟠🟢', time: '20:00', ms1: 2.30, msX: 3.35, ms2: 2.90 }),
    createMatch({ id: 'tr-sl-7', sport: 'FOOTBALL', leagueId: 'tr-superlig', leagueName: 'Trendyol Süper Lig', leagueLogo: '🇹🇷', country: 'Türkiye', tvChannel: 'beIN Sports MAX 1', hName: 'Çaykur Rizespor', hShort: 'RİZ', hLogo: '🟢🔵', aName: 'Kayserispor', aShort: 'KAY', aLogo: '🟡🔴', date: TOMORROW_DATE_STR, time: '16:00', ms1: 2.15, msX: 3.30, ms2: 3.15 }),
    createMatch({ id: 'tr-sl-8', sport: 'FOOTBALL', leagueId: 'tr-superlig', leagueName: 'Trendyol Süper Lig', leagueLogo: '🇹🇷', country: 'Türkiye', tvChannel: 'beIN Sports 2 HD', hName: 'Kasımpaşa', hShort: 'KAS', hLogo: '🔵⚪', aName: 'Hatayspor', aShort: 'HAT', aLogo: '🔴⚪', date: TOMORROW_DATE_STR, time: '19:00', ms1: 1.85, msX: 3.65, ms2: 3.75 }),
    createMatch({ id: 'tr-sl-9', sport: 'FOOTBALL', leagueId: 'tr-superlig', leagueName: 'Trendyol Süper Lig', leagueLogo: '🇹🇷', country: 'Türkiye', tvChannel: 'beIN Sports MAX 2', hName: 'Adana Demirspor', hShort: 'ADS', hLogo: '🔵⚪', aName: 'Bodrum FK', aShort: 'BOD', aLogo: '🟢⚪', date: TOMORROW_DATE_STR, time: '20:00', ms1: 2.75, msX: 3.30, ms2: 2.40 }),
    createMatch({ id: 'tr-sl-10', sport: 'FOOTBALL', leagueId: 'tr-superlig', leagueName: 'Trendyol Süper Lig', leagueLogo: '🇹🇷', country: 'Türkiye', tvChannel: 'beIN Sports MAX 1', hName: 'Gaziantep FK', hShort: 'GFK', hLogo: '🔴⚫', aName: 'Sakaryaspor', aShort: 'SAK', aLogo: '🟢⚫', date: TOMORROW_DATE_STR, time: '17:00', ms1: 1.95, msX: 3.40, ms2: 3.65 })
  );

  // 2. TRENDYOL 1. LİG & ZİRAAT TÜRKİYE KUPASI (10 Maç)
  list.push(
    createMatch({ id: 'tr-1l-1', sport: 'FOOTBALL', leagueId: 'tr-1lig', leagueName: 'Trendyol 1. Lig', leagueLogo: '🇹🇷', country: 'Türkiye', tvChannel: 'TRT Spor', hName: 'Kocaelispor', hShort: 'KOC', hLogo: '🟢⚫', aName: 'Gençlerbirliği', aShort: 'GNB', aLogo: '🔴⚫', time: '19:00', ms1: 2.00, msX: 3.25, ms2: 3.45 }),
    createMatch({ id: 'tr-1l-2', sport: 'FOOTBALL', leagueId: 'tr-1lig', leagueName: 'Trendyol 1. Lig', leagueLogo: '🇹🇷', country: 'Türkiye', tvChannel: 'TRT Spor', hName: 'Erzurumspor FK', hShort: 'ERZ', hLogo: '🔵⚪', aName: 'Amed SFK', aShort: 'AMD', aLogo: '🟢🔴', time: '16:00', ms1: 2.20, msX: 3.15, ms2: 3.10 }),
    createMatch({ id: 'tr-1l-3', sport: 'FOOTBALL', leagueId: 'tr-1lig', leagueName: 'Trendyol 1. Lig', leagueLogo: '🇹🇷', country: 'Türkiye', tvChannel: 'beIN Sports MAX 1', hName: 'Iğdır FK', hShort: 'IĞD', hLogo: '🟢⚪', aName: 'MKE Ankaragücü', aShort: 'ANK', aLogo: '🟡🔵', time: '19:00', ms1: 2.35, msX: 3.20, ms2: 2.85 }),
    createMatch({ id: 'tr-1l-4', sport: 'FOOTBALL', leagueId: 'tr-1lig', leagueName: 'Trendyol 1. Lig', leagueLogo: '🇹🇷', country: 'Türkiye', tvChannel: 'TRT Spor', hName: 'Çorum FK', hShort: 'ÇOR', hLogo: '🔴⚫', aName: 'Bandırmaspor', aShort: 'BAN', aLogo: '🔴⚪', date: TOMORROW_DATE_STR, time: '13:30', ms1: 2.25, msX: 3.10, ms2: 3.05 }),
    createMatch({ id: 'tr-1l-5', sport: 'FOOTBALL', leagueId: 'tr-1lig', leagueName: 'Trendyol 1. Lig', leagueLogo: '🇹🇷', country: 'Türkiye', tvChannel: 'TRT Spor', hName: 'Ümraniyespor', hShort: 'ÜMR', hLogo: '🔴⚪', aName: 'Boluspor', aShort: 'BOL', aLogo: '🔴⚪', date: TOMORROW_DATE_STR, time: '16:00', ms1: 2.10, msX: 3.20, ms2: 3.30 }),
    createMatch({ id: 'tr-1l-6', sport: 'FOOTBALL', leagueId: 'tr-1lig', leagueName: 'Trendyol 1. Lig', leagueLogo: '🇹🇷', country: 'Türkiye', tvChannel: 'beIN Sports MAX 2', hName: 'Fatih Karagümrük', hShort: 'FKG', hLogo: '🔴⚫', aName: 'Pendikspor', aShort: 'PEN', aLogo: '🔴⚪', date: TOMORROW_DATE_STR, time: '19:00', ms1: 2.05, msX: 3.30, ms2: 3.35 }),
    createMatch({ id: 'tr-1l-7', sport: 'FOOTBALL', leagueId: 'tr-1lig', leagueName: 'Trendyol 1. Lig', leagueLogo: '🇹🇷', country: 'Türkiye', tvChannel: 'TRT Spor', hName: 'İstanbulspor', hShort: 'İST', hLogo: '🟡⚫', aName: 'Manisa FK', aShort: 'MAN', aLogo: '⚪⚫', date: TOMORROW_DATE_STR, time: '20:00', ms1: 2.15, msX: 3.25, ms2: 3.10 }),
    createMatch({ id: 'tr-1l-8', sport: 'FOOTBALL', leagueId: 'tr-1lig', leagueName: 'Trendyol 1. Lig', leagueLogo: '🇹🇷', country: 'Türkiye', tvChannel: 'TRT Spor', hName: 'Şanlıurfaspor', hShort: 'URF', hLogo: '🟡🟢', aName: 'Keçiörengücü', aShort: 'KEÇ', aLogo: '🟣⚪', date: TOMORROW_DATE_STR, time: '16:00', ms1: 2.40, msX: 3.15, ms2: 2.80 }),
    createMatch({ id: 'tr-cup-1', sport: 'FOOTBALL', leagueId: 'tr-kupa', leagueName: 'Ziraat Türkiye Kupası', leagueLogo: '🏆', country: 'Türkiye', tvChannel: 'A Spor HD', hName: 'Galatasaray', hShort: 'GS', hLogo: '🦁', aName: 'Beşiktaş', aShort: 'BJK', aLogo: '🦅', date: TOMORROW_DATE_STR, time: '20:45', ms1: 1.90, msX: 3.50, ms2: 3.75, hot: true, ai: true }),
    createMatch({ id: 'tr-cup-2', sport: 'FOOTBALL', leagueId: 'tr-kupa', leagueName: 'Ziraat Türkiye Kupası', leagueLogo: '🏆', country: 'Türkiye', tvChannel: 'A Spor HD', hName: 'Fenerbahçe', hShort: 'FB', hLogo: '🟡🔵', aName: 'Trabzonspor', aShort: 'TS', aLogo: '🔴🔵', date: TOMORROW_DATE_STR, time: '20:30', ms1: 1.75, msX: 3.60, ms2: 4.20, hot: true, ai: true })
  );

  // 3. İNGİLTERE PREMIER LEAGUE & CHAMPIONSHIP (14 Maç)
  list.push(
    createMatch({ id: 'eng-pl-1', sport: 'FOOTBALL', leagueId: 'eng-premier', leagueName: 'Premier League', leagueLogo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'İngiltere', tvChannel: 'beIN Sports 3', hName: 'Manchester City', hShort: 'MCI', hLogo: '🩵', aName: 'Liverpool', aShort: 'LIV', aLogo: '🔴', time: '18:30', status: 'LIVE', minute: 48, homeScore: 1, awayScore: 1, halftimeScore: [1, 1], ms1: 2.05, msX: 3.65, ms2: 3.35, hot: true, ai: true }),
    createMatch({ id: 'eng-pl-2', sport: 'FOOTBALL', leagueId: 'eng-premier', leagueName: 'Premier League', leagueLogo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'İngiltere', tvChannel: 'beIN Sports 3', hName: 'Arsenal', hShort: 'ARS', hLogo: '🔴⚪', aName: 'Chelsea', aShort: 'CHE', aLogo: '🦁', time: '21:00', ms1: 1.92, msX: 3.60, ms2: 3.80, hot: true, ai: true }),
    createMatch({ id: 'eng-pl-3', sport: 'FOOTBALL', leagueId: 'eng-premier', leagueName: 'Premier League', leagueLogo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'İngiltere', tvChannel: 'beIN Sports 4', hName: 'Manchester United', hShort: 'MUN', hLogo: '👹', aName: 'Tottenham', aShort: 'TOT', aLogo: '⚪', time: '19:30', ms1: 2.20, msX: 3.70, ms2: 2.95 }),
    createMatch({ id: 'eng-pl-4', sport: 'FOOTBALL', leagueId: 'eng-premier', leagueName: 'Premier League', leagueLogo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'İngiltere', tvChannel: 'beIN Sports MAX 1', hName: 'Aston Villa', hShort: 'AVL', hLogo: '🦁', aName: 'Newcastle United', aShort: 'NEW', aLogo: '⚪⚫', date: TOMORROW_DATE_STR, time: '17:00', ms1: 2.35, msX: 3.50, ms2: 2.80 }),
    createMatch({ id: 'eng-pl-5', sport: 'FOOTBALL', leagueId: 'eng-premier', leagueName: 'Premier League', leagueLogo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'İngiltere', tvChannel: 'beIN Sports 3', hName: 'Brighton', hShort: 'BHA', hLogo: '🔵⚪', aName: 'West Ham', aShort: 'WHU', aLogo: '⚒️', date: TOMORROW_DATE_STR, time: '16:00', ms1: 1.85, msX: 3.70, ms2: 3.90 }),
    createMatch({ id: 'eng-pl-6', sport: 'FOOTBALL', leagueId: 'eng-premier', leagueName: 'Premier League', leagueLogo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'İngiltere', tvChannel: 'beIN Sports 4', hName: 'Fulham', hShort: 'FUL', hLogo: '⚪⚫', aName: 'Brentford', aShort: 'BRE', aLogo: '🐝', date: TOMORROW_DATE_STR, time: '18:30', ms1: 2.30, msX: 3.40, ms2: 2.95 }),
    createMatch({ id: 'eng-pl-7', sport: 'FOOTBALL', leagueId: 'eng-premier', leagueName: 'Premier League', leagueLogo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'İngiltere', tvChannel: 'beIN Sports MAX 2', hName: 'Crystal Palace', hShort: 'CRY', hLogo: '🔵🔴', aName: 'Everton', aShort: 'EVE', aLogo: '🔵', time: '17:00', ms1: 2.25, msX: 3.30, ms2: 3.10 }),
    createMatch({ id: 'eng-pl-8', sport: 'FOOTBALL', leagueId: 'eng-premier', leagueName: 'Premier League', leagueLogo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'İngiltere', tvChannel: 'beIN Sports MAX 1', hName: 'Wolverhampton', hShort: 'WOL', hLogo: '🐺', aName: 'Leicester City', aShort: 'LEI', aLogo: '🦊', date: TOMORROW_DATE_STR, time: '17:00', ms1: 2.05, msX: 3.45, ms2: 3.40 }),
    createMatch({ id: 'eng-ch-1', sport: 'FOOTBALL', leagueId: 'eng-championship', leagueName: 'İngiltere Championship', leagueLogo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'İngiltere', tvChannel: 'beIN Sports 4', hName: 'Leeds United', hShort: 'LEE', hLogo: '⚪', aName: 'Sheffield United', aShort: 'SHU', aLogo: '🔴⚪', time: '22:00', ms1: 1.85, msX: 3.50, ms2: 4.10 }),
    createMatch({ id: 'eng-ch-2', sport: 'FOOTBALL', leagueId: 'eng-championship', leagueName: 'İngiltere Championship', leagueLogo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'İngiltere', tvChannel: 'beIN Sports MAX 2', hName: 'Sunderland', hShort: 'SUN', hLogo: '🔴⚪', aName: 'Middlesbrough', aShort: 'MID', aLogo: '🔴', time: '14:30', status: 'FINISHED', homeScore: 1, awayScore: 0, ms1: 2.10, msX: 3.30, ms2: 3.30 }),
    createMatch({ id: 'eng-ch-3', sport: 'FOOTBALL', leagueId: 'eng-championship', leagueName: 'İngiltere Championship', leagueLogo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'İngiltere', tvChannel: 'beIN Sports 4', hName: 'Norwich City', hShort: 'NOR', hLogo: '🟡🟢', aName: 'Watford', aShort: 'WAT', aLogo: '🟡⚫', date: TOMORROW_DATE_STR, time: '17:00', ms1: 2.20, msX: 3.35, ms2: 3.10 }),
    createMatch({ id: 'eng-ch-4', sport: 'FOOTBALL', leagueId: 'eng-championship', leagueName: 'İngiltere Championship', leagueLogo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'İngiltere', tvChannel: 'beIN Sports MAX 1', hName: 'West Bromwich', hShort: 'WBA', hLogo: '🔵⚪', aName: 'Burnley', aShort: 'BUR', aLogo: '🟣🔵', date: TOMORROW_DATE_STR, time: '19:30', ms1: 2.45, msX: 3.20, ms2: 2.85 }),
    createMatch({ id: 'eng-ch-5', sport: 'FOOTBALL', leagueId: 'eng-championship', leagueName: 'İngiltere Championship', leagueLogo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'İngiltere', tvChannel: 'beIN Sports MAX 2', hName: 'Blackburn Rovers', hShort: 'BLA', hLogo: '🔵⚪', aName: 'Coventry City', aShort: 'COV', aLogo: '🩵', date: TOMORROW_DATE_STR, time: '17:00', ms1: 2.30, msX: 3.30, ms2: 2.95 }),
    createMatch({ id: 'eng-ch-6', sport: 'FOOTBALL', leagueId: 'eng-championship', leagueName: 'İngiltere Championship', leagueLogo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'İngiltere', tvChannel: 'beIN Sports 4', hName: 'Millwall FC', hShort: 'MIL', hLogo: '🦁', aName: 'Derby County', aShort: 'DER', aLogo: '🐏', date: TOMORROW_DATE_STR, time: '17:00', ms1: 2.10, msX: 3.25, ms2: 3.40 })
  );

  // 4. İSPANYA LA LIGA (12 Maç)
  list.push(
    createMatch({ id: 'esp-ll-1', sport: 'FOOTBALL', leagueId: 'esp-laliga', leagueName: 'La Liga', leagueLogo: '🇪🇸', country: 'İspanya', tvChannel: 'S Sport Plus', hName: 'Real Madrid', hShort: 'RMA', hLogo: '👑', aName: 'Barcelona', aShort: 'BAR', aLogo: '🔵🔴', time: '22:00', ms1: 2.15, msX: 3.65, ms2: 3.10, hot: true, ai: true }),
    createMatch({ id: 'esp-ll-2', sport: 'FOOTBALL', leagueId: 'esp-laliga', leagueName: 'La Liga', leagueLogo: '🇪🇸', country: 'İspanya', tvChannel: 'S Sport 2', hName: 'Atletico Madrid', hShort: 'ATM', hLogo: '🔴⚪', aName: 'Athletic Bilbao', aShort: 'ATH', aLogo: '🔴⚪', time: '19:30', ms1: 1.88, msX: 3.40, ms2: 4.20 }),
    createMatch({ id: 'esp-ll-3', sport: 'FOOTBALL', leagueId: 'esp-laliga', leagueName: 'La Liga', leagueLogo: '🇪🇸', country: 'İspanya', tvChannel: 'S Sport Plus', hName: 'Sevilla', hShort: 'SEV', hLogo: '⚪🔴', aName: 'Real Betis', aShort: 'BET', aLogo: '🟢⚪', date: TOMORROW_DATE_STR, time: '21:30', ms1: 2.45, msX: 3.25, ms2: 2.85 }),
    createMatch({ id: 'esp-ll-4', sport: 'FOOTBALL', leagueId: 'esp-laliga', leagueName: 'La Liga', leagueLogo: '🇪🇸', country: 'İspanya', tvChannel: 'S Sport 1', hName: 'Real Sociedad', hShort: 'RSO', hLogo: '🔵⚪', aName: 'Villarreal', aShort: 'VIL', aLogo: '🟡', date: TOMORROW_DATE_STR, time: '19:00', ms1: 2.20, msX: 3.35, ms2: 3.20 }),
    createMatch({ id: 'esp-ll-5', sport: 'FOOTBALL', leagueId: 'esp-laliga', leagueName: 'La Liga', leagueLogo: '🇪🇸', country: 'İspanya', tvChannel: 'S Sport Plus', hName: 'Girona', hShort: 'GIR', hLogo: '🔴⚪', aName: 'Valencia', aShort: 'VAL', aLogo: '🦇', date: TOMORROW_DATE_STR, time: '16:00', ms1: 1.95, msX: 3.50, ms2: 3.75 }),
    createMatch({ id: 'esp-ll-6', sport: 'FOOTBALL', leagueId: 'esp-laliga', leagueName: 'La Liga', leagueLogo: '🇪🇸', country: 'İspanya', tvChannel: 'S Sport 2', hName: 'Celta Vigo', hShort: 'CEL', hLogo: '🩵', aName: 'Osasuna', aShort: 'OSA', aLogo: '🔴🔵', time: '17:00', ms1: 2.15, msX: 3.25, ms2: 3.30 }),
    createMatch({ id: 'esp-ll-7', sport: 'FOOTBALL', leagueId: 'esp-laliga', leagueName: 'La Liga', leagueLogo: '🇪🇸', country: 'İspanya', tvChannel: 'S Sport Plus', hName: 'Mallorca', hShort: 'MLL', hLogo: '🔴⚫', aName: 'Espanyol', aShort: 'ESP', aLogo: '🔵⚪', date: TOMORROW_DATE_STR, time: '14:00', ms1: 2.05, msX: 3.10, ms2: 3.70 }),
    createMatch({ id: 'esp-ll-8', sport: 'FOOTBALL', leagueId: 'esp-laliga', leagueName: 'La Liga', leagueLogo: '🇪🇸', country: 'İspanya', tvChannel: 'S Sport 1', hName: 'Alavés', hShort: 'ALA', hLogo: '🔵⚪', aName: 'Getafe', aShort: 'GET', aLogo: '🔵', time: '15:00', status: 'FINISHED', homeScore: 1, awayScore: 1, ms1: 2.30, msX: 3.00, ms2: 3.30 }),
    createMatch({ id: 'esp-ll-9', sport: 'FOOTBALL', leagueId: 'esp-laliga', leagueName: 'La Liga', leagueLogo: '🇪🇸', country: 'İspanya', tvChannel: 'S Sport Plus', hName: 'Las Palmas', hShort: 'LPA', hLogo: '🟡🔵', aName: 'Rayo Vallecano', aShort: 'RAY', aLogo: '⚪🔴', date: TOMORROW_DATE_STR, time: '17:15', ms1: 2.40, msX: 3.15, ms2: 2.90 }),
    createMatch({ id: 'esp-ll-10', sport: 'FOOTBALL', leagueId: 'esp-laliga', leagueName: 'La Liga', leagueLogo: '🇪🇸', country: 'İspanya', tvChannel: 'S Sport 2', hName: 'Leganés', hShort: 'LEG', hLogo: '🔵⚪', aName: 'Real Valladolid', aShort: 'VLL', aLogo: '🟣⚪', date: TOMORROW_DATE_STR, time: '20:00', ms1: 2.25, msX: 3.10, ms2: 3.25 })
  );

  // 5. İTALYA SERIE A (12 Maç)
  list.push(
    createMatch({ id: 'ita-sa-1', sport: 'FOOTBALL', leagueId: 'ita-seriea', leagueName: 'Serie A', leagueLogo: '🇮🇹', country: 'İtalya', tvChannel: 'S Sport 2 HD', hName: 'Inter', hShort: 'INT', hLogo: '🔵⚫', aName: 'Juventus', aShort: 'JUV', aLogo: '⚪⚫', time: '21:45', ms1: 1.95, msX: 3.40, ms2: 3.90, hot: true, ai: true }),
    createMatch({ id: 'ita-sa-2', sport: 'FOOTBALL', leagueId: 'ita-seriea', leagueName: 'Serie A', leagueLogo: '🇮🇹', country: 'İtalya', tvChannel: 'S Sport Plus', hName: 'AC Milan', hShort: 'MIL', hLogo: '🔴⚫', aName: 'Napoli', aShort: 'NAP', aLogo: '🔵', date: TOMORROW_DATE_STR, time: '21:45', ms1: 2.25, msX: 3.35, ms2: 3.10, hot: true, ai: true }),
    createMatch({ id: 'ita-sa-3', sport: 'FOOTBALL', leagueId: 'ita-seriea', leagueName: 'Serie A', leagueLogo: '🇮🇹', country: 'İtalya', tvChannel: 'S Sport 2', hName: 'Roma', hShort: 'ROM', hLogo: '🟡🔴', aName: 'Lazio', aShort: 'LAZ', aLogo: '🩵', date: TOMORROW_DATE_STR, time: '19:00', ms1: 2.30, msX: 3.25, ms2: 3.05, hot: true, ai: true }),
    createMatch({ id: 'ita-sa-4', sport: 'FOOTBALL', leagueId: 'ita-seriea', leagueName: 'Serie A', leagueLogo: '🇮🇹', country: 'İtalya', tvChannel: 'S Sport Plus', hName: 'Atalanta', hShort: 'ATA', hLogo: '🔵⚫', aName: 'Fiorentina', aShort: 'FIO', aLogo: '🟣', time: '19:00', ms1: 1.85, msX: 3.65, ms2: 3.95 }),
    createMatch({ id: 'ita-sa-5', sport: 'FOOTBALL', leagueId: 'ita-seriea', leagueName: 'Serie A', leagueLogo: '🇮🇹', country: 'İtalya', tvChannel: 'S Sport 2', hName: 'Bologna', hShort: 'BOL', hLogo: '🔴🔵', aName: 'Torino', aShort: 'TOR', aLogo: '🐂', time: '16:00', status: 'LIVE', minute: 58, homeScore: 1, awayScore: 0, ms1: 2.10, msX: 3.15, ms2: 3.55 }),
    createMatch({ id: 'ita-sa-6', sport: 'FOOTBALL', leagueId: 'ita-seriea', leagueName: 'Serie A', leagueLogo: '🇮🇹', country: 'İtalya', tvChannel: 'S Sport Plus', hName: 'Genoa', hShort: 'GEN', hLogo: '🔴🔵', aName: 'Como 1907', aShort: 'COM', aLogo: '🔵⚪', date: TOMORROW_DATE_STR, time: '16:00', ms1: 2.35, msX: 3.20, ms2: 2.95 }),
    createMatch({ id: 'ita-sa-7', sport: 'FOOTBALL', leagueId: 'ita-seriea', leagueName: 'Serie A', leagueLogo: '🇮🇹', country: 'İtalya', tvChannel: 'S Sport Plus', hName: 'Parma', hShort: 'PAR', hLogo: '🟡🔵', aName: 'Udinese', aShort: 'UDI', aLogo: '⚪⚫', date: TOMORROW_DATE_STR, time: '13:30', ms1: 2.45, msX: 3.25, ms2: 2.80 }),
    createMatch({ id: 'ita-sa-8', sport: 'FOOTBALL', leagueId: 'ita-seriea', leagueName: 'Serie A', leagueLogo: '🇮🇹', country: 'İtalya', tvChannel: 'S Sport 2', hName: 'Hellas Verona', hShort: 'VER', hLogo: '🟡🔵', aName: 'Cagliari', aShort: 'CAG', aLogo: '🔴🔵', date: TOMORROW_DATE_STR, time: '16:00', ms1: 2.20, msX: 3.20, ms2: 3.25 }),
    createMatch({ id: 'ita-sa-9', sport: 'FOOTBALL', leagueId: 'ita-seriea', leagueName: 'Serie A', leagueLogo: '🇮🇹', country: 'İtalya', tvChannel: 'S Sport Plus', hName: 'Monza', hShort: 'MON', hLogo: '🔴⚪', aName: 'Venezia', aShort: 'VEN', aLogo: '🟠🟢', date: TOMORROW_DATE_STR, time: '16:00', ms1: 2.05, msX: 3.30, ms2: 3.50 }),
    createMatch({ id: 'ita-sa-10', sport: 'FOOTBALL', leagueId: 'ita-seriea', leagueName: 'Serie A', leagueLogo: '🇮🇹', country: 'İtalya', tvChannel: 'S Sport Plus', hName: 'Empoli', hShort: 'EMP', hLogo: '🔵', aName: 'Lecce', aShort: 'LEC', aLogo: '🟡🔴', time: '16:00', ms1: 2.30, msX: 3.10, ms2: 3.15 })
  );

  // 6. ALMANYA BUNDESLIGA (12 Maç)
  list.push(
    createMatch({ id: 'ger-bl-1', sport: 'FOOTBALL', leagueId: 'ger-bundesliga', leagueName: 'Bundesliga', leagueLogo: '🇩🇪', country: 'Almanya', tvChannel: 'Tivibu Spor 1', hName: 'Bayern Münih', hShort: 'BAY', hLogo: '🔴⚪', aName: 'Borussia Dortmund', aShort: 'BVB', aLogo: '🟡⚫', time: '19:30', ms1: 1.55, msX: 4.50, ms2: 4.80, hot: true, ai: true }),
    createMatch({ id: 'ger-bl-2', sport: 'FOOTBALL', leagueId: 'ger-bundesliga', leagueName: 'Bundesliga', leagueLogo: '🇩🇪', country: 'Almanya', tvChannel: 'Tivibu Spor 2', hName: 'Bayer Leverkusen', hShort: 'B04', hLogo: '🔴⚫', aName: 'RB Leipzig', aShort: 'RBL', aLogo: '🔴⚪', date: TOMORROW_DATE_STR, time: '16:30', ms1: 1.85, msX: 3.80, ms2: 3.75, hot: true, ai: true }),
    createMatch({ id: 'ger-bl-3', sport: 'FOOTBALL', leagueId: 'ger-bundesliga', leagueName: 'Bundesliga', leagueLogo: '🇩🇪', country: 'Almanya', tvChannel: 'Tivibu Spor 1', hName: 'Eintracht Frankfurt', hShort: 'SGE', hLogo: '🦅', aName: 'VfB Stuttgart', aShort: 'STU', aLogo: '⚪🔴', date: TOMORROW_DATE_STR, time: '18:30', ms1: 2.35, msX: 3.60, ms2: 2.75 }),
    createMatch({ id: 'ger-bl-4', sport: 'FOOTBALL', leagueId: 'ger-bundesliga', leagueName: 'Bundesliga', leagueLogo: '🇩🇪', country: 'Almanya', tvChannel: 'Tivibu Spor 3', hName: 'Wolfsburg', hShort: 'WOB', hLogo: '🟢⚪', aName: 'Borussia M.Gladbach', aShort: 'BMG', aLogo: '⚪🟢', time: '16:30', ms1: 2.15, msX: 3.50, ms2: 3.10 }),
    createMatch({ id: 'ger-bl-5', sport: 'FOOTBALL', leagueId: 'ger-bundesliga', leagueName: 'Bundesliga', leagueLogo: '🇩🇪', country: 'Almanya', tvChannel: 'Tivibu Spor 2', hName: 'Freiburg', hShort: 'SCF', hLogo: '🔴⚪', aName: 'Hoffenheim', aShort: 'TSG', aLogo: '🔵⚪', time: '16:30', ms1: 2.05, msX: 3.60, ms2: 3.25 }),
    createMatch({ id: 'ger-bl-6', sport: 'FOOTBALL', leagueId: 'ger-bundesliga', leagueName: 'Bundesliga', leagueLogo: '🇩🇪', country: 'Almanya', tvChannel: 'Tivibu Spor 1', hName: 'Werder Bremen', hShort: 'SVW', hLogo: '🟢⚪', aName: 'Mainz 05', aShort: 'M05', aLogo: '🔴⚪', date: TOMORROW_DATE_STR, time: '16:30', ms1: 2.20, msX: 3.45, ms2: 3.05 }),
    createMatch({ id: 'ger-bl-7', sport: 'FOOTBALL', leagueId: 'ger-bundesliga', leagueName: 'Bundesliga', leagueLogo: '🇩🇪', country: 'Almanya', tvChannel: 'Tivibu Spor 3', hName: 'Augsburg', hShort: 'FCA', hLogo: '🔴🟢', aName: 'Union Berlin', aShort: 'FCU', aLogo: '🔴⚪', date: TOMORROW_DATE_STR, time: '16:30', ms1: 2.40, msX: 3.30, ms2: 2.85 }),
    createMatch({ id: 'ger-bl-8', sport: 'FOOTBALL', leagueId: 'ger-bundesliga', leagueName: 'Bundesliga', leagueLogo: '🇩🇪', country: 'Almanya', tvChannel: 'Tivibu Spor 4', hName: 'St. Pauli', hShort: 'STP', hLogo: '🟤⚪', aName: 'Heidenheim', aShort: 'FCH', aLogo: '🔴🔵', time: '16:30', status: 'FINISHED', homeScore: 2, awayScore: 1, ms1: 2.25, msX: 3.25, ms2: 3.10 }),
    createMatch({ id: 'ger-bl-9', sport: 'FOOTBALL', leagueId: 'ger-bundesliga', leagueName: 'Bundesliga', leagueLogo: '🇩🇪', country: 'Almanya', tvChannel: 'Tivibu Spor 2', hName: 'VfL Bochum', hShort: 'BOC', hLogo: '🔵⚪', aName: 'Holstein Kiel', aShort: 'KSV', aLogo: '🔵⚪', date: TOMORROW_DATE_STR, time: '16:30', ms1: 2.10, msX: 3.40, ms2: 3.30 }),
    createMatch({ id: 'ger-bl-10', sport: 'FOOTBALL', leagueId: 'ger-bundesliga', leagueName: 'Bundesliga', leagueLogo: '🇩🇪', country: 'Almanya', tvChannel: 'Tivibu Spor 1', hName: 'Hamburger SV', hShort: 'HSV', hLogo: '🔵⚪', aName: 'Schalke 04', aShort: 'S04', aLogo: '🔵⚪', time: '21:30', ms1: 1.95, msX: 3.60, ms2: 3.55 })
  );

  // 7. FRANSA LIGUE 1 & HOLLANDA EREDIVISIE (12 Maç)
  list.push(
    createMatch({ id: 'fra-l1-1', sport: 'FOOTBALL', leagueId: 'fra-ligue1', leagueName: 'Fransa Ligue 1', leagueLogo: '🇫🇷', country: 'Fransa', tvChannel: 'beIN Sports 4', hName: 'Paris Saint-Germain', hShort: 'PSG', hLogo: '🔵🔴', aName: 'Marsilya', aShort: 'OM', aLogo: '⚪🔵', time: '21:45', ms1: 1.48, msX: 4.60, ms2: 5.50, hot: true, ai: true }),
    createMatch({ id: 'fra-l1-2', sport: 'FOOTBALL', leagueId: 'fra-ligue1', leagueName: 'Fransa Ligue 1', leagueLogo: '🇫🇷', country: 'Fransa', tvChannel: 'beIN Sports 5', hName: 'Monaco', hShort: 'ASM', hLogo: '🔴⚪', aName: 'Lyon', aShort: 'OL', aLogo: '🔵🔴', date: TOMORROW_DATE_STR, time: '21:45', ms1: 1.90, msX: 3.75, ms2: 3.65 }),
    createMatch({ id: 'fra-l1-3', sport: 'FOOTBALL', leagueId: 'fra-ligue1', leagueName: 'Fransa Ligue 1', leagueLogo: '🇫🇷', country: 'Fransa', tvChannel: 'beIN Sports 4', hName: 'Lille', hShort: 'LIL', hLogo: '🔴🔵', aName: 'Rennes', aShort: 'REN', aLogo: '🔴⚫', date: TOMORROW_DATE_STR, time: '18:00', ms1: 2.05, msX: 3.40, ms2: 3.45 }),
    createMatch({ id: 'fra-l1-4', sport: 'FOOTBALL', leagueId: 'fra-ligue1', leagueName: 'Fransa Ligue 1', leagueLogo: '🇫🇷', country: 'Fransa', tvChannel: 'beIN Sports 5', hName: 'Nice', hShort: 'NIC', hLogo: '🔴⚫', aName: 'Lens', aShort: 'RCL', aLogo: '🟡🔴', time: '18:00', ms1: 2.25, msX: 3.30, ms2: 3.10 }),
    createMatch({ id: 'fra-l1-5', sport: 'FOOTBALL', leagueId: 'fra-ligue1', leagueName: 'Fransa Ligue 1', leagueLogo: '🇫🇷', country: 'Fransa', tvChannel: 'beIN Sports MAX 1', hName: 'Brest', hShort: 'SB29', hLogo: '🔴⚪', aName: 'Toulouse', aShort: 'TFC', aLogo: '🟣⚪', date: TOMORROW_DATE_STR, time: '16:00', ms1: 2.10, msX: 3.30, ms2: 3.35 }),
    createMatch({ id: 'fra-l1-6', sport: 'FOOTBALL', leagueId: 'fra-ligue1', leagueName: 'Fransa Ligue 1', leagueLogo: '🇫🇷', country: 'Fransa', tvChannel: 'beIN Sports MAX 2', hName: 'Strasbourg', hShort: 'RCSA', hLogo: '🔵⚪', aName: 'Reims', aShort: 'SDR', aLogo: '🔴⚪', time: '18:00', status: 'LIVE', minute: 31, homeScore: 0, awayScore: 0, ms1: 2.30, msX: 3.25, ms2: 2.95 }),
    createMatch({ id: 'ned-er-1', sport: 'FOOTBALL', leagueId: 'ned-eredivisie', leagueName: 'Hollanda Eredivisie', leagueLogo: '🇳🇱', country: 'Hollanda', tvChannel: 'TV8.5', hName: 'Ajax', hShort: 'AJA', hLogo: '⚪🔴', aName: 'Feyenoord', aShort: 'FEY', aLogo: '🔴⚪', date: TOMORROW_DATE_STR, time: '15:30', ms1: 2.20, msX: 3.65, ms2: 2.90, hot: true, ai: true }),
    createMatch({ id: 'ned-er-2', sport: 'FOOTBALL', leagueId: 'ned-eredivisie', leagueName: 'Hollanda Eredivisie', leagueLogo: '🇳🇱', country: 'Hollanda', tvChannel: 'TV8.5', hName: 'PSV Eindhoven', hShort: 'PSV', hLogo: '🔴⚪', aName: 'AZ Alkmaar', aShort: 'AZ', aLogo: '🔴⚪', time: '21:00', ms1: 1.52, msX: 4.40, ms2: 5.20 }),
    createMatch({ id: 'ned-er-3', sport: 'FOOTBALL', leagueId: 'ned-eredivisie', leagueName: 'Hollanda Eredivisie', leagueLogo: '🇳🇱', country: 'Hollanda', tvChannel: 'Exxen', hName: 'Twente', hShort: 'TWE', hLogo: '🔴', aName: 'Utrecht', aShort: 'UTR', aLogo: '🔴⚪', date: TOMORROW_DATE_STR, time: '17:45', ms1: 1.85, msX: 3.65, ms2: 3.80 }),
    createMatch({ id: 'por-lp-1', sport: 'FOOTBALL', leagueId: 'all', leagueName: 'Portekiz Premier Ligi', leagueLogo: '🇵🇹', country: 'Portekiz', tvChannel: 'S Sport Plus', hName: 'Benfica', hShort: 'SLB', hLogo: '🦅', aName: 'Sporting Lizbon', aShort: 'SCP', aLogo: '🟢⚪', time: '23:30', ms1: 2.30, msX: 3.35, ms2: 2.95, hot: true }),
    createMatch({ id: 'por-lp-2', sport: 'FOOTBALL', leagueId: 'all', leagueName: 'Portekiz Premier Ligi', leagueLogo: '🇵🇹', country: 'Portekiz', tvChannel: 'S Sport Plus', hName: 'FC Porto', hShort: 'FCP', hLogo: '🔵⚪', aName: 'Braga', aShort: 'SCB', aLogo: '🔴⚪', date: TOMORROW_DATE_STR, time: '22:30', ms1: 1.78, msX: 3.60, ms2: 4.15 }),
    createMatch({ id: 'por-lp-3', sport: 'FOOTBALL', leagueId: 'all', leagueName: 'Portekiz Premier Ligi', leagueLogo: '🇵🇹', country: 'Portekiz', tvChannel: 'S Sport Plus', hName: 'Vitoria Guimaraes', hShort: 'VSC', hLogo: '⚪⚫', aName: 'Boavista', aShort: 'BFC', aLogo: '🏁', time: '20:00', ms1: 1.70, msX: 3.55, ms2: 4.60 })
  );

  // 8. UEFA ŞAMPİYONLAR LİGİ & UEFA AVRUPA LİGİ (12 Maç)
  list.push(
    createMatch({ id: 'uefa-cl-1', sport: 'FOOTBALL', leagueId: 'uefa-cl', leagueName: 'UEFA Şampiyonlar Ligi', leagueLogo: '⭐', country: 'Avrupa', tvChannel: 'TRT 1 / Tabii', hName: 'Real Madrid', hShort: 'RMA', hLogo: '👑', aName: 'Manchester City', aShort: 'MCI', aLogo: '🩵', time: '22:00', ms1: 2.45, msX: 3.50, ms2: 2.65, hot: true, ai: true }),
    createMatch({ id: 'uefa-cl-2', sport: 'FOOTBALL', leagueId: 'uefa-cl', leagueName: 'UEFA Şampiyonlar Ligi', leagueLogo: '⭐', country: 'Avrupa', tvChannel: 'TRT Spor / Tabii', hName: 'Bayern Münih', hShort: 'BAY', hLogo: '🔴⚪', aName: 'Paris Saint-Germain', aShort: 'PSG', aLogo: '🔵🔴', time: '22:00', ms1: 2.00, msX: 3.70, ms2: 3.30, hot: true, ai: true }),
    createMatch({ id: 'uefa-cl-3', sport: 'FOOTBALL', leagueId: 'uefa-cl', leagueName: 'UEFA Şampiyonlar Ligi', leagueLogo: '⭐', country: 'Avrupa', tvChannel: 'Tabii Spor', hName: 'Inter', hShort: 'INT', hLogo: '🔵⚫', aName: 'Arsenal', aShort: 'ARS', aLogo: '🔴⚪', date: TOMORROW_DATE_STR, time: '22:00', ms1: 2.35, msX: 3.30, ms2: 2.95 }),
    createMatch({ id: 'uefa-cl-4', sport: 'FOOTBALL', leagueId: 'uefa-cl', leagueName: 'UEFA Şampiyonlar Ligi', leagueLogo: '⭐', country: 'Avrupa', tvChannel: 'Tabii Spor 2', hName: 'Barcelona', hShort: 'BAR', hLogo: '🔵🔴', aName: 'Juventus', aShort: 'JUV', aLogo: '⚪⚫', date: TOMORROW_DATE_STR, time: '22:00', ms1: 1.75, msX: 3.75, ms2: 4.25 }),
    createMatch({ id: 'uefa-cl-5', sport: 'FOOTBALL', leagueId: 'uefa-cl', leagueName: 'UEFA Şampiyonlar Ligi', leagueLogo: '⭐', country: 'Avrupa', tvChannel: 'Tabii Spor 3', hName: 'Liverpool', hShort: 'LIV', hLogo: '🔴', aName: 'Bayer Leverkusen', aShort: 'B04', aLogo: '🔴⚫', time: '22:00', ms1: 1.68, msX: 4.10, ms2: 4.40 }),
    createMatch({ id: 'uefa-cl-6', sport: 'FOOTBALL', leagueId: 'uefa-cl', leagueName: 'UEFA Şampiyonlar Ligi', leagueLogo: '⭐', country: 'Avrupa', tvChannel: 'Tabii Spor 4', hName: 'Atletico Madrid', hShort: 'ATM', hLogo: '🔴⚪', aName: 'Borussia Dortmund', aShort: 'BVB', aLogo: '🟡⚫', date: TOMORROW_DATE_STR, time: '22:00', ms1: 1.85, msX: 3.55, ms2: 3.90 }),
    createMatch({ id: 'uefa-el-1', sport: 'FOOTBALL', leagueId: 'uefa-el', leagueName: 'UEFA Avrupa Ligi', leagueLogo: '🏆', country: 'Avrupa', tvChannel: 'TRT 1 / Tabii', hName: 'Galatasaray', hShort: 'GS', hLogo: '🦁', aName: 'Tottenham', aShort: 'TOT', aLogo: '⚪', time: '20:45', ms1: 2.30, msX: 3.60, ms2: 2.80, hot: true, ai: true }),
    createMatch({ id: 'uefa-el-2', sport: 'FOOTBALL', leagueId: 'uefa-el', leagueName: 'UEFA Avrupa Ligi', leagueLogo: '🏆', country: 'Avrupa', tvChannel: 'TRT Spor / Tabii', hName: 'Fenerbahçe', hShort: 'FB', hLogo: '🟡🔵', aName: 'Manchester United', aShort: 'MUN', aLogo: '👹', time: '23:00', ms1: 2.50, msX: 3.45, ms2: 2.65, hot: true, ai: true }),
    createMatch({ id: 'uefa-el-3', sport: 'FOOTBALL', leagueId: 'uefa-el', leagueName: 'UEFA Avrupa Ligi', leagueLogo: '🏆', country: 'Avrupa', tvChannel: 'TRT Spor / Tabii', hName: 'Beşiktaş', hShort: 'BJK', hLogo: '🦅', aName: 'Lyon', aShort: 'OL', aLogo: '🔵🔴', date: TOMORROW_DATE_STR, time: '23:00', ms1: 2.70, msX: 3.40, ms2: 2.45, hot: true, ai: true }),
    createMatch({ id: 'uefa-el-4', sport: 'FOOTBALL', leagueId: 'uefa-el', leagueName: 'UEFA Avrupa Ligi', leagueLogo: '🏆', country: 'Avrupa', tvChannel: 'Tabii Spor 2', hName: 'Roma', hShort: 'ROM', hLogo: '🟡🔴', aName: 'Athletic Bilbao', aShort: 'ATH', aLogo: '🔴⚪', time: '23:00', ms1: 2.10, msX: 3.35, ms2: 3.35 }),
    createMatch({ id: 'uefa-el-5', sport: 'FOOTBALL', leagueId: 'uefa-el', leagueName: 'UEFA Avrupa Ligi', leagueLogo: '🏆', country: 'Avrupa', tvChannel: 'Tabii Spor 3', hName: 'Ajax', hShort: 'AJA', hLogo: '⚪🔴', aName: 'Lazio', aShort: 'LAZ', aLogo: '🩵', date: TOMORROW_DATE_STR, time: '23:00', ms1: 2.35, msX: 3.45, ms2: 2.80 }),
    createMatch({ id: 'uefa-el-6', sport: 'FOOTBALL', leagueId: 'uefa-el', leagueName: 'UEFA Avrupa Ligi', leagueLogo: '🏆', country: 'Avrupa', tvChannel: 'Tabii Spor 4', hName: 'Real Sociedad', hShort: 'RSO', hLogo: '🔵⚪', aName: 'Anderlecht', aShort: 'AND', aLogo: '🟣', time: '20:45', ms1: 1.65, msX: 3.75, ms2: 4.80 })
  );

  // 9. BASKETBOL - EUROLEAGUE & BSL & NBA (22 Maç)
  list.push(
    // EuroLeague
    createMatch({ id: 'bb-el-1', sport: 'BASKETBALL', leagueId: 'euroleague', leagueName: 'EuroLeague', leagueLogo: '🏀', country: 'Avrupa', tvChannel: 'S Sport / EuroLeague TV', hName: 'Fenerbahçe Beko', hShort: 'FBB', hLogo: '🟡🔵', aName: 'Panathinaikos AKTOR', aShort: 'PAO', aLogo: '🟢⚪', time: '20:45', status: 'LIVE', minute: 34, homeScore: 78, awayScore: 74, quarterScores: ['22-19', '18-21', '24-21', '14-13'], ms1: 1.75, ms2: 2.05, totalPointsLine: 165.5, overTotalPoints: 1.85, underTotalPoints: 1.85, handicapHome: -3.5, hot: true, ai: true }),
    createMatch({ id: 'bb-el-2', sport: 'BASKETBALL', leagueId: 'euroleague', leagueName: 'EuroLeague', leagueLogo: '🏀', country: 'Avrupa', tvChannel: 'S Sport 2', hName: 'Anadolu Efes', hShort: 'AEF', hLogo: '🔵⚪', aName: 'Real Madrid Baloncesto', aShort: 'RMB', aLogo: '👑', time: '20:30', ms1: 2.10, ms2: 1.72, totalPointsLine: 168.5, overTotalPoints: 1.85, underTotalPoints: 1.85, handicapHome: 2.5, hot: true, ai: true }),
    createMatch({ id: 'bb-el-3', sport: 'BASKETBALL', leagueId: 'euroleague', leagueName: 'EuroLeague', leagueLogo: '🏀', country: 'Avrupa', tvChannel: 'S Sport Plus', hName: 'Olympiacos', hShort: 'OLY', hLogo: '🔴⚪', aName: 'Barcelona Basket', aShort: 'BAR', aLogo: '🔵🔴', time: '21:15', ms1: 1.65, ms2: 2.20, totalPointsLine: 161.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'bb-el-4', sport: 'BASKETBALL', leagueId: 'euroleague', leagueName: 'EuroLeague', leagueLogo: '🏀', country: 'Avrupa', tvChannel: 'S Sport Plus', hName: 'AS Monaco', hShort: 'ASM', hLogo: '🔴⚪', aName: 'Maccabi Tel Aviv', aShort: 'MTA', aLogo: '🟡🔵', time: '20:00', ms1: 1.45, ms2: 2.70, totalPointsLine: 169.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'bb-el-5', sport: 'BASKETBALL', leagueId: 'euroleague', leagueName: 'EuroLeague', leagueLogo: '🏀', country: 'Avrupa', tvChannel: 'S Sport Plus', hName: 'Virtus Bologna', hShort: 'VIR', hLogo: '⚫⚪', aName: 'Partizan Mozzart', aShort: 'PAR', aLogo: '⚫⚪', date: TOMORROW_DATE_STR, time: '21:30', ms1: 1.80, ms2: 1.98, totalPointsLine: 163.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'bb-el-6', sport: 'BASKETBALL', leagueId: 'euroleague', leagueName: 'EuroLeague', leagueLogo: '🏀', country: 'Avrupa', tvChannel: 'S Sport 2', hName: 'EA7 Olimpia Milano', hShort: 'MIL', hLogo: '🔴⚪', aName: 'Kızılyıldız (Crvena Zvezda)', aShort: 'CZV', aLogo: '🔴⚪', date: TOMORROW_DATE_STR, time: '21:30', ms1: 1.60, ms2: 2.30, totalPointsLine: 159.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'bb-el-7', sport: 'BASKETBALL', leagueId: 'euroleague', leagueName: 'EuroLeague', leagueLogo: '🏀', country: 'Avrupa', tvChannel: 'S Sport Plus', hName: 'Zalgiris Kaunas', hShort: 'ZAL', hLogo: '🟢⚪', aName: 'Baskonia', aShort: 'BKN', aLogo: '🔵🔴', date: TOMORROW_DATE_STR, time: '20:00', ms1: 1.70, ms2: 2.15, totalPointsLine: 164.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'bb-el-8', sport: 'BASKETBALL', leagueId: 'euroleague', leagueName: 'EuroLeague', leagueLogo: '🏀', country: 'Avrupa', tvChannel: 'S Sport Plus', hName: 'Bayern Basketball', hShort: 'FCB', hLogo: '🔴⚪', aName: 'ASVEL Lyon-Villeurbanne', aShort: 'ASV', aLogo: '⚫⚪', date: TOMORROW_DATE_STR, time: '21:30', ms1: 1.35, ms2: 3.10, totalPointsLine: 162.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),

    // Türkiye BSL
    createMatch({ id: 'bb-bsl-1', sport: 'BASKETBALL', leagueId: 'tr-bsl', leagueName: 'Türkiye Basketbol Süper Ligi', leagueLogo: '🇹🇷', country: 'Türkiye', tvChannel: 'beIN Sports 5', hName: 'Beşiktaş Fibabanka', hShort: 'BJK', hLogo: '🦅', aName: 'Galatasaray Nef', aShort: 'GS', aLogo: '🦁', date: TOMORROW_DATE_STR, time: '18:00', ms1: 1.68, ms2: 2.15, totalPointsLine: 166.5, overTotalPoints: 1.85, underTotalPoints: 1.85, hot: true, ai: true }),
    createMatch({ id: 'bb-bsl-2', sport: 'BASKETBALL', leagueId: 'tr-bsl', leagueName: 'Türkiye Basketbol Süper Ligi', leagueLogo: '🇹🇷', country: 'Türkiye', tvChannel: 'beIN Sports 5', hName: 'Pınar Karşıyaka', hShort: 'KSK', hLogo: '🟢🔴', aName: 'Türk Telekom', aShort: 'TT', aLogo: '🔵⚪', time: '18:00', ms1: 1.75, ms2: 2.05, totalPointsLine: 167.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'bb-bsl-3', sport: 'BASKETBALL', leagueId: 'tr-bsl', leagueName: 'Türkiye Basketbol Süper Ligi', leagueLogo: '🇹🇷', country: 'Türkiye', tvChannel: 'beIN Sports MAX 1', hName: 'Tofaş Spor', hShort: 'TOF', hLogo: '🔵⚪', aName: 'Bursaspor Basketbol', aShort: 'BUR', aLogo: '🟢⚪', date: TOMORROW_DATE_STR, time: '15:30', ms1: 1.82, ms2: 1.95, totalPointsLine: 169.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'bb-bsl-4', sport: 'BASKETBALL', leagueId: 'tr-bsl', leagueName: 'Türkiye Basketbol Süper Ligi', leagueLogo: '🇹🇷', country: 'Türkiye', tvChannel: 'beIN Sports 5', hName: 'Bahçeşehir Koleji', hShort: 'BAH', hLogo: '🔴🔵', aName: 'Darüşşafaka Lassa', aShort: 'DAÇ', aLogo: '🟢⚫', date: TOMORROW_DATE_STR, time: '13:00', ms1: 1.50, ms2: 2.55, totalPointsLine: 164.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'bb-bsl-5', sport: 'BASKETBALL', leagueId: 'tr-bsl', leagueName: 'Türkiye Basketbol Süper Ligi', leagueLogo: '🇹🇷', country: 'Türkiye', tvChannel: 'beIN Sports MAX 2', hName: 'Manisa Basket', hShort: 'MAN', hLogo: '🟢⚪', aName: 'Aliağa Petkimspor', aShort: 'PET', aLogo: '🔴⚪', time: '15:30', status: 'FINISHED', homeScore: 82, awayScore: 78, ms1: 1.85, ms2: 1.92, totalPointsLine: 161.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'bb-bsl-6', sport: 'BASKETBALL', leagueId: 'tr-bsl', leagueName: 'Türkiye Basketbol Süper Ligi', leagueLogo: '🇹🇷', country: 'Türkiye', tvChannel: 'beIN Sports 5', hName: 'Büyükçekmece Basketbol', hShort: 'BÇB', hLogo: '🔵⚪', aName: 'Mersin Spor', aShort: 'MSB', aLogo: '🔵⚪', date: TOMORROW_DATE_STR, time: '20:30', ms1: 1.90, ms2: 1.88, totalPointsLine: 165.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),

    // NBA
    createMatch({ id: 'bb-nba-1', sport: 'BASKETBALL', leagueId: 'nba', leagueName: 'NBA', leagueLogo: '🇺🇸', country: 'ABD', tvChannel: 'S Sport / NBA TV', hName: 'Boston Celtics', hShort: 'BOS', hLogo: '☘️', aName: 'Los Angeles Lakers', aShort: 'LAL', aLogo: '🟣🟡', date: TOMORROW_DATE_STR, time: '03:30', ms1: 1.45, ms2: 2.80, totalPointsLine: 228.5, overTotalPoints: 1.88, underTotalPoints: 1.88, handicapHome: -6.5, hot: true, ai: true }),
    createMatch({ id: 'bb-nba-2', sport: 'BASKETBALL', leagueId: 'nba', leagueName: 'NBA', leagueLogo: '🇺🇸', country: 'ABD', tvChannel: 'S Sport Plus', hName: 'Golden State Warriors', hShort: 'GSW', hLogo: '🌉', aName: 'Denver Nuggets', aShort: 'DEN', aLogo: '⛏️', date: TOMORROW_DATE_STR, time: '05:00', ms1: 1.95, ms2: 1.85, totalPointsLine: 224.5, overTotalPoints: 1.85, underTotalPoints: 1.85, handicapHome: 1.5, hot: true, ai: true }),
    createMatch({ id: 'bb-nba-3', sport: 'BASKETBALL', leagueId: 'nba', leagueName: 'NBA', leagueLogo: '🇺🇸', country: 'ABD', tvChannel: 'NBA League Pass', hName: 'Milwaukee Bucks', hShort: 'MIL', hLogo: '🦌', aName: 'Miami Heat', aShort: 'MIA', aLogo: '🔥', date: TOMORROW_DATE_STR, time: '02:00', ms1: 1.55, ms2: 2.45, totalPointsLine: 221.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'bb-nba-4', sport: 'BASKETBALL', leagueId: 'nba', leagueName: 'NBA', leagueLogo: '🇺🇸', country: 'ABD', tvChannel: 'NBA League Pass', hName: 'Dallas Mavericks', hShort: 'DAL', hLogo: '🐴', aName: 'Phoenix Suns', aShort: 'PHX', aLogo: '☀️', date: TOMORROW_DATE_STR, time: '04:00', ms1: 1.75, ms2: 2.10, totalPointsLine: 231.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'bb-nba-5', sport: 'BASKETBALL', leagueId: 'nba', leagueName: 'NBA', leagueLogo: '🇺🇸', country: 'ABD', tvChannel: 'NBA League Pass', hName: 'New York Knicks', hShort: 'NYK', hLogo: '🗽', aName: 'Philadelphia 76ers', aShort: 'PHI', aLogo: '🔔', date: TOMORROW_DATE_STR, time: '02:30', ms1: 1.68, ms2: 2.20, totalPointsLine: 219.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'bb-nba-6', sport: 'BASKETBALL', leagueId: 'nba', leagueName: 'NBA', leagueLogo: '🇺🇸', country: 'ABD', tvChannel: 'NBA League Pass', hName: 'Minnesota Timberwolves', hShort: 'MIN', hLogo: '🐺', aName: 'Oklahoma City Thunder', aShort: 'OKC', aLogo: '⚡', date: TOMORROW_DATE_STR, time: '03:00', ms1: 1.90, ms2: 1.90, totalPointsLine: 223.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'bb-nba-7', sport: 'BASKETBALL', leagueId: 'nba', leagueName: 'NBA', leagueLogo: '🇺🇸', country: 'ABD', tvChannel: 'NBA League Pass', hName: 'LA Clippers', hShort: 'LAC', hLogo: '⛵', aName: 'Houston Rockets', aShort: 'HOU', aLogo: '🚀', date: TOMORROW_DATE_STR, time: '05:30', ms1: 1.62, ms2: 2.30, totalPointsLine: 220.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'bb-nba-8', sport: 'BASKETBALL', leagueId: 'nba', leagueName: 'NBA', leagueLogo: '🇺🇸', country: 'ABD', tvChannel: 'NBA League Pass', hName: 'Cleveland Cavaliers', hShort: 'CLE', hLogo: '⚔️', aName: 'Indiana Pacers', aShort: 'IND', aLogo: '🏎️', date: TOMORROW_DATE_STR, time: '02:00', ms1: 1.50, ms2: 2.60, totalPointsLine: 229.5, overTotalPoints: 1.85, underTotalPoints: 1.85 })
  );

  // 10. VOLEYBOL - SULTANLAR LİGİ & CEV ŞAMPİYONLAR LİGİ (14 Maç)
  list.push(
    createMatch({ id: 'vb-sult-1', sport: 'VOLLEYBALL', leagueId: 'tr-sultanlar', leagueName: 'Vodafone Sultanlar Ligi', leagueLogo: '🏐', country: 'Türkiye', tvChannel: 'TRT Spor Yıldız', hName: 'Fenerbahçe Medicana', hShort: 'FBM', hLogo: '🟡🔵', aName: 'VakıfBank', aShort: 'VAK', aLogo: '🟡⬛', time: '19:30', status: 'LIVE', minute: 2, homeScore: 1, awayScore: 1, setScores: ['25-23', '21-25', '16-14'], ms1: 1.70, ms2: 2.10, totalPointsLine: 184.5, overTotalPoints: 1.85, underTotalPoints: 1.85, hot: true, ai: true }),
    createMatch({ id: 'vb-sult-2', sport: 'VOLLEYBALL', leagueId: 'tr-sultanlar', leagueName: 'Vodafone Sultanlar Ligi', leagueLogo: '🏐', country: 'Türkiye', tvChannel: 'TRT Spor Yıldız', hName: 'Eczacıbaşı Dynavit', hShort: 'ECZ', hLogo: '🟠⚪', aName: 'Galatasaray Daikin', aShort: 'GS', aLogo: '🦁', date: TOMORROW_DATE_STR, time: '17:00', ms1: 1.35, ms2: 3.10, totalPointsLine: 175.5, overTotalPoints: 1.85, underTotalPoints: 1.85, hot: true, ai: true }),
    createMatch({ id: 'vb-sult-3', sport: 'VOLLEYBALL', leagueId: 'tr-sultanlar', leagueName: 'Vodafone Sultanlar Ligi', leagueLogo: '🏐', country: 'Türkiye', tvChannel: 'TRT Spor Yıldız', hName: 'Türk Hava Yolları (THY)', hShort: 'THY', hLogo: '🔴⚪', aName: 'Kuzeyboru', aLogo: '⚪🔴', aShort: 'KUZ', time: '15:00', ms1: 1.45, ms2: 2.70, totalPointsLine: 178.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'vb-sult-4', sport: 'VOLLEYBALL', leagueId: 'tr-sultanlar', leagueName: 'Vodafone Sultanlar Ligi', leagueLogo: '🏐', country: 'Türkiye', tvChannel: 'TVF Voleybol TV', hName: 'Zeren Spor', hShort: 'ZER', hLogo: '🟣⚪', aName: 'Nilüfer Belediyespor', aShort: 'NİL', aLogo: '🔵⚪', date: TOMORROW_DATE_STR, time: '14:00', ms1: 1.60, ms2: 2.30, totalPointsLine: 179.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'vb-sult-5', sport: 'VOLLEYBALL', leagueId: 'tr-sultanlar', leagueName: 'Vodafone Sultanlar Ligi', leagueLogo: '🏐', country: 'Türkiye', tvChannel: 'TVF Voleybol TV', hName: 'Aydın Büyükşehir Bld.', hShort: 'AYD', hLogo: '🔵⚪', aName: 'Sarıyer Belediyespor', aShort: 'SAR', aLogo: '🔵⚪', date: TOMORROW_DATE_STR, time: '15:00', ms1: 1.55, ms2: 2.40, totalPointsLine: 180.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'vb-sult-6', sport: 'VOLLEYBALL', leagueId: 'tr-sultanlar', leagueName: 'Vodafone Sultanlar Ligi', leagueLogo: '🏐', country: 'Türkiye', tvChannel: 'TVF Voleybol TV', hName: 'Beşiktaş Ayos', hShort: 'BJK', hLogo: '🦅', aName: 'Sigorta Shop Muratpaşa', aShort: 'MUR', aLogo: '🔴⚪', time: '17:30', status: 'FINISHED', homeScore: 3, awayScore: 1, setScores: ['25-20', '25-22', '20-25', '25-18'], ms1: 1.80, ms2: 1.95, totalPointsLine: 181.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'vb-efel-1', sport: 'VOLLEYBALL', leagueId: 'tr-efeler', leagueName: 'SMS Grup Efeler Ligi', leagueLogo: '🏐', country: 'Türkiye', tvChannel: 'TRT Spor Yıldız', hName: 'Ziraat Bankkart', hShort: 'ZİR', hLogo: '🔴⚪', aName: 'Halkbank', aShort: 'HLK', aLogo: '🔴⚪', time: '19:00', ms1: 1.75, ms2: 2.05, totalPointsLine: 185.5, overTotalPoints: 1.85, underTotalPoints: 1.85, hot: true }),
    createMatch({ id: 'vb-efel-2', sport: 'VOLLEYBALL', leagueId: 'tr-efeler', leagueName: 'SMS Grup Efeler Ligi', leagueLogo: '🏐', country: 'Türkiye', tvChannel: 'TRT Spor Yıldız', hName: 'Fenerbahçe Medicana (E)', hShort: 'FBM', hLogo: '🟡🔵', aName: 'Arkas Spor', aShort: 'ARK', aLogo: '🔵⚪', date: TOMORROW_DATE_STR, time: '18:00', ms1: 1.65, ms2: 2.20, totalPointsLine: 183.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'vb-efel-3', sport: 'VOLLEYBALL', leagueId: 'tr-efeler', leagueName: 'SMS Grup Efeler Ligi', leagueLogo: '🏐', country: 'Türkiye', tvChannel: 'TVF Voleybol TV', hName: 'Galatasaray HDI Sigorta', hShort: 'GS', hLogo: '🦁', aName: 'Spor Toto', aShort: 'SPT', aLogo: '🔴⚪', date: TOMORROW_DATE_STR, time: '14:00', ms1: 1.50, ms2: 2.50, totalPointsLine: 181.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'vb-efel-4', sport: 'VOLLEYBALL', leagueId: 'tr-efeler', leagueName: 'SMS Grup Efeler Ligi', leagueLogo: '🏐', country: 'Türkiye', tvChannel: 'TVF Voleybol TV', hName: 'Bursa Büyükşehir Bld.', hShort: 'BUR', hLogo: '🟢⚪', aName: 'Altekma', aShort: 'ALT', aLogo: '🔵⚪', time: '15:00', ms1: 1.70, ms2: 2.10, totalPointsLine: 182.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'vb-cev-1', sport: 'VOLLEYBALL', leagueId: 'cev-cl', leagueName: 'CEV Şampiyonlar Ligi', leagueLogo: '⭐', country: 'Avrupa', tvChannel: 'Tivibu Spor 2', hName: 'Imoco Volley Conegliano', hShort: 'IMO', hLogo: '🟡🔵', aName: 'Numia Vero Volley Milano', aShort: 'VER', aLogo: '🔵⚪', date: TOMORROW_DATE_STR, time: '21:30', ms1: 1.55, ms2: 2.35, totalPointsLine: 182.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'vb-cev-2', sport: 'VOLLEYBALL', leagueId: 'cev-cl', leagueName: 'CEV Şampiyonlar Ligi', leagueLogo: '⭐', country: 'Avrupa', tvChannel: 'Tivibu Spor 1', hName: 'VakıfBank', hShort: 'VAK', hLogo: '🟡⬛', aName: 'Savino Del Bene Scandicci', aShort: 'SCA', aLogo: '🔵⚪', time: '20:00', ms1: 1.72, ms2: 2.08, totalPointsLine: 183.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'vb-cev-3', sport: 'VOLLEYBALL', leagueId: 'cev-cl', leagueName: 'CEV Şampiyonlar Ligi', leagueLogo: '⭐', country: 'Avrupa', tvChannel: 'Tivibu Spor 2', hName: 'Fenerbahçe Medicana', hShort: 'FBM', hLogo: '🟡🔵', aName: 'Developres Rzeszow', aShort: 'RZE', aLogo: '🔴⚪', date: TOMORROW_DATE_STR, time: '19:00', ms1: 1.25, ms2: 3.80, totalPointsLine: 172.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'vb-cev-4', sport: 'VOLLEYBALL', leagueId: 'cev-cl', leagueName: 'CEV Şampiyonlar Ligi', leagueLogo: '⭐', country: 'Avrupa', tvChannel: 'Tivibu Spor 3', hName: 'Eczacıbaşı Dynavit', hShort: 'ECZ', hLogo: '🟠⚪', aName: 'SSC Palmberg Schwerin', aShort: 'SCH', aLogo: '🟡🔵', time: '18:30', ms1: 1.20, ms2: 4.20, totalPointsLine: 170.5, overTotalPoints: 1.85, underTotalPoints: 1.85 })
  );

  // 11. TENİS - ATP & WTA & GRAND SLAM (14 Maç)
  list.push(
    createMatch({ id: 'tn-atp-1', sport: 'TENNIS', leagueId: 'atp-tour', leagueName: 'ATP Dünya Turu Masters', leagueLogo: '🎾', country: 'Uluslararası', tvChannel: 'Eurosport 1 HD', hName: 'Novak Djokovic', hShort: 'DJO', hLogo: '🎾', aName: 'Carlos Alcaraz', aShort: 'ALC', aLogo: '🎾', time: '21:00', status: 'LIVE', homeScore: 1, awayScore: 1, setScores: ['6-4', '4-6', '3-2'], ms1: 2.15, ms2: 1.70, totalPointsLine: 23.5, overTotalPoints: 1.85, underTotalPoints: 1.85, hot: true, ai: true }),
    createMatch({ id: 'tn-atp-2', sport: 'TENNIS', leagueId: 'atp-tour', leagueName: 'ATP Dünya Turu Masters', leagueLogo: '🎾', country: 'Uluslararası', tvChannel: 'Eurosport 2', hName: 'Jannik Sinner', hShort: 'SIN', hLogo: '🎾', aName: 'Daniil Medvedev', aShort: 'MED', aLogo: '🎾', date: TOMORROW_DATE_STR, time: '16:00', ms1: 1.50, ms2: 2.60, totalPointsLine: 22.5, overTotalPoints: 1.85, underTotalPoints: 1.85, hot: true, ai: true }),
    createMatch({ id: 'tn-atp-3', sport: 'TENNIS', leagueId: 'atp-tour', leagueName: 'ATP Dünya Turu Masters', leagueLogo: '🎾', country: 'Uluslararası', tvChannel: 'Eurosport 1', hName: 'Alexander Zverev', hShort: 'ZVE', hLogo: '🎾', aName: 'Stefanos Tsitsipas', aShort: 'TSI', aLogo: '🎾', time: '18:00', ms1: 1.65, ms2: 2.25, totalPointsLine: 23.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'tn-atp-4', sport: 'TENNIS', leagueId: 'atp-tour', leagueName: 'ATP Dünya Turu Masters', leagueLogo: '🎾', country: 'Uluslararası', tvChannel: 'Eurosport 2', hName: 'Taylor Fritz', hShort: 'FRI', hLogo: '🎾', aName: 'Andrey Rublev', aShort: 'RUB', aLogo: '🎾', date: TOMORROW_DATE_STR, time: '17:30', ms1: 1.85, ms2: 1.95, totalPointsLine: 23.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'tn-atp-5', sport: 'TENNIS', leagueId: 'atp-tour', leagueName: 'ATP Dünya Turu Masters', leagueLogo: '🎾', country: 'Uluslararası', tvChannel: 'Eurosport 1', hName: 'Casper Ruud', hShort: 'RUU', hLogo: '🎾', aName: 'Holger Rune', aShort: 'RUN', aLogo: '🎾', time: '15:00', status: 'FINISHED', homeScore: 2, awayScore: 1, setScores: ['7-6', '4-6', '6-3'], ms1: 1.90, ms2: 1.90, totalPointsLine: 24.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'tn-atp-6', sport: 'TENNIS', leagueId: 'atp-tour', leagueName: 'ATP Dünya Turu Masters', leagueLogo: '🎾', country: 'Uluslararası', tvChannel: 'Eurosport 2', hName: 'Alex de Minaur', hShort: 'DEM', hLogo: '🎾', aName: 'Grigor Dimitrov', aShort: 'DIM', aLogo: '🎾', date: TOMORROW_DATE_STR, time: '14:00', ms1: 1.80, ms2: 2.00, totalPointsLine: 22.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'tn-atp-7', sport: 'TENNIS', leagueId: 'atp-tour', leagueName: 'ATP Dünya Turu Masters', leagueLogo: '🎾', country: 'Uluslararası', tvChannel: 'Eurosport 1', hName: 'Tommy Paul', hShort: 'PAU', hLogo: '🎾', aName: 'Ben Shelton', aShort: 'SHE', aLogo: '🎾', time: '19:30', ms1: 1.95, ms2: 1.85, totalPointsLine: 23.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'tn-wta-1', sport: 'TENNIS', leagueId: 'wta-tour', leagueName: 'WTA Dünya Turu', leagueLogo: '🎾', country: 'Uluslararası', tvChannel: 'beIN Sports 5', hName: 'Aryna Sabalenka', hShort: 'SAB', hLogo: '🎾', aName: 'Iga Swiatek', aShort: 'SWI', aLogo: '🎾', date: TOMORROW_DATE_STR, time: '18:30', ms1: 1.95, ms2: 1.85, totalPointsLine: 21.5, overTotalPoints: 1.85, underTotalPoints: 1.85, hot: true, ai: true }),
    createMatch({ id: 'tn-wta-2', sport: 'TENNIS', leagueId: 'wta-tour', leagueName: 'WTA Dünya Turu', leagueLogo: '🎾', country: 'Uluslararası', tvChannel: 'beIN Sports 5', hName: 'Coco Gauff', hShort: 'GAU', hLogo: '🎾', aName: 'Elena Rybakina', aShort: 'RYB', aLogo: '🎾', time: '17:00', ms1: 1.80, ms2: 2.05, totalPointsLine: 21.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'tn-wta-3', sport: 'TENNIS', leagueId: 'wta-tour', leagueName: 'WTA Dünya Turu', leagueLogo: '🎾', country: 'Uluslararası', tvChannel: 'beIN Sports MAX 1', hName: 'Jessica Pegula', hShort: 'PEG', hLogo: '🎾', aName: 'Zheng Qinwen', aShort: 'ZHE', aLogo: '🎾', date: TOMORROW_DATE_STR, time: '16:00', ms1: 1.90, ms2: 1.90, totalPointsLine: 21.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'tn-wta-4', sport: 'TENNIS', leagueId: 'wta-tour', leagueName: 'WTA Dünya Turu', leagueLogo: '🎾', country: 'Uluslararası', tvChannel: 'beIN Sports MAX 2', hName: 'Jasmine Paolini', hShort: 'PAO', hLogo: '🎾', aName: 'Mirra Andreeva', aShort: 'AND', aLogo: '🎾', time: '14:30', status: 'LIVE', homeScore: 1, awayScore: 0, setScores: ['6-3', '2-4'], ms1: 1.85, ms2: 1.95, totalPointsLine: 21.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'tn-wta-5', sport: 'TENNIS', leagueId: 'wta-tour', leagueName: 'WTA Dünya Turu', leagueLogo: '🎾', country: 'Uluslararası', tvChannel: 'beIN Sports 5', hName: 'Ons Jabeur', hShort: 'JAB', hLogo: '🎾', aName: 'Marketa Vondrousova', aShort: 'VON', aLogo: '🎾', date: TOMORROW_DATE_STR, time: '15:00', ms1: 2.00, ms2: 1.80, totalPointsLine: 22.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'tn-wta-6', sport: 'TENNIS', leagueId: 'wta-tour', leagueName: 'WTA Dünya Turu', leagueLogo: '🎾', country: 'Uluslararası', tvChannel: 'beIN Sports MAX 1', hName: 'Emma Navarro', hShort: 'NAV', hLogo: '🎾', aName: 'Danielle Collins', aShort: 'COL', aLogo: '🎾', time: '16:00', ms1: 1.95, ms2: 1.85, totalPointsLine: 21.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'tn-wta-7', sport: 'TENNIS', leagueId: 'wta-tour', leagueName: 'WTA Dünya Turu', leagueLogo: '🎾', country: 'Uluslararası', tvChannel: 'beIN Sports 5', hName: 'Daria Kasatkina', hShort: 'KAS', hLogo: '🎾', aName: 'Diana Shnaider', aShort: 'SHN', aLogo: '🎾', date: TOMORROW_DATE_STR, time: '13:30', ms1: 2.10, ms2: 1.72, totalPointsLine: 21.5, overTotalPoints: 1.85, underTotalPoints: 1.85 })
  );

  // 12. MASA TENİSİ - WTT CONTENDER (8 Maç)
  list.push(
    createMatch({ id: 'tt-wtt-1', sport: 'TABLE_TENNIS', leagueId: 'all', leagueName: 'WTT Champions Masa Tenisi', leagueLogo: '🏓', country: 'Uluslararası', tvChannel: 'WTT TV Live', hName: 'Fan Zhendong', hShort: 'FAN', hLogo: '🏓', aName: 'Wang Chuqin', aShort: 'WAN', aLogo: '🏓', time: '15:45', status: 'LIVE', homeScore: 2, awayScore: 1, setScores: ['11-9', '8-11', '11-7'], ms1: 1.75, ms2: 2.05, totalPointsLine: 74.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'tt-wtt-2', sport: 'TABLE_TENNIS', leagueId: 'all', leagueName: 'WTT Champions Masa Tenisi', leagueLogo: '🏓', country: 'Uluslararası', tvChannel: 'WTT TV Live', hName: 'Ma Long', hShort: 'MAL', hLogo: '🏓', aName: 'Tomokazu Harimoto', aShort: 'HAR', aLogo: '🏓', time: '16:30', ms1: 1.65, ms2: 2.20, totalPointsLine: 75.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'tt-wtt-3', sport: 'TABLE_TENNIS', leagueId: 'all', leagueName: 'WTT Champions Masa Tenisi', leagueLogo: '🏓', country: 'Uluslararası', tvChannel: 'WTT TV Live', hName: 'Lin Shidong', hShort: 'LIN', hLogo: '🏓', aName: 'Hugo Calderano', aShort: 'CAL', aLogo: '🏓', time: '17:15', ms1: 1.55, ms2: 2.45, totalPointsLine: 73.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'tt-wtt-4', sport: 'TABLE_TENNIS', leagueId: 'all', leagueName: 'WTT Champions Masa Tenisi', leagueLogo: '🏓', country: 'Uluslararası', tvChannel: 'WTT TV Live', hName: 'Sun Yingsha', hShort: 'SUN', hLogo: '🏓', aName: 'Chen Meng', aShort: 'CHE', aLogo: '🏓', date: TOMORROW_DATE_STR, time: '14:00', ms1: 1.45, ms2: 2.70, totalPointsLine: 72.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'tt-wtt-5', sport: 'TABLE_TENNIS', leagueId: 'all', leagueName: 'WTT Champions Masa Tenisi', leagueLogo: '🏓', country: 'Uluslararası', tvChannel: 'WTT TV Live', hName: 'Wang Manyu', hShort: 'MAN', hLogo: '🏓', aName: 'Hina Hayata', aShort: 'HAY', aLogo: '🏓', date: TOMORROW_DATE_STR, time: '15:00', ms1: 1.50, ms2: 2.55, totalPointsLine: 73.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'tt-wtt-6', sport: 'TABLE_TENNIS', leagueId: 'all', leagueName: 'WTT Champions Masa Tenisi', leagueLogo: '🏓', country: 'Uluslararası', tvChannel: 'WTT TV Live', hName: 'Mima Ito', hShort: 'ITO', hLogo: '🏓', aName: 'Miwa Harimoto', aShort: 'MIW', aLogo: '🏓', time: '18:00', ms1: 1.90, ms2: 1.90, totalPointsLine: 74.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'tt-wtt-7', sport: 'TABLE_TENNIS', leagueId: 'all', leagueName: 'WTT Champions Masa Tenisi', leagueLogo: '🏓', country: 'Uluslararası', tvChannel: 'WTT TV Live', hName: 'Truls Moregard', hShort: 'MOR', hLogo: '🏓', aName: 'Felix Lebrun', aShort: 'LEB', aLogo: '🏓', date: TOMORROW_DATE_STR, time: '16:00', ms1: 2.05, ms2: 1.75, totalPointsLine: 75.5, overTotalPoints: 1.85, underTotalPoints: 1.85 }),
    createMatch({ id: 'tt-wtt-8', sport: 'TABLE_TENNIS', leagueId: 'all', leagueName: 'WTT Champions Masa Tenisi', leagueLogo: '🏓', country: 'Uluslararası', tvChannel: 'WTT TV Live', hName: 'Alexis Lebrun', hShort: 'ALE', hLogo: '🏓', aName: 'Dang Qiu', aShort: 'QIU', aLogo: '🏓', date: TOMORROW_DATE_STR, time: '17:00', ms1: 1.80, ms2: 2.00, totalPointsLine: 74.5, overTotalPoints: 1.85, underTotalPoints: 1.85 })
  );

  return list;
}

export const FULL_COMPREHENSIVE_FIXTURES: Match[] = buildComprehensiveBulten();
