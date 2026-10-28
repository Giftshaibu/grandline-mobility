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
