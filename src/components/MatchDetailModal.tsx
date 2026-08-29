import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  Tv, 
  Activity, 
  BarChart3, 
  History, 
  Users, 
  ShieldCheck, 
  Flame, 
  Radio, 
  Check, 
  Plus, 
  Clock, 
  Calendar,
  Layers,
  Zap,
  TrendingUp,
  Award
} from 'lucide-react';
import { Match, BetSlipSelection, SportType } from '../types/betting';
import { TeamLogo } from './TeamLogo';
import { LivePitchTracker } from './LivePitchTracker';
import { LiveMomentumVisualizer } from './LiveMomentumVisualizer';
import { TeamFormTrendsChart } from './TeamFormTrendsChart';

interface MatchDetailModalProps {
  match: Match | null;
  onClose: () => void;
  onAddSelection: (selection: BetSlipSelection) => void;
  activeSelections: BetSlipSelection[];
  onOpenAI: (match: Match) => void;
  initialTab?: 'markets' | 'pitch' | 'stats' | 'trends';
}

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({
  match,
  onClose,
  onAddSelection,
  activeSelections,
  onOpenAI,
  initialTab = 'markets'
}) => {
  const [activeTab, setActiveTab] = useState<'markets' | 'pitch' | 'stats' | 'trends'>(initialTab);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const prevOddsRef = useRef<{ ms1?: number; msX?: number; ms2?: number; under25?: number; over25?: number; bttsYes?: number; bttsNo?: number }>({});
  const [oddsFlash, setOddsFlash] = useState<Record<string, 'up' | 'down'>>({});

  useEffect(() => {
    if (!match || !match.odds) return;
    const prev = prevOddsRef.current;
    const cur = match.odds;
    const newFlashes: Record<string, 'up' | 'down'> = {};

    if (prev.ms1 !== undefined && cur.ms1 !== undefined && prev.ms1 !== cur.ms1) {
      newFlashes['ms1'] = cur.ms1 > prev.ms1 ? 'up' : 'down';
    }
    if (prev.msX !== undefined && cur.msX !== undefined && prev.msX !== cur.msX) {
      newFlashes['msX'] = cur.msX > prev.msX ? 'up' : 'down';
    }
    if (prev.ms2 !== undefined && cur.ms2 !== undefined && prev.ms2 !== cur.ms2) {
      newFlashes['ms2'] = cur.ms2 > prev.ms2 ? 'up' : 'down';
    }
    if (prev.under25 !== undefined && cur.under25 !== undefined && prev.under25 !== cur.under25) {
      newFlashes['under25'] = cur.under25 > prev.under25 ? 'up' : 'down';
    }
    if (prev.over25 !== undefined && cur.over25 !== undefined && prev.over25 !== cur.over25) {
      newFlashes['over25'] = cur.over25 > prev.over25 ? 'up' : 'down';
    }
    if (prev.bttsYes !== undefined && cur.bttsYes !== undefined && prev.bttsYes !== cur.bttsYes) {
      newFlashes['bttsYes'] = cur.bttsYes > prev.bttsYes ? 'up' : 'down';
    }
    if (prev.bttsNo !== undefined && cur.bttsNo !== undefined && prev.bttsNo !== cur.bttsNo) {
      newFlashes['bttsNo'] = cur.bttsNo > prev.bttsNo ? 'up' : 'down';
    }

    prevOddsRef.current = {
      ms1: cur.ms1,
      msX: cur.msX,
      ms2: cur.ms2,
      under25: cur.under25,
      over25: cur.over25,
      bttsYes: cur.bttsYes,
      bttsNo: cur.bttsNo
    };

    if (Object.keys(newFlashes).length > 0) {
      setOddsFlash(prev => ({ ...prev, ...newFlashes }));
      const timer = setTimeout(() => {
        setOddsFlash(prev => {
          const updated = { ...prev };
          Object.keys(newFlashes).forEach(k => delete updated[k]);
          return updated;
        });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [match?.odds]);

  if (!match) return null;

  const isBasketball = match.sport === 'BASKETBALL';
  const isVolleyball = match.sport === 'VOLLEYBALL';
  const isLive = match.status === 'LIVE';

  const isSelectionActive = (market: any) => {
    return activeSelections.some(s => s.matchId === match.id && s.market === market);
  };

  const handleSelectOdd = (market: any, label: string, odds: number | undefined) => {
    if (!odds || odds <= 1.0) return;
    onAddSelection({
      matchId: match.id,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      matchDate: match.date,
      matchTime: match.time,
      leagueName: match.leagueName,
      leagueLogo: match.leagueLogo,
      sport: match.sport,
      market,
      marketLabel: label,
      odds,
      status: 'PENDING'
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-mono cursor-pointer"
      onClick={e => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-[#0D1117] border border-[#30363D] rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-[#E0E0E0] cursor-default my-auto"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Modal Top Header */}
        <div className="bg-[#161B22] p-3 sm:p-4 border-b border-[#21262D] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
            <TeamLogo 
              logo={match.leagueLogo} 
              fallback={isBasketball ? '🏀' : (isVolleyball ? '🏐' : '⚽')} 
              className="w-6 h-6 shrink-0" 
              alt={match.leagueName} 
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-bold text-white text-xs sm:text-sm truncate max-w-[200px] sm:max-w-xs">{match.leagueName}</h3>
                {isLive && (
                  <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 border border-red-500/40 text-[9px] sm:text-[10px] font-bold animate-pulse flex items-center gap-1 shrink-0">
                    <Radio className="w-2.5 h-2.5" />
                    CANLI {match.minute ? `${match.minute}'` : ''}
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] text-gray-400 font-sans truncate">
                {match.date} • {match.time} TSİ • Kod: #{match.matchCode}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            <button
              onClick={() => {
                onClose();
                onOpenAI(match);
              }}
              className="px-2 sm:px-3 py-1.5 rounded-lg bg-green-500/15 hover:bg-green-500/25 text-green-400 border border-green-500/40 text-[11px] sm:text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI Analiz Raporu</span>
              <span className="sm:hidden">AI</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#21262D] hover:bg-red-500 hover:text-white text-gray-300 border border-[#30363D] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Pencereyi Kapat"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Match Score Banner */}
        <div className="p-4 sm:p-5 bg-gradient-to-b from-[#161B22] via-[#12161D] to-[#0D1117] border-b border-[#21262D] grid grid-cols-3 items-center text-center">
          {/* Home Team */}
          <div className="flex flex-col items-center space-y-1.5">
            <TeamLogo logo={match.homeTeam.logo} fallback={isBasketball ? '🏀' : '⚽'} className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-md" />
            <span className="font-extrabold text-white text-xs sm:text-sm leading-tight max-w-[110px] sm:max-w-[150px] truncate">
              {match.homeTeam.name}
            </span>
            <div className="flex items-center gap-1">
              {match.homeTeam.form?.map((f, i) => (
                <span 
                  key={i} 
                  className={`w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center ${
                    f === 'W' ? 'bg-emerald-500 text-black' : f === 'D' ? 'bg-amber-500 text-black' : 'bg-rose-500 text-white'
                  }`}
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Score & Status */}
          <div className="flex flex-col items-center justify-center space-y-1.5">
            <div className="text-xl sm:text-3xl font-black text-white tracking-widest bg-black/60 px-3.5 py-1 sm:px-5 sm:py-1.5 rounded-xl border border-white/10 shadow-inner">
              {match.homeScore ?? (isLive ? 0 : '-')} : {match.awayScore ?? (isLive ? 0 : '-')}
            </div>
            
            {isLive ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] sm:text-xs font-black tracking-wider uppercase animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>CANLI ({match.minute ? `${match.minute}'` : 'Oynanıyor'})</span>
              </span>
            ) : match.status === 'FINISHED' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] sm:text-xs font-extrabold tracking-wider uppercase">
                <span>MAÇ SONUCU</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] sm:text-xs font-extrabold tracking-wider uppercase">
                <span className="text-[10px]">⏰</span>
                <span>BAŞLAMADI ({match.time || '21:30'} TSİ)</span>
              </span>
            )}

            {match.tvChannel && (
              <span className="text-[10px] text-gray-300 flex items-center gap-1 bg-[#161B22] px-2 py-0.5 rounded-md border border-[#30363D] font-bold">
                <Tv className="w-3 h-3 text-emerald-400" />
                {match.tvChannel}
              </span>
            )}
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center space-y-1.5">
            <TeamLogo logo={match.awayTeam.logo} fallback={isBasketball ? '🏀' : '⚽'} className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-md" />
            <span className="font-extrabold text-white text-xs sm:text-sm leading-tight max-w-[110px] sm:max-w-[150px] truncate">
              {match.awayTeam.name}
            </span>
            <div className="flex items-center gap-1">
              {match.awayTeam.form?.map((f, i) => (
                <span 
                  key={i} 
                  className={`w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center ${
                    f === 'W' ? 'bg-emerald-500 text-black' : f === 'D' ? 'bg-amber-500 text-black' : 'bg-rose-500 text-white'
                  }`}
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Non-wrapping horizontal scroll */}
        <div className="bg-[#161B22] px-3 py-2 border-b border-[#21262D] flex items-center gap-2 overflow-x-auto no-scrollbar whitespace-nowrap text-xs font-extrabold">
          <button
            type="button"
            onClick={() => setActiveTab('markets')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'markets' 
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-black' 
                : 'text-gray-400 hover:text-white bg-[#0D1117] border border-[#21262D]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tüm Bahis Marketleri</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pitch')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'pitch' 
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-black' 
                : 'text-gray-400 hover:text-white bg-[#0D1117] border border-[#21262D]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>2D Saha & Canlı Yayın</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'stats' 
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-black' 
                : 'text-gray-400 hover:text-white bg-[#0D1117] border border-[#21262D]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>İstatistikler & xG</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('trends')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'trends' 
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-black' 
                : 'text-gray-400 hover:text-white bg-[#0D1117] border border-[#21262D]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Form & Gol Trendleri</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'markets' && (
            <div className="space-y-4">
              {/* Market Group 1: Match Winner (MS 1, X, 2) */}
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-3.5 space-y-2.5">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Maç Sonucu (1X2)</span>
                  <span className="text-[10px] text-green-400 font-mono">MBS 1</span>
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleSelectOdd('MS_1', `${match.homeTeam.name} (MS 1)`, match.odds?.ms1)}
                    className={`p-3 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isSelectionActive('MS_1')
                        ? 'bg-green-500 border-green-500 text-black font-black'
                        : oddsFlash['ms1'] === 'up'
                        ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 animate-pulse shadow-lg shadow-emerald-500/40'
                        : oddsFlash['ms1'] === 'down'
                        ? 'bg-rose-500/30 border-rose-400 text-rose-200 animate-pulse shadow-lg shadow-rose-500/40'
                        : 'bg-[#0D1117] border-[#21262D] hover:border-green-500 text-white'
                    }`}
                  >
                    <span className="text-[10px] text-gray-400">1 ({match.homeTeam.name})</span>
                    <span className="text-sm font-black font-mono mt-1 flex items-center gap-1">
                      {match.odds?.ms1 || 1.85}
                      {oddsFlash['ms1'] === 'up' && <span className="text-emerald-400 text-[10px] animate-bounce">▲</span>}
                      {oddsFlash['ms1'] === 'down' && <span className="text-rose-400 text-[10px] animate-bounce">▼</span>}
                    </span>
                  </button>

                  {!isBasketball && (
                    <button
                      onClick={() => handleSelectOdd('MS_X', 'Beraberlik (MS X)', match.odds?.msX)}
                      className={`p-3 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isSelectionActive('MS_X')
                          ? 'bg-green-500 border-green-500 text-black font-black'
                          : oddsFlash['msX'] === 'up'
                          ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 animate-pulse shadow-lg shadow-emerald-500/40'
                          : oddsFlash['msX'] === 'down'
                          ? 'bg-rose-500/30 border-rose-400 text-rose-200 animate-pulse shadow-lg shadow-rose-500/40'
                          : 'bg-[#0D1117] border-[#21262D] hover:border-green-500 text-white'
                      }`}
                    >
                      <span className="text-[10px] text-gray-400">X (Beraberlik)</span>
                      <span className="text-sm font-black font-mono mt-1 flex items-center gap-1">
                        {match.odds?.msX || 3.30}
                        {oddsFlash['msX'] === 'up' && <span className="text-emerald-400 text-[10px] animate-bounce">▲</span>}
                        {oddsFlash['msX'] === 'down' && <span className="text-rose-400 text-[10px] animate-bounce">▼</span>}
                      </span>
                    </button>
                  )}

                  <button
                    onClick={() => handleSelectOdd('MS_2', `${match.awayTeam.name} (MS 2)`, match.odds?.ms2)}
                    className={`p-3 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isSelectionActive('MS_2')
                        ? 'bg-green-500 border-green-500 text-black font-black'
                        : oddsFlash['ms2'] === 'up'
                        ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 animate-pulse shadow-lg shadow-emerald-500/40'
                        : oddsFlash['ms2'] === 'down'
                        ? 'bg-rose-500/30 border-rose-400 text-rose-200 animate-pulse shadow-lg shadow-rose-500/40'
                        : 'bg-[#0D1117] border-[#21262D] hover:border-green-500 text-white'
                    }`}
                  >
                    <span className="text-[10px] text-gray-400">2 ({match.awayTeam.name})</span>
                    <span className="text-sm font-black font-mono mt-1 flex items-center gap-1">
                      {match.odds?.ms2 || 1.95}
                      {oddsFlash['ms2'] === 'up' && <span className="text-emerald-400 text-[10px] animate-bounce">▲</span>}
                      {oddsFlash['ms2'] === 'down' && <span className="text-rose-400 text-[10px] animate-bounce">▼</span>}
                    </span>
                  </button>
                </div>
              </div>

              {/* Market Group 2: Total Goals / Points (Alt / Üst) */}
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-3.5 space-y-2.5">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  {isBasketball ? 'Toplam Sayı Alt / Üst' : 'Toplam Gol 2.5 Alt / Üst'}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSelectOdd('UNDER_25', '2.5 Gol Alt', match.odds?.under25 || 1.95)}
                    className={`p-3 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isSelectionActive('UNDER_25')
                        ? 'bg-green-500 border-green-500 text-black font-black'
                        : oddsFlash['under25'] === 'up'
                        ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 animate-pulse shadow-lg shadow-emerald-500/40'
                        : oddsFlash['under25'] === 'down'
                        ? 'bg-rose-500/30 border-rose-400 text-rose-200 animate-pulse shadow-lg shadow-rose-500/40'
                        : 'bg-[#0D1117] border-[#21262D] hover:border-green-500 text-white'
                    }`}
                  >
                    <span className="text-[10px] text-gray-400">2.5 Alt</span>
                    <span className="text-sm font-black font-mono mt-1 flex items-center gap-1">
                      {match.odds?.under25 || 1.95}
                      {oddsFlash['under25'] === 'up' && <span className="text-emerald-400 text-[10px] animate-bounce">▲</span>}
                      {oddsFlash['under25'] === 'down' && <span className="text-rose-400 text-[10px] animate-bounce">▼</span>}
                    </span>
                  </button>

                  <button
                    onClick={() => handleSelectOdd('OVER_25', '2.5 Gol Üst', match.odds?.over25 || 1.75)}
                    className={`p-3 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isSelectionActive('OVER_25')
                        ? 'bg-green-500 border-green-500 text-black font-black'
                        : oddsFlash['over25'] === 'up'
                        ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 animate-pulse shadow-lg shadow-emerald-500/40'
                        : oddsFlash['over25'] === 'down'
                        ? 'bg-rose-500/30 border-rose-400 text-rose-200 animate-pulse shadow-lg shadow-rose-500/40'
                        : 'bg-[#0D1117] border-[#21262D] hover:border-green-500 text-white'
                    }`}
                  >
                    <span className="text-[10px] text-gray-400">2.5 Üst</span>
                    <span className="text-sm font-black font-mono mt-1 flex items-center gap-1">
                      {match.odds?.over25 || 1.75}
                      {oddsFlash['over25'] === 'up' && <span className="text-emerald-400 text-[10px] animate-bounce">▲</span>}
                      {oddsFlash['over25'] === 'down' && <span className="text-rose-400 text-[10px] animate-bounce">▼</span>}
                    </span>
                  </button>
                </div>
              </div>

              {/* Market Group 3: Both Teams to Score (Karşılıklı Gol Var/Yok) */}
              {!isBasketball && !isVolleyball && (
                <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-3.5 space-y-2.5">
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Karşılıklı Gol (KG)
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleSelectOdd('BTTS_YES', 'Karşılıklı Gol Var', match.odds?.bttsYes || 1.65)}
                      className={`p-3 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isSelectionActive('BTTS_YES')
                          ? 'bg-green-500 border-green-500 text-black font-black'
                          : 'bg-[#0D1117] border-[#21262D] hover:border-green-500 text-white'
                      }`}
                    >
                      <span className="text-[10px] text-gray-400">KG Var</span>
                      <span className="text-sm font-black font-mono mt-1">{match.odds?.bttsYes || 1.65}</span>
                    </button>

                    <button
                      onClick={() => handleSelectOdd('BTTS_NO', 'Karşılıklı Gol Yok', match.odds?.bttsNo || 2.10)}
                      className={`p-3 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isSelectionActive('BTTS_NO')
                          ? 'bg-green-500 border-green-500 text-black font-black'
                          : 'bg-[#0D1117] border-[#21262D] hover:border-green-500 text-white'
                      }`}
                    >
                      <span className="text-[10px] text-gray-400">KG Yok</span>
                      <span className="text-sm font-black font-mono mt-1">{match.odds?.bttsNo || 2.10}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Double Chance (Çifte Şans) */}
              {!isBasketball && (
                <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-3.5 space-y-2.5">
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Çifte Şans (1X / 12 / X2)
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleSelectOdd('DOUBLE_1X', '1X Çifte Şans', match.odds?.doubleChance1X || 1.30)}
                      className="p-2.5 rounded-lg border bg-[#0D1117] border-[#21262D] hover:border-green-500 text-white flex flex-col items-center"
                    >
                      <span className="text-[10px] text-gray-400">1X (Ev Sahibi veya Beraberlik)</span>
                      <span className="text-xs font-bold font-mono mt-1">{match.odds?.doubleChance1X || 1.30}</span>
                    </button>

                    <button
                      onClick={() => handleSelectOdd('DOUBLE_12', '12 Çifte Şans', match.odds?.doubleChance12 || 1.25)}
                      className="p-2.5 rounded-lg border bg-[#0D1117] border-[#21262D] hover:border-green-500 text-white flex flex-col items-center"
                    >
                      <span className="text-[10px] text-gray-400">12 (İki Takımdan Biri)</span>
                      <span className="text-xs font-bold font-mono mt-1">{match.odds?.doubleChance12 || 1.25}</span>
                    </button>

                    <button
                      onClick={() => handleSelectOdd('DOUBLE_X2', 'X2 Çifte Şans', match.odds?.doubleChanceX2 || 1.55)}
                      className="p-2.5 rounded-lg border bg-[#0D1117] border-[#21262D] hover:border-green-500 text-white flex flex-col items-center"
                    >
                      <span className="text-[10px] text-gray-400">X2 (Beraberlik veya Deplasman)</span>
                      <span className="text-xs font-bold font-mono mt-1">{match.odds?.doubleChanceX2 || 1.55}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* İlk Yarı Sonucu (İY 1X2) */}
              {!isBasketball && !isVolleyball && (
                <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-3.5 space-y-2.5">
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center justify-between">
                    <span>İlk Yarı Sonucu (İY 1X2)</span>
                    <span className="text-[10px] text-green-400 font-mono">İY</span>
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleSelectOdd('IY_1', `İlk Yarı 1 (${match.homeTeam.name})`, match.odds?.iy1 || 2.45)}
                      className={`p-2.5 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isSelectionActive('IY_1')
                          ? 'bg-green-500 border-green-500 text-black font-black'
                          : 'bg-[#0D1117] border-[#21262D] hover:border-green-500 text-white'
                      }`}
                    >
                      <span className="text-[10px] text-gray-400">İY 1</span>
                      <span className="text-xs font-black font-mono mt-1">{match.odds?.iy1 || 2.45}</span>
                    </button>

                    <button
                      onClick={() => handleSelectOdd('IY_X', 'İlk Yarı Beraberlik', match.odds?.iyX || 2.15)}
                      className={`p-2.5 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isSelectionActive('IY_X')
                          ? 'bg-green-500 border-green-500 text-black font-black'
                          : 'bg-[#0D1117] border-[#21262D] hover:border-green-500 text-white'
                      }`}
                    >
                      <span className="text-[10px] text-gray-400">İY X</span>
                      <span className="text-xs font-black font-mono mt-1">{match.odds?.iyX || 2.15}</span>
                    </button>

                    <button
                      onClick={() => handleSelectOdd('IY_2', `İlk Yarı 2 (${match.awayTeam.name})`, match.odds?.iy2 || 2.80)}
                      className={`p-2.5 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isSelectionActive('IY_2')
                          ? 'bg-green-500 border-green-500 text-black font-black'
                          : 'bg-[#0D1117] border-[#21262D] hover:border-green-500 text-white'
                      }`}
                    >
                      <span className="text-[10px] text-gray-400">İY 2</span>
                      <span className="text-xs font-black font-mono mt-1">{match.odds?.iy2 || 2.80}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Alt / Üst Alternatifleri (1.5 & 3.5 Gol) */}
              {!isBasketball && !isVolleyball && (
                <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-3.5 space-y-2.5">
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Alternatif Toplam Gol (1.5 & 3.5)
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => handleSelectOdd('UNDER_15', '1.5 Gol Alt', match.odds?.under15 || 3.40)}
                      className="p-2 rounded-lg border bg-[#0D1117] border-[#21262D] hover:border-green-500 text-white flex flex-col items-center cursor-pointer"
                    >
                      <span className="text-[10px] text-gray-400">1.5 Alt</span>
                      <span className="text-xs font-bold font-mono mt-0.5">{match.odds?.under15 || 3.40}</span>
                    </button>
                    <button
                      onClick={() => handleSelectOdd('OVER_15', '1.5 Gol Üst', match.odds?.over15 || 1.25)}
                      className="p-2 rounded-lg border bg-[#0D1117] border-[#21262D] hover:border-green-500 text-white flex flex-col items-center cursor-pointer"
                    >
                      <span className="text-[10px] text-gray-400">1.5 Üst</span>
                      <span className="text-xs font-bold font-mono mt-0.5">{match.odds?.over15 || 1.25}</span>
                    </button>
                    <button
                      onClick={() => handleSelectOdd('UNDER_35', '3.5 Gol Alt', match.odds?.under35 || 1.40)}
                      className="p-2 rounded-lg border bg-[#0D1117] border-[#21262D] hover:border-green-500 text-white flex flex-col items-center cursor-pointer"
                    >
                      <span className="text-[10px] text-gray-400">3.5 Alt</span>
                      <span className="text-xs font-bold font-mono mt-0.5">{match.odds?.under35 || 1.40}</span>
                    </button>
                    <button
                      onClick={() => handleSelectOdd('OVER_35', '3.5 Gol Üst', match.odds?.over35 || 2.80)}
                      className="p-2 rounded-lg border bg-[#0D1117] border-[#21262D] hover:border-green-500 text-white flex flex-col items-center cursor-pointer"
                    >
                      <span className="text-[10px] text-gray-400">3.5 Üst</span>
                      <span className="text-xs font-bold font-mono mt-0.5">{match.odds?.over35 || 2.80}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Toplam Gol Aralığı (TG) */}
              {!isBasketball && !isVolleyball && (
                <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-3.5 space-y-2.5">
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Toplam Gol Sayısı Aralığı (TG)</span>
                    <span className="text-[10px] text-yellow-400 font-mono">İddaa Klasik</span>
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => handleSelectOdd('TG_01', 'Toplam Gol: 0-1 Gol', match.odds?.tg01 || 3.40)}
                      className="p-2 rounded-lg border bg-[#0D1117] border-[#21262D] hover:border-green-500 text-white flex flex-col items-center cursor-pointer"
                    >
                      <span className="text-[10px] text-gray-400">0 - 1 Gol</span>
                      <span className="text-xs font-bold font-mono mt-0.5">{match.odds?.tg01 || 3.40}</span>
                    </button>
                    <button
                      onClick={() => handleSelectOdd('TG_23', 'Toplam Gol: 2-3 Gol', match.odds?.tg23 || 1.88)}
                      className="p-2 rounded-lg border bg-[#0D1117] border-[#21262D] hover:border-green-500 text-white flex flex-col items-center cursor-pointer"
                    >
                      <span className="text-[10px] text-gray-400">2 - 3 Gol</span>
                      <span className="text-xs font-bold font-mono mt-0.5">{match.odds?.tg23 || 1.88}</span>
                    </button>
                    <button
                      onClick={() => handleSelectOdd('TG_45', 'Toplam Gol: 4-5 Gol', match.odds?.tg45 || 3.10)}
                      className="p-2 rounded-lg border bg-[#0D1117] border-[#21262D] hover:border-green-500 text-white flex flex-col items-center cursor-pointer"
                    >
                      <span className="text-[10px] text-gray-400">4 - 5 Gol</span>
                      <span className="text-xs font-bold font-mono mt-0.5">{match.odds?.tg45 || 3.10}</span>
                    </button>
                    <button
                      onClick={() => handleSelectOdd('TG_6PLUS', 'Toplam Gol: 6+ Gol', match.odds?.tg6plus || 9.50)}
                      className="p-2 rounded-lg border bg-[#0D1117] border-[#21262D] hover:border-green-500 text-white flex flex-col items-center cursor-pointer"
                    >
                      <span className="text-[10px] text-gray-400">6+ Gol</span>
                      <span className="text-xs font-bold font-mono mt-0.5">{match.odds?.tg6plus || 9.50}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'pitch' && (
            <div className="space-y-3">
              <LivePitchTracker match={match} />
              <LiveMomentumVisualizer match={match} />
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-3">
              <LiveMomentumVisualizer match={match} />
              
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-[#21262D] pb-2.5">
                  <span className="font-bold text-green-400 text-xs truncate max-w-[140px]">{match.homeTeam.name}</span>
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Detaylı Karşılaştırmalı İstatistikler</span>
                  <span className="font-bold text-cyan-400 text-xs truncate max-w-[140px] text-right">{match.awayTeam.name}</span>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Possession */}
                  {(() => {
                    const hPoss = match.stats?.possession?.[0] || 52;
                    const aPoss = match.stats?.possession?.[1] || 48;
                    return (
                      <div>
                        <div className="flex justify-between text-gray-300 font-bold mb-1">
                          <span className="text-green-400">%{hPoss}</span>
                          <span className="text-gray-400 text-[10px]">Topa Sahip Olma</span>
                          <span className="text-cyan-400">%{aPoss}</span>
                        </div>
                        <div className="w-full h-2 bg-[#0D1117] rounded-full overflow-hidden flex">
                          <div className="bg-green-500 h-full" style={{ width: `${hPoss}%` }} />
                          <div className="bg-cyan-500 h-full" style={{ width: `${aPoss}%` }} />
                        </div>
                      </div>
                    );
                  })()}

                  {/* xG */}
                  {(() => {
                    const hXg = Number(match.stats?.xg?.[0] || 1.45);
                    const aXg = Number(match.stats?.xg?.[1] || 0.95);
                    const totalXg = (hXg + aXg) || 1;
                    const hPct = Math.round((hXg / totalXg) * 100);
                    const aPct = 100 - hPct;
                    return (
                      <div>
                        <div className="flex justify-between text-gray-300 font-bold mb-1">
                          <span className="text-green-400">{hXg.toFixed(2)}</span>
                          <span className="text-gray-400 text-[10px]">Beklenen Gol (xG)</span>
                          <span className="text-cyan-400">{aXg.toFixed(2)}</span>
                        </div>
                        <div className="w-full h-2 bg-[#0D1117] rounded-full overflow-hidden flex">
                          <div className="bg-green-500 h-full" style={{ width: `${hPct}%` }} />
                          <div className="bg-cyan-500 h-full" style={{ width: `${aPct}%` }} />
                        </div>
                      </div>
                    );
                  })()}

                  {/* Shots Total */}
                  {(() => {
                    const hShots = match.stats?.shotsTotal?.[0] || 12;
                    const aShots = match.stats?.shotsTotal?.[1] || 8;
                    const total = (hShots + aShots) || 1;
                    const hPct = Math.round((hShots / total) * 100);
                    return (
                      <div>
                        <div className="flex justify-between text-gray-300 font-bold mb-1">
                          <span className="text-green-400">{hShots}</span>
                          <span className="text-gray-400 text-[10px]">Toplam Şut</span>
                          <span className="text-cyan-400">{aShots}</span>
                        </div>
                        <div className="w-full h-2 bg-[#0D1117] rounded-full overflow-hidden flex">
                          <div className="bg-green-500 h-full" style={{ width: `${hPct}%` }} />
                          <div className="bg-cyan-500 h-full" style={{ width: `${100 - hPct}%` }} />
                        </div>
                      </div>
                    );
                  })()}

                  {/* Shots On Target */}
                  {(() => {
                    const hTarget = match.stats?.shotsOnTarget?.[0] || 5;
                    const aTarget = match.stats?.shotsOnTarget?.[1] || 3;
                    const total = (hTarget + aTarget) || 1;
                    const hPct = Math.round((hTarget / total) * 100);
                    return (
                      <div>
                        <div className="flex justify-between text-gray-300 font-bold mb-1">
                          <span className="text-green-400">{hTarget}</span>
                          <span className="text-gray-400 text-[10px]">İsabetli Şut</span>
                          <span className="text-cyan-400">{aTarget}</span>
                        </div>
                        <div className="w-full h-2 bg-[#0D1117] rounded-full overflow-hidden flex">
                          <div className="bg-green-500 h-full" style={{ width: `${hPct}%` }} />
                          <div className="bg-cyan-500 h-full" style={{ width: `${100 - hPct}%` }} />
                        </div>
                      </div>
                    );
                  })()}

                  {/* Dangerous Attacks */}
                  {(() => {
                    const hDang = match.stats?.dangerousAttacks?.[0] || 48;
                    const aDang = match.stats?.dangerousAttacks?.[1] || 38;
                    const total = (hDang + aDang) || 1;
                    const hPct = Math.round((hDang / total) * 100);
                    return (
                      <div>
                        <div className="flex justify-between text-gray-300 font-bold mb-1">
                          <span className="text-green-400">{hDang}</span>
                          <span className="text-gray-400 text-[10px]">Tehlikeli Atak</span>
                          <span className="text-cyan-400">{aDang}</span>
                        </div>
                        <div className="w-full h-2 bg-[#0D1117] rounded-full overflow-hidden flex">
                          <div className="bg-green-500 h-full" style={{ width: `${hPct}%` }} />
                          <div className="bg-cyan-500 h-full" style={{ width: `${100 - hPct}%` }} />
                        </div>
                      </div>
                    );
                  })()}

                  {/* Corners */}
                  {(() => {
                    const hCorners = match.stats?.corners?.[0] || 6;
                    const aCorners = match.stats?.corners?.[1] || 4;
                    const total = (hCorners + aCorners) || 1;
                    const hPct = Math.round((hCorners / total) * 100);
                    return (
                      <div>
                        <div className="flex justify-between text-gray-300 font-bold mb-1">
                          <span className="text-green-400">{hCorners}</span>
                          <span className="text-gray-400 text-[10px]">Korner</span>
                          <span className="text-cyan-400">{aCorners}</span>
                        </div>
                        <div className="w-full h-2 bg-[#0D1117] rounded-full overflow-hidden flex">
                          <div className="bg-green-500 h-full" style={{ width: `${hPct}%` }} />
                          <div className="bg-cyan-500 h-full" style={{ width: `${100 - hPct}%` }} />
                        </div>
                      </div>
                    );
                  })()}

                  {/* Fouls & Cards */}
                  {(() => {
                    const hFouls = match.stats?.fouls?.[0] || 11;
                    const aFouls = match.stats?.fouls?.[1] || 14;
                    const hYellow = match.stats?.yellowCards?.[0] || 2;
                    const aYellow = match.stats?.yellowCards?.[1] || 3;
                    return (
                      <div className="pt-2 border-t border-[#21262D] grid grid-cols-2 gap-3">
                        <div className="bg-[#0D1117] p-2.5 rounded-lg border border-[#21262D] flex items-center justify-between">
                          <span className="text-[10px] text-gray-400">Faul Sayısı</span>
                          <span className="font-bold text-white font-mono">{hFouls} - {aFouls}</span>
                        </div>
                        <div className="bg-[#0D1117] p-2.5 rounded-lg border border-[#21262D] flex items-center justify-between">
                          <span className="text-[10px] text-gray-400">Sarı Kartlar</span>
                          <span className="font-bold text-yellow-400 font-mono">{hYellow} - {aYellow}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="space-y-3">
              <TeamFormTrendsChart match={match} />
            </div>
          )}
        </div>

        {/* Modal Bottom Sticky Bar */}
        <div className="p-3 bg-[#161B22] border-t border-[#21262D] flex items-center justify-between shrink-0">
          <div className="text-[11px] text-gray-400 font-sans hidden sm:block">
            {match.homeTeam.name} vs {match.awayTeam.name}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#21262D] hover:bg-[#30363D] active:bg-red-500/20 active:text-red-400 text-white font-bold text-xs flex items-center justify-center gap-2 border border-[#30363D] transition-colors cursor-pointer ml-auto"
          >
            <X className="w-4 h-4" />
            <span>Pencereyi Kapat</span>
          </button>
        </div>
      </div>
    </div>
  );
};
