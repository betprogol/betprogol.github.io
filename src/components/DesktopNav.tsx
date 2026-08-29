import React from 'react';
import { 
  CalendarDays, 
  Sparkles, 
  Ticket, 
  BarChart3, 
  Archive, 
  Bell, 
  Flame,
  Radio,
  Activity,
  UserCheck
} from 'lucide-react';
import { UserProfile } from '../types/auth';

interface DesktopNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  slipCount: number;
  unreadNotifsCount: number;
  liveCount: number;
  currentUser?: UserProfile;
  onOpenProfileModal?: () => void;
}

export const DesktopNav: React.FC<DesktopNavProps> = ({
  activeTab,
  setActiveTab,
  slipCount,
  unreadNotifsCount,
  liveCount,
  currentUser,
  onOpenProfileModal
}) => {
  const tabs = [
    { id: 'fixtures', label: 'Bülten & Canlılar', icon: CalendarDays, count: liveCount ? `${liveCount} Canlı` : undefined, live: true },
    { id: 'ai', label: 'AI Tahmin Motoru', icon: Sparkles, badge: 'PRO', special: true },
    { id: 'predictions', label: 'Kuponlarım & Takip', icon: Ticket, count: slipCount ? `${slipCount}` : undefined },
    { id: 'pro-coupons', label: 'Günün Bankoları', icon: Flame, badge: 'HOT' },
    { id: 'stats', label: 'Kasa & Analitik', icon: BarChart3 },
    { id: 'archive', label: 'Maç Arşivi', icon: Archive },
    { id: 'notifications', label: 'Kupon Radarı & Alarmlar', icon: Bell, count: unreadNotifsCount ? `${unreadNotifsCount}` : undefined }
  ];

  return (
    <div className="hidden md:block border-b border-[#1F2937] bg-[#0F1115]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <nav className="flex space-x-1 py-2 overflow-x-auto no-scrollbar">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#1F2937] text-white border border-[#30363D] shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#161B22]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${
                    isActive ? 'text-green-500' : 'text-gray-500'
                  }`} />
                  <span>{tab.label}</span>
                  {tab.count && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                      isActive 
                        ? 'bg-[#0A0B0E] text-green-400 border border-green-500/30' 
                        : tab.live 
                          ? 'bg-red-500/10 text-red-400 border border-red-500/30 animate-pulse'
                          : 'bg-[#161B22] text-gray-400 border border-[#30363D]'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                  {tab.badge && (
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-black tracking-wider uppercase ${
                      tab.special
                        ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                        : 'bg-red-500/20 text-red-400 border border-red-500/40'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {currentUser && onOpenProfileModal && (
            <button
              onClick={onOpenProfileModal}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#161B22] border border-[#30363D] hover:border-green-500/50 text-gray-300 hover:text-white text-xs font-mono transition-all cursor-pointer shrink-0 ml-2"
              title="Üyelik ve Profil Ayarları"
            >
              <span>{currentUser.avatar}</span>
              <span className="font-bold text-white text-[11px]">{currentUser.fullName}</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-green-500/20 text-green-400 font-bold">
                {currentUser.tier}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
