-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ENGINEER', 'EXECUTIVE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ENGINEER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meter" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Meter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelemetryReading" (
    "id" TEXT NOT NULL,
    "meterId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "phaseA_N_voltage" DOUBLE PRECISION NOT NULL,
    "phaseB_N_voltage" DOUBLE PRECISION NOT NULL,
    "phaseC_N_voltage" DOUBLE PRECISION NOT NULL,
    "phaseA_current" DOUBLE PRECISION NOT NULL,
    "phaseB_current" DOUBLE PRECISION NOT NULL,
    "phaseC_current" DOUBLE PRECISION NOT NULL,
    "energyToday" DOUBLE PRECISION NOT NULL,
    "frequency" DOUBLE PRECISION NOT NULL,
    "powerFactor" DOUBLE PRECISION NOT NULL,
    "reactivePower" DOUBLE PRECISION NOT NULL,
    "harmonics" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TelemetryReading_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "TelemetryReading_meterId_timestamp_idx" ON "TelemetryReading"("meterId", "timestamp" DESC);

-- AddForeignKey
ALTER TABLE "TelemetryReading" ADD CONSTRAINT "TelemetryReading_meterId_fkey" FOREIGN KEY ("meterId") REFERENCES "Meter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
