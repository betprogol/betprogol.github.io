import React, { useState } from 'react';
import { 
  Trash2, 
  X, 
  Ticket, 
  ChevronUp, 
  ChevronDown, 
  Check, 
  AlertTriangle,
  Zap,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { BetSlipSelection, BetSlip } from '../types/betting';

interface BetSlipDrawerProps {
  selections: BetSlipSelection[];
  onRemoveSelection: (matchId: string, market: string) => void;
  onClearSlip: () => void;
  onPlaceBet: (stake: number) => { success: boolean; message: string };
  bankroll: number;
  onOpenDepositModal?: () => void;
}

export const BetSlipDrawer: React.FC<BetSlipDrawerProps> = ({
  selections,
  onRemoveSelection,
  onClearSlip,
  onPlaceBet,
  bankroll,
  onOpenDepositModal
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [stake, setStake] = useState('100');
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (selections.length === 0) return null;

  // Calculate total combined odds
  const totalOdds = Number(
    selections.reduce((acc, curr) => acc * (curr.odds || 1), 1).toFixed(2)
  );

  const stakeNum = parseFloat(stake) || 0;
  const potentialPayout = Number((stakeNum * totalOdds).toFixed(2));

  const handlePlace = () => {
    if (stakeNum <= 0) {
      setAlertMsg({ text: 'Lütfen geçerli bir bahis tutarı giriniz.', type: 'error' });
      return;
    }
    if (stakeNum > bankroll) {
      setAlertMsg({ text: 'Yetersiz kasa bakiyesi! Lütfen tutarı düşürün.', type: 'error' });
      return;
    }

    const res = onPlaceBet(stakeNum);
    if (res.success) {
      setAlertMsg({ text: res.message, type: 'success' });
      setTimeout(() => {
        setAlertMsg(null);
        setIsExpanded(false);
      }, 2000);
    } else {
      setAlertMsg({ text: res.message, type: 'error' });
    }
  };

  return (
    <div className="fixed bottom-12 md:bottom-0 right-0 left-0 md:left-auto md:right-6 md:w-96 z-40 font-mono shadow-2xl">
      {/* Minimized / Header Toggle Bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-green-500 hover:bg-green-400 text-black px-4 py-3 rounded-t-xl flex items-center justify-between cursor-pointer font-black transition-colors shadow-lg"
      >
        <div className="flex items-center gap-2">
          <Ticket className="w-5 h-5" />
          <span className="text-sm uppercase tracking-wider">Kuponum ({selections.length})</span>
          <span className="text-xs bg-black/20 px-2 py-0.5 rounded font-mono">
            Oran: {totalOdds}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-black">
            Kazanç: ₺{potentialPayout.toLocaleString('tr-TR')}
          </span>
          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </div>
      </div>

      {/* Expanded Slip Body */}
      {isExpanded && (
        <div className="bg-[#0F1115] border-x border-t border-[#1F2937] p-4 space-y-3 max-h-[70vh] overflow-y-auto text-[#E0E0E0]">
          
          {/* Selections List */}
          <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar">
            {selections.map((sel) => (
              <div 
                key={`${sel.matchId}-${sel.market}`}
                className="bg-[#161B22] border border-[#30363D] rounded-lg p-2.5 flex items-center justify-between text-xs"
              >
                <div className="overflow-hidden pr-2">
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <span>{sel.leagueName}</span>
                    <span>• {sel.matchTime}</span>
                  </div>
                  <h5 className="font-bold text-white truncate mt-0.5">
                    {sel.homeTeam} - {sel.awayTeam}
                  </h5>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="px-1.5 py-0.2 bg-[#0D1117] text-green-400 border border-green-500/30 rounded text-[10px] font-bold">
                      {sel.marketLabel}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-black text-white font-mono text-sm">
                    {Number(sel.odds).toFixed(2)}
                  </span>
                  <button
                    onClick={() => onRemoveSelection(sel.matchId, sel.market)}
                    className="text-gray-500 hover:text-red-400 p-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stake Preset Buttons */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Yatırılacak Tutar (₺)</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono">Kasa: <strong className="text-green-400">₺{bankroll.toLocaleString('tr-TR')}</strong></span>
                {onOpenDepositModal && (
                  <button
                    type="button"
                    onClick={onOpenDepositModal}
                    className="text-[10px] bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 px-1.5 py-0.5 rounded font-bold transition-colors cursor-pointer"
                  >
                    + Yükle
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {['50', '100', '250', '500'].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setStake(amt)}
                  className={`py-1.5 rounded text-xs font-bold border transition-colors ${
                    stake === amt 
                      ? 'bg-green-500 text-black border-green-500' 
                      : 'bg-[#161B22] text-gray-300 border-[#30363D] hover:bg-[#1F2937]'
                  }`}
                >
                  ₺{amt}
                </button>
              ))}
            </div>

            {/* Manual Stake Input */}
            <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-2 flex items-center justify-between">
              <span className="text-xs text-gray-400 font-bold">STAKE</span>
              <input
                type="number"
                value={stake}
                onChange={e => setStake(e.target.value)}
                className="bg-transparent text-right text-white font-black text-sm focus:outline-none w-28"
                placeholder="100"
              />
            </div>
          </div>

          {/* Summary Stats */}
          <div className="bg-[#161B22] p-3 rounded-lg border border-[#30363D] space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Toplam Oran:</span>
              <span className="font-bold text-white font-mono">{totalOdds}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Bahis Tutarı:</span>
              <span className="font-bold text-white font-mono">₺{stakeNum}</span>
            </div>
            <div className="flex justify-between text-white font-bold pt-1 border-t border-[#30363D]">
              <span className="text-green-400">Maksimum Kazanç:</span>
              <span className="text-green-400 font-mono text-sm font-black">
                ₺{potentialPayout.toLocaleString('tr-TR')}
              </span>
            </div>
          </div>

          {/* Alert Msg */}
          {alertMsg && (
            <div className={`p-2.5 rounded-lg text-xs font-bold text-center ${
              alertMsg.type === 'success' 
                ? 'bg-green-500/20 text-green-300 border border-green-500/40' 
                : 'bg-red-500/20 text-red-300 border border-red-500/40'
            }`}>
              {alertMsg.text}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClearSlip}
              className="py-2.5 px-3 rounded-lg bg-[#161B22] hover:bg-[#1F2937] border border-[#30363D] text-gray-400 hover:text-white font-bold text-xs uppercase"
            >
              Temizle
            </button>
            <button
              onClick={handlePlace}
              className="flex-1 py-2.5 rounded-lg bg-green-500 hover:bg-green-400 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              <Zap className="w-4 h-4" />
              <span>Kuponu Onayla & Oyna</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
