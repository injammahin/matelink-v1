# Backend integration handoff

The frontend is deliberately isolated from a live backend. `AppContext.jsx` implements local equivalents of the following operations; replace them with your Laravel or other authenticated API client.

| Frontend operation | Suggested endpoint | Server responsibility |
| --- | --- | --- |
| Check service area | GET /api/service-area?postcode= | Approved coverage and validation |
| Calculate price | POST /api/pricing/estimate | Authoritative pricing, quantities, tax and scope |
| Request clean | POST /api/bookings | Validate fields, store immutable estimate snapshot, return reference and access token |
| View booking | GET /api/bookings/:token | Validate opaque, high-entropy token and authorise only this booking |
| Confirm/update job | PATCH /api/admin/bookings/:id | Admin authentication, allowed status transition, fixed confirmed total, notification queue |
| Get a quote | POST /api/quotes | Store requirements and private attachments |
| Record quote / acceptance | PATCH /api/admin/quotes/:id | Agreed amount and evidence of customer acceptance |
| Convert accepted quote | POST /api/admin/quotes/:id/booking | Copy supplied details once; prevent duplicate conversion |
| Request re-clean | POST /api/bookings/:token/recleans | Original completed End-of-Lease booking, policy eligibility, private uploads |
| Review re-clean | PATCH /api/admin/recleans/:id | Approved/declined/completed, audited review and notification |
| Start card checkout | POST /api/bookings/:token/payment-session | Server-calculated fixed amount and payment-provider hosted checkout |
| Card webhook | POST /api/webhooks/payment-provider | Verify provider signature and transaction amount; idempotently record payment |
| Notify bank transfer | POST /api/bookings/:token/transfer-notice | Await verification; customer notice never means Paid |
| Verify transfer | POST /api/admin/bookings/:id/verify-payment | Authorised manual check, auditable payment record |
| Contact enquiry | POST /api/contact | Validation, spam prevention and mail/CRM delivery |
| Settings | GET/PATCH /api/admin/settings | Admin-only mutation, approved public config subset |

Only expose public service and payment-receiving information to customers. Keep credentials, internal notes and admin records server-side. Avoid serving the frontend demo admin as a production dashboard.

Move photo files out of browser storage to private object storage, validate file content/type/size server-side, and authorise downloads. Use notification jobs after successful database transitions and prevent duplicate sends. Save the confirmed monetary amount and line items once; pricing settings must never retroactively alter historical confirmed totals.

The booking URL alone is an access credential. Use server-validated tokens, expiry/revocation appropriate to the business, private/no-store responses for customer views, and no indexable customer or admin URLs.

The service formula, coverage, GST treatment, notification copy, cleaning inclusions, quote acceptance workflow, cancellation/refund rules and Bond Back Guarantee conditions require client approval. No values for these have been silently assumed as business policy.
