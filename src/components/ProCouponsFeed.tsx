import React, { useState, useMemo } from 'react';
import { 
  Flame, 
  Sparkles, 
  Crown, 
  TrendingUp, 
  Plus, 
  Check, 
  Copy, 
  ShieldCheck,
  Zap,
  Target,
  ArrowRight
} from 'lucide-react';
import { Match, BetSlipSelection, BetMarket } from '../types/betting';
import { TeamLogo } from './TeamLogo';

interface ProCouponsFeedProps {
  onAddMultipleSelections: (selections: BetSlipSelection[]) => void;
  activeSelections: BetSlipSelection[];
  matches?: Match[];
}

export const ProCouponsFeed: React.FC<ProCouponsFeedProps> = ({
  onAddMultipleSelections,
  activeSelections,
  matches = []
}) => {
  const [copiedCouponId, setCopiedCouponId] = useState<string | null>(null);

  // Generate dynamic Banko coupons using actual matches from the bulletin
  const proCoupons = useMemo(() => {
    if (!matches || matches.length === 0) return [];

    const coupons = [];

    // Filter real matches
    const superLigMatches = matches.filter(m => m.leagueName?.includes('Süper Lig') || m.country === 'Türkiye');
    const europeMatches = matches.filter(m => !m.leagueName?.includes('Süper Lig') && m.country !== 'Türkiye' && m.sport === 'FOOTBALL');
    const basketMatches = matches.filter(m => m.sport === 'BASKETBALL' || m.sport === 'VOLLEYBALL');
    const allFootball = matches.filter(m => m.sport === 'FOOTBALL');

    // Coupon 1: GÜNÜN SÜPER LİG & İDDAA BANKO KOMBİNESİ
    const pool1 = superLigMatches.length >= 2 ? superLigMatches : (allFootball.length > 0 ? allFootball : matches);
    if (pool1.length > 0) {
      const selectedMatches = pool1.slice(0, 3);
      const selections: BetSlipSelection[] = selectedMatches.map(m => {
        const ms1 = m.odds?.ms1 || 1.85;
        const ms2 = m.odds?.ms2 || 2.10;
        const over25 = m.odds?.over25 || 1.70;
        const bttsYes = m.odds?.bttsYes || 1.65;

        let market: BetMarket = 'MS1';
        let marketLabel = `${m.homeTeam.name} (MS 1)`;
        let odds = ms1;

        if (ms1 <= 2.10) {
          market = 'MS1';
          marketLabel = `${m.homeTeam.name} (MS 1)`;
          odds = ms1;
        } else if (over25 <= 1.85) {
          market = 'OVER_25';
          marketLabel = '2.5 Gol Üstü';
          odds = over25;
        } else {
          market = 'BTTS_YES';
          marketLabel = 'Karşılıklı Gol Var';
          odds = bttsYes;
        }

        return {
          matchId: m.id,
          homeTeam: m.homeTeam.name,
          awayTeam: m.awayTeam.name,
          matchDate: m.date || 'Bugün',
          matchTime: m.time || '20:00',
          leagueName: m.leagueName || 'Trendyol Süper Lig',
          leagueLogo: m.leagueLogo || '🇹🇷',
          sport: m.sport,
          market,
          marketLabel,
          odds: Number(odds),
          status: 'PENDING'
        };
      });

      const totalOdds = selections.reduce((acc, s) => acc * s.odds, 1);

      coupons.push({
        id: 'coupon-banko-superlig-real',
        title: 'GÜNÜN SÜPER LİG & BÜLTEN BANKOLARI',
        badge: '👑 VIP BANKO',
        badgeColor: 'bg-green-500 text-black',
        analyst: 'Ahmet Yılmaz (Süper Lig Baş Analisti)',
        totalOdds: Number(totalOdds.toFixed(2)),
        confidence: 89,
        matchesCount: selections.length,
        description: 'Bültendeki güncel Süper Lig ve canlı bülten karşılaşmalarından seçilmiş yüksek başarı vadeden 3 banko tercih.',
        selections
      });
    }

    // Coupon 2: AVRUPA DEVLERİ & ŞAMPİYONLAR BÜLTENİ BANKOSU
    const pool2 = europeMatches.length >= 2 ? europeMatches : (matches.length > 2 ? matches.slice(1) : matches);
    if (pool2.length > 0) {
      const selectedMatches = pool2.slice(0, 3);
      const selections: BetSlipSelection[] = selectedMatches.map((m, idx) => {
        const ms1 = m.odds?.ms1 || 1.90;
        const over25 = m.odds?.over25 || 1.75;
        const bttsYes = m.odds?.bttsYes || 1.68;

        let market: BetMarket = 'OVER_25';
        let marketLabel = '2.5 Gol Üstü';
        let odds = over25;

        if (idx % 3 === 0) {
          market = 'BTTS_YES';
          marketLabel = 'Karşılıklı Gol Var';
          odds = bttsYes;
        } else if (idx % 3 === 1) {
          market = 'OVER_25';
          marketLabel = '2.5 Gol Üstü';
          odds = over25;
        } else {
          market = 'MS1';
          marketLabel = `${m.homeTeam.name} (MS 1)`;
          odds = ms1;
        }

        return {
          matchId: m.id,
          homeTeam: m.homeTeam.name,
          awayTeam: m.awayTeam.name,
          matchDate: m.date || 'Bugün',
          matchTime: m.time || '21:00',
          leagueName: m.leagueName || 'Premier League',
          leagueLogo: m.leagueLogo || '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
          sport: m.sport,
          market,
          marketLabel,
          odds: Number(odds),
          status: 'PENDING'
        };
      });

      const totalOdds = selections.reduce((acc, s) => acc * s.odds, 1);

      coupons.push({
        id: 'coupon-banko-europe-real',
        title: 'AVRUPA DEVLERİ & ŞAMPİYONLAR BÜLTENİ',
        badge: '🔥 YÜKSEK ORAN',
        badgeColor: 'bg-amber-500 text-black',
        analyst: 'Can Demir (Avrupa Futbol Masası)',
        totalOdds: Number(totalOdds.toFixed(2)),
        confidence: 81,
        matchesCount: selections.length,
        description: 'Avrupa liglerinin öne çıkan güncel maçlarından oluşan yüksek kazanç potansiyelli banko kombine.',
        selections
      });
    }

    // Coupon 3: AI MODELİ GÜNÜN DEĞERLİ BANKO KOMBİNESİ
    const pool3 = basketMatches.length > 0 ? basketMatches : (matches.length > 1 ? matches.slice(0, 2) : matches);
    if (pool3.length > 0) {
      const selectedMatches = pool3.slice(0, 2);
      const selections: BetSlipSelection[] = selectedMatches.map(m => {
        const isBasket = m.sport === 'BASKETBALL';
        const odds = m.odds?.over25 || m.odds?.ms1 || 1.85;

        return {
          matchId: m.id,
          homeTeam: m.homeTeam.name,
          awayTeam: m.awayTeam.name,
          matchDate: m.date || 'Bugün',
          matchTime: m.time || '20:30',
          leagueName: m.leagueName || (isBasket ? 'Euroleague Basketball' : 'Spor Bülteni'),
          leagueLogo: m.leagueLogo || (isBasket ? '🏀' : '⚽'),
          sport: m.sport,
          market: (isBasket ? 'OVER_TOTAL_POINTS' : 'OVER_25') as BetMarket,
          marketLabel: isBasket ? '164.5 Sayı Üst' : '2.5 Gol Üstü',
          odds: Number(odds),
          status: 'PENDING'
        };
      });

      const totalOdds = selections.reduce((acc, s) => acc * s.odds, 1);

      coupons.push({
        id: 'coupon-banko-ai-real',
        title: 'AI ALGORİTMA & DEĞERLİ BANKO KOMBİNE',
        badge: '🏀 AI ÖZEL',
        badgeColor: 'bg-cyan-500 text-black',
        analyst: 'BetproGol AI Modeli (Q4 Tempo)',
        totalOdds: Number(totalOdds.toFixed(2)),
        confidence: 86,
        matchesCount: selections.length,
        description: 'Yapay zeka modellerimizin güncel bültenden belirlediği en yüksek istatistiki başarı oranına sahip banko maçlar.',
        selections
      });
    }

    return coupons;
  }, [matches]);

  const handleCopyCoupon = (coupon: typeof proCoupons[0]) => {
    onAddMultipleSelections(coupon.selections);
    setCopiedCouponId(coupon.id);
    setTimeout(() => setCopiedCouponId(null), 2500);
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Header Banner */}
      <div className="bg-[#0F1115] border border-[#1F2937] rounded-xl p-4 shadow-lg space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 border border-green-500/30 flex items-center justify-center font-bold">
            <Flame className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Günün Hazır Banko Kuponları & Uzman Tercihleri
            </h2>
            <p className="text-[11px] text-gray-400 font-sans">
              Yapay zeka simülasyonları ve kıdemli analistlerce filtrelenmiş hazır kuponlar
            </p>
          </div>
        </div>
      </div>

      {/* Coupons List */}
      <div className="space-y-4">
        {proCoupons.map(coupon => {
          const isCopied = copiedCouponId === coupon.id;

          return (
            <div
              key={coupon.id}
              className="bg-[#0F1115] border border-[#1F2937] rounded-xl overflow-hidden shadow-lg hover:border-green-500/40 transition-all"
            >
              {/* Card Header */}
              <div className="bg-[#161B22] p-4 border-b border-[#21262D] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${coupon.badgeColor}`}>
                      {coupon.badge}
                    </span>
                    <span className="text-xs text-gray-400 font-sans">
                      Analist: <strong className="text-white">{coupon.analyst}</strong>
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-white mt-1">
                    {coupon.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="bg-[#0D1117] px-3 py-1.5 rounded-lg border border-[#30363D] text-right">
                    <span className="text-[9px] text-gray-400 block uppercase">Toplam Oran</span>
                    <span className="text-base font-black text-green-400 font-mono">
                      {coupon.totalOdds}
                    </span>
                  </div>
                  <div className="bg-[#0D1117] px-3 py-1.5 rounded-lg border border-[#30363D] text-right">
                    <span className="text-[9px] text-gray-400 block uppercase">Güven Endeksi</span>
                    <span className="text-base font-black text-amber-400 font-mono">
                      %{coupon.confidence}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="px-4 py-2.5 bg-[#0D1117] border-b border-[#21262D] text-xs font-sans text-gray-300">
                {coupon.description}
              </div>

              {/* Selections in Coupon */}
              <div className="p-4 space-y-2">
                {coupon.selections.map((sel, idx) => (
                  <div
                    key={idx}
                    className="bg-[#161B22] border border-[#30363D] rounded-lg p-2.5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                        <TeamLogo logo={sel.leagueLogo} fallback="⚽" className="w-3.5 h-3.5 shrink-0" />
                        <span>{sel.leagueName}</span>
                        <span>• {sel.matchTime}</span>
                      </div>
                      <h5 className="font-bold text-white mt-0.5">
                        {sel.homeTeam} - {sel.awayTeam}
                      </h5>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded bg-[#0D1117] text-green-400 border border-green-500/30 text-xs font-bold">
                        {sel.marketLabel}
                      </span>
                      <span className="font-black text-white font-mono text-sm">
                        @{Number(sel.odds).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Button: Oyna & Kupona Aktar */}
              <div className="bg-[#161B22] px-4 py-3 border-t border-[#21262D] flex items-center justify-between">
                <span className="text-xs text-gray-400 font-sans">
                  {coupon.matchesCount} Karşılaşma Seçildi
                </span>

                <button
                  onClick={() => handleCopyCoupon(coupon)}
                  className={`px-5 py-2 rounded-lg font-black text-xs uppercase flex items-center gap-2 transition-all shadow-md cursor-pointer ${
                    isCopied
                      ? 'bg-green-600 text-white'
                      : 'bg-green-500 hover:bg-green-400 text-black shadow-green-500/20'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Kupona Eklendi!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Tümünü Kuponuma Ekle (Oran: {coupon.totalOdds})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
