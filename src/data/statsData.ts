import { Match, TeamInfo, H2HRecord } from '../types/betting';
import { TEAMS_DATABASE } from './mockData';

export interface GoalIntervalData {
  interval: string; // e.g. "0'-15'"
  timeRange: string;
  goalsScored: number;
  goalsConceded: number;
  scoredPct: number;
  concededPct: number;
  avgScoredPerMatch: number;
  avgConcededPerMatch: number;
}

export interface TeamGoalHeatmapStats {
  teamId: string;
  teamName: string;
  teamLogo: string;
  totalMatches: number;
  totalGoalsScored: number;
  totalGoalsConceded: number;
  firstHalfGoalsPct: number;
  secondHalfGoalsPct: number;
  firstHalfConcededPct: number;
  secondHalfConcededPct: number;
  intervals: GoalIntervalData[];
  peakScoringInterval: string;
  peakConcedingInterval: string;
  aiInsights: string[];
}

export interface TeamDefensiveMetrics {
  teamId: string;
  teamName: string;
  teamLogo: string;
  matchesPlayed: number;
  cleanSheets: number;
  cleanSheetPct: number;
  goalsConcededTotal: number;
  goalsConcededAvg: number;
  xGA: number; // Expected Goals Against per match
  shotsConcededAvg: number;
  shotsOnTargetFacedAvg: number;
  tacklesPerMatch: number;
  interceptionsPerMatch: number;
  errorsLeadingToGoal: number;
  penaltiesConceded: number;
  defensiveRating: number; // 0 - 100
  defensiveStyle: string; // e.g., "Yüksek Pres & Dar Alan", "Kapanan & Kontra Saldırı"
}

export interface TeamComparisonData {
  team1: TeamInfo;
  team2: TeamInfo;
  defensiveStats1: TeamDefensiveMetrics;
  defensiveStats2: TeamDefensiveMetrics;
  h2hSummary: {
    totalMatches: number;
    team1Wins: number;
    team2Wins: number;
    draws: number;
    team1Goals: number;
    team2Goals: number;
    avgGoalsPerMatch: number;
  };
  recentH2H: H2HRecord[];
  aiAnalysis: string;
}

