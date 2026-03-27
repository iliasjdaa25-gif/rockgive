export interface RockstarAccount {
  id: string;
  email: string;
  password?: string; // Only visible if won
  isClaimed: boolean;
  claimedBy?: string;
  wonAt?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  attempts: number;
  role?: 'admin' | 'user';
  wonAccounts?: RockstarAccount[];
  rechargeHistory?: RechargeCode[];
}

export interface RechargeCode {
  id: string;
  code: string;
  userId: string;
  status: 'pending' | 'used' | 'invalid';
  timestamp: string;
}
