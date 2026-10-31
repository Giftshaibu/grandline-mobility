export function publicUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const url = new URL(value.trim());
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password
  )
    throw new Error("Use a public HTTP(S) URL without credentials.");
  return url.toString().replace(/\/$/, "");
}
export const ecosystem = [
  { label: "Auto Hub", url: publicUrl(import.meta.env["VITE_HUB_URL"]) },
  { label: "Services", url: publicUrl(import.meta.env["VITE_SERVICES_URL"]) },
  { label: "Mobility", url: publicUrl(import.meta.env["VITE_MOBILITY_URL"]) },
];
export const apiBaseUrl = publicUrl(import.meta.env["VITE_API_BASE_URL"]);
export const clerkKey =
  import.meta.env["VITE_CLERK_PUBLISHABLE_KEY"]?.trim() || "";

export function integrationFlag(value: unknown) {
  if (value === undefined || value === "" || value === "false") return false;
  if (value === "true") return true;
  throw new Error("Integration flags must be true or false.");
}
export const liveMobility = integrationFlag(
  import.meta.env["VITE_MOBILITY_LIVE"],
);
export const liveRides = integrationFlag(import.meta.env["VITE_RIDES_LIVE"]);
if ((liveMobility || liveRides) && !apiBaseUrl)
  throw new Error("Live integrations require VITE_API_BASE_URL.");
