# Current state — 2026-10-28

Branch: main. Marketplace checkpoint: 9ecd65d (shell), ee9242a (heavy-duty/bike), 8f0bf03/cdf6686 (local editorial photos), 9e0f142 (tests), followed by screenshot-readiness and documentation commits.

## Implemented

Auto Hub-style logo/search/account header, category dropdowns, native mobile menu, product-specific footer, image-led home/browse pages and journey cards. Distinct /hire, /heavy-duty, /commercial, /logistics and /bike-pickup routes. Heavy-duty detail presentation supports supplied capacity, type, operator, price and terms. Bike pickup allows local draft/review, explaining staff availability checks, manual quote, customer acceptance and assignment. It sends/saves nothing; submission and quote acceptance are disabled. Review remains disabled without JavaScript. Local photos illustrate car/truck/motorcycle categories and never represent inventory or assigned riders.

## Integration limits

Real category/search/detail/enquiry/pickup APIs, quotes, dispatch and staff management remain blocked. No new backend model, migration, onboarding, payments, tracking or simulated successful enquiry. Unified shop/optional parts association and staff-managed identity contracts are proposed in docs/api/PROPOSED_CONTRACTS.md. Live Clerk configuration and cross-domain identity remain launch prerequisites.

## Verification

Latest catalogue release: typecheck, lint and production build passed. All 30 unit/component tests passed; 21 desktop/mobile browser tests passed with one mobile hover-only test intentionally skipped. Browser checks cover hover opening/closing, keyboard Escape, label/chevron vertical alignment, filtered sample grids, sample detail navigation, disabled enquiries and no hypothetical API calls. Existing search, menu and pickup checks remain green. Desktop sample catalogue and mobile layouts were reviewed. Previews use port 4302. No remote CI or production deployment.

## Continue here

Relevant files: src/components/shell.tsx, marketplace-hero.tsx, mobility-browser.tsx, mobility-detail.tsx; src/routes/heavy-duty*, bike-pickup.tsx; src/lib/contracts.ts and marketplace.ts; tests/marketplace.test.tsx; e2e/marketplace.spec.ts. Generated routeTree.gen.ts remains ignored. Implement approved shared-backend contracts separately before enabling real journeys. Roll back through normal reverts or prior deployments. No push, deployment or production demo cleanup occurred.

## User-requested sample catalogue and hover correction

Source 365ef76; tests 5c7cd33. The user requested a browsable placeholder catalogue after the design-only release. Local samples are therefore an explicit change to the earlier no-sample UI, separate from test fixtures and real directory gateways. Records use Example names, sample- slugs, illustrative media, no real contacts and clear sample labels on grids/details. Filters and sorting work locally. Sample details are noindex/nofollow; they cannot be booked or enquired about. No database seed, API response, account or production listing was changed.

Header labels and SVG chevrons share a flex center line. Desktop pointer hover opens menus, moving away closes them unless keyboard focus is inside, and native click/Enter/Escape remain supported. No push performed.
