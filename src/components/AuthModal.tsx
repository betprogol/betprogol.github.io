import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Crown, 
  Sparkles, 
  Check, 
  LogIn, 
  UserPlus,
  ArrowRight,
  Key
} from 'lucide-react';
import { registerUser, loginUser, getAllAccounts, DEMO_ACCOUNTS } from '../services/authService';
import { UserProfile } from '../types/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'SWITCH'>('SWITCH');
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regTier, setRegTier] = useState<'FREE' | 'PRO' | 'VIP'>('PRO');
  const [initialBankroll, setInitialBankroll] = useState('5000');
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const accounts = getAllAccounts();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim()) {
      setStatusMsg({ text: 'Lütfen kullanıcı adı veya e-posta giriniz.', type: 'error' });
      return;
    }
    const res = loginUser(usernameOrEmail);
    if (res.success && res.user) {
      setStatusMsg({ text: res.message, type: 'success' });
      setTimeout(() => {
        onSuccess(res.user!);
        onClose();
      }, 700);
    } else {
      setStatusMsg({ text: res.message, type: 'error' });
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const bankrollNum = parseFloat(initialBankroll) || 2500;
    const res = registerUser(regUsername, regEmail, regFullName, bankrollNum, regTier);
    if (res.success && res.user) {
      setStatusMsg({ text: res.message, type: 'success' });
      setTimeout(() => {
        onSuccess(res.user!);
        onClose();
      }, 700);
    } else {
      setStatusMsg({ text: res.message, type: 'error' });
    }
  };

  const handleQuickSwitch = (acc: typeof accounts[0]) => {
    const res = loginUser(acc.username);
    if (res.success && res.user) {
      setStatusMsg({ text: `Profil değiştirildi: ${res.user.fullName}`, type: 'success' });
      setTimeout(() => {
        onSuccess(res.user!);
        onClose();
      }, 500);
    }
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
        className="bg-[#0D1117] border border-[#30363D] rounded-2xl max-w-md w-full p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-[#E0E0E0] cursor-default"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#21262D] mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 border border-green-500/30 flex items-center justify-center font-bold">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                BetProGol Üyelik & Hesap Sistemi
              </h3>
              <p className="text-[10px] text-gray-400 font-sans">
                Kişiselleştirilmiş kupon arşivi ve bildirimler
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-[#161B22] text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher: SWITCH / LOGIN / REGISTER */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-[#161B22] rounded-lg border border-[#21262D] mb-4 text-xs font-bold">
          <button
            onClick={() => {
              setMode('SWITCH');
              setStatusMsg(null);
            }}
            className={`py-1.5 rounded-md transition-colors ${
              mode === 'SWITCH' ? 'bg-green-500 text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            Hesaplar
          </button>
          <button
            onClick={() => {
              setMode('LOGIN');
              setStatusMsg(null);
            }}
            className={`py-1.5 rounded-md transition-colors ${
              mode === 'LOGIN' ? 'bg-green-500 text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            Giriş Yap
          </button>
          <button
            onClick={() => {
              setMode('REGISTER');
              setStatusMsg(null);
            }}
            className={`py-1.5 rounded-md transition-colors ${
              mode === 'REGISTER' ? 'bg-green-500 text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            Yeni Üye Ol
          </button>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div className={`p-2.5 rounded-lg text-xs font-bold text-center mb-3 ${
            statusMsg.type === 'success'
              ? 'bg-green-500/20 text-green-300 border border-green-500/40'
              : 'bg-red-500/20 text-red-300 border border-red-500/40'
          }`}>
            {statusMsg.text}
          </div>
        )}

        {/* Mode 1: Quick Switch Demo Accounts */}
        {mode === 'SWITCH' && (
          <div className="space-y-2.5">
            <p className="text-xs text-gray-400 font-sans mb-1">
              Kayıtlı veya hazır analiz profillerinden birini seçerek hemen oturum açabilirsiniz:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
              {accounts.map(acc => (
                <div
                  key={acc.id}
                  onClick={() => handleQuickSwitch(acc)}
                  className="bg-[#161B22] border border-[#30363D] hover:border-green-500 p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{acc.avatar}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white group-hover:text-green-400 transition-colors">
                          {acc.fullName}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-green-500/20 text-green-400 font-mono font-bold">
                          {acc.tier}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-sans block">
                        @{acc.username} • Kasa: ₺{acc.bankroll.toLocaleString('tr-TR')}
                      </span>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mode 2: Login Form */}
        {mode === 'LOGIN' && (
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                Kullanıcı Adı veya E-Posta
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Örn: pro_analist_34 veya email"
                  value={usernameOrEmail}
                  onChange={e => setUsernameOrEmail(e.target.value)}
                  className="w-full bg-[#161B22] border border-[#30363D] rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-green-500 hover:bg-green-400 text-black font-black text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Giriş Yap</span>
            </button>
          </form>
        )}

        {/* Mode 3: Register Form */}
        {mode === 'REGISTER' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                Ad Soyad / Lakap
              </label>
              <input
                type="text"
                placeholder="Örn: Serdar Kaya"
                value={regFullName}
                onChange={e => setRegFullName(e.target.value)}
                className="w-full bg-[#161B22] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                Kullanıcı Adı
              </label>
              <input
                type="text"
                placeholder="Örn: serdar_34"
                value={regUsername}
                onChange={e => setRegUsername(e.target.value)}
                className="w-full bg-[#161B22] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                E-Posta
              </label>
              <input
                type="email"
                placeholder="Örn: serdar@gmail.com"
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
                className="w-full bg-[#161B22] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                  Üyelik Tipi
                </label>
                <select
                  value={regTier}
                  onChange={e => setRegTier(e.target.value as any)}
                  className="w-full bg-[#161B22] border border-[#30363D] rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-green-500"
                >
                  <option value="PRO">⭐ PRO ÜYE</option>
                  <option value="VIP">👑 VIP ANALİST</option>
                  <option value="FREE">Standart Üye</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                  Başlangıç Kasası (₺)
                </label>
                <input
                  type="number"
                  value={initialBankroll}
                  onChange={e => setInitialBankroll(e.target.value)}
                  className="w-full bg-[#161B22] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-green-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-green-500 hover:bg-green-400 text-black font-black text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Üyeliği Oluştur & Başla</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
