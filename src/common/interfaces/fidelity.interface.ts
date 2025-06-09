// interfaces/fidelity.interface.ts
export interface PointsWallet {
  id: string;
  clientId: string; // references Client.id
  businessId: string; // references Business.id
  points: number;
  lastUpdated: string;
  createdAt: string;
}

export interface PointsTransaction {
  id: string;
  walletId: string; // references PointsWallet.id
  points: number; // can be positive (earned) or negative (spent)
  type: 'EARNED' | 'SPENT' | 'ADJUSTMENT' | 'EXPIRATION';
  description: string;
  referenceId?: string; // for linking to specific actions (e.g., purchaseId, referralId)
  expiresAt?: string; // optional expiration date
  createdAt: string;
}