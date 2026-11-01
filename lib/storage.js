const KEY = 'ai-travel-planner:trips';

export function getTrips() {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}
export function getTrip(id) { return getTrips().find((t) => t.id === id) || null; }
export function saveTrip(trip) {
  const trips = getTrips().filter((t) => t.id !== trip.id);
  localStorage.setItem(KEY, JSON.stringify([trip, ...trips]));
}
export function deleteTrip(id) {
  localStorage.setItem(KEY, JSON.stringify(getTrips().filter((t) => t.id !== id)));
}
export function isSaved(id) { return getTrips().some((t) => t.id === id); }

export function formatMoney(value, currency) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
  } catch {
    return `${Math.round(value)} ${currency}`;
  }
}
