import { NextResponse } from "next/server";
import { readDb, writeDb, genId } from "@/lib/db";
import { findConflict, isValidDateRange, daysBetweenInclusive } from "@/lib/conflict";

export async function GET(request) {
  const db = readDb();
  const { searchParams } = new URL(request.url);
  const customerName = searchParams.get("customerName");
  const equipmentId = searchParams.get("equipmentId");

  let bookings = db.bookings;
  if (customerName) {
    bookings = bookings.filter(
      (b) => b.customerName.toLowerCase() === customerName.toLowerCase()
    );
  }
  if (equipmentId) {
    bookings = bookings.filter((b) => b.equipmentId === equipmentId);
  }

  bookings = bookings.map((b) => {
    const eq = db.equipment.find((e) => e.id === b.equipmentId);
    return { ...b, equipment: eq || null };
  });

  return NextResponse.json(
    bookings.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  );
}

export async function POST(request) {
  const body = await request.json();
  const { equipmentId, customerName, startDate, endDate } = body;

  if (!equipmentId || !customerName || !startDate || !endDate) {
    return NextResponse.json(
      { error: "equipmentId, customerName, startDate and endDate are required." },
      { status: 400 }
    );
  }

  if (!isValidDateRange(startDate, endDate)) {
    return NextResponse.json(
      { error: "Invalid date range. End date must be on or after start date." },
      { status: 400 }
    );
  }

  const db = readDb();
  const equipment = db.equipment.find((e) => e.id === equipmentId);
  if (!equipment) {
    return NextResponse.json({ error: "Equipment not found." }, { status: 404 });
  }

  const equipmentBookings = db.bookings.filter((b) => b.equipmentId === equipmentId);

  const { conflict, reason, conflictingBookings } = findConflict({
    equipmentBookings,
    totalUnits: equipment.totalUnits,
    startDate,
    endDate,
  });

  if (conflict) {
    return NextResponse.json(
      {
        error: reason,
        conflictingBookings: conflictingBookings.map((b) => ({
          startDate: b.startDate,
          endDate: b.endDate,
          status: b.status,
        })),
      },
      { status: 409 }
    );
  }

  const days = daysBetweenInclusive(startDate, endDate);
  const totalCost = days * equipment.pricePerDay;

  const newBooking = {
    id: genId("bk"),
    equipmentId,
    customerName,
    startDate,
    endDate,
    days,
    totalCost,
    status: "Pending",
    createdAt: new Date().toISOString(),
  };

  db.bookings.push(newBooking);
  writeDb(db);

  return NextResponse.json({ ...newBooking, equipment }, { status: 201 });
}
