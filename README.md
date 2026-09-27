# RentIt — Rental & Equipment Booking Platform

A **single Next.js app** (frontend + backend together, no separate server)
that lets customers browse and book equipment (cameras, projectors, tools…)
for a date range, while strictly preventing double-bookings.

Data is stored in one simple JSON file (`data/db.json`) using plain Node
`fs` — **no MongoDB, no Postgres, no extra database software** to install.
The file is created automatically (with sample equipment) the first time
you run the app.

## ✅ Features implemented

- **Owner dashboard** (`/owner`) — add/delete equipment, approve/reject
  bookings, mark bookings Active/Returned, live stats (pending, active,
  overdue, revenue).
- **Customer catalog** (`/`) — browse/search/filter 15 seeded equipment items across Camera, Projector, Tools, Audio, Lighting & Power categories.
- **Booking page** (`/book/[id]`) — pick a start & end date, see a visual
  **calendar** highlighting booked (amber/red) vs available (green) days,
  and get an automatic **cost calculation** before confirming.
- **Strict conflict detection** — the backend (`lib/conflict.js`) checks
  every new/approved/activated booking against existing bookings using
  interval-overlap math (`aStart <= bEnd && bStart <= aEnd`). Overlapping
  requests are rejected with a clear error (HTTP 409), even if two people
  try to book at the exact same second.
- **Booking status lifecycle**: `Pending → Approved → Active → Returned`
  (or `Rejected`), fully managed from the Owner dashboard.
- **My Rentals** (`/my-bookings`) — customer's current + past rentals.
- **Overdue indicator** — any `Active` booking whose end date has passed
  is automatically flagged "⚠️ Overdue" everywhere it appears.

## 🛠 How to run it

You need [Node.js](https://nodejs.org) 18+ installed on your computer.

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server
npm run dev

# 3. Open in browser
http://localhost:3000
```

That's it — no database setup, no `.env` file, nothing else to configure.

## 👤 How "login" works (for the demo)

There's no real authentication system (not required by the brief). Use the
top-right of the navbar to:
- type your name (used as the customer identity for bookings), and
- switch the role dropdown between **Customer** and **Owner/Admin** to
  reveal the Owner Dashboard's actions.

## 📁 Project structure

```
app/
  page.js                 → customer catalog
  book/[id]/page.js       → equipment detail + calendar + booking form
  my-bookings/page.js     → customer's current & past rentals
  owner/page.js           → owner dashboard (inventory + bookings)
  api/equipment/          → REST routes: list/create/update/delete equipment
  api/bookings/           → REST routes: list/create bookings, update status
lib/
  db.js                   → tiny JSON-file "database" (read/write helpers)
  conflict.js             → the core overlap-detection logic
components/
  Nav.js, StatusBadge.js, AvailabilityCalendar.js
data/db.json              → auto-generated data file (equipment + bookings)
```

## 🧠 Conflict detection, in plain words

Each equipment item has `totalUnits` (how many physical copies exist).
When someone requests dates `[start, end]`, the server counts how many
**other** bookings (status Pending/Approved/Active) overlap that range.
If that count is already `>= totalUnits`, the request is rejected. This
also re-runs whenever the owner approves or activates a booking, so two
pending requests can never both be approved into a conflict.

## 🚀 Optional next steps

- Deploy to Vercel (works out of the box — just note `data/db.json`
  resets on every deploy there since serverless filesystems aren't
  persistent; swap in a real DB like SQLite/Postgres for production).
- Add email/SMS reminders for overdue rentals.
- Add photo uploads instead of emoji icons.
