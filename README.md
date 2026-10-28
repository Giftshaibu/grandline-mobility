# Grandline Mobility

Independent frontend for the Grandline ecosystem. Uses the Auto Hub React/TanStack Start stack and brand assets. No separate backend or cross-repository source imports.

## Local development

Use Node 22.12+ and npm. Run `npm ci`, copy .env.example to an untracked .env, then `npm run dev -- --port 8082`. Leave both Clerk keys empty for public browsing. Set a real publishable key and server-only CLERK_SECRET_KEY together to enable account controls. Never put secrets in VITE_* variables.

`npm run build` generates the TanStack route tree and Vercel output. Then run `npm run typecheck`, `npm run lint`, `npm test`. Install Chromium with `npx playwright install chromium`, then run `npm run test:e2e` for desktop/mobile checks. Playwright uses the built Nitro production preview; rebuild after source or environment changes. `npm run preview -- --port=8082` previews the Vercel artifact locally. Test fixtures remain under tests/; no fixture providers are rendered in the app.

## Current integration status

| Capability | Status |
|---|---|
| Independent shell, responsive discovery/detail routes, URL criteria | Implemented frontend |
| Provider/listing cards and detail presentation | Implemented; validated fixture data only in tests |
| Category lookup, directory search and profile data | Blocked: shared backend endpoints absent |
| Enquiry transmission | Blocked; form visibly disabled |
| Live authenticated enquiry/session across products | Blocked: backend contracts and Clerk host configuration |
| Production deployment | Not performed |

See docs/api/PROPOSED_CONTRACTS.md before backend work. src/lib/directory.ts deliberately uses an unavailable gateway. The exported HTTP adapter is for isolated contract verification and is not connected to production UI. There is no fake success, booking, checkout, live availability promise or provider onboarding.

## Source and continuity

Read AGENTS.md, docs/CURRENT_STATE.md, docs/implementation/GRANDLINE_FRONTENDS_PROGRESS.md and docs/implementation/DISCOVERY.md. Existing Auto Hub files were copied selectively with provenance recorded there. No existing Markdown specifications were overwritten.
