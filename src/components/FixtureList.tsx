import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Sparkles, 
  Plus, 
  Check, 
  TrendingUp, 
  Flame, 
  Tv, 
  Radio, 
  Activity, 
  ChevronRight,
  Shield,
  ShieldCheck,
  Layers,
  Zap,
  Info,
  Clock,
  Dumbbell,
  Target,
  Crown,
  Share2,
  Lock,
  RotateCw,
  Globe
} from 'lucide-react';
import { Match, BetSlipSelection, SportType } from '../types/betting';
import { TeamLogo } from './TeamLogo';
import { LivePitchTracker } from './LivePitchTracker';
import { TeamFormTrendsChart } from './TeamFormTrendsChart';
import { isMarketLiveActive, formatMatchTimeDisplay } from '../utils/liveMarketLogic';

interface FixtureListProps {
  matches: Match[];
  onSelectMatch: (match: Match) => void;
  onAddSelection: (selection: BetSlipSelection) => void;
  activeSelections: BetSlipSelection[];
  onOpenAIForMatch: (match: Match) => void;
  selectedSport: SportType | 'ALL';
  setSelectedSport: (sport: SportType | 'ALL') => void;
  onManualRefresh?: () => void;
  isSyncing?: boolean;
}

export const FixtureList: React.FC<FixtureListProps> = ({
  matches,
  onSelectMatch,
  onAddSelection,
  activeSelections,
  onOpenAIForMatch,
  selectedSport,
  setSelectedSport,
  onManualRefresh,
  isSyncing = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'ALL' | 'LIVE' | 'TODAY' | 'AI_PICKS'>('ALL');
  const [selectedLeagueFilter, setSelectedLeagueFilter] = useState<string>('ALL');
  const [expandedPitchMatchId, setExpandedPitchMatchId] = useState<string | null>(null);
  const [expandedTrendsMatchId, setExpandedTrendsMatchId] = useState<string | null>(null);

  const prevOddsRef = useRef<Record<string, { ms1?: number; msX?: number; ms2?: number; over25?: number; overTotalPoints?: number }>>({});
  const [oddsFlash, setOddsFlash] = useState<Record<string, 'up' | 'down'>>({});

  useEffect(() => {
    const newFlashes: Record<string, 'up' | 'down'> = {};
    matches.forEach(m => {
      const prev = prevOddsRef.current[m.id];
      const cur = m.odds;
      if (prev && cur) {
        if (prev.ms1 !== undefined && cur.ms1 !== undefined && prev.ms1 !== cur.ms1) {
          newFlashes[`${m.id}_ms1`] = cur.ms1 > prev.ms1 ? 'up' : 'down';
        }
        if (prev.msX !== undefined && cur.msX !== undefined && prev.msX !== cur.msX) {
          newFlashes[`${m.id}_msX`] = cur.msX > prev.msX ? 'up' : 'down';
        }
        if (prev.ms2 !== undefined && cur.ms2 !== undefined && prev.ms2 !== cur.ms2) {
          newFlashes[`${m.id}_ms2`] = cur.ms2 > prev.ms2 ? 'up' : 'down';
        }
        if (prev.over25 !== undefined && cur.over25 !== undefined && prev.over25 !== cur.over25) {
          newFlashes[`${m.id}_over25`] = cur.over25 > prev.over25 ? 'up' : 'down';
        }
        if (prev.overTotalPoints !== undefined && cur.overTotalPoints !== undefined && prev.overTotalPoints !== cur.overTotalPoints) {
          newFlashes[`${m.id}_overTotalPoints`] = cur.overTotalPoints > prev.overTotalPoints ? 'up' : 'down';
        }
      }
      prevOddsRef.current[m.id] = {
        ms1: cur?.ms1,
        msX: cur?.msX,
        ms2: cur?.ms2,
        over25: cur?.over25,
        overTotalPoints: cur?.overTotalPoints
      };
    });

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
  }, [matches]);

  // Sports definition with active counts
  const sportsList: { id: SportType | 'ALL'; label: string; icon: string }[] = [
    { id: 'ALL', label: 'Tüm Branşlar', icon: '🌐' },
    { id: 'FOOTBALL', label: 'Futbol', icon: '⚽' },
    { id: 'BASKETBALL', label: 'Basketbol', icon: '🏀' },
    { id: 'VOLLEYBALL', label: 'Voleybol', icon: '🏐' },
    { id: 'TENNIS', label: 'Tenis', icon: '🎾' },
    { id: 'TABLE_TENNIS', label: 'Masa Tenisi', icon: '🏓' },
    { id: 'HANDBALL', label: 'Hentbol', icon: '🤾' }
  ];

  // Distinct leagues for filter dropdown
  const leagues = useMemo(() => {
    const map = new Map<string, { id: string; name: string; logo: string; country: string }>();
    matches.forEach(m => {
      if (m.leagueId && !map.has(m.leagueId)) {
        map.set(m.leagueId, {
          id: m.leagueId,
          name: m.leagueName,
          logo: m.leagueLogo || '⚽',
          country: m.country
        });
      }
    });
    return Array.from(map.values());
  }, [matches]);

  // Istanbul today date string
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' });

  // Filtering logic
  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
      // Sport filter
      if (selectedSport !== 'ALL' && match.sport !== selectedSport) {
        return false;
      }

      // League filter
      if (selectedLeagueFilter !== 'ALL' && match.leagueId !== selectedLeagueFilter) {
        return false;
      }

      // Status / Special filter
      if (selectedStatusFilter === 'LIVE' && match.status !== 'LIVE') {
        return false;
      }
      if (selectedStatusFilter === 'TODAY' && match.date !== todayStr && match.status !== 'LIVE') {
        return false;
      }
      if (selectedStatusFilter === 'AI_PICKS' && !match.aiSuggested && !match.hasKralOran) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const homeMatch = match.homeTeam.name.toLowerCase().includes(q);
        const awayMatch = match.awayTeam.name.toLowerCase().includes(q);
        const leagueMatch = match.leagueName.toLowerCase().includes(q);
        const codeMatch = match.matchCode.includes(q);
        if (!homeMatch && !awayMatch && !leagueMatch && !codeMatch) {
          return false;
        }
      }

      return true;
    });
  }, [matches, selectedSport, selectedLeagueFilter, selectedStatusFilter, searchQuery, todayStr]);

  // Check if a specific market selection is active in slip
  const isSelectionActive = (matchId: string, market: any) => {
    return activeSelections.some(s => s.matchId === matchId && s.market === market);
  };

  // Helper to handle odd selection click
  const handleOddClick = (e: React.MouseEvent, match: Match, market: any, label: string, odds: number | undefined) => {
    e.stopPropagation();
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

  const liveMatches = matches.filter(m => m.status === 'LIVE');

  return (
    <div className="space-y-4 font-mono">
      {/* Top Banner / Sports Selector Bar */}
      <div className="bg-[#0F1115] border border-[#1F2937] rounded-xl p-3 shadow-md space-y-3">
        {/* Sports Horizontal Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {sportsList.map(sport => {
            const isSelected = selectedSport === sport.id;
            const count = sport.id === 'ALL' 
              ? matches.length 
              : matches.filter(m => m.sport === sport.id).length;

            return (
              <button
                key={sport.id}
                onClick={() => setSelectedSport(sport.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-green-500 text-black shadow-md shadow-green-500/20'
                    : 'bg-[#161B22] text-gray-300 hover:text-white hover:bg-[#1F2937] border border-[#30363D]'
                }`}
              >
                <span>{sport.icon}</span>
                <span>{sport.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isSelected ? 'bg-black/20 text-black' : 'bg-[#0D1117] text-gray-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Filter Buttons & Search Input */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-2.5 pt-1">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                selectedStatusFilter === 'ALL'
                  ? 'bg-[#1F2937] text-white border border-[#30363D]'
                  : 'text-gray-400 hover:text-white bg-[#161B22]'
              }`}
            >
              Tümü ({matches.length})
            </button>
            <button
              onClick={() => setSelectedStatusFilter('LIVE')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedStatusFilter === 'LIVE'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-sm'
                  : 'text-gray-400 hover:text-red-400 bg-[#161B22]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>Canlı Maçlar ({liveMatches.length})</span>
            </button>
            <button
              onClick={() => setSelectedStatusFilter('TODAY')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                selectedStatusFilter === 'TODAY'
                  ? 'bg-[#1F2937] text-white border border-[#30363D]'
                  : 'text-gray-400 hover:text-white bg-[#161B22]'
              }`}
            >
              Bugünkü Bülten
            </button>
            <button
              onClick={() => setSelectedStatusFilter('AI_PICKS')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                selectedStatusFilter === 'AI_PICKS'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/40 shadow-sm'
                  : 'text-gray-400 hover:text-green-400 bg-[#161B22]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-green-400" />
              <span>AI Değerli Oranlar</span>
            </button>
          </div>

          {/* Search Field & League Dropdown */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            {/* League Dropdown */}
            <select
              value={selectedLeagueFilter}
              onChange={e => setSelectedLeagueFilter(e.target.value)}
              className="w-full sm:w-auto bg-[#161B22] border border-[#30363D] text-gray-300 text-xs rounded-md px-2.5 py-1.5 focus:outline-none focus:border-green-500 font-mono"
            >
              <option value="ALL">Tüm Ligler & Turnuvalar</option>
              {leagues.map(l => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>

            {/* Search Input & Refresh Button */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <div className="relative w-full sm:w-52">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Takım, lig veya kod..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#161B22] border border-[#30363D] rounded-md pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-green-500 font-mono"
                />
              </div>

              {onManualRefresh && (
                <button
                  onClick={() => onManualRefresh()}
                  disabled={isSyncing}
                  title="Canlı Bülteni ve Maçları Yenile (RapidAPI & Football-Data.org)"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/40 transition-all cursor-pointer whitespace-nowrap active:scale-95 disabled:opacity-50"
                >
                  <RotateCw className={`w-3.5 h-3.5 text-green-400 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{isSyncing ? 'Senkronize Ediliyor...' : 'Yenile'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Live Active API Feeds Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1F2937]/70 text-[10px] text-gray-400 font-mono">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="flex items-center gap-1 text-green-400 bg-green-950/40 border border-green-500/30 px-2 py-0.5 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping"></span>
              <Zap className="w-2.5 h-2.5 text-green-400" />
              <span>RapidAPI Canlı</span>
            </span>
            <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
              <span>Football-Data.org</span>
            </span>
            <span className="flex items-center gap-1 text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded">
              <Activity className="w-2.5 h-2.5 text-cyan-400" />
              <span>TheSportsDB</span>
            </span>
            <span className="flex items-center gap-1 text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded">
              <Globe className="w-2.5 h-2.5 text-amber-400" />
              <span>ESPN & OpenLiga</span>
            </span>
          </div>
          <span className="text-gray-400 flex items-center gap-1">
            <Radio className="w-2.5 h-2.5 text-green-400 animate-pulse" />
            <span>5 API Canlı Akışı Aktif</span>
          </span>
        </div>
      </div>

      {/* Fixtures Feed / Cards List */}
      <div className="space-y-3">
        {filteredMatches.length === 0 ? (
          <div className="bg-[#0F1115] border border-[#1F2937] rounded-xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#161B22] border border-[#30363D] flex items-center justify-center mx-auto text-gray-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase">Aradığınız Kriterde Karşılaşma Bulunamadı</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto font-sans">
              Filtreleri sıfırlayabilir veya diğer spor branşlarını inceleyebilirsiniz.
            </p>
            <button
              onClick={() => {
                setSelectedSport('ALL');
                setSelectedStatusFilter('ALL');
                setSelectedLeagueFilter('ALL');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-green-500 text-black font-bold text-xs rounded-md uppercase tracking-wider hover:bg-green-400 transition"
            >
              Filtreleri Temizle
            </button>
          </div>
        ) : (
          filteredMatches.map(match => {
            const isLive = match.status === 'LIVE';
            const isBasketball = match.sport === 'BASKETBALL';
            const isVolleyball = match.sport === 'VOLLEYBALL';
            const isPitchOpen = expandedPitchMatchId === match.id;

            return (
              <div
                key={match.id}
                className={`bg-[#0F1115] border rounded-xl overflow-hidden transition-all shadow-md hover:border-gray-600 ${
                  isLive 
                    ? 'border-green-500/40 ring-1 ring-green-500/20' 
                    : 'border-[#1F2937]'
                }`}
              >
                {/* Match Header Bar */}
                <div className="bg-[#161B22] px-3 py-2 border-b border-[#21262D] flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 min-w-0 max-w-full overflow-hidden">
                    <TeamLogo 
                      logo={match.leagueLogo} 
                      fallback={match.sport === 'BASKETBALL' ? '🏀' : (match.sport === 'VOLLEYBALL' ? '🏐' : '⚽')} 
                      className="w-4 h-4 shrink-0" 
                      alt={match.leagueName} 
                    />
                    <span className="font-bold text-white truncate text-xs">{match.leagueName}</span>
                    <span className="text-[10px] text-gray-400 hidden sm:inline font-mono shrink-0">
                      • Kod: #{match.matchCode}
                    </span>
                    {match.mbs && (
                      <span className="text-[9px] px-1.5 py-0.2 bg-[#0D1117] text-amber-400 border border-amber-500/30 rounded font-bold shrink-0">
                        MBS {match.mbs}
                      </span>
                    )}
                    {match.hasKralOran && (
                      <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded font-black hidden sm:flex items-center gap-1 shrink-0">
                        <Crown className="w-2.5 h-2.5 text-amber-400" /> KRAL ORAN
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                    {/* Live Broadcast / Channel Info */}
                    {match.tvChannel && (
                      <span className="text-[10px] text-gray-300 bg-[#0D1117] px-1.5 py-0.5 rounded border border-[#30363D] hidden lg:flex items-center gap-1">
                        <Tv className="w-3 h-3 text-green-400" />
                        <span>{match.tvChannel}</span>
                      </span>
                    )}

                    {/* Status badge */}
                    {isLive ? (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-bold animate-pulse">
                        <Radio className="w-3 h-3" />
                        <span>CANLI {match.minute ? `${match.minute}'` : ''}</span>
                      </span>
                    ) : match.status === 'FINISHED' ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-400 font-bold">
                        BİTTİ
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-300 font-bold flex items-center gap-1 bg-[#0D1117] px-1.5 py-0.5 rounded border border-[#30363D]">
                        <Clock className="w-3 h-3 text-green-400" />
                        <span>{match.time || '20:00'}</span>
                        <span className="text-[9px] text-gray-400 font-mono font-semibold">TSİ</span>
                      </span>
                    )}

                    {/* 2D Pitch Tracker Toggle Button */}
                    <button
                      onClick={() => {
                        setExpandedPitchMatchId(isPitchOpen ? null : match.id);
                        if (!isPitchOpen) setExpandedTrendsMatchId(null);
                      }}
                      className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 border transition-colors cursor-pointer ${
                        isPitchOpen 
                          ? 'bg-green-500 text-black border-green-500' 
                          : 'bg-[#0D1117] text-green-400 border-green-500/40 hover:bg-[#1F2937]'
                      }`}
                      title="2D Saha Simülatörü ve Canlı Yayın Takibi"
                    >
                      <Activity className="w-3 h-3" />
                      <span>{isPitchOpen ? 'Sahayı Kapat' : '2D Saha'}</span>
                    </button>

                    {/* Team Form & Trends Chart Toggle Button */}
                    <button
                      onClick={() => {
                        const nextState = expandedTrendsMatchId === match.id ? null : match.id;
                        setExpandedTrendsMatchId(nextState);
                        if (nextState) setExpandedPitchMatchId(null);
                      }}
                      className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 border transition-colors cursor-pointer ${
                        expandedTrendsMatchId === match.id 
                          ? 'bg-cyan-500 text-black border-cyan-500 shadow-sm' 
                          : 'bg-[#0D1117] text-cyan-400 border-cyan-500/40 hover:bg-[#1F2937]'
                      }`}
                      title="Son 5 Maç Form ve Gol Dağılım Grafiğini Göster"
                    >
                      <TrendingUp className="w-3 h-3" />
                      <span className="hidden sm:inline">{expandedTrendsMatchId === match.id ? 'Gizle' : 'Form'}</span>
                      <span className="sm:hidden">{expandedTrendsMatchId === match.id ? '✕' : 'Form'}</span>
                    </button>

                    {/* AI Prediction Button */}
                    <button
                      onClick={() => onOpenAIForMatch(match)}
                      className="px-2 py-1 rounded bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Yapay Zeka Analiz Raporunu Aç"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>AI</span>
                    </button>
                  </div>
                </div>

                {/* 2D Live Pitch Accordion Container */}
                {isPitchOpen && (
                  <div className="p-3 bg-[#0A0B0E] border-b border-[#21262D] animate-in fade-in duration-200">
                    <LivePitchTracker match={match} onClose={() => setExpandedPitchMatchId(null)} />
                  </div>
                )}

                {/* Team Form & Goal Trends Chart Accordion Container */}
                {expandedTrendsMatchId === match.id && (
                  <div className="p-3.5 bg-[#0A0B0E] border-b border-[#21262D] animate-in fade-in duration-200">
                    <TeamFormTrendsChart match={match} />
                  </div>
                )}

                {/* Match Teams & Odds Body */}
                <div className="p-3.5 grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
                  {/* Left: Teams & Score */}
                  <div 
                    onClick={() => onSelectMatch(match)}
                    className="lg:col-span-6 cursor-pointer space-y-2 group"
                  >
                    {/* Home Team */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <TeamLogo logo={match.homeTeam.logo} fallback={match.sport === 'BASKETBALL' ? '🏀' : '⚽'} className="w-6 h-6" />
                        <span className="font-bold text-white text-sm group-hover:text-green-400 transition-colors">
                          {match.homeTeam.name}
                        </span>
                      </div>
                      <span className="font-black text-white text-base font-mono">
                        {match.homeScore ?? (isLive ? 0 : '-')}
                      </span>
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <TeamLogo logo={match.awayTeam.logo} fallback={match.sport === 'BASKETBALL' ? '🏀' : '⚽'} className="w-6 h-6" />
                        <span className="font-bold text-white text-sm group-hover:text-green-400 transition-colors">
                          {match.awayTeam.name}
                        </span>
                      </div>
                      <span className="font-black text-white text-base font-mono">
                        {match.awayScore ?? (isLive ? 0 : '-')}
                      </span>
                    </div>

                    {/* Stadium & Form Info */}
                    <div className="text-[10px] text-gray-500 flex items-center gap-2 pt-0.5">
                      <span>🏟️ {match.stadium || 'Şehir Stadyumu'}</span>
                      {match.homeTeam.leagueRank && (
                        <span>• Sıralama: #{match.homeTeam.leagueRank} vs #{match.awayTeam.leagueRank || '?'}</span>
                      )}
                    </div>
                  </div>

                  {/* Right: Betting Odds Grid (MS 1, X, 2, Over/Under, BTTS) */}
                  <div className="lg:col-span-6 grid grid-cols-3 sm:grid-cols-5 gap-1.5 text-center">
                    {/* MS 1 */}
                    {(() => {
                      const flash = oddsFlash[`${match.id}_ms1`];
                      const active = isSelectionActive(match.id, 'MS_1');
                      return (
                        <button
                          type="button"
                          disabled={!match.odds?.ms1}
                          onClick={e => handleOddClick(e, match, 'MS_1', `${match.homeTeam.name} (MS 1)`, match.odds?.ms1)}
                          className={`p-2 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
                            active
                              ? 'bg-green-500 border-green-500 text-black font-black shadow-md shadow-green-500/20'
                              : flash === 'up'
                              ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 animate-pulse shadow-lg shadow-emerald-500/40'
                              : flash === 'down'
                              ? 'bg-rose-500/30 border-rose-400 text-rose-200 animate-pulse shadow-lg shadow-rose-500/40'
                              : 'bg-[#161B22] border-[#30363D] hover:border-green-500/50 hover:bg-[#1F2937] text-white'
                          }`}
                        >
                          <span className="text-[9px] uppercase font-bold text-gray-400">MS 1</span>
                          <span className="text-xs font-black font-mono mt-0.5 flex items-center gap-1">
                            {match.odds?.ms1 ? Number(match.odds.ms1).toFixed(2) : '-'}
                            {flash === 'up' && <span className="text-emerald-400 text-[10px] animate-bounce">▲</span>}
                            {flash === 'down' && <span className="text-rose-400 text-[10px] animate-bounce">▼</span>}
                          </span>
                        </button>
                      );
                    })()}

                    {/* MS X (Draw) or Total Points */}
                    {isBasketball ? (
                      (() => {
                        const flash = oddsFlash[`${match.id}_overTotalPoints`];
                        const active = isSelectionActive(match.id, 'OVER_TOTAL_POINTS');
                        return (
                          <button
                            type="button"
                            disabled={!match.odds?.overTotalPoints}
                            onClick={e => handleOddClick(e, match, 'OVER_TOTAL_POINTS', `Toplam Üst (${match.odds?.totalPointsLine || 165.5})`, match.odds?.overTotalPoints)}
                            className={`p-2 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
                              active
                                ? 'bg-green-500 border-green-500 text-black font-black shadow-md shadow-green-500/20'
                                : flash === 'up'
                                ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 animate-pulse shadow-lg shadow-emerald-500/40'
                                : flash === 'down'
                                ? 'bg-rose-500/30 border-rose-400 text-rose-200 animate-pulse shadow-lg shadow-rose-500/40'
                                : 'bg-[#161B22] border-[#30363D] hover:border-green-500/50 hover:bg-[#1F2937] text-white'
                            }`}
                          >
                            <span className="text-[9px] uppercase font-bold text-gray-400">T. ÜST</span>
                            <span className="text-xs font-black font-mono mt-0.5 flex items-center gap-1">
                              {match.odds?.overTotalPoints ? Number(match.odds.overTotalPoints).toFixed(2) : '1.85'}
                              {flash === 'up' && <span className="text-emerald-400 text-[10px] animate-bounce">▲</span>}
                              {flash === 'down' && <span className="text-rose-400 text-[10px] animate-bounce">▼</span>}
                            </span>
                          </button>
                        );
                      })()
                    ) : (
                      (() => {
                        const flash = oddsFlash[`${match.id}_msX`];
                        const active = isSelectionActive(match.id, 'MS_X');
                        return (
                          <button
                            type="button"
                            disabled={!match.odds?.msX}
                            onClick={e => handleOddClick(e, match, 'MS_X', 'Beraberlik (MS X)', match.odds?.msX)}
                            className={`p-2 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
                              active
                                ? 'bg-green-500 border-green-500 text-black font-black shadow-md shadow-green-500/20'
                                : flash === 'up'
                                ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 animate-pulse shadow-lg shadow-emerald-500/40'
                                : flash === 'down'
                                ? 'bg-rose-500/30 border-rose-400 text-rose-200 animate-pulse shadow-lg shadow-rose-500/40'
                                : 'bg-[#161B22] border-[#30363D] hover:border-green-500/50 hover:bg-[#1F2937] text-white'
                            }`}
                          >
                            <span className="text-[9px] uppercase font-bold text-gray-400">MS X</span>
                            <span className="text-xs font-black font-mono mt-0.5 flex items-center gap-1">
                              {match.odds?.msX ? Number(match.odds.msX).toFixed(2) : '-'}
                              {flash === 'up' && <span className="text-emerald-400 text-[10px] animate-bounce">▲</span>}
                              {flash === 'down' && <span className="text-rose-400 text-[10px] animate-bounce">▼</span>}
                            </span>
                          </button>
                        );
                      })()
                    )}

                    {/* MS 2 */}
                    {(() => {
                      const flash = oddsFlash[`${match.id}_ms2`];
                      const active = isSelectionActive(match.id, 'MS_2');
                      return (
                        <button
                          type="button"
                          disabled={!match.odds?.ms2}
                          onClick={e => handleOddClick(e, match, 'MS_2', `${match.awayTeam.name} (MS 2)`, match.odds?.ms2)}
                          className={`p-2 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
                            active
                              ? 'bg-green-500 border-green-500 text-black font-black shadow-md shadow-green-500/20'
                              : flash === 'up'
                              ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 animate-pulse shadow-lg shadow-emerald-500/40'
                              : flash === 'down'
                              ? 'bg-rose-500/30 border-rose-400 text-rose-200 animate-pulse shadow-lg shadow-rose-500/40'
                              : 'bg-[#161B22] border-[#30363D] hover:border-green-500/50 hover:bg-[#1F2937] text-white'
                          }`}
                        >
                          <span className="text-[9px] uppercase font-bold text-gray-400">MS 2</span>
                          <span className="text-xs font-black font-mono mt-0.5 flex items-center gap-1">
                            {match.odds?.ms2 ? Number(match.odds.ms2).toFixed(2) : '-'}
                            {flash === 'up' && <span className="text-emerald-400 text-[10px] animate-bounce">▲</span>}
                            {flash === 'down' && <span className="text-rose-400 text-[10px] animate-bounce">▼</span>}
                          </span>
                        </button>
                      );
                    })()}

                    {/* 2.5 Alt / Üst or Basketball Handicap */}
                    {(() => {
                      const flash = oddsFlash[`${match.id}_over25`];
                      const active = isSelectionActive(match.id, 'OVER_25');
                      return (
                        <button
                          type="button"
                          disabled={!match.odds?.over25}
                          onClick={e => handleOddClick(e, match, 'OVER_25', '2.5 Gol Üstü', match.odds?.over25)}
                          className={`p-2 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
                            active
                              ? 'bg-green-500 border-green-500 text-black font-black shadow-md shadow-green-500/20'
                              : flash === 'up'
                              ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 animate-pulse shadow-lg shadow-emerald-500/40'
                              : flash === 'down'
                              ? 'bg-rose-500/30 border-rose-400 text-rose-200 animate-pulse shadow-lg shadow-rose-500/40'
                              : 'bg-[#161B22] border-[#30363D] hover:border-green-500/50 hover:bg-[#1F2937] text-white'
                          }`}
                        >
                          <span className="text-[9px] uppercase font-bold text-gray-400">{isBasketball ? 'HND' : '2.5 ÜST'}</span>
                          <span className="text-xs font-black font-mono mt-0.5 flex items-center gap-1">
                            {match.odds?.over25 ? Number(match.odds.over25).toFixed(2) : '1.75'}
                            {flash === 'up' && <span className="text-emerald-400 text-[10px] animate-bounce">▲</span>}
                            {flash === 'down' && <span className="text-rose-400 text-[10px] animate-bounce">▼</span>}
                          </span>
                        </button>
                      );
                    })()}

                    {/* KG Var / More Markets */}
                    <button
                      type="button"
                      onClick={() => onSelectMatch(match)}
                      className="p-2 rounded-lg border bg-[#161B22] border-[#30363D] hover:border-green-500 text-green-400 flex flex-col items-center justify-center transition-all cursor-pointer"
                    >
                      <span className="text-[9px] uppercase font-bold text-gray-400">MARKET</span>
                      <span className="text-xs font-bold font-mono mt-0.5 flex items-center gap-0.5">
                        +{match.marketsCount || 95}
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
