# Deployment and rollback

Deploy this repository independently to Vercel with Node 22.12+ and `npm run build`. scripts/build.mjs selects the Vercel Nitro preset; .vercel/output is generated and ignored. CI runs reproducible install, build, typecheck, lint, unit/component tests and desktop/mobile Chromium checks. No Docker or Kubernetes is added to these frontends.

Configure optional VITE_HUB_URL, VITE_SERVICES_URL, VITE_MOBILITY_URL as actual public HTTP(S) destinations. Empty destinations are hidden. VITE_API_BASE_URL points to the existing shared backend when actual integration becomes available; setting it alone does not enable proposed directory endpoints.

## Identity setup

Use the same approved Clerk instance/identity as Auto Hub. Configure VITE_CLERK_PUBLISHABLE_KEY and server-only CLERK_SECRET_KEY together; neither placeholder is usable. Both empty permits anonymous discovery pages and hides account controls. Partial configuration fails closed. On production, configure these values in the hosting dashboard. Do not share secrets through source control or chat.

Register each exact frontend origin in backend CORS_ORIGINS and CLERK_AUTHORIZED_PARTIES. Configure Clerk allowed redirects and satellite/domain settings where appropriate to the eventual hostnames. Do not broaden origins with wildcards or assume sessions/cookies share automatically. Hosted Clerk branding is configured separately. The app-controlled modal reuses the Grandline car/wordmark assets.

Verify signed-out browsing, sign-in, sign-out, expired sessions, redirect safety, and identity continuity across real domains before enabling authenticated actions. These live checks need approved credentials/domains and are not covered by the anonymous local tests. CSRF middleware remains active for TanStack server functions; any future enquiry sends a fresh Clerk bearer token to the shared API, never a secret key.

## Backend readiness gate

All proposed directory/category/detail/enquiry routes remain absent. Implement and validate them in grandline-backend separately, including ownership, rate limiting, publication rules and query indexes. Do not deploy a new backend or enable the isolated HTTP adapter just to populate the UI. Until integration exists, the site clearly reports directory unavailability and enquiries remain disabled.

## Verification and operations

Before launch, run all CI commands, check mobile/desktop layouts, keyboard access, real contact data, real endpoint failures and external navigation. Verify hosting platform request/error logs, HTTP 200 for public pages, 404 for missing routes and 5xx reporting. Do not send contact details to logs. Static footer text is not a health probe.

Deploy each app separately; use preview deployment URLs for review. No production publication was performed during implementation. Roll back with the previous Vercel deployment or a normal Git revert of the affected chunk. There is no frontend database migration. Do not rewrite Auto Hub/Lovable history. Keep backend production cleanup separate and follow its DEMO_CATALOGUE_CLEANUP.md approval procedure.

## Verified local checkpoint — 2026-10-28

Build, typecheck, lint, unit/component and desktop/mobile browser checks passed locally. Browser checks use the built Nitro production preview, not the development server. On Windows, run `npm run preview` in a separate terminal before Playwright to reuse the server and stop that terminal afterward; the automated preview shutdown needed manual process termination after successful tests in this environment. The committed Linux CI workflow has not run remotely. Real authenticated journeys and actual backend data/enquiries remain release gates.
