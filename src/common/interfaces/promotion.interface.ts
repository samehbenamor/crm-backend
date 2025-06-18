// interfaces/promotion.interface.ts
export interface Promotion {
  id: string;
  businessId: string; // references Business.id
  name: string;
  description: string;
  pointsCost: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface PromotionRedemption {
  id: string;
  promotionId: string; // references Promotion.id
  walletId: string; // references PointsWallet.id
  redeemedAt: string;
}