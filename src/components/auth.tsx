import Car01Icon from "@hugeicons/core-free-icons/Car01Icon";
import SaleTag01Icon from "@hugeicons/core-free-icons/SaleTag01Icon";
import Search01Icon from "@hugeicons/core-free-icons/Search01Icon";
import { HugeiconsIcon } from "@hugeicons/react";
import DashboardSpeed01Icon from "@hugeicons/core-free-icons/DashboardSpeed01Icon";
import Mail01Icon from "@hugeicons/core-free-icons/Mail01Icon";
import CheckmarkCircle02Icon from "@hugeicons/core-free-icons/CheckmarkCircle02Icon";
import UserIcon from "@hugeicons/core-free-icons/UserIcon";
import { WelcomeDialog, Button } from "@grandline/ui";
import { AccountMenu } from "@grandline/ui/account";
import {
  ClerkProvider,
  SignInButton,
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
        variables: { colorPrimary: "#ee4036", colorPrimaryForeground: "#faf7f8", colorForeground: "#29282c", colorMuted: "#f4f2f0", colorMutedForeground: "#716f75", colorBackground: "#ffffff", colorInput: "#ffffff", colorInputForeground: "#29282c", colorBorder: "#e4e1e1", colorRing: "#ee4036", borderRadius: "0.375rem", fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif' },
        elements: { cardBox: "shadow-xl", card: "border border-[#e4e1e1]", formButtonPrimary: "font-semibold hover:opacity-90", userButtonPopoverCard: "border border-[#e4e1e1] shadow-xl" },
      }}
    >
      {children}
    </ClerkProvider>
  ) : (
    children
  );
}
function ConfiguredAccount() {
  const { isLoaded, isSignedIn, has } = useAuth();
  if (!isLoaded) return <span className="muted">Loading account…</span>;
  return isSignedIn ? (
    <AccountMenu links={[
      { href: "/my-businesses", label: "My listings", icon: <HugeiconsIcon icon={DashboardSpeed01Icon} size={16} /> },
      { href: "/my-businesses#notifications", label: "Notifications", icon: <HugeiconsIcon icon={Mail01Icon} size={16} /> },
      { href: "/my-rides", label: "My rides", icon: <HugeiconsIcon icon={DashboardSpeed01Icon} size={16} /> },
      ...(has?.({ role: "org:admin" }) ? [{ href: "/staff", label: "Staff dashboard", icon: <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} /> }] : []),
    ]} />
  ) : (
    <SignInButton mode="modal">
      <Button variant="secondary"><HugeiconsIcon icon={UserIcon} size={18} />Sign in</Button>
    </SignInButton>
  );
}
export function AccountControl() {
  return clerkKey ? <ConfiguredAccount /> : <Button variant="secondary" disabled title="Sign in is temporarily unavailable">Sign in</Button>;
}

const welcomeOptions = [
  { icon: <HugeiconsIcon icon={Car01Icon} size={20} />, label: 'Find transport', description: 'Browse hire, bikes and taxis', href: '/' },
  { icon: <HugeiconsIcon icon={SaleTag01Icon} size={20} />, label: 'List transport', description: 'Start a transport listing', href: '/list' }
];
function ConfiguredWelcome() {
  const { isLoaded, isSignedIn } = useAuth();
  return <WelcomeDialog product="mobility" title="What brings you to Grandline Mobility?" description="Find transport or list an offering for customers across Malawi." options={welcomeOptions} browseIcon={<HugeiconsIcon icon={Search01Icon} size={20} />} ready={isLoaded} signedIn={!!isSignedIn} />;
}
export function ProductWelcome() {
  return clerkKey ? <ConfiguredWelcome /> : <WelcomeDialog product="mobility" title="What brings you to Grandline Mobility?" description="Find transport or list an offering for customers across Malawi." options={welcomeOptions} browseIcon={<HugeiconsIcon icon={Search01Icon} size={20} />} />;
}
