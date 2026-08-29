import { Match, BetMarket } from '../types/betting';

export interface MarketState {
  market: BetMarket;
  isOpen: boolean;
  status: 'OPEN' | 'WON' | 'LOST' | 'CLOSED';
  odds: number;
  label: string;
  shortLabel: string;
  badgeText?: string;
  disabledReason?: string;
}

/**
 * Calculates real-time market availability and dynamic live odds based on match score, minute, and status.
 */
export function getLiveMarketStates(match: Match): Record<BetMarket, MarketState> {
  const isLive = match.status === 'LIVE';
  const isFinished = match.status === 'FINISHED';
  const minute = match.minute || 0;
  const homeScore = match.homeScore ?? 0;
  const awayScore = match.awayScore ?? 0;
  const totalGoals = homeScore + awayScore;
  const diff = homeScore - awayScore;

  // Base odds from match object or standard defaults
  const baseOdds = {
    ms1: match.odds?.ms1 || 2.10,
    msX: match.odds?.msX || 3.20,
    ms2: match.odds?.ms2 || 2.90,
    over25: match.odds?.over25 || 1.80,
    under25: match.odds?.under25 || 1.95,
    over15: match.odds?.over15 || 1.25,
    under15: match.odds?.under15 || 3.40,
    over35: match.odds?.over35 || 2.90,
    under35: match.odds?.under35 || 1.35,
    bttsYes: match.odds?.bttsYes || 1.75,
    bttsNo: match.odds?.bttsNo || 2.00,
    doubleChance1X: match.odds?.doubleChance1X || 1.25,
    doubleChance12: match.odds?.doubleChance12 || 1.30,
    doubleChanceX2: match.odds?.doubleChanceX2 || 1.55,
    iy1: match.odds?.iy1 || 2.60,
    iyX: match.odds?.iyX || 2.10,
    iy2: match.odds?.iy2 || 3.30,
    tg01: match.odds?.tg01 || 3.20,
    tg23: match.odds?.tg23 || 1.90,
    tg45: match.odds?.tg45 || 3.40,
    tg6plus: match.odds?.tg6plus || 8.50,
  };

  const results: Partial<Record<BetMarket, MarketState>> = {};

  // ==========================================
  // 1. BOTH TEAMS TO SCORE (KG VAR / KG YOK)
  // ==========================================
  const bothScored = homeScore >= 1 && awayScore >= 1;
  const isSecondHalfLate = minute >= 85;

  if (bothScored) {
    // Both teams HAVE SCORED -> KG VAR is WON, KG YOK is LOST. Market is permanently CLOSED!
    results['BTTS_YES'] = {
      market: 'BTTS_YES',
      isOpen: false,
      status: 'WON',
      odds: 1.00,
      label: 'KG Var (Goller Geldi)',
      shortLabel: 'KG Var',
      badgeText: 'KAZANDI (Kapandı)',
      disabledReason: 'Her iki takım da gol attı'
    };
    results['BTTS_NO'] = {
      market: 'BTTS_NO',
      isOpen: false,
      status: 'LOST',
      odds: 0,
      label: 'KG Yok (Geçersiz)',
      shortLabel: 'KG Yok',
      badgeText: 'KAYBETTİ (Kapandı)',
      disabledReason: 'Her iki takım da gol attı'
    };
  } else if (isFinished) {
    // Match finished without both scoring
    results['BTTS_YES'] = {
      market: 'BTTS_YES',
      isOpen: false,
      status: 'LOST',
      odds: 0,
      label: 'KG Var',
      shortLabel: 'KG Var',
      badgeText: 'KAYBETTİ',
      disabledReason: 'Maç Bitti'
    };
    results['BTTS_NO'] = {
      market: 'BTTS_NO',
      isOpen: false,
      status: 'WON',
      odds: 1.00,
      label: 'KG Yok',
      shortLabel: 'KG Yok',
      badgeText: 'KAZANDI',
      disabledReason: 'Maç Bitti'
    };
  } else if (isLive && isSecondHalfLate && (homeScore === 0 || awayScore === 0)) {
    // 85+ minute and one side hasn't scored
    results['BTTS_YES'] = {
      market: 'BTTS_YES',
      isOpen: true,
      status: 'OPEN',
      odds: 4.50,
      label: 'KG Var',
      shortLabel: 'KG Var',
      badgeText: 'Canlı Oran'
    };
    results['BTTS_NO'] = {
      market: 'BTTS_NO',
      isOpen: true,
      status: 'OPEN',
      odds: 1.12,
      label: 'KG Yok',
      shortLabel: 'KG Yok',
      badgeText: 'Canlı Oran'
    };
  } else {
    // Normal pre-match or live open market
    let liveBttsYes = baseOdds.bttsYes;
    let liveBttsNo = baseOdds.bttsNo;
    if (isLive) {
      if (homeScore > 0 || awayScore > 0) {
        // One team already scored -> KG Var becomes much more likely!
        liveBttsYes = Math.max(1.22, Number((baseOdds.bttsYes * 0.75).toFixed(2)));
        liveBttsNo = Math.max(3.20, Number((baseOdds.bttsNo * 1.80).toFixed(2)));
      } else if (minute > 60) {
        // 0-0 at 60th min
        liveBttsYes = Math.min(3.80, Number((baseOdds.bttsYes * 1.6).toFixed(2)));
        liveBttsNo = Math.max(1.20, Number((baseOdds.bttsNo * 0.65).toFixed(2)));
      }
    }
    results['BTTS_YES'] = {
      market: 'BTTS_YES',
      isOpen: true,
      status: 'OPEN',
      odds: liveBttsYes,
      label: 'Karşılıklı Gol VAR',
      shortLabel: 'KG Var'
    };
    results['BTTS_NO'] = {
      market: 'BTTS_NO',
      isOpen: true,
      status: 'OPEN',
      odds: liveBttsNo,
      label: 'Karşılıklı Gol YOK',
      shortLabel: 'KG Yok'
    };
  }

  // ==========================================
  // 2. TOTAL GOALS: 1.5 ALT / ÜST
  // ==========================================
  if (totalGoals >= 2) {
    results['OVER_15'] = {
      market: 'OVER_15',
      isOpen: false,
      status: 'WON',
      odds: 1.00,
      label: '1.5 Gol Üstü',
      shortLabel: '1.5 Üst',
      badgeText: 'KAZANDI (2+ Gol)',
      disabledReason: '2 veya daha fazla gol atıldı'
    };
    results['UNDER_15'] = {
      market: 'UNDER_15',
      isOpen: false,
      status: 'LOST',
      odds: 0,
      label: '1.5 Gol Altı',
      shortLabel: '1.5 Alt',
      badgeText: 'KAYBETTİ',
      disabledReason: '2 veya daha fazla gol atıldı'
    };
  } else if (isFinished) {
    results['OVER_15'] = {
      market: 'OVER_15',
      isOpen: false,
      status: totalGoals >= 2 ? 'WON' : 'LOST',
      odds: 0,
      label: '1.5 Üst',
      shortLabel: '1.5 Üst',
      badgeText: totalGoals >= 2 ? 'KAZANDI' : 'KAYBETTİ'
    };
    results['UNDER_15'] = {
      market: 'UNDER_15',
      isOpen: false,
      status: totalGoals < 2 ? 'WON' : 'LOST',
      odds: 0,
      label: '1.5 Alt',
      shortLabel: '1.5 Alt',
      badgeText: totalGoals < 2 ? 'KAZANDI' : 'KAYBETTİ'
    };
  } else {
    // Open
    let liveOver15 = baseOdds.over15;
    let liveUnder15 = baseOdds.under15;
    if (isLive) {
      if (totalGoals === 1) {
        liveOver15 = 1.35;
        liveUnder15 = 2.75;
      } else if (minute > 60 && totalGoals === 0) {
        liveOver15 = 2.40;
        liveUnder15 = 1.45;
      }
    }
    results['OVER_15'] = {
      market: 'OVER_15',
      isOpen: true,
      status: 'OPEN',
      odds: liveOver15,
      label: '1.5 Gol Üstü',
      shortLabel: '1.5 Üst'
    };
    results['UNDER_15'] = {
      market: 'UNDER_15',
      isOpen: true,
      status: 'OPEN',
      odds: liveUnder15,
      label: '1.5 Gol Altı',
      shortLabel: '1.5 Alt'
    };
  }

  // ==========================================
  // 3. TOTAL GOALS: 2.5 ALT / ÜST
  // ==========================================
  if (totalGoals >= 3) {
    results['OVER_25'] = {
      market: 'OVER_25',
      isOpen: false,
      status: 'WON',
      odds: 1.00,
      label: '2.5 Gol Üstü',
      shortLabel: '2.5 Üst',
      badgeText: 'KAZANDI (3+ Gol)',
      disabledReason: '3 veya daha fazla gol oldu'
    };
    results['UNDER_25'] = {
      market: 'UNDER_25',
      isOpen: false,
      status: 'LOST',
      odds: 0,
      label: '2.5 Gol Altı',
      shortLabel: '2.5 Alt',
      badgeText: 'KAYBETTİ',
      disabledReason: '3 veya daha fazla gol oldu'
    };
  } else if (isFinished) {
    results['OVER_25'] = {
      market: 'OVER_25',
      isOpen: false,
      status: totalGoals >= 3 ? 'WON' : 'LOST',
      odds: 0,
      label: '2.5 Üst',
      shortLabel: '2.5 Üst',
      badgeText: totalGoals >= 3 ? 'KAZANDI' : 'KAYBETTİ'
    };
    results['UNDER_25'] = {
      market: 'UNDER_25',
      isOpen: false,
      status: totalGoals < 3 ? 'WON' : 'LOST',
      odds: 0,
      label: '2.5 Alt',
      shortLabel: '2.5 Alt',
      badgeText: totalGoals < 3 ? 'KAZANDI' : 'KAYBETTİ'
    };
  } else {
    // Open
    let liveOver25 = baseOdds.over25;
    let liveUnder25 = baseOdds.under25;
    if (isLive) {
      if (totalGoals === 2) {
        liveOver25 = Math.max(1.22, Number((baseOdds.over25 * 0.7).toFixed(2)));
        liveUnder25 = Math.max(3.30, Number((baseOdds.under25 * 1.9).toFixed(2)));
      } else if (totalGoals === 1 && minute > 65) {
        liveOver25 = 2.45;
        liveUnder25 = 1.45;
      } else if (totalGoals === 0 && minute > 65) {
        liveOver25 = 3.60;
        liveUnder25 = 1.22;
      }
    }
    results['OVER_25'] = {
      market: 'OVER_25',
      isOpen: true,
      status: 'OPEN',
      odds: liveOver25,
      label: '2.5 Gol Üstü',
      shortLabel: '2.5 Üst'
    };
    results['UNDER_25'] = {
      market: 'UNDER_25',
      isOpen: true,
      status: 'OPEN',
      odds: liveUnder25,
      label: '2.5 Gol Altı',
      shortLabel: '2.5 Alt'
    };
  }

  // ==========================================
  // 4. TOTAL GOALS: 3.5 ALT / ÜST
  // ==========================================
  if (totalGoals >= 4) {
    results['OVER_35'] = {
      market: 'OVER_35',
      isOpen: false,
      status: 'WON',
      odds: 1.00,
      label: '3.5 Gol Üstü',
      shortLabel: '3.5 Üst',
      badgeText: 'KAZANDI (4+ Gol)',
      disabledReason: '4 veya daha fazla gol oldu'
    };
    results['UNDER_35'] = {
      market: 'UNDER_35',
      isOpen: false,
      status: 'LOST',
      odds: 0,
      label: '3.5 Gol Altı',
      shortLabel: '3.5 Alt',
      badgeText: 'KAYBETTİ',
      disabledReason: '4 veya daha fazla gol oldu'
    };
  } else if (isFinished) {
    results['OVER_35'] = {
      market: 'OVER_35',
      isOpen: false,
      status: totalGoals >= 4 ? 'WON' : 'LOST',
      odds: 0,
      label: '3.5 Üst',
      shortLabel: '3.5 Üst',
      badgeText: totalGoals >= 4 ? 'KAZANDI' : 'KAYBETTİ'
    };
    results['UNDER_35'] = {
      market: 'UNDER_35',
      isOpen: false,
      status: totalGoals < 4 ? 'WON' : 'LOST',
      odds: 0,
      label: '3.5 Alt',
      shortLabel: '3.5 Alt',
      badgeText: totalGoals < 4 ? 'KAZANDI' : 'KAYBETTİ'
    };
  } else {
    results['OVER_35'] = {
      market: 'OVER_35',
      isOpen: true,
      status: 'OPEN',
      odds: baseOdds.over35,
      label: '3.5 Gol Üstü',
      shortLabel: '3.5 Üst'
    };
    results['UNDER_35'] = {
      market: 'UNDER_35',
      isOpen: true,
      status: 'OPEN',
      odds: baseOdds.under35,
      label: '3.5 Gol Altı',
      shortLabel: '3.5 Alt'
    };
  }

  // ==========================================
  // 5. MATCH RESULT (1 - X - 2) & DOUBLE CHANCE
  // ==========================================
  if (isFinished) {
    const isHomeWon = diff > 0;
    const isDraw = diff === 0;
    const isAwayWon = diff < 0;

    results['MS1'] = {
      market: 'MS1',
      isOpen: false,
      status: isHomeWon ? 'WON' : 'LOST',
      odds: 0,
      label: `${match.homeTeam.name} Galibiyeti`,
      shortLabel: 'MS 1',
      badgeText: isHomeWon ? 'KAZANDI' : 'KAYBETTİ'
    };
    results['MSX'] = {
      market: 'MSX',
      isOpen: false,
      status: isDraw ? 'WON' : 'LOST',
      odds: 0,
      label: 'Beraberlik',
      shortLabel: 'MS X',
      badgeText: isDraw ? 'KAZANDI' : 'KAYBETTİ'
    };
    results['MS2'] = {
      market: 'MS2',
      isOpen: false,
      status: isAwayWon ? 'WON' : 'LOST',
      odds: 0,
      label: `${match.awayTeam.name} Galibiyeti`,
      shortLabel: 'MS 2',
      badgeText: isAwayWon ? 'KAZANDI' : 'KAYBETTİ'
    };

    results['DC_1X'] = {
      market: 'DC_1X',
      isOpen: false,
      status: isHomeWon || isDraw ? 'WON' : 'LOST',
      odds: 0,
      label: 'Çifte Şans 1-X',
      shortLabel: 'ÇŞ 1-X',
      badgeText: (isHomeWon || isDraw) ? 'KAZANDI' : 'KAYBETTİ'
    };
    results['DC_12'] = {
      market: 'DC_12',
      isOpen: false,
      status: isHomeWon || isAwayWon ? 'WON' : 'LOST',
      odds: 0,
      label: 'Çifte Şans 1-2',
      shortLabel: 'ÇŞ 1-2',
      badgeText: (isHomeWon || isAwayWon) ? 'KAZANDI' : 'KAYBETTİ'
    };
    results['DC_X2'] = {
      market: 'DC_X2',
      isOpen: false,
      status: isAwayWon || isDraw ? 'WON' : 'LOST',
      odds: 0,
      label: 'Çifte Şans X-2',
      shortLabel: 'ÇŞ X-2',
      badgeText: (isAwayWon || isDraw) ? 'KAZANDI' : 'KAYBETTİ'
    };
  } else {
    // Live or Pre-match
    let liveMs1 = baseOdds.ms1;
    let liveMsX = baseOdds.msX;
    let liveMs2 = baseOdds.ms2;

    if (isLive) {
      if (diff > 1) {
        // Home leading by 2+
        liveMs1 = minute > 75 ? 1.03 : 1.15;
        liveMsX = minute > 75 ? 14.0 : 8.50;
        liveMs2 = minute > 75 ? 35.0 : 18.0;
      } else if (diff === 1) {
        // Home leading by 1
        liveMs1 = minute > 80 ? 1.12 : (minute > 60 ? 1.35 : 1.65);
        liveMsX = minute > 80 ? 5.50 : 3.80;
        liveMs2 = minute > 80 ? 16.0 : 7.50;
      } else if (diff === 0) {
        // Tied
        liveMsX = minute > 80 ? 1.35 : (minute > 60 ? 2.10 : baseOdds.msX);
        liveMs1 = minute > 80 ? 4.80 : baseOdds.ms1;
        liveMs2 = minute > 80 ? 5.20 : baseOdds.ms2;
      } else if (diff === -1) {
        // Away leading by 1
        liveMs2 = minute > 80 ? 1.12 : (minute > 60 ? 1.40 : 1.70);
        liveMsX = minute > 80 ? 5.50 : 3.80;
        liveMs1 = minute > 80 ? 16.0 : 7.50;
      } else if (diff < -1) {
        // Away leading by 2+
        liveMs2 = minute > 75 ? 1.03 : 1.15;
        liveMsX = minute > 75 ? 14.0 : 8.50;
        liveMs1 = minute > 75 ? 35.0 : 18.0;
      }
    }

    results['MS1'] = {
      market: 'MS1',
      isOpen: true,
      status: 'OPEN',
      odds: liveMs1,
      label: `${match.homeTeam.name} Galibiyeti`,
      shortLabel: 'MS 1'
    };
    results['MSX'] = {
      market: 'MSX',
      isOpen: true,
      status: 'OPEN',
      odds: liveMsX,
      label: 'Beraberlik',
      shortLabel: 'MS X'
    };
    results['MS2'] = {
      market: 'MS2',
      isOpen: true,
      status: 'OPEN',
      odds: liveMs2,
      label: `${match.awayTeam.name} Galibiyeti`,
      shortLabel: 'MS 2'
    };

    results['DC_1X'] = {
      market: 'DC_1X',
      isOpen: true,
      status: 'OPEN',
      odds: baseOdds.doubleChance1X,
      label: 'Çifte Şans 1-X',
      shortLabel: 'ÇŞ 1-X'
    };
    results['DC_12'] = {
      market: 'DC_12',
      isOpen: true,
      status: 'OPEN',
      odds: baseOdds.doubleChance12,
      label: 'Çifte Şans 1-2',
      shortLabel: 'ÇŞ 1-2'
    };
    results['DC_X2'] = {
      market: 'DC_X2',
      isOpen: true,
      status: 'OPEN',
      odds: baseOdds.doubleChanceX2,
      label: 'Çifte Şans X-2',
      shortLabel: 'ÇŞ X-2'
    };
  }

  // ==========================================
  // 6. HALFTIME MARKETS (İY 1, İY X, İY 2)
  // ==========================================
  const isHalftimePassed = isFinished || (isLive && minute > 45);
  if (isHalftimePassed) {
    const htHome = match.halftimeScore?.[0] ?? (minute > 45 ? homeScore : 0);
    const htAway = match.halftimeScore?.[1] ?? (minute > 45 ? awayScore : 0);
    const htDiff = htHome - htAway;

    results['IY_1'] = {
      market: 'IY_1',
      isOpen: false,
      status: htDiff > 0 ? 'WON' : 'LOST',
      odds: 0,
      label: 'İlk Yarı: Ev Sahibi',
      shortLabel: 'İY 1',
      badgeText: htDiff > 0 ? 'KAZANDI' : 'KAPANDI',
      disabledReason: 'İlk Yarı Sona Erdi'
    };
    results['IY_X'] = {
      market: 'IY_X',
      isOpen: false,
      status: htDiff === 0 ? 'WON' : 'LOST',
      odds: 0,
      label: 'İlk Yarı: Beraberlik',
      shortLabel: 'İY X',
      badgeText: htDiff === 0 ? 'KAZANDI' : 'KAPANDI',
      disabledReason: 'İlk Yarı Sona Erdi'
    };
    results['IY_2'] = {
      market: 'IY_2',
      isOpen: false,
      status: htDiff < 0 ? 'WON' : 'LOST',
      odds: 0,
      label: 'İlk Yarı: Deplasman',
      shortLabel: 'İY 2',
      badgeText: htDiff < 0 ? 'KAZANDI' : 'KAPANDI',
      disabledReason: 'İlk Yarı Sona Erdi'
    };
  } else {
    results['IY_1'] = {
      market: 'IY_1',
      isOpen: true,
      status: 'OPEN',
      odds: baseOdds.iy1,
      label: 'İlk Yarı 1',
      shortLabel: 'İY 1'
    };
    results['IY_X'] = {
      market: 'IY_X',
      isOpen: true,
      status: 'OPEN',
      odds: baseOdds.iyX,
      label: 'İlk Yarı X',
      shortLabel: 'İY X'
    };
    results['IY_2'] = {
      market: 'IY_2',
      isOpen: true,
      status: 'OPEN',
      odds: baseOdds.iy2,
      label: 'İlk Yarı 2',
      shortLabel: 'İY 2'
    };
  }

  // ==========================================
  // 7. TOTAL GOAL BANDS (TG 0-1, TG 2-3, TG 4-5, TG 6+)
  // ==========================================
  if (totalGoals >= 2) {
    results['TG_01'] = {
      market: 'TG_01',
      isOpen: false,
      status: 'LOST',
      odds: 0,
      label: 'Toplam Gol: 0-1',
      shortLabel: 'TG 0-1',
      badgeText: 'KAYBETTİ (2+ Gol Oldu)',
      disabledReason: '2 veya daha fazla gol oldu'
    };
  } else if (isFinished) {
    results['TG_01'] = {
      market: 'TG_01',
      isOpen: false,
      status: totalGoals <= 1 ? 'WON' : 'LOST',
      odds: 0,
      label: 'Toplam Gol: 0-1',
      shortLabel: 'TG 0-1',
      badgeText: totalGoals <= 1 ? 'KAZANDI' : 'KAYBETTİ'
    };
  } else {
    results['TG_01'] = {
      market: 'TG_01',
      isOpen: true,
      status: 'OPEN',
      odds: baseOdds.tg01,
      label: 'Toplam Gol: 0-1',
      shortLabel: 'TG 0-1'
    };
  }

  if (totalGoals >= 4) {
    results['TG_23'] = {
      market: 'TG_23',
      isOpen: false,
      status: 'LOST',
      odds: 0,
      label: 'Toplam Gol: 2-3',
      shortLabel: 'TG 2-3',
      badgeText: 'KAYBETTİ (4+ Gol Oldu)',
      disabledReason: '4 veya daha fazla gol oldu'
    };
  } else if (isFinished) {
    results['TG_23'] = {
      market: 'TG_23',
      isOpen: false,
      status: totalGoals >= 2 && totalGoals <= 3 ? 'WON' : 'LOST',
      odds: 0,
      label: 'Toplam Gol: 2-3',
      shortLabel: 'TG 2-3',
      badgeText: totalGoals >= 2 && totalGoals <= 3 ? 'KAZANDI' : 'KAYBETTİ'
    };
  } else {
    results['TG_23'] = {
      market: 'TG_23',
      isOpen: true,
      status: 'OPEN',
      odds: baseOdds.tg23,
      label: 'Toplam Gol: 2-3',
      shortLabel: 'TG 2-3'
    };
  }

  if (totalGoals >= 6) {
    results['TG_45'] = {
      market: 'TG_45',
      isOpen: false,
      status: 'LOST',
      odds: 0,
      label: 'Toplam Gol: 4-5',
      shortLabel: 'TG 4-5',
      badgeText: 'KAYBETTİ (6+ Gol Oldu)',
      disabledReason: '6 veya daha fazla gol oldu'
    };
    results['TG_6PLUS'] = {
      market: 'TG_6PLUS',
      isOpen: false,
      status: 'WON',
      odds: 1.00,
      label: 'Toplam Gol: 6+',
      shortLabel: 'TG 6+',
      badgeText: 'KAZANDI (6+ Gol Oldu)',
      disabledReason: '6 veya daha fazla gol oldu'
    };
  } else if (isFinished) {
    results['TG_45'] = {
      market: 'TG_45',
      isOpen: false,
      status: totalGoals >= 4 && totalGoals <= 5 ? 'WON' : 'LOST',
      odds: 0,
      label: 'Toplam Gol: 4-5',
      shortLabel: 'TG 4-5',
      badgeText: totalGoals >= 4 && totalGoals <= 5 ? 'KAZANDI' : 'KAYBETTİ'
    };
    results['TG_6PLUS'] = {
      market: 'TG_6PLUS',
      isOpen: false,
      status: totalGoals >= 6 ? 'WON' : 'LOST',
      odds: 0,
      label: 'Toplam Gol: 6+',
      shortLabel: 'TG 6+',
      badgeText: totalGoals >= 6 ? 'KAZANDI' : 'KAYBETTİ'
    };
  } else {
    results['TG_45'] = {
      market: 'TG_45',
      isOpen: true,
      status: 'OPEN',
      odds: baseOdds.tg45,
      label: 'Toplam Gol: 4-5',
      shortLabel: 'TG 4-5'
    };
    results['TG_6PLUS'] = {
      market: 'TG_6PLUS',
      isOpen: true,
      status: 'OPEN',
      odds: baseOdds.tg6plus,
      label: 'Toplam Gol: 6+',
      shortLabel: 'TG 6+'
    };
  }

  // ==========================================
  // 8. BASKETBALL & VOLLEYBALL MARKETS
  // ==========================================
  const totalPointsLine = match.odds?.totalPointsLine || 165.5;
  const currentTotalPoints = (match.homeScore || 0) + (match.awayScore || 0);

  results['UNDER_TOTAL_POINTS'] = {
    market: 'UNDER_TOTAL_POINTS',
    isOpen: !isFinished,
    status: isFinished ? (currentTotalPoints < totalPointsLine ? 'WON' : 'LOST') : 'OPEN',
    odds: match.odds?.underTotalPoints || 1.85,
    label: `Toplam Sayı Alt (${totalPointsLine})`,
    shortLabel: `${totalPointsLine} Alt`,
    badgeText: isFinished ? (currentTotalPoints < totalPointsLine ? 'KAZANDI' : 'KAYBETTİ') : undefined
  };

  results['OVER_TOTAL_POINTS'] = {
    market: 'OVER_TOTAL_POINTS',
    isOpen: !isFinished,
    status: isFinished ? (currentTotalPoints > totalPointsLine ? 'WON' : 'LOST') : 'OPEN',
    odds: match.odds?.overTotalPoints || 1.85,
    label: `Toplam Sayı Üst (${totalPointsLine})`,
    shortLabel: `${totalPointsLine} Üst`,
    badgeText: isFinished ? (currentTotalPoints > totalPointsLine ? 'KAZANDI' : 'KAYBETTİ') : undefined
  };

  // Quarters
  const quarterScores = match.quarterScores || [];
  const isQ1Done = isFinished || quarterScores.length >= 1;
  const isQ2Done = isFinished || quarterScores.length >= 2;

  results['Q1_1'] = {
    market: 'Q1_1',
    isOpen: !isQ1Done,
    status: isQ1Done ? 'CLOSED' : 'OPEN',
    odds: match.odds?.q1_1 || 1.80,
    label: '1. Çeyrek 1',
    shortLabel: '1.Ç 1',
    disabledReason: isQ1Done ? '1. Çeyrek Sona Erdi' : undefined
  };
  results['Q1_X'] = {
    market: 'Q1_X',
    isOpen: !isQ1Done,
    status: isQ1Done ? 'CLOSED' : 'OPEN',
    odds: match.odds?.q1_x || 9.20,
    label: '1. Çeyrek X',
    shortLabel: '1.Ç X',
    disabledReason: isQ1Done ? '1. Çeyrek Sona Erdi' : undefined
  };
  results['Q1_2'] = {
    market: 'Q1_2',
    isOpen: !isQ1Done,
    status: isQ1Done ? 'CLOSED' : 'OPEN',
    odds: match.odds?.q1_2 || 1.90,
    label: '1. Çeyrek 2',
    shortLabel: '1.Ç 2',
    disabledReason: isQ1Done ? '1. Çeyrek Sona Erdi' : undefined
  };

  results['HT_1'] = {
    market: 'HT_1',
    isOpen: !isQ2Done,
    status: isQ2Done ? 'CLOSED' : 'OPEN',
    odds: match.odds?.ht_1 || 1.80,
    label: 'İlk Yarı 1',
    shortLabel: 'İY 1',
    disabledReason: isQ2Done ? 'İlk Yarı Sona Erdi' : undefined
  };
  results['HT_2'] = {
    market: 'HT_2',
    isOpen: !isQ2Done,
    status: isQ2Done ? 'CLOSED' : 'OPEN',
    odds: match.odds?.ht_2 || 1.90,
    label: 'İlk Yarı 2',
    shortLabel: 'İY 2',
    disabledReason: isQ2Done ? 'İlk Yarı Sona Erdi' : undefined
  };

  // Volleyball Sets
  const setScores = match.setScores || [];
  const isSet1Done = isFinished || setScores.length >= 1;
  const isSet2Done = isFinished || setScores.length >= 2;

  results['SET1_1'] = {
    market: 'SET1_1',
    isOpen: !isSet1Done,
    status: isSet1Done ? 'CLOSED' : 'OPEN',
    odds: match.odds?.set1_1 || 1.65,
    label: '1. Set Galibi 1',
    shortLabel: '1.Set 1',
    disabledReason: isSet1Done ? '1. Set Sona Erdi' : undefined
  };
  results['SET1_2'] = {
    market: 'SET1_2',
    isOpen: !isSet1Done,
    status: isSet1Done ? 'CLOSED' : 'OPEN',
    odds: match.odds?.set1_2 || 2.10,
    label: '1. Set Galibi 2',
    shortLabel: '1.Set 2',
    disabledReason: isSet1Done ? '1. Set Sona Erdi' : undefined
  };

  results['TOTAL_SETS_UNDER'] = {
    market: 'TOTAL_SETS_UNDER',
    isOpen: !isFinished,
    status: isFinished ? 'CLOSED' : 'OPEN',
    odds: match.odds?.total_sets_under || 2.70,
    label: 'Toplam Set Alt',
    shortLabel: 'Set Alt'
  };
  results['TOTAL_SETS_OVER'] = {
    market: 'TOTAL_SETS_OVER',
    isOpen: !isFinished,
    status: isFinished ? 'CLOSED' : 'OPEN',
    odds: match.odds?.total_sets_over || 1.40,
    label: 'Toplam Set Üst',
    shortLabel: 'Set Üst'
  };

  return results as Record<BetMarket, MarketState>;
}

export function isMarketLiveActive(match: Match, market: BetMarket): boolean {
  const states = getLiveMarketStates(match);
  return states[market]?.isOpen ?? true;
}

export function formatMatchTimeDisplay(date: string, time: string, status?: string, minute?: number): string {
  if (status === 'LIVE') {
    return minute ? `${minute}' Canlı` : 'Canlı';
  }
  if (status === 'FINISHED') {
    return 'MS';
  }
  return time || '20:00';
}
