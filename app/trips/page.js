'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getTrips, deleteTrip, formatMoney } from '@/lib/storage';

export default function SavedTrips() {
  const [trips, setTrips] = useState(null);
  useEffect(() => setTrips(getTrips()), []);

  if (trips === null) return null;

  return (
    <section className="saved">
      <h1>Saved trips</h1>
      {trips.length === 0 ? (
        <div className="empty">
          <p>No saved trips yet. Plan one and press “Save trip” to keep it here.</p>
          <Link className="primary" href="/">Plan a trip</Link>
        </div>
      ) : (
        <ul className="saved-list">
          {trips.map((t) => (
            <li key={t.id}>
              <Link href={`/trips/${t.id}`} className="saved-link">
                <h2>{t.destination}</h2>
                <p>
                  {t.days.length} days for {formatMoney(t.estimatedTotal, t.currency)}, saved{' '}
                  {new Date(t.createdAt).toLocaleDateString()}
                </p>
              </Link>
              <button
                className="ghost"
                onClick={() => {
                  if (confirm(`Delete your ${t.destination} trip?`)) {
                    deleteTrip(t.id);
                    setTrips(getTrips());
                  }
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
