export function validateContact(customer, { address = false, mobile = true } = {}) {
  const errors = {};
  if (!customer.name || customer.name.trim().length < 2) errors.name = 'Please enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email?.trim() || '')) errors.email = 'Please enter a valid email address.';
  const digits = (customer.mobile || '').replace(/\D/g, '');
  if ((mobile || digits.length > 0) && (digits.length < 8 || digits.length > 15)) errors.mobile = 'Please enter a valid mobile number.';
  if (address && (customer.address || '').trim().length < 5) errors.address = 'Please enter the property address.';
  return errors;
}
