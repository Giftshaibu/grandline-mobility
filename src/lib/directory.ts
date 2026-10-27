import { z } from "zod";
import {
  entrySchema,
  pageSchema,
  categorySchema,
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
export type Kind = "hire" | "commercial" | "logistics";
type Page = z.infer<typeof pageSchema>;
type Entry = z.infer<typeof entrySchema>;
export interface DirectoryGateway {
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
export const directory: DirectoryGateway = {
  categories: async () => ({ state: "unavailable" }),
  list: async () => ({ state: "unavailable" }),
  detail: async () => ({ state: "unavailable" }),
  enquire: async () => ({ state: "unavailable" }),
};
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
    categories: (signal) =>
      request(`${root}/categories`, z.array(categorySchema), signal),
    list: (search, kind, signal, cursor) => {
      const query = new URLSearchParams(searchString(search));
      if (kind) query.set("kind", kind);
      if (cursor) query.set("cursor", cursor);
      query.set("limit", "20");
      return request(`${root}?${query}`, pageSchema, signal);
    },
    detail: (slug, kind, signal) =>
      request(
        `${root}/${encodeURIComponent(slug)}${kind ? `?kind=${kind}` : ""}`,
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
