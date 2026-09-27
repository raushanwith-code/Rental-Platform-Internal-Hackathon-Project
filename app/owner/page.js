"use client";

import { useEffect, useState } from "react";
import StatusBadge, { isOverdue } from "@/components/StatusBadge";

const EMPTY_FORM = { name: "", category: "", description: "", pricePerDay: "", emoji: "📦", totalUnits: 1 };

export default function OwnerDashboard() {
  const [tab, setTab] = useState("bookings");
  const [equipment, setEquipment] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [bookingFilter, setBookingFilter] = useState("All");

  useEffect(() => { loadAll(); }, []);

  function loadAll() {
    fetch("/api/equipment").then((r) => r.json()).then(setEquipment);
    fetch("/api/bookings").then((r) => r.json()).then(setBookings);
  }

  async function handleAddEquipment(e) {
    e.preventDefault();
    setFormError("");
    if (!form.name || !form.category || !form.pricePerDay) {
      setFormError("Name, category and price per day are required.");
      return;
    }
    const res = await fetch("/api/equipment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json();
      setFormError(data.error || "Could not add equipment.");
      return;
    }
    setForm(EMPTY_FORM);
    loadAll();
  }

  async function deleteEquipment(id) {
    if (!confirm("Delete this equipment item?")) return;
    const res = await fetch(`/api/equipment/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Could not delete.");
      return;
    }
    loadAll();
  }

  async function updateBookingStatus(id, status) {
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Could not update booking.");
      return;
    }
    loadAll();
  }

  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter === "All") return true;
    if (bookingFilter === "Overdue") return isOverdue(b);
    return b.status === bookingFilter;
  });

  const stats = {
    pending: bookings.filter((b) => b.status === "Pending").length,
    active: bookings.filter((b) => b.status === "Active").length,
    overdue: bookings.filter(isOverdue).length,
    revenue: bookings
      .filter((b) => ["Approved", "Active", "Returned"].includes(b.status))
      .reduce((sum, b) => sum + b.totalCost, 0),
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Owner Dashboard</h1>
      <p className="text-slate-500 mb-6">Manage inventory and keep bookings conflict-free.</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Pending requests" value={stats.pending} tone="amber" />
        <StatCard label="Active rentals" value={stats.active} tone="emerald" />
        <StatCard label="Overdue" value={stats.overdue} tone="red" />
        <StatCard label="Confirmed revenue" value={`₹${stats.revenue}`} tone="blue" />
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab("bookings")} className={`btn !px-4 ${tab === "bookings" ? "btn-primary" : "btn-secondary"}`}>Bookings</button>
        <button onClick={() => setTab("inventory")} className={`btn !px-4 ${tab === "inventory" ? "btn-primary" : "btn-secondary"}`}>Inventory</button>
      </div>

      {tab === "bookings" && (
        <div>
          <div className="flex gap-2 flex-wrap mb-4">
            {["All", "Pending", "Approved", "Active", "Overdue", "Returned", "Rejected"].map((f) => (
              <button
                key={f}
                onClick={() => setBookingFilter(f)}
                className={`btn !px-3 !py-1.5 text-xs ${bookingFilter === f ? "btn-primary" : "btn-secondary"}`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredBookings.length === 0 && <p className="text-slate-400 text-sm">No bookings in this view.</p>}
            {filteredBookings.map((b) => (
              <div key={b.id} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                <div className="text-3xl">{b.equipment?.emoji || "📦"}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900">{b.equipment?.name || "Removed item"}</h3>
                    <StatusBadge booking={b} />
                  </div>
                  <p className="text-sm text-slate-500">
                    {b.customerName} · {b.startDate} → {b.endDate} ({b.days}d) · ₹{b.totalCost}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {b.status === "Pending" && (
                    <>
                      <button onClick={() => updateBookingStatus(b.id, "Approved")} className="btn btn-success !px-3 !py-1.5 text-xs">Approve</button>
                      <button onClick={() => updateBookingStatus(b.id, "Rejected")} className="btn btn-danger !px-3 !py-1.5 text-xs">Reject</button>
                    </>
                  )}
                  {b.status === "Approved" && (
                    <button onClick={() => updateBookingStatus(b.id, "Active")} className="btn btn-primary !px-3 !py-1.5 text-xs">Mark Active</button>
                  )}
                  {b.status === "Active" && (
                    <button onClick={() => updateBookingStatus(b.id, "Returned")} className="btn btn-secondary !px-3 !py-1.5 text-xs">Mark Returned</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "inventory" && (
        <div className="grid md:grid-cols-3 gap-8">
          <form onSubmit={handleAddEquipment} className="card p-5 md:col-span-1 h-fit">
            <h2 className="font-bold mb-3">Add equipment</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <input className="input col-span-1" placeholder="📷" value={form.emoji}
                  onChange={(e) => setForm({ ...form, emoji: e.target.value })} />
                <input className="input col-span-2" placeholder="Name" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <input className="input" placeholder="Category (e.g. Camera)" value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })} />
              <textarea className="input" rows={2} placeholder="Description" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <input className="input" type="number" min="1" placeholder="Price/day (₹)" value={form.pricePerDay}
                  onChange={(e) => setForm({ ...form, pricePerDay: e.target.value })} />
                <input className="input" type="number" min="1" placeholder="Total units" value={form.totalUnits}
                  onChange={(e) => setForm({ ...form, totalUnits: e.target.value })} />
              </div>
              {formError && <p className="text-xs text-red-600">{formError}</p>}
              <button type="submit" className="btn btn-primary w-full">Add to inventory</button>
            </div>
          </form>

          <div className="md:col-span-2 space-y-3">
            {equipment.map((item) => (
              <div key={item.id} className="card p-4 flex items-center gap-4">
                <div className="text-3xl">{item.emoji}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">{item.name}</h3>
                  <p className="text-xs text-slate-500">{item.category} · ₹{item.pricePerDay}/day · {item.totalUnits} unit(s)</p>
                </div>
                <button onClick={() => deleteEquipment(item.id)} className="btn btn-danger !px-3 !py-1.5 text-xs">Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, tone }) {
  const tones = {
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    blue: "bg-blue-50 text-blue-700",
  };
  return (
    <div className={`card p-4 ${tones[tone]}`}>
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-xs font-semibold opacity-80">{label}</p>
    </div>
  );
}
