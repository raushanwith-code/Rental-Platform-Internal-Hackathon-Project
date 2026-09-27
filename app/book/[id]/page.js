"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import { getIdentity } from "@/components/Nav";

function daysBetweenInclusive(start, end) {
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  return Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
}

export default function BookEquipmentPage({ params }) {
  const router = useRouter();
  const { id } = params;

  const [equipment, setEquipment] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setCustomerName(getIdentity().name);
    load();
  }, [id]);

  function load() {
    fetch(`/api/equipment/${id}`).then((r) => r.json()).then(setEquipment);
    fetch(`/api/bookings?equipmentId=${id}`).then((r) => r.json()).then(setBookings);
  }

  const days = startDate && endDate && startDate <= endDate ? daysBetweenInclusive(startDate, endDate) : 0;
  const totalCost = equipment && days > 0 ? days * equipment.pricePerDay : 0;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!customerName.trim()) {
      setError("Please enter your name (top right) before booking.");
      return;
    }
    if (!startDate || !endDate || startDate > endDate) {
      setError("Please choose a valid start and end date.");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ equipmentId: id, customerName: customerName.trim(), startDate, endDate }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error || "This booking overlaps with an existing reservation. Please pick different dates.");
      return;
    }

    setSuccess("Booking request submitted! It's now Pending owner approval.");
    setStartDate("");
    setEndDate("");
    load();
    setTimeout(() => router.push("/my-bookings"), 1200);
  }

  if (!equipment) return <p className="text-slate-400">Loading…</p>;

  return (
    <div>
      <button onClick={() => router.push("/")} className="text-sm text-slate-500 hover:text-slate-800 mb-4">← Back to catalog</button>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="card p-6 mb-6">
            <div className="flex items-start justify-between">
              <span className="text-5xl">{equipment.emoji}</span>
              <span className="badge badge-approved">{equipment.category}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-3">{equipment.name}</h1>
            <p className="text-slate-500 mt-2">{equipment.description}</p>
            <div className="mt-4 flex items-center gap-4">
              <span className="text-2xl font-extrabold text-brand-700">₹{equipment.pricePerDay}<span className="text-sm font-medium text-slate-400">/day</span></span>
              <span className="text-sm text-slate-400">{equipment.totalUnits} unit(s) in inventory</span>
            </div>
          </div>

          <AvailabilityCalendar
            bookings={bookings}
            totalUnits={equipment.totalUnits}
            selectedStart={startDate}
            selectedEnd={endDate}
          />
        </div>

        <div>
          <form onSubmit={handleSubmit} className="card p-6 sticky top-24">
            <h2 className="font-bold text-lg mb-4">Reserve this item</h2>

            <label className="text-xs font-semibold text-slate-500">Your name</label>
            <input
              className="input mb-3 mt-1"
              placeholder="e.g. Aditi Sharma"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-semibold text-slate-500">Start date</label>
                <input
                  type="date"
                  className="input mt-1"
                  value={startDate}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">End date</label>
                <input
                  type="date"
                  className="input mt-1"
                  value={endDate}
                  min={startDate || new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {days > 0 && (
              <div className="bg-brand-50 rounded-lg p-3 mb-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>{days} day{days > 1 ? "s" : ""} × ₹{equipment.pricePerDay}</span>
                  <span className="font-bold text-brand-700">₹{totalCost}</span>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3 mb-3">⚠️ {error}</div>
            )}
            {success && (
              <div className="bg-emerald-50 text-emerald-700 text-sm rounded-lg p-3 mb-3">✅ {success}</div>
            )}

            <button type="submit" disabled={submitting} className="btn btn-primary w-full">
              {submitting ? "Checking availability…" : "Request Booking"}
            </button>
            <p className="text-[11px] text-slate-400 mt-2 text-center">
              Dates are checked against existing reservations in real time — overlapping bookings are rejected automatically.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
