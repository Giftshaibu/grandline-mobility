import { useState } from "react";
import { z } from "zod";
import { businessRequest } from "../lib/business-api";
import { malawiToUtc } from "../lib/ride-draft";
export function StaffRideAssignment({
  reason,
  token,
  act,
  setMessage,
}: {
  reason: string;
  token: () => Promise<string>;
  act: (action: string, body: Record<string, unknown>) => Promise<void>;
  setMessage: (message: string) => void;
}) {
  const [applicationId, setApplicationId] = useState("");
  const [drivers, setDrivers] = useState<{ id: string; name: string }[]>([]),
    [vehicles, setVehicles] = useState<{ id: string; label: string }[]>([]);
  return (
    <>
      <h3>Assign an approved driver and vehicle</h3>
      <label>
        Approved operator application ID
        <input
          value={applicationId}
          onChange={(event) => setApplicationId(event.target.value)}
        />
      </label>
      <button
        type="button"
        className="button secondary"
        onClick={() => {
          void (async () => {
            try {
              z.string().uuid().parse(applicationId);
              const result = await businessRequest(
                `/staff/rides/resources/${applicationId}`,
                z.object({
                  drivers: z.array(
                    z.object({
                      id: z.string(),
                      name: z.string(),
                      status: z.string(),
                    }),
                  ),
                  vehicles: z.array(
                    z.object({
                      id: z.string(),
                      label: z.string(),
                      status: z.string(),
                    }),
                  ),
                }),
                await token(),
              );
              setDrivers(
                result.drivers.filter((row) => row.status === "approved"),
              );
              setVehicles(
                result.vehicles.filter((row) => row.status === "approved"),
              );
            } catch (error) {
              setMessage(
                error instanceof Error
                  ? error.message
                  : "Resources unavailable.",
              );
            }
          })();
        }}
      >
        Load operator resources
      </button>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          try {
            const form = new FormData(event.currentTarget);
            void act("assign", {
              driverId: form.get("driverId"),
              vehicleId: form.get("vehicleId"),
              startsAt: malawiToUtc(String(form.get("startsAt"))),
              endsAt: malawiToUtc(String(form.get("endsAt"))),
            });
          } catch (error) {
            setMessage(String(error));
          }
        }}
      >
        <label>
          Driver
          <select name="driverId" required>
            <option value="">Choose an approved driver</option>
            {drivers.map((row) => (
              <option key={row.id} value={row.id}>
                {row.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Vehicle
          <select name="vehicleId" required>
            <option value="">Choose an approved vehicle</option>
            {vehicles.map((row) => (
              <option key={row.id} value={row.id}>
                {row.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Operational window starts (Malawi time)
          <input name="startsAt" type="datetime-local" required />
        </label>
        <label>
          Operational window ends (Malawi time)
          <input name="endsAt" type="datetime-local" required />
        </label>
        <p>
          The window must include pickup and reserve enough time to prevent
          conflicting assignments. It is not a promised arrival time.
        </p>
        <button
          type="submit"
          className="button"
          disabled={!reason.trim() || !drivers.length || !vehicles.length}
        >
          Confirm assignment
        </button>
      </form>
    </>
  );
}
