import React from 'react';
import { 
  CalendarDays, 
  Sparkles, 
  Ticket, 
  BarChart3, 
  Archive, 
  Bell, 
  Flame,
  User
} from 'lucide-react';
import { UserProfile } from '../types/auth';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  slipCount: number;
  unreadNotifsCount: number;
  currentUser?: UserProfile;
  onOpenProfileModal?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  slipCount,
  unreadNotifsCount,
  currentUser,
  onOpenProfileModal
}) => {
  const navItems = [
    { id: 'fixtures', label: 'Bülten', icon: CalendarDays },
    { id: 'ai', label: 'AI Predict', icon: Sparkles, highlight: true },
    { id: 'predictions', label: 'Kuponlar', icon: Ticket, badge: slipCount },
    { id: 'pro-coupons', label: 'Banko', icon: Flame },
    { id: 'stats', label: 'Analiz', icon: BarChart3 },
    { id: 'notifications', label: 'Radar', icon: Bell, badge: unreadNotifsCount }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0F1115]/95 backdrop-blur-md border-t border-[#1F2937] px-1 py-1.5 shadow-2xl md:hidden">
      <div className="max-w-md mx-auto grid grid-cols-7 gap-0.5 items-center">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-0.5 rounded-md transition-all ${
                isActive 
                  ? 'text-green-400 font-bold' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="relative">
                <div className={`p-1 rounded-md transition-transform ${isActive ? 'bg-[#1F2937] border border-[#30363D]' : ''}`}>
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    isActive ? 'text-green-500' : 'text-gray-400'
                  }`} />
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-mono font-bold flex items-center justify-center border border-[#0F1115]">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full font-mono">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full mt-0.5 bg-green-500" />
              )}
            </button>
          );
        })}
        {/* User Account / Membership Button */}
        <button
          onClick={onOpenProfileModal}
          className="relative flex flex-col items-center justify-center py-1 px-0.5 rounded-md transition-all text-gray-400 hover:text-white"
        >
          <div className="p-1 rounded-md">
            <span className="text-base leading-none">{currentUser?.avatar || '👤'}</span>
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full font-mono text-green-400 font-bold">
            Hesabım
          </span>
        </button>
      </div>
    </nav>
  );
};
