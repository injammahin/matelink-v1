export function localISODate(date = new Date()) {
  const yyyy = date.getFullYear();
  return `${yyyy}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function futureDate(days) { const d = new Date(); d.setDate(d.getDate() + days); return localISODate(d); }
export function formatDate(value) { return value ? new Date(`${value}T12:00:00`).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not selected'; }
export function makeId(prefix) { return `${prefix}-${crypto.randomUUID()}`; }
export function makeReference(prefix = 'MC') { return `${prefix}-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`; }
