# Matelink Cleaning — React Frontend

A complete, responsive frontend based on the supplied Matelink Cleaning Website Brief v1.0.

## Run the project

Install Node.js 22.12+ (Node.js 24 recommended), then open a terminal in this folder:

```bash
npm ci
npm run dev
```

Open http://localhost:4173. For an optimised production build:

```bash
npm run build
npm run preview
```

`dist/` includes the built frontend. Serve it over HTTP; opening index.html directly from the filesystem is not supported. Configure your production host to return index.html for React Router paths. `public/_redirects` includes the common static-host fallback.

## Stack

- React 19 with JavaScript / JSX, Vite, React Router
- Tailwind CSS 4 with a custom navy-and-teal CSS theme
- Authentic shadcn/ui new-york components, converted to JavaScript; Radix UI primitives
- Lucide icons, Sonner notifications, React Day Picker
- Locally bundled Manrope fonts and optimised WebP photographs

## Included screens

Home; Deep Cleaning; Move-In Cleaning; End-of-Lease Cleaning; What’s Included; Bond Back Guarantee; About; FAQs; Contact; Get a Quote; step-by-step Book Now; booking details and status; payment preview; linked re-clean request; draft Terms and Privacy; 404.

Admin preview: overview, booking review and confirmation, quotes, re-clean review, payments, service availability and add-ons, pricing, business settings, notification triggers and editable templates.

Open **http://localhost:4173/admin** to explore the admin preview. No login is needed for this frontend demo.

## Important scope

This is a frontend project, not a production backend. Demo data and submissions are stored in localStorage in the same browser; the in-progress booking is stored in sessionStorage. The admin is not authenticated. Photo attachments are resized for local preview storage. There is no real email delivery, remote file upload, card checkout or bank verification. Customer booking links work only in the same browser; they are not a substitute for server-validated secure access.

The UI labels preview actions clearly and never collects real card details. Card success is simulated. PayID/bank transfer notices remain awaiting verification until marked Paid in the admin demo.

## Pricing and service area

Missing client rates are intentionally `null`, not invented. The only supplied add-on price is Key Pickup or Drop Off: AUD 40 for one trip up to 20 km. Deep Cleaning add-ons and supported postcodes remain unconfigured until supplied.

1. Open `/admin/pricing` and enter approved service rates and property adjustments (use 0 when no adjustment applies).
2. Open `/admin/services` and supply approved add-on prices, units, availability and Deep Cleaning extras.
3. Open `/admin/settings` and supply supported postcodes, public contact/social details and public receiving payment details.
4. Try `/book`. Its displayed price recalculates from those settings.

The starting calculation is base + bedrooms × bedroom rate + bathrooms × bathroom rate + property adjustment + selected extras. This is a proposed configurable model, not a client-approved pricing formula. Replace `src/lib/pricing.js` if Matelink supplies a property matrix or different rules. An incomplete calculation displays “Price to be confirmed”.

Approved totals are fixed at confirmation; future global rate changes cannot re-price them. The three seeded sample bookings have no invented totals. The confirmed sample amount can be entered once through its admin detail panel to explore payments.

## Try the complete flow

1. Enter a postcode and request a clean through `/book`. No payment is collected.
2. Open `/admin/bookings`, review the request, enter an approved total and agreed date/time, and confirm it.
3. Open its customer view. The payment options are now available.
4. Simulate a card payment, or submit a PayID/bank transfer notice and verify it in admin.
5. Mark a confirmed job Cleaning, then Completed. An End-of-Lease booking now exposes the linked re-clean form.
6. Submit agent feedback, then review it in `/admin/recleans`.
7. Send a tailored quote request; record the approved quote and customer acceptance in `/admin/quotes`, then convert it into a booking. Customer details carry over. The converted booking remains pending so its date can be agreed before confirmation.
8. Check the generated email previews in `/admin/settings` → Email notifications.

## Project organisation

- `src/pages/`: complete customer and admin screens
- `src/components/ui/`: shadcn/ui JSX primitives
- `src/components/`: shared layouts and form components
- `src/context/AppContext.jsx`: local demo state and workflow transitions
- `src/data/content.js`: service content, defaults and unconfigured client values
- `src/lib/pricing.js`: calculation and postcode checking
- `src/styles/index.css`: theme, responsive layout and motion rules
- `docs/`: image credits, integration notes and verification details
- `tests/`: pricing and input validation checks

## Launch preparation

Connect authenticated APIs, durable storage, server-authorised booking tokens, actual mail delivery and a payment provider. Recalculate and validate prices server-side; use a verified payment-provider webhook to mark card payments Paid. Never put secret keys in Vite variables. See `docs/BACKEND_INTEGRATION.md`.

Cleaning inclusions and policy wording are expressly marked as drafts for approval. No reviews, ratings, awards, guarantees of full bond repayment or unsupported company statistics are included. The preview is `noindex,nofollow`; replace its robots policy and provide server-rendered or pre-rendered page metadata for production SEO.

All five photographs are bundled locally. Source and photographer credits are in `docs/IMAGE_CREDITS.json` and `docs/IMAGE_CREDITS.md`. The Matelink mark is extracted from the supplied brief. Stock images illustrate service contexts; they do not document Matelink’s actual jobs or assert Australian locations.

## Checks

```bash
npm test
npm run build
```

See `docs/VERIFICATION.md` for the checks performed on this package.
