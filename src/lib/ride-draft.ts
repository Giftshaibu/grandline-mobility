import { z } from "zod";
import { locationSchema, type Ride, type RideLocation } from "./ride-api";
export const blankLocation = (): RideLocation => ({
  address: "",
  landmark: "",
  lat: null,
  lng: null,
  placeId: "",
});
export function emptyRide(kind: "bike" | "taxi" = "bike") {
  return {
    kind,
    timing: "now" as "now" | "scheduled",
    scheduled: "",
    pickup: blankLocation(),
    destination: blankLocation(),
    passengers: "1",
    contactName: "",
    phone: "",
    notes: "",
    confirmed: false,
  };
}
export type RideDraft = ReturnType<typeof emptyRide>;
export function ridePayload(draft: RideDraft) {
  const phone = z
    .string()
    .trim()
    .min(7)
    .max(30)
    .regex(/^\+?[\d ()-]+$/)
    .refine((value) => value.replace(/\D/g, "").length >= 7)
    .parse(draft.phone);
  const passengers = z
    .number()
    .int()
    .min(1)
    .max(draft.kind === "bike" ? 1 : 8)
    .parse(Number(draft.passengers));
  const normalize = (input: RideLocation) => {
    const location = locationSchema.parse(input);
    // Google-derived coordinates stay in this browser session. Persist only the
    // customer-confirmed address/landmark and permitted place identifier.
    return location.placeId ? { ...location, lat: null, lng: null } : location;
  };
  const scheduledAt =
    draft.timing === "scheduled" ? malawiToUtc(draft.scheduled) : null;
  if (scheduledAt && Date.parse(scheduledAt) <= Date.now())
    throw new Error("Choose a future pickup in Malawi local time.");
  if (!draft.confirmed)
    throw new Error("Confirm your pickup and destination details.");
  return {
    kind: draft.kind,
    timing: draft.timing,
    scheduledAt,
    pickup: normalize(draft.pickup),
    destination: normalize(draft.destination),
    passengers,
    contactName: z.string().trim().min(1).max(120).parse(draft.contactName),
    phone,
    notes: z.string().max(2000).parse(draft.notes),
  };
}
export function malawiToUtc(value: string) {
  if (!/^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(value))
    throw new Error("Choose a pickup date and time in Malawi local time.");
  const date = new Date(`${value}:00+02:00`);
  if (
    !Number.isFinite(date.getTime()) ||
    new Date(date.getTime() + 7200000).toISOString().slice(0, 16) !== value
  )
    throw new Error("Choose a valid pickup date and time.");
  return date.toISOString();
}
export function restoreRide(ride: Ride): RideDraft {
  return {
    ...emptyRide(ride.kind),
    timing: ride.timing,
    scheduled: ride.scheduledAt
      ? new Date(Date.parse(ride.scheduledAt) + 7200000)
          .toISOString()
          .slice(0, 16)
      : "",
    pickup: ride.pickup,
    destination: ride.destination,
    passengers: String(ride.passengers),
    contactName: ride.contactName,
    phone: ride.phone,
    notes: ride.notes,
  };
}
