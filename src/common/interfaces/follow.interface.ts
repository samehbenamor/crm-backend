export interface Follow {
  id: string;
  clientId: string; // references User.id
  businessId: string; // references Business.id
  followedAt: string;
  notificationsEnabled: boolean; // opt-in for post/news notifications
}
