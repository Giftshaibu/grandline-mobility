import { it, expect } from "vitest";
import {
  emptyMobilityApplication,
  mobilityErrors,
  changeListingType,
  mobilityFeeRows,
} from "../src/lib/mobility-application";
it("clears incompatible offering fields while preserving business/contact details", () => {
  const draft = {
    ...emptyMobilityApplication(),
    type: "hire",
    name: "Test business",
    phone: "+2651234567",
    make: "Test make",
    category: "car",
    rate: "1000",
  };
  const changed = changeListingType(draft, "logistics");
  expect(changed.name).toBe(draft.name);
  expect(changed.phone).toBe(draft.phone);
  expect(changed.make).toBe("");
  expect(changed.rate).toBe("");
  expect(changed.category).toBe("");
});
it("validates vehicle fields only for vehicle/equipment listings", () => {
  const draft = {
    ...emptyMobilityApplication(),
    type: "logistics",
    title: "Goods movement",
    category: "goods",
    terms: "Transport of packaged goods",
  };
  expect(mobilityErrors(draft, 2)).toEqual({});
  expect(
    mobilityErrors({ ...draft, type: "hire", category: "car" }, 2),
  ).toHaveProperty("make");
  expect(
    mobilityErrors({ ...draft, type: "heavy-duty", category: "lorry" }, 2),
  ).toHaveProperty("operator");
});
it("rejects invalid capacities, years and unsafe prices", () => {
  const draft = {
    ...emptyMobilityApplication(),
    type: "commercial",
    title: "Transport",
    category: "truck",
    make: "Test",
    model: "Truck",
    terms: "Transport service description",
    passengers: "0",
    cargoKg: "-1",
    year: "1800",
    rate: "1.5",
  };
  const errors = mobilityErrors(draft, 2);
  for (const field of ["passengers", "cargoKg", "year", "rate"])
    expect(errors).toHaveProperty(field);
  expect(
    mobilityErrors(
      {
        ...draft,
        passengers: "2",
        cargoKg: "1000",
        year: "2020",
        rate: "9007199254740992",
      },
      2,
    ),
  ).toHaveProperty("rate");
});
it("only quotes previously supplied rates for mapped categories", () => {
  const draft = emptyMobilityApplication();
  expect(
    mobilityFeeRows({ ...draft, type: "hire", businessType: "company" })[0]
      ?.amount,
  ).toBe(50000);
  expect(mobilityFeeRows({ ...draft, type: "bike-operator" })[0]?.amount).toBe(
    10000,
  );
  expect(
    mobilityFeeRows({ ...draft, type: "heavy-duty", category: "lorry" })[0]
      ?.amount,
  ).toBe(25000);
  expect(
    mobilityFeeRows({ ...draft, type: "logistics", category: "delivery" })[0]
      ?.amount,
  ).toBe(50000);
  expect(
    mobilityFeeRows({ ...draft, type: "heavy-duty", category: "crane" }),
  ).toEqual([]);
  expect(
    mobilityFeeRows({ ...draft, type: "hire", businessType: "individual" }),
  ).toEqual([]);
});
