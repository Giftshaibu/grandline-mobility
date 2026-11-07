# Current state — November 7, 2026

Objective: implement shared image viewing and owner View/Edit/Delist controls across the three sites. Phase: release verification.

Completed: shared UI 0.7.2 image galleries/expanded viewer with 100–400% zoom, minimise/close, keyboard navigation and focus restoration; owner listing actions, confirmation/errors and clear public visibility status. Auto approved edits return to pending review; Services/Mobility use saved owner revisions. Backend migration and authenticated, audited delisting preserve media, moderation restrictions and billing coverage.

Working set: shared package/archive; public detail galleries and application/private photo previews; account menu/dashboard, owner-listing/delist actions and existing editors. Backend ownership and API details plus verification evidence are in Auto `docs/IMAGE_VIEWING_AND_OWNER_LISTINGS.md` (sibling repository for Services/Mobility).

Verification: 166 backend unit tests pass; focused real local PostgreSQL ownership/concurrency/coverage/publication checks pass, including rollback when the final audit fails. Services/Mobility focused component tests pass 10/9 cases. Desktop/mobile image viewer browser checks pass including uncropped portrait/landscape, zoom, Escape/focus, private-preview styles and no overflow/page errors. All three production builds, typechecks and lint checks pass.

Known limits: no fake production owner/media/payment records created; full real signed-in production owner mutations and cross-domain Clerk acceptance still require a genuine owner session. Current Clerk instance is a development instance; notification delivery remains disabled. See Auto `docs/HOSTED_ACTIVATION.md` for existing activation evidence and broader acceptance limits.

Next: finish backend-first deployment and verify hosted versions/read-only live behavior. Backend feature commit: be3a094; production audit migration verified with all 27 migrations current. Branch: codex/unified-live-submissions. Checkpoint: Git HEAD.
