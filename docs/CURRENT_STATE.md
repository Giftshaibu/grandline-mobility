# Current state — 2026-10-31

Branch: main. Backend roadmap chunks9–11 are implemented locally, default off. No push, deployment, external email or production cleanup. Configured staging remains chunk13.

## Implemented

VITE_MOBILITY_LIVE connects real public catalogue/details/enquiries, authenticated owner saves/scoped media/submission/status and staff review/quotes/receipt verification/publication. Default false retains labelled samples/local previews. Disabled support, live failures and empty results stay distinct; no sample fallback in live mode.

/list supports hire, heavy-duty, commercial, logistics, bike-operator and taxi-operator applications. Explicit saves can add Mobility participation to an owned business; suspension is not bypassed. /my-businesses exposes feedback/resume/monthly billing. /staff handles private review/photos and separate verified-payment publication. Operational approval and driver/vehicle registration remain separate from catalogue approval. Owner links use stored publication kind, preserving old live links during draft type edits.

/ride has stepped addresses/landmarks, bike/taxi/passengers, immediate/scheduled Malawi timing, contact/review/confirmation and explicit authenticated save/amend. VITE_RIDES_LIVE independently controls real requests. /bike-pickup redirects with bike selected; /my-rides lists genuine owner requests. Saved views show staff quote/expiry, atomic acceptance, private assignment and recorded progress. Journey edits invalidate quotes/acceptance. Polling pauses hidden/offline and backs off failures. No simulated drivers/fares/availability/ETA/GPS tracking.

/staff-rides coordinates availability, manual quotes, approved resources, reservation windows and trip start/completion/cancellation. Backend checks current operational revision, separate resource approvals, type/capacity, accepted fare and conflicts. PostgreSQL exclusions protect reservation windows. Trip payments remain offline and independent of monthly fees.

## Maps and privacy

Optional VITE_GOOGLE_MAPS_BROWSER_KEY loads Maps/Places New only after Open Google Maps. Widgets manage sessions/attribution. Typed addresses survive missing keys, SDK/auth failures and denied geolocation. Pins help confirm locations, without routing/fare/ETA promises. Google-derived coordinates stay transient and are stripped by frontend/backend; customer-confirmed addresses/landmarks and permitted place IDs persist. Manual pins/geolocation are customer-supplied. Unsaved drafts are memory-only; exit clears them. Clerk identity/organization changes remount private state.

## Working set

Business: lib/business-api, mobility-draft, use-saved-application, save-application-photos; components/live-application-actions, business-dashboard, business-billing-panel, staff-applications, operator-controls, resource-registration. Public: lib/directory/contracts and mobility-browser/detail/enquiry. Rides: lib/ride-api, ride-draft, use-ride-polling, google-maps-adapter; components/ride-*, my-rides, staff-rides, staff-ride-assignment and corresponding routes. Tests: *ride*, google-maps-adapter, application-upload, business-workspace; e2e/application, ride and opt-in live-integration. Vite generates ignored routeTree.gen.ts.

## Checks and remaining gates

Backend typecheck/build and155 unit/API tests pass. Full integration checkpoint64 passed/1 separate cleanup skip; final focused rides/publication13 passed, including exclusions/rollback/RLS/published-kind regression. Frontend63 unit/component tests pass, plus focused9 private-draft/billing/ride checks. Initial desktop/mobile43 passed/1 intended hover skip; isolated live catalogue/error/map-failure6 passed; final selected default-build browser8 passed with inspected screenshots. Typecheck/lint/build pass. Restored private application/ride edits are disposed before paint on account scope changes; late private responses cannot restore them. The owning Services hook received the same narrow privacy fix with60 tests passing.

Actual cross-domain Clerk, private Supabase, live Google key/billing, receipt verification and production journeys need configured staging. Migration20261101080000_ride_requests ran only on disposable local PostgreSQL (23 total). Deploy/migrate backend before frontend gates. Production Maps needs approved public policies described in api/RIDES.md.

Remaining: chunk12 notifications/delivery-failure visibility and chunk13 staged rollout. A receipt does not imply email delivery. Demo cleanup remains separate/approval-controlled. Rollback disables affected gates/restores deployment while retaining all application/payment/quote/assignment/audit history. See api/LIVE_MOBILITY.md, api/RIDES.md and DEPLOYMENT.md.
