import { IndexedEntity } from "./core-utils";
import type { Member, Offer, Booking, LedgerEntry, ServiceRequest, Rating, Dispute } from "@shared/types";
export class MemberEntity extends IndexedEntity<Member> {
  static readonly entityName = "member";
  static readonly indexName = "members";
  static readonly initialState: Member = {
    id: "",
    name: "",
    email: "",
    rating: 0,
    isProvider: false,
    createdAt: "",
    passwordHash: "",
    isAdmin: false,
  };
  static readonly seedData: ReadonlyArray<Member> = [
    {
      id: 'provider-1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      avatarUrl: 'https://i.pravatar.cc/150?u=alice',
      bio: 'Experienced web developer with a passion for creating beautiful and functional user interfaces.',
      rating: 4.9,
      isProvider: true,
      createdAt: new Date().toISOString(),
      passwordHash: 'hashed_password_placeholder',
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
      passwordHash: 'hashed_password_placeholder',
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
      passwordHash: 'hashed_password_placeholder',
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
      passwordHash: 'hashed_password_placeholder',
    },
    {
        id: 'user-demo',
        name: 'Demo User',
        email: 'demo@example.com',
        avatarUrl: 'https://i.pravatar.cc/150?u=demo',
        bio: 'I am here to test the platform!',
        rating: 5.0,
        isProvider: false,
        createdAt: new Date().toISOString(),
        passwordHash: 'hashed_password_placeholder',
    },
    {
        id: 'admin-user',
        name: 'Admin User',
        email: 'admin@chronobank.com',
        avatarUrl: 'https://i.pravatar.cc/150?u=admin',
        bio: 'Platform Administrator.',
        rating: 5.0,
        isProvider: false,
        isAdmin: true,
        createdAt: new Date().toISOString(),
        passwordHash: 'hashed_password_placeholder', // In a real app, use a strong hash for a pre-set password
    }
  ];
}
export class OfferEntity extends IndexedEntity<Offer> {
    static readonly entityName = "offer";
    static readonly indexName = "offers";
    static readonly initialState: Offer = {
        id: "",
        providerId: "",
        title: "",
        description: "",
        skills: [],
        ratePerHour: 0,
        isActive: false,
        createdAt: "",
    };
    static readonly seedData: ReadonlyArray<Offer> = [
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
}
export class BookingEntity extends IndexedEntity<Booking> {
    static readonly entityName = "booking";
    static readonly indexName = "bookings";
    static readonly initialState: Booking = {
        id: "",
        requestId: "",
        providerId: "",
        memberId: "",
        startTime: "",
        durationMinutes: 0,
        status: 'PENDING',
        escrowId: "",
        createdAt: "",
        rated: false,
    };
}
export class LedgerEntryEntity extends IndexedEntity<LedgerEntry> {
    static readonly entityName = "ledgerEntry";
    static readonly indexName = "ledgerEntries";
    static readonly initialState: LedgerEntry = {
        id: "",
        memberId: "",
        amount: 0,
        txnType: 'ADJUSTMENT',
        balanceAfter: 0,
        createdAt: "",
    };
    static readonly seedData: ReadonlyArray<LedgerEntry> = [
        {
            id: 'ledger-seed-1',
            memberId: 'user-demo',
            amount: 10,
            txnType: 'CREDIT',
            balanceAfter: 10,
            notes: 'Initial account credit for demo purposes.',
            createdAt: new Date().toISOString(),
        }
    ];
}
export class ServiceRequestEntity extends IndexedEntity<ServiceRequest> {
    static readonly entityName = "serviceRequest";
    static readonly indexName = "serviceRequests";
    static readonly initialState: ServiceRequest = {
        id: "",
        offerId: "",
        memberId: "",
        status: 'PENDING',
        createdAt: "",
    };
}
export class RatingEntity extends IndexedEntity<Rating> {
    static readonly entityName = "rating";
    static readonly indexName = "ratings";
    static readonly initialState: Rating = {
        id: "",
        bookingId: "",
        raterId: "",
        ratedId: "",
        score: 3,
        createdAt: "",
    };
}
export class DisputeEntity extends IndexedEntity<Dispute> {
    static readonly entityName = "dispute";
    static readonly indexName = "disputes";
    static readonly initialState: Dispute = {
        id: "",
        bookingId: "",
        reason: "",
        status: 'OPEN',
        createdAt: "",
    };
}