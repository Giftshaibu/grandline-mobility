import { useState } from "react";
export function LocationButton({
  onFound,
}: {
  onFound: (lat: number, lng: number) => void;
}) {
  const [message, setMessage] = useState("");
  return (
    <>
      <button
        type="button"
        className="text-action"
        onClick={() => {
          if (!navigator.geolocation) {
            setMessage(
              "Location is unavailable. Enter your pickup address manually.",
            );
            return;
          }
          setMessage("Waiting for your location permission…");
          navigator.geolocation.getCurrentPosition(
            (position) => {
              onFound(position.coords.latitude, position.coords.longitude);
              setMessage(
                "Pickup pin added. Enter or check the pickup address and landmark.",
              );
            },
            () =>
              setMessage(
                "Location could not be shared. Enter your pickup address manually.",
              ),
            { timeout: 10000, maximumAge: 0 },
          );
        }}
      >
        Use my location for pickup
      </button>
      {message && <p role="status">{message}</p>}
    </>
  );
}
