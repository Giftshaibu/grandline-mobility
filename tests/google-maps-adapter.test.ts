import { it, expect, vi, afterEach } from "vitest";
import {
  attachGoogleMap,
  attachPlaceSearch,
} from "../src/lib/google-maps-adapter";
const globals = window as unknown as Record<string, unknown>;
afterEach(() => {
  delete globals["google"];
  delete globals["grandlineMapsReady"];
  delete globals["gm_authFailure"];
  document
    .querySelectorAll('script[src*="maps.googleapis.com"]')
    .forEach((node) => node.remove());
});
it("reports Google authentication failures even after the SDK callback resolves", async () => {
  const failed = vi.fn();
  const connecting = attachGoogleMap(
    document.createElement("div"),
    "isolated-test-key",
    vi.fn(),
    failed,
  );
  expect(
    document
      .querySelector('script[src*="maps.googleapis.com"]')
      ?.getAttribute("src"),
  ).toContain("callback=grandlineMapsReady");
  globals["google"] = {
    maps: {
      importLibrary: async () => ({}),
      Map: class {
        addListener() {
          return { remove: vi.fn() };
        }
        setCenter() {}
        setZoom() {}
      },
      Circle: class {
        setMap() {}
      },
    },
  };
  (globals["grandlineMapsReady"] as () => void)();
  const handle = await connecting;
  (globals["gm_authFailure"] as () => void)();
  expect(failed).toHaveBeenCalledWith(
    "Map search is unavailable. Typed addresses and landmarks still work.",
  );
  handle.dispose();
});
it("uses the New autocomplete widget event, minimal place fields and disposable listeners", async () => {
  const node = document.createElement("div"),
    widget = document.createElement("div"),
    selected = vi.fn(),
    failed = vi.fn(),
    fetchFields = vi.fn().mockResolvedValue({});
  const Widget = vi.fn().mockImplementation(function () {
    return widget;
  });
  globals["google"] = {
    maps: {
      importLibrary: async () => ({}),
      places: { PlaceAutocompleteElement: Widget },
    },
  };
  const dispose = await attachPlaceSearch(
    node,
    "isolated-test-key",
    "Search pickup",
    selected,
    failed,
  );
  const event = new Event("gmp-select");
  Object.assign(event, {
    placePrediction: {
      toPlace: () => ({
        id: "fixture-place",
        formattedAddress: "Fixture address",
        location: { lat: () => -11.4, lng: () => 34 },
        fetchFields,
      }),
    },
  });
  widget.dispatchEvent(event);
  await Promise.resolve();
  await Promise.resolve();
  expect(fetchFields).toHaveBeenCalledWith({
    fields: ["id", "formattedAddress", "location"],
  });
  expect(selected).toHaveBeenCalledWith({
    address: "Fixture address",
    landmark: "",
    placeId: "fixture-place",
    lat: -11.4,
    lng: 34,
  });
  dispose();
  widget.dispatchEvent(event);
  await Promise.resolve();
  expect(selected).toHaveBeenCalledTimes(1);
  expect(node.childNodes.length).toBe(0);
});
