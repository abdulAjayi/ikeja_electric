import "dotenv/config";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../src/db.js";

const INITIAL_METERS = [
  { id: "IKJ-IM-001", location: "Ikeja" },
  { id: "IKJ-ANM-005", location: "Anifowose" },
  { id: "IKJ-OM-002", location: "Oregun" },
  { id: "IKJ-AM-003", location: "Alawa" },
  { id: "IKJ-AGM-004", location: "Agidingbi" },
];

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Seed Initial 5 Meters
  for (const m of INITIAL_METERS) {
    await prisma.meter.upsert({
      where: { id: m.id },
      update: { location: m.location },
      create: { id: m.id, location: m.location },
    });
    console.log(`  - Meter: [${m.id}] ${m.location}`);
  }

  // 2. Seed Role Accounts (Engineer and Executive only)
  const engineerPasswordHash = await bcrypt.hash("Engineer123!", 10);
  const execPasswordHash = await bcrypt.hash("Exec123!", 10);

  // Facility Engineer Account
  await prisma.user.upsert({
    where: { email: "engineer@ikeja.io" },
    update: {
      name: "Lead Facility Engineer",
      password: engineerPasswordHash,
      role: Role.ENGINEER,
    },
    create: {
      email: "engineer@ikeja.io",
      name: "Lead Facility Engineer",
      password: engineerPasswordHash,
      role: Role.ENGINEER,
    },
  });
  console.log("  - User: engineer@ikeja.io (Role: ENGINEER)");

  // Executive Account
  await prisma.user.upsert({
    where: { email: "exec@ikeja.io" },
    update: {
      name: "Chief Operations Executive",
      password: execPasswordHash,
      role: Role.EXECUTIVE,
    },
    create: {
      email: "exec@ikeja.io",
      name: "Chief Operations Executive",
      password: execPasswordHash,
      role: Role.EXECUTIVE,
    },
  });
  console.log("  - User: exec@ikeja.io (Role: EXECUTIVE)");

  console.log("✅ Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
