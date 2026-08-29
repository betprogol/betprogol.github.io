export type MatchStatus = 'NOT_STARTED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'HALFTIME';

export type SportType = 'FOOTBALL' | 'BASKETBALL' | 'VOLLEYBALL' | 'TENNIS' | 'TABLE_TENNIS' | 'HANDBALL';

export type ApiProviderType = 'ALL' | 'APISPORTS' | 'RAPIDAPI' | 'FOOTBALL_DATA' | 'WEB_SEARCH';

export interface Odds {
  ms1: number;
  msX?: number; // Basketball / Volleyball may not have draw
  ms2: number;
  over25?: number; // Total points/goals line
  under25?: number;
  bttsYes?: number;
  bttsNo?: number;
  totalPointsLine?: number; // e.g. 165.5 for basketball, 178.5 for volleyball
  overTotalPoints?: number;
  underTotalPoints?: number;
  handicapHome?: number; // e.g. -4.5
  handicapHomeOdds?: number;
  handicapAwayOdds?: number;
  doubleChance1X?: number;
  doubleChance12?: number;
  doubleChanceX2?: number;
  over15?: number;
  under15?: number;
  over35?: number;
  under35?: number;
  iy1?: number;
  iyX?: number;
  iy2?: number;
  tg01?: number;
  tg23?: number;
  tg45?: number;
  tg6plus?: number;
  // Basketball Specific Markets
  q1_1?: number;
  q1_x?: number;
  q1_2?: number;
  q1_line?: number; // e.g. 41.5
  q1_over?: number;
  q1_under?: number;
  q2_1?: number;
  q2_x?: number;
  q2_2?: number;
  q2_line?: number; // e.g. 40.5
  q2_over?: number;
  q2_under?: number;
  q3_1?: number;
  q3_x?: number;
  q3_2?: number;
  q3_line?: number;
  q3_over?: number;
  q3_under?: number;
  q4_1?: number;
  q4_x?: number;
  q4_2?: number;
  q4_line?: number;
  q4_over?: number;
  q4_under?: number;
  ht_1?: number; // Half-Time 1
  ht_x?: number; // Half-Time X
  ht_2?: number; // Half-Time 2
  ht_line?: number; // Half-Time total points line e.g. 82.5
  ht_over?: number;
  ht_under?: number;
  // Volleyball Specific Markets
  set1_1?: number;
  set1_2?: number;
  set1_line?: number; // e.g. 45.5
  set1_over?: number;
  set1_under?: number;
  set2_1?: number;
  set2_2?: number;
  set2_line?: number;
  set2_over?: number;
  set2_under?: number;
  set3_1?: number;
  set3_2?: number;
  set3_line?: number;
  set3_over?: number;
  set3_under?: number;
  set4_1?: number;
  set4_2?: number;
  handicapSetsLine?: number; // e.g. -1.5
  handicapSetsHome?: number;
  handicapSetsAway?: number;
  total_sets_line?: number; // e.g. 3.5
  total_sets_over?: number;
  total_sets_under?: number;
  setScore_30?: number;
  setScore_31?: number;
  setScore_32?: number;
  setScore_03?: number;
  setScore_13?: number;
  setScore_23?: number;
  // Tennis Markets
  tennis_set1_1?: number;
  tennis_set1_2?: number;
  tennis_set2_1?: number;
  tennis_set2_2?: number;
  tennis_games_line?: number; // e.g. 21.5
  tennis_games_over?: number;
  tennis_games_under?: number;
}

export interface MatchEvent {
  id: string;
  minute: number;
  extraMinute?: number;
  type: 'GOAL' | 'RED_CARD' | 'YELLOW_CARD' | 'PENALTY' | 'VAR' | 'SUBSTITUTION' | 'WHISTLE';
  team: 'home' | 'away';
  player: string;
  description: string;
}

