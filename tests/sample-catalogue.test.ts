import { it, expect } from "vitest";
import {
  sampleEntries,
  sampleResults,
  sampleDetail,
} from "../src/lib/sample-catalogue";
import { directory } from "../src/lib/directory";
it("filters illustrative inventory by kind, category and location", () => {
  expect(
    sampleResults({ category: "car", location: "lilongwe" }, "hire"),
  ).toHaveLength(1);
  expect(sampleResults({ q: "impossible" }, "hire")).toEqual([]);
  expect(sampleResults({}, "heavy-duty")).toHaveLength(6);
});
it("resolves only exact sample slug and kind without changing live support", () => {
  expect(sampleDetail("sample-hire-car-0", "hire")?.title).toMatch(/^Example/);
  expect(sampleDetail("sample-hire-car-0", "logistics")).toBeUndefined();
  expect(directory.supported).toBe(false);
  expect(
    sampleEntries.every(
      (entry) =>
        entry.slug.startsWith("sample-") &&
        Object.keys(entry.provider.contact).length === 0,
    ),
  ).toBe(true);
});
