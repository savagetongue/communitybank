import type { Member, Offer, Booking, LedgerEntry } from '@shared/types';
import { add, sub } from 'date-fns';
const mockProviders: Member[] = [
  {
    id: 'provider-1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=alice',
    bio: 'Experienced web developer with a passion for creating beautiful and functional user interfaces.',
    rating: 4.9,
    isProvider: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'provider-2',
    name: 'Bob Williams',
    email: 'bob@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=bob',
    bio: 'Graphic designer specializing in branding and digital illustration. Let\'s make your brand stand out.',
    rating: 4.8,
    isProvider: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'provider-3',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=charlie',
    bio: 'Professional writer and editor. I can help with blog posts, marketing copy, and more.',
    rating: 5.0,
    isProvider: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'provider-4',
    name: 'Diana Prince',
    email: 'diana@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=diana',
    bio: 'Digital marketing consultant with expertise in SEO and social media strategy.',
    rating: 4.7,
    isProvider: true,
    createdAt: new Date().toISOString(),
  },
];
const mockOffers: Offer[] = [
  {
    id: 'offer-1',
    providerId: 'provider-1',
    title: 'React Component Development',
    description: 'I will build custom, reusable React components for your web application. High-quality, tested, and documented code.',
    skills: ['React', 'TypeScript', 'Frontend'],
    ratePerHour: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'offer-2',
    providerId: 'provider-2',
    title: 'Custom Logo Design',
    description: 'Get a unique and memorable logo for your business. Includes multiple concepts and revisions.',
    skills: ['Graphic Design', 'Branding', 'Illustration'],
    ratePerHour: 1.5,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'offer-3',
    providerId: 'provider-3',
    title: 'Blog Post Writing (500 words)',
    description: 'Engaging and SEO-friendly blog posts on any topic. Perfect for content marketing and driving traffic.',
    skills: ['Writing', 'Copywriting', 'SEO'],
    ratePerHour: 0.75,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'offer-4',
    providerId: 'provider-4',
    title: 'Social Media Strategy Session',
    description: 'A one-hour consultation to review your social media presence and create an actionable growth strategy.',
    skills: ['Marketing', 'Social Media', 'Strategy'],
    ratePerHour: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'offer-5',
    providerId: 'provider-1',
    title: 'Frontend Performance Audit',
    description: 'I will analyze your website\'s frontend performance and provide a detailed report with recommendations for improvement.',
    skills: ['Performance', 'Web Vitals', 'Frontend'],
    ratePerHour: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'offer-6',
    providerId: 'provider-2',
    title: 'Business Card Design',
    description: 'Professional and stylish business card design that reflects your brand identity.',
    skills: ['Graphic Design', 'Print Design'],
    ratePerHour: 0.5,
    isActive: false,
    createdAt: new Date().toISOString(),
  },
];
const mockBookings: Booking[] = [
  {
    id: 'booking-1',
    requestId: 'req-1',
    providerId: 'provider-1',
    memberId: 'user-demo',
    startTime: add(new Date(), { days: 3 }).toISOString(),
    durationMinutes: 60,
    status: 'CONFIRMED',
    escrowId: 'esc-1',
    createdAt: new Date().toISOString(),
    offerTitle: 'React Component Development',
    otherPartyName: 'Alice Johnson',
    otherPartyAvatarUrl: 'https://i.pravatar.cc/150?u=alice',
  },
  {
    id: 'booking-2',
    requestId: 'req-2',
    providerId: 'user-demo',
    memberId: 'provider-2',
    startTime: sub(new Date(), { days: 5 }).toISOString(),
    durationMinutes: 90,
    status: 'COMPLETED',
    escrowId: 'esc-2',
    createdAt: sub(new Date(), { days: 7 }).toISOString(),
    offerTitle: 'My Custom Offer',
    otherPartyName: 'Bob Williams',
    otherPartyAvatarUrl: 'https://i.pravatar.cc/150?u=bob',
  },
  {
    id: 'booking-3',
    requestId: 'req-3',
    providerId: 'provider-3',
    memberId: 'user-demo',
    startTime: sub(new Date(), { days: 10 }).toISOString(),
    durationMinutes: 45,
    status: 'COMPLETED',
    escrowId: 'esc-3',
    createdAt: sub(new Date(), { days: 12 }).toISOString(),
    offerTitle: 'Blog Post Writing (500 words)',
    otherPartyName: 'Charlie Brown',
    otherPartyAvatarUrl: 'https://i.pravatar.cc/150?u=charlie',
  },
];
const mockLedger: LedgerEntry[] = [
    {
        id: 'ledger-1',
        memberId: 'user-demo',
        amount: 10,
        txnType: 'CREDIT',
        balanceAfter: 10,
        notes: 'Initial account credit',
        createdAt: sub(new Date(), { days: 30 }).toISOString(),
    },
    {
        id: 'ledger-2',
        memberId: 'user-demo',
        amount: -0.75,
        txnType: 'DEBIT',
        balanceAfter: 9.25,
        relatedBookingId: 'booking-3',
        notes: 'For "Blog Post Writing (500 words)"',
        createdAt: sub(new Date(), { days: 10 }).toISOString(),
    },
    {
        id: 'ledger-3',
        memberId: 'user-demo',
        amount: 1.5,
        txnType: 'CREDIT',
        balanceAfter: 10.75,
        relatedBookingId: 'booking-2',
        notes: 'For "My Custom Offer"',
        createdAt: sub(new Date(), { days: 5 }).toISOString(),
    },
];
const providersMap = new Map(mockProviders.map(p => [p.id, p]));
const getOffersWithProviders = () => mockOffers.map(offer => ({
  ...offer,
  provider: providersMap.get(offer.providerId),
}));
const simulateDelay = <T>(data: T): Promise<T> =>
  new Promise(resolve => {
    setTimeout(() => resolve(data), 500);
  });
