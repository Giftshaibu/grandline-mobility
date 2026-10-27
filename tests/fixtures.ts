// Isolated test fixtures. Never import from application source.
export const provider = {
  id: "12345678-1234-4234-8234-123456789012",
  slug: "fixture-provider",
  name: "Fixture Workshop",
  description: "Test-only provider description",
  location: "Lilongwe",
  serviceArea: ["Lilongwe"],
  images: [],
  contact: {},
};
export const hire = {
  id: "22345678-1234-4234-8234-123456789012",
  slug: "fixture-hire",
  kind: "hire" as const,
  title: "Fixture hire vehicle",
  description: "Test-only rental entry",
  location: "Lilongwe",
  category: "car",
  images: [],
  provider,
  passengerCapacity: 5,
  price: { amount: 50000, currency: "MWK" as const, unit: "day" as const },
};
export const commercial = {
  ...hire,
  kind: "commercial" as const,
  title: "Fixture commercial vehicle",
  cargoCapacityKg: 3000,
};
export const logistics = {
  id: hire.id,
  slug: "fixture-logistics",
  kind: "logistics" as const,
  title: "Fixture transport",
  description: "Test-only logistics entry",
  location: "Mzuzu",
  category: "goods",
  images: [],
  provider,
  serviceAreas: ["Mzuzu", "Lilongwe"],
};
