"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function getIdentity() {
  if (typeof window === "undefined") return { name: "", role: "customer" };
  return {
    name: window.localStorage.getItem("rentit_name") || "",
    role: window.localStorage.getItem("rentit_role") || "customer",
  };
}

export default function Nav() {
  const pathname = usePathname();
  const [identity, setIdentity] = useState({ name: "", role: "customer" });
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState("");

  useEffect(() => {
    setIdentity(getIdentity());
  }, []);

  function saveIdentity(name, role) {
    window.localStorage.setItem("rentit_name", name);
    window.localStorage.setItem("rentit_role", role);
    setIdentity({ name, role });
  }

  function handleNameSubmit(e) {
    e.preventDefault();
    if (draftName.trim()) {
      saveIdentity(draftName.trim(), identity.role);
      setEditing(false);
    }
  }

  const linkClass = (href) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition ${
      pathname === href ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100"
    }`;

  return (
    <header className="bg-white/80 backdrop-blur border-b border-slate-200 sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-lg text-slate-900">
          <span className="w-9 h-9 rounded-xl hero-gradient flex items-center justify-center text-lg shadow-md">📦</span>
          <span className="bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">RentIt</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link href="/" className={linkClass("/")}>Catalog</Link>
          <Link href="/my-bookings" className={linkClass("/my-bookings")}>My Rentals</Link>
          <Link href="/owner" className={linkClass("/owner")}>Owner Dashboard</Link>
        </nav>

        <div className="flex items-center gap-2">
          <select
            value={identity.role}
            onChange={(e) => saveIdentity(identity.name || "Guest", e.target.value)}
            className="text-xs font-semibold bg-slate-100 rounded-lg px-2 py-1.5 border border-slate-200"
            title="Switch role (for demo purposes)"
          >
            <option value="customer">👤 Customer</option>
            <option value="owner">🏢 Owner/Admin</option>
          </select>

          {editing ? (
            <form onSubmit={handleNameSubmit} className="flex items-center gap-1">
              <input
                autoFocus
                className="input !py-1 !px-2 text-xs w-32"
                placeholder="Your name"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
              />
              <button className="btn btn-primary !px-2 !py-1 text-xs" type="submit">Save</button>
            </form>
          ) : (
            <button
              onClick={() => {
                setDraftName(identity.name);
                setEditing(true);
              }}
              className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg px-3 py-1.5"
            >
              {identity.name ? `👋 ${identity.name}` : "Set your name"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
