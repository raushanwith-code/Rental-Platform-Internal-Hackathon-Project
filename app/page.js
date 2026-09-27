"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export default function CatalogPage() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/equipment")
      .then((r) => r.json())
      .then((data) => {
        setEquipment(data);
        setLoading(false);
      });
  }, []);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(equipment.map((e) => e.category)))],
    [equipment]
  );

  const filtered = equipment.filter((e) => {
    const matchesCat = category === "All" || e.category === category;
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div>
      <section className="hero-gradient rounded-2xl p-8 mb-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <span className="badge bg-white/20 text-white backdrop-blur mb-3">✨ {equipment.length || 15}+ items available</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Rent smarter. Zero double-bookings.</h1>
          <p className="text-blue-100 max-w-xl">
            Cameras, projectors, tools, audio gear & more — pick your dates and our
            system guarantees the item is actually free for you.
          </p>
        </div>
        <span className="absolute -right-6 -bottom-8 text-[9rem] opacity-10 select-none">📦</span>
      </section>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          className="input sm:max-w-xs"
          placeholder="🔍 Search equipment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`btn !px-3 !py-1.5 text-xs ${
                category === c ? "btn-primary" : "btn-secondary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-slate-400">Loading equipment…</p>
      ) : filtered.length === 0 ? (
        <p className="text-slate-400">No equipment matches your search.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <Link
              key={item.id}
              href={`/book/${item.id}`}
              className="card fade-in-up p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center text-3xl">{item.emoji}</span>
                <span className="badge badge-approved">{item.category}</span>
              </div>
              <h3 className="font-bold text-slate-900">{item.name}</h3>
              <p className="text-sm text-slate-500 mt-1 line-clamp-2 flex-1">{item.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-extrabold text-brand-700">
                  ₹{item.pricePerDay}<span className="text-xs font-medium text-slate-400">/day</span>
                </span>
                <span className="text-xs text-slate-400">{item.totalUnits} unit(s) total</span>
              </div>
              <div className="btn btn-primary w-full mt-4">Check availability & book →</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
