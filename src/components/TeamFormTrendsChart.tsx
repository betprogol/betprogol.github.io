import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart
} from 'recharts';
import { 
  TrendingUp, 
  Activity, 
  Flame, 
  Shield, 
  Clock, 
  Target, 
  Sparkles, 
  BarChart3, 
  ChevronRight,
  Info,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { Match } from '../types/betting';
import { getMatchAnalyticsData, MatchAnalyticsData } from '../utils/teamAnalyticsHelper';
import { TeamLogo } from './TeamLogo';

interface TeamFormTrendsChartProps {
  match: Match;
  compact?: boolean;
}

export const TeamFormTrendsChart: React.FC<TeamFormTrendsChartProps> = ({ match, compact = false }) => {
  const [activeView, setActiveView] = useState<'form' | 'goals' | 'comparison'>('form');
  const [filterMode, setFilterMode] = useState<'both' | 'home' | 'away'>('both');

  const analytics: MatchAnalyticsData = getMatchAnalyticsData(match);
  const { homeTeam, awayTeam } = match;

  const homeColor = '#22C55E'; // green-500
  const awayColor = '#06B6D4'; // cyan-500
  const accentGold = '#F59E0B'; // amber-500

  // Custom Dark Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#161B22] border border-[#30363D] p-3 rounded-xl shadow-2xl text-xs space-y-1.5 backdrop-blur-md">
          <div className="font-bold text-gray-200 border-b border-[#21262D] pb-1 flex items-center justify-between gap-3">
            <span>{label}</span>
            <span className="text-[10px] text-gray-400 font-mono">Maç Analizi</span>
          </div>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-gray-300 font-medium">{entry.name}:</span>
              </span>
              <span className="font-bold font-mono text-white">
                {entry.value} {entry.unit || ''}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 text-[#E0E0E0]">
      {/* Header & Sub-navigation Tabs */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <span>Form & Gol Dağılım Trendleri</span>
              <span className="px-1.5 py-0.5 rounded bg-[#21262D] text-[10px] font-mono text-green-400 border border-[#30363D]">
                Son 5 Karşılaşma
              </span>
            </h3>
            <p className="text-[11px] text-gray-400">
              {homeTeam.name} vs {awayTeam.name} takımlarının dinamik performans eğrileri
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-[#0D1117] p-1 rounded-lg border border-[#21262D] self-start sm:self-auto">
          <button
            onClick={() => setActiveView('form')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'form'
                ? 'bg-green-500 text-black shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Puan & Form</span>
          </button>
          <button
            onClick={() => setActiveView('goals')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'goals'
                ? 'bg-green-500 text-black shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Gol Aralıkları</span>
          </button>
          <button
            onClick={() => setActiveView('comparison')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'comparison'
                ? 'bg-green-500 text-black shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Metrik Kıyaslama</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Chart Section */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 space-y-4">
        
        {/* VIEW 1: FORM & CUMULATIVE POINTS MOMENTUM */}
        {activeView === 'form' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#21262D] pb-3">
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  Kümülatif Puan ve Form Momentumu (Son 5 Maç)
                </span>
                <p className="text-[11px] text-gray-400">
                  Her maçta kazanılan puanların (G=3, B=1, M=0) toplam ivme grafiği
                </p>
              </div>

              {/* Team Legend Chips */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 bg-[#0D1117] px-2.5 py-1 rounded-lg border border-[#21262D]">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-gray-200 font-bold">{homeTeam.name} ({analytics.homeMetrics.avgGoalsScored} Gol/M)</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#0D1117] px-2.5 py-1 rounded-lg border border-[#21262D]">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <span className="text-gray-200 font-bold">{awayTeam.name} ({analytics.awayMetrics.avgGoalsScored} Gol/M)</span>
                </div>
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="h-64 sm:h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={analytics.combinedTrendPoints}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="homeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={homeColor} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={homeColor} stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="awayGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={awayColor} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={awayColor} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#21262D" vertical={false} />
                  <XAxis 
                    dataKey="matchLabel" 
                    stroke="#8B949E" 
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#8B949E" 
                    fontSize={11}
                    domain={[0, 15]}
                    tickLine={false}
                    tickCount={6}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="homeCumPoints"
                    name={`${homeTeam.name} Toplam Puan`}
                    stroke={homeColor}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#homeGrad)"
                    activeDot={{ r: 6, stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="awayCumPoints"
                    name={`${awayTeam.name} Toplam Puan`}
                    stroke={awayColor}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#awayGrad)"
                    activeDot={{ r: 6, stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Individual Match Performance Cards for both teams */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {/* Home Team Last 5 Matches */}
              <div className="bg-[#0D1117] border border-[#21262D] rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-green-400 flex items-center gap-1.5">
                    <TeamLogo logo={homeTeam.logo} fallback="⚽" className="w-4 h-4" />
                    {homeTeam.name} Son 5 Karşılaşması
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {analytics.homeHistory[analytics.homeHistory.length - 1]?.cumulativePoints} / 15 Puan
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {analytics.homeHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        item.result === 'W'
                          ? 'bg-green-500/10 border-green-500/30 text-green-300'
                          : item.result === 'D'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                          : 'bg-red-500/10 border-red-500/30 text-red-300'
                      }`}
                      title={`${item.date} vs ${item.opponent} (${item.score})`}
                    >
                      <div className="text-[9px] text-gray-400 truncate font-sans">{item.opponent}</div>
                      <div className="text-xs font-black font-mono my-0.5">{item.score}</div>
                      <div className={`text-[10px] font-bold px-1 rounded inline-block ${
                        item.result === 'W' ? 'bg-green-500 text-black' : item.result === 'D' ? 'bg-amber-500 text-black' : 'bg-red-500 text-white'
                      }`}>
                        {item.result === 'W' ? 'G' : item.result === 'D' ? 'B' : 'M'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Away Team Last 5 Matches */}
              <div className="bg-[#0D1117] border border-[#21262D] rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <TeamLogo logo={awayTeam.logo} fallback="⚽" className="w-4 h-4" />
                    {awayTeam.name} Son 5 Karşılaşması
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {analytics.awayHistory[analytics.awayHistory.length - 1]?.cumulativePoints} / 15 Puan
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {analytics.awayHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        item.result === 'W'
                          ? 'bg-green-500/10 border-green-500/30 text-green-300'
                          : item.result === 'D'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                          : 'bg-red-500/10 border-red-500/30 text-red-300'
                      }`}
                      title={`${item.date} vs ${item.opponent} (${item.score})`}
                    >
                      <div className="text-[9px] text-gray-400 truncate font-sans">{item.opponent}</div>
                      <div className="text-xs font-black font-mono my-0.5">{item.score}</div>
                      <div className={`text-[10px] font-bold px-1 rounded inline-block ${
                        item.result === 'W' ? 'bg-green-500 text-black' : item.result === 'D' ? 'bg-amber-500 text-black' : 'bg-red-500 text-white'
                      }`}>
                        {item.result === 'W' ? 'G' : item.result === 'D' ? 'B' : 'M'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: GOAL DISTRIBUTION TRENDS ACROSS 15-MIN INTERVALS */}
        {activeView === 'goals' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#21262D] pb-3">
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  15 Dakikalık Aralıklarla Gol Dağılımı ve Tehlikeli Periyotlar
                </span>
                <p className="text-[11px] text-gray-400">
                  Takımların sezon boyunca hangi dakika aralıklarında gol atıp yediğinin analizi
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1 text-green-400 font-semibold text-[11px]">
                  <span className="w-2.5 h-2.5 rounded bg-green-500 inline-block" /> {homeTeam.name} Gol
                </span>
                <span className="flex items-center gap-1 text-cyan-400 font-semibold text-[11px]">
                  <span className="w-2.5 h-2.5 rounded bg-cyan-400 inline-block" /> {awayTeam.name} Gol
                </span>
              </div>
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-64 sm:h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.goalIntervals}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#21262D" vertical={false} />
                  <XAxis 
                    dataKey="interval" 
                    stroke="#8B949E" 
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#8B949E" 
                    fontSize={11}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="homeScored"
                    name={`${homeTeam.name} Atılan`}
                    fill={homeColor}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="awayScored"
                    name={`${awayTeam.name} Atılan`}
                    fill={awayColor}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Half-time Insights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <div className="bg-[#0D1117] border border-[#21262D] rounded-xl p-3 text-center">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">1. Yarı Gol Oranı ({homeTeam.name})</span>
                <span className="text-base font-black text-green-400 font-mono mt-1 block">
                  %{analytics.homeMetrics.firstHalfGoalRate}
                </span>
                <span className="text-[10px] text-gray-500">İlk 45 dakikada atma eğilimi</span>
              </div>

              <div className="bg-[#0D1117] border border-[#21262D] rounded-xl p-3 text-center">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">2. Yarı Gol Oranı ({homeTeam.name})</span>
                <span className="text-base font-black text-green-400 font-mono mt-1 block">
                  %{analytics.homeMetrics.secondHalfGoalRate}
                </span>
                <span className="text-[10px] text-gray-500">Son 45 dakikada artan baskı</span>
              </div>

              <div className="bg-[#0D1117] border border-[#21262D] rounded-xl p-3 text-center">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">1. Yarı Gol Oranı ({awayTeam.name})</span>
                <span className="text-base font-black text-cyan-400 font-mono mt-1 block">
                  %{analytics.awayMetrics.firstHalfGoalRate}
                </span>
                <span className="text-[10px] text-gray-500">Deplasman erken reaksiyon</span>
              </div>

              <div className="bg-[#0D1117] border border-[#21262D] rounded-xl p-3 text-center">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">En Kritik Aralık</span>
                <span className="text-base font-black text-amber-400 font-mono mt-1 block">
                  76' - 90+'
                </span>
                <span className="text-[10px] text-gray-500">Toplam gollerin %38'i bu aralıkta</span>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: HEAD-TO-HEAD METRIC COMPARISON */}
        {activeView === 'comparison' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#21262D] pb-3">
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-green-400" />
                  Performans & İstatistiksel Kıyaslama Tablosu
                </span>
                <p className="text-[11px] text-gray-400">
                  xG kalitesi, gol ortalamaları ve bahis eğilimleri
                </p>
              </div>
            </div>

            {/* Comparison Metrics Bars */}
            <div className="space-y-3 pt-1 text-xs">
              {/* Avg Goals Scored */}
              <div className="bg-[#0D1117] border border-[#21262D] p-3 rounded-xl space-y-1.5">
                <div className="flex justify-between font-bold">
                  <span className="text-green-400">{analytics.homeMetrics.avgGoalsScored}</span>
                  <span className="text-gray-300 text-[11px]">Maç Başına Atılan Gol</span>
                  <span className="text-cyan-400">{analytics.awayMetrics.avgGoalsScored}</span>
                </div>
                <div className="w-full h-2 bg-[#161B22] rounded-full overflow-hidden flex">
                  <div 
                    className="bg-green-500 h-full transition-all" 
                    style={{ width: `${(analytics.homeMetrics.avgGoalsScored / (analytics.homeMetrics.avgGoalsScored + analytics.awayMetrics.avgGoalsScored || 1)) * 100}%` }} 
                  />
                  <div 
                    className="bg-cyan-500 h-full transition-all" 
                    style={{ width: `${(analytics.awayMetrics.avgGoalsScored / (analytics.homeMetrics.avgGoalsScored + analytics.awayMetrics.avgGoalsScored || 1)) * 100}%` }} 
                  />
                </div>
              </div>

              {/* xG Created */}
              <div className="bg-[#0D1117] border border-[#21262D] p-3 rounded-xl space-y-1.5">
                <div className="flex justify-between font-bold">
                  <span className="text-green-400">{analytics.homeMetrics.avgXg} xG</span>
                  <span className="text-gray-300 text-[11px]">Ortalama Beklenen Gol (xG)</span>
                  <span className="text-cyan-400">{analytics.awayMetrics.avgXg} xG</span>
                </div>
                <div className="w-full h-2 bg-[#161B22] rounded-full overflow-hidden flex">
                  <div 
                    className="bg-green-500 h-full transition-all" 
                    style={{ width: `${(analytics.homeMetrics.avgXg / (analytics.homeMetrics.avgXg + analytics.awayMetrics.avgXg || 1)) * 100}%` }} 
                  />
                  <div 
                    className="bg-cyan-500 h-full transition-all" 
                    style={{ width: `${(analytics.awayMetrics.avgXg / (analytics.homeMetrics.avgXg + analytics.awayMetrics.avgXg || 1)) * 100}%` }} 
                  />
                </div>
              </div>

              {/* 2.5 Over Match Rate */}
              <div className="bg-[#0D1117] border border-[#21262D] p-3 rounded-xl space-y-1.5">
                <div className="flex justify-between font-bold">
                  <span className="text-green-400">%{analytics.homeMetrics.over25Rate}</span>
                  <span className="text-gray-300 text-[11px]">2.5 Gol Üstü Bitme Oranı</span>
                  <span className="text-cyan-400">%{analytics.awayMetrics.over25Rate}</span>
                </div>
                <div className="w-full h-2 bg-[#161B22] rounded-full overflow-hidden flex">
                  <div 
                    className="bg-green-500 h-full transition-all" 
                    style={{ width: `${(analytics.homeMetrics.over25Rate / (analytics.homeMetrics.over25Rate + analytics.awayMetrics.over25Rate || 1)) * 100}%` }} 
                  />
                  <div 
                    className="bg-cyan-500 h-full transition-all" 
                    style={{ width: `${(analytics.awayMetrics.over25Rate / (analytics.homeMetrics.over25Rate + analytics.awayMetrics.over25Rate || 1)) * 100}%` }} 
                  />
                </div>
              </div>

              {/* Clean Sheet (Gol Yememe) Rate */}
              <div className="bg-[#0D1117] border border-[#21262D] p-3 rounded-xl space-y-1.5">
                <div className="flex justify-between font-bold">
                  <span className="text-green-400">%{analytics.homeMetrics.cleanSheetRate}</span>
                  <span className="text-gray-300 text-[11px]">Kalesini Gole Kapatma (Clean Sheet)</span>
                  <span className="text-cyan-400">%{analytics.awayMetrics.cleanSheetRate}</span>
                </div>
                <div className="w-full h-2 bg-[#161B22] rounded-full overflow-hidden flex">
                  <div 
                    className="bg-green-500 h-full transition-all" 
                    style={{ width: `${(analytics.homeMetrics.cleanSheetRate / (analytics.homeMetrics.cleanSheetRate + analytics.awayMetrics.cleanSheetRate || 1)) * 100}%` }} 
                  />
                  <div 
                    className="bg-cyan-500 h-full transition-all" 
                    style={{ width: `${(analytics.awayMetrics.cleanSheetRate / (analytics.homeMetrics.cleanSheetRate + analytics.awayMetrics.cleanSheetRate || 1)) * 100}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Trend Takeaway Banner */}
        <div className="p-3 bg-gradient-to-r from-green-500/10 via-[#161B22] to-cyan-500/10 border border-green-500/20 rounded-xl flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <span className="font-bold text-white block">Trend ve Bahis İçgörüsü:</span>
            <p className="text-gray-300 leading-relaxed font-sans text-[11px]">
              {analytics.homeMetrics.avgGoalsScored >= 1.6
                ? `${homeTeam.name} iç sahada yüksek hücum üretkenliğine sahip (${analytics.homeMetrics.avgGoalsScored} Gol/Maç). 2.5 Üst ve KG Var seçenekleri istatistiksel destek alıyor.`
                : `${homeTeam.name} ve ${awayTeam.name} dengeli savunma disiplini sergiliyor. İlk yarı beraberlik veya kontrollü alt/üst tercihleri öne çıkıyor.`}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
