import { z } from "zod";
import { apiBaseUrl } from "./config";
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}
export async function businessRequest<T>(
  path: string,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  token: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  if (!apiBaseUrl || !token.trim())
    throw new Error("Sign in before using business controls.");
  const response = await fetch(`${apiBaseUrl}/api/v1${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      ...(body === undefined ? {} : { "content-type": "application/json" }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    cache: "no-store",
  });
  if (!response.ok) {
    const result = (await response.json().catch(() => null)) as {
      error?: { code?: string; message?: string };
    } | null;
    throw new ApiError(
      response.status,
      result?.error?.code ?? "REQUEST_FAILED",
      result?.error?.message ?? "The request failed. Please retry.",
    );
  }
  let payload: unknown;
  try {
    payload = response.status === 204 ? {} : await response.json();
  } catch {
    throw new Error(
      "The server returned an unexpected response. No success has been assumed.",
    );
  }
  const parsed = schema.safeParse(payload);
  if (!parsed.success)
    throw new Error(
      "The server returned an unexpected response. No success has been assumed.",
    );
  return parsed.data;
}
export const mediaSchema = z.object({
  id: z.string().uuid(),
  originalFilename: z.string(),
  status: z.enum(["pending", "uploaded", "retired"]),
});
export const applicationSchema = z.object({
  publication: z
    .object({
      published: z.boolean(),
      revision: z.number().int(),
      slug: z.string(),
      kind: z.string().optional(),
    })
    .nullable()
    .optional(),
  id: z.string().uuid(),
  businessId: z.string().uuid(),
  version: z.number().int(),
  status: z.enum([
    "draft",
    "pending",
    "changes_requested",
    "approved",
    "rejected",
  ]),
  payload: z.record(z.unknown()),
  media: z.array(mediaSchema),
  events: z.array(
    z.object({
      action: z.string(),
      reason: z.string().nullable().optional(),
      createdAt: z.string(),
    }),
  ),
});
export type SavedApplication = z.infer<typeof applicationSchema>;
export const applicationResponse = z.object({ application: applicationSchema });
export const applicationPage = z.object({
  items: z.array(applicationSchema),
  nextCursor: z.string().nullable(),
});
export const businessPage = z.object({
  items: z.array(z.object({ id: z.string().uuid(), name: z.string() })),
  nextCursor: z.string().nullable(),
});
export const businessResponse = z.object({
  business: z.object({ id: z.string().uuid() }),
});
export const uploadResponse = z.object({
  media: mediaSchema,
  upload: z.object({ url: z.string().url(), expiresAt: z.string() }),
});
export const billingSchema = z.object({
  billing: z
    .object({
      agreedFee: z.number().nullable(),
      quoteVersion: z.number(),
      paidUntil: z.string().nullable(),
    })
    .nullable(),
  reviewRequired: z.boolean(),
  overdue: z.boolean(),
  categoryGuidance: z.array(
    z.object({ category: z.string(), monthlyFee: z.number().nullable() }),
  ),
  payments: z.array(
    z.object({
      id: z.string(),
      status: z.string(),
      reference: z.string(),
      method: z.string(),
      amount: z.number(),
    }),
  ),
  events: z.array(
    z.object({ action: z.string(), reason: z.string().nullable().optional() }),
  ),
  instructions: z.object({
    paymentAccounts: z.array(
      z.object({ method: z.string(), name: z.string(), account: z.string() }),
    ),
    contactPath: z.string(),
    message: z.string(),
  }),
});
export type Billing = z.infer<typeof billingSchema>;
