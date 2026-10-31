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
    href: "/ride",
    label: "Bike & taxi rides",
    description: "Request a staff-coordinated pickup",
  },
] as const;
export const productName: string = "Mobility";
export const searchDestination = "/hire";

export function categoryLinks(href: string): { href: string; label: string }[] {
  if (href === "/ride")
    return [
      { href: "/ride?type=bike", label: "Request a bike" },
      { href: "/ride?type=taxi", label: "Request a taxi" },
      { href: "/bike-operator", label: "Bike operator profiles" },
      { href: "/taxi-operator", label: "Taxi operator profiles" },
    ];
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
