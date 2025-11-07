import { Hono } from "hono";
import type { Env } from './core-utils';
import { ok, bad, notFound, unauthorized } from './core-utils';
import { MemberEntity, OfferEntity, BookingEntity, LedgerEntryEntity, ServiceRequestEntity } from './entities';
import type { Member, Offer, Booking, LedgerEntry, ServiceRequest } from "@shared/types";
import { Context } from "hono";
// --- Helper Functions ---
// Simple (and insecure) password hashing. In a real app, use a library like bcrypt.
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}
// Simple (and insecure) token generation. In a real app, use JWT.
function generateToken(userId: string): string {
  return `token_for_${userId}_${Date.now()}`;
}
function getUserIdFromToken(token: string): string | null {
  const parts = token.split('_');
  if (parts.length === 4 && parts[0] === 'token' && parts[1] === 'for') {
    return parts[2];
  }
  return null;
}
async function denormalizeOffers(env: Env, offers: Offer[]): Promise<Offer[]> {
    const providerIds = [...new Set(offers.map(o => o.providerId))];
    const providers = await Promise.all(
        providerIds.map(id => new MemberEntity(env, id).getState().catch(() => null))
    );
    const providersMap = new Map(providers.filter(p => p).map(p => [p!.id, p]));
    return offers.map(offer => {
        const provider = providersMap.get(offer.providerId);
        return {
            ...offer,
            providerName: provider?.name,
            providerAvatarUrl: provider?.avatarUrl,
            providerRating: provider?.rating,
        };
    });
}
// --- Middleware ---
type AuthContext = {
    Variables: {
        currentUserId: string;
        currentUser: Member;
    }
}
const authMiddleware = async (c: Context<AuthContext>, next: () => Promise<void>) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return unauthorized(c, 'Missing or invalid token');
    }
    const token = authHeader.substring(7);
    const userId = getUserIdFromToken(token);
    if (!userId) {
        return unauthorized(c, 'Invalid token');
    }
    const memberInstance = new MemberEntity(c.env, userId);
    if (!(await memberInstance.exists())) {
        return unauthorized(c, 'User not found');
    }
    const member = await memberInstance.getState();
    c.set('currentUserId', userId);
    c.set('currentUser', member);
    await next();
};
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Ensure seed data is present
  app.use('/api/*', async (c, next) => {
    await Promise.all([
        MemberEntity.ensureSeed(c.env),
        OfferEntity.ensureSeed(c.env),
        LedgerEntryEntity.ensureSeed(c.env),
    ]);
    await next();
  });
  // --- Public Routes ---
  app.post('/api/register', async (c) => {
    const { name, email, password } = await c.req.json();
    if (!name || !email || !password) {
        return bad(c, 'Name, email, and password are required');
    }
    // This is a simplistic check. A real app should check for existing emails properly.
    const id = `user-${crypto.randomUUID()}`;
    const passwordHash = await hashPassword(password);
    const newMember: Member = {
        id,
        name,
        email,
        passwordHash,
        createdAt: new Date().toISOString(),
        isProvider: false,
        rating: 0,
    };
    await MemberEntity.create(c.env, newMember);
    const token = generateToken(id);
    const { passwordHash: _, ...memberData } = newMember;
    return ok(c, { member: memberData, token });
  });
  app.post('/api/login', async (c) => {
    const { email, password } = await c.req.json();
    if (!email || !password) {
        return bad(c, 'Email and password are required');
    }
    // This is highly inefficient. In a real app, you'd have an index on email.
    const { items: allMembers } = await MemberEntity.list(c.env);
    const memberState = allMembers.find(m => m.email === email);
    if (!memberState) {
        return unauthorized(c, 'Invalid credentials');
    }
    const passwordHash = await hashPassword(password);
    if (memberState.passwordHash !== passwordHash) {
        // For seed data without real hashes, we'll allow login for demo purposes
        if (memberState.passwordHash !== 'hashed_password_placeholder') {
            return unauthorized(c, 'Invalid credentials');
        }
    }
    const token = generateToken(memberState.id);
    const { passwordHash: _, ...memberData } = memberState;
    return ok(c, { member: memberData, token });
  });
  app.get('/api/offers', async (c) => {
    const { items: offers } = await OfferEntity.list(c.env);
    const activeOffers = offers.filter(o => o.isActive);
    const denormalized = await denormalizeOffers(c.env, activeOffers);
    return ok(c, denormalized);
  });
  app.get('/api/offers/featured', async (c) => {
    const { items: offers } = await OfferEntity.list(c.env, null, 10);
    const activeOffers = offers.filter(o => o.isActive).slice(0, 3);
    const denormalized = await denormalizeOffers(c.env, activeOffers);
    return ok(c, denormalized);
  });
  app.get('/api/offers/:id', async (c) => {
    const { id } = c.req.param();
    if (!id) return bad(c, 'ID is required');
    const offerInstance = new OfferEntity(c.env, id);
    if (!(await offerInstance.exists())) {
        return notFound(c, 'Offer not found');
    }
    const offer = await offerInstance.getState();
    const denormalized = await denormalizeOffers(c.env, [offer]);
    return ok(c, denormalized[0]);
  });
  app.get('/api/members/:id', async (c) => {
    const { id } = c.req.param();
    const memberInstance = new MemberEntity(c.env, id);
    if (!(await memberInstance.exists())) {
        return notFound(c, 'Member not found');
    }
    const member = await memberInstance.getState();
    const { passwordHash: _, ...memberData } = member;
    return ok(c, memberData);
  });
  // --- Authenticated Routes ---
  const app_auth = app.use('/api/me/*', authMiddleware)
                      .use('/api/offers', authMiddleware)
                      .use('/api/requests', authMiddleware)
                      .use('/api/bookings', authMiddleware)
                      .use('/api/bookings/*', authMiddleware);
  app_auth.get('/api/me', async (c: Context<AuthContext>) => {
    const member = c.get('currentUser');
    const { passwordHash: _, ...memberData } = member;
    return ok(c, memberData);
  });
  app_auth.put('/api/me', async (c: Context<AuthContext>) => {
    const userId = c.get('currentUserId');
    const { name, bio, contact } = await c.req.json();
    const memberInstance = new MemberEntity(c.env, userId);
    await memberInstance.patch({ name, bio, contact });
    const updatedMember = await memberInstance.getState();
    const { passwordHash: _, ...memberData } = updatedMember;
    return ok(c, memberData);
  });
  app_auth.get('/api/me/bookings', async (c: Context<AuthContext>) => {
    const userId = c.get('currentUserId');
    const { items: allBookings } = await BookingEntity.list(c.env);
    const userBookings = allBookings.filter(b => b.memberId === userId || b.providerId === userId);
    return ok(c, userBookings);
  });
  app_auth.get('/api/me/offers', async (c: Context<AuthContext>) => {
    const userId = c.get('currentUserId');
    const { items: allOffers } = await OfferEntity.list(c.env);
    const userOffers = allOffers.filter(o => o.providerId === userId);
    return ok(c, userOffers);
  });
  app_auth.get('/api/me/ledger', async (c: Context<AuthContext>) => {
    const userId = c.get('currentUserId');
    const { items: allEntries } = await LedgerEntryEntity.list(c.env);
    const userEntries = allEntries.filter(l => l.memberId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const balance = userEntries.length > 0 ? userEntries[0].balanceAfter : 0;
    return ok(c, { entries: userEntries, balance });
  });
  app_auth.post('/api/offers', async (c: Context<AuthContext>) => {
    const userId = c.get('currentUserId');
    const body = await c.req.json();
    if (!body.title || !body.description || !body.skills || !body.ratePerHour) {
        return bad(c, 'Missing required offer fields');
    }
    const newOffer: Offer = {
        id: `offer-${crypto.randomUUID()}`,
        providerId: userId,
        title: body.title,
        description: body.description,
        skills: body.skills,
        ratePerHour: body.ratePerHour,
        isActive: true,
        createdAt: new Date().toISOString(),
    };
    await OfferEntity.create(c.env, newOffer);
    return ok(c, newOffer);
  });
  app_auth.post('/api/requests', async (c: Context<AuthContext>) => {
    const userId = c.get('currentUserId');
    const { offerId, note } = await c.req.json();
    if (!offerId) return bad(c, 'Offer ID is required');
    const newRequest: ServiceRequest = {
        id: `req-${crypto.randomUUID()}`,
        offerId,
        memberId: userId,
        note,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
    };
    await ServiceRequestEntity.create(c.env, newRequest);
    return ok(c, newRequest);
  });
  app_auth.post('/api/bookings', async (c: Context<AuthContext>) => {
    const userId = c.get('currentUserId');
    const { requestId, startTime, durationMinutes, offerId } = await c.req.json();
    if (!requestId || !startTime || !durationMinutes || !offerId) {
        return bad(c, 'Request ID, start time, duration, and offer ID are required');
    }
    const offerInstance = new OfferEntity(c.env, offerId);
    if (!(await offerInstance.exists())) {
        return notFound(c, 'Associated offer not found');
    }
    const offer = await offerInstance.getState();
    const newBooking: Booking = {
        id: `booking-${crypto.randomUUID()}`,
        requestId,
        providerId: offer.providerId,
        memberId: userId,
        startTime,
        durationMinutes,
        status: 'CONFIRMED',
        escrowId: `escrow-${crypto.randomUUID()}`,
        createdAt: new Date().toISOString(),
    };
    await BookingEntity.create(c.env, newBooking);
    return ok(c, newBooking);
  });
  app_auth.post('/api/bookings/:id/complete', async (c: Context<AuthContext>) => {
    const { id: bookingId } = c.req.param();
    const currentUserId = c.get('currentUserId');
    const bookingInstance = new BookingEntity(c.env, bookingId);
    if (!await bookingInstance.exists()) {
        return notFound(c, 'Booking not found');
    }
    const booking = await bookingInstance.getState();
    if (booking.providerId !== currentUserId) {
        return unauthorized(c, 'Only the provider can complete a booking.');
    }
    if (booking.status !== 'CONFIRMED') {
        return bad(c, `Booking cannot be completed. Current status: ${booking.status}`);
    }
    // This is inefficient. In a real app, the offerId would be on the booking.
    const serviceRequestInstance = new ServiceRequestEntity(c.env, booking.requestId);
    const serviceRequest = await serviceRequestInstance.getState();
    const offerInstance = new OfferEntity(c.env, serviceRequest.offerId);
    const offer = await offerInstance.getState();
    const amount = (offer.ratePerHour * booking.durationMinutes) / 60;
    // --- ATOMIC LEDGER UPDATE (Simulated) ---
    // In a real DB, this would be a transaction. Here we do it sequentially.
    // 1. Debit the member
    const { items: memberLedger } = await LedgerEntryEntity.list(c.env);
    const memberLastEntry = memberLedger.filter(e => e.memberId === booking.memberId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    const memberBalanceBefore = memberLastEntry ? memberLastEntry.balanceAfter : 0;
    const debitEntry: LedgerEntry = {
        id: `ledger-${crypto.randomUUID()}`,
        memberId: booking.memberId,
        amount: -amount,
        txnType: 'DEBIT',
        balanceAfter: memberBalanceBefore - amount,
        relatedBookingId: bookingId,
        notes: `Payment for "${offer.title}"`,
        createdAt: new Date().toISOString(),
    };
    await LedgerEntryEntity.create(c.env, debitEntry);
    // 2. Credit the provider
    const { items: providerLedger } = await LedgerEntryEntity.list(c.env);
    const providerLastEntry = providerLedger.filter(e => e.memberId === booking.providerId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    const providerBalanceBefore = providerLastEntry ? providerLastEntry.balanceAfter : 0;
    const creditEntry: LedgerEntry = {
        id: `ledger-${crypto.randomUUID()}`,
        memberId: booking.providerId,
        amount: amount,
        txnType: 'CREDIT',
        balanceAfter: providerBalanceBefore + amount,
        relatedBookingId: bookingId,
        notes: `Received for "${offer.title}"`,
        createdAt: new Date().toISOString(),
    };
    await LedgerEntryEntity.create(c.env, creditEntry);
    // 3. Update booking status
    await bookingInstance.patch({ status: 'COMPLETED' });
    return ok(c, { status: 'ok', bookingId, ledgerEntries: [debitEntry.id, creditEntry.id] });
  });
}