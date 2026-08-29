import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ArrowLeftRight, 
  Award, 
  Target, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  Sparkles,
  ChevronDown,
  Swords,
  BarChart3,
  ShieldAlert
} from 'lucide-react';
import { Match, TeamInfo, H2HRecord } from '../types/betting';
import { TEAMS_DATABASE } from '../data/mockData';
import { getTeamComparisonData, TeamComparisonData, TeamDefensiveMetrics } from '../data/statsData';
import { TeamLogo } from './TeamLogo';

interface TeamComparisonProps {
  matches?: Match[];
}

export const TeamComparison: React.FC<TeamComparisonProps> = ({ matches = [] }) => {
  // Extract teams list
  const availableTeams = React.useMemo(() => {
    const list: TeamInfo[] = [];
    const seen = new Set<string>();

    if (matches && matches.length > 0) {
      matches.forEach(m => {
        if (!seen.has(m.homeTeam.name)) {
          seen.add(m.homeTeam.name);
          list.push(m.homeTeam);
        }
        if (!seen.has(m.awayTeam.name)) {
          seen.add(m.awayTeam.name);
          list.push(m.awayTeam);
        }
      });
    }

    TEAMS_DATABASE.forEach(t => {
      if (!seen.has(t.name)) {
        seen.add(t.name);
        list.push(t);
      }
    });

    return list;
  }, [matches]);

  // Initial team selections
  const [team1Name, setTeam1Name] = useState<string>('Galatasaray');
  const [team2Name, setTeam2Name] = useState<string>('Fenerbahçe');

  const team1 = availableTeams.find(t => t.name === team1Name) || availableTeams[0];
  const team2 = availableTeams.find(t => t.name === team2Name) || availableTeams[1] || availableTeams[0];

  const comparisonData: TeamComparisonData = getTeamComparisonData(team1, team2, matches);
  const { defensiveStats1: def1, defensiveStats2: def2, h2hSummary, recentH2H, aiAnalysis } = comparisonData;

  // Handler for quick fixture selector
  const handleSelectFixture = (matchId: string) => {
    const m = matches.find(match => match.id === matchId);
    if (m) {
      setTeam1Name(m.homeTeam.name);
      setTeam2Name(m.awayTeam.name);
    }
  };

  // Swap teams
  const handleSwapTeams = () => {
    setTeam1Name(team2Name);
    setTeam2Name(team1Name);
  };

  return (
    <div className="bg-[#0F1115] border border-[#1F2937] rounded-xl p-4 sm:p-5 space-y-5 font-mono shadow-xl text-[#E0E0E0]">
      
      {/* Header & Fixture Picker */}
      <div className="bg-[#161B22] p-4 rounded-xl border border-[#30363D] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#21262D] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                Takım Karşılaştırma & Defans Analitiği
              </h3>
              <p className="text-[11px] text-gray-400 font-sans">
                İki takımın geçmiş H2H maçlarını ve defansif performans metriklerini yan yana kıyaslayın
              </p>
            </div>
          </div>

          {/* Quick Fixture Dropdown */}
          {matches.length > 0 && (
            <div className="min-w-[220px]">
              <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1 font-sans">
                Fikstürden Maç Seç:
              </label>
              <div className="relative">
                <select
                  onChange={e => e.target.value && handleSelectFixture(e.target.value)}
                  defaultValue=""
                  className="w-full bg-[#0D1117] border border-[#30363D] hover:border-purple-500/50 text-white text-xs font-bold rounded-lg px-3 py-2 pr-8 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="" disabled>-- BÜLTENDEN SÜRÜKLENEN MAÇLAR --</option>
                  {matches.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.homeTeam.name} vs {m.awayTeam.name} ({m.leagueName})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {/* Manual Team Selector Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-3 pt-1">
          {/* Team 1 Selector */}
          <div className="space-y-1">
            <label className="text-[10px] text-emerald-400 uppercase font-bold block font-sans">
              Ev Sahibi / 1. Takım:
            </label>
            <div className="relative">
              <select
                value={team1Name}
                onChange={e => setTeam1Name(e.target.value)}
                className="w-full bg-[#0D1117] border border-emerald-500/40 text-white text-xs font-bold rounded-lg px-3 py-2.5 pr-8 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {availableTeams.map(t => (
                  <option key={t.id} value={t.name} disabled={t.name === team2Name}>
                    {t.name} ({t.leagueName})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center sm:pt-4">
            <button
              type="button"
              onClick={handleSwapTeams}
              className="w-9 h-9 rounded-xl bg-[#21262D] hover:bg-purple-500/20 hover:border-purple-500/50 text-gray-300 hover:text-purple-400 border border-[#30363D] flex items-center justify-center transition-all cursor-pointer shadow-sm"
              title="Takımların Yerini Değiştir"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* Team 2 Selector */}
          <div className="space-y-1">
            <label className="text-[10px] text-cyan-400 uppercase font-bold block font-sans">
              Deplasman / 2. Takım:
            </label>
            <div className="relative">
              <select
                value={team2Name}
                onChange={e => setTeam2Name(e.target.value)}
                className="w-full bg-[#0D1117] border border-cyan-500/40 text-white text-xs font-bold rounded-lg px-3 py-2.5 pr-8 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                {availableTeams.map(t => (
                  <option key={t.id} value={t.name} disabled={t.name === team1Name}>
                    {t.name} ({t.leagueName})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Team Badges & Key Details */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 bg-[#161B22] p-4 rounded-xl border border-[#30363D]">
        {/* Team 1 Details */}
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <TeamLogo logo={team1.logo} fallback="⚽" className="w-10 h-10 sm:w-12 sm:h-12 shrink-0" />
          <div className="min-w-0">
            <h4 className="font-extrabold text-white text-sm sm:text-base truncate">{team1.name}</h4>
            <div className="text-[11px] text-gray-400 font-sans flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mt-0.5">
              <span>Sıra: #{team1.leagueRank || 1}</span>
              <span>• {team1.points || 0} Puan</span>
            </div>
            {/* Form badges */}
            <div className="flex items-center justify-center sm:justify-start gap-1 mt-1.5">
              {team1.form?.map((f, idx) => (
                <span 
                  key={idx}
                  className={`w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center text-white ${
                    f === 'W' ? 'bg-emerald-500' : (f === 'D' ? 'bg-amber-500' : 'bg-red-500')
                  }`}
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* VS Badge */}
        <div className="flex flex-col items-center justify-center px-2">
          <span className="w-8 h-8 rounded-full bg-[#0D1117] border border-[#30363D] text-amber-400 font-black text-xs flex items-center justify-center shadow-inner">
            VS
          </span>
          <span className="text-[9px] text-gray-500 font-sans mt-1">H2H Kıyas</span>
        </div>

        {/* Team 2 Details */}
        <div className="flex flex-col sm:flex-row-reverse items-center gap-3 text-center sm:text-right">
          <TeamLogo logo={team2.logo} fallback="⚽" className="w-10 h-10 sm:w-12 sm:h-12 shrink-0" />
          <div className="min-w-0">
            <h4 className="font-extrabold text-white text-sm sm:text-base truncate">{team2.name}</h4>
            <div className="text-[11px] text-gray-400 font-sans flex flex-wrap items-center justify-center sm:justify-end gap-1.5 mt-0.5">
              <span>Sıra: #{team2.leagueRank || 2}</span>
              <span>• {team2.points || 0} Puan</span>
            </div>
            {/* Form badges */}
            <div className="flex items-center justify-center sm:justify-end gap-1 mt-1.5">
              {team2.form?.map((f, idx) => (
                <span 
                  key={idx}
                  className={`w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center text-white ${
                    f === 'W' ? 'bg-emerald-500' : (f === 'D' ? 'bg-amber-500' : 'bg-red-500')
                  }`}
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Head-to-Head (H2H) Historical Contrast Section */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>Geçmiş H2H Karşılaşma İstatistikleri</span>
          </h4>
          <span className="text-[11px] text-gray-400 font-sans">
            Son {h2hSummary.totalMatches} Randevu
          </span>
        </div>

        {/* Win / Draw Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold font-mono">
            <span className="text-emerald-400">{team1.name}: {h2hSummary.team1Wins} Galibiyet</span>
            <span className="text-amber-400">Beraberlik: {h2hSummary.draws}</span>
            <span className="text-cyan-400">{team2.name}: {h2hSummary.team2Wins} Galibiyet</span>
          </div>

          <div className="w-full h-3 bg-[#0D1117] rounded-full overflow-hidden flex border border-[#30363D]">
            <div 
              className="bg-emerald-500 h-full transition-all duration-500" 
              style={{ width: `${(h2hSummary.team1Wins / h2hSummary.totalMatches) * 100}%` }}
            />
            <div 
              className="bg-amber-500 h-full transition-all duration-500" 
              style={{ width: `${(h2hSummary.draws / h2hSummary.totalMatches) * 100}%` }}
            />
            <div 
              className="bg-cyan-500 h-full transition-all duration-500" 
              style={{ width: `${(h2hSummary.team2Wins / h2hSummary.totalMatches) * 100}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-gray-400 font-sans">
            <span>Atılan Gol: {h2hSummary.team1Goals}</span>
            <span>Maç Başı Gol Ort.: {h2hSummary.avgGoalsPerMatch}</span>
            <span>Atılan Gol: {h2hSummary.team2Goals}</span>
          </div>
        </div>

        {/* List of Recent H2H Matches */}
        <div className="pt-2 border-t border-[#21262D] space-y-2">
          <span className="text-[11px] text-gray-400 font-sans block">Son Yüz Yüze Karşılaşmalar:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {recentH2H.slice(0, 4).map((h, idx) => (
              <div key={idx} className="bg-[#0D1117] p-2.5 rounded-lg border border-[#21262D] flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-[10px] text-gray-500 font-sans">{h.date} • {h.league}</div>
                  <div className="font-bold text-gray-200 truncate mt-0.5">
                    {team1.shortName} vs {team2.shortName}
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded bg-[#161B22] border border-[#30363D] text-amber-400 font-black text-sm shrink-0 font-mono">
                  {h.homeScore} - {h.awayScore}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Defensive Metrics Contrast Section */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Defansif Metrikler Kıyaslaması (Son 24 Maç)</span>
          </h4>
          <span className="text-[10px] text-gray-400 font-sans">
            Yeşil Vurgu: Üstün Olan Takım
          </span>
        </div>

        {/* Defensive Metrics List */}
        <div className="space-y-3 font-mono text-xs">
          
          {/* Metric 1: Clean Sheet % */}
          <MetricBarRow 
            label="Yenilgisiz / Gol Yemediği Maç Oranı (%)"
            val1={`${def1.cleanSheetPct}%`}
            val2={`${def2.cleanSheetPct}%`}
            raw1={def1.cleanSheetPct}
            raw2={def2.cleanSheetPct}
            higherIsBetter={true}
            team1Name={team1.name}
            team2Name={team2.name}
          />

          {/* Metric 2: Goals Conceded per Match */}
          <MetricBarRow 
            label="Maç Başı Yenen Gol Ortalaması"
            val1={`${def1.goalsConcededAvg}`}
            val2={`${def2.goalsConcededAvg}`}
            raw1={def1.goalsConcededAvg}
            raw2={def2.goalsConcededAvg}
            higherIsBetter={false}
            team1Name={team1.name}
            team2Name={team2.name}
          />

          {/* Metric 3: xGA - Expected Goals Against */}
          <MetricBarRow 
            label="Kalede Beklenen Gol (xGA) / Maç"
            val1={`${def1.xGA}`}
            val2={`${def2.xGA}`}
            raw1={def1.xGA}
            raw2={def2.xGA}
            higherIsBetter={false}
            team1Name={team1.name}
            team2Name={team2.name}
          />

          {/* Metric 4: Shots Conceded per Match */}
          <MetricBarRow 
            label="Kalede Görülen Şut Ortalaması"
            val1={`${def1.shotsConcededAvg}`}
            val2={`${def2.shotsConcededAvg}`}
            raw1={def1.shotsConcededAvg}
            raw2={def2.shotsConcededAvg}
            higherIsBetter={false}
            team1Name={team1.name}
            team2Name={team2.name}
          />

          {/* Metric 5: Tackles & Interceptions */}
          <MetricBarRow 
            label="Top Çalma & Pas Arası / Maç"
            val1={`${def1.tacklesPerMatch + def1.interceptionsPerMatch}`}
            val2={`${def2.tacklesPerMatch + def2.interceptionsPerMatch}`}
            raw1={def1.tacklesPerMatch + def1.interceptionsPerMatch}
            raw2={def2.tacklesPerMatch + def2.interceptionsPerMatch}
            higherIsBetter={true}
            team1Name={team1.name}
            team2Name={team2.name}
          />

          {/* Metric 6: Defensive Power Rating */}
          <MetricBarRow 
            label="Defansif Güç Endeksi (0 - 100 Skoru)"
            val1={`${def1.defensiveRating}`}
            val2={`${def2.defensiveRating}`}
            raw1={def1.defensiveRating}
            raw2={def2.defensiveRating}
            higherIsBetter={true}
            team1Name={team1.name}
            team2Name={team2.name}
          />

        </div>
      </div>

      {/* Missing Defensive Players & Defensive Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-sans text-xs">
        {/* Team 1 Style & Missing */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-3.5 space-y-2">
          <div className="flex items-center gap-2">
            <TeamLogo logo={team1.logo} fallback="⚽" className="w-4 h-4 shrink-0" />
            <span className="font-bold text-white">{team1.name} Savunma Yapısı</span>
          </div>
          <p className="text-gray-300">
            <strong>Stil:</strong> {def1.defensiveStyle}
          </p>
          {team1.missingPlayers && team1.missingPlayers.length > 0 ? (
            <div className="text-red-400 font-mono text-[11px] pt-1">
              ⚠️ Eksik/Sakat Defender: {team1.missingPlayers.map(p => `${p.name} (${p.reason})`).join(', ')}
            </div>
          ) : (
            <div className="text-emerald-400 text-[11px] font-mono">
              ✓ Savunma hattında önemli eksik bulunmuyor
            </div>
          )}
        </div>

        {/* Team 2 Style & Missing */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-3.5 space-y-2">
          <div className="flex items-center gap-2">
            <TeamLogo logo={team2.logo} fallback="⚽" className="w-4 h-4 shrink-0" />
            <span className="font-bold text-white">{team2.name} Savunma Yapısı</span>
          </div>
          <p className="text-gray-300">
            <strong>Stil:</strong> {def2.defensiveStyle}
          </p>
          {team2.missingPlayers && team2.missingPlayers.length > 0 ? (
            <div className="text-red-400 font-mono text-[11px] pt-1">
              ⚠️ Eksik/Sakat Defender: {team2.missingPlayers.map(p => `${p.name} (${p.reason})`).join(', ')}
            </div>
          ) : (
            <div className="text-emerald-400 text-[11px] font-mono">
              ✓ Savunma hattında önemli eksik bulunmuyor
            </div>
          )}
        </div>
      </div>

      {/* AI Comparative Summary */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 space-y-2">
        <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>Yapay Zeka Defans & Kıyas Raporu</span>
        </h4>
        <div className="bg-[#0D1117] p-3 rounded-lg border border-[#21262D] text-xs font-sans text-gray-300 space-y-1">
          <p dangerouslySetInnerHTML={{ __html: aiAnalysis.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        </div>
      </div>
    </div>
  );
};

// Subcomponent for Metric Row Comparison
interface MetricBarRowProps {
  label: string;
  val1: string;
  val2: string;
  raw1: number;
  raw2: number;
  higherIsBetter: boolean;
  team1Name: string;
  team2Name: string;
}

const MetricBarRow: React.FC<MetricBarRowProps> = ({
  label,
  val1,
  val2,
  raw1,
  raw2,
  higherIsBetter,
  team1Name,
  team2Name
}) => {
  const is1Adv = higherIsBetter ? raw1 > raw2 : raw1 < raw2;
  const is2Adv = higherIsBetter ? raw2 > raw1 : raw2 < raw1;

  const total = raw1 + raw2 || 1;
  const pct1 = Math.round((raw1 / total) * 100);
  const pct2 = Math.round((raw2 / total) * 100);

  return (
    <div className="bg-[#0D1117] p-2.5 rounded-lg border border-[#21262D] space-y-1.5">
      <div className="flex justify-between items-center text-[11px]">
        <span className={`font-bold ${is1Adv ? 'text-emerald-400' : 'text-gray-300'}`}>
          {val1} {is1Adv && '✓'}
        </span>
        <span className="text-gray-400 font-sans text-[11px] font-bold text-center truncate px-2">
          {label}
        </span>
        <span className={`font-bold ${is2Adv ? 'text-cyan-400' : 'text-gray-300'}`}>
          {is2Adv && '✓ '} {val2}
        </span>
      </div>

      {/* Dual Progress Visual */}
      <div className="w-full h-2 bg-[#161B22] rounded-full overflow-hidden flex border border-[#30363D]">
        <div 
          className={`h-full transition-all duration-500 ${is1Adv ? 'bg-emerald-500' : 'bg-gray-600'}`}
          style={{ width: `${pct1}%` }}
        />
        <div 
          className={`h-full transition-all duration-500 ${is2Adv ? 'bg-cyan-500' : 'bg-gray-600'}`}
          style={{ width: `${pct2}%` }}
        />
      </div>
    </div>
  );
};
