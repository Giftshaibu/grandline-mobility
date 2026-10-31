import { z } from "zod";
import { ApiError, businessRequest, uploadResponse } from "./business-api";
export type PhotoSlot = { id: string; uploaded: boolean };
export async function saveApplicationPhotos(
  id: string,
  files: File[],
  slots: Map<File, PhotoSlot>,
  token: string,
) {
  for (const [file, slot] of slots) {
    if (!files.includes(file)) {
      await businessRequest(
        `/mobility/applications/${id}/media/${slot.id}`,
        z.unknown(),
        token,
        "DELETE",
      );
      slots.delete(file);
    }
  }
  for (const file of files) {
    let slot = slots.get(file);
    if (slot?.uploaded) continue;
    let url: string;
    if (slot) {
      // A prior PUT may have succeeded even if its response or completion request
      // was lost. Verify the stored object before trying another non-upsert PUT.
      try {
        await businessRequest(
          `/mobility/applications/${id}/media/${slot.id}/complete`,
          z.unknown(),
          token,
          "POST",
          {},
        );
        slot.uploaded = true;
        continue;
      } catch (error) {
        if (!(error instanceof ApiError) || error.code !== "PHOTO_NOT_READY")
          throw error;
      }
      url = (
        await businessRequest(
          `/mobility/applications/${id}/media/${slot.id}/upload`,
          z.object({ upload: z.object({ url: z.string().url() }) }),
          token,
          "POST",
          {},
        )
      ).upload.url;
    } else {
      const reserved = await businessRequest(
        `/mobility/applications/${id}/media`,
        uploadResponse,
        token,
        "POST",
        { filename: file.name, mimeType: file.type, sizeBytes: file.size },
      );
      slot = { id: reserved.media.id, uploaded: false };
      slots.set(file, slot);
      url = reserved.upload.url;
    }
    const body = new FormData();
    body.append("cacheControl", "3600");
    body.append("", file);
    const response = await fetch(url, {
      method: "PUT",
      headers: { "x-upsert": "false" },
      body,
    });
    if (!response.ok)
      throw new Error(
        "Photo upload failed. Save again to check and retry this reserved photo.",
      );
    await businessRequest(
      `/mobility/applications/${id}/media/${slot.id}/complete`,
      z.unknown(),
      token,
      "POST",
      {},
    );
    slot.uploaded = true;
  }
}
