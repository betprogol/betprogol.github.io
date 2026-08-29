import React, { useState, useEffect } from 'react';
import { AppNotification } from '../types/betting';
import { Flame, Trophy, X, Bell, Zap, Radio, Volume2 } from 'lucide-react';

export interface ToastItem extends AppNotification {
  autoHideMs?: number;
}

// Global Event Dispatcher for Toast Alerts
type ToastListener = (toast: ToastItem) => void;
const listeners = new Set<ToastListener>();

export const showLiveToast = (toast: Omit<ToastItem, 'id' | 'timestamp' | 'read'>) => {
  const item: ToastItem = {
    ...toast,
    id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    read: false,
    autoHideMs: 6500
  };
  // Defer notification execution to next event loop tick to prevent setState during React render cycles
  setTimeout(() => {
    listeners.forEach(fn => {
      try {
        fn(item);
      } catch (err) {
        console.error('Toast listener error:', err);
      }
    });
  }, 0);
};

export const LiveToastContainer: React.FC<{
  onSelectNotification?: (notif: ToastItem) => void;
}> = ({ onSelectNotification }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleNewToast = (item: ToastItem) => {
      setToasts(prev => [item, ...prev.slice(0, 4)]);

      // Auto remove after duration
      const timeout = setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== item.id));
      }, item.autoHideMs || 6500);

      return () => clearTimeout(timeout);
    };

    listeners.add(handleNewToast);
    return () => {
      listeners.delete(handleNewToast);
    };
  }, []);

  const handleDismiss = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div 
      id="live-toast-overlay"
      className="fixed top-4 right-3 sm:right-6 z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const isGoal = toast.type === 'GOAL';
        const isWin = toast.type === 'SLIP_WON' || toast.type === 'BET_WON';
        const isLost = toast.type === 'SLIP_LOST';

        return (
          <div
            key={toast.id}
            id={`toast-item-${toast.id}`}
            onClick={() => onSelectNotification?.(toast)}
            className={`pointer-events-auto rounded-xl p-3.5 shadow-2xl border backdrop-blur-md transition-all transform animate-in slide-in-from-top-4 duration-300 ${
              isGoal
                ? 'bg-[#0D1810]/95 border-emerald-500 text-white shadow-emerald-500/30'
                : isWin
                ? 'bg-[#1C1605]/95 border-amber-400 text-white shadow-amber-500/30'
                : isLost
                ? 'bg-[#1A0D0D]/95 border-rose-600 text-white shadow-rose-600/20'
                : 'bg-[#161B22]/95 border-[#30363D] text-white shadow-black/50'
            }`}
          >
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-start gap-2.5 flex-1">
                {/* Icon Badge */}
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isGoal
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse'
                      : isWin
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-bounce'
                      : isLost
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}
                >
                  {isGoal ? (
                    <span className="text-lg">⚽</span>
                  ) : isWin ? (
                    <Trophy className="w-5 h-5" />
                  ) : isLost ? (
                    <span className="text-base font-black">✕</span>
                  ) : (
                    <Bell className="w-5 h-5" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-xs font-black uppercase tracking-wider ${
                        isGoal ? 'text-emerald-400' : isWin ? 'text-amber-300' : 'text-gray-200'
                      }`}
                    >
                      {toast.title}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {toast.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-gray-200 mt-1 font-medium leading-snug">
                    {toast.message}
                  </p>
                </div>
              </div>

              {/* Dismiss Button */}
              <button
                type="button"
                onClick={(e) => handleDismiss(e, toast.id)}
                className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
                title="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress Bar timer effect */}
            <div className="w-full bg-white/10 h-0.5 mt-2.5 rounded-full overflow-hidden">
              <div 
                className={`h-full animate-out duration-[6500ms] ${
                  isGoal ? 'bg-emerald-400' : isWin ? 'bg-amber-400' : 'bg-blue-400'
                }`}
                style={{ width: '100%', animation: 'shrink 6.5s linear forwards' }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
