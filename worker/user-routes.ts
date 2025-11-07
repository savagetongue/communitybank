import { Hono } from "hono";
import type { Env } from './core-utils';
import { ok, bad, notFound, unauthorized, forbidden } from './core-utils';
import * as DB from './entities';
import type { Member, Offer, Booking, LedgerEntry, ServiceRequest, Rating, Dispute, AuthResponse } from "@shared/types";
import { Context } from "hono";
// --- Helper Functions ---
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}
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
    const member = await DB.findMemberById(c.env as Env, userId);
    if (!member) {
        return unauthorized(c, 'User not found');
    }
    c.set('currentUserId', userId);
    c.set('currentUser', member);
    await next();
};
const adminMiddleware = async (c: Context<AuthContext>, next: () => Promise<void>) => {
    const currentUser = c.get('currentUser');
    if (!currentUser?.isAdmin) {
        return forbidden(c, 'Administrator access required.');
    }
    await next();
};
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.use('/api/*', async (c, next) => {
    await DB.setupDatabase(c.env as Env);
    await next();
  });
  // --- Public Routes ---
  app.post('/api/register', async (c) => {
    const { name, email, password } = await c.req.json();
    if (!name || !email || !password) {
        return bad(c, 'Name, email, and password are required');
    }
    const existingMember = await DB.findMemberByEmail(c.env as Env, email);
    if (existingMember) {
        return bad(c, 'An account with this email already exists.');
    }
    const id = `user-${crypto.randomUUID()}`;
    const passwordHash = await hashPassword(password);
    const newMember: Member = {
        id, name, email, passwordHash, createdAt: new Date().toISOString(), isProvider: false, rating: 0,
    };
    await DB.createMember(c.env as Env, newMember);
    const token = generateToken(id);
    const { passwordHash: _, ...memberData } = newMember;
    return ok(c, { member: memberData, token } as AuthResponse);
  });
  app.post('/api/login', async (c) => {
    const { email, password } = await c.req.json();
    if (!email || !password) {
        return bad(c, 'Email and password are required');
    }
    const member = await DB.findMemberByEmail(c.env as Env, email);
    if (!member) {
        return unauthorized(c, 'Invalid credentials');
    }
    const passwordHash = await hashPassword(password);
    if (member.passwordHash !== passwordHash) {
        return unauthorized(c, 'Invalid credentials');
    }
    const token = generateToken(member.id);
    const { passwordHash: _, ...memberData } = member;
    return ok(c, { member: memberData, token } as AuthResponse);
  });
  app.get('/api/offers', async (c) => {
    const offers = await DB.listOffers(c.env as Env);
    return ok(c, offers);
  });
  app.get('/api/offers/featured', async (c) => {
    const offers = await DB.listOffers(c.env as Env, 3);
    return ok(c, offers);
  });
  app.get('/api/offers/:id', async (c) => {
    const { id } = c.req.param();
    const offer = await DB.findOfferById(c.env as Env, id);
    if (!offer) return notFound(c, 'Offer not found');
    return ok(c, offer);
  });
  app.get('/api/members/:id', async (c) => {
    const { id } = c.req.param();
    const member = await DB.findMemberById(c.env as Env, id);
    if (!member) return notFound(c, 'Member not found');
    const { passwordHash: _, ...memberData } = member;
    return ok(c, memberData);
  });
  // --- Authenticated Routes ---
  const app_auth = app.use('/api/me/*', authMiddleware)
                      .use('/api/offers', authMiddleware)
                      .use('/api/requests', authMiddleware)
                      .use('/api/bookings', authMiddleware)
                      .use('/api/bookings/*', authMiddleware)
                      .use('/api/ratings', authMiddleware)
                      .use('/api/disputes', authMiddleware)
                      .use('/api/admin/*', authMiddleware);
  app_auth.get('/api/me', async (c: Context<AuthContext>) => {
    const { passwordHash: _, ...memberData } = c.get('currentUser');
    return ok(c, memberData);
  });
  app_auth.put('/api/me', async (c: Context<AuthContext>) => {
    const userId = c.get('currentUserId');
    const { name, bio, contact } = await c.req.json();
    await DB.updateMember(c.env as Env, userId, { name, bio, contact });
    const updatedMember = await DB.findMemberById(c.env as Env, userId);
    const { passwordHash: _, ...memberData } = updatedMember!;
    return ok(c, memberData);
  });
  app_auth.get('/api/me/bookings', async (c: Context<AuthContext>) => {
    const userId = c.get('currentUserId');
    const bookings = await DB.listBookingsByUserId(c.env as Env, userId);
    return ok(c, bookings);
  });
  app_auth.get('/api/me/offers', async (c: Context<AuthContext>) => {
    const userId = c.get('currentUserId');
    const offers = await DB.listOffersByProviderId(c.env as Env, userId);
    return ok(c, offers);
  });
  app_auth.get('/api/me/ledger', async (c: Context<AuthContext>) => {
    const userId = c.get('currentUserId');
    const entries = await DB.listLedgerByUserId(c.env as Env, userId);
    const balance = entries.length > 0 ? entries[0].balanceAfter : 0;
    return ok(c, { entries, balance });
  });
  app_auth.post('/api/offers', async (c: Context<AuthContext>) => {
    const userId = c.get('currentUserId');
    const body = await c.req.json();
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
    await DB.createOffer(c.env as Env, newOffer);
    return ok(c, newOffer);
  });
  app_auth.post('/api/requests', async (c: Context<AuthContext>) => {
    const userId = c.get('currentUserId');
    const { offerId, note } = await c.req.json();
    const newRequest: ServiceRequest = {
        id: `req-${crypto.randomUUID()}`,
        offerId,
        memberId: userId,
        note,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
    };
    await DB.createServiceRequest(c.env as Env, newRequest);
    return ok(c, newRequest);
  });
  app_auth.post('/api/bookings', async (c: Context<AuthContext>) => {
    const userId = c.get('currentUserId');
    const { requestId, startTime, durationMinutes, offerId } = await c.req.json();
    const offer = await DB.findOfferById(c.env as Env, offerId);
    if (!offer) return notFound(c, 'Associated offer not found');
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
    await DB.createBooking(c.env as Env, newBooking);
    return ok(c, newBooking);
  });
  app_auth.post('/api/bookings/:id/complete', async (c: Context<AuthContext>) => {
    const { id: bookingId } = c.req.param();
    const currentUserId = c.get('currentUserId');
    const booking = await DB.findBookingById(c.env as Env, bookingId);
    if (!booking) return notFound(c, 'Booking not found');
    if (booking.providerId !== currentUserId) return forbidden(c, 'Only the provider can complete a booking.');
    if (booking.status !== 'CONFIRMED') return bad(c, `Booking cannot be completed. Current status: ${booking.status}`);
    const serviceRequest = await DB.findServiceRequestById(c.env as Env, booking.requestId);
    if (!serviceRequest) return notFound(c, 'Service request not found');
    const offer = await DB.findOfferById(c.env as Env, serviceRequest.offerId);
    if (!offer) return notFound(c, 'Offer not found');
    const amount = (offer.ratePerHour * booking.durationMinutes) / 60;
    const memberLastEntry = await DB.getLastLedgerEntry(c.env as Env, booking.memberId);
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
    await DB.createLedgerEntry(c.env as Env, debitEntry);
    const providerLastEntry = await DB.getLastLedgerEntry(c.env as Env, booking.providerId);
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
    await DB.createLedgerEntry(c.env as Env, creditEntry);
    await DB.updateBooking(c.env as Env, bookingId, { status: 'COMPLETED' });
    return ok(c, { status: 'ok', bookingId, ledgerEntries: [debitEntry.id, creditEntry.id] });
  });
  app_auth.post('/api/ratings', async (c: Context<AuthContext>) => {
    const raterId = c.get('currentUserId');
    const { bookingId, score, comment } = await c.req.json();
    const booking = await DB.findBookingById(c.env as Env, bookingId);
    if (!booking) return notFound(c, 'Booking not found.');
    if (booking.rated) return bad(c, 'This booking has already been rated.');
    const ratedId = booking.providerId === raterId ? booking.memberId : booking.providerId;
    const newRating: Rating = {
        id: `rating-${crypto.randomUUID()}`,
        bookingId, raterId, ratedId, score, comment, createdAt: new Date().toISOString(),
    };
    await DB.createRating(c.env as Env, newRating);
    await DB.updateBooking(c.env as Env, bookingId, { rated: true });
    return ok(c, newRating);
  });
  app_auth.post('/api/disputes', async (c: Context<AuthContext>) => {
    const userId = c.get('currentUserId');
    const { bookingId, reason } = await c.req.json();
    const booking = await DB.findBookingById(c.env as Env, bookingId);
    if (!booking) return notFound(c, 'Booking not found.');
    if (booking.memberId !== userId && booking.providerId !== userId) return forbidden(c, 'You are not a party to this booking.');
    const newDispute: Dispute = {
        id: `dispute-${crypto.randomUUID()}`,
        bookingId, reason, status: 'OPEN', createdAt: new Date().toISOString(),
    };
    await DB.createDispute(c.env as Env, newDispute);
    await DB.updateBooking(c.env as Env, bookingId, { status: 'DISPUTED' });
    return ok(c, newDispute);
  });
  // --- Admin Routes ---
  const app_admin = app_auth.use('/api/admin/*', adminMiddleware);
  app_admin.get('/api/admin/disputes', async (c) => {
    const disputes = await DB.listDisputes(c.env as Env);
    return ok(c, disputes);
  });
  app_admin.post('/api/admin/disputes/:id/resolve', async (c: Context<AuthContext>) => {
    const adminId = c.get('currentUserId');
    const { id: disputeId } = c.req.param();
    const { resolution, status } = await c.req.json();
    if (!resolution || !status || !['RESOLVED', 'REJECTED'].includes(status)) {
        return bad(c, 'Resolution and a valid status (RESOLVED/REJECTED) are required.');
    }
    const dispute = await DB.findDisputeById(c.env as Env, disputeId);
    if (!dispute) return notFound(c, 'Dispute not found.');
    await DB.updateDispute(c.env as Env, disputeId, { status, resolution, adminId });
    const updatedDispute = await DB.findDisputeById(c.env as Env, disputeId);
    return ok(c, updatedDispute);
  });
  app_admin.post('/api/admin/ledger-adjust', async (c: Context<AuthContext>) => {
    const { memberId, amount, reason } = await c.req.json();
    if (!memberId || amount === undefined || !reason) return bad(c, 'Member ID, amount, and reason are required.');
    const member = await DB.findMemberById(c.env as Env, memberId);
    if (!member) return notFound(c, 'Member to adjust not found.');
    const lastEntry = await DB.getLastLedgerEntry(c.env as Env, memberId);
    const balanceBefore = lastEntry ? lastEntry.balanceAfter : 0;
    const adjustmentEntry: LedgerEntry = {
        id: `ledger-${crypto.randomUUID()}`,
        memberId,
        amount,
        txnType: 'ADJUSTMENT',
        balanceAfter: balanceBefore + amount,
        notes: `Admin adjustment: ${reason}`,
        createdAt: new Date().toISOString(),
    };
    await DB.createLedgerEntry(c.env as Env, adjustmentEntry);
    return ok(c, adjustmentEntry);
  });
}