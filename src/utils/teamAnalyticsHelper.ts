import { Match, TeamInfo } from '../types/betting';

export interface MatchHistoryItem {
  matchIndex: number;
  label: string; // e.g. "M-5", "M-4", ... "M-1"
  date: string;
  opponent: string;
  isHome: boolean;
  score: string;
  goalsFor: number;
  goalsAgainst: number;
  result: 'W' | 'D' | 'L';
  points: number; // 3, 1, 0
  cumulativePoints: number;
  xg: number;
}

export interface GoalIntervalData {
  interval: string; // "0-15'", "16-30'", "31-45'", "46-60'", "61-75'", "76-90+'"
  homeScored: number;
  homeConceded: number;
  awayScored: number;
  awayConceded: number;
  totalGoals: number;
}

export interface TeamTrendMetrics {
  teamName: string;
  avgGoalsScored: number;
  avgGoalsConceded: number;
  avgXg: number;
  cleanSheetRate: number; // %
  over25Rate: number; // %
  bttsRate: number; // %
  firstHalfGoalRate: number; // %
  secondHalfGoalRate: number; // %
  mostDangerousPeriod: string;
}

export interface MatchAnalyticsData {
  homeHistory: MatchHistoryItem[];
  awayHistory: MatchHistoryItem[];
  combinedTrendPoints: {
    matchLabel: string;
    homePoints: number;
    awayPoints: number;
    homeCumPoints: number;
    awayCumPoints: number;
    homeGoals: number;
    awayGoals: number;
  }[];
  goalIntervals: GoalIntervalData[];
  homeMetrics: TeamTrendMetrics;
  awayMetrics: TeamTrendMetrics;
  h2hSummary: {
    homeWins: number;
    draws: number;
    awayWins: number;
    totalMatches: number;
    avgTotalGoals: number;
  };
}

// Pseudo-deterministic random generator based on string seed
function seedRandom(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return function () {
    hash = (hash * 9301 + 49297) % 233280;
    return Math.abs(hash / 233280);
  };
}

function getLeagueOpponents(teamName: string, leagueName?: string, country?: string): string[] {
  const league = (leagueName || '').toLowerCase();
  const cntry = (country || '').toLowerCase();

  let pool: string[] = [];

  if (league.includes('süper lig') || league.includes('türkiye') || cntry.includes('türkiye') || cntry.includes('turkey')) {
    pool = ['Galatasaray', 'Fenerbahçe', 'Beşiktaş', 'Trabzonspor', 'Başakşehir', 'Samsunspor', 'Antalyaspor', 'Kasımpaşa', 'Göztepe', 'Rizespor', 'Alanyaspor', 'Konyaspor', 'Sivasspor', 'Gaziantep FK', 'Kayserispor', 'Bodrum FK'];
  } else if (league.includes('premier') || cntry.includes('england') || cntry.includes('ingiltere')) {
    pool = ['Arsenal', 'Liverpool', 'Manchester City', 'Chelsea', 'Tottenham', 'Newcastle United', 'Aston Villa', 'Brighton', 'West Ham', 'Wolverhampton', 'Everton', 'Fulham', 'Brentford', 'Crystal Palace'];
  } else if (league.includes('laliga') || league.includes('ispanya') || cntry.includes('spain')) {
    pool = ['Real Madrid', 'FC Barcelona', 'Atlético Madrid', 'Athletic Bilbao', 'Real Sociedad', 'Villarreal', 'Real Betis', 'Sevilla', 'Valencia', 'Girona', 'Alavés', 'Elche'];
  } else if (league.includes('bundesliga') || cntry.includes('germany') || cntry.includes('almanya')) {
    pool = ['Bayern Münih', 'Bayer Leverkusen', 'Borussia Dortmund', 'RB Leipzig', 'Eintracht Frankfurt', 'VfB Stuttgart', 'Wolfsburg', 'Mönchengladbach'];
  } else if (league.includes('serie a') || cntry.includes('italy') || cntry.includes('italya')) {
    pool = ['Inter', 'AC Milan', 'Juventus', 'Napoli', 'Atalanta', 'Roma', 'Lazio', 'Fiorentina', 'Bologna', 'Torino', 'Venezia'];
  } else if (league.includes('ligue 1') || cntry.includes('france') || cntry.includes('fransa')) {
    pool = ['PSG', 'AS Monaco', 'Lille', 'Marseille', 'Olympique Lyon', 'Nice', 'Rennes', 'RC Lens'];
  } else if (league.includes('euroleague') || league.includes('nba') || league.includes('basket')) {
    pool = ['Real Madrid Baloncesto', 'Panathinaikos', 'Olympiakos', 'Fenerbahçe Beko', 'Anadolu Efes', 'Barcelona Basket', 'Monaco Basket', 'Maccabi Tel Aviv', 'EA7 Emporio Armani Milan'];
  } else {
    pool = ['Rakip A', 'Rakip B', 'Rakip C', 'Rakip D', 'Rakip E'];
  }

  return pool.filter(op => op.toLowerCase() !== teamName.toLowerCase());
}

