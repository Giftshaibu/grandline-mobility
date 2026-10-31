# Deployment and rollback

Current navigation defaults are the verified published Auto Hub/Services/Mobility URLs in .env.example. Blank ecosystem variables use those defaults; configured HTTP(S) values override them. This supersedes older blank-destination hiding guidance below.

## Current deployment handoff — 2026-10-31

Chunks 9–11 are code implemented, default off. Use docs/api/LIVE_MOBILITY.md and RIDES.md for actual contracts. Historical preview-only guidance below is superseded where it describes absent APIs.

VITE_MOBILITY_LIVE and VITE_RIDES_LIVE default false and independently require VITE_API_BASE_URL when enabled. Backend capabilities remain authoritative; live failures never substitute sample listings. Pair Clerk public/server keys and configure exact CORS origins, authorized parties and redirects for each host. Do not assume cross-domain cookies or expose SSR secrets through VITE variables.

Deploy additive migrations/backend first. Migration 20261101080000_ride_requests uses btree_gist; the approved migration role must support that extension. Configure business profiles, Clerk, private Supabase storage and business billing before MOBILITY_APPLICATIONS_ENABLED. Verify owner saves/uploads/staff review, then enable MOBILITY_DISCOVERY_ENABLED after paid publication/enquiry checks. Activate VITE_MOBILITY_LIVE only against that matching backend.

RIDE_REQUESTS_ENABLED requires Mobility discovery. Verify separate operator approval, approved driver/vehicle records, manual quotes, customer acceptance, conflicts and privacy before VITE_RIDES_LIVE. Optional VITE_GOOGLE_MAPS_BROWSER_KEY needs restricted referrers, enabled Maps JavaScript/Places New, billing/quotas and business-approved public policies (RIDES.md). Missing/failing maps and denied geolocation retain typed addresses.

Run typecheck, lint, unit tests, build and Playwright. PLAYWRIGHT_PORT selects an isolated preview, default 4302. The opt-in MOBILITY_LIVE_TEST suite uses a dedicated live build, https://api.example.test and a dummy map key with intercepted public fixtures. Never publish that test artifact; rebuild flags false/API/key blank afterward. No production auth bypass exists.

Chunk 12 notifications and chunk 13 actual Clerk/storage/maps/payment/email staging checks remain production gates. Rollback disables affected frontend/backend flags and restores prior deployments while preserving all business/application/payment/publication/ride/quote/assignment/audit data and additive schema. No automatic push/deployment. Demo cleanup remains separate and approval-controlled.

## Historical foundation handoff

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

## Marketplace design release

Set the same optional product URLs independently in each frontend. Services shop spare-part links use configured VITE_HUB_URL + /parts and never a hypothetical shop inventory route. Shop and pickup workflows remain frontend-only; setting an API URL does not enable them. New routes are normal SSR routes covered by the Vercel build. No backend migration, dispatch service or fare/payment provider is required for this design release.

Editorial hero photos are locally served from public/marketplace-workshop.jpg and public/marketplace-road.jpg, with a dark-color fallback; loading failure must not hide text or actions. Unsplash license permits commercial use: https://unsplash.com/license. The workshop photo is photo-1486262715619-67b85e0b08d3 and the vehicle photo is photo-1503376780353-7e6692767b70. They illustrate categories, never a provider/listing or Malawi inventory. Replace with client-owned photography when supplied.

Mobility-specific illustrative photos: marketplace-truck.jpg (Unsplash photo-1519003722824-194d4455a60c) and marketplace-bike.jpg (photo-1558981806-ec527fa84c39), under the same license. Neither depicts Grandline inventory, an assigned rider or a guaranteed service area.

## User-approved sample browsing

Unavailable directory pages now expose a labelled local sample catalogue. This is a frontend preview collection, not seeded production data or an HTTP response. Details use reserved sample- slugs and noindex/nofollow; no contact, enquiry, payment or booking is enabled. Real errors retain error states. When backend support is implemented, preserve the boundary and use real results instead of local sample records.

## Listing application preview release — 2026-10-29

No new environment variables, backend routes, storage buckets or migrations are required. The multi-step applications work publicly with both Clerk keys empty. Final submission stays disabled even if Clerk/API settings exist. Never wire a form to a proposed URL solely by setting an environment variable. No draft/local photo data is sent or persisted.

Photo validation follows Auto Hub src/features/seller-media/api/upload.ts: up to eight nonempty JPEG/PNG/WebP files, each at most 12 MB. Only local validation/preview behavior is reused, not the upload function or billing workflows. These foundations are copied locally, with no cross-repository source imports.

Roll back using a normal revert of the application feature commits or the previous independent frontend deployment. Before real activation, implement and test authenticated ownership, media uploads, staff review and publication in the shared backend, settle applicable fees there and verify real identity/session behavior. No live applications or operator dispatch are created by this release.
