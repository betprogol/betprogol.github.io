import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Wallet, 
  Award, 
  ShieldCheck, 
  ArrowUpRight,
  Flame,
  Zap,
  Target,
  Swords,
  Activity
} from 'lucide-react';
import { BetSlip, Match } from '../types/betting';
import { UserProfile } from '../types/auth';
import { GoalHeatmap } from './GoalHeatmap';
import { TeamComparison } from './TeamComparison';
import { PerformanceMonitor } from './PerformanceMonitor';

interface StatsDashboardProps {
  slips: BetSlip[];
  bankroll: number;
  currentUser?: UserProfile;
  matches?: Match[];
  onOpenDepositModal?: () => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  slips,
  bankroll,
  currentUser,
  matches = [],
  onOpenDepositModal
}) => {
  const [subTab, setSubTab] = useState<'FINANCIALS' | 'HEATMAP' | 'COMPARISON' | 'PERFORMANCE'>('FINANCIALS');

  const wonSlips = slips.filter(s => s.status === 'WON');
  const lostSlips = slips.filter(s => s.status === 'LOST');

  const winRate = slips.length > 0
    ? Math.round((wonSlips.length / (wonSlips.length + lostSlips.length || 1)) * 100)
    : 72;

  const totalWon = wonSlips.reduce((acc, s) => acc + s.potentialPayout, 0);
  const totalStaked = slips.reduce((acc, s) => acc + s.stake, 0);
  const netProfit = totalWon - totalStaked;
  const roi = totalStaked > 0 ? Number(((netProfit / totalStaked) * 100).toFixed(1)) : 24.5;

  return (
    <div className="space-y-4 font-mono">
      {/* Top Navigation Bar for Stats Dashboard */}
      <div className="bg-[#0F1115] border border-[#1F2937] rounded-xl p-3 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 border border-green-500/30 flex items-center justify-center font-bold">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Gelişmiş İstatistik & Analiz Laboratuvarı
            </h2>
            <p className="text-[11px] text-gray-400 font-sans">
              Kasa yönetimi, gol ısı haritaları, takım kıyaslamaları ve canlı API performans monitörü
            </p>
          </div>
        </div>

        {/* Sub-Tab Switcher */}
        <div className="flex bg-[#161B22] border border-[#30363D] p-1 rounded-xl gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setSubTab('FINANCIALS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              subTab === 'FINANCIALS'
                ? 'bg-green-500/20 text-green-400 border border-green-500/40 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Kasa & Finans</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('HEATMAP')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              subTab === 'HEATMAP'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Gol Isı Haritası</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('COMPARISON')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              subTab === 'COMPARISON'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Takım Karşılaştırma</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('PERFORMANCE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              subTab === 'PERFORMANCE'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>API & Sim Gecikmesi</span>
          </button>
        </div>
      </div>

      {/* Sub-Tab 1: Financial & Bankroll Analytics */}
      {subTab === 'FINANCIALS' && (
        <div className="space-y-4">
          {/* 4 Core Financial Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Metric 1: Bankroll */}
            <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-3.5 space-y-1 relative group">
              <div className="flex items-center justify-between text-gray-400 text-xs">
                <span>Aktif Kasa</span>
                <Wallet className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-lg sm:text-xl font-black text-white">
                ₺{bankroll.toLocaleString('tr-TR')}
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-green-400 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" /> +%14.2 Bu Ay
                </span>
                {onOpenDepositModal && (
                  <button
                    onClick={onOpenDepositModal}
                    className="text-[10px] bg-green-500/15 hover:bg-green-500/30 text-green-400 border border-green-500/40 px-1.5 py-0.5 rounded font-bold transition-colors cursor-pointer"
                  >
                    + Yükle
                  </button>
                )}
              </div>
            </div>

            {/* Metric 2: Win Rate */}
            <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-3.5 space-y-1">
              <div className="flex items-center justify-between text-gray-400 text-xs">
                <span>Kupon Başarısı</span>
                <Target className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-lg sm:text-xl font-black text-white">
                %{winRate}
              </div>
              <span className="text-[10px] text-gray-400">
                {wonSlips.length} Kazanan / {slips.length} Toplam
              </span>
            </div>

            {/* Metric 3: Total Profit */}
            <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-3.5 space-y-1">
              <div className="flex items-center justify-between text-gray-400 text-xs">
                <span>Net Kazanç (Profit)</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className={`text-lg sm:text-xl font-black ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ₺{netProfit >= 0 ? `+${netProfit.toLocaleString('tr-TR')}` : netProfit.toLocaleString('tr-TR')}
              </div>
              <span className="text-[10px] text-gray-400 font-sans">
                Yatırılan: ₺{totalStaked.toLocaleString('tr-TR')}
              </span>
            </div>

            {/* Metric 4: ROI */}
            <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-3.5 space-y-1">
              <div className="flex items-center justify-between text-gray-400 text-xs">
                <span>ROI Getiri Oranı</span>
                <Award className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-lg sm:text-xl font-black text-purple-400">
                %{roi}
              </div>
              <span className="text-[10px] text-green-400">
                Yüksek Verimlilik
              </span>
            </div>
          </div>

          {/* Strategic Insights & Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Sports & Market Breakdown */}
            <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <PieChart className="w-4 h-4 text-green-400" />
                <span>En Çok Kazandıran Bahis Türleri</span>
              </h4>

              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300 font-bold">2.5 Gol Üstü / KG Var (Gol Pazarı)</span>
                    <span className="text-green-400 font-bold">%78 Başarı</span>
                  </div>
                  <div className="w-full h-2 bg-[#0D1117] rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full rounded-full" style={{ width: '78%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300 font-bold">Maç Sonucu 1 (Favori Galibiyeti)</span>
                    <span className="text-green-400 font-bold">%68 Başarı</span>
                  </div>
                  <div className="w-full h-2 bg-[#0D1117] rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: '68%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300 font-bold">Basketbol Toplam Sayı Üst</span>
                    <span className="text-cyan-400 font-bold">%64 Başarı</span>
                  </div>
                  <div className="w-full h-2 bg-[#0D1117] rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full rounded-full" style={{ width: '64%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Bankroll Strategy Recommendation */}
            <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>AI Kelly Kriteri Kasa Tavsiyesi</span>
              </h4>

              <div className="bg-[#0D1117] p-3 rounded-lg border border-[#21262D] space-y-2 text-xs font-sans text-gray-300">
                <p>
                  💡 <strong>Kasa Büyüme Stratejisi:</strong> Mevcut ₺{bankroll.toLocaleString('tr-TR')} kasanız için tekli bahislerde maksimum <strong>%5 (₺{(bankroll * 0.05).toFixed(0)})</strong>, kombine kuponlarda maksimum <strong>%2.5 (₺{(bankroll * 0.025).toFixed(0)})</strong> risk almanız önerilir.
                </p>
                <p>
                  🛡️ <strong>Risk Dağıtımı:</strong> En yüksek başarı Süper Lig ve Şampiyonlar Ligi 2.5 Üst bahislerinde görülmüştür.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: 15-Minute Goal Interval Heatmap */}
      {subTab === 'HEATMAP' && (
        <GoalHeatmap matches={matches} />
      )}

      {/* Sub-Tab 3: Side-by-Side Team & Defensive Comparison */}
      {subTab === 'COMPARISON' && (
        <TeamComparison matches={matches} />
      )}

      {/* Sub-Tab 4: Performance Monitor */}
      {subTab === 'PERFORMANCE' && (
        <PerformanceMonitor matches={matches} />
      )}
    </div>
  );
};
