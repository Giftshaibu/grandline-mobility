# Discovery — 2026-10-27

Auto Hub is a React 19 / TanStack Start frontend using React Query, Tailwind 4, Hugeicons, Clerk and a Vercel-compatible Nitro build. The separate shared backend uses Express 5, Prisma/Postgres, Supabase Storage and Resend, deployed through Render. Both original working trees were clean.

This is the independent Grandline Mobility repository. No workspace migration or shared package is required. Copy only branding assets, semantic CSS tokens, router patterns and app-controlled Clerk appearance. No marketplace fixtures or private billing code.

Existing references: Auto Hub AGENTS.md, docs/CURRENT_STATE.md, docs/COMPONENT_MAP.md, docs/DECISIONS.md, docs/product/PRODUCT.md, docs/features/SPARE_PARTS.md, and backend CURRENT_STATE.md/LISTING_BILLING_LAUNCH.md. The older product mock-MVP description and D-003 fixture decision predate working catalogue APIs. Runtime code/current handoffs define implemented behavior; the approved ecosystem plan defines this work. Original documents are not silently rewritten.

Backend catalogue, submissions, billing, reservations and spare-parts modules exist. Services/providers, rentals, commercial transport and logistics modules do not. These apps cannot claim working discovery or enquiry integrations. Existing service fee information creates no provider workflow.

Dependency order: foundation → domain schemas → discovery/profile UI → API boundary tests → ecosystem/auth checks → deployment handoff. Keep Services and Mobility independently deployable. Backend implementation, booking, payments, onboarding, availability guarantees and production deployment are excluded.

Provenance: public logo/icon assets, src/styles.css tokens and src/router.tsx originate from Giftshaibu/grandline-auto-hub at 55686ef. Local copies intentionally avoid cross-repository imports. No user data is copied.
