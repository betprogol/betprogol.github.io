import { UserProfile, UserAccount, UserPreferences } from '../types/auth';
import { BetSlip, AppNotification } from '../types/betting';
import { INITIAL_USER_SLIPS } from '../data/mockData';
import { normalizeSlipData } from './storageService';

const AUTH_CURRENT_USER_KEY = 'betpro_auth_current_user_v1';
const AUTH_ACCOUNTS_KEY = 'betpro_auth_accounts_v1';

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  notifyOnlyMySlipMatches: true, // Default to true as requested: only notify for coupon matches!
  soundEnabled: true,
  pushEnabled: false,
  notifyGoals: true,
  notifyRedCards: true,
  notifyOddsDrops: true,
  notifySlipResults: true,
  darkMode: true,
  autoSyncInterval: 30
};

// Seed demo accounts
export const DEMO_ACCOUNTS: UserAccount[] = [
  {
    id: 'usr_pro_vip_1',
    username: 'pro_analist_34',
    email: 'analist@betprogol.com',
    fullName: 'Ahmet Yılmaz (VIP Tipster)',
    avatar: '👑',
    tier: 'VIP',
    tierLabel: '👑 VIP ANALİST',
    memberSince: '12.01.2024',
    bankroll: 7500,
    totalWinnings: 14250,
    totalBetsPlaced: 48,
    favoriteTeams: ['Galatasaray', 'Real Madrid', 'Liverpool'],
    favoriteLeagues: ['tr-superlig', 'uefa-cl', 'eng-premier'],
    preferences: {
      ...DEFAULT_USER_PREFERENCES,
      notifyOnlyMySlipMatches: true
    },
    savedSlips: normalizeSlipData(INITIAL_USER_SLIPS),
    savedNotifications: []
  },
  {
    id: 'usr_banko_uzman_2',
    username: 'can_demir',
    email: 'can.demir@gmail.com',
    fullName: 'Can Demir (PRO Üye)',
    avatar: '⚡',
    tier: 'PRO',
    tierLabel: '⭐ PRO ÜYE',
    memberSince: '04.03.2024',
    bankroll: 3800,
    totalWinnings: 6200,
    totalBetsPlaced: 22,
    favoriteTeams: ['Fenerbahçe', 'Arsenal', 'Bayern Münih'],
    favoriteLeagues: ['tr-superlig', 'eng-premier', 'ger-bundesliga'],
    preferences: {
      ...DEFAULT_USER_PREFERENCES,
      notifyOnlyMySlipMatches: true
    },
    savedSlips: [
      {
        id: 'slip-demo-can-1',
        createdAt: new Date().toISOString(),
        type: 'COMBINED',
        totalOdds: 2.85,
        stake: 250,
        potentialPayout: 712.5,
        status: 'PENDING',
        selections: [
          {
            matchId: 'tr-sl-ts-basak',
            homeTeam: 'Trabzonspor',
            awayTeam: 'Başakşehir',
            matchDate: new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' }),
            matchTime: '20:00',
            leagueName: 'Trendyol Süper Lig',
            leagueLogo: '🇹🇷',
            market: 'OVER_25',
            marketLabel: '2.5 Üst',
            odds: 1.75,
            status: 'PENDING'
          },
          {
            matchId: 'tr-sl-eyup-gfk',
            homeTeam: 'Eyüpspor',
            awayTeam: 'Gaziantep FK',
            matchDate: new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' }),
            matchTime: '19:00',
            leagueName: 'Trendyol Süper Lig',
            leagueLogo: '🇹🇷',
            market: 'BTTS_YES',
            marketLabel: 'KG Var',
            odds: 1.63,
            status: 'PENDING'
          }
        ]
      }
    ],
    savedNotifications: []
  }
];

export const GUEST_USER: UserProfile = {
  id: 'guest_user',
  username: 'misafir_kullanici',
  email: 'misafir@betprogol.com',
  fullName: 'Misafir Kullanıcı',
  avatar: '👤',
  tier: 'FREE',
  tierLabel: 'Standart Üye',
  memberSince: 'Bugün',
  bankroll: 2500,
  totalWinnings: 0,
  totalBetsPlaced: 0,
  favoriteTeams: ['Galatasaray', 'Fenerbahçe'],
  favoriteLeagues: ['tr-superlig'],
  preferences: DEFAULT_USER_PREFERENCES
};

/**
 * Load accounts database from storage
 */
export function getAllAccounts(): UserAccount[] {
  try {
    const raw = localStorage.getItem(AUTH_ACCOUNTS_KEY);
    if (!raw) {
      localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(DEMO_ACCOUNTS));
      return DEMO_ACCOUNTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEMO_ACCOUNTS;
  } catch {
    return DEMO_ACCOUNTS;
  }
}

/**
 * Save accounts database
 */
export function saveAllAccounts(accounts: UserAccount[]) {
  try {
    localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Save accounts error:', e);
  }
}

