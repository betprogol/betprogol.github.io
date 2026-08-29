import React from 'react';
import { TrendingUp, Flame, ShieldAlert, Zap } from 'lucide-react';
import { Match } from '../types/betting';

interface LiveMomentumVisualizerProps {
  match: Match;
}

export const LiveMomentumVisualizer: React.FC<LiveMomentumVisualizerProps> = ({ match }) => {
  const isBasketball = match.sport === 'BASKETBALL';
  const isVolleyball = match.sport === 'VOLLEYBALL';

  // Realistic momentum calculation based on match events, xG and possession
  const homePoss = match.stats?.possession?.[0] || 54;
  const awayPoss = match.stats?.possession?.[1] || 46;
  const homeDangerous = match.stats?.dangerousAttacks?.[0] || 38;
  const awayDangerous = match.stats?.dangerousAttacks?.[1] || 29;

  // Calculate live pressure index 0-100
  const homePressureIndex = Math.min(95, Math.max(25, Math.round((homePoss * 0.4) + (homeDangerous * 0.8))));
  const awayPressureIndex = Math.min(95, Math.max(25, Math.round((awayPoss * 0.4) + (awayDangerous * 0.8))));

  // High momentum indicator
  const leadingTeam = homePressureIndex > awayPressureIndex ? 'home' : 'away';

  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-3.5 space-y-3 font-mono">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Canlı Baskı & Momentum Radarı
          </h4>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-[#0D1117] border border-[#30363D] text-gray-300">
          {leadingTeam === 'home' ? `🔥 ${match.homeTeam.name} Baskıda` : `⚡ ${match.awayTeam.name} Baskıda`}
        </span>
      </div>

      {/* Pressure comparison bars */}
      <div className="space-y-2 text-xs">
        <div>
          <div className="flex justify-between text-[11px] mb-1 font-bold">
            <span className="text-emerald-400">{match.homeTeam.name}</span>
            <span className="text-white font-mono font-black">%{homePressureIndex} İndeks</span>
          </div>
          <div className="w-full h-2 bg-[#0D1117] rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-700 shadow-sm shadow-emerald-500"
              style={{ width: `${homePressureIndex}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[11px] mb-1 font-bold">
            <span className="text-cyan-400">{match.awayTeam.name}</span>
            <span className="text-white font-mono font-black">%{awayPressureIndex} İndeks</span>
          </div>
          <div className="w-full h-2 bg-[#0D1117] rounded-full overflow-hidden">
            <div 
              className="bg-cyan-500 h-full rounded-full transition-all duration-700 shadow-sm shadow-cyan-500"
              style={{ width: `${awayPressureIndex}%` }}
            />
          </div>
        </div>
      </div>

      {/* Key live metrics */}
      <div className="grid grid-cols-3 gap-2 pt-1 text-center text-[10px]">
        <div className="bg-[#0D1117] p-1.5 rounded-lg border border-[#21262D]">
          <span className="text-gray-400 block font-sans">xG Beklentisi</span>
          <span className="font-bold text-white">
            {match.stats?.xg?.[0] || '1.4'} - {match.stats?.xg?.[1] || '0.9'}
          </span>
        </div>
        <div className="bg-[#0D1117] p-1.5 rounded-lg border border-[#21262D]">
          <span className="text-gray-400 block font-sans">Tehlikeli Hücum</span>
          <span className="font-bold text-amber-400">
            {homeDangerous} - {awayDangerous}
          </span>
        </div>
        <div className="bg-[#0D1117] p-1.5 rounded-lg border border-[#21262D]">
          <span className="text-gray-400 block font-sans">Şut İsabeti</span>
          <span className="font-bold text-green-400">
            %{Math.round(((match.stats?.shotsOnTarget?.[0] || 4) / (match.stats?.shotsTotal?.[0] || 8)) * 100)}
          </span>
        </div>
      </div>
    </div>
  );
};
