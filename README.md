# Wayline — AI Travel Planner

Pick a destination and a budget, then get a complete trip: a day-by-day itinerary with real places,
restaurants that fit the budget, everything pinned on a map, and trips you can save for later.

**Stack:** Next.js 14 (App Router), Google Gemini via the OpenAI SDK (free tier), Leaflet + OpenStreetMap, Photon geocoding.
**Cost:** free. The only key you need is a Gemini API key, and it needs no credit card.

## Setup

```bash
npm install
cp .env.example .env.local
```

1. Go to https://aistudio.google.com/apikey and sign in with any Google account.
2. Click **Create API key** and copy it.
3. Paste it into `.env.local` as `AI_API_KEY=...`
4. Run `npm run dev` and open http://localhost:3000

The map (OpenStreetMap) and place lookup (Photon) need no keys.

### Free-tier notes
- Gemini's free tier is rate-limited per minute and per day; if you hit it, the app tells you to wait and retry.
- On the free tier, Google may use prompts to improve its products. Don't send private data.
- To switch to OpenAI (paid) later, change `AI_API_KEY`, `AI_BASE_URL` and `AI_MODEL` in `.env.local`. No code changes.

## How it works
1. `components/TripForm.js` collects destination, days, budget, currency, travelers, pace, interests.
2. `POST /api/generate` (`app/api/generate/route.js`) validates input and calls the AI model through the OpenAI SDK
   with a strict JSON schema (`lib/schema.js`), so the response always has the same shape.
3. `lib/geocode.js` turns each place into coordinates with Photon (OpenStreetMap data), biased to the destination.
4. `components/TripView.js` shows the budget split, each day as a transit-line timeline, and restaurants;
   `components/TripMap.js` pins the day's stops on a Leaflet map and draws the route between them.
5. Saved trips are kept in `localStorage` (`lib/storage.js`) and listed at `/trips`.

## Project structure
```
app/
  api/generate/route.js   AI + geocoding endpoint
  page.js                 Planner (form + generated trip)
  trips/page.js           Saved trips list
  trips/[id]/page.js      A single saved trip
components/               TripForm, TripView, TripMap
lib/                      schema, prompt, geocode, storage helpers
```

## Ideas for next steps
- Store trips in a database (Supabase/Postgres/MongoDB) with auth so they sync across devices.
- Stream the response so days appear as they're generated.
- "Regenerate this day" and drag-to-reorder stops.
- Export a trip to PDF or share it via a public link.
