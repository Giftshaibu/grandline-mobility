import { z } from "zod";
import { businessRequest } from "./business-api";
import { apiBaseUrl } from "./config";
export const locationSchema = z.object({
  address: z.string().trim().min(3).max(300),
  landmark: z.string().max(300).default(""),
  lat: z.number().min(-90).max(90).nullable().default(null),
  lng: z.number().min(-180).max(180).nullable().default(null),
  placeId: z.string().max(300).default(""),
});
export type RideLocation = z.infer<typeof locationSchema>;
export const rideSchema = z.object({
  id: z.string().uuid(),
  version: z.number().int().positive(),
  kind: z.enum(["bike", "taxi"]),
  timing: z.enum(["now", "scheduled"]),
  scheduledAt: z.string().datetime().nullable(),
  pickup: locationSchema,
  destination: locationSchema,
  passengers: z.number().int().positive(),
  contactName: z.string(),
  phone: z.string(),
  notes: z.string(),
  status: z.enum([
    "requested",
    "availability-check",
    "quoted",
    "accepted",
    "assigned",
    "in-progress",
    "completed",
    "cancelled",
  ]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  quote: z
    .object({
      id: z.string().uuid(),
      revision: z.number().int(),
      amount: z.number().int().positive(),
      currency: z.literal("MWK"),
      inclusions: z.string(),
      expiresAt: z.string().datetime(),
      acceptedAt: z.string().datetime().nullable(),
    })
    .nullable(),
  assignment: z
    .object({
      driverName: z.string(),
      driverPhone: z.string(),
      vehicleLabel: z.string(),
      registration: z.string(),
      startsAt: z.string(),
      endsAt: z.string(),
    })
    .nullable(),
  events: z.array(z.object({ action: z.string(), createdAt: z.string() })),
});
export type Ride = z.infer<typeof rideSchema>;
export const rideResponse = z.object({ ride: rideSchema });
export const ridePage = z.object({
  items: z.array(rideSchema),
  nextCursor: z.string().nullable(),
});
export async function rideCapability() {
  if (!apiBaseUrl) return false;
  const response = await fetch(`${apiBaseUrl}/api/v1/capabilities`, {
    cache: "no-store",
  });
  if (!response.ok)
    throw new Error("Ride availability could not be checked. Please retry.");
  return z.object({ rides: z.boolean() }).parse(await response.json()).rides;
}
export async function rideRequest(
  path: string,
  token: string,
  method = "GET",
  body?: unknown,
) {
  if (!(await rideCapability()))
    throw new Error(
      "Ride requests are not enabled yet. Nothing has been submitted.",
    );
  return (
    await businessRequest(`/rides${path}`, rideResponse, token, method, body)
  ).ride;
}
export const malawiTime = (value: string) =>
  new Intl.DateTimeFormat("en-MW", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Blantyre",
  }).format(new Date(value));