/**
 * Get current authenticated user profile
 */
export function getCurrentUser(): UserProfile {
  try {
    const raw = localStorage.getItem(AUTH_CURRENT_USER_KEY);
    if (!raw) {
      // Default to the first demo account so the user is immediately greeted with an active profile
      const defaultUser = DEMO_ACCOUNTS[0];
      const profile: UserProfile = {
        id: defaultUser.id,
        username: defaultUser.username,
        email: defaultUser.email,
        fullName: defaultUser.fullName,
        avatar: defaultUser.avatar,
        tier: defaultUser.tier,
        tierLabel: defaultUser.tierLabel,
        memberSince: defaultUser.memberSince,
        bankroll: defaultUser.bankroll,
        totalWinnings: defaultUser.totalWinnings,
        totalBetsPlaced: defaultUser.totalBetsPlaced,
        favoriteTeams: defaultUser.favoriteTeams,
        favoriteLeagues: defaultUser.favoriteLeagues,
        preferences: defaultUser.preferences
      };
      localStorage.setItem(AUTH_CURRENT_USER_KEY, JSON.stringify(profile));
      return profile;
    }
    const parsed = JSON.parse(raw);
    const defaultUser = DEMO_ACCOUNTS[0];
    return {
      ...defaultUser,
      ...parsed,
      bankroll: typeof parsed.bankroll === 'number' ? parsed.bankroll : 4250,
      totalWinnings: typeof parsed.totalWinnings === 'number' ? parsed.totalWinnings : 0,
      totalBetsPlaced: typeof parsed.totalBetsPlaced === 'number' ? parsed.totalBetsPlaced : 0,
      favoriteTeams: Array.isArray(parsed.favoriteTeams) ? parsed.favoriteTeams : ['Galatasaray', 'Real Madrid'],
      favoriteLeagues: Array.isArray(parsed.favoriteLeagues) ? parsed.favoriteLeagues : ['tr-superlig', 'eng-premier', 'uefa-cl'],
      preferences: {
        ...DEFAULT_USER_PREFERENCES,
        ...(parsed.preferences || {})
      }
    };
  } catch {
    return DEMO_ACCOUNTS[0];
  }
}

/**
 * Save active user session
 */
export function saveCurrentUser(user: UserProfile) {
  try {
    localStorage.setItem(AUTH_CURRENT_USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Save current user error:', e);
  }
}

/**
 * Register a new member
 */
export function registerUser(
  username: string,
  email: string,
  fullName: string,
  initialBankroll: number = 2500,
  tier: 'FREE' | 'PRO' | 'VIP' = 'PRO'
): { success: boolean; message: string; user?: UserProfile } {
  const accounts = getAllAccounts();
  const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '_');
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanUsername || cleanUsername.length < 3) {
    return { success: false, message: 'Kullanıcı adı en az 3 karakter olmalıdır.' };
  }
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, message: 'Geçerli bir e-posta adresi giriniz.' };
  }

  const existing = accounts.find(
    a => a.username.toLowerCase() === cleanUsername || a.email.toLowerCase() === cleanEmail
  );
  if (existing) {
    return { success: false, message: 'Bu kullanıcı adı veya e-posta ile zaten kayıtlı bir üyelik mevcut.' };
  }

  const avatars = ['👑', '⭐', '🦁', '🦅', '🎯', '🔥', '💎', '🚀', '🏆', '🎩'];
  const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;

  const newAccount: UserAccount = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    username: cleanUsername,
    email: cleanEmail,
    fullName: fullName.trim() || cleanUsername,
    avatar: randomAvatar,
    tier: tier,
    tierLabel: tier === 'VIP' ? '👑 VIP ANALİST' : (tier === 'PRO' ? '⭐ PRO ÜYE' : 'Standart Üye'),
    memberSince: dateStr,
    bankroll: initialBankroll,
    totalWinnings: 0,
    totalBetsPlaced: 0,
    favoriteTeams: ['Galatasaray', 'Real Madrid'],
    favoriteLeagues: ['tr-superlig', 'uefa-cl'],
    preferences: {
      ...DEFAULT_USER_PREFERENCES,
      notifyOnlyMySlipMatches: true
    },
    savedSlips: [],
    savedNotifications: [
      {
        id: `notif-welcome-${Date.now()}`,
        title: `🎉 BETPROGOL'E HOŞ GELDİNİZ, ${fullName.toUpperCase() || cleanUsername.toUpperCase()}!`,
        message: `Üyeliğiniz başarıyla açıldı. ₺${initialBankroll.toLocaleString('tr-TR')} başlangıç bakiyeniz tanımlandı. Kupon bildirimleri aktif.`,
        type: 'SYSTEM',
        timestamp: 'Az önce',
        read: false
      }
    ]
  };

  accounts.push(newAccount);
  saveAllAccounts(accounts);

  const profile: UserProfile = {
    id: newAccount.id,
    username: newAccount.username,
    email: newAccount.email,
    fullName: newAccount.fullName,
    avatar: newAccount.avatar,
    tier: newAccount.tier,
    tierLabel: newAccount.tierLabel,
    memberSince: newAccount.memberSince,
    bankroll: newAccount.bankroll,
    totalWinnings: newAccount.totalWinnings,
    totalBetsPlaced: newAccount.totalBetsPlaced,
    favoriteTeams: newAccount.favoriteTeams,
    favoriteLeagues: newAccount.favoriteLeagues,
    preferences: newAccount.preferences
  };

  saveCurrentUser(profile);
  return { success: true, message: 'Üyeliğiniz başarıyla oluşturuldu!', user: profile };
}

