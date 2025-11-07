import type { Member, Offer } from '@shared/types';
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
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];
const providersMap = new Map(mockProviders.map(p => [p.id, p]));
const offersWithProviders: Offer[] = mockOffers.map(offer => ({
  ...offer,
  provider: providersMap.get(offer.providerId),
}));
const simulateDelay = <T>(data: T): Promise<T> =>
  new Promise(resolve => {
    setTimeout(() => resolve(data), 500);
  });
export const getOffers = (): Promise<Offer[]> => {
  return simulateDelay(offersWithProviders);
};
export const getFeaturedOffers = (): Promise<Offer[]> => {
  return simulateDelay(offersWithProviders.slice(0, 3));
};
export const getOfferById = (id: string): Promise<Offer | undefined> => {
  const offer = offersWithProviders.find(o => o.id === id);
  return simulateDelay(offer);
};