export function getMatchAnalyticsData(match: Match): MatchAnalyticsData {
  const home = match.homeTeam;
  const away = match.awayTeam;
  const rng = seedRandom(`${home.id || home.name}-${away.id || away.name}-${match.id}`);

  // 1. Generate Last 5 Matches for Home Team with League-Accurate Opponents
  const homeForms = home.form && home.form.length >= 5 ? home.form : (['W', 'W', 'D', 'W', 'L'] as ('W' | 'D' | 'L')[]);
  let homeCum = 0;
  const homeOpponents = getLeagueOpponents(home.name, match.leagueName, match.country);

  const homeHistory: MatchHistoryItem[] = homeForms.slice(-5).map((result, idx) => {
    const availableOpps = homeOpponents.filter(op => op.toLowerCase() !== away.name.toLowerCase());
    const opp = availableOpps[Math.floor(rng() * availableOpps.length)] || 'Rakip';
    const isHome = idx % 2 === 0;
    let gf = 0;
    let ga = 0;

    if (result === 'W') {
      gf = Math.floor(rng() * 3) + 1; // 1-3
      ga = Math.floor(rng() * Math.min(gf, 2));
      if (gf <= ga) gf = ga + 1;
    } else if (result === 'D') {
      gf = Math.floor(rng() * 3);
      ga = gf;
    } else {
      ga = Math.floor(rng() * 3) + 1;
      gf = Math.floor(rng() * ga);
    }

    const pts = result === 'W' ? 3 : result === 'D' ? 1 : 0;
    homeCum += pts;

    return {
      matchIndex: idx + 1,
      label: `Hafta ${30 - (4 - idx)}`,
      date: `2026-0${Math.floor(rng() * 2) + 2}-${Math.floor(rng() * 20) + 10}`,
      opponent: opp,
      isHome,
      score: `${gf}-${ga}`,
      goalsFor: gf,
      goalsAgainst: ga,
      result,
      points: pts,
      cumulativePoints: homeCum,
      xg: parseFloat((0.8 + rng() * 1.8).toFixed(2))
    };
  });

  // 2. Generate Last 5 Matches for Away Team with League-Accurate Opponents
  const awayForms = away.form && away.form.length >= 5 ? away.form : (['D', 'W', 'L', 'W', 'W'] as ('W' | 'D' | 'L')[]);
  let awayCum = 0;
  const awayOpponents = getLeagueOpponents(away.name, match.leagueName, match.country);

  const awayHistory: MatchHistoryItem[] = awayForms.slice(-5).map((result, idx) => {
    const availableOpps = awayOpponents.filter(op => op.toLowerCase() !== home.name.toLowerCase());
    const opp = availableOpps[Math.floor(rng() * availableOpps.length)] || 'Rakip';
    const isHome = idx % 2 === 1;
    let gf = 0;
    let ga = 0;

    if (result === 'W') {
      gf = Math.floor(rng() * 3) + 1;
      ga = Math.floor(rng() * Math.min(gf, 2));
      if (gf <= ga) gf = ga + 1;
    } else if (result === 'D') {
      gf = Math.floor(rng() * 3);
      ga = gf;
    } else {
      ga = Math.floor(rng() * 3) + 1;
      gf = Math.floor(rng() * ga);
    }

    const pts = result === 'W' ? 3 : result === 'D' ? 1 : 0;
    awayCum += pts;

    return {
      matchIndex: idx + 1,
      label: `Hafta ${30 - (4 - idx)}`,
      date: `2026-0${Math.floor(rng() * 2) + 2}-${Math.floor(rng() * 20) + 10}`,
      opponent: opp,
      isHome,
      score: `${gf}-${ga}`,
      goalsFor: gf,
      goalsAgainst: ga,
      result,
      points: pts,
      cumulativePoints: awayCum,
      xg: parseFloat((0.7 + rng() * 1.6).toFixed(2))
    };
  });

  // Combined progression for recharts
  const combinedTrendPoints = homeHistory.map((h, i) => {
    const a = awayHistory[i] || { points: 0, cumulativePoints: 0, goalsFor: 0 };
    return {
      matchLabel: `M-${5 - i}`,
      homePoints: h.points,
      awayPoints: a.points,
      homeCumPoints: h.cumulativePoints,
      awayCumPoints: a.cumulativePoints,
      homeGoals: h.goalsFor,
      awayGoals: a.goalsFor
    };
  });

  // 3. Goal Distribution in 15-Minute Intervals (Season Trends)
  const intervals = ["0-15'", "16-30'", "31-45'", "46-60'", "61-75'", "76-90+'"];
  const homeScoredDistribution = [
    Math.round(4 + rng() * 4),
    Math.round(6 + rng() * 5),
    Math.round(9 + rng() * 6),
    Math.round(7 + rng() * 5),
    Math.round(11 + rng() * 7),
    Math.round(14 + rng() * 8)
  ];
  const homeConcededDistribution = [
    Math.round(2 + rng() * 3),
    Math.round(4 + rng() * 4),
    Math.round(6 + rng() * 4),
    Math.round(5 + rng() * 4),
    Math.round(8 + rng() * 5),
    Math.round(9 + rng() * 6)
  ];
  const awayScoredDistribution = [
    Math.round(3 + rng() * 4),
    Math.round(5 + rng() * 4),
    Math.round(8 + rng() * 5),
    Math.round(6 + rng() * 5),
    Math.round(9 + rng() * 6),
    Math.round(12 + rng() * 7)
  ];
  const awayConcededDistribution = [
    Math.round(3 + rng() * 3),
    Math.round(5 + rng() * 4),
    Math.round(7 + rng() * 5),
    Math.round(6 + rng() * 4),
    Math.round(8 + rng() * 5),
    Math.round(11 + rng() * 6)
  ];

  const goalIntervals: GoalIntervalData[] = intervals.map((interval, i) => ({
    interval,
    homeScored: homeScoredDistribution[i],
    homeConceded: homeConcededDistribution[i],
    awayScored: awayScoredDistribution[i],
    awayConceded: awayConcededDistribution[i],
    totalGoals: homeScoredDistribution[i] + awayScoredDistribution[i]
  }));

  // 4. Metrics Calculation
  const homeGfTotal = homeHistory.reduce((acc, m) => acc + m.goalsFor, 0);
  const homeGaTotal = homeHistory.reduce((acc, m) => acc + m.goalsAgainst, 0);
  const awayGfTotal = awayHistory.reduce((acc, m) => acc + m.goalsFor, 0);
  const awayGaTotal = awayHistory.reduce((acc, m) => acc + m.goalsAgainst, 0);

  const homeCleanSheets = homeHistory.filter(m => m.goalsAgainst === 0).length;
  const awayCleanSheets = awayHistory.filter(m => m.goalsAgainst === 0).length;

  const homeOver25 = homeHistory.filter(m => m.goalsFor + m.goalsAgainst > 2.5).length;
  const awayOver25 = awayHistory.filter(m => m.goalsFor + m.goalsAgainst > 2.5).length;

  const homeBtts = homeHistory.filter(m => m.goalsFor > 0 && m.goalsAgainst > 0).length;
  const awayBtts = awayHistory.filter(m => m.goalsFor > 0 && m.goalsAgainst > 0).length;

  const homeMetrics: TeamTrendMetrics = {
    teamName: home.name,
    avgGoalsScored: parseFloat((homeGfTotal / 5).toFixed(1)),
    avgGoalsConceded: parseFloat((homeGaTotal / 5).toFixed(1)),
    avgXg: parseFloat((homeHistory.reduce((a, b) => a + b.xg, 0) / 5).toFixed(2)),
    cleanSheetRate: Math.round((homeCleanSheets / 5) * 100),
    over25Rate: Math.round((homeOver25 / 5) * 100),
    bttsRate: Math.round((homeBtts / 5) * 100),
    firstHalfGoalRate: Math.round(45 + rng() * 30),
    secondHalfGoalRate: Math.round(65 + rng() * 25),
    mostDangerousPeriod: "76-90+'"
  };

  const awayMetrics: TeamTrendMetrics = {
    teamName: away.name,
    avgGoalsScored: parseFloat((awayGfTotal / 5).toFixed(1)),
    avgGoalsConceded: parseFloat((awayGaTotal / 5).toFixed(1)),
    avgXg: parseFloat((awayHistory.reduce((a, b) => a + b.xg, 0) / 5).toFixed(2)),
    cleanSheetRate: Math.round((awayCleanSheets / 5) * 100),
    over25Rate: Math.round((awayOver25 / 5) * 100),
    bttsRate: Math.round((awayBtts / 5) * 100),
    firstHalfGoalRate: Math.round(40 + rng() * 30),
    secondHalfGoalRate: Math.round(60 + rng() * 30),
    mostDangerousPeriod: "61-75'"
  };

  return {
    homeHistory,
    awayHistory,
    combinedTrendPoints,
    goalIntervals,
    homeMetrics,
    awayMetrics,
    h2hSummary: {
      homeWins: Math.floor(rng() * 4) + 2,
      draws: Math.floor(rng() * 3) + 1,
      awayWins: Math.floor(rng() * 3) + 1,
      totalMatches: 8,
      avgTotalGoals: parseFloat((2.4 + rng() * 1.2).toFixed(1))
    }
  };
}