export interface MatchStats {
  possession: [number, number]; // [home, away] e.g. [58, 42]
  shotsTotal: [number, number];
  shotsOnTarget: [number, number];
  xg: [number, number];
  corners: [number, number];
  fouls: [number, number];
  yellowCards: [number, number];
  redCards: [number, number];
  dangerousAttacks: [number, number];
}

export interface H2HRecord {
  date: string;
  homeScore: number;
  awayScore: number;
  winner: 'home' | 'away' | 'draw';
  league: string;
  goalScorers?: string;
}

export interface TeamInfo {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  form: ('W' | 'D' | 'L')[];
  leagueRank?: number;
  points?: number;
  leagueId: string;
  leagueName: string;
  country: string;
  primaryColor?: string;
  missingPlayers?: { name: string; reason: 'Injury' | 'Suspended' | 'Doubtful'; importance: 'High' | 'Medium' }[];
}

export interface Match {
  id: string;
  sport?: SportType; // 'FOOTBALL' | 'BASKETBALL' | 'VOLLEYBALL' | 'TENNIS' | 'TABLE_TENNIS' | 'HANDBALL'
  matchCode?: string; // e.g. "541289" official iddaa code
  mbs?: number; // 1, 2, 3 (Minimum Bahis Sayısı)
  hasLiveBet?: boolean; // Canlı İddaa
  hasKralOran?: boolean; // 👑 Kral Oran (Özel yüksek oran)
  hasLiveStream?: boolean; // 📺 Canlı Yayın
  tvChannel?: string; // "beIN Sports 1", "Exxen", "S Sport", "TRT Spor Yıldız"
  marketsCount?: number; // "+142 Market"
  leagueId: string;
  leagueName: string;
  leagueLogo: string;
  country: string;
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  date: string; // ISO or YYYY-MM-DD
  time: string; // "20:00"
  status: MatchStatus;
  minute?: number;
  homeScore?: number;
  awayScore?: number;
  halftimeScore?: [number, number];
  quarterScores?: string[]; // e.g. ["24-20", "22-26", "28-19", "25-22"] for basketball
  setScores?: string[]; // e.g. ["25-21", "23-25", "25-18", "25-20"] for volleyball
  odds: Odds;
  events?: MatchEvent[];
  stats?: MatchStats;
  h2h?: H2HRecord[];
  stadium?: string;
  referee?: string;
  hotMatch?: boolean;
  aiSuggested?: boolean;
  apiProviderSource?: string;
}

export type BetMarket = 
  | 'MS1' 
  | 'MSX' 
  | 'MS2' 
  | 'OVER_25' 
  | 'UNDER_25' 
  | 'OVER_15' 
  | 'UNDER_15' 
  | 'OVER_35' 
  | 'UNDER_35' 
  | 'BTTS_YES' 
  | 'BTTS_NO' 
  | 'OVER_TOTAL_POINTS'
  | 'UNDER_TOTAL_POINTS'
  | 'HANDICAP_HOME'
  | 'HANDICAP_AWAY'
  | 'DC_1X' 
  | 'DC_12' 
  | 'DC_X2'
  | 'IY_1'
  | 'IY_X'
  | 'IY_2'
  | 'TG_01'
  | 'TG_23'
  | 'TG_45'
  | 'TG_6PLUS'
  // Basketball Markets
  | 'Q1_1'
  | 'Q1_X'
  | 'Q1_2'
  | 'Q1_OVER'
  | 'Q1_UNDER'
  | 'Q2_1'
  | 'Q2_X'
  | 'Q2_2'
  | 'Q2_OVER'
  | 'Q2_UNDER'
  | 'Q3_1'
  | 'Q3_X'
  | 'Q3_2'
  | 'Q3_OVER'
  | 'Q3_UNDER'
  | 'Q4_1'
  | 'Q4_X'
  | 'Q4_2'
  | 'Q4_OVER'
  | 'Q4_UNDER'
  | 'HT_1'
  | 'HT_X'
  | 'HT_2'
  | 'HT_OVER'
  | 'HT_UNDER'
  // Volleyball Markets
  | 'SET1_1'
  | 'SET1_2'
  | 'SET1_OVER'
  | 'SET1_UNDER'
  | 'SET2_1'
  | 'SET2_2'
  | 'SET2_OVER'
  | 'SET2_UNDER'
  | 'SET3_1'
  | 'SET3_2'
  | 'SET3_OVER'
  | 'SET3_UNDER'
  | 'SET4_1'
  | 'SET4_2'
  | 'HANDICAP_SETS_HOME'
  | 'HANDICAP_SETS_AWAY'
  | 'TOTAL_SETS_OVER'
  | 'TOTAL_SETS_UNDER'
  | 'SET_SCORE_30'
  | 'SET_SCORE_31'
  | 'SET_SCORE_32'
  | 'SET_SCORE_03'
  | 'SET_SCORE_13'
  | 'SET_SCORE_23'
  // Tennis Markets
  | 'TENNIS_SET1_1'
  | 'TENNIS_SET1_2'
  | 'TENNIS_SET2_1'
  | 'TENNIS_SET2_2'
  | 'TENNIS_GAMES_OVER'
  | 'TENNIS_GAMES_UNDER';

