# Current state - 2026-11-06

Latest correction: shared UI 0.6.1 remembers welcome dismissal/selection across navigation and refresh for the browsing session. Desktop/tablet listing action is visible again. Working set: shared package/archive, `src/styles.css`, `tests/shared-welcome.test.tsx`, `e2e/welcome-session.spec.ts`. Six owning component cases, typecheck/lint/build pass; browser checks cover choice/navigation/refresh and listing entry access. Production submission switches remain off while the user connects Render/Vercel. See sibling Auto `docs/WELCOME_AND_LISTING_FIX.md`. Branch: `codex/unified-live-submissions`; see Git HEAD for checkpoint.

## Binding implementation checkpoint

Phase: local implementation verified for recorded checks; hosted activation/live acceptance pending. Installs identical shared 0.6.0 archive. Shared header/account/welcome/cards/fields/listing layout/review replace the differing presentation. Dashboard resume restores selected owner applications; saved photos have authorized previews. Ride controls retain pickup, destination, quotes and assignment; dispatch eligibility remains separate. Existing stylesheet edits were retained.

Working set: application-fields/photos/wizard, auth, business-dashboard, live-application-actions, mobility-card, ride-form, shell, new saved-application-photo, use-saved-application, styles, archive/lock and tests. Typecheck/lint/build and final complete suite of all 67 tests pass. All local desktop/mobile entry/welcome checks pass refresh, 64px header, 224px desktop sidebar and no overflow/page exceptions. Full later-step parity, cross-domain sessions and live journeys are unverified.

Evidence: sibling Auto `docs/UNIFICATION_IMPLEMENTATION.md` and screenshots. Next: correct Clerk/hosting access, configure Mobility domain/origins/notification links and capabilities; backend-first deployment and genuine owner/staff/media/payment/ride journeys. Branch/checkpoint: see Git HEAD; no automatic push. Historical summary below is not deployment evidence.

Mobility consumes the versioned @grandline/ui archive for catalogue cards, grids, listing progress, and a product-specific welcome dialog. Headers use Clerk avatar controls. The listing form removes manual application-ID entry and shows maintenance before the long form while the live action is disabled. The source default uses mobility.grandlineautomw.com.

Source was pushed to main at 86211c2. Typecheck and production build passed; the earlier suite passed 66 tests. The public Mobility domain returns HTTPS 200, but deployed version and authenticated journeys remain unverified. The live backend capability endpoint returned all Services, Mobility, and rides flags false on November 6. Real submissions and rides require hosting activation and end-to-end verification.
