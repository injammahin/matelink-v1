export const services = [
  {
    id: 'deep', slug: 'deep-cleaning', name: 'Deep Cleaning', short: 'Deep clean',
    eyebrow: 'A little extra care', title: 'A deeper clean.\nA lighter feeling.',
    summary: 'Give the spaces you live in every day a little more attention. A thorough refresh for kitchens, bathrooms and the details in between.',
    cardText: 'For lived-in homes that need a little extra attention.',
    image: '/images/deep-cleaning.webp', imageAlt: 'Bright, carefully finished kitchen with clean worktops',
    ideal: 'Refreshing your current home',
    includes: ['Kitchen surfaces and splashbacks', 'Bathroom surfaces and fixtures', 'Accessible surfaces and skirting boards', 'Vacuuming and mopping floors'],
  },
  {
    id: 'move-in', slug: 'move-in-cleaning', name: 'Move-In Cleaning', short: 'Move-in clean',
    eyebrow: 'Make yourself at home', title: 'New keys.\nA fresh beginning.',
    summary: 'Start your next chapter with a home that feels ready for you. Choose your property details and the extras your new space needs.',
    cardText: 'A fresh beginning, before the first box is unpacked.',
    image: '/images/move-in-cleaning.webp', imageAlt: 'Light modern home interior ready to move into',
    ideal: 'Preparing your next home',
    includes: ['Kitchen and bathroom attention', 'Accessible empty cupboards', 'Accessible surfaces and skirting boards', 'Vacuuming and mopping floors'],
  },
  {
    id: 'end-of-lease', slug: 'end-of-lease-cleaning', name: 'End-of-Lease Cleaning', short: 'End-of-lease clean',
    eyebrow: 'Leave on a clean note', title: 'A thoughtful finish\nto your time at home.',
    summary: 'Get ready for your handover with cleaning tailored to the agreed scope. Our Bond Back Guarantee covers eligible cleaning concerns, subject to Matelink’s terms.',
    cardText: 'A considered clean for your next property handover.',
    image: '/images/end-of-lease-cleaning.webp', imageAlt: 'Clean unfurnished apartment interior prepared for a handover',
    ideal: 'Preparing for a rental handover',
    includes: ['Kitchen and bathroom attention', 'Accessible empty cupboards', 'Accessible surfaces and skirting boards', 'Vacuuming and mopping floors'],
  },
];

export const sharedAddons = [
  { id: 'carpet', name: 'Carpet Steam Clean', description: 'Add attention for your carpets.', quantity: true, unit: 'room', price: null, active: true, group: 'shared' },
  { id: 'windows', name: 'External Window Clean', description: 'Accessible external windows.', quantity: true, unit: 'window', price: null, active: true, group: 'shared' },
  { id: 'garage', name: 'Garage Sweep', description: 'A sweep of the garage floor.', quantity: false, price: null, active: true, group: 'shared' },
  { id: 'deck', name: 'Deck Clean', description: 'Refresh an accessible outdoor deck.', quantity: false, price: null, active: true, group: 'shared' },
  { id: 'patio', name: 'Patio Clean', description: 'Add your outdoor patio.', quantity: false, price: null, active: true, group: 'shared' },
  { id: 'small-balcony', name: 'Small Balcony', description: 'Include a small balcony.', quantity: false, price: null, active: true, group: 'shared' },
  { id: 'large-balcony', name: 'Large Balcony', description: 'Include a large balcony.', quantity: false, price: null, active: true, group: 'shared' },
  { id: 'fridge', name: 'Inside Fridge', description: 'The inside of an empty fridge.', quantity: false, price: null, active: true, group: 'shared' },
  { id: 'blinds', name: 'Blinds Clean', description: 'Priced per blind. Choose your quantity.', quantity: true, unit: 'blind', price: null, active: true, group: 'shared' },
  { id: 'keys', name: 'Key Pickup or Drop Off', description: '$40 for one trip up to 20 km. Other distances require a quote.', quantity: false, price: 40, active: true, group: 'shared' },
];

