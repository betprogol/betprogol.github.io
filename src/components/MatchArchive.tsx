import React, { useState, useMemo } from 'react';
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
  BarChart3
} from 'lucide-react';
import { MOCK_ARCHIVE_MATCHES } from '../data/mockData';
import { Match } from '../types/betting';
import { TeamLogo } from './TeamLogo';

interface MatchArchiveProps {
  onSelectMatch?: (match: Match) => void;
}

export const MatchArchive: React.FC<MatchArchiveProps> = ({ onSelectMatch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeague, setSelectedLeague] = useState<string>('ALL');

  const filteredArchive = useMemo(() => {
    return MOCK_ARCHIVE_MATCHES.filter(m => {
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
  }, [searchQuery, selectedLeague]);

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
              Geçmiş Karşılaşmalar & H2H Arşivi
            </h2>
            <p className="text-[11px] text-gray-400 font-sans">
              Tamamlanmış maç sonuçları, kapanış oranları ve gol istatistikleri
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
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

      {/* Archive Match List */}
      <div className="space-y-2.5">
        {filteredArchive.map(match => (
          <div
            key={match.id}
            className="bg-[#0F1115] border border-[#1F2937] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-gray-600 transition-colors shadow-sm"
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
                  <span>• {match.date}</span>
                </div>
                <h4 className="font-bold text-white text-sm mt-0.5">
                  {match.homeTeam.name} <span className="text-green-400 font-mono font-black mx-1">{match.homeScore} - {match.awayScore}</span> {match.awayTeam.name}
                </h4>
                {match.halftimeScore && (
                  <span className="text-[10px] text-gray-500 font-mono">
                    (İY: {match.halftimeScore})
                  </span>
                )}
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
    </div>
  );
};
