import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
vi.mock("../src/lib/business-api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../src/lib/business-api")>()),
  businessRequest: vi.fn(),
}));
import { businessRequest, ApiError } from "../src/lib/business-api";
import {
  saveApplicationPhotos,
  type PhotoSlot,
} from "../src/lib/save-application-photos";
const request = vi.mocked(businessRequest);
const id = "12345678-1234-4234-8234-123456789012";
beforeEach(() => {
  request.mockReset();
});
afterEach(() => vi.restoreAllMocks());
const file = () => new File(["photo"], "photo.jpg", { type: "image/jpeg" });
describe("explicit scoped photo saving", () => {
  it("uploads only to the signed URL without forwarding the Clerk token", async () => {
    const photo = file();
    const slots = new Map<File, PhotoSlot>();
    request
      .mockResolvedValueOnce({
        media: { id },
        upload: { url: "https://storage.example.test/signed" },
      })
      .mockResolvedValueOnce({});
    const fetcher = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("{}"));
    await saveApplicationPhotos(id, [photo], slots, "private-token");
    expect(slots.get(photo)?.uploaded).toBe(true);
    expect(fetcher).toHaveBeenCalledWith(
      "https://storage.example.test/signed",
      expect.objectContaining({
        method: "PUT",
        headers: { "x-upsert": "false" },
        body: expect.any(FormData),
      }),
    );
    expect(JSON.stringify(fetcher.mock.calls)).not.toContain("private-token");
  });
  it("recovers a completed storage upload after a lost response without uploading twice", async () => {
    const photo = file();
    const slots = new Map([[photo, { id, uploaded: false }]]);
    request.mockResolvedValueOnce({});
    const fetcher = vi.spyOn(globalThis, "fetch");
    await saveApplicationPhotos(id, [photo], slots, "token");
    expect(fetcher).not.toHaveBeenCalled();
    expect(slots.get(photo)?.uploaded).toBe(true);
    expect(request.mock.calls[0]?.[0]).toContain("/complete");
  });
  it("retries a reserved but missing storage object using its existing slot", async () => {
    const photo = file();
    const slots = new Map([[photo, { id, uploaded: false }]]);
    request
      .mockRejectedValueOnce(
        new ApiError(409, "PHOTO_NOT_READY", "Not uploaded"),
      )
      .mockResolvedValueOnce({
        upload: { url: "https://storage.example.test/retry" },
      })
      .mockResolvedValueOnce({});
    const fetcher = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("{}"));
    await saveApplicationPhotos(id, [photo], slots, "token");
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(request.mock.calls.some((call) => call[0].endsWith("/media"))).toBe(
      false,
    );
    expect(slots.get(photo)?.uploaded).toBe(true);
  });
  it("preserves the pending slot on provider failure and does not report success", async () => {
    const photo = file();
    const slots = new Map<File, PhotoSlot>();
    request.mockResolvedValueOnce({
      media: { id },
      upload: { url: "https://storage.example.test/signed" },
    });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("{}", { status: 500 }),
    );
    await expect(
      saveApplicationPhotos(id, [photo], slots, "token"),
    ).rejects.toThrow("Photo upload failed");
    expect(slots.get(photo)?.uploaded).toBe(false);
  });
  it("does not bypass ownership errors while retrying", async () => {
    const photo = file();
    request.mockRejectedValueOnce(
      new ApiError(404, "APPLICATION_NOT_FOUND", "Not found"),
    );
    const fetcher = vi.spyOn(globalThis, "fetch");
    await expect(
      saveApplicationPhotos(
        id,
        [photo],
        new Map([[photo, { id, uploaded: false }]]),
        "token",
      ),
    ).rejects.toThrow("Not found");
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("retires only local slots explicitly removed before this save", async () => {
    const photo = file();
    const slots = new Map([[photo, { id, uploaded: true }]]);
    request.mockResolvedValueOnce({});
    await saveApplicationPhotos(id, [], slots, "token");
    expect(slots.size).toBe(0);
    expect(request.mock.calls[0]?.[3]).toBe("DELETE");
    expect(request.mock.calls[0]?.[0]).toContain(`/media/${id}`);
  });
});
