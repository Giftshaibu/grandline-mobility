# Proposed contracts — NOT implemented

Status: Blocked. These interfaces are a frontend proposal, not existing server routes. The UI uses a disabled adapter and sends no directory requests. Backend approval and implementation are required before enabling it. The source schema is src/lib/contracts.ts; no backend implementation is included.

| Proposed operation | Request | Response | Auth |
|---|---|---|---|
| GET /api/v1/mobility/categories | kind=hire/commercial/logistics for Mobility | array of slug/name | Public |
| GET /api/v1/mobility | q, location, category, cursor, limit (default 20, max 50), kind required for Mobility | items and opaque nextCursor/null | Public |
| GET /api/v1/mobility/:slug | slug, kind as query for Mobility | Entry or 404 | Public |
| POST /api/v1/mobility/enquiries | listingId UUID, name (1–120), email (valid, max 254), message (10–2000) | id UUID, status=submitted | Bearer Clerk session token |

Search strings are trimmed and limited (q/location 120, category 80). Empty criteria are omitted; URLs round-trip criteria. Proposed results sort stably by backend relevance then ID; cursor ownership and validation remain backend concerns. No client-side filtering of partial result pages. No ratings or verification claims in this proposal. Images and external links allow HTTP(S) only.

Mobility entries discriminate hire/commercial/logistics. Hire may expose whole-MWK price per day/week/month/trip, passenger capacity and transmission. Commercial may expose capacity and optional price. Logistics exposes actual service areas and optional cargo types. All include provider identity/contact and optional terms.

Failures: 400 invalid criteria, 401 sign-in required, 403 unauthorized, 404 detail absent, 409 duplicate/conflicting enquiry, 429 throttling, 5xx unavailable. Map network errors and malformed data separately from successful empty lists. Abort stale requests. Never treat an error response as an empty directory or a successful enquiry.

Implementation blockers: category/search/detail/enquiry routes; persistence and indexes; provider publication/moderation; enquiry ownership, audit, rate limiting and deduplication; Clerk authorized parties and production CORS. No dates, routes, cargo or passenger requirements in enquiry v1; add only after a backend contract is approved.

Activation: implement and validate server routes, add real integration tests, then replace the explicitly disabled adapter in a dedicated reviewed commit. There is no environment switch that silently enables proposed endpoints.

## Marketplace extension — proposed, blocked

No operations in this section exist in the shared backend. No frontend HTTP calls are made to these routes.

### Unified shops

One stable shop UUID/slug identifies a staff-managed business across Services and Auto Hub. Proposed shop category/list/detail operations support normalized q/location/category and cursor pagination consistent with the directory contract. Shop detail carries supplied description, location, contact, images and an array of services (name, category, optional description). Missing optional fields are omitted.

Staff creates/edits/publishes profiles and assigns an owner identity; owner management requires backend authorization and existing parts moderation, never frontend role checks alone. Public responses exclude private ownership/contact records. A part listing may have a nullable shopId; independent sellers remain valid. Shop assignment must be authorized and public inventory includes only published parts. Shop-filtered parts discovery is proposed; until implemented, UI links only to configured Auto Hub /parts, explicitly labelled all spare parts. No shop filter or inventory count is invented.

### Heavy-duty hire and bike pickup

Heavy-duty directory entries use kind heavy-duty, category, supplied vehicleType, optional cargoCapacityKg, operatorIncluded, hire terms and whole-MWK price. Operator inclusion is shown only if explicitly supplied. Discovery filters remain q/location/category; dates and availability are not promised.

Future authenticated pickup creation accepts pickup/destination text, name, contact number and optional notes. Backend validation and rate limiting are required. Public forms currently validate a local draft only, never transmit or persist personal data. Proposed staff-controlled workflow: requested → availability-check → quoted → accepted → assigned → completed, with cancellation available under agreed operational rules.

Staff checks coverage and availability, issues a manual whole-MWK quote and assigns a rider only after the customer accepts that exact quote. Quote identity/version and auditable acceptance must prevent stale fare acceptance. Only the requesting customer and authorized staff may read requests or quotes; assigning and quoting require staff permissions. No public rider contact or location feed. Real quote expiry/cancellation policy must be agreed with operations before backend implementation. Until then there is no endpoint, fare, request status or rider assignment to display. No matching, tracking, automatic fare or payment integration is included.

### Local catalogue samples

The user subsequently approved a placeholder catalogue for browsing. Its records are frontend-only, explicitly marked samples and not API fixtures/responses, published stock or business identities. No contract implementation is implied by cards, sample rates or sample detail routes. Live creation, enquiry, inventory and shop ownership remain blocked.