/**
 * Login member
 */
export function loginUser(
  usernameOrEmail: string
): { success: boolean; message: string; user?: UserProfile } {
  const accounts = getAllAccounts();
  const query = usernameOrEmail.trim().toLowerCase();

  const account = accounts.find(
    a => a.username.toLowerCase() === query || a.email.toLowerCase() === query
  );

  if (!account) {
    return { success: false, message: 'Kullanıcı adı veya e-posta bulunamadı.' };
  }

  const profile: UserProfile = {
    id: account.id,
    username: account.username,
    email: account.email,
    fullName: account.fullName,
    avatar: account.avatar,
    tier: account.tier,
    tierLabel: account.tierLabel,
    memberSince: account.memberSince,
    bankroll: account.bankroll,
    totalWinnings: account.totalWinnings,
    totalBetsPlaced: account.totalBetsPlaced,
    favoriteTeams: account.favoriteTeams,
    favoriteLeagues: account.favoriteLeagues,
    preferences: account.preferences || DEFAULT_USER_PREFERENCES
  };

  saveCurrentUser(profile);
  return { success: true, message: `Hoş geldiniz, ${profile.fullName}!`, user: profile };
}

/**
 * Get user specific saved slips
 */
export function getUserSpecificSlips(userId: string): BetSlip[] {
  const accounts = getAllAccounts();
  const acc = accounts.find(a => a.id === userId);
  if (acc && Array.isArray(acc.savedSlips)) {
    return normalizeSlipData(acc.savedSlips);
  }
  return [];
}

/**
 * Save user specific slips
 */
export function saveUserSpecificSlips(userId: string, slips: BetSlip[]) {
  const accounts = getAllAccounts();
  const acc = accounts.find(a => a.id === userId);
  if (acc) {
    acc.savedSlips = slips;
    acc.totalBetsPlaced = slips.length;
    saveAllAccounts(accounts);
  }
}

/**
 * Save user specific bankroll
 */
export function saveUserSpecificBankroll(userId: string, bankroll: number) {
  const accounts = getAllAccounts();
  const acc = accounts.find(a => a.id === userId);
  if (acc) {
    acc.bankroll = bankroll;
    saveAllAccounts(accounts);
  }
  const current = getCurrentUser();
  if (current.id === userId) {
    current.bankroll = bankroll;
    saveCurrentUser(current);
  }
}

/**
 * Get user specific bankroll
 */
export function getUserSpecificBankroll(userId: string): number {
  const accounts = getAllAccounts();
  const acc = accounts.find(a => a.id === userId);
  if (acc && typeof acc.bankroll === 'number') {
    return acc.bankroll;
  }
  return 2500;
}

/**
 * Switch active user account
 */
export function switchUserAccount(userId: string): UserProfile | null {
  const accounts = getAllAccounts();
  const acc = accounts.find(a => a.id === userId);
  if (!acc) return null;

  const profile: UserProfile = {
    id: acc.id,
    username: acc.username,
    email: acc.email,
    fullName: acc.fullName,
    avatar: acc.avatar,
    tier: acc.tier,
    tierLabel: acc.tierLabel,
    memberSince: acc.memberSince,
    bankroll: acc.bankroll,
    totalWinnings: acc.totalWinnings,
    totalBetsPlaced: acc.totalBetsPlaced,
    favoriteTeams: acc.favoriteTeams,
    favoriteLeagues: acc.favoriteLeagues,
    preferences: acc.preferences || DEFAULT_USER_PREFERENCES
  };

  saveCurrentUser(profile);
  return profile;
}

/**
 * Logout current user (resets to Guest or first account)
 */
export function logoutUser(): UserProfile {
  saveCurrentUser(GUEST_USER);
  return GUEST_USER;
}

/**
 * Update user preferences
 */
export function updateUserPreferences(userId: string, prefs: Partial<UserPreferences>): UserProfile {
  const accounts = getAllAccounts();
  const acc = accounts.find(a => a.id === userId);
  if (acc) {
    acc.preferences = { ...acc.preferences, ...prefs };
    saveAllAccounts(accounts);
  }
  const current = getCurrentUser();
  const updated: UserProfile = {
    ...current,
    preferences: {
      ...current.preferences,
      ...prefs
    }
  };
  saveCurrentUser(updated);
  return updated;
}
