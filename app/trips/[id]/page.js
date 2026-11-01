'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import TripView from '@/components/TripView';
import { getTrip } from '@/lib/storage';

export default function SavedTrip() {
  const { id } = useParams();
  const [trip, setTrip] = useState(undefined);
  useEffect(() => setTrip(getTrip(id)), [id]);

  if (trip === undefined) return null;
  if (!trip) {
    return (
      <section className="saved">
        <h1>Trip not found</h1>
        <p>This trip isn’t saved in this browser. Saved trips live on the device where you saved them.</p>
        <Link className="primary" href="/trips">See saved trips</Link>
      </section>
    );
  }
  return (
    <>
      <p className="back"><Link href="/trips">All saved trips</Link></p>
      <TripView trip={trip} />
    </>
  );
}
