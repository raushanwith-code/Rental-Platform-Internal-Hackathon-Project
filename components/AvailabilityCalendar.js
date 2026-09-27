"use client";

import { useMemo, useState } from "react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function toDateStr(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function unitsBookedOn(dateStr, bookings) {
  return bookings.filter(
    (b) =>
      ["Pending", "Approved", "Active"].includes(b.status) &&
      dateStr >= b.startDate &&
      dateStr <= b.endDate
  ).length;
}

export default function AvailabilityCalendar({ bookings = [], totalUnits = 1, selectedStart, selectedEnd }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const cells = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const startWeekday = first.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const arr = [];
    for (let i = 0; i < startWeekday; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    return arr;
  }, [viewYear, viewMonth]);

  function changeMonth(delta) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewMonth(m);
    setViewYear(y);
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={() => changeMonth(-1)} className="btn btn-secondary !px-3 !py-1.5 text-sm">←</button>
        <div className="font-bold text-slate-800">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </div>
        <button type="button" onClick={() => changeMonth(1)} className="btn btn-secondary !px-3 !py-1.5 text-sm">→</button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wide">
        {DOW.map((d) => <div key={d}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((d, idx) => {
          if (d === null) return <div key={idx} />;
          const dateStr = toDateStr(viewYear, viewMonth, d);
          const booked = unitsBookedOn(dateStr, bookings);
          const full = booked >= totalUnits;
          const inSelection =
            selectedStart && selectedEnd && dateStr >= selectedStart && dateStr <= selectedEnd;
          const isPast = dateStr < today.toISOString().slice(0, 10);

          let classes = "h-9 rounded-lg flex items-center justify-center text-xs font-semibold transition-all duration-150 ";
          if (inSelection) {
            classes += "bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-md scale-105";
          } else if (full) {
            classes += "bg-red-100 text-red-600 line-through";
          } else if (booked > 0) {
            classes += "bg-amber-100 text-amber-700";
          } else if (isPast) {
            classes += "text-slate-300";
          } else {
            classes += "bg-emerald-50 text-emerald-700 hover:bg-emerald-100";
          }

          return (
            <div key={idx} className={classes} title={full ? "Fully booked" : booked > 0 ? `${booked}/${totalUnits} booked` : "Available"}>
              {d}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-emerald-50 border border-emerald-200 inline-block" /> Available</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-amber-100 inline-block" /> Partially booked</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-red-100 inline-block" /> Fully booked</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-gradient-to-br from-brand-600 to-brand-700 inline-block" /> Your selection</span>
      </div>
    </div>
  );
}
