# Frontend progress

Updated 2026-10-28. Acceptance follows the approved frontend-first plan. Frontend complete does not mean live data or enquiries are enabled. Every absent backend operation remains blocked; see docs/api/PROPOSED_CONTRACTS.md.

| Chunk | Objective | Dependencies | Status | Acceptance/checks | Commit |
|---|---|---|---|---|---|
| 0.1 | Discovery | Existing runtime/handoffs | Complete | Source inspection | a8c24e8 |
| 0.2 | Contract register | 0.1 | Complete | Schema and adapter tests | 53a9566 |
| 1.2 | Independent foundation | 0.1, 0.2 | Complete | Production build, typecheck, lint | 8d9ab87 |
| 1.3 | Test foundation | 1.2 | Complete | 26 unit/component + 10 desktop/mobile browser tests | a21dd45 |
| 3.1 | Discovery and URL filters | 1.2, 0.2 | Frontend complete | URL round trips, mobile/desktop, keyboard and SSR | 3bb5686 |
| 3.2 | Detail and enquiry presentation | 3.1 | Frontend complete | Unavailable profiles; enquiries disabled | 583290c |
| 3.3 | Live API integration | Missing shared backend endpoints | Blocked | Typed adapter/schema tests pass; production gateway unavailable | 93f14b3 |
| 4.1 | Configured ecosystem navigation | Independent shells | Complete | Blank destinations hidden; Hub checks passed | Hub 4b04c1d |
| 4.2 | Live identity and authenticated regression | Approved Clerk origins/keys and backend | Blocked | Guest browser tests pass; signed-in production checks outstanding | b56c23f |
| 5.1 | Deployment handoff | Build/test foundation | Complete | Independent builds and instructions; no deployment | See final documentation commit |

## Rollback and release boundaries

Each chunk rolls back through a normal Git revert or previous Vercel deployment. No migrations or cross-repository source imports belong to either new frontend. Preserve the proposed-contract gate when reverting UI. Unit fixtures stay in tests; no production providers or simulated successful enquiries are supplied. CI configuration is committed but remote CI has not run because nothing was pushed.

The local Playwright runs exercised built Nitro previews: all 10 desktop/mobile tests passed per app. Windows preview processes needed explicit shutdown after browser workers finished; for repeat local runs, start `npm run preview` separately and let Playwright reuse it, then stop it yourself. Linux CI manages its own preview.

Auto Hub typecheck/build passed; lint has six existing fast-refresh warnings and no errors. Real catalogue/seller/staff/auth smoke tests require working backend and Clerk configuration. Cross-domain identity and production publication remain unverified.

## Production demo cleanup

Backend tooling is complete in commits 5caa4cb, 9e89770, 816290e and 07dfb45. Full backend unit/API suite: 119 passed; typecheck/build passed. Exact six seed IDs only, identity/dependency blockers, default dry-run, digest recheck, serializable apply and backup are implemented. The disposable PostgreSQL rollback/restore integration scenario and CI are prepared but were not executed locally because the Docker daemon is unavailable.

Production inventory, backup and deletion remain blocked by missing server-side credentials. No production connection or data change occurred. Follow ../grandline-backend/DEMO_CATALOGUE_CLEANUP.md, run the disposable database rehearsal, produce the exact affected-record preview/backup and obtain approval before deletion. Preserve reservations and linked submissions. No automatic push or deployment.

## Marketplace design and connected shops — 2026-10-28

Objective: match Auto Hub marketplace composition and introduce connected shop/heavy-duty/bike journeys. Dependencies: existing independent foundations; no backend implementation. Acceptance: responsive search/header/footer, real category links, image-led heroes, disabled unsupported journeys, no fabricated listings or inspection promises. Shared shop identity is proposed; spare-part links use only configured Hub /parts.