// Preset Goal Heatmap interval profiles for top teams
const TEAM_HEATMAP_PRESETS: Record<string, Partial<TeamGoalHeatmapStats>> = {
  'Galatasaray': {
    intervals: [
      { interval: "0'-15'", timeRange: "1-15 dk", goalsScored: 8, goalsConceded: 2, scoredPct: 15, concededPct: 10, avgScoredPerMatch: 0.33, avgConcededPerMatch: 0.08 },
      { interval: "16'-30'", timeRange: "16-30 dk", goalsScored: 11, goalsConceded: 3, scoredPct: 21, concededPct: 15, avgScoredPerMatch: 0.46, avgConcededPerMatch: 0.13 },
      { interval: "31'-45'+", timeRange: "31-45+ dk", goalsScored: 9, goalsConceded: 4, scoredPct: 17, concededPct: 20, avgScoredPerMatch: 0.38, avgConcededPerMatch: 0.17 },
      { interval: "46'-60'", timeRange: "46-60 dk", goalsScored: 7, goalsConceded: 3, scoredPct: 13, concededPct: 15, avgScoredPerMatch: 0.29, avgConcededPerMatch: 0.13 },
      { interval: "61'-75'", timeRange: "61-75 dk", goalsScored: 10, goalsConceded: 3, scoredPct: 19, concededPct: 15, avgScoredPerMatch: 0.42, avgConcededPerMatch: 0.13 },
      { interval: "76'-90'+", timeRange: "76-90+ dk", goalsScored: 15, goalsConceded: 5, scoredPct: 28, concededPct: 25, avgScoredPerMatch: 0.63, avgConcededPerMatch: 0.21 },
    ],
    peakScoringInterval: "76'-90'+",
    peakConcedingInterval: "76'-90'+",
    aiInsights: [
      "🔥 **Son 15 Dakika Baskısı (76'-90'+):** Galatasaray gollerinin %28'ini maçın son diliminde atıyor. İkinci yarı gol temposu oldukça yüksek.",
      "⚡ **Ön Baskı Etkisi (16'-30'):** Maçın ilk yarım saatinde rakip ceza sahası baskısıyla %36 gol oranına ulaşıyor.",
      "🎯 **Canlı İddaa Stratejisi:** Maçın 60. dakikasından sonra canlıda 'Sıradaki Gol' veya 'Toplam Gol 0.5 Üst' pazarında yüksek başarı yüzdesi gözlenmektedir."
    ]
  },
  'Fenerbahçe': {
    intervals: [
      { interval: "0'-15'", timeRange: "1-15 dk", goalsScored: 10, goalsConceded: 1, scoredPct: 19, concededPct: 6, avgScoredPerMatch: 0.42, avgConcededPerMatch: 0.04 },
      { interval: "16'-30'", timeRange: "16-30 dk", goalsScored: 9, goalsConceded: 3, scoredPct: 17, concededPct: 18, avgScoredPerMatch: 0.38, avgConcededPerMatch: 0.13 },
      { interval: "31'-45'+", timeRange: "31-45+ dk", goalsScored: 12, goalsConceded: 3, scoredPct: 23, concededPct: 18, avgScoredPerMatch: 0.50, avgConcededPerMatch: 0.13 },
      { interval: "46'-60'", timeRange: "46-60 dk", goalsScored: 8, goalsConceded: 2, scoredPct: 15, concededPct: 12, avgScoredPerMatch: 0.33, avgConcededPerMatch: 0.08 },
      { interval: "61'-75'", timeRange: "61-75 dk", goalsScored: 6, goalsConceded: 3, scoredPct: 11, concededPct: 18, avgScoredPerMatch: 0.25, avgConcededPerMatch: 0.13 },
      { interval: "76'-90'+", timeRange: "76-90+ dk", goalsScored: 13, goalsConceded: 5, scoredPct: 25, concededPct: 28, avgScoredPerMatch: 0.54, avgConcededPerMatch: 0.21 },
    ],
    peakScoringInterval: "76'-90'+",
    peakConcedingInterval: "76'-90'+",
    aiInsights: [
      "🚀 **Şok Başlangıçlar (0'-15'):** Fenerbahçe ilk 15 dakikada en çok gol bulan takımlardan biri (10 gol). İlk yarı 0.5 Üst oranı %82.",
      "🛡️ **İlk Yarı Erken Savunma:** Maçların ilk yarısında kalesinde az gol görüyor (%42 1. Yarı vs %58 2. Yarı).",
      "🎯 **Canlı İddaa Stratejisi:** 'İlk Yarı Fenerbahçe Gol Atar' seçeneği istatistiksel olarak en verimli pazardır."
    ]
  },
  'Beşiktaş': {
    intervals: [
      { interval: "0'-15'", timeRange: "1-15 dk", goalsScored: 5, goalsConceded: 4, scoredPct: 12, concededPct: 17, avgScoredPerMatch: 0.21, avgConcededPerMatch: 0.17 },
      { interval: "16'-30'", timeRange: "16-30 dk", goalsScored: 7, goalsConceded: 3, scoredPct: 17, concededPct: 13, avgScoredPerMatch: 0.29, avgConcededPerMatch: 0.13 },
      { interval: "31'-45'+", timeRange: "31-45+ dk", goalsScored: 8, goalsConceded: 5, scoredPct: 20, concededPct: 22, avgScoredPerMatch: 0.33, avgConcededPerMatch: 0.21 },
      { interval: "46'-60'", timeRange: "46-60 dk", goalsScored: 9, goalsConceded: 3, scoredPct: 22, concededPct: 13, avgScoredPerMatch: 0.38, avgConcededPerMatch: 0.13 },
      { interval: "61'-75'", timeRange: "61-75 dk", goalsScored: 6, goalsConceded: 4, scoredPct: 15, concededPct: 17, avgScoredPerMatch: 0.25, avgConcededPerMatch: 0.17 },
      { interval: "76'-90'+", timeRange: "76-90+ dk", goalsScored: 11, goalsConceded: 6, scoredPct: 27, concededPct: 26, avgScoredPerMatch: 0.46, avgConcededPerMatch: 0.25 },
    ],
    peakScoringInterval: "76'-90'+",
    peakConcedingInterval: "76'-90'+",
    aiInsights: [
      "⚡ **İkinci Yarı Hızı (46'-60'):** Soyunma odası dönüşü ilk 15 dakikada (46-60) skor üretme yüzdesi %22'ye yükseliyor.",
      "⚠️ **Geç Yenilen Gol Zafiyeti:** Son 15 dakikalık dilimde yenen gol oranı %26 ile savunma konsantrasyon kaybına işaret ediyor."
    ]
  },
  'Real Madrid': {
    intervals: [
      { interval: "0'-15'", timeRange: "1-15 dk", goalsScored: 6, goalsConceded: 2, scoredPct: 11, concededPct: 12, avgScoredPerMatch: 0.25, avgConcededPerMatch: 0.08 },
      { interval: "16'-30'", timeRange: "16-30 dk", goalsScored: 8, goalsConceded: 3, scoredPct: 15, concededPct: 18, avgScoredPerMatch: 0.33, avgConcededPerMatch: 0.13 },
      { interval: "31'-45'+", timeRange: "31-45+ dk", goalsScored: 10, goalsConceded: 3, scoredPct: 19, concededPct: 18, avgScoredPerMatch: 0.42, avgConcededPerMatch: 0.13 },
      { interval: "46'-60'", timeRange: "46-60 dk", goalsScored: 9, goalsConceded: 2, scoredPct: 17, concededPct: 12, avgScoredPerMatch: 0.38, avgConcededPerMatch: 0.08 },
      { interval: "61'-75'", timeRange: "61-75 dk", goalsScored: 11, goalsConceded: 2, scoredPct: 21, concededPct: 12, avgScoredPerMatch: 0.46, avgConcededPerMatch: 0.08 },
      { interval: "76'-90'+", timeRange: "76-90+ dk", goalsScored: 18, goalsConceded: 4, scoredPct: 34, concededPct: 24, avgScoredPerMatch: 0.75, avgConcededPerMatch: 0.17 },
    ],
    peakScoringInterval: "76'-90'+",
    peakConcedingInterval: "76'-90'+",
    aiInsights: [
      "👑 **Uzatmalar & Comeback Uzmanı (76'-90'+):** Real Madrid gollerinin %34'ünü maçın son 15 dakikasında kaydediyor. Dünyanın en yüksek son dakika bitiricilik oranına sahip.",
      "🛡️ **İkinci Yarı Kilit Savunma:** 46-75 dakikaları arasında toplam sadece 4 gol yiyerek rakiplerini oyundan düşürüyor."
    ]
  }
};

