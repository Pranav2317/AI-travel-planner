import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { tripSchema } from '@/lib/schema';
import { buildPrompt, SYSTEM_PROMPT } from '@/lib/prompt';
import { geocodeTrip, isInIndia } from '@/lib/geocode';

export const runtime = 'nodejs';
export const maxDuration = 60;

const BASE_URL = process.env.AI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/openai/';
const MODEL = process.env.AI_MODEL || 'gemini-2.5-flash';

function clean(body) {
  return {
    destination: String(body.destination || '').trim().slice(0, 120),
    days: Math.min(Math.max(parseInt(body.days, 10) || 3, 1), 14),
    budget: Math.max(Number(body.budget) || 0, 0),
    travelers: Math.min(Math.max(parseInt(body.travelers, 10) || 1, 1), 20),
    currency: String(body.currency || 'INR').slice(0, 3).toUpperCase(),
    pace: ['relaxed', 'balanced', 'packed'].includes(body.pace) ? body.pace : 'balanced',
    interests: Array.isArray(body.interests) ? body.interests.slice(0, 10).map(String) : [],
    startDate: body.startDate ? String(body.startDate).slice(0, 10) : '',
    notes: String(body.notes || '').slice(0, 500),
  };
}

function parseJson(text) {
  const cleaned = String(text || '').replace(/```json|```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  return JSON.parse(cleaned.slice(start, end + 1));
}

async function askModel(client, request) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildPrompt(request) },
  ];
  try {
    // Preferred: structured output enforced by the provider.
    const res = await client.chat.completions.create({
      model: MODEL,
      messages,
      response_format: { type: 'json_schema', json_schema: { name: 'trip_plan', strict: true, schema: tripSchema } },
    });
    return parseJson(res.choices[0]?.message?.content);
  } catch (err) {
    if (err?.status !== 400) throw err;
    // Fallback for providers/models without JSON-schema support: describe the schema in the prompt.
    const res = await client.chat.completions.create({
      model: MODEL,
      messages: [
        ...messages,
        { role: 'user', content: `Reply with ONLY a JSON object (no markdown) matching this JSON Schema:\n${JSON.stringify(tripSchema)}` },
      ],
    });
    return parseJson(res.choices[0]?.message?.content);
  }
}

export async function POST(req) {
  const started = Date.now();
  if (!process.env.AI_API_KEY) {
    return NextResponse.json({ error: 'AI_API_KEY is not set. Add it to .env.local and restart the dev server.' }, { status: 500 });
  }
  const request = clean(await req.json().catch(() => ({})));
  if (!request.destination) return NextResponse.json({ error: 'Enter a destination.' }, { status: 400 });
  if (!request.budget) return NextResponse.json({ error: 'Enter a budget greater than 0.' }, { status: 400 });

  if ((await isInIndia(request.destination)) === false) {
    return NextResponse.json({ error: 'Only destinations in India are supported. Try a city like Jaipur, Goa or Kochi.' }, { status: 400 });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.AI_API_KEY, baseURL: BASE_URL });
    const trip = await askModel(client, request);
    if (!Array.isArray(trip?.days) || !Array.isArray(trip?.restaurants)) throw new Error('Incomplete trip from model');
    // Leave headroom under maxDuration; remaining places just won't get map pins.
    await geocodeTrip(trip, started + 48_000);
    return NextResponse.json({ ...trip, id: crypto.randomUUID(), createdAt: new Date().toISOString(), request });
  } catch (err) {
    console.error(err);
    if (err?.status === 401 || err?.status === 403) {
      return NextResponse.json({ error: 'The AI provider rejected the API key. Check AI_API_KEY.' }, { status: 401 });
    }
    if (err?.status === 429) {
      return NextResponse.json({ error: 'Free-tier limit reached. Wait a minute and try again.' }, { status: 429 });
    }
    return NextResponse.json({ error: 'The trip could not be generated. Try again in a moment.' }, { status: 500 });
  }
}
