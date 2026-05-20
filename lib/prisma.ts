import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export function getPrisma() {
  if (!hasDatabase()) return null;
  const prisma = globalForPrisma.prisma ?? new PrismaClient();
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
  return prisma;
}
