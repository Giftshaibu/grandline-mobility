import { useEffect, useState } from "react";
import { z } from "zod";
import {
  businessRequest,
  billingSchema,
  type Billing,
} from "../lib/business-api";
import { ecosystem } from "../lib/config";
import type { Session } from "./auth-session";
const money = (value: number) => `MK ${value.toLocaleString("en-MW")}`;
export function BusinessBillingPanel({
  businessId,
  session,
  staff = false,
}: {
  businessId: string;
  session: Session;
  staff?: boolean;
}) {
  const [data, setData] = useState<Billing | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [method, setMethod] = useState("bank_transfer");
  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [checked, setChecked] = useState(false);
  const [ready, setReady] = useState(false);
  const path = `${staff ? "/staff" : ""}/business-billing/${businessId}/mobility`;
  const hub = ecosystem.find((item) => item.label === "Auto Hub")?.url;
  async function load() {
    setBusy(true);
    setMessage("");
    try {
      const token = await session.getToken();
      if (!token) throw new Error("Sign in again.");
      setData(await businessRequest(path, billingSchema, token));
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Billing could not load.",
      );
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    setReady(true);
    void load();
  }, [businessId]);
  async function change(suffix: string, body: unknown) {
    setBusy(true);
    setMessage("");
    try {
      const token = await session.getToken();
      if (!token) throw new Error("Sign in again.");
      await businessRequest(path + suffix, z.unknown(), token, "POST", body);
      setData(await businessRequest(path, billingSchema, token));
      setReference("");
      setChecked(false);
      setMessage(
        "Saved. The current receipt and coverage status are shown below.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "The billing action failed.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="review-panel" aria-label="Business monthly billing">
      <h2>Mobility monthly fee</h2>
      {data ? (
        <>
          <p>
            <strong>
              {data.billing?.agreedFee
                ? `${money(data.billing.agreedFee)} per 30 days`
                : "Staff quote required"}
            </strong>
          </p>
          <p>
            One agreed fee covers this business on Services. Category guidance
            is not added together.
          </p>
          {data.reviewRequired && (
            <p>A staff quote/review is required for the approved categories.</p>
          )}
          {data.billing?.paidUntil ? (
            <p>
              {data.overdue ? "Renewal overdue since" : "Paid through"}{" "}
              {new Date(data.billing.paidUntil).toLocaleDateString("en-GB")}.{" "}
              {data.overdue ? "Published profiles remain public." : ""}
            </p>
          ) : (
            <p>
              Your listing is live while staff review it. Payment must be verified within seven days. The paid 30-day period starts when payment is verified.
            </p>
          )}
          {data.billing?.graceEndsAt && !data.billing.paidUntil && <p>Payment verification deadline: {new Date(data.billing.graceEndsAt).toLocaleString()}</p>}
          <details>
            <summary>Category fee guidance</summary>
            <ul>
              {data.categoryGuidance.map((item) => (
                <li key={item.category}>
                  {item.category}:{" "}
                  {item.monthlyFee === null
                    ? "Staff quote"
                    : money(item.monthlyFee)}
                </li>
              ))}
            </ul>
          </details>
          <p>{data.instructions.message}</p>
          {data.instructions.paymentAccounts.map((account) => (
            <p key={`${account.method}:${account.account}`}>
              <strong>{account.name}</strong> ·{" "}
              {account.method.replaceAll("_", " ")} · {account.account}
            </p>
          ))}
          {hub ? (
            <a href={`${hub}/contact`}>
              Contact Grandline about the fee or payment instructions ↗
            </a>
          ) : (
            <p>
              Approved public contact details are not configured on this
              deployment.
            </p>
          )}
          <fieldset disabled={!ready || busy}>
            {!staff ? (
              <>
                <label>
                  Payment method
                  <select
                    value={method}
                    onChange={(event) => setMethod(event.target.value)}
                  >
                    {[
                      "bank_transfer",
                      "airtel_money",
                      "tnm_mpamba",
                      "mobile_money",
                      "cash",
                      "other",
                    ].map((value) => (
                      <option value={value} key={value}>
                        {value.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Transaction reference
                  <input
                    maxLength={120}
                    value={reference}
                    onChange={(event) => setReference(event.target.value)}
                  />
                </label>
                <button
                  type="button"
                  className="button"
                  disabled={
                    !reference.trim() ||
                    !data.billing?.agreedFee ||
                    data.reviewRequired ||
                    data.payments.some((item) => item.status === "pending")
                  }
                  onClick={() =>
                    void change("/payments", { method, reference })
                  }
                >
                  Submit payment reference
                </button>
              </>
            ) : (
              <>
                <label>
                  Staff reason / receipt note
                  <textarea
                    maxLength={500}
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                  />
                </label>
                <label>
                  Agreed monthly fee (whole MK)
                  <input
                    type="number"
                    min={1}
                    max={2147483647}
                    step={1}
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                  />
                </label>
                <button
                  type="button"
                  className="button secondary"
                  disabled={
                    !reason.trim() ||
                    !Number.isSafeInteger(Number(amount)) ||
                    Number(amount) <= 0
                  }
                  onClick={() =>
                    void change("/quote", {
                      amount: Number(amount),
                      expectedQuoteVersion: data.billing?.quoteVersion ?? 0,
                      reason,
                    })
                  }
                >
                  Agree monthly quote
                </button>
                <label>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => setChecked(event.target.checked)}
                  />
                  I checked the actual bank/mobile-money receipt externally
                </label>
              </>
            )}
            <h3>Payment history</h3>
            {!data.payments.length && (
              <p>No payment references have been submitted.</p>
            )}
            {data.payments.map((payment) => (
              <div className="application-review-service" key={payment.id}>
                <p>
                  {payment.reference} · {money(payment.amount)} ·{" "}
                  <strong>{payment.status}</strong>
                </p>
                {staff && payment.status === "pending" && (
                  <div className="application-actions">
                    <button
                      type="button"
                      className="button"
                      disabled={!checked || !reason.trim()}
                      onClick={() =>
                        void change(`/payments/${payment.id}/verify`, {
                          decision: "verified",
                          reason,
                        })
                      }
                    >
                      Verify received payment
                    </button>
                    <button
                      type="button"
                      className="button secondary"
                      disabled={!reason.trim()}
                      onClick={() =>
                        void change(`/payments/${payment.id}/verify`, {
                          decision: "rejected",
                          reason,
                        })
                      }
                    >
                      Reject reference
                    </button>
                  </div>
                )}
              </div>
            ))}
          </fieldset>
          <details>
            <summary>Billing audit history</summary>
            {data.events.map((event, index) => (
              <p key={index}>
                {event.action.replaceAll("_", " ")}
                {event.reason ? ` · ${event.reason}` : ""}
              </p>
            ))}
          </details>
        </>
      ) : (
        <p role="status">
          {busy ? "Loading billing…" : "Billing is unavailable."}
        </p>
      )}
      {message && <p role="status">{message}</p>}
      <button
        type="button"
        className="text-action"
        disabled={!ready || busy}
        onClick={() => void load()}
      >
        Refresh billing
      </button>
    </section>
  );
}
