# Current state — 2026-10-29

Branch: main. Listing application checkpoint: 20b639c, tests 60ba26f, page-exit privacy 21f1dbd, followed by focused test/documentation commits.

## Objective and implemented phase

Frontend-only listing applications are complete at /list. One hire, heavy-duty, commercial, logistics or bike-operator offering per application, with conditional identity/capacity/operator/terms/rate fields. Logistics omits vehicle fields. Bike operator applications remain separate from customer pickup requests and imply no dispatch eligibility.

Both products have six-step validation, error focus, back/edit-and-return behavior, optional local photo previews/removal, monthly fee guidance, reset and disabled final submission. Photos follow Auto Hub's 8-file / 12-MB JPEG/PNG/WebP rules; no upload code is copied. Header, mobile menu, footer and browsing pages link to the applications. Existing marketplace shell, hover menus, labelled sample catalogue and bike pickup preview remain stable.

## Boundaries

Drafts live in component memory only; refresh/route exit discards them. Page-hide handling clears drafts for browser back-navigation caches and revokes local photo URLs. No account draft, upload, payment, moderation record, publication or sample listing is created. Final submission remains disabled before/after hydration and without JavaScript. Public preview needs no sign-in; real submission will need authenticated ownership and staff review.

The earlier staff-created-only shop model is superseded by business applications for staff approval. Real shop/directory/application/enquiry/media/status/staff-review endpoints are still absent. Fee amounts are informational category guidance, not aggregated bills or vehicle-sale price tiers; unmapped categories need staff confirmation. No government identity documents or dispatch onboarding are collected.

## Verification

Typecheck, lint and independent Vercel production build pass. Latest unit/component suite: 38 passed. Full browser suite before final privacy refinement: 33 passed and one mobile hover-only test intentionally skipped. Final targeted desktop/mobile application, keyboard and page-exit checks: 16 passed. This covers form branching, validation, photo previews/removal/URL cleanup, edit-and-return, reset, refresh, no-JavaScript disabling and no upload/API transmission. Desktop/mobile layouts and review screens were inspected. Remote CI and live authenticated/backend journeys were not run.

## Working set / next action

Entry route: src/routes/list.tsx. Local foundations: src/components/application-*.tsx; domain form/model: src/components/mobility-application*.tsx and src/lib/mobility-application.ts. Tests: tests/*application* and e2e/application.spec.ts. Generated routeTree.gen.ts is ignored; generate with Vite. See docs/api/PROPOSED_CONTRACTS.md for blocked interfaces and docs/DEPLOYMENT.md for rollout/rollback.

Next backend phase must implement scoped uploads, authenticated ownership, application persistence, review feedback and explicit publication before enabling submission. Roll back via normal feature reverts or previous deployment. Preview: http://127.0.0.1:4302/list. No pushes, deployment, backend changes or production demo cleanup occurred.

### Backend integration checkpoint — 2026-10-29

The backend now has default-off business ownership, Services saved application/media/moderation and per-business/product billing core. These APIs have not been activated in this frontend. Public discovery/publication/enquiries, configured authentication/storage/payment operations and controlled staging journeys remain required before live submission. Mobility and ride operations remain unavailable. Canonical backend status: grandline-backend/docs/implementation/BACKEND_INTEGRATION_PROGRESS.md (sibling documentation reference).

## Backend roadmap chunk8 — 2026-10-31

The shared backend now implements default-off Mobility owner saved applications/media/submission/status and staff moderation for all six offering types, including taxi operators. Operational review is a separate audited staff decision bound to an approved bike/taxi application revision; publication never grants dispatch eligibility. Driver/vehicle registration and assignment remain chunk10. The frontend is still the local preview and has not enabled these APIs; chunk9 must add taxi form options, normalized adapters, owner/staff controls and genuine public browsing/enquiries. No automatic push/deploy.

Backend checks:149 unit/API tests, typecheck/build and5 focused disposable PostgreSQL/HTTP scenarios pass. Rollback disables MOBILITY_APPLICATIONS_ENABLED while retaining records/history. Canonical status and contracts are in sibling grandline-backend/docs/implementation; no cross-repository source imports. Frontend behavior is unchanged by this documentation checkpoint.
