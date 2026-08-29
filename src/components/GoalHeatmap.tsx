import React, { useState } from 'react';
import { 
  Flame, 
  Clock, 
  Target, 
  Zap, 
  ShieldAlert, 
  ChevronDown, 
  TrendingUp, 
  Sparkles,
  BarChart2,
  PieChart
} from 'lucide-react';
import { Match, TeamInfo } from '../types/betting';
import { TEAMS_DATABASE } from '../data/mockData';
import { getTeamGoalHeatmapStats, TeamGoalHeatmapStats } from '../data/statsData';
import { TeamLogo } from './TeamLogo';

interface GoalHeatmapProps {
  matches?: Match[];
}

export const GoalHeatmap: React.FC<GoalHeatmapProps> = ({ matches = [] }) => {
  // Extract unique teams from current fixtures or fallback to TEAMS_DATABASE
  const availableTeams = React.useMemo(() => {
    const list: { id: string; name: string; logo: string; leagueName: string }[] = [];
    const seen = new Set<string>();

    if (matches && matches.length > 0) {
      matches.forEach(m => {
        if (!seen.has(m.homeTeam.name)) {
          seen.add(m.homeTeam.name);
          list.push({ id: m.homeTeam.id, name: m.homeTeam.name, logo: m.homeTeam.logo, leagueName: m.leagueName });
        }
        if (!seen.has(m.awayTeam.name)) {
          seen.add(m.awayTeam.name);
          list.push({ id: m.awayTeam.id, name: m.awayTeam.name, logo: m.awayTeam.logo, leagueName: m.leagueName });
        }
      });
    }

    TEAMS_DATABASE.forEach(t => {
      if (!seen.has(t.name)) {
        seen.add(t.name);
        list.push({ id: t.id, name: t.name, logo: t.logo, leagueName: t.leagueName });
      }
    });

    return list;
  }, [matches]);

  const [selectedTeamName, setSelectedTeamName] = useState<string>('Galatasaray');
  const [viewMode, setViewMode] = useState<'SCORED' | 'CONCEDED' | 'NET'>('SCORED');

  const selectedTeamInfo = availableTeams.find(t => t.name === selectedTeamName) || availableTeams[0];
  const stats: TeamGoalHeatmapStats = getTeamGoalHeatmapStats(selectedTeamInfo.name, selectedTeamInfo.logo);

  // Find max value to calibrate bar heights and intensity colors
  const maxScored = Math.max(...stats.intervals.map(i => i.goalsScored), 1);
  const maxConceded = Math.max(...stats.intervals.map(i => i.goalsConceded), 1);

  return (
    <div className="bg-[#0F1115] border border-[#1F2937] rounded-xl p-4 sm:p-5 space-y-5 font-mono shadow-xl text-[#E0E0E0]">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#161B22] p-4 rounded-xl border border-[#30363D]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              15'er Dakikalık Gol Isı Haritası
            </h3>
            <p className="text-[11px] text-gray-400 font-sans">
              Takımların maçın hangi zaman diliminde daha fazla gol attığını veya yediğini analiz edin
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Team Dropdown */}
          <div className="relative min-w-[200px] flex-1 sm:flex-none">
            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1 font-sans">
              Takım Seç:
            </label>
            <div className="relative">
              <select
                value={selectedTeamName}
                onChange={e => setSelectedTeamName(e.target.value)}
                className="w-full bg-[#0D1117] border border-[#30363D] hover:border-amber-500/50 text-white text-xs font-bold rounded-lg px-3 py-2 pr-8 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {availableTeams.map(t => (
                  <option key={t.id} value={t.name}>
                    {t.name} ({t.leagueName})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex-1 sm:flex-none">
            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1 font-sans">
              Metrik Modu:
            </label>
            <div className="flex bg-[#0D1117] border border-[#30363D] p-1 rounded-lg gap-1">
              <button
                type="button"
                onClick={() => setViewMode('SCORED')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  viewMode === 'SCORED'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Target className="w-3 h-3" />
                <span>Atılan Gol</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('CONCEDED')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  viewMode === 'CONCEDED'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <ShieldAlert className="w-3 h-3" />
                <span>Yenilen Gol</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('NET')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  viewMode === 'NET'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-3 h-3" />
                <span>Net Etki</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Team Profile Summary */}
      <div className="bg-[#161B22] p-3.5 rounded-xl border border-[#30363D] flex items-center justify-between flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-3">
          <TeamLogo logo={selectedTeamInfo.logo} fallback="⚽" className="w-8 h-8 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-sm">{selectedTeamInfo.name}</span>
              <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700 text-[10px]">
                {selectedTeamInfo.leagueName}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-sans">
              Son {stats.totalMatches} Lig Maçının Zaman Dilimi Analizi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-center font-mono">
          <div className="bg-[#0D1117] px-3 py-1.5 rounded-lg border border-[#21262D]">
            <span className="text-[10px] text-gray-400 block font-sans">Toplam Gol (Atılan/Yenilen)</span>
            <span className="text-white font-black text-sm">
              <span className="text-emerald-400">{stats.totalGoalsScored}</span> / <span className="text-red-400">{stats.totalGoalsConceded}</span>
            </span>
          </div>
          <div className="bg-[#0D1117] px-3 py-1.5 rounded-lg border border-[#21262D]">
            <span className="text-[10px] text-gray-400 block font-sans">En Zirve Periyot</span>
            <span className="text-amber-400 font-bold text-xs">{stats.peakScoringInterval}</span>
          </div>
        </div>
      </div>

      {/* 15-Minute Interval Heatmap Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-400 font-sans">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Maç İçi 15'er Dakikalık Zaman Dilimleri
          </span>
          <span className="text-[11px]">
            {viewMode === 'SCORED' ? 'Atılan Gol Dağılımı (%)' : (viewMode === 'CONCEDED' ? 'Yenilen Gol Dağılımı (%)' : 'Net Averaj Farkı')}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {stats.intervals.map((item, idx) => {
            const count = viewMode === 'SCORED' ? item.goalsScored : (viewMode === 'CONCEDED' ? item.goalsConceded : item.goalsScored - item.goalsConceded);
            const pct = viewMode === 'SCORED' ? item.scoredPct : (viewMode === 'CONCEDED' ? item.concededPct : Math.round((count / (stats.totalGoalsScored || 1)) * 100));
            const maxVal = viewMode === 'SCORED' ? maxScored : (viewMode === 'CONCEDED' ? maxConceded : Math.max(maxScored, maxConceded));
            const barHeightPct = Math.min(Math.max(Math.round((Math.abs(count) / maxVal) * 100), 12), 100);

            // Styling colors based on intensity
            let cardClass = 'bg-[#161B22] border-[#30363D]';
            let barColor = 'bg-emerald-500';
            let textColor = 'text-emerald-400';

            if (viewMode === 'SCORED') {
              if (pct >= 25) {
                cardClass = 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-900/20';
                barColor = 'bg-gradient-to-t from-emerald-600 to-emerald-400';
                textColor = 'text-emerald-300 font-black';
              } else if (pct >= 18) {
                cardClass = 'bg-emerald-900/20 border-emerald-500/40';
                barColor = 'bg-emerald-500';
                textColor = 'text-emerald-400';
              } else if (pct >= 12) {
                cardClass = 'bg-[#161B22] border-[#30363D]';
                barColor = 'bg-emerald-600/70';
                textColor = 'text-gray-200';
              } else {
                cardClass = 'bg-[#0D1117] border-[#21262D] opacity-75';
                barColor = 'bg-gray-700';
                textColor = 'text-gray-400';
              }
            } else if (viewMode === 'CONCEDED') {
              if (pct >= 25) {
                cardClass = 'bg-red-950/40 border-red-500/60 shadow-lg shadow-red-900/20';
                barColor = 'bg-gradient-to-t from-red-600 to-red-400';
                textColor = 'text-red-300 font-black';
              } else if (pct >= 18) {
                cardClass = 'bg-red-900/20 border-red-500/40';
                barColor = 'bg-red-500';
                textColor = 'text-red-400';
              } else {
                cardClass = 'bg-[#161B22] border-[#30363D]';
                barColor = 'bg-red-600/70';
                textColor = 'text-gray-300';
              }
            } else { // NET
              if (count > 0) {
                cardClass = 'bg-amber-950/30 border-amber-500/50';
                barColor = 'bg-amber-500';
                textColor = 'text-amber-400';
              } else if (count < 0) {
                cardClass = 'bg-red-950/30 border-red-500/50';
                barColor = 'bg-red-500';
                textColor = 'text-red-400';
              } else {
                cardClass = 'bg-[#161B22] border-[#30363D]';
                barColor = 'bg-gray-600';
                textColor = 'text-gray-400';
              }
            }

            return (
              <div 
                key={idx}
                className={`border rounded-xl p-3 flex flex-col justify-between relative overflow-hidden transition-all hover:scale-[1.02] ${cardClass}`}
              >
                {/* Interval Label & Range */}
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-white text-xs">{item.interval}</span>
                  <span className="text-[10px] text-gray-400 font-sans">{item.timeRange}</span>
                </div>

                {/* Big Stat Display */}
                <div className="my-2 text-center">
                  <div className={`text-xl sm:text-2xl font-black ${textColor}`}>
                    {viewMode === 'NET' ? (count > 0 ? `+${count}` : count) : `${count} Gol`}
                  </div>
                  <div className="text-[11px] font-bold text-gray-300">
                    %{pct} Oran
                  </div>
                  <div className="text-[10px] text-gray-400 font-sans mt-0.5">
                    {item.avgScoredPerMatch} /maç
                  </div>
                </div>

                {/* Vertical Progress Visual Bar */}
                <div className="w-full h-2.5 bg-[#0D1117] rounded-full overflow-hidden mt-1 border border-[#21262D]">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`} 
                    style={{ width: `${barHeightPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* First Half vs Second Half Breakdown Bar */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-cyan-400" />
            <span>1. Yarı (0'-45') vs 2. Yarı (46'-90'+) Gol Dağılımı</span>
          </span>
          <span className="text-gray-400 font-mono text-[11px]">
            {stats.firstHalfGoalsPct}% vs {stats.secondHalfGoalsPct}%
          </span>
        </div>

        {/* Dual Progress Bar */}
        <div className="w-full h-4 bg-[#0D1117] rounded-full overflow-hidden flex border border-[#30363D]">
          <div 
            className="bg-cyan-500 h-full flex items-center justify-center text-[10px] font-bold text-black font-mono transition-all duration-500"
            style={{ width: `${stats.firstHalfGoalsPct}%` }}
          >
            {stats.firstHalfGoalsPct > 15 ? `1. Yarı %${stats.firstHalfGoalsPct}` : ''}
          </div>
          <div 
            className="bg-emerald-500 h-full flex items-center justify-center text-[10px] font-bold text-black font-mono transition-all duration-500"
            style={{ width: `${stats.secondHalfGoalsPct}%` }}
          >
            {stats.secondHalfGoalsPct > 15 ? `2. Yarı %${stats.secondHalfGoalsPct}` : ''}
          </div>
        </div>

        <div className="flex justify-between text-[11px] text-gray-400 font-sans pt-1">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" />
            İlk Yarı: <strong>{Math.round((stats.totalGoalsScored * stats.firstHalfGoalsPct) / 100)} Gol</strong>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            İkinci Yarı: <strong>{Math.round((stats.totalGoalsScored * stats.secondHalfGoalsPct) / 100)} Gol</strong>
          </span>
        </div>
      </div>

      {/* AI Strategic Insights */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 space-y-2">
        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>Yapay Zeka Zaman Dilimi Analiz Raporu ({selectedTeamInfo.name})</span>
        </h4>

        <div className="bg-[#0D1117] p-3 rounded-lg border border-[#21262D] space-y-2 text-xs font-sans text-gray-300">
          {stats.aiInsights.map((insight, idx) => (
            <p key={idx} className="flex items-start gap-2">
              <span className="text-amber-400 text-sm">✦</span>
              <span dangerouslySetInnerHTML={{ __html: insight.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};
