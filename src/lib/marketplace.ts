import { paths } from "./categories";
export const marketplaceLinks = [
  { href: "/hire", label: "Vehicle hire", description: "Cars, SUVs and vans" },
  {
    href: "/heavy-duty",
    label: "Heavy-duty hire",
    description: "Large vehicles and equipment",
  },
  {
    href: "/commercial",
    label: "Commercial",
    description: "Trucks, buses and transport",
  },
  {
    href: "/logistics",
    label: "Logistics",
    description: "Goods and vehicle movement",
  },
  {
    href: "/bike-pickup",
    label: "Bike pickups",
    description: "Plan a local pickup",
  },
] as const;
export const productName: string = "Mobility";
export const searchDestination = "/hire";

export function categoryLinks(href: string): { href: string; label: string }[] {
  const kind = href.slice(1) as keyof typeof paths;
  const path = paths[kind];
  return path
    ? path.categories.map(([slug, label]) => ({
        href: `${href}?category=${encodeURIComponent(slug)}`,
        label,
      }))
    : [];
}

export const listingAction = {
  href: "/list",
  label: "List your offering",
} as const;
