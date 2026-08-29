import { BetSlip, BetSlipSelection, Match, AppNotification, BetMarket, SlipStatus } from '../types/betting';
import { getMatchTimingInfo, normalizeMatchTiming } from './dateUtils';

/**
 * Generates a realistic and deterministic match score based on teams and sport
 */
export function getDeterministicMatchScore(
  homeTeam: string,
  awayTeam: string,
  sport: string = 'FOOTBALL'
): { homeScore: number; awayScore: number; halftimeScore?: [number, number]; finalScoreStr: string } {
  const combined = (homeTeam + awayTeam).toLowerCase();
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash * 31 + combined.charCodeAt(i)) % 10000;
  }

  if (sport === 'BASKETBALL') {
    const hScore = 78 + (hash % 28);
    const aScore = 75 + ((hash >> 2) % 30);
    return {
      homeScore: hScore,
      awayScore: aScore,
      halftimeScore: [Math.floor(hScore / 2), Math.floor(aScore / 2)],
      finalScoreStr: `${hScore}-${aScore}`
    };
  }

  if (sport === 'VOLLEYBALL' || sport === 'TENNIS') {
    const homeSets = (hash % 2 === 0) ? 3 : (hash % 3 === 0 ? 3 : 1);
    const awaySets = homeSets === 3 ? (hash % 3) : 3;
    return {
      homeScore: homeSets,
      awayScore: awaySets,
      finalScoreStr: `${homeSets}-${awaySets}`
    };
  }

  // Football
  const isHighScoring = (hash % 3 === 0);
  const homeScore = isHighScoring ? 2 + (hash % 2) : (hash % 3);
  const awayScore = isHighScoring ? 1 + ((hash >> 2) % 2) : ((hash >> 1) % 3);
  const htHome = Math.min(homeScore, Math.floor(homeScore / 2));
  const htAway = Math.min(awayScore, Math.floor(awayScore / 2));

  return {
    homeScore,
    awayScore,
    halftimeScore: [htHome, htAway],
    finalScoreStr: `${homeScore}-${awayScore}`
  };
}

/**
 * Settles a single selection in a bet slip against live or historical match telemetry and clock
 */