Checks: typecheck/lint/build, domain/component tests, desktop/mobile browser search, menus, filters and unavailable states. Final results are recorded in CURRENT_STATE.md. Rollback: revert the focused marketplace commits or redeploy the prior artifact. Commits: see Git history for feat(marketplace), test(marketplace) and docs(marketplace). Production activation remains blocked by backend operations and approved configuration.

Marketplace acceptance complete: shell 9ecd65d, journeys ee9242a, photos 8f0bf03/cdf6686 and tests 9e0f142. Typecheck/lint/build passed; 28 unit/component and 18 desktop/mobile browser tests passed. Preview port 4302 avoids Windows reserved ports. Screenshot checks wait for local image decoding. Backend integration and production identity remain blocked.

## Hover menus and user-approved sample catalogue — 2026-10-28

Objective: fix desktop hover/chevron alignment and allow catalogue browsing rather than an unavailable-only page. Dependencies: existing local catalogue presenters; no backend. User explicitly requested placeholder directory content, superseding the earlier empty-directory-only presentation. Acceptance: filter/sort labelled samples, open sample details, preserve disabled enquiries and isolate records from real gateways/database. Source 365ef76, tests 5c7cd33. Typecheck/lint/build and 30 unit/component tests pass; 21 browser tests pass, with the desktop-only hover check skipped on mobile. Rollback: normal revert of the catalogue commits or previous deployment. Production backend support remains blocked.

## Listing application flows — 2026-10-29

Objective: public business-prepared applications through review, with real submission blocked. Dependencies: existing local shell, categories, optional Clerk configuration and media rules from Auto Hub. Acceptance: six validated steps, conditional offerings, optional local photos, contact/review/edit/reset, informational fees, visible listing entry points and no network/persistence/publication.

Source 20b639c; tests 60ba26f; privacy fix 21f1dbd; final page-exit test and documentation commits follow in Git history. Typecheck/lint/build pass; 38 unit/component tests pass. Full browser baseline: 33 passed, one mobile hover-only skip. Final affected application/keyboard/page-exit checks: 16 passed. No-JavaScript controls are disabled. No draft enters the sample catalogue or backend.

Business applications supersede staff-created-only profiles; staff approval and backend authorization remain future requirements. Rollback: revert these application feature commits or redeploy the prior independent frontend. No migration or database rollback is required. Real submissions, uploads, owner status, staff moderation and publication remain blocked pending the proposed shared-backend contracts. No automatic push or deployment.

## Backend roadmap update — 2026-10-29

Canonical backend register: sibling grandline-backend/docs/implementation/BACKEND_INTEGRATION_PROGRESS.md and ECOSYSTEM_API.md (documentation references only, no source imports). Shared business ownership and Services draft/media/submission APIs are implemented behind default-off server capabilities. Frontend adapters remain unchanged and unavailable. Services moderation and business-product billing core are now implemented/default-off; publication and enquiries are next dependencies; Mobility and ride requests remain blocked. No frontend local preview has become a live submission. Both repositories will update contracts/handoffs when chunk 6/9 activates actual adapters.

## Backend roadmap chunk8 — 2026-10-31

The shared backend now implements default-off Mobility owner saved applications/media/submission/status and staff moderation for all six offering types, including taxi operators. Operational review is a separate audited staff decision bound to an approved bike/taxi application revision; publication never grants dispatch eligibility. Driver/vehicle registration and assignment remain chunk10. The frontend is still the local preview and has not enabled these APIs; chunk9 must add taxi form options, normalized adapters, owner/staff controls and genuine public browsing/enquiries. No automatic push/deploy.

Backend checks:149 unit/API tests, typecheck/build and5 focused disposable PostgreSQL/HTTP scenarios pass. Rollback disables MOBILITY_APPLICATIONS_ENABLED while retaining records/history. Canonical status and contracts are in sibling grandline-backend/docs/implementation; no cross-repository source imports. Frontend behavior is unchanged by this documentation checkpoint.
