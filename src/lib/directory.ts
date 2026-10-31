import { apiBaseUrl, liveMobility } from "./config";
import { z } from "zod";
import {
  entrySchema,
  categorySchema,
  pageSchema,
  enquirySchema,
  enquiryReceiptSchema,
  searchString,
  type DirectorySearch,
  type Enquiry,
} from "./contracts";
export type Result<T> =
  | { state: "ready"; data: T }
  | { state: "unavailable" }
  | { state: "not-found" }
  | {
      state: "error";
      reason:
        | "network"
        | "invalid-response"
        | "unauthorized"
        | "rate-limit"
        | "server";
    };
export type Kind =
  | "hire"
  | "heavy-duty"
  | "commercial"
  | "logistics"
  | "bike-operator"
  | "taxi-operator";
type Page = z.infer<typeof pageSchema>;
type Entry = z.infer<typeof entrySchema>;
export interface DirectoryGateway {
  readonly supported: boolean;
  categories(
    signal?: AbortSignal,
  ): Promise<Result<z.infer<typeof categorySchema>[]>>;
  list(
    search: DirectorySearch,
    kind?: Kind,
    signal?: AbortSignal,
    cursor?: string,
  ): Promise<Result<Page>>;
  detail(
    slug: string,
    kind?: Kind,
    signal?: AbortSignal,
  ): Promise<Result<Entry>>;
  enquire(
    input: Enquiry,
    token: string,
    signal?: AbortSignal,
  ): Promise<Result<z.infer<typeof enquiryReceiptSchema>>>;
}
// Production deliberately has no HTTP gateway until the backend contracts exist.
const unavailableDirectory: DirectoryGateway = {
  supported: false,
  categories: async () => ({ state: "unavailable" }),
  list: async () => ({ state: "unavailable" }),
  detail: async () => ({ state: "unavailable" }),
  enquire: async () => ({ state: "unavailable" }),
};
export const directory = liveMobility
  ? createHttpGateway(apiBaseUrl!, (...args) => fetch(...args))
  : unavailableDirectory;
// Isolated adapter for contract verification. Importing it makes no requests.
export function createHttpGateway(
  baseUrl: string,
  transport: typeof fetch,
): DirectoryGateway {
  const base = new URL(baseUrl);
  if (
    !["http:", "https:"].includes(base.protocol) ||
    base.username ||
    base.password
  )
    throw new Error("Invalid API URL");
  async function request<T>(
    path: string,
    schema: z.ZodType<T, z.ZodTypeDef, unknown>,
    signal?: AbortSignal,
    body?: Enquiry,
    token?: string,
  ): Promise<Result<T>> {
    try {
      if (body) enquirySchema.parse(body);
      const capability = await transport(
        baseUrl.replace(/\/$/, "") + "/api/v1/capabilities",
        { ...(signal ? { signal } : {}) },
      );
      if (capability.status === 503) return { state: "unavailable" };
      if (!capability.ok)
        return {
          state: "error",
          reason:
            capability.status === 401 || capability.status === 403
              ? "unauthorized"
              : capability.status === 429
                ? "rate-limit"
                : "server",
        };
      let capabilityData: unknown;
      try {
        capabilityData = await capability.json();
      } catch {
        return { state: "error", reason: "invalid-response" };
      }
      const flags = z
        .object({
          mobility: z.object({
            discovery: z.boolean(),
            enquiries: z.boolean(),
          }),
        })
        .parse(capabilityData);
      if (!flags.mobility.discovery || (body && !flags.mobility.enquiries))
        return { state: "unavailable" };
      const response = await transport(baseUrl.replace(/\/$/, "") + path, {
        ...(signal ? { signal } : {}),
        ...(body
          ? {
              method: "POST",
              body: JSON.stringify(enquirySchema.parse(body)),
              headers: {
                "content-type": "application/json",
                authorization: `Bearer ${token}`,
              },
            }
          : {}),
      });
      if (response.status === 503) return { state: "unavailable" };
      if (response.status === 404) return { state: "not-found" };
      if (!response.ok)
        return {
          state: "error",
          reason:
            response.status === 401 || response.status === 403
              ? "unauthorized"
              : response.status === 429
                ? "rate-limit"
                : "server",
        };
      try {
        return { state: "ready", data: schema.parse(await response.json()) };
      } catch {
        return { state: "error", reason: "invalid-response" };
      }
    } catch (error) {
      if (signal?.aborted) throw error;
      return {
        state: "error",
        reason: error instanceof z.ZodError ? "invalid-response" : "network",
      };
    }
  }
  const root = "/api/v1/mobility";
  return {
    supported: true,
    categories: (signal) =>
      request(
        `${root}/categories`,
        z
          .array(
            z.object({ type: z.string(), categories: z.array(z.string()) }),
          )
          .transform((rows) =>
            [...new Set(rows.flatMap((row) => row.categories))].map((slug) => ({
              slug,
              name: slug.replaceAll("-", " "),
            })),
          ),
        signal,
      ),
    list: (search, kind, signal, cursor) => {
      const query = new URLSearchParams(searchString(search));

      if (cursor) query.set("cursor", cursor);
      query.set("limit", "20");
      return request(
        `${root}/catalogue/${kind ?? "hire"}?${query}`,
        pageSchema,
        signal,
      );
    },
    detail: (slug, kind, signal) =>
      request(
        `${root}/catalogue/${kind ?? "hire"}/${encodeURIComponent(slug)}`,
        entrySchema,
        signal,
      ),
    enquire: (input, token, signal) =>
      token.trim()
        ? request(
            `${root}/enquiries`,
            enquiryReceiptSchema,
            signal,
            input,
            token,
          )
        : Promise.resolve({ state: "error", reason: "unauthorized" }),
  };
}
