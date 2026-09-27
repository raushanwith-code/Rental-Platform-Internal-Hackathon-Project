import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { findConflict } from "@/lib/conflict";

const VALID_STATUSES = ["Pending", "Approved", "Active", "Returned", "Rejected"];

export async function PUT(request, { params }) {
  const body = await request.json();
  const db = readDb();
  const idx = db.bookings.findIndex((b) => b.id === params.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const current = db.bookings[idx];

  if (body.status) {
    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    if (["Approved", "Active"].includes(body.status)) {
      const equipment = db.equipment.find((e) => e.id === current.equipmentId);
      const equipmentBookings = db.bookings.filter((b) => b.equipmentId === current.equipmentId);
      const { conflict, reason } = findConflict({
        equipmentBookings,
        totalUnits: equipment.totalUnits,
        startDate: current.startDate,
        endDate: current.endDate,
        excludeBookingId: current.id,
      });
      if (conflict) {
        return NextResponse.json({ error: reason }, { status: 409 });
      }
    }

    current.status = body.status;
  }

  db.bookings[idx] = current;
  writeDb(db);

  const equipment = db.equipment.find((e) => e.id === current.equipmentId);
  return NextResponse.json({ ...current, equipment });
}

export async function DELETE(request, { params }) {
  const db = readDb();
  db.bookings = db.bookings.filter((b) => b.id !== params.id);
  writeDb(db);
  return NextResponse.json({ ok: true });
}
