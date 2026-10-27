import {
  ClerkProvider,
  SignInButton,
  UserButton,
  useAuth,
} from "@clerk/tanstack-react-start";
import type { ReactNode } from "react";
import { clerkKey } from "../lib/config";
export function AuthProvider({ children }: { children: ReactNode }) {
  return clerkKey ? (
    <ClerkProvider
      publishableKey={clerkKey}
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
      appearance={{
        options: { logoImageUrl: "/logo-full.svg", logoLinkUrl: "/" },
        variables: { colorPrimary: "#ee4036", borderRadius: "0.375rem" },
      }}
    >
      {children}
    </ClerkProvider>
  ) : (
    children
  );
}
function ConfiguredAccount() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <span className="muted">Loading account…</span>;
  return isSignedIn ? (
    <UserButton />
  ) : (
    <SignInButton mode="modal">
      <button className="button secondary">Sign in</button>
    </SignInButton>
  );
}
export function AccountControl() {
  return clerkKey ? <ConfiguredAccount /> : null;
}