export interface BetSelection {
  matchId: string;
  match: Match;
  market: BetMarket;
  marketLabel: string;
  odds: number;
}

export interface BetSlipSelection {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  matchTime?: string;
  leagueName?: string;
  leagueLogo?: string;
  matchCode?: string;
  mbs?: number;
  tvChannel?: string;
  sport?: SportType;
  market: BetMarket;
  marketLabel: string;
  odds: number;
  status: 'PENDING' | 'WON' | 'LOST';
  finalScore?: string;
  liveMinute?: number;
  liveScore?: string;
  matchStatus?: MatchStatus;
}

export type SlipStatus = 'PENDING' | 'WON' | 'LOST' | 'CASHED_OUT';

export interface BetSlip {
  id: string;
  createdAt: string;
  type: 'SINGLE' | 'COMBINED' | 'SYSTEM';
  selections: BetSlipSelection[];
  totalOdds: number;
  stake: number;
  potentialPayout: number;
  status: SlipStatus;
  actualPayout?: number;
  cashoutOffer?: number;
  note?: string;
  isAiGenerated?: boolean;
}

export interface ProCoupon {
  id: string;
  title: string;
  author: string;
  avatar: string;
  badge: 'AI BOT' | 'VIP TIPSTER' | 'BANKO UZMANI' | 'SÜRPRİZ AVCISI' | 'AI ANALİZ' | 'GOL ANALİZ' | 'PRO SEÇİM' | string;
  winRate: number;
  description: string;
  totalOdds: number;
  matchCount: number;
  likes: number;
  copiesCount: number;
  selections: {
    homeTeam: string;
    awayTeam: string;
    league: string;
    marketLabel: string;
    odds: number;
    analysis: string;
  }[];
}

export interface PastMatchRecord {
  date: string;
  homeTeam: string;
  awayTeam: string;
  score: string;
  winner: 'home' | 'away' | 'draw';
  league: string;
  notes?: string;
}

export interface TeamFormMatch {
  opponent: string;
  score: string;
  result: 'W' | 'D' | 'L';
  isHome: boolean;
}

export interface TeamFormDetail {
  teamName: string;
  formScore: number; // 0-100 Form index
  trend: 'YÜKSELİŞTE' | 'DÜŞÜŞTE' | 'ZİRVEDE' | 'DENGELİ';
  last5Matches: TeamFormMatch[];
  homeOrAwayRecord: string; // e.g. "İç sahada 8G 2B 0M (2.6 Gol Ort.)"
  attackRating: number; // 1-10
  defenseRating: number; // 1-10
  goalsScoredAvg: number;
  goalsConcededAvg: number;
  cleanSheetRatioPercent: number;
  summary: string;
}

