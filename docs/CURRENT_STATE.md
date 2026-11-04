# Current state - 2026-11-04

## Objective and phase

Chunk 12 notifications and operational views are implemented. Chunk 13 local database verification is complete; hosted provider/account checks and production seed cleanup remain gated on Supabase, Render and Vercel access. Immediate publication with Pending review and seven-day initial payment grace remains in place.

## Completed

Owner dashboards now show private notifications and received/sent enquiries. Staff dashboards show redacted delivery status and audited, reasoned retries. Notifications use the owning product origin; relative inbox paths and the separate optional appOrigin field preserve existing constraints. No delivery is claimed merely because a message was queued. Draft/account scope reset and existing Clerk role boundaries remain intact. Existing listing/billing UI, production sample suppression, inventory links and ride operational approval are preserved.

Backend dependencies: migrations 20261104120000_ecosystem_notifications and 20261104130000_notification_product_origins, plus the existing listing-grace migration. ECOSYSTEM_NOTIFICATIONS_ENABLED defaults false until configured staging checks pass. API details and rollback are in sibling grandline-backend/docs/implementation/ECOSYSTEM_NOTIFICATIONS.md.

## Verification

66 unit/component tests pass, including inbox errors/read handling and reasoned retries. Typecheck, lint and production build pass. Backend unit suite has 163 passing cases; database regression passed 69 cases with dedicated cleanup tests reserved for two separate databases, where both passed. Additional focused notification/ride/privacy/renewal checks passed. All 26 migrations were applied only to disposable local PostgreSQL. Real Clerk/Supabase/Resend/Maps account journeys are not claimed verified.

## Live evidence and next action

The earlier Services/Mobility listing-release commits have successful Vercel statuses. Backend health/readiness return 200. Two known seeded spare-part URLs still return 200; production cleanup is outstanding. Connect the hosting/database accounts, verify deployed versions and live flags, apply guarded cleanup with backups, and complete owner/staff/provider smoke checks before notification activation. No production database records or settings were changed by local verification.

Branch: main. Focused release commits and checkpoints are recorded in Git. Preserve source-owned routing; never edit routeTree.gen.ts manually. Historical work remains in Git.