export function settleSingleSelection(
  sel: BetSlipSelection,
  matchedMatch?: Match
): BetSlipSelection {
  // If selection is already strictly resolved with a finished status, preserve it
  if ((sel.status === 'WON' || sel.status === 'LOST') && sel.matchStatus === 'FINISHED' && sel.finalScore) {
    return sel;
  }

  const timing = getMatchTimingInfo(
    matchedMatch?.date || sel.matchDate,
    matchedMatch?.time || sel.matchTime,
    sel.sport
  );

  const isFinished = matchedMatch?.status === 'FINISHED' || timing.isFinished;
  const isLive = !isFinished && (matchedMatch?.status === 'LIVE' || timing.isLive);

  if (isFinished) {
    let hScore: number;
    let aScore: number;
    let htScore = matchedMatch?.halftimeScore;
    let qScores = matchedMatch?.quarterScores;
    let sScores = matchedMatch?.setScores;

    if (matchedMatch?.homeScore !== undefined && matchedMatch?.awayScore !== undefined) {
      hScore = matchedMatch.homeScore;
      aScore = matchedMatch.awayScore;
    } else if (sel.finalScore && sel.finalScore.includes('-')) {
      const parts = sel.finalScore.split('-').map(Number);
      hScore = !isNaN(parts[0]) ? parts[0] : 1;
      aScore = !isNaN(parts[1]) ? parts[1] : 0;
    } else if (sel.liveScore && sel.liveScore.includes('-')) {
      const parts = sel.liveScore.split('-').map(Number);
      hScore = !isNaN(parts[0]) ? parts[0] : 1;
      aScore = !isNaN(parts[1]) ? parts[1] : 0;
    } else {
      const sim = getDeterministicMatchScore(sel.homeTeam, sel.awayTeam, sel.sport);
      hScore = sim.homeScore;
      aScore = sim.awayScore;
      htScore = htScore || sim.halftimeScore;
    }

    const evaluation = evaluateSelection(
      sel.market,
      sel.marketLabel,
      hScore,
      aScore,
      htScore,
      qScores,
      sScores
    );

    return {
      ...sel,
      status: evaluation === 'WON' ? 'WON' : 'LOST',
      finalScore: `${hScore}-${aScore}`,
      matchStatus: 'FINISHED',
      leagueName: matchedMatch?.leagueName || sel.leagueName,
      leagueLogo: matchedMatch?.leagueLogo || sel.leagueLogo,
      matchTime: matchedMatch?.time || sel.matchTime,
      liveMinute: undefined,
      liveScore: undefined
    };
  } else if (isLive) {
    let liveH: number;
    let liveA: number;

    if (matchedMatch?.homeScore !== undefined && matchedMatch?.awayScore !== undefined) {
      liveH = matchedMatch.homeScore;
      liveA = matchedMatch.awayScore;
    } else if (sel.liveScore && sel.liveScore.includes('-')) {
      const parts = sel.liveScore.split('-').map(Number);
      liveH = !isNaN(parts[0]) ? parts[0] : 0;
      liveA = !isNaN(parts[1]) ? parts[1] : 0;
    } else {
      const sim = getDeterministicMatchScore(sel.homeTeam, sel.awayTeam, sel.sport);
      liveH = sim.homeScore > 0 ? Math.min(1, sim.homeScore) : 0;
      liveA = sim.awayScore > 0 ? Math.min(1, sim.awayScore) : 0;
    }

    return {
      ...sel,
      status: 'PENDING',
      matchStatus: 'LIVE',
      liveMinute: matchedMatch?.minute || timing.liveMinute || 45,
      liveScore: `${liveH}-${liveA}`,
      leagueName: matchedMatch?.leagueName || sel.leagueName,
      leagueLogo: matchedMatch?.leagueLogo || sel.leagueLogo,
      matchTime: matchedMatch?.time || sel.matchTime
    };
  } else {
    // Future match
    return {
      ...sel,
      status: 'PENDING',
      matchStatus: 'NOT_STARTED',
      liveMinute: undefined,
      liveScore: undefined,
      leagueName: matchedMatch?.leagueName || sel.leagueName,
      leagueLogo: matchedMatch?.leagueLogo || sel.leagueLogo,
      matchTime: matchedMatch?.time || sel.matchTime
    };
  }
}

/**
 * Evaluates a single selection against match score, quarter scores and set scores
 */
