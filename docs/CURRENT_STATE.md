# Current state — 2026-10-28

Branch: main. Marketplace checkpoint: 9ecd65d (shell), ee9242a (heavy-duty/bike), 8f0bf03/cdf6686 (local editorial photos), 9e0f142 (tests), followed by screenshot-readiness and documentation commits.

## Implemented

Auto Hub-style logo/search/account header, category dropdowns, native mobile menu, product-specific footer, image-led home/browse pages and journey cards. Distinct /hire, /heavy-duty, /commercial, /logistics and /bike-pickup routes. Heavy-duty detail presentation supports supplied capacity, type, operator, price and terms. Bike pickup allows local draft/review, explaining staff availability checks, manual quote, customer acceptance and assignment. It sends/saves nothing; submission and quote acceptance are disabled. Review remains disabled without JavaScript. Local photos illustrate car/truck/motorcycle categories and never represent inventory or assigned riders.

## Integration limits

Real category/search/detail/enquiry/pickup APIs, quotes, dispatch and staff management remain blocked. No new backend model, migration, onboarding, payments, tracking or simulated successful enquiry. Unified shop/optional parts association and staff-managed identity contracts are proposed in docs/api/PROPOSED_CONTRACTS.md. Live Clerk configuration and cross-domain identity remain launch prerequisites.

## Verification

Typecheck, lint and independent Vercel build passed. All 28 unit/component tests and 18 desktop/mobile Chromium tests passed, including heavy-duty filters, local review, disabled submit/quote, no JavaScript behavior, category navigation, URL reloads, dialogs and no hypothetical API calls. Initial concurrent unit runs had startup timeouts; serial reruns passed. Browser search checks wait for hydration after native navigation; photos are served locally. Windows reserved the old preview ports; use http://127.0.0.1:4302. Remote CI was not run.

## Continue here

Relevant files: src/components/shell.tsx, marketplace-hero.tsx, mobility-browser.tsx, mobility-detail.tsx; src/routes/heavy-duty*, bike-pickup.tsx; src/lib/contracts.ts and marketplace.ts; tests/marketplace.test.tsx; e2e/marketplace.spec.ts. Generated routeTree.gen.ts remains ignored. Implement approved shared-backend contracts separately before enabling real journeys. Roll back through normal reverts or prior deployments. No push, deployment or production demo cleanup occurred.
