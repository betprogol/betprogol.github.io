import { BetSlip, AppNotification } from './betting';

export type UserTier = 'FREE' | 'PRO' | 'VIP';

export interface UserPreferences {
  notifyOnlyMySlipMatches: boolean;
  soundEnabled: boolean;
  pushEnabled: boolean;
  notifyGoals: boolean;
  notifyRedCards: boolean;
  notifyOddsDrops: boolean;
  notifySlipResults: boolean;
  darkMode: boolean;
  autoSyncInterval: number;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar: string;
  tier: UserTier;
  tierLabel: string;
  memberSince: string;
  bankroll: number;
  totalWinnings: number;
  totalBetsPlaced: number;
  favoriteTeams: string[];
  favoriteLeagues: string[];
  preferences: UserPreferences;
}

export interface UserAccount extends UserProfile {
  passwordHash?: string;
  savedSlips: BetSlip[];
  savedNotifications: AppNotification[];
}
