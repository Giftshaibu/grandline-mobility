import { z } from "zod";
const text = z.string().trim().min(1).max(300);
const safeUrl = z.string().url().refine(value => ["http:", "https:"].includes(new URL(value).protocol), "HTTP(S) URL required");
export const contactSchema = z.object({ phone: text.optional(), whatsapp: z.string().regex(/^\+[1-9]\d{6,14}$/).optional() });
export const providerSchema = z.object({ id: z.string().uuid(), slug: text, name: text, description: text, location: text, serviceArea: z.array(text).default([]), images: z.array(safeUrl).default([]), contact: contactSchema });
export const categorySchema = z.object({ slug: text, name: text });
export const searchSchema = z.object({ q: z.string().trim().max(120).catch("").optional(), location: z.string().trim().max(120).catch("").optional(), category: z.string().trim().max(80).catch("").optional() });
export type DirectorySearch = z.infer<typeof searchSchema>;
export function normalizeSearch(input: unknown): DirectorySearch { return Object.fromEntries(Object.entries(searchSchema.parse(input)).filter(([, value]) => value)); }
export function searchString(input: DirectorySearch) { return new URLSearchParams(normalizeSearch(input) as Record<string, string>).toString(); }
export const enquirySchema = z.object({ listingId: z.string().uuid(), message: z.string().trim().min(10, "Please provide at least 10 characters.").max(2000), name: z.string().trim().min(1).max(120), email: z.string().email().max(254) });
export const enquiryReceiptSchema = z.object({ id: z.string().uuid(), status: z.literal("submitted") });
export type Enquiry = z.infer<typeof enquirySchema>;
export const moneySchema = z.object({ amount: z.number().int().nonnegative().safe(), currency: z.literal("MWK"), unit: z.enum(["day", "week", "month", "trip"]) });
const mobilityBase = z.object({ id: z.string().uuid(), slug: text, title: text, description: text, location: text, category: text, images: z.array(safeUrl).default([]), provider: providerSchema, terms: text.optional() });
export const entrySchema = z.discriminatedUnion("kind", [
 mobilityBase.extend({ kind: z.literal("hire"), price: moneySchema.optional(), passengerCapacity: z.number().int().positive().optional(), transmission: text.optional() }),
 mobilityBase.extend({ kind: z.literal("commercial"), cargoCapacityKg: z.number().nonnegative().optional(), passengerCapacity: z.number().int().positive().optional(), price: moneySchema.optional() }),
 mobilityBase.extend({ kind: z.literal("logistics"), serviceAreas: z.array(text), cargoTypes: z.array(text).optional() }),
]);
export const pageSchema = z.object({ items: z.array(entrySchema), nextCursor: z.string().nullable() });
export type Entry = z.infer<typeof entrySchema>;
