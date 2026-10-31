import type { RideLocation } from "./ride-api";
type Point = { lat: number; lng: number };
type MapView = {
  setCenter: (point: Point) => void;
  setZoom: (zoom: number) => void;
  addListener: (
    event: string,
    fn: (event: { latLng?: { lat(): number; lng(): number } }) => void,
  ) => { remove(): void };
};
type Place = {
  id: string;
  formattedAddress?: string;
  location?: { lat(): number; lng(): number };
  fetchFields(input: { fields: string[] }): Promise<unknown>;
};
type SelectEvent = Event & { placePrediction: { toPlace(): Place } };
type Sdk = {
  maps: {
    Map: new (node: HTMLElement, options: Record<string, unknown>) => MapView;
    Circle: new (options: Record<string, unknown>) => {
      setMap(map: MapView | null): void;
    };
    importLibrary(name: string): Promise<unknown>;
    places: {
      PlaceAutocompleteElement: new (
        options: Record<string, unknown>,
      ) => HTMLElement;
    };
  };
};
type GoogleWindow = Window & {
  google?: Sdk;
  grandlineMapsReady?: () => void;
  gm_authFailure?: () => void;
};
let pending: Promise<Sdk> | undefined;
const failureListeners = new Set<(message: string) => void>();
export function loadGoogleMaps(key: string): Promise<Sdk> {
  const win = window as GoogleWindow;
  if (win.google?.maps.importLibrary) return Promise.resolve(win.google);
  if (!key)
    return Promise.reject(
      new Error("Map search is not configured. Type your locations below."),
    );
  if (pending) return pending;
  pending = new Promise<Sdk>((resolve, reject) => {
    const script = document.createElement("script");
    const fail = () => {
      clearTimeout(timeout);
      script.remove();
      pending = undefined;
      failureListeners.forEach((listener) =>
        listener(
          "Map search is unavailable. Typed addresses and landmarks still work.",
        ),
      );
      reject(
        new Error(
          "Map search is unavailable. Typed addresses and landmarks still work.",
        ),
      );
    };
    const timeout = setTimeout(fail, 12000);
    win.gm_authFailure = fail;
    win.grandlineMapsReady = () => {
      clearTimeout(timeout);
      if (win.google) resolve(win.google);
      else fail();
    };
    script.src = `https://maps.googleapis.com/maps/api/js?${new URLSearchParams({ key, v: "weekly", loading: "async", callback: "grandlineMapsReady" })}`;
    script.async = true;
    script.onerror = fail;
    document.head.appendChild(script);
  });
  return pending;
}
export async function attachGoogleMap(
  node: HTMLElement,
  key: string,
  onPin: (point: Point) => void,
  failed: (message: string) => void = () => {},
) {
  let failedWhileLoading = false;
  const onFailure = (message: string) => {
    failedWhileLoading = true;
    failed(message);
  };
  failureListeners.add(onFailure);
  let sdk: Sdk;
  try {
    sdk = await loadGoogleMaps(key);
    await sdk.maps.importLibrary("maps");
    if (failedWhileLoading)
      throw new Error(
        "Map search is unavailable. Typed addresses and landmarks still work.",
      );
  } catch (error) {
    failureListeners.delete(onFailure);
    throw error;
  }
  const map = new sdk.maps.Map(node, {
    center: { lat: -13.2543, lng: 34.3015 },
    zoom: 7,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    gestureHandling: "cooperative",
  });
  const click = map.addListener("click", (event) => {
    if (event.latLng)
      onPin({ lat: event.latLng.lat(), lng: event.latLng.lng() });
  });
  let circles: { setMap(map: MapView | null): void }[] = [];
  return {
    points(locations: RideLocation[]) {
      circles.forEach((circle) => circle.setMap(null));
      circles = [];
      locations.forEach((location, index) => {
        if (location.lat === null || location.lng === null) return;
        const center = { lat: location.lat, lng: location.lng };
        circles.push(
          new sdk.maps.Circle({
            map,
            center,
            radius: 35,
            fillColor: index ? "#141414" : "#e21b23",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          }),
        );
        map.setCenter(center);
        map.setZoom(15);
      });
    },
    dispose() {
      failureListeners.delete(onFailure);
      click.remove();
      circles.forEach((circle) => circle.setMap(null));
      node.replaceChildren();
    },
  };
}
export async function attachPlaceSearch(
  node: HTMLElement,
  key: string,
  label: string,
  selected: (location: RideLocation) => void,
  failed: (message: string) => void,
) {
  const sdk = await loadGoogleMaps(key);
  await sdk.maps.importLibrary("places");
  // The New widget owns its autocomplete session tokens and attribution.
  const widget = new sdk.maps.places.PlaceAutocompleteElement({
    includedRegionCodes: ["mw"],
    requestedRegion: "mw",
    placeholder: label,
  });
  widget.setAttribute("aria-label", label);
  node.appendChild(widget);
  let disposed = false;
  const onSelect = async (event: Event) => {
    try {
      const place = (event as SelectEvent).placePrediction.toPlace();
      await place.fetchFields({
        fields: ["id", "formattedAddress", "location"],
      });
      if (!disposed)
        selected({
          address: place.formattedAddress ?? "",
          landmark: "",
          placeId: place.id,
          lat: place.location?.lat() ?? null,
          lng: place.location?.lng() ?? null,
        });
    } catch {
      if (!disposed)
        failed("Place search failed. Enter and confirm the address manually.");
    }
  };
  const error = () =>
    failed("Place search is unavailable. Use typed addresses instead.");
  widget.addEventListener("gmp-select", onSelect);
  widget.addEventListener("gmp-error", error);
  return () => {
    disposed = true;
    widget.removeEventListener("gmp-select", onSelect);
    widget.removeEventListener("gmp-error", error);
    widget.remove();
  };
}