export function evaluateSelection(
  market: BetMarket,
  marketLabel: string | undefined,
  homeScore: number,
  awayScore: number,
  halftimeScore?: [number, number],
  quarterScores?: string[],
  setScores?: string[]
): 'WON' | 'LOST' {
  const totalScore = homeScore + awayScore;
  const isHomeWin = homeScore > awayScore;
  const isDraw = homeScore === awayScore;
  const isAwayWin = awayScore > homeScore;
  const labelUpper = (marketLabel || '').toUpperCase();

  const parseScorePair = (scoreStr?: string): [number, number] | null => {
    if (!scoreStr) return null;
    const parts = scoreStr.split('-').map(s => parseInt(s.trim(), 10));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return [parts[0], parts[1]];
    }
    return null;
  };

  switch (market) {
    case 'MS1':
      return isHomeWin ? 'WON' : 'LOST';
    case 'MSX':
      return isDraw ? 'WON' : 'LOST';
    case 'MS2':
      return isAwayWin ? 'WON' : 'LOST';
    case 'OVER_25':
      return totalScore > 2.5 ? 'WON' : 'LOST';
    case 'UNDER_25':
      return totalScore < 2.5 ? 'WON' : 'LOST';
    case 'OVER_15':
      return totalScore > 1.5 ? 'WON' : 'LOST';
    case 'UNDER_15':
      return totalScore < 1.5 ? 'WON' : 'LOST';
    case 'OVER_35':
      return totalScore > 3.5 ? 'WON' : 'LOST';
    case 'UNDER_35':
      return totalScore < 3.5 ? 'WON' : 'LOST';
    case 'BTTS_YES':
      return homeScore > 0 && awayScore > 0 ? 'WON' : 'LOST';
    case 'BTTS_NO':
      return homeScore === 0 || awayScore === 0 ? 'WON' : 'LOST';
    case 'DC_1X':
      return homeScore >= awayScore ? 'WON' : 'LOST';
    case 'DC_12':
      return homeScore !== awayScore ? 'WON' : 'LOST';
    case 'DC_X2':
      return awayScore >= homeScore ? 'WON' : 'LOST';
    case 'IY_1':
      if (halftimeScore) return halftimeScore[0] > halftimeScore[1] ? 'WON' : 'LOST';
      return isHomeWin ? 'WON' : 'LOST';
    case 'IY_X':
      if (halftimeScore) return halftimeScore[0] === halftimeScore[1] ? 'WON' : 'LOST';
      return isDraw ? 'WON' : 'LOST';
    case 'IY_2':
      if (halftimeScore) return halftimeScore[1] > halftimeScore[0] ? 'WON' : 'LOST';
      return isAwayWin ? 'WON' : 'LOST';
    case 'TG_01':
      return totalScore >= 0 && totalScore <= 1 ? 'WON' : 'LOST';
    case 'TG_23':
      return totalScore >= 2 && totalScore <= 3 ? 'WON' : 'LOST';
    case 'TG_45':
      return totalScore >= 4 && totalScore <= 5 ? 'WON' : 'LOST';
    case 'TG_6PLUS':
      return totalScore >= 6 ? 'WON' : 'LOST';

    // Basketball Quarter 1
    case 'Q1_1': {
      const q1 = parseScorePair(quarterScores?.[0]);
      if (q1) return q1[0] > q1[1] ? 'WON' : 'LOST';
      return isHomeWin ? 'WON' : 'LOST';
    }
    case 'Q1_X': {
      const q1 = parseScorePair(quarterScores?.[0]);
      if (q1) return q1[0] === q1[1] ? 'WON' : 'LOST';
      return 'LOST';
    }
    case 'Q1_2': {
      const q1 = parseScorePair(quarterScores?.[0]);
      if (q1) return q1[1] > q1[0] ? 'WON' : 'LOST';
      return isAwayWin ? 'WON' : 'LOST';
    }
    case 'Q1_OVER': {
      const q1 = parseScorePair(quarterScores?.[0]);
      if (q1) return (q1[0] + q1[1]) > 41.5 ? 'WON' : 'LOST';
      return totalScore > 165.5 ? 'WON' : 'LOST';
    }
    case 'Q1_UNDER': {
      const q1 = parseScorePair(quarterScores?.[0]);
      if (q1) return (q1[0] + q1[1]) < 41.5 ? 'WON' : 'LOST';
      return totalScore < 165.5 ? 'WON' : 'LOST';
    }

    // Basketball Half-Time
    case 'HT_1': {
      const q1 = parseScorePair(quarterScores?.[0]) || [0, 0];
      const q2 = parseScorePair(quarterScores?.[1]) || [0, 0];
      const htHome = q1[0] + q2[0];
      const htAway = q1[1] + q2[1];
      if (quarterScores && quarterScores.length >= 2) return htHome > htAway ? 'WON' : 'LOST';
      return isHomeWin ? 'WON' : 'LOST';
    }
    case 'HT_2': {
      const q1 = parseScorePair(quarterScores?.[0]) || [0, 0];
      const q2 = parseScorePair(quarterScores?.[1]) || [0, 0];
      const htHome = q1[0] + q2[0];
      const htAway = q1[1] + q2[1];
      if (quarterScores && quarterScores.length >= 2) return htAway > htHome ? 'WON' : 'LOST';
      return isAwayWin ? 'WON' : 'LOST';
    }
    case 'HT_OVER': {
      const q1 = parseScorePair(quarterScores?.[0]) || [0, 0];
      const q2 = parseScorePair(quarterScores?.[1]) || [0, 0];
      const htTotal = q1[0] + q2[0] + q1[1] + q2[1];
      if (quarterScores && quarterScores.length >= 2) return htTotal > 82.5 ? 'WON' : 'LOST';
      return totalScore > 165.5 ? 'WON' : 'LOST';
    }
    case 'HT_UNDER': {
      const q1 = parseScorePair(quarterScores?.[0]) || [0, 0];
      const q2 = parseScorePair(quarterScores?.[1]) || [0, 0];
      const htTotal = q1[0] + q2[0] + q1[1] + q2[1];
      if (quarterScores && quarterScores.length >= 2) return htTotal < 82.5 ? 'WON' : 'LOST';
      return totalScore < 165.5 ? 'WON' : 'LOST';
    }

    // Volleyball Sets
    case 'SET1_1': {
      const s1 = parseScorePair(setScores?.[0]);
      if (s1) return s1[0] > s1[1] ? 'WON' : 'LOST';
      return isHomeWin ? 'WON' : 'LOST';
    }
    case 'SET1_2': {
      const s1 = parseScorePair(setScores?.[0]);
      if (s1) return s1[1] > s1[0] ? 'WON' : 'LOST';
      return isAwayWin ? 'WON' : 'LOST';
    }
    case 'TOTAL_SETS_OVER': {
      const totalSetsPlayed = homeScore + awayScore;
      return totalSetsPlayed > 3.5 ? 'WON' : 'LOST';
    }
    case 'TOTAL_SETS_UNDER': {
      const totalSetsPlayed = homeScore + awayScore;
      return totalSetsPlayed <= 3.5 ? 'WON' : 'LOST';
    }

    // Tennis
    case 'TENNIS_GAMES_OVER':
      return totalScore > 21.5 ? 'WON' : 'LOST';
    case 'TENNIS_GAMES_UNDER':
      return totalScore < 21.5 ? 'WON' : 'LOST';
    case 'OVER_TOTAL_POINTS':
      return totalScore > 165.5 ? 'WON' : 'LOST';
    case 'UNDER_TOTAL_POINTS':
      return totalScore < 165.5 ? 'WON' : 'LOST';
    case 'HANDICAP_HOME':
      return (homeScore - 4.5) > awayScore ? 'WON' : 'LOST';
    case 'HANDICAP_AWAY':
      return (awayScore + 4.5) > homeScore ? 'WON' : 'LOST';
  }

  // Label fallback
  if (labelUpper.includes('MS 1') || labelUpper.includes('EV SAH') || labelUpper.includes('HOME WIN') || labelUpper === '1') {
    return isHomeWin ? 'WON' : 'LOST';
  }
  if (labelUpper.includes('MS X') || labelUpper.includes('BERABERLİK') || labelUpper.includes('DRAW') || labelUpper === 'X') {
    return isDraw ? 'WON' : 'LOST';
  }
  if (labelUpper.includes('MS 2') || labelUpper.includes('DEPLASMAN') || labelUpper.includes('AWAY WIN') || labelUpper === '2') {
    return isAwayWin ? 'WON' : 'LOST';
  }
  if (labelUpper.includes('2.5 ÜST') || labelUpper.includes('OVER 2.5') || labelUpper.includes('2.5 GOL ÜST')) {
    return totalScore > 2.5 ? 'WON' : 'LOST';
  }
  if (labelUpper.includes('2.5 ALT') || labelUpper.includes('UNDER 2.5') || labelUpper.includes('2.5 GOL ALTI')) {
    return totalScore < 2.5 ? 'WON' : 'LOST';
  }
  if (labelUpper.includes('KG VAR') || labelUpper.includes('BTTS YES') || labelUpper.includes('KARŞILIKLI GOL VAR')) {
    return homeScore > 0 && awayScore > 0 ? 'WON' : 'LOST';
  }
  if (labelUpper.includes('KG YOK') || labelUpper.includes('BTTS NO') || labelUpper.includes('KARŞILIKLI GOL YOK')) {
    return homeScore === 0 || awayScore === 0 ? 'WON' : 'LOST';
  }

  return 'WON';
}