export interface PlayerPerformanceProfile {
  name: string;
  team: string;
  position: string;
  rating: number; // 1-10 Form rating
  statsSummary: string; // e.g. "18 Gol, 4 Asist (Son 5 maçta 4 gol)"
  status: 'FIT' | 'INJURED' | 'SUSPENDED' | 'DOUBTFUL' | 'KEY_STAR';
  projectedImpact: string;
  aiPropBet?: {
    market: string;
    label: string;
    odds: number;
    probability: number;
  };
}

export interface AIPredictionResult {
  matchInfo: {
    homeTeam: string;
    awayTeam: string;
    league: string;
    date: string;
    sport?: SportType;
  };
  predictedScore: string;
  winProbabilities: {
    homeWin: number;
    draw: number;
    awayWin: number;
  };
  primaryPick: {
    market: string;
    label: string;
    odds: number;
    confidence: number; // 0-100%
    reasoning: string;
  };
  valuePick: {
    market: string;
    label: string;
    odds: number;
    confidence: number;
    reasoning: string;
  };
  playerPick?: {
    player: string;
    market: string;
    label: string;
    odds: number;
    confidence: number;
    reasoning: string;
  };
  goalMarketAnalysis: {
    over25Prob: number;
    under25Prob: number;
    bttsYesProb: number;
    bttsNoProb: number;
    expectedHomeGoals: number;
    expectedAwayGoals: number;
    verdict: string;
  };
  tacticalInsights: {
    homeForm: string;
    awayForm: string;
    keyMatchup: string;
    absencesImpact: string;
    weatherPitchFactor?: string;
  };
  // Deep Historical H2H Analysis
  pastMatchAnalysis?: {
    h2hSummary: string;
    totalPlayed: number;
    homeWinsCount: number;
    drawsCount: number;
    awayWinsCount: number;
    avgGoalsPerMatch: number;
    bttsRatePercent: number;
    over25RatePercent: number;
    recentMatches: PastMatchRecord[];
    keyHistoricalTrend: string;
  };
  // Deep Team Form Dynamics
  teamFormAnalysis?: {
    home: TeamFormDetail;
    away: TeamFormDetail;
    advantageVerdict: string;
  };
  // Player Performance & Key Stars Analysis
  playerPerformances?: {
    homeKeyPlayers: PlayerPerformanceProfile[];
    awayKeyPlayers: PlayerPerformanceProfile[];
    duelAnalysis: string;
    injuryAbsenceVerdict: string;
  };
  riskRating: {
    level: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK';
    score: number; // 1-10
    kellyStakePercent: number; // e.g. 5%
    advice: string;
  };
  sources?: { title: string; uri: string }[];
  timestamp: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'GOAL' | 'RED_CARD' | 'ODDS_DROP' | 'BET_WON' | 'BET_LOST' | 'SLIP_WON' | 'SLIP_LOST' | 'AI_ALERT' | 'MATCH_START' | 'SYSTEM';
  timestamp: string;
  read: boolean;
  matchId?: string;
  data?: any;
}

export interface UserStats {
  totalBets: number;
  wonBets: number;
  lostBets: number;
  pendingBets: number;
  totalStaked: number;
  totalReturned: number;
  netProfit: number;
  winRate: number;
  roi: number; // (netProfit / totalStaked) * 100
  avgOddsWon: number;
  longestWinStreak: number;
  currentStreak: number;
  leagueBreakdown: {
    league: string;
    total: number;
    won: number;
    profit: number;
    winRate: number;
  }[];
  marketBreakdown: {
    marketGroup: string;
    total: number;
    won: number;
    profit: number;
    winRate: number;
  }[];
  oddsRangeBreakdown: {
    range: string;
    total: number;
    won: number;
    winRate: number;
  }[];
  historyMonthly: {
    month: string;
    staked: number;
    returned: number;
    profit: number;
    betsCount: number;
  }[];
}
