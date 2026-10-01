export function isRate(value) { return typeof value === 'number' && Number.isFinite(value) && value >= 0; }
export function amountLabel(value) {
  return isRate(value) ? new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 2 }).format(value) : 'To be confirmed';
}
export function availableAddons(settings, serviceId) {
  return settings.addons.filter(a => a.active && a.group === (serviceId === 'deep' ? 'deep' : 'shared'));
}
export function calculatePrice(draft, settings) {
  const rates = settings.serviceRates[draft.service];
  const items = [];
  if (!rates) return { ready: false, total: null, items, knownExtras: 0 };
  items.push({ label: 'Service base', amount: rates.base });
  items.push({ label: `${draft.bedrooms} bedroom${draft.bedrooms === 1 ? '' : 's'}`, amount: isRate(rates.bedroom) ? rates.bedroom * draft.bedrooms : null });
  items.push({ label: `${draft.bathrooms} bathroom${draft.bathrooms === 1 ? '' : 's'}`, amount: isRate(rates.bathroom) ? rates.bathroom * draft.bathrooms : null });
  items.push({ label: 'Property adjustment', amount: settings.propertyAdjustments[draft.property] });
  let knownExtras = 0;
  for (const addon of availableAddons(settings, draft.service)) {
    const quantity = Number(draft.addons?.[addon.id] || 0);
    if (quantity <= 0) continue;
    const amount = isRate(addon.price) ? Math.round(addon.price * quantity * 100) / 100 : null;
    items.push({ label: `${addon.name}${addon.quantity ? ` × ${quantity}` : ''}`, amount });
    knownExtras += amount || 0;
  }
  const ready = items.every(i => isRate(i.amount));
  return { ready, total: ready ? Math.round(items.reduce((sum, item) => sum + item.amount, 0) * 100) / 100 : null, items, knownExtras };
}
export function validPostcode(code) { return /^\d{4}$/.test(code); }
export function postcodeAvailability(code, settings) {
  if (!validPostcode(code)) return 'invalid';
  if (!settings.postcodes.length) return 'review';
  return settings.postcodes.includes(code) ? 'available' : 'unavailable';
}
