import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { initialSettings } from '@/data/content';
import { calculatePrice, isRate } from '@/lib/pricing';
import { futureDate, makeId, makeReference } from '@/lib/dates';

const STORAGE_KEY = 'matelink.frontend.v1';
const AppContext = createContext(null);
const stages = ['pending', 'confirmed', 'cleaning', 'completed'];
export const statusLabels = { pending: 'Pending review', confirmed: 'Confirmed', cleaning: 'Cleaning', completed: 'Completed', cancelled: 'Cancelled' };

function demoBooking(id, service, status, days) {
  return {
    id, token: `preview-${id.toLowerCase()}`, reference: id, service, property: 'apartment', bedrooms: 2, bathrooms: 1,
    postcode: '2000', date: futureDate(days), time: 'Morning (8 am – 12 pm)', addons: {},
    customer: { name: 'Example Customer', email: 'customer@example.invalid', mobile: '0400 000 000', address: 'Example address, Sydney NSW 2000', notes: '' },
    status, paymentStatus: 'unpaid', paymentMethod: null, priceSnapshot: { ready: false, total: null, items: [], knownExtras: 0 },
    confirmedTotal: null, createdAt: new Date().toISOString(), demo: true, recleans: [],
  };
}
function initialState() {
  return { settings: structuredClone(initialSettings), bookings: [
    demoBooking('MC-DEMO-1001', 'deep', 'pending', 3),
    demoBooking('MC-DEMO-1002', 'move-in', 'confirmed', 5),
    demoBooking('MC-DEMO-1003', 'end-of-lease', 'completed', -2),
  ], quotes: [], contacts: [], notifications: [] };
}
function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (parsed?.settings?.serviceRates && Array.isArray(parsed.bookings) && Array.isArray(parsed.quotes) && Array.isArray(parsed.contacts) && Array.isArray(parsed.notifications)) return parsed;
  } catch { /* Fall back safely when browser storage is unavailable or corrupt. */ }
  return initialState();
}
function notificationFor(state, booking, event) {
  if (!state.settings.notifications[event]) return state.notifications;
  const template = state.settings.templates[event] || '';
  const text = template.replaceAll('{{name}}', booking.customer.name).replaceAll('{{reference}}', booking.reference).replaceAll('{{booking_link}}', `${window.location.origin}/booking/${booking.token}`);
  return [{ id: makeId('EMAIL'), bookingId: booking.id, event, to: booking.customer.email, text, createdAt: new Date().toISOString(), delivery: 'preview' }, ...state.notifications];
}