export interface SettlementResult {
  updatedSlips: BetSlip[];
  newlyWonPayout: number;
  newNotifications: AppNotification[];
  settledCount: number;
}

/**
 * Checks all pending user slips against current matches and archive
 */
export function settleUserSlips(
  slips: BetSlip[],
  matches: Match[],
  historicalArchive: Match[] = []
): SettlementResult {
  let newlyWonPayout = 0;
  const newNotifications: AppNotification[] = [];
  let settledCount = 0;

  const allKnownMatches = [...matches, ...historicalArchive];

  const updatedSlips = slips.map(slip => {
    // If slip is already settled (WON, LOST, CASHED_OUT), format its selections
    if (slip.status !== 'PENDING') {
      const formattedSelections = slip.selections.map(sel => {
        const matched = allKnownMatches.find(m => m.id === sel.matchId) ||
          allKnownMatches.find(m => {
            const mHome = m.homeTeam.name.toLowerCase();
            const mAway = m.awayTeam.name.toLowerCase();
            const sHome = sel.homeTeam.toLowerCase();
            const sAway = sel.awayTeam.toLowerCase();
            return (mHome.includes(sHome) || sHome.includes(mHome)) &&
                   (mAway.includes(sAway) || sAway.includes(mAway));
          });
        return settleSingleSelection(sel, matched);
      });
      return {
        ...slip,
        selections: formattedSelections
      };
    }

    let hasLost = false;
    let allFinishedAndWon = true;
    let anyPendingRemaining = false;

    const updatedSelections = slip.selections.map((sel): BetSlipSelection => {
      const matched = allKnownMatches.find(m => m.id === sel.matchId) ||
        allKnownMatches.find(m => {
          const mHome = m.homeTeam.name.toLowerCase();
          const mAway = m.awayTeam.name.toLowerCase();
          const sHome = sel.homeTeam.toLowerCase();
          const sAway = sel.awayTeam.toLowerCase();
          return (mHome.includes(sHome) || sHome.includes(mHome)) &&
                 (mAway.includes(sAway) || sAway.includes(mAway));
        });

      const settledSel = settleSingleSelection(sel, matched);

      if (settledSel.status === 'LOST') {
        hasLost = true;
        allFinishedAndWon = false;
      } else if (settledSel.status === 'PENDING') {
        allFinishedAndWon = false;
        anyPendingRemaining = true;
      } else if (settledSel.status !== 'WON') {
        allFinishedAndWon = false;
      }

      return settledSel;
    });

    let nextStatus: SlipStatus = slip.status;
    if (hasLost) {
      nextStatus = 'LOST';
      settledCount++;
      newNotifications.push({
        id: `notif-slip-lost-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: '❌ KUPONUNUZ KAYBETTİ',
        message: `${slip.selections.length} maçlık kuponunuzdaki karşılaşmalar tamamlandı.`,
        type: 'BET_LOST',
        timestamp: 'Az önce',
        read: false
      });
    } else if (allFinishedAndWon && updatedSelections.length > 0 && !anyPendingRemaining && updatedSelections.every(s => s.status === 'WON')) {
      nextStatus = 'WON';
      settledCount++;
      const payout = slip.potentialPayout || Number((slip.stake * slip.totalOdds).toFixed(2));
      newlyWonPayout += payout;
      newNotifications.push({
        id: `notif-slip-won-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: '🎉 TEBRİKLER! KUPONUNUZ KAZANDI!',
        message: `${slip.selections.length} maçlık kuponunuz sonuçlandı, ₺${payout} kasanıza eklendi!`,
        type: 'BET_WON',
        timestamp: 'Az önce',
        read: false
      });
    }

    return {
      ...slip,
      status: nextStatus,
      selections: updatedSelections,
      actualPayout: nextStatus === 'WON' ? (slip.potentialPayout || Number((slip.stake * slip.totalOdds).toFixed(2))) : slip.actualPayout
    };
  });

  return {
    updatedSlips,
    newlyWonPayout,
    newNotifications,
    settledCount
  };
}

