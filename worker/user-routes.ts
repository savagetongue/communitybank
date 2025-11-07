import { Hono } from "hono";
import type { Env } from './core-utils';
import { ok, bad, notFound, unauthorized } from './core-utils';
import { MemberEntity, OfferEntity } from './entities';
import type { Member, Offer } from "@shared/types";
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
    const member = new MemberEntity(c.env, userId);
    if (!(await member.exists())) {
        return unauthorized(c, 'User not found');
    }
    c.set('currentUserId', userId);
    await next();
};
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Ensure seed data is present
  app.use('/api/*', async (c, next) => {
    await Promise.all([
        MemberEntity.ensureSeed(c.env),
        OfferEntity.ensureSeed(c.env)
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
  const app_auth = app.use('/api/me/*', authMiddleware);
  app_auth.get('/api/me', async (c: Context<AuthContext>) => {
    const userId = c.get('currentUserId');
    const memberInstance = new MemberEntity(c.env, userId);
    const member = await memberInstance.getState();
    const { passwordHash: _, ...memberData } = member;
    return ok(c, memberData);
  });
}