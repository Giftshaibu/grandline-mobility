import { useAuth } from "@clerk/tanstack-react-start";
import { Fragment, type ReactNode } from "react";
import { clerkKey } from "../lib/config";
import { AccountControl } from "./auth";
export type Session = {
  staff: boolean;
  getToken: () => Promise<string | null>;
};
function SignedInSession({
  children,
}: {
  children: (session: Session) => ReactNode;
}) {
  const { isLoaded, isSignedIn, getToken, has, userId, orgId } = useAuth();
  if (!isLoaded) return <p role="status">Loading your account…</p>;
  if (!isSignedIn)
    return (
      <div>
        <p>Sign in to save an application or send a request.</p>
        <AccountControl />
      </div>
    );
  return (
    <Fragment key={`${userId}:${orgId ?? "personal"}`}>
      {children({
        staff: has?.({ role: "org:admin" }) ?? false,
        getToken: () => getToken(),
      })}
    </Fragment>
  );
}
export function AuthSession({
  children,
}: {
  children: (session: Session) => ReactNode;
}) {
  return clerkKey ? (
    <SignedInSession>{children}</SignedInSession>
  ) : (
    <p>
      Account access is not configured for this deployment. Public browsing
      remains available.
    </p>
  );
}
