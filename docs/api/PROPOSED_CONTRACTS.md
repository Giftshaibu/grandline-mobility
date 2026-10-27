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
