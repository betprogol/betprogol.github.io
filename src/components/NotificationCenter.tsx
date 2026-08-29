import React from 'react';
import { 
  Bell, 
  Check, 
  Trash2, 
  Radio, 
  Flame, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck,
  Volume2,
  VolumeX,
  Settings,
  Info
} from 'lucide-react';
import { AppNotification } from '../types/betting';
import { UserPreferences } from '../types/auth';
import { notificationService } from '../services/notificationService';

interface NotificationCenterProps {
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAllAsRead,
  onClearAll,
  preferences,
  onUpdatePreferences
}) => {
  return (
    <div className="space-y-4 font-mono">
      {/* Top Header */}
      <div className="bg-[#0F1115] border border-[#1F2937] rounded-xl p-4 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 border border-green-500/30 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Kupon Radarı & Canlı Maç Alarmları
              </h2>
              <p className="text-[11px] text-gray-400 font-sans">
                Kuponunuzdaki maçların gol, kırmızı kart ve sonuç bildirimleri
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs flex-wrap">
            <button
              onClick={() => {
                notificationService.notifyGoal(
                  'Galatasaray',
                  'Fenerbahçe',
                  'Galatasaray',
                  Math.floor(Math.random() * 80) + 10,
                  '2 - 1',
                  preferences.soundEnabled
                );
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/50 hover:bg-emerald-500/30 text-emerald-300 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Canlı Gol Bildirimi Test Et"
            >
              <span>⚽</span> Test Gol Bildirimi
            </button>
            {notifications.length > 0 && (
              <>
                <button
                  onClick={onMarkAllAsRead}
                  className="px-3 py-1.5 rounded-lg bg-[#161B22] border border-[#30363D] hover:border-green-500 text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  Tümünü Okundu Say
                </button>
                <button
                  onClick={onClearAll}
                  className="p-1.5 rounded-lg bg-[#161B22] border border-[#30363D] hover:border-red-500 text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                  title="Bildirimleri Temizle"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Preference Toggles Bar */}
        <div className="pt-3 border-t border-[#21262D] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {/* Toggle 1: Only My Slip Matches */}
          <label className="flex items-center gap-2 bg-[#161B22] p-2.5 rounded-lg border border-[#30363D] cursor-pointer hover:border-green-500 transition-colors">
            <input
              type="checkbox"
              checked={preferences.notifyOnlyMySlipMatches}
              onChange={e => onUpdatePreferences({ notifyOnlyMySlipMatches: e.target.checked })}
              className="rounded accent-green-500"
            />
            <span className="text-[11px] text-white font-bold">Sadece Kuponumdaki Maçlar</span>
          </label>

          {/* Toggle 2: Sound FX */}
          <label className="flex items-center gap-2 bg-[#161B22] p-2.5 rounded-lg border border-[#30363D] cursor-pointer hover:border-green-500 transition-colors">
            <input
              type="checkbox"
              checked={preferences.soundEnabled}
              onChange={e => onUpdatePreferences({ soundEnabled: e.target.checked })}
              className="rounded accent-green-500"
            />
            <span className="text-[11px] text-white font-bold">Canlı Gol Sesi (Whistle/Cheer)</span>
          </label>

          {/* Toggle 3: Goals */}
          <label className="flex items-center gap-2 bg-[#161B22] p-2.5 rounded-lg border border-[#30363D] cursor-pointer hover:border-green-500 transition-colors">
            <input
              type="checkbox"
              checked={preferences.notifyGoals}
              onChange={e => onUpdatePreferences({ notifyGoals: e.target.checked })}
              className="rounded accent-green-500"
            />
            <span className="text-[11px] text-white font-bold">Gol Bildirimleri</span>
          </label>

          {/* Toggle 4: Red Cards */}
          <label className="flex items-center gap-2 bg-[#161B22] p-2.5 rounded-lg border border-[#30363D] cursor-pointer hover:border-green-500 transition-colors">
            <input
              type="checkbox"
              checked={preferences.notifyRedCards}
              onChange={e => onUpdatePreferences({ notifyRedCards: e.target.checked })}
              className="rounded accent-green-500"
            />
            <span className="text-[11px] text-white font-bold">Kırmızı Kart Alarmları</span>
          </label>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {notifications.length === 0 ? (
          <div className="bg-[#0F1115] border border-[#1F2937] rounded-xl p-10 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#161B22] border border-[#30363D] flex items-center justify-center mx-auto text-gray-500">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase">Henüz Bildirim Yok</h3>
            <p className="text-xs text-gray-400 font-sans max-w-sm mx-auto">
              Kuponlarınızdaki maçlarda gol olduğunda ve kuponunuz sonuçlandığında anında sesli bildirim alacaksınız.
            </p>
          </div>
        ) : (
          notifications.map(notif => {
            const isGoal = notif.type === 'GOAL';
            const isSlipWon = notif.type === 'SLIP_WON';
            const isRedCard = notif.type === 'RED_CARD';

            return (
              <div
                key={notif.id}
                className={`bg-[#0F1115] border rounded-xl p-3.5 flex items-start gap-3 transition-colors ${
                  !notif.read ? 'border-green-500/40 bg-[#161B22]/60' : 'border-[#1F2937]'
                }`}
              >
                {/* Icon */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isGoal ? 'bg-amber-500/20 text-amber-300' :
                  isSlipWon ? 'bg-green-500/20 text-green-300' :
                  isRedCard ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'
                }`}>
                  {isGoal ? '⚽' : isSlipWon ? '🏆' : isRedCard ? '🟥' : '⚡'}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white tracking-wide">
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {notif.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 font-sans mt-0.5 whitespace-pre-line">
                    {notif.message}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
