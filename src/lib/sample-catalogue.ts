import type { Entry, DirectorySearch } from "./contracts";
import type { Kind } from "./directory";
const provider = {
  id: "00000000-0000-4000-8000-000000000001",
  slug: "sample-transport-provider",
  name: "Example transport provider",
  description:
    "Illustrative provider profile for browsing this sample catalogue. This is not a real business or an available service.",
  location: "Lilongwe",
  serviceArea: [],
  images: [],
  contact: {},
};
export const sampleEntries: Entry[] = [
  ...(["car", "suv", "van"] as const).flatMap((category, index) =>
    ["Lilongwe", "Blantyre"].map((location, city) => ({
      id: `00000000-0000-4000-8000-${String(index * 2 + city + 10).padStart(12, "0")}`,
      slug: `sample-hire-${category}-${city}`,
      kind: "hire" as const,
      title: `Example ${category === "suv" ? "SUV" : category === "van" ? "passenger van" : "city car"}`,
      description:
        "A sample hire listing showing how vehicle details, hire terms and provider information will appear. Not available to hire.",
      location,
      category,
      images: ["/marketplace-road.jpg"],
      provider,
      passengerCapacity: category === "van" ? 12 : 5,
      price: {
        amount: 45000 + index * 25000,
        currency: "MWK" as const,
        unit: "day" as const,
      },
      terms:
        "Illustrative terms only. No hire or payment can be arranged from this sample.",
    })),
  ),
  ...(
    ["lorry", "tipper", "excavator", "loader", "crane", "tractor"] as const
  ).map((category, index) => ({
    id: `00000000-0000-4000-8000-${String(index + 30).padStart(12, "0")}`,
    slug: `sample-heavy-duty-${category}`,
    kind: "heavy-duty" as const,
    title: `Example ${category}`,
    description:
      "Sample heavy-duty listing. Capacity, equipment details and operator information illustrate the catalogue layout, not actual availability.",
    location: index % 2 ? "Blantyre" : "Lilongwe",
    category,
    images: ["/marketplace-truck.jpg"],
    provider,
    vehicleType: category,
    ...(category === "lorry" || category === "tipper"
      ? { cargoCapacityKg: 12000 }
      : {}),
    operatorIncluded: true,
    terms:
      "Request terms from a real provider once the directory is connected.",
  })),
  ...(["truck", "van", "bus"] as const).map((category, index) => ({
    id: `00000000-0000-4000-8000-${String(index + 40).padStart(12, "0")}`,
    slug: `sample-commercial-${category}`,
    kind: "commercial" as const,
    title: `Example commercial ${category}`,
    description:
      "An illustrative commercial transport listing for exploring vehicle and provider details. No transport is available from this sample.",
    location: "Mzuzu",
    category,
    images: ["/marketplace-truck.jpg"],
    provider,
    terms: "Sample terms. No reservation or payment is possible.",
  })),
  ...(["goods", "vehicle-movement", "dealer-stock"] as const).map(
    (category, index) => ({
      id: `00000000-0000-4000-8000-${String(index + 50).padStart(12, "0")}`,
      slug: `sample-logistics-${category}`,
      kind: "logistics" as const,
      title: `Example ${category.replaceAll("-", " ")} service`,
      description:
        "Illustrative logistics profile. This sample does not represent a real transporter, delivery coverage or availability.",
      location: "Lilongwe",
      category,
      images: ["/marketplace-truck.jpg"],
      provider,
      serviceAreas: ["Lilongwe", "Blantyre"],
    }),
  ),
];
export function sampleResults(search: DirectorySearch, kind: Kind) {
  return sampleEntries.filter(
    (entry) =>
      entry.kind === kind &&
      (!search.category || entry.category === search.category) &&
      (!search.location ||
        entry.location.toLowerCase().includes(search.location.toLowerCase())) &&
      (!search.q ||
        `${entry.title} ${entry.description} ${entry.category}`
          .toLowerCase()
          .includes(search.q.toLowerCase())),
  );
}
export function sampleDetail(slug: string, kind: Kind) {
  return sampleEntries.find(
    (entry) => entry.slug === slug && entry.kind === kind,
  );
}
