import React, { useState } from 'react';
import { 
  X, 
  User, 
  Crown, 
  LogOut, 
  Bell, 
  ShieldCheck, 
  Wallet, 
  Check, 
  Zap, 
  Flame,
  Settings,
  Users,
  Save
} from 'lucide-react';
import { UserProfile, UserPreferences } from '../types/auth';
import { updateUserPreferences, logoutUser } from '../services/authService';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUserUpdated: (user: UserProfile) => void;
  onSwitchAccountRequested: () => void;
  onOpenDepositModal?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserUpdated,
  onSwitchAccountRequested,
  onOpenDepositModal
}) => {
  const [preferences, setPreferences] = useState<UserPreferences>(currentUser.preferences);
  const [savedMsg, setSavedMsg] = useState(false);

  if (!isOpen) return null;

  const handleSavePreferences = () => {
    const updated = updateUserPreferences(currentUser.id, preferences);
    onUserUpdated(updated);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const handleLogout = () => {
    const guest = logoutUser();
    onUserUpdated(guest);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono cursor-pointer"
      onClick={e => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-[#0D1117] border border-[#30363D] rounded-2xl max-w-md w-full p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-[#E0E0E0] space-y-4 cursor-default"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#21262D]">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{currentUser.avatar}</span>
            <div>
              <h3 className="font-bold text-sm text-white">{currentUser.fullName}</h3>
              <span className="text-[10px] text-gray-400 font-sans">
                @{currentUser.username} • Üyelik: {currentUser.tierLabel}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-[#161B22] text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Account Stats Card */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-3.5 space-y-2">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="text-[10px] text-gray-400 uppercase block">Kasa</span>
              <span className="font-black text-green-400 text-sm">₺{currentUser.bankroll.toLocaleString('tr-TR')}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase block">Kuponlar</span>
              <span className="font-black text-white text-sm">{currentUser.totalBetsPlaced || 0}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase block">Toplam Kazanç</span>
              <span className="font-black text-amber-400 text-sm">₺{(currentUser.totalWinnings || 0).toLocaleString('tr-TR')}</span>
            </div>
          </div>

          {onOpenDepositModal && (
            <button
              onClick={() => {
                onClose();
                onOpenDepositModal();
              }}
              className="w-full py-2 bg-green-500/15 hover:bg-green-500/25 border border-green-500/40 text-green-300 rounded-lg text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5 text-green-400" />
              <span>+ Hesaba Bakiye Yükle</span>
            </button>
          )}
        </div>

        {/* Radar & Notification Preferences */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-green-400" />
            <span>Kişisel Kupon Radarı Ayarları</span>
          </h4>

          <div className="space-y-2 bg-[#161B22] p-3 rounded-xl border border-[#30363D] text-xs">
            {/* Toggle 1: Only My Slip Matches */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-300 font-bold">Sadece Kuponumdaki Maçları Bildir</span>
              <input
                type="checkbox"
                checked={preferences.notifyOnlyMySlipMatches}
                onChange={e => setPreferences({ ...preferences, notifyOnlyMySlipMatches: e.target.checked })}
                className="rounded accent-green-500"
              />
            </label>

            {/* Toggle 2: Sound FX */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-300 font-bold">Canlı Gol Sesi & Düdük Efekti</span>
              <input
                type="checkbox"
                checked={preferences.soundEnabled}
                onChange={e => setPreferences({ ...preferences, soundEnabled: e.target.checked })}
                className="rounded accent-green-500"
              />
            </label>

            {/* Toggle 3: Goals */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-300 font-bold">Gol Bildirimleri</span>
              <input
                type="checkbox"
                checked={preferences.notifyGoals}
                onChange={e => setPreferences({ ...preferences, notifyGoals: e.target.checked })}
                className="rounded accent-green-500"
              />
            </label>
          </div>
        </div>

        {savedMsg && (
          <div className="p-2 rounded bg-green-500/20 text-green-300 border border-green-500/40 text-xs font-bold text-center">
            ✓ Ayarlarınız Başarıyla Kaydedildi!
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-[#21262D]">
          <button
            onClick={handleSavePreferences}
            className="w-full py-2.5 bg-green-500 hover:bg-green-400 text-black font-black text-xs uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Tercihleri Kaydet</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => {
                onClose();
                onSwitchAccountRequested();
              }}
              className="flex-1 py-2 bg-[#161B22] hover:bg-[#1F2937] border border-[#30363D] text-gray-300 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Hesap Değiştir</span>
            </button>

            <button
              onClick={handleLogout}
              className="py-2 px-3 bg-[#161B22] hover:bg-red-500/20 border border-[#30363D] hover:border-red-500/40 text-red-400 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Çıkış</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
