import React, { useState, useEffect, useMemo } from 'react';
import { 
  Archive, 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  TrendingUp, 
  ChevronRight,
  Layers,
  Sparkles,
  BarChart3,
  RotateCw
} from 'lucide-react';
import { Match } from '../types/betting';
import { TeamLogo } from './TeamLogo';
import { fetchLiveMatchesFromWeb } from '../services/liveFootballService';

interface MatchArchiveProps {
  onSelectMatch?: (match: Match) => void;
}

export const MatchArchive: React.FC<MatchArchiveProps> = ({ onSelectMatch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeague, setSelectedLeague] = useState<string>('ALL');
  const [archiveMatches, setArchiveMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadArchiveData = async () => {
      setIsLoading(true);
      try {
        const res = await fetchLiveMatchesFromWeb('all', 'yesterday', undefined, 'ALL', 'ALL', undefined, true);
        if (res.matches && res.matches.length > 0) {
          setArchiveMatches(res.matches.filter(m => m.status === 'FINISHED' || m.homeScore !== undefined));
        }
      } catch (err) {
        console.warn('Archive fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadArchiveData();
  }, []);

  const leagues = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    archiveMatches.forEach(m => {
      if (m.leagueId && !map.has(m.leagueId)) {
        map.set(m.leagueId, { id: m.leagueId, name: m.leagueName });
      }
    });
    return Array.from(map.values());
  }, [archiveMatches]);

  const filteredArchive = useMemo(() => {
    return archiveMatches.filter(m => {
      if (selectedLeague !== 'ALL' && m.leagueId !== selectedLeague) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const home = m.homeTeam.name.toLowerCase().includes(q);
        const away = m.awayTeam.name.toLowerCase().includes(q);
        const league = m.leagueName.toLowerCase().includes(q);
        if (!home && !away && !league) return false;
      }
      return true;
    });
  }, [archiveMatches, searchQuery, selectedLeague]);

  return (
    <div className="space-y-4 font-mono">
      {/* Header Banner */}
      <div className="bg-[#0F1115] border border-[#1F2937] rounded-xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 border border-green-500/30 flex items-center justify-center font-bold">
            <Archive className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Geçmiş Karşılaşmalar & Canlı Skor Arşivi
            </h2>
            <p className="text-[11px] text-gray-400 font-sans">
              Resmi tamamlanmış maç skorları, istatistikler ve kapanış oranları
            </p>
          </div>
        </div>

        {/* Search & League Controls */}
        <div className="flex items-center gap-2">
          {leagues.length > 0 && (
            <select
              value={selectedLeague}
              onChange={e => setSelectedLeague(e.target.value)}
              className="bg-[#161B22] border border-[#30363D] text-gray-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-green-500"
            >
              <option value="ALL">Tüm Ligler</option>
              {leagues.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          )}

          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Takım veya lig ara..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#161B22] border border-[#30363D] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-green-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Archive Match List */}
      {isLoading ? (
        <div className="bg-[#0F1115] border border-[#1F2937] rounded-xl p-8 text-center text-gray-400 text-xs flex items-center justify-center gap-2">
          <RotateCw className="w-4 h-4 text-green-400 animate-spin" />
          <span>Resmi maç arşivi ve sonuçlar yükleniyor...</span>
        </div>
      ) : filteredArchive.length === 0 ? (
        <div className="bg-[#0F1115] border border-[#1F2937] rounded-xl p-8 text-center text-gray-400 text-xs">
          Henüz arşivlenmiş maç kaydı bulunamadı.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredArchive.map(match => (
            <div
              key={match.id}
              onClick={() => onSelectMatch && onSelectMatch(match)}
              className="bg-[#0F1115] border border-[#1F2937] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-green-500/40 transition-colors shadow-sm cursor-pointer"
            >
              {/* Match info */}
              <div className="flex items-center gap-3">
                <TeamLogo 
                  logo={match.leagueLogo} 
                  fallback={match.sport === 'BASKETBALL' ? '🏀' : (match.sport === 'VOLLEYBALL' ? '🏐' : '⚽')} 
                  className="w-6 h-6 shrink-0" 
                  alt={match.leagueName} 
                />
                <div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <span className="font-bold text-gray-300">{match.leagueName}</span>
                    <span>• {match.date} {match.time}</span>
                    <span className="px-1.5 py-0.2 rounded bg-gray-800 text-gray-300 text-[9px] font-bold">MS</span>
                  </div>
                  <h4 className="font-bold text-white text-sm mt-0.5">
                    {match.homeTeam.name} <span className="text-green-400 font-mono font-black mx-1">{match.homeScore ?? 0} - {match.awayScore ?? 0}</span> {match.awayTeam.name}
                  </h4>
                </div>
              </div>

              {/* Closing Odds Snapshot */}
              <div className="flex items-center gap-2 text-xs">
                <div className="bg-[#161B22] px-2.5 py-1 rounded border border-[#30363D] text-center">
                  <span className="text-[9px] text-gray-400 block">MS 1</span>
                  <span className="font-bold text-white font-mono">{match.odds?.ms1 || 1.85}</span>
                </div>
                <div className="bg-[#161B22] px-2.5 py-1 rounded border border-[#30363D] text-center">
                  <span className="text-[9px] text-gray-400 block">MS X</span>
                  <span className="font-bold text-white font-mono">{match.odds?.msX || 3.30}</span>
                </div>
                <div className="bg-[#161B22] px-2.5 py-1 rounded border border-[#30363D] text-center">
                  <span className="text-[9px] text-gray-400 block">MS 2</span>
                  <span className="font-bold text-white font-mono">{match.odds?.ms2 || 1.95}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
