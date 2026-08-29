import React, { useState } from 'react';
import { 
  Wallet, 
  X, 
  Plus, 
  CheckCircle2, 
  Sparkles, 
  ArrowUpRight, 
  Coins, 
  CreditCard,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';

interface BalanceDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBankroll: number;
  onDeposit: (amount: number) => void;
  onReset: () => void;
}

export const BalanceDepositModal: React.FC<BalanceDepositModalProps> = ({
  isOpen,
  onClose,
  currentBankroll,
  onDeposit,
  onReset
}) => {
  const [amount, setAmount] = useState<string>('500');
  const [successNotif, setSuccessNotif] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickAmounts = [
    { label: '+₺250', val: 250 },
    { label: '+₺500', val: 500 },
    { label: '+₺1.000', val: 1000 },
    { label: '+₺2.500', val: 2500 },
    { label: '+₺5.000', val: 5000 },
    { label: '+₺10.000', val: 10000 },
  ];

  const handleAdd = (valToAdd?: number) => {
    const num = valToAdd !== undefined ? valToAdd : parseFloat(amount);
    if (!isNaN(num) && num > 0) {
      onDeposit(num);
      setSuccessNotif(`+₺${num.toLocaleString('tr-TR')} bakiye hesabınıza başarıyla tanımlandı!`);
      setTimeout(() => {
        setSuccessNotif(null);
        onClose();
      }, 1400);
    }
  };

  const handleQuickAdd = (val: number) => {
    handleAdd(val);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 font-mono animate-in fade-in duration-150 cursor-pointer"
      onClick={e => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-[#0D1117] border border-[#30363D] rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 text-[#E0E0E0] cursor-default"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#21262D]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-green-500/10 text-green-400 border border-green-500/30 flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">Kasa & Bakiye Yükleme</h3>
              <p className="text-[11px] text-gray-400 font-sans">
                Kuponlarınızı oluşturmak için anında bakiye tanımlayın
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#161B22] text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Balance Display */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-mono uppercase block">Mevcut Kasa Bakiyesi</span>
            <div className="flex items-center gap-2 mt-0.5">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-xl sm:text-2xl font-black text-green-400 font-mono">
                ₺{currentBankroll.toLocaleString('tr-TR')}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              onReset();
              setSuccessNotif('Kasa bakiyesi ₺1.000 olarak sıfırlandı.');
              setTimeout(() => {
                setSuccessNotif(null);
                onClose();
              }, 1200);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-[#0D1117] hover:bg-[#1F2937] border border-[#30363D] text-gray-400 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
            title="Bakiyeyi Varsayılan ₺1.000 Değerine Sıfırla"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Sıfırla</span>
          </button>
        </div>

        {/* Success Alert */}
        {successNotif && (
          <div className="p-3 rounded-xl bg-green-500/15 border border-green-500/40 text-green-300 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
            <span>{successNotif}</span>
          </div>
        )}

        {/* Quick Amount Buttons */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block">
            Hızlı Tutar Seçin
          </label>
          <div className="grid grid-cols-3 gap-2">
            {quickAmounts.map(q => (
              <button
                key={q.val}
                type="button"
                onClick={() => handleQuickAdd(q.val)}
                className="p-2.5 rounded-xl bg-[#161B22] hover:bg-green-500/10 border border-[#30363D] hover:border-green-500 text-white hover:text-green-400 font-bold font-mono text-xs flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <Plus className="w-3 h-3" />
                <span>{q.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <div className="space-y-2 pt-1">
          <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block">
            Özel Tutar Girin (₺)
          </label>
          <div className="bg-[#0D1117] border border-[#30363D] focus-within:border-green-500 rounded-xl p-3 flex items-center justify-between transition-colors">
            <span className="text-gray-400 font-black text-sm">₺</span>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="bg-transparent text-right w-full text-white font-mono font-black text-base focus:outline-none px-2"
              placeholder="500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-[#161B22] hover:bg-[#1F2937] border border-[#30363D] text-gray-300 font-bold text-xs uppercase font-mono transition-colors cursor-pointer"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={() => handleAdd()}
            className="flex-2 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-black font-black text-xs uppercase font-mono tracking-wider shadow-lg shadow-green-500/20 flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Bakiyeyi Yükle</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
          <span>BetProGol Canlı Kupon ve Kasa Yönetim Sistemi</span>
        </div>
      </div>
    </div>
  );
};
