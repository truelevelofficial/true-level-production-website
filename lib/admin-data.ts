import { getPrisma, hasDatabase } from "./prisma";

export async function getAdminSummary() {
  const prisma = getPrisma();
  if (!prisma) return null;
  const [bookings, clients, payments, expenses, pending] = await Promise.all([
    prisma.booking.count(),
    prisma.client.count(),
    prisma.payment.findMany({ select: { amount: true } }),
    prisma.expense.findMany({ select: { amount: true } }),
    prisma.booking.count({ where: { status: "PENDING" } }),
  ]);
  const revenue = payments.reduce((sum, item) => sum + Number(item.amount), 0);
  const cost = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  return { bookings, clients, revenue, expenses: cost, pending, profit: revenue - cost };
}

export async function getBookings(where: Record<string, unknown> = {}) {
  const prisma = getPrisma();
  if (!prisma) return [];
  return prisma.booking.findMany({ where, include: { client: true }, orderBy: { createdAt: "desc" }, take: 200 });
}

export async function getClients() {
  const prisma = getPrisma();
  if (!prisma) return [];
  return prisma.client.findMany({ include: { bookings: { orderBy: { createdAt: "desc" }, take: 5 } }, orderBy: { createdAt: "desc" }, take: 200 });
}

export async function getAccounting() {
  const prisma = getPrisma();
  if (!prisma) return null;
  const [payments, expenses, clients, bookings] = await Promise.all([
    prisma.payment.findMany({ include: { client: true, booking: true }, orderBy: { date: "desc" }, take: 100 }),
    prisma.expense.findMany({ include: { client: true }, orderBy: { date: "desc" }, take: 100 }),
    prisma.client.findMany({ orderBy: { fullName: "asc" }, take: 200 }),
    prisma.booking.findMany({ include: { client: true }, orderBy: { createdAt: "desc" }, take: 200 }),
  ]);
  const revenue = payments.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const pending = bookings.reduce((sum, item) => sum + Number(item.remainingAmount ?? 0), 0);
  return { payments, expenses, clients, bookings, revenue, totalExpenses, pending, profit: revenue - totalExpenses };
}

export async function getContracts() {
  const prisma = getPrisma();
  if (!prisma) return [];
  return prisma.contract.findMany({ include: { client: true }, orderBy: { createdAt: "desc" }, take: 100 });
}

export { hasDatabase };
