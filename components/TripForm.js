'use client';
import { useState } from 'react';

const INTERESTS = ['Food', 'History', 'Art & museums', 'Nature', 'Nightlife', 'Shopping', 'Architecture', 'Adventure', 'Beaches', 'Local markets'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD', 'SGD', 'AED', 'THB'];

export default function TripForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    destination: '',
    days: 3,
    budget: '',
    currency: 'INR',
    travelers: 2,
    pace: 'balanced',
    startDate: '',
    interests: ['Food', 'History'],
    notes: '',
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const toggle = (i) =>
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(i) ? f.interests.filter((x) => x !== i) : [...f.interests, i],
    }));

  return (
    <form
      className="planner"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
      <label className="field field-destination">
        <span>Destination</span>
        <input required placeholder="Jaipur, Rajasthan" value={form.destination} onChange={set('destination')} />
      </label>

      <div className="field-row">
        <label className="field">
          <span>Days</span>
          <input type="number" min="1" max="14" required value={form.days} onChange={set('days')} />
        </label>
        <label className="field">
          <span>Travelers</span>
          <input type="number" min="1" max="20" required value={form.travelers} onChange={set('travelers')} />
        </label>
        <label className="field field-budget">
          <span>Total budget</span>
          <div className="budget-input">
            <input type="number" min="1" required placeholder="1500" value={form.budget} onChange={set('budget')} />
            <select aria-label="Currency" value={form.currency} onChange={set('currency')}>
              {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </label>
        <label className="field">
          <span>Start date (optional)</span>
          <input type="date" value={form.startDate} onChange={set('startDate')} />
        </label>
      </div>

      <fieldset className="field">
        <legend>Pace</legend>
        <div className="segmented">
          {['relaxed', 'balanced', 'packed'].map((p) => (
            <label key={p} className={form.pace === p ? 'on' : ''}>
              <input type="radio" name="pace" value={p} checked={form.pace === p} onChange={set('pace')} />
              {p[0].toUpperCase() + p.slice(1)}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="field">
        <legend>What do you enjoy?</legend>
        <div className="chips">
          {INTERESTS.map((i) => (
            <button
              type="button"
              key={i}
              className={`chip ${form.interests.includes(i) ? 'on' : ''}`}
              aria-pressed={form.interests.includes(i)}
              onClick={() => toggle(i)}
            >
              {i}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="field">
        <span>Anything else? (optional)</span>
        <input placeholder="Vegetarian, travelling with a toddler, no early mornings…" value={form.notes} onChange={set('notes')} />
      </label>

      <button className="primary" type="submit" disabled={loading}>
        {loading ? 'Planning your trip…' : 'Plan my trip'}
      </button>
    </form>
  );
}
