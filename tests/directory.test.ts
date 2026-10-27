import { describe, it, expect, vi } from "vitest";
import { createHttpGateway, directory } from "../src/lib/directory";
import {
  normalizeSearch,
  searchString,
  enquirySchema,
  entrySchema,
} from "../src/lib/contracts";
import { publicUrl } from "../src/lib/config";
const base = "https://api.example.test";
const enquiry = {
  listingId: "12345678-1234-4234-8234-123456789012",
  name: "Customer",
  email: "customer@example.test",
  message: "Please share the service details.",
};
describe("disabled production gateway", () => {
  it("never calls any proposed endpoints", async () => {
    const spy = vi.spyOn(globalThis, "fetch");
    expect(await directory.list({})).toEqual({ state: "unavailable" });
    expect(await directory.detail("example")).toEqual({ state: "unavailable" });
    expect(await directory.categories()).toEqual({ state: "unavailable" });
    expect(await directory.enquire(enquiry, "token")).toEqual({
      state: "unavailable",
    });
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
describe("search and configuration", () => {
  it("round-trips URL criteria and removes unrelated or empty fields", () => {
    const search = normalizeSearch({
      q: " engine ",
      location: "Lilongwe",
      category: "",
      admin: "true",
    });
    expect(
      normalizeSearch(
        Object.fromEntries(new URLSearchParams(searchString(search))),
      ),
    ).toEqual(search);
    expect(search).toEqual({ q: "engine", location: "Lilongwe" });
  });
  it("rejects invalid search values without crashing", () => {
    expect(normalizeSearch({ q: [], location: "a".repeat(121) })).toEqual({});
  });
  it("hides blank destinations and rejects unsafe URLs", () => {
    expect(publicUrl("")).toBeUndefined();
    expect(() => publicUrl("javascript:alert(1)")).toThrow();
    expect(() => publicUrl("https://user:pass@example.test")).toThrow();
  });
});
describe("proposed adapter failure semantics", () => {
  it("distinguishes successful empty results", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ items: [], nextCursor: null })),
      );
    const result = await createHttpGateway(base, fetcher).list({ q: "repair" });
    expect(result).toEqual({
      state: "ready",
      data: { items: [], nextCursor: null },
    });
    expect(fetcher.mock.calls[0]?.[0]).toContain("q=repair");
  });
  it("carries pagination cursor and kind", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ items: [], nextCursor: "next" })),
      );
    await createHttpGateway(base, fetcher).list(
      {},
      "hire",
      undefined,
      "cursor",
    );
    expect(fetcher.mock.calls[0]?.[0]).toContain("cursor=cursor");
    expect(fetcher.mock.calls[0]?.[0]).toContain("kind=hire");
  });
  it.each([
    [401, "unauthorized"],
    [403, "unauthorized"],
    [429, "rate-limit"],
    [500, "server"],
  ])("maps HTTP %s", async (status, reason) => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response("", { status: Number(status) }));
    expect(await createHttpGateway(base, fetcher).list({})).toEqual({
      state: "error",
      reason,
    });
  });
  it("handles a missing detail", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response("", { status: 404 }));
    expect(await createHttpGateway(base, fetcher).detail("missing")).toEqual({
      state: "not-found",
    });
  });
  it("distinguishes malformed and network failures", async () => {
    expect(
      await createHttpGateway(
        base,
        vi.fn().mockResolvedValue(new Response("{}")),
      ).list({}),
    ).toEqual({ state: "error", reason: "invalid-response" });
    expect(
      await createHttpGateway(
        base,
        vi.fn().mockRejectedValue(new TypeError("offline")),
      ).list({}),
    ).toEqual({ state: "error", reason: "network" });
  });
  it("requires authentication and validates before transmitting enquiries", async () => {
    const fetcher = vi.fn();
    const gateway = createHttpGateway(base, fetcher);
    expect(await gateway.enquire(enquiry, "")).toEqual({
      state: "error",
      reason: "unauthorized",
    });
    expect(
      await gateway.enquire({ ...enquiry, message: "x" }, "token"),
    ).toEqual({ state: "error", reason: "invalid-response" });
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("only confirms validated successful enquiry receipts", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ id: enquiry.listingId, status: "submitted" }),
        ),
      );
    expect(
      (await createHttpGateway(base, fetcher).enquire(enquiry, "session-token"))
        .state,
    ).toBe("ready");
    expect(fetcher.mock.calls[0]?.[1].headers.authorization).toBe(
      "Bearer session-token",
    );
  });
  it("aborts stale requests", async () => {
    const abort = new AbortController();
    abort.abort();
    const fetcher = vi
      .fn()
      .mockRejectedValue(new DOMException("Aborted", "AbortError"));
    await expect(
      createHttpGateway(base, fetcher).list({}, undefined, abort.signal),
    ).rejects.toThrow("Aborted");
  });
  it("validates enquiry fields and rejects unsafe profile media", () => {
    expect(enquirySchema.safeParse({ ...enquiry, email: "bad" }).success).toBe(
      false,
    );
    expect(
      enquirySchema.safeParse({ ...enquiry, message: "short" }).success,
    ).toBe(false);
    expect(
      entrySchema.safeParse({ images: ["javascript:alert(1)"] }).success,
    ).toBe(false);
  });
});