/**
 * Generate goal scoring heatmap statistics per 15-minute intervals for any team
 */
export function getTeamGoalHeatmapStats(teamName: string, logo?: string): TeamGoalHeatmapStats {
  const preset = TEAM_HEATMAP_PRESETS[teamName];
  if (preset && preset.intervals) {
    const totalScored = preset.intervals.reduce((a, b) => a + b.goalsScored, 0);
    const totalConceded = preset.intervals.reduce((a, b) => a + b.goalsConceded, 0);
    const firstHalfScored = preset.intervals.slice(0, 3).reduce((a, b) => a + b.goalsScored, 0);
    const secondHalfScored = preset.intervals.slice(3, 6).reduce((a, b) => a + b.goalsScored, 0);
    const firstHalfConceded = preset.intervals.slice(0, 3).reduce((a, b) => a + b.goalsConceded, 0);
    const secondHalfConceded = preset.intervals.slice(3, 6).reduce((a, b) => a + b.goalsConceded, 0);

    return {
      teamId: teamName.toLowerCase().replace(/\s+/g, '-'),
      teamName,
      teamLogo: logo || '⚽',
      totalMatches: 24,
      totalGoalsScored: totalScored,
      totalGoalsConceded: totalConceded,
      firstHalfGoalsPct: Math.round((firstHalfScored / (totalScored || 1)) * 100),
      secondHalfGoalsPct: Math.round((secondHalfScored / (totalScored || 1)) * 100),
      firstHalfConcededPct: Math.round((firstHalfConceded / (totalConceded || 1)) * 100),
      secondHalfConcededPct: Math.round((secondHalfConceded / (totalConceded || 1)) * 100),
      intervals: preset.intervals,
      peakScoringInterval: preset.peakScoringInterval || "76'-90'+",
      peakConcedingInterval: preset.peakConcedingInterval || "76'-90'+",
      aiInsights: preset.aiInsights || []
    };
  }

  // Fallback dynamic generator based on team name hash
  let hash = 0;
  for (let i = 0; i < teamName.length; i++) hash = teamName.charCodeAt(i) + ((hash << 5) - hash);
  hash = Math.abs(hash);

  const baseScored = [
    5 + (hash % 5),
    7 + ((hash >> 2) % 6),
    8 + ((hash >> 3) % 5),
    6 + ((hash >> 4) % 6),
    9 + ((hash >> 5) % 6),
    12 + ((hash >> 6) % 8)
  ];

  const baseConceded = [
    2 + (hash % 3),
    3 + ((hash >> 1) % 4),
    4 + ((hash >> 2) % 4),
    3 + ((hash >> 3) % 3),
    4 + ((hash >> 4) % 4),
    5 + ((hash >> 5) % 5)
  ];

  const totalScored = baseScored.reduce((a, b) => a + b, 0);
  const totalConceded = baseConceded.reduce((a, b) => a + b, 0);

  const intervals: GoalIntervalData[] = [
    { interval: "0'-15'", timeRange: "1-15 dk", goalsScored: baseScored[0], goalsConceded: baseConceded[0], scoredPct: Math.round((baseScored[0]/totalScored)*100), concededPct: Math.round((baseConceded[0]/totalConceded)*100), avgScoredPerMatch: Number((baseScored[0]/24).toFixed(2)), avgConcededPerMatch: Number((baseConceded[0]/24).toFixed(2)) },
    { interval: "16'-30'", timeRange: "16-30 dk", goalsScored: baseScored[1], goalsConceded: baseConceded[1], scoredPct: Math.round((baseScored[1]/totalScored)*100), concededPct: Math.round((baseConceded[1]/totalConceded)*100), avgScoredPerMatch: Number((baseScored[1]/24).toFixed(2)), avgConcededPerMatch: Number((baseConceded[1]/24).toFixed(2)) },
    { interval: "31'-45'+", timeRange: "31-45+ dk", goalsScored: baseScored[2], goalsConceded: baseConceded[2], scoredPct: Math.round((baseScored[2]/totalScored)*100), concededPct: Math.round((baseConceded[2]/totalConceded)*100), avgScoredPerMatch: Number((baseScored[2]/24).toFixed(2)), avgConcededPerMatch: Number((baseConceded[2]/24).toFixed(2)) },
    { interval: "46'-60'", timeRange: "46-60 dk", goalsScored: baseScored[3], goalsConceded: baseConceded[3], scoredPct: Math.round((baseScored[3]/totalScored)*100), concededPct: Math.round((baseConceded[3]/totalConceded)*100), avgScoredPerMatch: Number((baseScored[3]/24).toFixed(2)), avgConcededPerMatch: Number((baseConceded[3]/24).toFixed(2)) },
    { interval: "61'-75'", timeRange: "61-75 dk", goalsScored: baseScored[4], goalsConceded: baseConceded[4], scoredPct: Math.round((baseScored[4]/totalScored)*100), concededPct: Math.round((baseConceded[4]/totalConceded)*100), avgScoredPerMatch: Number((baseScored[4]/24).toFixed(2)), avgConcededPerMatch: Number((baseConceded[4]/24).toFixed(2)) },
    { interval: "76'-90'+", timeRange: "76-90+ dk", goalsScored: baseScored[5], goalsConceded: baseConceded[5], scoredPct: Math.round((baseScored[5]/totalScored)*100), concededPct: Math.round((baseConceded[5]/totalConceded)*100), avgScoredPerMatch: Number((baseScored[5]/24).toFixed(2)), avgConcededPerMatch: Number((baseConceded[5]/24).toFixed(2)) }
  ];

  const firstHalfScored = intervals.slice(0, 3).reduce((a, b) => a + b.goalsScored, 0);
  const secondHalfScored = intervals.slice(3, 6).reduce((a, b) => a + b.goalsScored, 0);
  const firstHalfConceded = intervals.slice(0, 3).reduce((a, b) => a + b.goalsConceded, 0);
  const secondHalfConceded = intervals.slice(3, 6).reduce((a, b) => a + b.goalsConceded, 0);

  return {
    teamId: teamName.toLowerCase().replace(/\s+/g, '-'),
    teamName,
    teamLogo: logo || '⚽',
    totalMatches: 24,
    totalGoalsScored: totalScored,
    totalGoalsConceded: totalConceded,
    firstHalfGoalsPct: Math.round((firstHalfScored / (totalScored || 1)) * 100),
    secondHalfGoalsPct: Math.round((secondHalfScored / (totalScored || 1)) * 100),
    firstHalfConcededPct: Math.round((firstHalfConceded / (totalConceded || 1)) * 100),
    secondHalfConcededPct: Math.round((secondHalfConceded / (totalConceded || 1)) * 100),
    intervals,
    peakScoringInterval: "76'-90'+",
    peakConcedingInterval: "76'-90'+",
    aiInsights: [
      `🔥 **En Üretken Periyot (76'-90'+):** ${teamName} maç sonlarında baskıyı artırıyor (atılan gollerin %${intervals[5].scoredPct}'i).`,
      `🛡️ **Dengeli Savunma Dağılımı:** 1. Yarı kalesinde gördüğü gol oranı %${Math.round((firstHalfConceded/(totalConceded||1))*100)} seviyesindedir.`,
      `🎯 **Stratejik İpucu:** Maçın 2. yarısında gol olma olasılığı daha yüksektir.`
    ]
  };
}

