import React, { useState } from 'react';
import { 
  Ticket, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp, 
  Trash2, 
  Sparkles, 
  Share2,
  Calendar,
  Filter,
  Check,
  Zap,
  Play,
  RotateCcw
} from 'lucide-react';
import { BetSlip, Match } from '../types/betting';
import { UserProfile } from '../types/auth';

interface MyPredictionsProps {
  slips: BetSlip[];
  onSettleSlip?: (slipId: string) => void;
  onClearAllSlips?: () => void;
  onDeleteSlip?: (slipId: string) => void;
  currentUser?: UserProfile;
}

export const MyPredictions: React.FC<MyPredictionsProps> = ({
  slips,
  onSettleSlip,
  onClearAllSlips,
  onDeleteSlip,
  currentUser
}) => {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'WON' | 'LOST'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredSlips = slips.filter(s => {
    if (filter === 'ALL') return true;
    return s.status === filter;
  });

  const totalWonPayout = slips
    .filter(s => s.status === 'WON')
    .reduce((acc, s) => acc + s.potentialPayout, 0);

  const totalStaked = slips.reduce((acc, s) => acc + s.stake, 0);
  const netProfit = totalWonPayout - totalStaked;

  const handleShareSlip = (slip: BetSlip) => {
    const text = `🏆 BetProGol Kuponum:\n${slip.selections.map(s => `• ${s.homeTeam} - ${s.awayTeam} [${s.marketLabel} @${s.odds}]`).join('\n')}\nToplam Oran: ${slip.totalOdds} | Olası Kazanç: ₺${slip.potentialPayout}`;
    navigator.clipboard.writeText(text);
    setCopiedId(slip.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Top Stats Banner */}
      <div className="bg-[#0F1115] border border-[#1F2937] rounded-xl p-4 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 border border-green-500/30 flex items-center justify-center font-bold">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Kuponlarım & Canlı Takip Terminali
              </h2>
              <p className="text-[11px] text-gray-400 font-sans">
                {currentUser?.fullName || 'Kullanıcı'} kupon geçmişi ve canlı sonuçlanma durumu
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 text-xs">
            <div className="bg-[#161B22] px-3 py-1.5 rounded-lg border border-[#30363D]">
              <span className="text-gray-400 text-[10px] block">TOPLAM KUPON</span>
              <span className="font-bold text-white">{slips.length} Adet</span>
            </div>
            <div className="bg-[#161B22] px-3 py-1.5 rounded-lg border border-[#30363D]">
              <span className="text-gray-400 text-[10px] block">NET KAZANÇ</span>
              <span className={`font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ₺{netProfit.toLocaleString('tr-TR')}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-[#21262D]">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                filter === 'ALL' ? 'bg-[#1F2937] text-white border border-[#30363D]' : 'text-gray-400 hover:text-white'
              }`}
            >
              Tümü ({slips.length})
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                filter === 'PENDING' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-gray-400 hover:text-white'
              }`}
            >
              Devam Edenler ({slips.filter(s => s.status === 'PENDING').length})
            </button>
            <button
              onClick={() => setFilter('WON')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                filter === 'WON' ? 'bg-green-500/20 text-green-300 border border-green-500/40' : 'text-gray-400 hover:text-white'
              }`}
            >
              Kazananlar ({slips.filter(s => s.status === 'WON').length})
            </button>
            <button
              onClick={() => setFilter('LOST')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                filter === 'LOST' ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'text-gray-400 hover:text-white'
              }`}
            >
              Kaybedenler ({slips.filter(s => s.status === 'LOST').length})
            </button>
          </div>

          {slips.length > 0 && onClearAllSlips && (
            <button
              onClick={onClearAllSlips}
              className="text-[11px] text-gray-500 hover:text-red-400 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Tümünü Sil</span>
            </button>
          )}
        </div>
      </div>

      {/* Slips Cards Grid */}
      <div className="space-y-3">
        {filteredSlips.length === 0 ? (
          <div className="bg-[#0F1115] border border-[#1F2937] rounded-xl p-10 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#161B22] border border-[#30363D] flex items-center justify-center mx-auto text-gray-500">
              <Ticket className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase">Kayıtlı Kupon Bulunamadı</h3>
            <p className="text-xs text-gray-400 font-sans max-w-sm mx-auto">
              Bültenden maç ve tahmin seçerek hemen ilk kuponunuzu oluşturabilirsiniz.
            </p>
          </div>
        ) : (
          filteredSlips.map(slip => {
            const isWon = slip.status === 'WON';
            const isLost = slip.status === 'LOST';
            const isPending = slip.status === 'PENDING';

            return (
              <div
                key={slip.id}
                className={`bg-[#0F1115] border rounded-xl overflow-hidden shadow-md transition-all ${
                  isWon 
                    ? 'border-green-500/40' 
                    : isLost 
                      ? 'border-red-500/30' 
                      : 'border-[#1F2937]'
                }`}
              >
                {/* Header Bar */}
                <div className="bg-[#161B22] px-4 py-2.5 border-b border-[#21262D] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono">
                      Kupon #{slip.id.substring(0, 8)}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(slip.createdAt).toLocaleDateString('tr-TR')}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#0D1117] text-gray-400 border border-[#30363D]">
                      {slip.selections.length} Maç
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    {isWon && (
                      <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-300 border border-green-500/40 text-[10px] font-black flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-400" /> KAZANDI
                      </span>
                    )}
                    {isLost && (
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-black flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-red-400" /> KAYBETTİ
                      </span>
                    )}
                    {isPending && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400 animate-spin" /> OYNANIYOR
                      </span>
                    )}

                    {/* Share Button */}
                    <button
                      onClick={() => handleShareSlip(slip)}
                      className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
                      title="Kuponu Paylaş / Kopyala"
                    >
                      {copiedId === slip.id ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
                    </button>

                    {/* Individual Delete Coupon Button */}
                    {onDeleteSlip && (
                      <button
                        onClick={() => {
                          if (deletingId === slip.id) {
                            onDeleteSlip(slip.id);
                            setDeletingId(null);
                          } else {
                            setDeletingId(slip.id);
                            setTimeout(() => setDeletingId(prev => prev === slip.id ? null : prev), 3000);
                          }
                        }}
                        className={`p-1 rounded transition-all cursor-pointer flex items-center gap-1 ${
                          deletingId === slip.id
                            ? 'bg-red-500 text-white px-2 py-0.5 text-[10px] font-bold animate-pulse'
                            : 'text-gray-500 hover:text-red-400 hover:bg-red-500/10'
                        }`}
                        title={deletingId === slip.id ? 'Silmek için tekrar tıkla' : 'Kuponu Sil'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {deletingId === slip.id && <span>Sil?</span>}
                      </button>
                    )}
                  </div>
                </div>

                {/* Selections in slip */}
                <div className="p-3 space-y-2">
                  {slip.selections.map((sel, idx) => (
                    <div
                      key={idx}
                      className="bg-[#161B22] border border-[#30363D] rounded-lg p-2.5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                          <span>{sel.leagueName}</span>
                          <span>• {sel.matchTime}</span>
                        </div>
                        <h5 className="font-bold text-white mt-0.5">
                          {sel.homeTeam} - {sel.awayTeam}
                        </h5>
                        <div className="mt-1">
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#0D1117] text-green-400 border border-green-500/30 font-bold">
                            Tahmin: {sel.marketLabel}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black font-mono text-white block">
                          @{Number(sel.odds).toFixed(2)}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 font-mono">
                          {sel.status === 'WON' ? '✓ Geldi' : sel.status === 'LOST' ? '✕ Yattı' : 'Devam'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Slip Footer Summary */}
                <div className="bg-[#161B22] px-4 py-2.5 border-t border-[#21262D] flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">
                      Oran: <strong className="text-white">{slip.totalOdds}</strong>
                    </span>
                    <span className="text-gray-400">
                      Yatırılan: <strong className="text-white">₺{slip.stake}</strong>
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-gray-400 text-[10px] block uppercase">Olası Kazanç</span>
                    <span className="font-black text-green-400 text-sm">
                      ₺{slip.potentialPayout.toLocaleString('tr-TR')}
                    </span>
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
