# Bike/taxi ride requests

Code implemented, default off: backend RIDE_REQUESTS_ENABLED and frontend VITE_RIDES_LIVE. Backend requires Mobility discovery and migration 20261101080000_ride_requests. PostgreSQL btree_gist protects assignment windows; the migration role must support that extension. /ride is public to explore; saving/status/acceptance require authenticated provisioned ownership. /bike-pickup redirects with bike selected. Trip fares remain offline and separate from monthly fees.

## APIs and state

- Owner GET/POST /api/v1/rides and GET/PATCH /:id. Create {requestKey,journey}; amend {expectedVersion,journey}. Journey: kind bike/taxi,timing now/scheduled,scheduledAt null/ISO,pickup/destination {address,landmark,lat,lng,placeId},passengers,contactName,phone,notes. Bike supports one passenger; taxi one to eight, subject to approved vehicle capacity. Enter Malawi local time; store timezone-qualified UTC.
- POST /rides/:id/accept uses expectedVersion/quoteId. Ownership,current revision/journey,expiry and state are checked atomically. Repeated identical acceptance creates no duplicate event.
- Staff GET /staff/rides supports status/limit/cursor; GET/:id and POST/:id/quote,/assign,/status require org:admin. Quote {expectedVersion,amount,inclusions,reason}; assignment {expectedVersion,driverId,vehicleId,startsAt,endsAt,reason}; status {expectedVersion,status,reason}. Reasons mandatory. Operational windows must include pickup and prevent overlaps; they are not promised ETAs.
- GET /staff/rides/resources/:applicationId; POST /resources/driver or /resources/vehicle creates separately reviewed approved/suspended records. Driver: applicationId,name,phone,status,reason. Vehicle: applicationId,kind,label,registration,passengers,status,reason. POST /resources/driver|vehicle/:id/status requires expectedVersion/status/reason. Current operator approval is mandatory; sales/hire listings never become ride resources automatically.

States: requested → availability-check → quoted → accepted → assigned → in-progress → completed; staff can cancel active requests. Fare expires after 24 hours or at scheduled pickup, whichever comes first. New quotes replace previous acceptance. Pre-assignment journey changes invalidate fare/acceptance. Assigned/closed trips cannot silently change route/price. Start rechecks current eligibility and active work. PostgreSQL exclusions independently block overlapping driver/vehicle windows. Completion/cancellation releases reservations and preserves history. Assignment contact is private to owner/staff; no ride data enters public catalogue.

Visible-page polling refreshes every 15 seconds after success, backs off 30/60/120 seconds after failures, pauses hidden/offline, and exposes stale/error state. Terminal records stop polling. No GPS feed, WebSockets, self-acceptance, automatic matching, fare generation or online trip payment.

## Maps

VITE_GOOGLE_MAPS_BROWSER_KEY is a restricted browser key, not a server secret. Enable Maps JavaScript and Places API (New), billing, quotas and exact referrers. Empty/failing integration preserves typed addresses. Maps loads only after Open Google Maps; geolocation only after Use my location. PlaceAutocompleteElement owns session tokens/attribution and uses gmp-select/toPlace/fetchFields for id,formattedAddress,location. Failures preserve manual entry. No route/fare/ETA is calculated.

Customers check/edit and confirm addresses/landmarks. Google-derived coordinates stay transient and are stripped by frontend/backend; persist customer-confirmed input and the permitted place ID. Manual pins/geolocation are customer-supplied. Do not cache Google place content or remove attribution. Before production Maps activation, supply/verify business-approved public terms/privacy policies incorporating the required Google references. Current UI disclosure links Google's terms/privacy; it does not replace the business policy.

Primary references checked 2026-10-31: [New widget](https://developers.google.com/maps/documentation/javascript/place-autocomplete-new), [widget sessions](https://developers.google.com/maps/documentation/javascript/reference/places-widget), [keys](https://developers.google.com/maps/documentation/javascript/get-api-key), [Places policies](https://developers.google.com/maps/documentation/places/web-service/policies). Actual provider/key/billing behavior needs configured staging; fixtures do not prove it.

## Rollback

Disable frontend/backend ride gates and restore previous deployments. Retain all request/quote/assignment/audit history and additive schema. Notifications are chunk 12; controlled external journeys and rollout are chunk 13. Demo cleanup remains separate and approval-controlled.