// Defensive Metrics Generator for Teams
export function getTeamDefensiveMetrics(teamName: string, logo?: string): TeamDefensiveMetrics {
  let hash = 0;
  for (let i = 0; i < teamName.length; i++) hash = teamName.charCodeAt(i) + ((hash << 5) - hash);
  hash = Math.abs(hash);

  const isTopTeam = ['Galatasaray', 'Fenerbahçe', 'Real Madrid', 'Manchester City', 'Arsenal', 'Inter', 'Bayern Munich', 'Barcelona', 'PSG', 'Liverpool'].some(t => teamName.includes(t));

  const cleanSheetPct = isTopTeam ? 42 + (hash % 16) : 25 + (hash % 18);
  const goalsConcededAvg = isTopTeam ? Number((0.7 + (hash % 5) * 0.1).toFixed(2)) : Number((1.2 + (hash % 7) * 0.1).toFixed(2));
  const xGA = Number((goalsConcededAvg + ((hash % 3) - 1) * 0.08).toFixed(2));
  const shotsConcededAvg = isTopTeam ? Number((8.2 + (hash % 4)).toFixed(1)) : Number((12.5 + (hash % 6)).toFixed(1));
  const shotsOnTargetFacedAvg = Number((shotsConcededAvg * 0.32).toFixed(1));
  const tacklesPerMatch = Number((16.5 + (hash % 6)).toFixed(1));
  const interceptionsPerMatch = Number((11.2 + (hash % 5)).toFixed(1));
  const errorsLeadingToGoal = isTopTeam ? (hash % 2) : 2 + (hash % 3);
  const penaltiesConceded = (hash % 3);
  const defensiveRating = isTopTeam ? 82 + (hash % 14) : 62 + (hash % 20);

  const styles = [
    'Yüksek Pres & Ön Blok Kesim',
    'Kapanan Hat & Alan Daraltma',
    'Kademeli Yan Top Blokajı',
    'Dinamik Kanat Kademesi'
  ];

  return {
    teamId: teamName.toLowerCase().replace(/\s+/g, '-'),
    teamName,
    teamLogo: logo || '⚽',
    matchesPlayed: 24,
    cleanSheets: Math.round((24 * cleanSheetPct) / 100),
    cleanSheetPct,
    goalsConcededTotal: Math.round(24 * goalsConcededAvg),
    goalsConcededAvg,
    xGA,
    shotsConcededAvg,
    shotsOnTargetFacedAvg,
    tacklesPerMatch,
    interceptionsPerMatch,
    errorsLeadingToGoal,
    penaltiesConceded,
    defensiveRating,
    defensiveStyle: styles[hash % styles.length]
  };
}

