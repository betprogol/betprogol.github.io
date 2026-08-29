import React, { useState } from 'react';
import { 
  Bell, 
  Moon, 
  Sun, 
  Smartphone, 
  Monitor, 
  TrendingUp, 
  Wallet, 
  Plus, 
  Sparkles, 
  Zap, 
  Radio,
  Activity,
  User,
  ShieldCheck,
  Crown,
  Star 
} from 'lucide-react';
import { AppNotification, Match } from '../types/betting';
import { UserProfile } from '../types/auth';
import { BalanceDepositModal } from './BalanceDepositModal';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
  bankroll: number;
  setBankroll: (val: number) => void;
  notifications: AppNotification[];
  unreadNotifsCount: number;
  setActiveTab: (tab: string) => void;
  onOpenQuickAI: () => void;
  liveMatchesCount: number;
  matches?: Match[];
  currentUser: UserProfile;
  onOpenProfileModal: () => void;
  onOpenAuthModal: () => void;
  onOpenDepositModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  setDarkMode,
  isMobileFrame,
  setIsMobileFrame,
  bankroll,
  setBankroll,
  unreadNotifsCount,
  setActiveTab,
  onOpenQuickAI,
  liveMatchesCount,
  matches = [],
  currentUser,
  onOpenProfileModal,
  onOpenAuthModal,
  onOpenDepositModal
}) => {
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('500');

  const handleDeposit = () => {
    const amt = parseFloat(depositAmount);
    if (!isNaN(amt) && amt > 0) {
      setBankroll(bankroll + amt);
      setShowWalletModal(false);
    }
  };

  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' });
  // Clean live matches: only currently active matches with valid today/live state
  const liveMatches = matches.filter(m => m.status === 'LIVE');
  const upcomingTodayMatches = matches.filter(m => m.status === 'NOT_STARTED' && (m.date === todayStr || !m.date));
  const otherUpcomingMatches = matches.filter(m => m.status === 'NOT_STARTED');
  const valueMatches = matches.filter(m => (m.aiSuggested || m.hasKralOran) && m.status !== 'FINISHED');

  return (
    <header className="sticky top-0 z-40 bg-[#0F1115] border-b border-[#1F2937] text-[#E0E0E0] shadow-xl w-full max-w-full overflow-hidden">
      {/* High Density Dynamic Live Ticker Bar */}
      <div className="bg-[#0A0B0E] border-b border-[#1F2937] py-1 px-2.5 sm:px-3 text-[11px] font-mono text-gray-300 flex items-center justify-between overflow-hidden w-full max-w-full">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="uppercase tracking-wider font-bold text-green-400 flex items-center gap-1 text-[10px]">
            <Radio className="w-3 h-3 animate-pulse text-green-400" />
            <span className="hidden sm:inline">CANLI AKIŞ</span>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-[11px] overflow-x-auto no-scrollbar whitespace-nowrap pl-2 sm:pl-4 font-mono max-w-full">
          {liveMatches.length > 0 ? (
            liveMatches.slice(0, 5).map(m => {
              const homeName = m.homeTeam?.name || 'Ev Sahibi';
              const awayName = m.awayTeam?.name || 'Deplasman';
              const homeShort = m.homeTeam?.shortName || homeName.substring(0, 3).toUpperCase();
              const awayShort = m.awayTeam?.shortName || awayName.substring(0, 3).toUpperCase();
              return (
                <span 
                  key={m.id}
                  onClick={() => setActiveTab('fixtures')}
                  className="bg-[#161B22] border border-green-500/50 hover:border-green-400 px-2 py-0.5 rounded text-gray-200 flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                  title={`${m.leagueName || 'Lig'}: ${homeName} vs ${awayName}`}
                >
                  <span className="text-green-400 font-bold">
                    {m.sport === 'BASKETBALL' ? '🏀' : m.sport === 'VOLLEYBALL' ? '🏐' : m.sport === 'TENNIS' ? '🎾' : '⚽'}{' '}
                    {homeShort} {m.homeScore ?? 0}-{m.awayScore ?? 0} {awayShort}
                  </span>
                  <span className="text-emerald-400 font-medium bg-green-950/60 px-1 rounded text-[10px]">({m.minute ? `${m.minute}'` : 'Canlı'})</span>
                </span>
              );
            })
          ) : upcomingTodayMatches.length > 0 ? (
            upcomingTodayMatches.slice(0, 4).map(m => {
              const homeName = m.homeTeam?.name || 'Ev Sahibi';
              const awayName = m.awayTeam?.name || 'Deplasman';
              return (
                <span 
                  key={m.id}
                  onClick={() => setActiveTab('fixtures')}
                  className="bg-[#161B22] border border-[#30363D] hover:border-gray-500 px-2 py-0.5 rounded text-gray-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span className="text-gray-400">🕒 {m.time || 'Bugün'}:</span>
                  <span className="text-white font-semibold">{homeName} - {awayName}</span>
                  <span className="text-green-400 font-bold bg-[#0D1117] px-1 rounded text-[10px]">MS1: {m.odds?.ms1 || 1.80}</span>
                </span>
              );
            })
          ) : otherUpcomingMatches.length > 0 ? (
            otherUpcomingMatches.slice(0, 3).map(m => {
              const homeName = m.homeTeam?.name || 'Ev Sahibi';
              const awayName = m.awayTeam?.name || 'Deplasman';
              return (
                <span 
                  key={m.id}
                  onClick={() => setActiveTab('fixtures')}
                  className="bg-[#161B22] border border-[#30363D] hover:border-gray-500 px-2 py-0.5 rounded text-gray-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="text-gray-400">🕒 {m.time || '20:00'}:</span>
                  <span className="text-white font-semibold">{homeName} - {awayName}</span>
                </span>
              );
            })
          ) : (
            <span className="text-gray-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping"></span>
              Canlı maç bülteni güncelleniyor...
            </span>
          )}

          {valueMatches.length > 0 && (
            <span 
              onClick={() => setActiveTab('fixtures')}
              className="hidden md:inline bg-emerald-950/40 border border-emerald-500/40 px-2 py-0.5 rounded text-emerald-300 cursor-pointer"
            >
              👑 AI Seçimi: <strong className="text-white">{valueMatches[0].homeTeam?.name || 'Maç'}</strong> (Oran: {valueMatches[0].odds?.ms1 || 1.85})
            </span>
          )}
        </div>

        <div className="hidden lg:flex items-center gap-1 text-[10px] font-mono text-gray-400">
          <span>AKTİF BÜLTEN:</span>
          <span className="font-bold text-green-400">{matches.length} Karşılaşma</span>
        </div>
      </div>

      {/* Main Nav Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between">
        {/* Brand Logo - High Density BETPROGOL style */}
        <div 
          onClick={() => setActiveTab('fixtures')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center font-bold text-black text-sm tracking-tighter shadow-md shadow-green-500/20 group-hover:scale-105 transition-transform">
            B
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-extrabold text-lg sm:text-xl tracking-tighter text-white">
                BETPRO<span className="text-green-500">GOL</span>
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/30">
                LIVE
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium font-mono hidden sm:block mt-0.5">
              Canlı Skor, İddaa Tahmin & Analiz Terminali
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2.5">
          
          {/* User Membership & Profile Badge */}
          <button
            onClick={onOpenProfileModal}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-md bg-[#161B22] border border-[#30363D] hover:border-green-500/60 text-white text-xs font-semibold shadow-sm transition-all hover:bg-[#1F2937] group shrink-0"
            title="Üyelik & Profil Ayarları"
          >
            <span className="text-sm">{currentUser?.avatar || '👤'}</span>
            <div className="text-left hidden sm:block leading-none">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-white group-hover:text-green-400 transition-colors">
                  {(currentUser?.fullName || currentUser?.username || 'Üye').split(' ')[0]}
                </span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-green-500/20 text-green-400 font-mono font-bold">
                  {currentUser?.tier || 'PRO'}
                </span>
              </div>
              <span className="text-[9px] text-gray-400 font-mono block mt-0.5">
                ₺{bankroll.toLocaleString('tr-TR')}
              </span>
            </div>
          </button>

          {/* Quick AI Button */}
          <button
            onClick={onOpenQuickAI}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-md bg-[#161B22] border border-[#30363D] hover:border-green-500/50 text-white text-xs font-semibold shadow-sm transition-all hover:bg-[#1F2937] shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-green-400" />
            <span className="hidden md:inline font-mono">AI Terminal</span>
            <span className="md:hidden font-mono text-[10px]">AI</span>
          </button>

          {/* User Balance / Wallet Pill */}
          <div 
            onClick={() => onOpenDepositModal ? onOpenDepositModal() : setShowWalletModal(true)}
            className="flex items-center gap-1 sm:gap-2 bg-[#161B22] hover:bg-[#1F2937] px-2 sm:px-2.5 py-1.5 rounded-md border border-[#30363D] hover:border-green-500/60 cursor-pointer transition-colors group shrink-0"
            title="Kasa Yönetimi & Hesaba Bakiye Yükleme"
          >
            <div className="w-2 h-2 rounded-full bg-green-500 shrink-0 animate-pulse hidden xs:block"></div>
            <div className="text-right leading-none">
              <span className="text-[8px] sm:text-[9px] font-mono uppercase text-gray-500 block font-semibold">Kasa</span>
              <span className="text-[11px] sm:text-xs font-bold font-mono text-green-400 group-hover:text-green-300 transition-colors">
                ₺{bankroll.toLocaleString('tr-TR')}
              </span>
            </div>
            <div className="w-4 h-4 rounded bg-green-500/20 text-green-400 border border-green-500/30 flex items-center justify-center shrink-0">
              <Plus className="w-3 h-3 text-green-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>

          {/* Notification Bell */}
          <button
            onClick={() => setActiveTab('notifications')}
            className="relative p-1.5 sm:p-2 rounded-md bg-[#161B22] hover:bg-[#1F2937] border border-[#30363D] text-gray-300 hover:text-white transition-colors shrink-0"
            title="Bildirimler & Kupon Alarmları"
          >
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-red-500 text-white text-[8px] sm:text-[9px] font-mono font-bold flex items-center justify-center animate-pulse">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          {/* Desktop / Mobile Frame Mode Switcher */}
          <button
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            className="hidden lg:flex items-center gap-1.5 p-2 rounded-md bg-[#161B22] hover:bg-[#1F2937] border border-[#30363D] text-gray-300 hover:text-white transition-colors text-xs font-medium"
            title={isMobileFrame ? 'Geniş Ekran Moduna Geç' : 'Mobil Uygulama Çerçevesine Geç'}
          >
            {isMobileFrame ? (
              <>
                <Monitor className="w-4 h-4 text-green-400" />
                <span className="text-[10px] font-mono">Full UI</span>
              </>
            ) : (
              <>
                <Smartphone className="w-4 h-4 text-green-400" />
                <span className="text-[10px] font-mono">Mobile</span>
              </>
            )}
          </button>

          {/* Dark / Light Mode Switch */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-md bg-[#161B22] hover:bg-[#1F2937] border border-[#30363D] text-amber-400 hover:text-amber-300 transition-colors"
            title={darkMode ? 'Açık Moda Geç' : 'Koyu Moda Geç'}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-blue-400" />}
          </button>
        </div>
      </div>

      {/* Wallet Deposit Modal */}
      <BalanceDepositModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        currentBankroll={bankroll}
        onDeposit={(amt) => setBankroll(bankroll + amt)}
        onReset={() => setBankroll(1000)}
      />
    </header>
  );
};
