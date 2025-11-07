import { Hono } from "hono";
import type { Env } from './core-utils';
import { ok, bad, notFound } from './core-utils';
import { MemberEntity, OfferEntity } from './entities';
import type { Offer } from "@shared/types";
// Helper function to denormalize offer data with provider details
async function denormalizeOffers(env: Env, offers: Offer[]): Promise<Offer[]> {
    const providerIds = [...new Set(offers.map(o => o.providerId))];
    const providerPromises = providerIds.map(id => new MemberEntity(env, id).getState());
    const providers = await Promise.all(providerPromises);
    const providersMap = new Map(providers.map(p => [p.id, p]));
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
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Ensure seed data is present
  app.use('/api/*', async (c, next) => {
    await Promise.all([
        MemberEntity.ensureSeed(c.env),
        OfferEntity.ensureSeed(c.env)
    ]);
    await next();
  });
  // GET all offers
  app.get('/api/offers', async (c) => {
    const { items: offers } = await OfferEntity.list(c.env);
    const activeOffers = offers.filter(o => o.isActive);
    const denormalized = await denormalizeOffers(c.env, activeOffers);
    return ok(c, denormalized);
  });
  // GET featured offers (first 3)
  app.get('/api/offers/featured', async (c) => {
    const { items: offers } = await OfferEntity.list(c.env, null, 10); // Fetch a few more to ensure we get 3 active
    const activeOffers = offers.filter(o => o.isActive).slice(0, 3);
    const denormalized = await denormalizeOffers(c.env, activeOffers);
    return ok(c, denormalized);
  });
  // GET a single offer by ID
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
}