// Client pricing is deliberately unconfigured. Never present guessed prices as Matelink rates.
export const initialSettings = {
  serviceRates: Object.fromEntries(services.map(s => [s.id, { base: null, bedroom: null, bathroom: null, active: true }])),
  propertyAdjustments: { apartment: null, house: null, townhouse: null },
  addons: sharedAddons,
  postcodes: [],
  taxNote: 'Tax treatment will be confirmed with your price.',
  contactEmail: '', phone: '', showPhone: false, facebook: '', instagram: '',
  payid: '', bankName: '', bankAccountName: '', bankBsb: '', bankAccount: '',
  notifications: { submitted: true, confirmed: true, cleaning: false, completed: true, paid: true, cancelled: true, reclean: true },
  templates: {
    submitted: 'Hi {{name}}, we have received your request {{reference}}. We will review your preferred date and confirm the details.',
    confirmed: 'Hi {{name}}, your clean {{reference}} is confirmed. View your booking and payment options using {{booking_link}}.',
    cleaning: 'Hi {{name}}, your clean {{reference}} is now in progress.',
    completed: 'Hi {{name}}, your clean {{reference}} is complete. You can view your payment options using {{booking_link}}.',
    paid: 'Hi {{name}}, payment for {{reference}} has been recorded. Thank you.',
    cancelled: 'Hi {{name}}, your booking {{reference}} has been cancelled. Please contact us if you need help.',
    reclean: 'Hi {{name}}, the status of your re-clean request for {{reference}} has changed. View {{booking_link}} for details.',
  },
};

export const faqs = [
  { q: 'Is my booking confirmed when I submit?', a: 'Your preferred date and time are a request. Matelink reviews your details and confirms the job with you before it goes ahead.' },
  { q: 'Do I need to pay when I request a clean?', a: 'No. There is no payment at the request stage. Once your booking is confirmed, payment options become available and remain available after the clean.' },
  { q: 'Which clean should I choose?', a: 'Choose Deep Cleaning for a refresh of your current home, Move-In Cleaning before settling into a new property, or End-of-Lease Cleaning for a rental handover. If you are unsure, use Get a Quote.' },
  { q: 'Can I add extra services?', a: 'Yes. Move-In and End-of-Lease share a set of optional extras. Deep Cleaning has its own separately configured options. Available extras appear when you choose your service.' },
  { q: 'What if my property needs something different?', a: 'Use our separate quote form to describe your space, requirements and any access considerations. You can add photos to help explain what is needed.' },
  { q: 'How does the Bond Back Guarantee work?', a: 'For End-of-Lease Cleaning, eligible cleaning concerns within the agreed scope can be submitted as a re-clean request against the original booking. Matelink reviews each request under its terms. It is not a promise that a landlord will return the full bond.' },
  { q: 'Do I need a customer account?', a: 'No account is needed. Your booking link lets you view details, status and available next steps.' },
  { q: 'How can I pay?', a: 'Card, PayID and bank transfer are the planned payment methods. Matelink verifies PayID and bank transfer funds before marking a booking as paid.' },
];

export const inclusionRows = [
  { area: 'Kitchen', task: 'Accessible worktops, splashbacks and sink', deep: true, move: true, lease: true },
  { area: 'Kitchen', task: 'Inside accessible empty cupboards', deep: false, move: true, lease: true },
  { area: 'Bathrooms', task: 'Shower, bath, toilet, vanity and mirrors', deep: true, move: true, lease: true },
  { area: 'Living spaces', task: 'Accessible surfaces and skirting boards', deep: true, move: true, lease: true },
  { area: 'Floors', task: 'Vacuuming and mopping accessible floors', deep: true, move: true, lease: true },
  { area: 'Optional extras', task: 'Carpet steam cleaning and external windows', deep: 'quote', move: 'extra', lease: 'extra' },
  { area: 'Optional extras', task: 'Inside fridge, blinds and outdoor areas', deep: 'quote', move: 'extra', lease: 'extra' },
];

export const pageMetadata = {
  '/': ['A fresh start for your home', 'Explore thoughtful Deep, Move-In and End-of-Lease Cleaning for Sydney homes with Matelink.'],
  '/book': ['Request your clean', 'Choose your service, property and extras, then request a preferred cleaning date. No upfront payment.'],
  '/get-a-quote': ['Get a tailored cleaning quote', 'Tell Matelink about your property and cleaning requirements for a tailored quote.'],
  '/whats-included': ['What’s included', 'Compare cleaning scopes and optional extras for your Sydney home.'],
  '/bond-back-guarantee': ['Bond Back Guarantee', 'Learn about eligible End-of-Lease cleaning concerns and how to request a re-clean.'],
  '/about': ['Care for the place you call home', 'Meet the approach behind Matelink Cleaning in Sydney.'],
  '/faq': ['Your questions, answered', 'Answers about booking, pricing, payments and End-of-Lease cleaning.'],
  '/contact': ['Let’s talk about your home', 'Send Matelink your cleaning enquiry.'],
};
