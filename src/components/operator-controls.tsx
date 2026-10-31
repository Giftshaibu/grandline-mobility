import { ResourceRegistration } from "./resource-registration";
import { useEffect, useState } from "react";
import { z } from "zod";
import { businessRequest } from "../lib/business-api";
import type { Session } from "./auth-session";
const approvalResponse = z.object({
  application: z.object({
    version: z.number(),
    approvedVersion: z.number().nullable(),
    status: z.string(),
    operatorApproval: z
      .object({
        status: z.string(),
        version: z.number(),
        approvedApplicationVersion: z.number(),
        reason: z.string(),
      })
      .nullable(),
  }),
});
const resourceSchema = z.object({
  id: z.string().uuid(),
  version: z.number(),
  status: z.string(),
  name: z.string().optional(),
  label: z.string().optional(),
});
const resourcePage = z.object({
  drivers: z.array(resourceSchema),
  vehicles: z.array(resourceSchema),
});
export function OperatorControls({
  id,
  session,
}: {
  id: string;
  session: Session;
}) {
  const [application, setApplication] = useState<
    z.infer<typeof approvalResponse>["application"] | null
  >(null);
  const [resources, setResources] = useState<z.infer<
      typeof resourcePage
    > | null>(null),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [ready, setReady] = useState(false);
  const [reason, setReason] = useState(""),
    [confirmed, setConfirmed] = useState(false);
  async function load() {
    const token = await session.getToken();
    if (!token) throw new Error("Sign in again.");
    setApplication(
      (
        await businessRequest(
          `/staff/mobility/applications/${id}/operator-approval`,
          approvalResponse,
          token,
        )
      ).application,
    );
  }
  useEffect(() => {
    setReady(true);
    void load().catch((error) => setMessage(String(error.message)));
  }, [id]);
  async function run(work: (token: string) => Promise<void>) {
    setBusy(true);
    setMessage("");
    try {
      const token = await session.getToken();
      if (!token) throw new Error("Sign in again.");
      await work(token);
      await load();
      setMessage(
        "Operational decision saved. Catalogue publication and trip assignment remain separate.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "The operational action failed.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="review-panel">
      <h2>Ride operator approval</h2>
      <p>
        Review operational eligibility separately from catalogue approval and
        payment. A current application, approved driver and approved vehicle are
        all required before staff can assign a ride.
      </p>
      {application && (
        <p>
          Application: {application.status}. Operational decision:{" "}
          {application.operatorApproval?.status ?? "Not reviewed"}.{" "}
          {application.operatorApproval &&
            application.operatorApproval.approvedApplicationVersion !==
              application.approvedVersion &&
            "The operational decision is for an older application revision."}
        </p>
      )}
      <fieldset disabled={!ready || busy}>
        <label>
          Operational review reason
          <textarea
            maxLength={500}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </label>
        <label>
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}
          />
          I have completed the operational checks externally.
        </label>
        <div className="application-actions">
          {(["approved", "suspended"] as const).map((status) => (
            <button
              type="button"
              className="button secondary"
              key={status}
              disabled={
                !application ||
                !reason.trim() ||
                (status === "approved" && !confirmed)
              }
              onClick={() =>
                void run(async (token) => {
                  await businessRequest(
                    `/staff/mobility/applications/${id}/operator-approval`,
                    z.object({ approval: z.object({ version: z.number() }) }),
                    token,
                    "POST",
                    {
                      status,
                      reason,
                      expectedApplicationVersion: application!.version,
                      expectedApprovalVersion:
                        application!.operatorApproval?.version ?? 0,
                    },
                  );
                  setConfirmed(false);
                })
              }
            >
              {status === "approved"
                ? "Approve ride operations"
                : "Suspend ride operations"}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="text-action"
          onClick={() =>
            void run(async (token) => {
              setResources(
                await businessRequest(
                  `/staff/rides/resources/${id}`,
                  resourcePage,
                  token,
                ),
              );
            })
          }
        >
          Load registered drivers and vehicles
        </button>
      </fieldset>
      {resources && (
        <>
          {(["drivers", "vehicles"] as const).map((kind) => (
            <div key={kind}>
              <h3>{kind} (up to 100)</h3>
              {resources[kind].map((resource) => (
                <div key={resource.id}>
                  <p>
                    {resource.name ?? resource.label} · {resource.status}
                  </p>
                  <button
                    type="button"
                    className="text-action"
                    disabled={busy || !reason.trim()}
                    onClick={() =>
                      void run(async (token) => {
                        await businessRequest(
                          `/staff/rides/resources/${kind === "drivers" ? "driver" : "vehicle"}/${resource.id}/status`,
                          z.object({ resource: resourceSchema }),
                          token,
                          "POST",
                          {
                            status:
                              resource.status === "approved"
                                ? "suspended"
                                : "approved",
                            expectedVersion: resource.version,
                            reason,
                          },
                        );
                        setResources(
                          await businessRequest(
                            `/staff/rides/resources/${id}`,
                            resourcePage,
                            token,
                          ),
                        );
                      })
                    }
                  >
                    {resource.status === "approved" ? "Suspend" : "Approve"}
                  </button>
                </div>
              ))}
            </div>
          ))}
        </>
      )}
      <ResourceRegistration id={id} busy={busy} ready={ready} run={run} />
      {message && <p role="status">{message}</p>}
    </section>
  );
}
