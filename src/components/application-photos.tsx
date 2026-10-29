import { useEffect, useState } from "react";
export const photoMaximumBytes = 12 * 1024 * 1024;
export function validateApplicationPhotos(files: File[]) {
  if (files.length > 8) return "Choose no more than eight photos.";
  if (
    files.some(
      (file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type),
    )
  )
    return "Use JPEG, PNG or WebP photos.";
  if (files.some((file) => file.size < 1 || file.size > photoMaximumBytes))
    return "Each photo must be nonempty and 12 MB or smaller.";
  return null;
}
export function useApplicationPhotos() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ name: string; url: string }[]>([]);
  useEffect(() => {
    const next = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setPreviews(next);
    const revoke = () =>
      next.forEach((photo) => URL.revokeObjectURL(photo.url));
    window.addEventListener("pagehide", revoke);
    return () => {
      window.removeEventListener("pagehide", revoke);
      revoke();
    };
  }, [files]);
  return { files, setFiles, previews };
}
export function ApplicationPhotos({
  files,
  previews,
  onChange,
}: {
  files: File[];
  previews: { name: string; url: string }[];
  onChange: (files: File[]) => void;
}) {
  const [error, setError] = useState("");
  return (
    <div>
      <h3>Photos are optional</h3>
      <p className="muted">
        Up to eight JPEG, PNG or WebP images, each up to 12 MB. Files stay in
        this browser tab and are never uploaded.
      </p>
      <label className="photo-input">
        Choose photos
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          aria-invalid={!!error}
          aria-describedby="photo-feedback"
          onChange={(event) => {
            const next = [
              ...files,
              ...Array.from(event.currentTarget.files ?? []),
            ];
            const invalid = validateApplicationPhotos(next);
            setError(invalid ?? "");
            if (!invalid) onChange(next);
            event.currentTarget.value = "";
          }}
        />
      </label>
      <p id="photo-feedback" role={error ? "alert" : "status"}>
        {error || `${files.length} of 8 photos selected`}
      </p>
      <PhotoGallery
        previews={previews}
        remove={(index) => {
          onChange(files.filter((_, item) => index !== item));
          setError("");
        }}
      />
    </div>
  );
}
export function PhotoGallery({
  previews,
  remove,
}: {
  previews: { name: string; url: string }[];
  remove?: ((index: number) => void) | undefined;
}) {
  return previews.length ? (
    <ul className="application-photos">
      {previews.map((photo, index) => (
        <li key={photo.url}>
          <img
            src={photo.url}
            alt={`Selected photo ${index + 1}: ${photo.name}`}
          />
          <span>{photo.name}</span>
          {remove && (
            <button
              type="button"
              className="text-action"
              onClick={() => remove(index)}
              aria-label={`Remove photo ${index + 1}`}
            >
              Remove
            </button>
          )}
        </li>
      ))}
    </ul>
  ) : (
    <p className="muted">No photos selected.</p>
  );
}
