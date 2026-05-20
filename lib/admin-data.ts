import { getPrisma, hasDatabase } from "./prisma";

export async function getAdminSummary() {
  const prisma = getPrisma();
  if (!prisma) return null;
  try {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tomorrowStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const [bookings, clients, payments, expenses, pending, approved, completed, cancelled, todayMeetings, monthStudioBookings, monthPayments, monthExpenses, pendingBalances] = await Promise.all([
      prisma.booking.count(),
      prisma.client.count(),
      prisma.payment.findMany({ select: { amount: true } }),
      prisma.expense.findMany({ select: { amount: true } }),
      prisma.booking.count({ where: { status: "PENDING" } }),
      prisma.booking.count({ where: { status: "APPROVED" } }),
      prisma.booking.count({ where: { status: "COMPLETED" } }),
      prisma.booking.count({ where: { status: "CANCELLED" } }),
      prisma.booking.count({ where: { type: { in: ["GOOGLE_MEETING", "COMPANY_MEETING"] }, startTime: { gte: todayStart, lt: tomorrowStart } } }),
      prisma.booking.count({ where: { type: "STUDIO", startTime: { gte: monthStart, lt: nextMonthStart } } }),
      prisma.payment.findMany({ where: { date: { gte: monthStart, lt: nextMonthStart } }, select: { amount: true } }),
      prisma.expense.findMany({ where: { date: { gte: monthStart, lt: nextMonthStart } }, select: { amount: true } }),
      prisma.booking.findMany({ where: { paymentStatus: { in: ["UNPAID", "PARTIALLY_PAID"] } }, select: { remainingAmount: true } }),
    ]);
    const revenue = payments.reduce((sum, item) => sum + Number(item.amount), 0);
    const cost = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const monthRevenue = monthPayments.reduce((sum, item) => sum + Number(item.amount), 0);
    const monthCost = monthExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const pendingPayments = pendingBalances.reduce((sum, item) => sum + Number(item.remainingAmount ?? 0), 0);
    return { bookings, clients, revenue, expenses: cost, pending, approved, completed, cancelled, profit: revenue - cost, pendingPayments, todayMeetings, monthStudioBookings, monthRevenue, monthExpenses: monthCost };
  } catch {
    return null;
  }
}

export async function getBookings(where: Record<string, unknown> = {}) {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    return await prisma.booking.findMany({ where, include: { client: true }, orderBy: { createdAt: "desc" }, take: 200 });
  } catch {
    return [];
  }
}

export async function getClients() {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    return await prisma.client.findMany({
      include: {
        bookings: { orderBy: { createdAt: "desc" }, take: 10 },
        contracts: { orderBy: { createdAt: "desc" }, take: 5 },
        payments: { orderBy: { date: "desc" }, take: 20 },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
  } catch {
    return [];
  }
}

export async function getClientById(id: string) {
  const prisma = getPrisma();
  if (!prisma) return null;
  try {
    return await prisma.client.findUnique({
      where: { id },
      include: {
        bookings: { orderBy: { createdAt: "desc" }, take: 100 },
        contracts: { orderBy: { createdAt: "desc" }, take: 50 },
        payments: { orderBy: { date: "desc" }, take: 100 },
        expenses: { orderBy: { date: "desc" }, take: 100 },
      },
    });
  } catch {
    return null;
  }
}

export async function getAccounting() {
  const prisma = getPrisma();
  if (!prisma) return null;
  try {
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
  } catch {
    return null;
  }
}

export async function getContracts() {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    return await prisma.contract.findMany({ include: { client: true, booking: true }, orderBy: { createdAt: "desc" }, take: 100 });
  } catch {
    return [];
  }
}

export async function getUnreadNotificationCount() {
  const prisma = getPrisma();
  if (!prisma) return 0;
  try {
    return await prisma.notification.count({ where: { read: false } });
  } catch {
    return 0;
  }
}

export async function getCompanySettings() {
  const prisma = getPrisma();
  if (!prisma) return {} as Record<string, string>;
  try {
    const rows = await prisma.companySettings.findMany();
    return Object.fromEntries(rows.map((row) => [row.key, row.value]));
  } catch {
    return {} as Record<string, string>;
  }
}

export { hasDatabase };