export const getOffers = (): Promise<Offer[]> => {
  return simulateDelay(getOffersWithProviders());
};
export const getFeaturedOffers = (): Promise<Offer[]> => {
  return simulateDelay(getOffersWithProviders().slice(0, 3));
};
export const getOfferById = (id: string): Promise<Offer | undefined> => {
  const offer = getOffersWithProviders().find(o => o.id === id);
  return simulateDelay(offer);
};
export const getBookingsByUserId = (userId: string): Promise<Booking[]> => {
    const bookings = mockBookings.filter(b => b.memberId === userId || b.providerId === userId);
    return simulateDelay(bookings);
};
export const getOffersByProviderId = (providerId: string): Promise<Offer[]> => {
    const offers = mockOffers.filter(o => o.providerId === providerId);
    return simulateDelay(offers);
};
export const getLedgerByUserId = (userId: string): Promise<{ entries: LedgerEntry[], balance: number }> => {
    const entries = mockLedger.filter(l => l.memberId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const balance = entries.length > 0 ? entries[0].balanceAfter : 0;
    return simulateDelay({ entries, balance });
};
// --- New "Write" Operations ---
type AddOfferData = Omit<Offer, 'id' | 'providerId' | 'isActive' | 'createdAt'>;
export const addOffer = (data: AddOfferData): Promise<{ status: 'ok' }> => {
  console.log('Simulating addOffer with data:', data);
  const newOffer: Offer = {
    ...data,
    id: `offer-${Date.now()}`,
    providerId: 'provider-1', // Hardcoded for demo
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  mockOffers.unshift(newOffer); // Add to the start of the list
  return simulateDelay({ status: 'ok' });
};
interface CreateRequestData {
  offerId: string;
  note?: string;
}
export const createRequest = (data: CreateRequestData): Promise<{ status: 'ok' }> => {
  console.log('Simulating createRequest with data:', data);
  // In a real app, you would create a ServiceRequest record here.
  return simulateDelay({ status: 'ok' });
};