import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

export async function GET(request, { params }) {
  const db = readDb();
  const item = db.equipment.find((e) => e.id === params.id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(request, { params }) {
  const body = await request.json();
  const db = readDb();
  const idx = db.equipment.findIndex((e) => e.id === params.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  db.equipment[idx] = {
    ...db.equipment[idx],
    ...body,
    id: db.equipment[idx].id,
    pricePerDay: body.pricePerDay !== undefined ? Number(body.pricePerDay) : db.equipment[idx].pricePerDay,
    totalUnits: body.totalUnits !== undefined ? Number(body.totalUnits) : db.equipment[idx].totalUnits,
  };
  writeDb(db);
  return NextResponse.json(db.equipment[idx]);
}

export async function DELETE(request, { params }) {
  const db = readDb();
  const hasActiveBookings = db.bookings.some(
    (b) => b.equipmentId === params.id && ["Pending", "Approved", "Active"].includes(b.status)
  );
  if (hasActiveBookings) {
    return NextResponse.json(
      { error: "Cannot delete equipment with active or pending bookings." },
      { status: 400 }
    );
  }
  db.equipment = db.equipment.filter((e) => e.id !== params.id);
  writeDb(db);
  return NextResponse.json({ ok: true });
}
