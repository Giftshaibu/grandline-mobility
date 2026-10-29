import { it, expect, vi, afterEach } from "vitest";
import {
  renderHook,
  act,
  render,
  screen,
  fireEvent,
} from "@testing-library/react";
import {
  validateApplicationPhotos,
  useApplicationPhotos,
  ApplicationPhotos,
  photoMaximumBytes,
} from "../src/components/application-photos";
afterEach(() => vi.unstubAllGlobals());
it("checks photo type, count, empty files and the 12 MB boundary", () => {
  const photo = new File(["x"], "photo.jpg", { type: "image/jpeg" });
  expect(validateApplicationPhotos(Array(8).fill(photo))).toBeNull();
  expect(validateApplicationPhotos(Array(9).fill(photo))).toMatch(/eight/);
  expect(
    validateApplicationPhotos([
      new File(["x"], "data.txt", { type: "text/plain" }),
    ]),
  ).toMatch(/JPEG/);
  expect(
    validateApplicationPhotos([
      new File([], "empty.png", { type: "image/png" }),
    ]),
  ).toMatch(/nonempty/);
  Object.defineProperty(photo, "size", {
    value: photoMaximumBytes,
    configurable: true,
  });
  expect(validateApplicationPhotos([photo])).toBeNull();
  Object.defineProperty(photo, "size", { value: photoMaximumBytes + 1 });
  expect(validateApplicationPhotos([photo])).toMatch(/12 MB/);
});
it("revokes object URLs when photos change and on unmount", () => {
  const original = URL;
  let index = 0;
  const revoke = vi.fn();
  class TestURL extends original {
    static createObjectURL = () => `blob:photo-${++index}`;
    static revokeObjectURL = revoke;
  }
  vi.stubGlobal("URL", TestURL);
  const { result, unmount } = renderHook(() => useApplicationPhotos());
  const photo = new File(["x"], "photo.jpg", { type: "image/jpeg" });
  act(() => result.current.setFiles([photo]));
  expect(result.current.previews[0]?.url).toBe("blob:photo-1");
  act(() => result.current.setFiles([]));
  expect(revoke).toHaveBeenCalledWith("blob:photo-1");
  act(() => result.current.setFiles([photo]));
  unmount();
  expect(revoke).toHaveBeenCalledWith("blob:photo-2");
});
it("rejects invalid additions without losing the selected files", () => {
  const change = vi.fn();
  render(<ApplicationPhotos files={[]} previews={[]} onChange={change} />);
  fireEvent.change(screen.getByLabelText("Choose photos"), {
    target: { files: [new File(["x"], "text.txt", { type: "text/plain" })] },
  });
  expect(screen.getByRole("alert")).toHaveTextContent("JPEG");
  expect(change).not.toHaveBeenCalled();
});

it("revokes local previews when the page is hidden for navigation", () => {
  const original = URL;
  const revoke = vi.fn();
  class TestURL extends original {
    static createObjectURL = () => "blob:navigation-photo";
    static revokeObjectURL = revoke;
  }
  vi.stubGlobal("URL", TestURL);
  const { result, unmount } = renderHook(() => useApplicationPhotos());
  act(() =>
    result.current.setFiles([
      new File(["x"], "image.png", { type: "image/png" }),
    ]),
  );
  act(() => window.dispatchEvent(new Event("pagehide")));
  expect(revoke).toHaveBeenCalledWith("blob:navigation-photo");
  unmount();
});
