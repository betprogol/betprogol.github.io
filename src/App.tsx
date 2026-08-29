import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  DesktopNav 
} from './components/DesktopNav';
import { 
  MobileNav 
} from './components/MobileNav';
import { 
  FixtureList 
} from './components/FixtureList';
import { 
  MatchDetailModal 
} from './components/MatchDetailModal';
import { 
  AIPredictor 
} from './components/AIPredictor';
import { 
  BetSlipDrawer 
} from './components/BetSlipDrawer';
import { 
  MyPredictions 
} from './components/MyPredictions';
import { 
  StatsDashboard 
} from './components/StatsDashboard';
import { 
  MatchArchive 
} from './components/MatchArchive';
import { 
  NotificationCenter 
} from './components/NotificationCenter';
import { 
  ProCouponsFeed 
} from './components/ProCouponsFeed';
import { 
  AuthModal 
} from './components/AuthModal';
import { 
  UserProfileModal 
} from './components/UserProfileModal';
import { 
  BalanceDepositModal 
} from './components/BalanceDepositModal';
import { 
  LiveToastContainer 
} from './components/LiveToastContainer';
import { 
  ErrorBoundary 
} from './components/ErrorBoundary';

import { 
  Match, 
  BetSlip, 
  BetSlipSelection, 
  AppNotification, 
  SportType 
} from './types/betting';
import { 
  UserProfile, 
  UserPreferences 
} from './types/auth';

import { 
  loadSavedSlips, 
  saveSlipsToStorage, 
  loadSavedNotifications, 
  saveNotificationsToStorage, 
  loadUserBankroll, 
  saveUserBankroll 
} from './services/storageService';
import { 
  getCurrentUser, 
  saveCurrentUser, 
  getUserSpecificSlips, 
  saveUserSpecificSlips, 
  getUserSpecificBankroll, 
  saveUserSpecificBankroll, 
  updateUserPreferences 
} from './services/authService';
import { 
  fetchLiveMatchesFromWeb 
} from './services/liveFootballService';
import { 
  notificationService 
} from './services/notificationService';
import { 
  evaluateAllSlips, 
  simulateMatchStep 
} from './utils/betEvaluator';
import { 
  MOCK_FIXTURES 
} from './data/mockData';
import {
  normalizeMatchTiming
} from './utils/dateUtils';

