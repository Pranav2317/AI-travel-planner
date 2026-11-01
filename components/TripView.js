'use client';
import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';

const TripMap = dynamic(() => import('./TripMap'), {
  ssr: false,
  loading: () => <div className="map map-empty"><p>Loading map…</p></div>,
});
import { formatMoney } from '@/lib/storage';

const CATEGORY_LABEL = { sight: 'Sight', food: 'Food', activity: 'Activity', stay: 'Stay', transit: 'Transit' };
const BUDGET_PARTS = [
  ['accommodation', 'Stay'],
  ['food', 'Food'],
  ['activities', 'Activities'],
  ['transport', 'Getting around'],
];

function mapsLink(place) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${place.address}`)}`;
}

export default function TripView({ trip, onSave, saved }) {
  const [tab, setTab] = useState(0); // day index, or 'eat'
  const cur = trip.currency || trip.request?.currency || 'USD';
  const budget = trip.request?.budget;
  const breakdownTotal = BUDGET_PARTS.reduce((s, [k]) => s + (trip.budgetBreakdown?.[k] || 0), 0) || 1;
  const day = typeof tab === 'number' ? trip.days[tab] : null;

  const mapPoints = useMemo(() => {
    if (day) return day.items.map((it, i) => ({ ...it, label: i + 1 }));
    return trip.restaurants.map((r) => ({ ...r, category: 'food', label: r.priceLevel }));
  }, [day, trip.restaurants]);

  return (
    <article className="trip">
      <header className="trip-head">
        <div>
          <h2>{trip.destination}</h2>
          <p className="trip-meta">
            {trip.days.length} days, {trip.request?.travelers || 1} traveler{trip.request?.travelers > 1 ? 's' : ''}
            {trip.request?.startDate ? `, from ${new Date(trip.request.startDate).toLocaleDateString()}` : ''}
          </p>
          <p className="trip-summary">{trip.summary}</p>
        </div>
        {onSave && (
          <button className="primary" onClick={onSave} disabled={saved}>
            {saved ? 'Saved' : 'Save trip'}
          </button>
        )}
      </header>

      <section className="budget" aria-label="Budget">
        <div className="budget-total">
          <strong>{formatMoney(trip.estimatedTotal, cur)}</strong>
          <span>estimated{budget ? ` of your ${formatMoney(budget, cur)}` : ''}</span>
        </div>
        <div className="budget-bar" role="img" aria-label="Budget split">
          {BUDGET_PARTS.map(([k]) => (
            <span key={k} className={`seg seg-${k}`} style={{ width: `${((trip.budgetBreakdown?.[k] || 0) / breakdownTotal) * 100}%` }} />
          ))}
        </div>
        <ul className="budget-legend">
          {BUDGET_PARTS.map(([k, label]) => (
            <li key={k}><i className={`seg-${k}`} />{label} <b>{formatMoney(trip.budgetBreakdown?.[k] || 0, cur)}</b></li>
          ))}
        </ul>
      </section>

      <nav className="tabs" aria-label="Itinerary days">
        {trip.days.map((d, i) => (
          <button key={d.day} className={tab === i ? 'on' : ''} aria-current={tab === i} onClick={() => setTab(i)}>
            Day {d.day}
          </button>
        ))}
        <button className={tab === 'eat' ? 'on' : ''} aria-current={tab === 'eat'} onClick={() => setTab('eat')}>
          Where to eat
        </button>
      </nav>

      <div className="trip-body">
        <div className="trip-list">
          {day ? (
            <>
              <h3>{day.title}</h3>
              <ol className="line">
                {day.items.map((it, i) => (
                  <li key={i} className={`stop stop-${it.category}`}>
                    <span className="stop-node">{i + 1}</span>
                    <div className="stop-body">
                      <p className="stop-time">{it.time} <em>{CATEGORY_LABEL[it.category]}</em></p>
                      <h4><a href={mapsLink(it)} target="_blank" rel="noreferrer">{it.name}</a></h4>
                      <p>{it.description}</p>
                      <p className="stop-foot">
                        <span>{it.address}</span>
                        <span>{it.estimatedCost > 0 ? formatMoney(it.estimatedCost, cur) : 'Free'}</span>
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <>
              <h3>Restaurants that fit your budget</h3>
              <ul className="eats">
                {trip.restaurants.map((r, i) => (
                  <li key={i}>
                    <div className="eat-head">
                      <h4><a href={mapsLink(r)} target="_blank" rel="noreferrer">{r.name}</a></h4>
                      <span className="price">{r.priceLevel}</span>
                    </div>
                    <p className="eat-cuisine">{r.cuisine}</p>
                    <p>{r.description}</p>
                    <p className="eat-try">Order: {r.mustTry}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="trip-map">
          <TripMap points={mapPoints} center={trip.center} showRoute={!!day} />
        </div>
      </div>

      {trip.tips?.length > 0 && (
        <section className="tips">
          <h3>Good to know</h3>
          <ul>{trip.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
        </section>
      )}
    </article>
  );
}
