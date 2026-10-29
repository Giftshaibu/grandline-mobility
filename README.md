# Grandline Mobility

Independent frontend for the Grandline ecosystem. Uses the Auto Hub React/TanStack Start stack and brand assets. No separate backend or cross-repository source imports.

## Local development

Use Node 22.12+ and npm. Run `npm ci`, copy .env.example to an untracked .env, then `npm run dev -- --port 4302`. Leave both Clerk keys empty for public browsing. Set a real publishable key and server-only CLERK_SECRET_KEY together to enable account controls. Never put secrets in VITE_* variables.

`npm run build` generates the TanStack route tree and Vercel output. Then run `npm run typecheck`, `npm run lint`, `npm test`. Install Chromium with `npx playwright install chromium`, then run `npm run test:e2e` for desktop/mobile checks. Playwright uses the built Nitro production preview; rebuild after source or environment changes. `npm run preview -- --port=4302` previews the Vercel artifact locally. Test fixtures remain under tests/. User-requested, clearly labelled sample catalogue records are separately defined in src/lib/sample-catalogue.ts for interactive browsing. They are never backend inventory.

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

## Marketplace design release

The header, search dialog, mobile menu, category shortcuts, image-led heroes and footer follow Auto Hub. Product destinations stay hidden when unconfigured. Hero images are licensed editorial photographs bundled locally; they are not inventory.

Mobility adds /heavy-duty and /heavy-duty/$slug alongside hire, commercial transport and logistics. /bike-pickup supports a local draft/review only; it sends and saves nothing. Request submission, fare acceptance and assignment remain disabled until staff-coordinated backend support exists.

Local preview/browser checks use 4302 because Windows reserved the previous ports. Build before starting the production preview. Backend contracts remain proposed in docs/api/PROPOSED_CONTRACTS.md.

## Sample catalogue

Browse cards and detail pages while the directory is unavailable. Samples carry Example names, illustrative photos and repeated sample labels, with local category/location/text filtering and name/location sorting. They contain no contact details and cannot be booked. Real gateway errors are not turned into sample success, and no database records are created. Sample detail slugs use the reserved sample- prefix and noindex/nofollow metadata.

## Listing application preview

Visit /list to prepare a vehicle hire, heavy-duty, commercial, logistics or bike-operator application. Six steps provide validation, optional local photos, contact information, editable review and informational fee guidance. Drafts are memory-only. Final submission is disabled; no backend record, upload, payment or sample listing is created.
