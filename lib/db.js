import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

const SEED = {
  equipment: [
    { id: "eq_1", name: "Canon EOS R5 Camera", category: "Camera", description: "Full-frame mirrorless camera, 45MP, 8K video. Great for shoots & events.", pricePerDay: 1500, emoji: "📷", totalUnits: 2 },
    { id: "eq_2", name: "Epson EX9210 Projector", category: "Projector", description: "4K-support laser projector, 4000 lumens. Ideal for presentations & movie nights.", pricePerDay: 800, emoji: "📽️", totalUnits: 1 },
    { id: "eq_3", name: "DeWalt Power Drill Set", category: "Tools", description: "Cordless drill with full bit set and spare battery.", pricePerDay: 250, emoji: "🛠️", totalUnits: 3 },
    { id: "eq_4", name: "DJI Ronin Gimbal Stabilizer", category: "Camera", description: "3-axis gimbal for smooth cinematic camera movement.", pricePerDay: 600, emoji: "🎥", totalUnits: 1 },
    { id: "eq_5", name: "JBL PartyBox 310 Speaker", category: "Audio", description: "Powerful portable party speaker with lights, 240W.", pricePerDay: 700, emoji: "🔊", totalUnits: 2 },
    { id: "eq_6", name: "Sony A7 IV Camera", category: "Camera", description: "33MP full-frame hybrid camera, excellent for photo & video.", pricePerDay: 1800, emoji: "📸", totalUnits: 1 },
    { id: "eq_7", name: "BenQ TK850 4K Projector", category: "Projector", description: "True 4K HDR projector, perfect for home theatre setups.", pricePerDay: 1000, emoji: "🎬", totalUnits: 1 },
    { id: "eq_8", name: "Bosch Angle Grinder", category: "Tools", description: "Heavy-duty angle grinder for cutting and polishing.", pricePerDay: 200, emoji: "⚙️", totalUnits: 4 },
    { id: "eq_9", name: "Makita Chainsaw", category: "Tools", description: "Petrol chainsaw, ideal for tree trimming and yard work.", pricePerDay: 350, emoji: "🪚", totalUnits: 2 },
    { id: "eq_10", name: "Rode Wireless GO II Mic Kit", category: "Audio", description: "Dual-channel wireless mic system for interviews & vlogging.", pricePerDay: 400, emoji: "🎙️", totalUnits: 3 },
    { id: "eq_11", name: "Manfrotto Tripod Kit", category: "Camera", description: "Sturdy fluid-head tripod for cameras and camcorders.", pricePerDay: 150, emoji: "🎯", totalUnits: 5 },
    { id: "eq_12", name: "Godox 3-Light Studio Kit", category: "Lighting", description: "3-point LED studio lighting kit with softboxes and stands.", pricePerDay: 900, emoji: "💡", totalUnits: 2 },
    { id: "eq_13", name: "Yamaha DJ Mixer", category: "Audio", description: "4-channel professional DJ mixer with built-in effects.", pricePerDay: 650, emoji: "🎚️", totalUnits: 1 },
    { id: "eq_14", name: "Ladder & Scaffolding Set", category: "Tools", description: "Adjustable aluminium ladder, safe for indoor/outdoor work.", pricePerDay: 300, emoji: "🪜", totalUnits: 3 },
    { id: "eq_15", name: "Portable Generator 2kW", category: "Power", description: "Silent petrol generator, ideal for outdoor events and shoots.", pricePerDay: 1200, emoji: "🔌", totalUnits: 2 },
  ],
  bookings: [],
};

function ensureDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(SEED, null, 2), "utf-8");
  }
}

export function readDb() {
  ensureDb();
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    return SEED;
  }
}

export function writeDb(data) {
  ensureDb();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export function genId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
