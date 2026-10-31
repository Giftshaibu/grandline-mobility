import { it, expect } from "vitest";
import { emptyRide, ridePayload, malawiToUtc } from "../src/lib/ride-draft";
import { mobilityDraft, restoreMobilityDraft } from "../src/lib/mobility-draft";
import {
  changeListingType,
  emptyMobilityApplication,
  mobilityErrors,
} from "../src/lib/mobility-application";
it("converts Malawi scheduling independently of the browser timezone", () => {
  expect(malawiToUtc("2030-11-10T14:30")).toBe("2030-11-10T12:30:00.000Z");
  expect(() => malawiToUtc("tomorrow")).toThrow();
});
it("requires confirmed route/contact fields and bike capacity, and omits transient Google coordinates", () => {
  const draft = {
    ...emptyRide(),
    pickup: {
      address: "Market",
      landmark: "Gate",
      lat: -11.4,
      lng: 34,
      placeId: "google-place",
    },
    destination: {
      address: "University",
      landmark: "Main gate",
      lat: null,
      lng: null,
      placeId: "",
    },
    contactName: "Customer",
    phone: "+265999000000",
    confirmed: true,
  };
  expect(ridePayload(draft).pickup).toMatchObject({
    address: "Market",
    placeId: "google-place",
    lat: null,
    lng: null,
  });
  expect(() => ridePayload({ ...draft, confirmed: false })).toThrow();
  expect(() => ridePayload({ ...draft, passengers: "2" })).toThrow();
  expect(
    ridePayload({ ...draft, kind: "taxi", passengers: "4" }).passengers,
  ).toBe(4);
});
it("round trips all six application types without inventing rates or aggregating fees", () => {
  for (const type of [
    "hire",
    "heavy-duty",
    "commercial",
    "logistics",
    "bike-operator",
    "taxi-operator",
  ]) {
    const draft = changeListingType(emptyMobilityApplication(), type);
    const value = mobilityDraft(draft, false);
    expect(value.rate).toBeNull();
    expect(restoreMobilityDraft(value).draft).toEqual(draft);
  }
  const taxi = changeListingType(emptyMobilityApplication(), "taxi-operator");
  expect(mobilityErrors(taxi, 2)).toHaveProperty("passengers");
});