/**
 * Simulates real-time live match clock progression and random live events (goals, cards, momentum)
 */
export function simulateMatchStep(match: Match): Match {
  const normalized = normalizeMatchTiming(match);
  
  if (normalized.status !== 'LIVE') {
    // For non-live matches, subtle market odds fluctuations (15% chance)
    if (Math.random() < 0.15 && normalized.odds) {
      const keys = ['ms1', 'msX', 'ms2'] as const;
      const k = keys[Math.floor(Math.random() * keys.length)];
      const cur = normalized.odds[k];
      if (cur !== undefined) {
        const delta = (Math.random() > 0.5 ? 0.05 : -0.05);
        const newVal = Math.max(1.10, Number((cur + delta).toFixed(2)));
        return {
          ...normalized,
          odds: {
            ...normalized.odds,
            [k]: newVal
          }
        };
      }
    }
    return normalized;
  }

  let homeScore = normalized.homeScore ?? match.homeScore ?? 0;
  let awayScore = normalized.awayScore ?? match.awayScore ?? 0;
  let updatedOdds = { ...(match.odds || normalized.odds) };

  // Goal probability on step (approx 6% chance), excluding halftime (min 45)
  const isGoal = Math.random() < 0.06;
  if (isGoal && normalized.minute && normalized.minute < 90 && normalized.minute !== 45) {
    if (Math.random() > 0.48) {
      homeScore += 1;
      // When Home scores, Home odds drop (down), Away odds rise (up), Over25 drops
      if (updatedOdds.ms1) updatedOdds.ms1 = Math.max(1.05, Number((updatedOdds.ms1 * 0.78).toFixed(2)));
      if (updatedOdds.ms2) updatedOdds.ms2 = Number((updatedOdds.ms2 * 1.35).toFixed(2));
      if (updatedOdds.over25) updatedOdds.over25 = Math.max(1.08, Number((updatedOdds.over25 * 0.85).toFixed(2)));
    } else {
      awayScore += 1;
      // When Away scores, Away odds drop (down), Home odds rise (up)
      if (updatedOdds.ms2) updatedOdds.ms2 = Math.max(1.05, Number((updatedOdds.ms2 * 0.78).toFixed(2)));
      if (updatedOdds.ms1) updatedOdds.ms1 = Number((updatedOdds.ms1 * 1.35).toFixed(2));
      if (updatedOdds.over25) updatedOdds.over25 = Math.max(1.08, Number((updatedOdds.over25 * 0.85).toFixed(2)));
    }
  } else {
    // Periodic live odds fluctuation (45% chance per simulation step) so color flashes are clearly active
    if (Math.random() < 0.45 && updatedOdds) {
      const oddsKeys = ['ms1', 'msX', 'ms2', 'over25', 'under25', 'overTotalPoints'] as const;
      const randomKey = oddsKeys[Math.floor(Math.random() * oddsKeys.length)];
      const currentVal = (updatedOdds as any)[randomKey];
      if (currentVal !== undefined && typeof currentVal === 'number') {
        const delta = (Math.random() > 0.5 ? 0.08 : -0.08); // +0.08 or -0.08
        const newVal = Math.max(1.05, Number((currentVal + delta).toFixed(2)));
        updatedOdds = {
          ...updatedOdds,
          [randomKey]: newVal
        };
      }
    }
  }

  return {
    ...normalized,
    homeScore,
    awayScore,
    odds: updatedOdds
  };
}

/**
 * High-level evaluator that returns newly settled slips and total won payout
 */
export function evaluateAllSlips(slips: BetSlip[], matches: Match[]): {
  updatedSlips: BetSlip[];
  newlySettledSlips: BetSlip[];
  totalPayoutWon: number;
} {
  const result = settleUserSlips(slips, matches);
  const newlySettledSlips = result.updatedSlips.filter(
    (s, i) => slips[i]?.status === 'PENDING' && (s.status === 'WON' || s.status === 'LOST')
  );

  return {
    updatedSlips: result.updatedSlips,
    newlySettledSlips,
    totalPayoutWon: result.newlyWonPayout
  };
}
