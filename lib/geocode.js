// Free geocoding with Photon (OpenStreetMap data, no API key).
// Requests run a few at a time to stay within fair use.
const PHOTON = 'https://photon.komoot.io/api/';
const MAX_KM_FROM_CENTER = 150;

async function photon(query, bias) {
  const params = new URLSearchParams({ q: query, limit: '1' });
  if (bias) { params.set('lat', bias.lat); params.set('lon', bias.lng); }
  try {
    const res = await fetch(`${PHOTON}?${params}`, { headers: { 'User-Agent': 'ai-travel-planner/1.0' } });
    if (!res.ok) return null;
    const data = await res.json();
    const f = data.features?.[0];
    if (!f) return null;
    const [lng, lat] = f.geometry.coordinates;
    return { lat, lng };
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

export async function geocodeTrip(trip) {
  const center = await photon(trip.destination);
  trip.center = center;

  const cache = new Map();
  const lookup = async (place) => {
    const key = `${place.name}|${place.address}`;
    if (!cache.has(key)) {
      cache.set(key, (async () => {
        // Try "name, city" first (most reliable), then the full address.
        let loc = await photon(`${place.name}, ${trip.destination}`, center);
        if (!loc || (center && km(center, loc) > MAX_KM_FROM_CENTER)) loc = await photon(place.address, center);
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
