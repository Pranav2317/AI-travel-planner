'use client';
import { useState } from 'react';
import TripForm from '@/components/TripForm';
import TripView from '@/components/TripView';
import { saveTrip } from '@/lib/storage';

export default function Home() {
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  async function generate(form) {
    setLoading(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'The trip could not be generated.');
      setTrip(data);
      requestAnimationFrame(() => document.getElementById('trip')?.scrollIntoView({ behavior: 'smooth' }));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSave() {
    saveTrip(trip);
    setSaved(true);
  }

  return (
    <>
      <section className="hero">
        <h1>Where to, and how much do you want to spend?</h1>
        <p className="lede">
          Give a destination and a budget. You get a day-by-day route with real places, restaurants that fit your
          wallet, and everything pinned on a map.
        </p>
        <TripForm onSubmit={generate} loading={loading} />
        {error && <p className="error" role="alert">{error}</p>}
      </section>

      {loading && (
        <div className="loading" aria-live="polite">
          <div className="loading-line"><span /></div>
          <p>Planning your route and pinning places on the map. This takes 15–30 seconds.</p>
        </div>
      )}

      {trip && !loading && (
        <div id="trip">
          <TripView trip={trip} onSave={handleSave} saved={saved} />
        </div>
      )}
    </>
  );
}
