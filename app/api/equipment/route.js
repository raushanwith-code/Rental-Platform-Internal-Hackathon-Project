import { NextResponse } from "next/server";
import { readDb, writeDb, genId } from "@/lib/db";

export async function GET() {
  const db = readDb();
  return NextResponse.json(db.equipment);
}

export async function POST(request) {
  const body = await request.json();
  const { name, category, description, pricePerDay, emoji, totalUnits } = body;

  if (!name || !category || !pricePerDay) {
    return NextResponse.json(
      { error: "name, category and pricePerDay are required." },
      { status: 400 }
    );
  }

  const db = readDb();
  const newItem = {
    id: genId("eq"),
    name,
    category,
    description: description || "",
    pricePerDay: Number(pricePerDay),
    emoji: emoji || "📦",
    totalUnits: Math.max(1, Number(totalUnits) || 1),
  };
  db.equipment.push(newItem);
  writeDb(db);

  return NextResponse.json(newItem, { status: 201 });
}