// Generate Side-by-Side Comparison Data
export function getTeamComparisonData(team1: TeamInfo, team2: TeamInfo, matchMatches?: Match[]): TeamComparisonData {
  const def1 = getTeamDefensiveMetrics(team1.name, team1.logo);
  const def2 = getTeamDefensiveMetrics(team2.name, team2.logo);

  // Generate or find H2H records
  let h2h: H2HRecord[] = [];
  
  // Search in fixture match list if exists
  const existingMatch = matchMatches?.find(m => 
    (m.homeTeam.name === team1.name && m.awayTeam.name === team2.name) ||
    (m.homeTeam.name === team2.name && m.awayTeam.name === team1.name)
  );

  if (existingMatch && existingMatch.h2h && existingMatch.h2h.length > 0) {
    h2h = existingMatch.h2h;
  } else {
    // Generate realistic H2H matches between these 2 teams
    h2h = [
      { date: '2025-12-14', homeScore: 2, awayScore: 1, winner: 'home', league: team1.leagueName, goalScorers: `${team1.shortName}: 34' Icardi, 78' Barış; ${team2.shortName}: 62' Dzeko` },
      { date: '2025-05-19', homeScore: 0, awayScore: 1, winner: 'away', league: team1.leagueName, goalScorers: `${team2.shortName}: 71' Çağlar` },
      { date: '2024-12-24', homeScore: 0, awayScore: 0, winner: 'draw', league: team1.leagueName },
      { date: '2024-04-07', homeScore: 3, awayScore: 0, winner: 'home', league: team1.leagueName },
      { date: '2023-06-04', homeScore: 3, awayScore: 0, winner: 'home', league: team1.leagueName }
    ];
  }

  let team1Wins = 0;
  let team2Wins = 0;
  let draws = 0;
  let team1Goals = 0;
  let team2Goals = 0;

  h2h.forEach(record => {
    // assume home was team1 if not specified
    if (record.winner === 'home') team1Wins++;
    else if (record.winner === 'away') team2Wins++;
    else draws++;

    team1Goals += record.homeScore;
    team2Goals += record.awayScore;
  });

  const totalMatches = h2h.length || 5;
  const avgGoalsPerMatch = Number(((team1Goals + team2Goals) / (totalMatches || 1)).toFixed(2));

  const defLeader = def1.defensiveRating >= def2.defensiveRating ? team1.name : team2.name;
  const xgaLeader = def1.xGA <= def2.xGA ? team1.name : team2.name;

  const aiAnalysis = `🛡️ **Defans Kıyaslaması:** ${defLeader}, defans güç skoru (${Math.max(def1.defensiveRating, def2.defensiveRating)}/100) ve kalede beklenilen gol (xGA) verisinde rakipten daha sağlam görünmektedir. ${xgaLeader} kalesinde daha az net pozisyon veriyor. İki takım arasındaki son H2H maçlarında ortalama ${avgGoalsPerMatch} gol kaydedilmiştir.`;

  return {
    team1,
    team2,
    defensiveStats1: def1,
    defensiveStats2: def2,
    h2hSummary: {
      totalMatches,
      team1Wins,
      team2Wins,
      draws,
      team1Goals,
      team2Goals,
      avgGoalsPerMatch
    },
    recentH2H: h2h,
    aiAnalysis
  };
}
