// interfaces/referral.interface.ts
import { Business } from './business.interface';
import { Client } from './client.interface';

export interface Referral {
  id: string;
  referrerId: string;
  refereeId: string | null;
  businessId: string;
  referralCode: string;
  isCompleted: boolean;
  createdAt: Date;
  completedAt: Date | null;
}

export interface ReferralWithBusinessAndReferee extends Referral {
  business: {
    id: string;
    name: string;
    logoUrl: string | null;
  };
  referee?: {
    id: string;
    displayName: string;
  };
}

export interface ReferralWithBusinessAndReferrer extends Referral {
  business: Business;
  referrer: {
    id: string;
    displayName: string;
  };
}