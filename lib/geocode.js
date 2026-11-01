// Free geocoding with Nominatim (OpenStreetMap data, no API key), India only.
// Fair use: max ~1 request/second, so lookups run one at a time.
const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
const MAX_KM_FROM_CENTER = 150;
const TIMEOUT_MS = 6000;
const MIN_GAP_MS = 1050;
const MAX_FAILURES = 3; // consecutive network failures before giving up on the rest

let lastCall = 0;
let failures = 0;

async function photon(query, bias) {
  if (failures >= MAX_FAILURES) return null;
  const wait = lastCall + MIN_GAP_MS - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastCall = Date.now();

  const params = new URLSearchParams({ q: query, format: 'jsonv2', limit: '1', countrycodes: 'in' });
  if (bias) {
    const d = 0.5; // ~50 km box used only to prefer nearby results
    params.set('viewbox', [bias.lng - d, bias.lat + d, bias.lng + d, bias.lat - d].join(','));
  }
  try {
    const res = await fetch(`${NOMINATIM}?${params}`, {
      headers: { 'User-Agent': 'ai-travel-planner/1.0' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    failures = 0;
    if (!res.ok) return null;
    const f = (await res.json())?.[0];
    if (!f) return null;
    return { lat: Number(f.lat), lng: Number(f.lon) };
  } catch {
    failures += 1;
    return null;
  }
}

// true = found in India, false = not in India, null = couldn't check (network down).
// Looks up the best match worldwide (not India-filtered) so "Paris" resolves to France, not a village in India.
export async function isInIndia(destination) {
  failures = 0;
  const wait = lastCall + MIN_GAP_MS - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastCall = Date.now();
  const params = new URLSearchParams({ q: destination, format: 'jsonv2', limit: '1', addressdetails: '1' });
  try {
    const res = await fetch(`${NOMINATIM}?${params}`, {
      headers: { 'User-Agent': 'ai-travel-planner/1.0' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const f = (await res.json())?.[0];
    return f ? f.address?.country_code === 'in' : false;
  } catch {
    return null;
  }
}

function km(a, b) {
  const R = 6371, rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

async function inBatches(tasks, size) {
  for (let i = 0; i < tasks.length; i += size) await Promise.all(tasks.slice(i, i + size).map((t) => t()));
}

// `deadline` (ms timestamp) stops lookups so the request can finish inside the host's time limit;
// places not resolved by then simply get no map pin.
export async function geocodeTrip(trip, deadline = Infinity) {
  failures = 0;
  const center = await photon(trip.destination);
  trip.center = center;

  const cache = new Map();
  const lookup = async (place) => {
    const key = `${place.name}|${place.address}`;
    if (!cache.has(key)) {
      cache.set(key, (async () => {
        if (Date.now() > deadline) return null;
        // Try "name, city" first (most reliable), then the full address.
        let loc = await photon(`${place.name}, ${trip.destination}`, center);
        if ((!loc || (center && km(center, loc) > MAX_KM_FROM_CENTER)) && Date.now() <= deadline) loc = await photon(place.address, center);
        if (loc && center && km(center, loc) > MAX_KM_FROM_CENTER) loc = null; // wrong city
        return loc;
      })());
    }
    return cache.get(key);
  };

  const places = [...trip.days.flatMap((d) => d.items), ...trip.restaurants];
  await inBatches(places.map((p) => async () => { p.location = await lookup(p); }), 4);
  return trip;
}
