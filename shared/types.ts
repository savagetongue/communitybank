export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface AuthResponse {
  member: Member;
  token?: string;
}
export interface Member {
  id: string;
  name: string;
  email: string;
  contact?: string;
  avatarUrl?: string;
  bio?: string;
  rating: number;
  isProvider: boolean;
  createdAt: string;
  passwordHash?: string;
  isAdmin?: boolean;
}
export interface Offer {
  id: string;
  providerId: string;
  title: string;
  description: string;
  skills: string[];
  ratePerHour: number; // in time credits
  isActive: boolean;
  createdAt: string;
  // Denormalized provider data
  providerName?: string;
  providerAvatarUrl?: string;
  providerRating?: number;
}
export interface ServiceRequest {
  id: string;
  offerId: string;
  memberId: string;
  note?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}
export interface Booking {
  id: string;
  requestId: string;
  providerId: string;
  memberId: string;
  startTime: string;
  durationMinutes: number;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
  escrowId: string;
  createdAt: string;
  offerTitle?: string;
  otherPartyName?: string;
  otherPartyAvatarUrl?: string;
  rated?: boolean;
}
export interface Escrow {
  id: string;
  bookingId: string;
  amount: number;
  status: 'HELD' | 'RELEASED' | 'REFUNDED';
  createdAt: string;
  updatedAt: string;
}
export interface LedgerEntry {
  id: string;
  memberId: string;
  amount: number; // Can be positive (credit) or negative (debit)
  txnType: 'CREDIT' | 'DEBIT' | 'ADJUSTMENT' | 'REFUND';
  balanceAfter: number;
  relatedBookingId?: string;
  notes?: string;
  createdAt: string;
}
export interface Rating {
  id:string;
  bookingId: string;
  raterId: string;
  ratedId: string;
  score: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  createdAt: string;
}
export interface Dispute {
  id: string;
  bookingId: string;
  reason: string;
  status: 'OPEN' | 'RESOLVED' | 'REJECTED';
  resolution?: string;
  adminId?: string;
  createdAt: string;
  evidence?: {
    evidenceType: string;
    uri: string;
  }[];
}