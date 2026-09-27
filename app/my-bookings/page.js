"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatusBadge, { isOverdue } from "@/components/StatusBadge";
import { getIdentity } from "@/components/Nav";

export default function MyBookingsPage() {
  const [name, setName] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const identity = getIdentity();
    setName(identity.name);
    if (identity.name) load(identity.name);
    else setLoading(false);
  }, []);

  function load(customerName) {
    setLoading(true);
    fetch(`/api/bookings?customerName=${encodeURIComponent(customerName)}`)
      .then((r) => r.json())
      .then((data) => {
        setBookings(data);
        setLoading(false);
      });
  }

  const today = new Date().toISOString().slice(0, 10);
  const current = bookings.filter((b) => ["Pending", "Approved", "Active"].includes(b.status));
  const past = bookings.filter((b) => ["Returned", "Rejected"].includes(b.status));

  if (!name) {
    return (
      <div className="card p-8 text-center">
        <p className="text-slate-500">Set your name (top right) to see your rentals.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-slate-900 mb-1">My Rentals</h1>
      <p className="text-slate-500 mb-8">Signed in as <span className="font-semibold">{name}</span></p>

      {loading ? (
        <p className="text-slate-400">Loading…</p>
      ) : bookings.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-slate-500 mb-3">You haven't booked anything yet.</p>
          <Link href="/" className="btn btn-primary inline-flex">Browse equipment</Link>
        </div>
      ) : (
        <>
          <h2 className="font-bold text-slate-700 mb-3">Current & Upcoming</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-10">
            {current.length === 0 && <p className="text-slate-400 text-sm">No active or pending rentals.</p>}
            {current.map((b) => <BookingCard key={b.id} booking={b} />)}
          </div>

          <h2 className="font-bold text-slate-700 mb-3">Past Rentals</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {past.length === 0 && <p className="text-slate-400 text-sm">No past rentals yet.</p>}
            {past.map((b) => <BookingCard key={b.id} booking={b} />)}
          </div>
        </>
      )}
    </div>
  );
}

function BookingCard({ booking }) {
  const eq = booking.equipment;
  return (
    <div className="card p-4 flex gap-4">
      <div className="text-4xl">{eq?.emoji || "📦"}</div>
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-slate-900">{eq?.name || "Equipment removed"}</h3>
          <StatusBadge booking={booking} />
        </div>
        <p className="text-sm text-slate-500 mt-1">
          {booking.startDate} → {booking.endDate} · {booking.days} day{booking.days > 1 ? "s" : ""}
        </p>
        <p className="text-sm font-bold text-brand-700 mt-1">₹{booking.totalCost}</p>
        {isOverdue(booking) && (
          <p className="text-xs text-red-600 mt-1 font-semibold">
            This rental was due back on {booking.endDate}. Please return it ASAP.
          </p>
        )}
      </div>
    </div>
  );
}