export default function App() {
  // 1. Core State
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => getCurrentUser());
  const [activeTab, setActiveTab] = useState<string>('fixtures');
  const [selectedSport, setSelectedSport] = useState<SportType | 'ALL'>('ALL');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);

  // 2. Betting & Bankroll State
  const [bankroll, setBankroll] = useState<number>(() => {
    const user = getCurrentUser();
    return getUserSpecificBankroll(user.id);
  });
  const [userSlips, setUserSlips] = useState<BetSlip[]>(() => {
    const user = getCurrentUser();
    return getUserSpecificSlips(user.id);
  });
  const [activeSelections, setActiveSelections] = useState<BetSlipSelection[]>([]);

  // 3. Live Matches & Fixtures State (Always normalized to current TSİ time)
  const [matches, setMatches] = useState<Match[]>(() => MOCK_FIXTURES.map(normalizeMatchTiming));

  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // 4. Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>(() => loadSavedNotifications());

  // 5. Modal Controllers
  const [selectedMatchForDetail, setSelectedMatchForDetail] = useState<Match | null>(null);
  const [aiTargetMatch, setAiTargetMatch] = useState<Match | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState<boolean>(false);

  // Keep references for background loops
  const userSlipsRef = useRef(userSlips);
  userSlipsRef.current = userSlips;

  const matchesRef = useRef(matches);
  matchesRef.current = matches;

  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;

  // Persist bankroll when changed
  useEffect(() => {
    saveUserSpecificBankroll(currentUser.id, bankroll);
  }, [bankroll, currentUser.id]);

  const handleDepositBankroll = (amount: number) => {
    setBankroll(prev => {
      const nextBankroll = prev + amount;
      saveUserSpecificBankroll(currentUser.id, nextBankroll);
      return nextBankroll;
    });
    setCurrentUser(prev => ({
      ...prev,
      bankroll: prev.bankroll + amount
    }));
  };

  const handleResetBankroll = () => {
    const resetAmount = 1000;
    setBankroll(resetAmount);
    saveUserSpecificBankroll(currentUser.id, resetAmount);
    setCurrentUser(prev => ({
      ...prev,
      bankroll: resetAmount
    }));
  };

  // Persist slips when changed
  useEffect(() => {
    saveUserSpecificSlips(currentUser.id, userSlips);
  }, [userSlips, currentUser.id]);

  // Persist notifications when changed
  useEffect(() => {
    saveNotificationsToStorage(notifications);
  }, [notifications]);

  // Load real-time matches on start with forceRefresh option
  const syncLiveMatches = useCallback(async (forceRefresh = false) => {
    setIsSyncing(true);
    try {
      const res = await fetchLiveMatchesFromWeb('all', 'today', undefined, 'ALL', selectedSport, undefined, forceRefresh);
      if (res.matches && res.matches.length > 0) {
        setMatches(prevMatches => {
          const prevMap = new Map<string, Match>(prevMatches.map(m => [m.id, m]));
          return res.matches.map(newMatch => {
            const existing = prevMap.get(newMatch.id);
            const normalized = normalizeMatchTiming(newMatch);
            if (existing && existing.status === 'LIVE' && normalized.status === 'LIVE') {
              return {
                ...normalized,
                homeScore: existing.homeScore ?? normalized.homeScore ?? 0,
                awayScore: existing.awayScore ?? normalized.awayScore ?? 0,
                minute: existing.minute ?? normalized.minute ?? 1,
                odds: existing.odds || normalized.odds
              };
            }
            return normalized;
          });
        });
      }
    } catch (e) {
      console.warn('Sync live matches fallback:', e);
    } finally {
      setIsSyncing(false);
    }
  }, [selectedSport]);

  useEffect(() => {
    syncLiveMatches();
    // Background polling every 45s for fresh fixtures
    const interval = setInterval(syncLiveMatches, 45000);
    return () => clearInterval(interval);
  }, [syncLiveMatches]);

  // Live match simulation & coupon settlement loop (every 7 seconds)
  useEffect(() => {
    const simInterval = setInterval(() => {
      const currentMatches = matchesRef.current;
      let hasChanges = false;
      const goalsToNotify: Array<{
        homeTeam: string;
        awayTeam: string;
        scoringTeam: string;
        minute: number;
        scoreStr: string;
      }> = [];

      // Step 1: Normalize any match whose kickoff time has arrived, then simulate live minute and potential goals & odds
      const normalizedList = currentMatches.map(m => {
        const norm = normalizeMatchTiming(m);
        if (norm.status !== m.status || norm.minute !== m.minute) {
          hasChanges = true;
        }
        return norm;
      });

      const updatedMatches = normalizedList.map(m => {
        const sim = simulateMatchStep(m);
        const oddsChanged = JSON.stringify(sim.odds) !== JSON.stringify(m.odds);
        const scoreChanged = sim.homeScore !== m.homeScore || sim.awayScore !== m.awayScore;
        const minChanged = sim.minute !== m.minute;
        const statusChanged = sim.status !== m.status;

        if (minChanged || scoreChanged || oddsChanged || statusChanged) {
          hasChanges = true;

          // If a goal was scored in a LIVE match, record for notification outside state updater
          if (scoreChanged && (m.status === 'LIVE' || sim.status === 'LIVE')) {
            const isMatchInUserSlip = userSlipsRef.current.some(slip =>
              slip.status === 'PENDING' && slip.selections.some(s => s.matchId === m.id)
            );

            const prefs = currentUserRef.current.preferences;
            const shouldNotify = !prefs.notifyOnlyMySlipMatches || isMatchInUserSlip;

            if (shouldNotify && prefs.notifyGoals) {
              if ((sim.homeScore ?? 0) > (m.homeScore ?? 0)) {
                goalsToNotify.push({
                  homeTeam: sim.homeTeam.name,
                  awayTeam: sim.awayTeam.name,
                  scoringTeam: sim.homeTeam.name,
                  minute: sim.minute || 45,
                  scoreStr: `${sim.homeScore} - ${sim.awayScore}`
                });
              } else if ((sim.awayScore ?? 0) > (m.awayScore ?? 0)) {
                goalsToNotify.push({
                  homeTeam: sim.homeTeam.name,
                  awayTeam: sim.awayTeam.name,
                  scoringTeam: sim.awayTeam.name,
                  minute: sim.minute || 45,
                  scoreStr: `${sim.homeScore} - ${sim.awayScore}`
                });
              }
            }
          }

          return sim;
        }
        return m;
      });

      if (hasChanges) {
        setMatches(updatedMatches);
        matchesRef.current = updatedMatches;

        if (goalsToNotify.length > 0) {
          const soundEnabled = currentUserRef.current.preferences.soundEnabled;
          goalsToNotify.forEach(g => {
            notificationService.notifyGoal(
              g.homeTeam,
              g.awayTeam,
              g.scoringTeam,
              g.minute,
              g.scoreStr,
              soundEnabled
            );
          });
          setNotifications(loadSavedNotifications());
        }
      }

      // Step 2: Evaluate User Coupon Slips with the latest match states
      const activeMatches = hasChanges ? updatedMatches : currentMatches;
      const { updatedSlips, newlySettledSlips, totalPayoutWon } = evaluateAllSlips(
        userSlipsRef.current,
        activeMatches
      );

      if (newlySettledSlips.length > 0) {
        setUserSlips(updatedSlips);

        if (totalPayoutWon > 0) {
          setBankroll(prev => prev + totalPayoutWon);
        }

        // Notify user for settled slips
        newlySettledSlips.forEach(slip => {
          if (slip.status === 'WON') {
            notificationService.notifySlipWon(
              slip.id,
              slip.potentialPayout,
              slip.totalOdds,
              currentUserRef.current.preferences.soundEnabled
            );
          } else if (slip.status === 'LOST') {
            notificationService.notifySlipLost(slip.id);
          }
        });

        // Sync notifications list
        setNotifications(loadSavedNotifications());
      }
    }, 7000);

    return () => clearInterval(simInterval);
  }, []);

  // Handlers for Selections & Bet Slips
  const handleAddSelection = (selection: BetSlipSelection) => {
    setActiveSelections(prev => {
      // If already added, remove it (toggle behavior)
      const existing = prev.find(s => s.matchId === selection.matchId && s.market === selection.market);
      if (existing) {
        return prev.filter(s => !(s.matchId === selection.matchId && s.market === selection.market));
      }
      // If different market for same match, replace it
      const filtered = prev.filter(s => s.matchId !== selection.matchId);
      return [...filtered, selection];
    });
  };

  const handleAddMultipleSelections = (selections: BetSlipSelection[]) => {
    setActiveSelections(prev => {
      const matchIds = new Set(selections.map(s => s.matchId));
      const remaining = prev.filter(s => !matchIds.has(s.matchId));
      return [...remaining, ...selections];
    });
  };

  const handleRemoveSelection = (matchId: string, market: string) => {
    setActiveSelections(prev => prev.filter(s => !(s.matchId === matchId && s.market === market)));
  };

  const handleClearSlip = () => {
    setActiveSelections([]);
  };

  const handleDeleteSlip = (slipId: string) => {
    setUserSlips(prev => prev.filter(s => s.id !== slipId));
  };

  const handlePlaceBet = (stake: number): { success: boolean; message: string } => {
    if (activeSelections.length === 0) {
      return { success: false, message: 'Kuponunuzda maç bulunmuyor.' };
    }
    if (stake > bankroll) {
      return { success: false, message: 'Kasa bakiyeniz yetersiz.' };
    }

    const totalOdds = Number(
      activeSelections.reduce((acc, curr) => acc * (curr.odds || 1), 1).toFixed(2)
    );
    const potentialPayout = Number((stake * totalOdds).toFixed(2));

    const newSlip: BetSlip = {
      id: `slip-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      createdAt: new Date().toISOString(),
      type: activeSelections.length === 1 ? 'SINGLE' : 'COMBINED',
      totalOdds,
      stake,
      potentialPayout,
      status: 'PENDING',
      selections: [...activeSelections]
    };

    // Deduct stake from bankroll
    setBankroll(prev => prev - stake);
    setUserSlips(prev => [newSlip, ...prev]);
    setActiveSelections([]);

    // Trigger notification
    notificationService.addNotification({
      title: '🎯 KUPONUNUZ OYNANDI & RADARA EKLENDİ',
      message: `${newSlip.selections.length} maçlık kuponunuz onaylandı. Yatırılan: ₺${stake} | Oran: ${totalOdds} | Olası Kazanç: ₺${potentialPayout}`,
      type: 'SYSTEM'
    });
    setNotifications(loadSavedNotifications());

    return {
      success: true,
      message: `Tebrikler! ${newSlip.selections.length} maçlık kuponunuz başarıyla oynandı.`
    };
  };

  // Open AI tab with specific match
  const handleOpenAIForMatch = (match: Match) => {
    setAiTargetMatch(match);
    setActiveTab('ai');
  };

  // Switch user profile callback
  const handleUserUpdated = (updated: UserProfile) => {
    setCurrentUser(updated);
    setBankroll(getUserSpecificBankroll(updated.id));
    setUserSlips(getUserSpecificSlips(updated.id));
  };

  const unreadNotifsCount = notifications.filter(n => !n.read).length;
  const liveMatchesCount = matches.filter(m => m.status === 'LIVE').length;

  return (
    <ErrorBoundary>
      <div className={`min-h-screen ${darkMode ? 'bg-[#0D1117] text-[#E0E0E0]' : 'bg-gray-100 text-gray-900'} flex flex-col font-sans transition-colors w-full max-w-full overflow-x-hidden`}>
        
        {/* Frame Wrapper for Mobile vs Fullscreen mode */}
        <div className={`flex-1 flex flex-col w-full max-w-full overflow-x-hidden ${isMobileFrame ? 'max-w-md mx-auto my-4 rounded-3xl overflow-hidden border-4 border-[#30363D] shadow-2xl bg-[#0D1117]' : ''}`}>
          
          {/* Header */}
          <Header
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            isMobileFrame={isMobileFrame}
            setIsMobileFrame={setIsMobileFrame}
            bankroll={bankroll}
            setBankroll={handleDepositBankroll}
            notifications={notifications}
            unreadNotifsCount={unreadNotifsCount}
            setActiveTab={setActiveTab}
            onOpenQuickAI={() => setActiveTab('ai')}
            liveMatchesCount={liveMatchesCount}
            matches={matches}
            currentUser={currentUser}
            onOpenProfileModal={() => setIsProfileModalOpen(true)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onOpenDepositModal={() => setIsDepositModalOpen(true)}
          />

          {/* Desktop Navigation */}
          <DesktopNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            slipCount={userSlips.filter(s => s.status === 'PENDING').length}
            unreadNotifsCount={unreadNotifsCount}
            liveCount={liveMatchesCount}
            currentUser={currentUser}
            onOpenProfileModal={() => setIsProfileModalOpen(true)}
          />

          {/* Main Application Workspace */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 pb-24 md:pb-8">
            {activeTab === 'fixtures' && (
              <FixtureList
                matches={matches}
                onSelectMatch={m => setSelectedMatchForDetail(m)}
                onAddSelection={handleAddSelection}
                activeSelections={activeSelections}
                onOpenAIForMatch={handleOpenAIForMatch}
                selectedSport={selectedSport}
                setSelectedSport={setSelectedSport}
                onManualRefresh={() => syncLiveMatches(true)}
                isSyncing={isSyncing}
              />
            )}

            {activeTab === 'ai' && (
              <AIPredictor
                matches={matches}
                initialMatch={aiTargetMatch}
                onAddSelection={handleAddSelection}
                activeSelections={activeSelections}
              />
            )}

            {activeTab === 'predictions' && (
              <MyPredictions
                slips={userSlips}
                onClearAllSlips={() => setUserSlips([])}
                onDeleteSlip={handleDeleteSlip}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'pro-coupons' && (
              <ProCouponsFeed
                onAddMultipleSelections={handleAddMultipleSelections}
                activeSelections={activeSelections}
                matches={matches}
              />
            )}

            {activeTab === 'stats' && (
              <StatsDashboard
                slips={userSlips}
                bankroll={bankroll}
                currentUser={currentUser}
                matches={matches}
                onOpenDepositModal={() => setIsDepositModalOpen(true)}
              />
            )}

            {activeTab === 'archive' && (
              <MatchArchive
                onSelectMatch={m => setSelectedMatchForDetail(m)}
              />
            )}

            {activeTab === 'notifications' && (
              <NotificationCenter
                notifications={notifications}
                onMarkAllAsRead={() => {
                  notificationService.markAllAsRead();
                  setNotifications(loadSavedNotifications());
                }}
                onClearAll={() => {
                  notificationService.clearAll();
                  setNotifications([]);
                }}
                preferences={currentUser.preferences}
                onUpdatePreferences={prefs => {
                  const updated = updateUserPreferences(currentUser.id, prefs);
                  setCurrentUser(updated);
                }}
              />
            )}
          </main>

          {/* Mobile Bottom Navigation */}
          <MobileNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            slipCount={userSlips.filter(s => s.status === 'PENDING').length}
            unreadNotifsCount={unreadNotifsCount}
            currentUser={currentUser}
            onOpenProfileModal={() => setIsProfileModalOpen(true)}
          />

          {/* Persistent Bet Slip Bottom Drawer */}
          <BetSlipDrawer
            selections={activeSelections}
            onRemoveSelection={handleRemoveSelection}
            onClearSlip={handleClearSlip}
            onPlaceBet={handlePlaceBet}
            bankroll={bankroll}
            onOpenDepositModal={() => setIsDepositModalOpen(true)}
          />

          {/* Balance Deposit Modal */}
          <BalanceDepositModal
            isOpen={isDepositModalOpen}
            onClose={() => setIsDepositModalOpen(false)}
            currentBankroll={bankroll}
            onDeposit={handleDepositBankroll}
            onReset={handleResetBankroll}
          />

          {/* Match Detail Modal */}
          {selectedMatchForDetail && (
            <MatchDetailModal
              match={selectedMatchForDetail}
              onClose={() => setSelectedMatchForDetail(null)}
              onAddSelection={handleAddSelection}
              activeSelections={activeSelections}
              onOpenAI={m => {
                setSelectedMatchForDetail(null);
                handleOpenAIForMatch(m);
              }}
            />
          )}

          {/* Auth & Login Modal */}
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onSuccess={handleUserUpdated}
          />

          {/* User Profile & Radar Settings Modal */}
          <UserProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            currentUser={currentUser}
            onUserUpdated={handleUserUpdated}
            onSwitchAccountRequested={() => {
              setIsProfileModalOpen(false);
              setIsAuthModalOpen(true);
            }}
            onOpenDepositModal={() => setIsDepositModalOpen(true)}
          />

          {/* Live Floating Screen Goal & Notification Banner */}
          <LiveToastContainer
            onSelectNotification={notif => {
              if (notif.matchId) {
                const target = matches.find(m => m.id === notif.matchId);
                if (target) setSelectedMatchForDetail(target);
              }
            }}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}
