import { getDbConnection } from './db';
import type { RowDataPacket } from 'mysql2';
import type { Env } from './core-utils';
import type { Member, Offer, Booking, LedgerEntry, ServiceRequest, Rating, Dispute } from "@shared/types";
const SCHEMA_VERSION = 1;
let dbInitialized = false;
export async function setupDatabase(env: Env) {
    if (dbInitialized) return;
    const db = await getDbConnection(env);
    await (db as any).query(`
        CREATE TABLE IF NOT EXISTS schema_version (
            version INT PRIMARY KEY
        );
    `);
    const [rows] = await (db as any).query('SELECT version FROM schema_version');
    const currentVersion = rows[0]?.version || 0;
    if (currentVersion < SCHEMA_VERSION) {
        await (db as any).query(`
            CREATE TABLE IF NOT EXISTS members (
                id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                contact VARCHAR(255),
                avatarUrl VARCHAR(255),
                bio TEXT,
                rating FLOAT DEFAULT 0,
                isProvider BOOLEAN DEFAULT FALSE,
                isAdmin BOOLEAN DEFAULT FALSE,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                passwordHash VARCHAR(255) NOT NULL
            );
        `);
        await (db as any).query(`
            CREATE TABLE IF NOT EXISTS offers (
                id VARCHAR(255) PRIMARY KEY,
                providerId VARCHAR(255) NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                skills JSON,
                ratePerHour FLOAT NOT NULL,
                isActive BOOLEAN DEFAULT TRUE,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (providerId) REFERENCES members(id)
            );
        `);
        await (db as any).query(`
            CREATE TABLE IF NOT EXISTS service_requests (
                id VARCHAR(255) PRIMARY KEY,
                offerId VARCHAR(255) NOT NULL,
                memberId VARCHAR(255) NOT NULL,
                note TEXT,
                status ENUM('PENDING', 'ACCEPTED', 'REJECTED') DEFAULT 'PENDING',
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (offerId) REFERENCES offers(id),
                FOREIGN KEY (memberId) REFERENCES members(id)
            );
        `);
        await (db as any).query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id VARCHAR(255) PRIMARY KEY,
                requestId VARCHAR(255) NOT NULL,
                providerId VARCHAR(255) NOT NULL,
                memberId VARCHAR(255) NOT NULL,
                startTime TIMESTAMP NOT NULL,
                durationMinutes INT NOT NULL,
                status ENUM('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISPUTED') DEFAULT 'PENDING',
                escrowId VARCHAR(255),
                rated BOOLEAN DEFAULT FALSE,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (requestId) REFERENCES service_requests(id),
                FOREIGN KEY (providerId) REFERENCES members(id),
                FOREIGN KEY (memberId) REFERENCES members(id)
            );
        `);
        await (db as any).query(`
            CREATE TABLE IF NOT EXISTS ledger_entries (
                id VARCHAR(255) PRIMARY KEY,
                memberId VARCHAR(255) NOT NULL,
                amount FLOAT NOT NULL,
                txnType ENUM('CREDIT', 'DEBIT', 'ADJUSTMENT', 'REFUND') NOT NULL,
                balanceAfter FLOAT NOT NULL,
                relatedBookingId VARCHAR(255),
                notes TEXT,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (memberId) REFERENCES members(id)
            );
        `);
        await (db as any).query(`
            CREATE TABLE IF NOT EXISTS ratings (
                id VARCHAR(255) PRIMARY KEY,
                bookingId VARCHAR(255) NOT NULL,
                raterId VARCHAR(255) NOT NULL,
                ratedId VARCHAR(255) NOT NULL,
                score INT NOT NULL,
                comment TEXT,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (bookingId) REFERENCES bookings(id),
                FOREIGN KEY (raterId) REFERENCES members(id),
                FOREIGN KEY (ratedId) REFERENCES members(id)
            );
        `);
        await (db as any).query(`
            CREATE TABLE IF NOT EXISTS disputes (
                id VARCHAR(255) PRIMARY KEY,
                bookingId VARCHAR(255) NOT NULL,
                reason TEXT NOT NULL,
                status ENUM('OPEN', 'RESOLVED', 'REJECTED') DEFAULT 'OPEN',
                resolution TEXT,
                adminId VARCHAR(255),
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (bookingId) REFERENCES bookings(id)
            );
        `);
        await (db as any).query('INSERT INTO schema_version (version) VALUES (?) ON DUPLICATE KEY UPDATE version = ?', [SCHEMA_VERSION, SCHEMA_VERSION]);
    }
    dbInitialized = true;
}
// --- Data Access Functions ---
export const findMemberByEmail = async (env: Env, email: string): Promise<Member | null> => {
    const db = await getDbConnection(env);
    const [rows] = await (db as any).query('SELECT * FROM members WHERE email = ?', [email]);
    return (rows[0] as Member) || null;
};
export const findMemberById = async (env: Env, id: string): Promise<Member | null> => {
    const db = await getDbConnection(env);
    const [rows] = await (db as any).query('SELECT * FROM members WHERE id = ?', [id]);
    return (rows[0] as Member) || null;
};
export const createMember = async (env: Env, member: Omit<Member, 'createdAt' | 'rating' | 'isProvider'>): Promise<void> => {
    const db = await getDbConnection(env);
    await (db as any).query(
        'INSERT INTO members (id, name, email, passwordHash, isAdmin) VALUES (?, ?, ?, ?, ?)',
        [member.id, member.name, member.email, member.passwordHash, member.isAdmin || false]
    );
};
export const updateMember = async (env: Env, id: string, data: Partial<Member>): Promise<void> => {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    const db = await getDbConnection(env);
    await (db as any).query(`UPDATE members SET ${fields} WHERE id = ?`, [...values, id]);
};
export const listOffers = async (env: Env, limit?: number): Promise<Offer[]> => {
    const query = `
        SELECT o.*, m.name as providerName, m.avatarUrl as providerAvatarUrl, m.rating as providerRating
        FROM offers o
        JOIN members m ON o.providerId = m.id
        WHERE o.isActive = TRUE
        ORDER BY o.createdAt DESC
        ${limit ? `LIMIT ${limit}` : ''}
    `;
    const db = await getDbConnection(env);
    const [rows] = await (db as any).query(query);
    return rows.map((row: any): Offer => ({ ...row, skills: JSON.parse(row.skills || '[]') }));
};
export const findOfferById = async (env: Env, id: string): Promise<Offer | null> => {
    const db = await getDbConnection(env);
    const [rows] = await (db as any).query(`
        SELECT o.*, m.name as providerName, m.avatarUrl as providerAvatarUrl, m.rating as providerRating
        FROM offers o
        JOIN members m ON o.providerId = m.id
        WHERE o.id = ?
    `, [id]);
    if (!rows[0]) return null;
    const row = rows[0] as any;
    return { ...row, skills: JSON.parse(row.skills || '[]') };
};
export const createOffer = async (env: Env, offer: Omit<Offer, 'createdAt'>): Promise<void> => {
    const db = await getDbConnection(env);
    await (db as any).query(
        'INSERT INTO offers (id, providerId, title, description, skills, ratePerHour, isActive) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [offer.id, offer.providerId, offer.title, offer.description, JSON.stringify(offer.skills), offer.ratePerHour, offer.isActive]
    );
};
export const listOffersByProviderId = async (env: Env, providerId: string): Promise<Offer[]> => {
    const db = await getDbConnection(env);
    const [rows] = await (db as any).query('SELECT * FROM offers WHERE providerId = ? ORDER BY createdAt DESC', [providerId]);
    return rows.map((row: any): Offer => ({ ...row, skills: JSON.parse(row.skills || '[]') }));
};
export const createServiceRequest = async (env: Env, request: Omit<ServiceRequest, 'createdAt' | 'status'>): Promise<void> => {
    const db = await getDbConnection(env);
    await (db as any).query(
        'INSERT INTO service_requests (id, offerId, memberId, note) VALUES (?, ?, ?, ?)',
        [request.id, request.offerId, request.memberId, request.note]
    );
};
export const findServiceRequestById = async (env: Env, id: string): Promise<ServiceRequest | null> => {
    const db = await getDbConnection(env);
    const [rows] = await (db as any).query('SELECT * FROM service_requests WHERE id = ?', [id]);
    return (rows[0] as ServiceRequest) || null;
};
export const createBooking = async (env: Env, booking: Omit<Booking, 'createdAt' | 'status'>): Promise<void> => {
    const db = await getDbConnection(env);
    await (db as any).query(
        'INSERT INTO bookings (id, requestId, providerId, memberId, startTime, durationMinutes, escrowId, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [booking.id, booking.requestId, booking.providerId, booking.memberId, booking.startTime, booking.durationMinutes, booking.escrowId, 'CONFIRMED']
    );
};
export const findBookingById = async (env: Env, id: string): Promise<Booking | null> => {
    const db = await getDbConnection(env);
    const [rows] = await (db as any).query('SELECT * FROM bookings WHERE id = ?', [id]);
    return (rows[0] as Booking) || null;
};
export const updateBooking = async (env: Env, id: string, data: Partial<Booking>): Promise<void> => {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    const db = await getDbConnection(env);
    await (db as any).query(`UPDATE bookings SET ${fields} WHERE id = ?`, [...values, id]);
};
export const listBookingsByUserId = async (env: Env, userId: string): Promise<any[]> => {
    const query = `
        SELECT
            b.*,
            o.title as offerTitle,
            other_party.name as otherPartyName,
            other_party.avatarUrl as otherPartyAvatarUrl
        FROM bookings b
        JOIN service_requests sr ON b.requestId = sr.id
        JOIN offers o ON sr.offerId = o.id
        JOIN members other_party ON other_party.id = IF(b.providerId = ?, b.memberId, b.providerId)
        WHERE b.providerId = ? OR b.memberId = ?
        ORDER BY b.startTime DESC
    `;
    const db = await getDbConnection(env);
    const [rows] = await (db as any).query(query, [userId, userId, userId]);
    return rows;
};
export const getLastLedgerEntry = async (env: Env, memberId: string): Promise<LedgerEntry | null> => {
    const db = await getDbConnection(env);
    const [rows] = await (db as any).query('SELECT * FROM ledger_entries WHERE memberId = ? ORDER BY createdAt DESC LIMIT 1', [memberId]);
    return (rows[0] as LedgerEntry) || null;
};
export const createLedgerEntry = async (env: Env, entry: Omit<LedgerEntry, 'createdAt'>): Promise<void> => {
    const db = await getDbConnection(env);
    await (db as any).query(
        'INSERT INTO ledger_entries (id, memberId, amount, txnType, balanceAfter, relatedBookingId, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [entry.id, entry.memberId, entry.amount, entry.txnType, entry.balanceAfter, entry.relatedBookingId, entry.notes]
    );
};
export const listLedgerByUserId = async (env: Env, userId: string): Promise<LedgerEntry[]> => {
    const db = await getDbConnection(env);
    const [rows] = await (db as any).query('SELECT * FROM ledger_entries WHERE memberId = ? ORDER BY createdAt DESC', [userId]);
    return rows as LedgerEntry[];
};
export const createRating = async (env: Env, rating: Omit<Rating, 'createdAt'>): Promise<void> => {
    const db = await getDbConnection(env);
    await (db as any).query(
        'INSERT INTO ratings (id, bookingId, raterId, ratedId, score, comment) VALUES (?, ?, ?, ?, ?, ?)',
        [rating.id, rating.bookingId, rating.raterId, rating.ratedId, rating.score, rating.comment]
    );
};
export const createDispute = async (env: Env, dispute: Omit<Dispute, 'createdAt' | 'status'>): Promise<void> => {
    const db = await getDbConnection(env);
    await (db as any).query(
        'INSERT INTO disputes (id, bookingId, reason) VALUES (?, ?, ?)',
        [dispute.id, dispute.bookingId, dispute.reason]
    );
};
export const listDisputes = async (env: Env): Promise<Dispute[]> => {
    const query = `
        SELECT
            d.*,
            o.title as bookingTitle,
            m.name as memberName,
            p.name as providerName
        FROM disputes d
        JOIN bookings b ON d.bookingId = b.id
        JOIN service_requests sr ON b.requestId = sr.id
        JOIN offers o ON sr.offerId = o.id
        JOIN members m ON b.memberId = m.id
        JOIN members p ON b.providerId = p.id
        ORDER BY d.createdAt DESC
    `;
    const db = await getDbConnection(env);
    const [rows] = await (db as any).query(query);
    return rows as Dispute[];
};
export const findDisputeById = async (env: Env, id: string): Promise<Dispute | null> => {
    const db = await getDbConnection(env);
    const [rows] = await (db as any).query('SELECT * FROM disputes WHERE id = ?', [id]);
    return (rows[0] as Dispute) || null;
};
export const updateDispute = async (env: Env, id: string, data: Partial<Dispute>): Promise<void> => {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    const db = await getDbConnection(env);
    await (db as any).query(`UPDATE disputes SET ${fields} WHERE id = ?`, [...values, id]);
};