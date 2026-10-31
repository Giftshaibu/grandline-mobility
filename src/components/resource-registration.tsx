import { z } from "zod";
import { businessRequest } from "../lib/business-api";
const resourceSchema = z.object({
  id: z.string().uuid(),
  status: z.string(),
  version: z.number(),
});
export function ResourceRegistration({
  id,
  busy,
  ready,
  run,
}: {
  id: string;
  busy: boolean;
  ready: boolean;
  run: (work: (token: string) => Promise<void>) => Promise<void>;
}) {
  return (
    <>
      {(["driver", "vehicle"] as const).map((kind) => (
        <details key={kind}>
          <summary>Register and approve a {kind}</summary>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!ready || busy) return;
              const input = Object.fromEntries(
                new FormData(event.currentTarget),
              );
              const { checked, ...values } = input;
              if (!checked) return;
              void run(async (token) => {
                await businessRequest(
                  `/staff/rides/resources/${kind}`,
                  z.object({ resource: resourceSchema }),
                  token,
                  "POST",
                  {
                    ...values,
                    applicationId: id,
                    status: "approved",
                    ...(kind === "vehicle"
                      ? { passengers: Number(values["passengers"]) }
                      : {}),
                  },
                );
              });
            }}
          >
            <fieldset disabled={!ready || busy}>
              {kind === "driver" ? (
                <>
                  <label>
                    Driver name
                    <input name="name" required maxLength={120} />
                  </label>
                  <label>
                    Driver contact phone
                    <input name="phone" type="tel" required maxLength={30} />
                  </label>
                </>
              ) : (
                <>
                  <label>
                    Ride type
                    <select name="kind">
                      <option value="bike">Bike</option>
                      <option value="taxi">Taxi</option>
                    </select>
                  </label>
                  <label>
                    Vehicle description
                    <input name="label" required maxLength={120} />
                  </label>
                  <label>
                    Registration
                    <input name="registration" required maxLength={40} />
                  </label>
                  <label>
                    Passenger capacity
                    <input
                      name="passengers"
                      type="number"
                      min={1}
                      max={8}
                      required
                    />
                  </label>
                </>
              )}
              <label>
                Approval reason
                <textarea name="reason" required maxLength={500} />
              </label>
              <label>
                <input type="checkbox" name="checked" required />I have checked
                this {kind} externally and approve this record.
              </label>
              <button type="submit" className="button secondary">
                Register approved {kind}
              </button>
            </fieldset>
          </form>
        </details>
      ))}
    </>
  );
}