export function AppProvider({ children }) {
  const [state, setState] = useState(loadState);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch { toast.error('Browser storage is full or unavailable. Your changes will only last for this session.', { id: 'storage-warning' }); }
  }, [state]);

  function updateSettings(settings) { setState(previous => ({ ...previous, settings })); }
  function createBooking(draft) {
    const booking = {
      ...structuredClone(draft), id: makeId('BOOKING'), token: crypto.randomUUID(), reference: makeReference(),
      status: 'pending', paymentStatus: 'unpaid', paymentMethod: null, priceSnapshot: calculatePrice(draft, state.settings),
      confirmedTotal: null, createdAt: new Date().toISOString(), recleans: [], demo: false,
    };
    setState(previous => ({ ...previous, bookings: [booking, ...previous.bookings], notifications: notificationFor(previous, booking, 'submitted') }));
    return booking;
  }
  function updateBooking(id, patch) {
    setState(previous => {
      const original = previous.bookings.find(b => b.id === id);
      if (!original) return previous;
      const safePatch = { ...patch };
      // Booking totals are immutable once confirmed. Editing global prices cannot re-price a job.
      if (original.status !== 'pending' && (!original.demo || isRate(original.confirmedTotal))) delete safePatch.confirmedTotal;
      if (safePatch.status && safePatch.status !== original.status) {
        const next = safePatch.status;
        if (original.status === 'cancelled' || (next !== 'cancelled' && stages.indexOf(next) !== stages.indexOf(original.status) + 1)) return previous;
        if (next === 'confirmed') {
          safePatch.confirmedTotal = isRate(patch.confirmedTotal) ? patch.confirmedTotal : original.priceSnapshot.total;
          if (!isRate(safePatch.confirmedTotal)) return previous;
        }
      }
      if (safePatch.paymentStatus === 'paid' && (original.status === 'pending' || original.status === 'cancelled')) return previous;
      const updated = { ...original, ...safePatch };
      const event = safePatch.status && safePatch.status !== original.status ? safePatch.status : safePatch.paymentStatus === 'paid' && original.paymentStatus !== 'paid' ? 'paid' : null;
      return { ...previous, bookings: previous.bookings.map(b => b.id === id ? updated : b), notifications: event ? notificationFor(previous, updated, event) : previous.notifications };
    });
  }
  function createQuote(values) {
    const quote = { ...values, id: makeId('QUOTE'), reference: makeReference('QT'), status: 'new', amount: null, createdAt: new Date().toISOString() };
    setState(previous => ({ ...previous, quotes: [quote, ...previous.quotes] }));
    return quote;
  }
  function updateQuote(id, patch) { setState(previous => ({ ...previous, quotes: previous.quotes.map(q => q.id === id ? { ...q, ...patch } : q) })); }
  function convertQuote(id, service) {
    const quote = state.quotes.find(q => q.id === id);
    if (!quote || quote.bookingId || quote.status !== 'accepted' || !isRate(quote.amount)) return null;
    const booking = {
      id: makeId('BOOKING'), token: crypto.randomUUID(), reference: makeReference(), service: service || quote.service,
      property: quote.property || 'apartment', bedrooms: quote.bedrooms || 1, bathrooms: quote.bathrooms || 1,
      postcode: quote.postcode, date: quote.date || '', time: '', addons: {}, customer: { ...quote.customer, notes: quote.requirements },
      photos: quote.photos, status: 'pending', paymentStatus: 'unpaid', paymentMethod: null,
      priceSnapshot: { ready: true, total: quote.amount, items: [{ label: 'Accepted custom quote', amount: quote.amount }], knownExtras: 0 },
      confirmedTotal: null, quoteId: quote.id, createdAt: new Date().toISOString(), recleans: [], demo: false,
    };
    setState(previous => ({ ...previous, bookings: [booking, ...previous.bookings], quotes: previous.quotes.map(q => q.id === id ? { ...q, status: 'converted', bookingId: booking.id } : q), notifications: notificationFor(previous, booking, 'submitted') }));
    return booking;
  }
  function requestReclean(id, values) {
    const request = { ...values, id: makeId('RECLEAN'), status: 'pending', createdAt: new Date().toISOString() };
    setState(previous => {
      const original = previous.bookings.find(b => b.id === id && b.service === 'end-of-lease' && b.status === 'completed');
      if (!original) return previous;
      const updated = { ...original, recleans: [...original.recleans, request] };
      return { ...previous, bookings: previous.bookings.map(b => b.id === id ? updated : b), notifications: notificationFor(previous, updated, 'reclean') };
    });
    return request;
  }
  function updateReclean(bookingId, requestId, status) {
    setState(previous => {
      const booking = previous.bookings.find(b => b.id === bookingId);
      if (!booking) return previous;
      const updated = { ...booking, recleans: booking.recleans.map(r => r.id === requestId ? { ...r, status } : r) };
      return { ...previous, bookings: previous.bookings.map(b => b.id === bookingId ? updated : b), notifications: notificationFor(previous, updated, 'reclean') };
    });
  }
  function addContact(values) {
    setState(previous => ({ ...previous, contacts: [{ ...values, id: makeId('CONTACT'), status: 'new', createdAt: new Date().toISOString() }, ...previous.contacts] }));
  }
  function resetDemo() { setState(initialState()); sessionStorage.removeItem('matelink.booking-draft'); }
  return <AppContext.Provider value={{ ...state, updateSettings, createBooking, updateBooking, createQuote, updateQuote, convertQuote, requestReclean, updateReclean, addContact, resetDemo }}>{children}</AppContext.Provider>;
}
export function useApp() { const value = useContext(AppContext); if (!value) throw new Error('useApp must be used within AppProvider'); return value; }
