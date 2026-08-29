import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  TrendingUp, 
  ShieldAlert, 
  Target, 
  Flame, 
  UserCheck, 
  Calendar, 
  Clock, 
  Check, 
  Plus, 
  RefreshCw, 
  MessageSquare,
  Bot,
  Zap,
  Award,
  ChevronRight,
  Layers,
  HelpCircle
} from 'lucide-react';
import { Match, AIPredictionResult, BetSlipSelection } from '../types/betting';
import { fetchAIMatchPrediction, fetchAIScoutChat } from '../services/geminiService';
import { TeamLogo } from './TeamLogo';

interface AIPredictorProps {
  matches: Match[];
  initialMatch?: Match | null;
  onAddSelection: (selection: BetSlipSelection) => void;
  activeSelections: BetSlipSelection[];
}

export const AIPredictor: React.FC<AIPredictorProps> = ({
  matches,
  initialMatch,
  onAddSelection,
  activeSelections
}) => {
  const [selectedMatch, setSelectedMatch] = useState<Match>(initialMatch || matches[0]);
  const [prediction, setPrediction] = useState<AIPredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [customNote, setCustomNote] = useState('');

  // AI Scout Chat states
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'bot'; text: string; time: string }[]>([
    {
      sender: 'bot',
      text: 'Merhaba! Ben BetProGol AI Scout. Maç istatistikleri, sakatlıklar, yapay zeka gol modelleri veya kupon stratejileri hakkında bana dilediğin soruyu sorabilirsin.',
      time: 'Şimdi'
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    if (initialMatch) {
      setSelectedMatch(initialMatch);
    }
  }, [initialMatch]);

  useEffect(() => {
    if (selectedMatch) {
      loadPrediction(selectedMatch);
    }
  }, [selectedMatch]);

  const loadPrediction = async (m: Match) => {
    setLoading(true);
    try {
      const res = await fetchAIMatchPrediction(
        m.homeTeam.name,
        m.awayTeam.name,
        m.leagueName,
        m.date,
        m.odds,
        customNote,
        m.sport
      );
      setPrediction(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || chatLoading) return;
    const text = userInput;
    setUserInput('');

    const newMsgs = [
      ...chatMessages,
      { sender: 'user' as const, text, time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) }
    ];
    setChatMessages(newMsgs);
    setChatLoading(true);

    try {
      const answer = await fetchAIScoutChat(text, {
        homeTeam: selectedMatch.homeTeam.name,
        awayTeam: selectedMatch.awayTeam.name,
        league: selectedMatch.leagueName,
        score: `${selectedMatch.homeScore ?? 0}-${selectedMatch.awayScore ?? 0}`
      });

      setChatMessages([
        ...newMsgs,
        { sender: 'bot', text: answer, time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) }
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setChatLoading(false);
    }
  };

  const isSelectionActive = (market: any) => {
    return activeSelections.some(s => s.matchId === selectedMatch?.id && s.market === market);
  };

  const handleAddPredictionToSlip = (market: any, label: string, odds: number) => {
    if (!selectedMatch) return;
    onAddSelection({
      matchId: selectedMatch.id,
      homeTeam: selectedMatch.homeTeam.name,
      awayTeam: selectedMatch.awayTeam.name,
      matchDate: selectedMatch.date,
      matchTime: selectedMatch.time,
      leagueName: selectedMatch.leagueName,
      leagueLogo: selectedMatch.leagueLogo,
      sport: selectedMatch.sport,
      market,
      marketLabel: label,
      odds,
      status: 'PENDING'
    });
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Top Selector Card */}
      <div className="bg-[#0F1115] border border-[#1F2937] rounded-xl p-4 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 border border-green-500/30 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Yapay Zeka Bahis & Fikstür Tahmin Terminali
              </h2>
              <p className="text-[11px] text-gray-400 font-sans">
                Gemini 2.5 Flash ile derin istatistik, xG ve oyuncu modeli analizleri
              </p>
            </div>
          </div>

          {/* Match Selector Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedMatch?.id}
              onChange={e => {
                const found = matches.find(m => m.id === e.target.value);
                if (found) setSelectedMatch(found);
              }}
              className="bg-[#161B22] border border-[#30363D] text-white text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-green-500"
            >
              {matches.map(m => (
                <option key={m.id} value={m.id}>
                  {m.homeTeam.name} vs {m.awayTeam.name} ({m.leagueName})
                </option>
              ))}
            </select>

            <button
              onClick={() => selectedMatch && loadPrediction(selectedMatch)}
              disabled={loading}
              className="p-2 rounded-lg bg-[#161B22] border border-[#30363D] hover:border-green-500 text-gray-300 hover:text-white transition-colors cursor-pointer"
              title="Analizi Yenile"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-green-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Analysis Body */}
      {loading ? (
        <div className="bg-[#0F1115] border border-[#1F2937] rounded-xl p-12 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="text-sm font-bold text-white uppercase">Yapay Zeka Analiz Raporu Hazırlanıyor...</h3>
          <p className="text-xs text-gray-400 font-sans max-w-sm mx-auto">
            Takımların son 10 maçı, iç/dış saha performansı, sakatlıklar ve xG oranları taranıyor.
          </p>
        </div>
      ) : prediction ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left / Main Analysis Panel */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Primary AI Picks Recommendation Banner */}
            <div className="bg-gradient-to-r from-[#161B22] via-[#1F2937] to-[#161B22] border border-green-500/40 rounded-xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-green-500 text-black text-[10px] font-black uppercase tracking-wider">
                    ÖNERİLEN TAHMİN
                  </span>
                  <span className="text-xs text-gray-300 font-bold">
                    Güven: %{prediction.primaryPick.confidence}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-green-400 bg-[#0D1117] px-2.5 py-1 rounded border border-green-500/30">
                  Tahmini Skor: {prediction.predictedScore}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div>
                  <h3 className="text-base font-black text-white">
                    {prediction.primaryPick.label}
                  </h3>
                  <p className="text-xs text-gray-300 font-sans mt-1">
                    {prediction.primaryPick.reasoning}
                  </p>
                </div>

                <button
                  onClick={() => handleAddPredictionToSlip(prediction.primaryPick.market, prediction.primaryPick.label, prediction.primaryPick.odds)}
                  className={`px-4 py-2.5 rounded-lg font-black text-xs uppercase flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0 ${
                    isSelectionActive(prediction.primaryPick.market)
                      ? 'bg-green-600 text-white'
                      : 'bg-green-500 hover:bg-green-400 text-black'
                  }`}
                >
                  {isSelectionActive(prediction.primaryPick.market) ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Kuponda Eklendi</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Kupona Ekle (Oran: {prediction.primaryPick.odds})</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Win Probabilities Bar */}
            <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                Maç Sonucu Olasılık Dağılımı
              </h4>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-green-400">%{prediction.winProbabilities.homeWin} {selectedMatch.homeTeam.name}</span>
                  {prediction.winProbabilities.draw > 0 && (
                    <span className="text-gray-400">%{prediction.winProbabilities.draw} Beraberlik</span>
                  )}
                  <span className="text-cyan-400">%{prediction.winProbabilities.awayWin} {selectedMatch.awayTeam.name}</span>
                </div>

                <div className="w-full h-3 bg-[#0D1117] rounded-full overflow-hidden flex">
                  <div className="bg-green-500 h-full" style={{ width: `${prediction.winProbabilities.homeWin}%` }} />
                  {prediction.winProbabilities.draw > 0 && (
                    <div className="bg-gray-600 h-full" style={{ width: `${prediction.winProbabilities.draw}%` }} />
                  )}
                  <div className="bg-cyan-500 h-full" style={{ width: `${prediction.winProbabilities.awayWin}%` }} />
                </div>
              </div>
            </div>

            {/* Secondary Value & Player Picks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Value Pick */}
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    DEĞERLİ ORAN
                  </span>
                  <span className="text-xs font-bold font-mono text-amber-400">Oran: {prediction.valuePick.odds}</span>
                </div>
                <h4 className="text-xs font-bold text-white">{prediction.valuePick.label}</h4>
                <p className="text-[11px] text-gray-400 font-sans">{prediction.valuePick.reasoning}</p>
                <button
                  onClick={() => handleAddPredictionToSlip(prediction.valuePick.market, prediction.valuePick.label, prediction.valuePick.odds)}
                  className="w-full py-1.5 rounded bg-[#0D1117] hover:bg-green-500 hover:text-black border border-[#30363D] text-gray-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Kupona Ekle
                </button>
              </div>

              {/* Player Prop Pick */}
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                    OYUNCU PERFORMANSI
                  </span>
                  <span className="text-xs font-bold font-mono text-blue-400">Oran: {prediction.playerPick.odds}</span>
                </div>
                <h4 className="text-xs font-bold text-white">{prediction.playerPick.label}</h4>
                <p className="text-[11px] text-gray-400 font-sans">{prediction.playerPick.reasoning}</p>
                <button
                  onClick={() => handleAddPredictionToSlip(prediction.playerPick.market, prediction.playerPick.label, prediction.playerPick.odds)}
                  className="w-full py-1.5 rounded bg-[#0D1117] hover:bg-green-500 hover:text-black border border-[#30363D] text-gray-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Kupona Ekle
                </button>
              </div>
            </div>

            {/* Tactical Insights */}
            <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 space-y-2.5">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-green-400" />
                <span>Taktiksel ve Kadro Analizi</span>
              </h4>

              <div className="space-y-2 text-xs font-sans text-gray-300">
                <p>• <strong>Ev Sahibi Formu:</strong> {prediction.tacticalInsights.homeForm}</p>
                <p>• <strong>Deplasman Formu:</strong> {prediction.tacticalInsights.awayForm}</p>
                <p>• <strong>Kilit Eşleşme:</strong> {prediction.tacticalInsights.keyMatchup}</p>
                <p>• <strong>Eksikler & Rotasyon:</strong> {prediction.tacticalInsights.absencesImpact}</p>
              </div>
            </div>
          </div>

          {/* Right / AI Scout Chat Assistant */}
          <div className="lg:col-span-4 bg-[#161B22] border border-[#30363D] rounded-xl p-4 flex flex-col h-[520px] shadow-lg">
            <div className="flex items-center gap-2 pb-3 border-b border-[#21262D]">
              <Bot className="w-5 h-5 text-green-400" />
              <div>
                <h4 className="text-xs font-bold text-white">BetProGol AI Scout Chat</h4>
                <span className="text-[10px] text-green-400">Çevrimiçi • Canlı Asistan</span>
              </div>
            </div>

            {/* Messages Log */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 font-sans text-xs no-scrollbar">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-xl ${
                      msg.sender === 'user'
                        ? 'bg-green-600 text-white rounded-br-none'
                        : 'bg-[#0D1117] text-gray-200 border border-[#21262D] rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  </div>
                  <span className="text-[9px] text-gray-500 mt-1 font-mono">{msg.time}</span>
                </div>
              ))}
              {chatLoading && (
                <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce delay-100" />
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce delay-200" />
                  <span>AI Scout yazıyor...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="pt-2 border-t border-[#21262D] flex items-center gap-2">
              <input
                type="text"
                placeholder="Örn: Bu maçta 2.5 üst olur mu?..."
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-green-500 font-sans"
              />
              <button
                onClick={handleSendMessage}
                disabled={chatLoading || !userInput.trim()}
                className="p-2 rounded-lg bg-green-500 hover:bg-green-400 text-black transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
