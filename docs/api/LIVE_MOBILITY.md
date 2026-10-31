# Implemented Mobility integration

Code implemented, default off. VITE_MOBILITY_LIVE requires the matching backend with business profiles, Mobility applications, business-product billing, Mobility discovery and applied migrations. Clerk/private Supabase storage are required for owner/staff workflows. Browsing needs no sign-in; backend capabilities remain authoritative. Live errors never substitute samples.

## Public

GET /api/v1/mobility/categories returns [{type,categories:string[]}]. GET /mobility/catalogue/:kind accepts q/location/category/limit/cursor and returns {items,nextCursor}. GET /mobility/catalogue/:kind/:slug returns a safe offering/provider DTO. All six types have browsing/detail routes. Descriptions/terms support 2000 characters. Missing fields are omitted; advertised whole-MWK rates are not ride fares or confirmed bookings.

Authenticated POST /mobility/enquiries accepts listingId,requestKey,name,email,message. Only a validated persisted {id,status:submitted} confirms receipt. Keys survive identical retries and change with edited content. Public phone requires consent; notification delivery is a later capability.

## Owner and staff

/mobility/applications supports create/list/detail/PATCH/submit/revise and scoped media reservation/retry/completion/read/removal using the shared Services envelopes. One offering per application; several offerings per business/product. Photos: up to eight nonempty JPEG/PNG/WebP files, each at most 12 MB. Only explicit saving uploads. The Clerk token never goes to storage; interrupted uploads retry reserved slots after checking completion.

Business selection/save uses owner-authorized /businesses and expected-version product participation. Staff queue/detail/review/publish/unpublish preserves authorization, versions and audit reasons. Approval is separate from payment verification/publication. /business-billing/:businessId/mobility and staff counterpart use one explicit monthly quote per business/product. Guidance is never summed or treated as vehicle-sale tiers; taxi remains staff-quoted. Staff verifies actual external receipts. Coverage/renewal/overdue behavior follows shared billing, independently of vehicle fees.

GET/POST /staff/mobility/applications/:id/operator-approval records a separate operational decision bound to an approved bike/taxi application revision. Publication never enables dispatch. Driver/vehicle registration and assignment are described in RIDES.md.

## Provenance

Local auth, wizard, business API, upload retry, saved application, billing, dashboard, staff review and enquiry foundations were adapted from Grandline Services commit 117e9c9. They are independent copies with Mobility-specific parsing/routes. No cross-repository source imports or private vehicle billing were copied. Historical proposed routes remain in PROPOSED_CONTRACTS.md; this document records implemented contracts.
