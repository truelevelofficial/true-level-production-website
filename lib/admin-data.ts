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

export async function getInvoices() {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    return await prisma.invoice.findMany({
      include: { client: true, items: true, payments: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
  } catch {
    return [];
  }
}

export async function getQuotations() {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    return await prisma.quotation.findMany({
      include: { client: true, items: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
  } catch {
    return [];
  }
}

export async function getQuotationById(id: string) {
  const prisma = getPrisma();
  if (!prisma) return null;
  try {
    return await prisma.quotation.findUnique({
      where: { id },
      include: { client: true, items: { orderBy: { createdAt: "asc" } }, booking: true, project: true },
    });
  } catch {
    return null;
  }
}

export async function getInvoiceById(id: string) {
  const prisma = getPrisma();
  if (!prisma) return null;
  try {
    return await prisma.invoice.findUnique({
      where: { id },
      include: { client: true, items: { orderBy: { createdAt: "asc" } }, payments: { orderBy: { date: "desc" } }, booking: true, project: true, contract: true },
    });
  } catch {
    return null;
  }
}

// ─── Workflow Data ───
import type { TeamMember, WorkflowProject, WorkflowTask, WorkflowApproval, WorkflowDelivery } from "@prisma/client";

export async function getTeamMembers(): Promise<TeamMember[]> {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    return await prisma.teamMember.findMany({ orderBy: { name: "asc" }, take: 100 });
  } catch { return []; }
}

export async function getWorkflowProjects(archived = false): Promise<(WorkflowProject & { owner: TeamMember | null; tasks: WorkflowTask[]; approvals: WorkflowApproval[]; deliveries: WorkflowDelivery[] })[]> {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    return await prisma.workflowProject.findMany({
      where: { archived },
      include: { owner: true, tasks: true, approvals: true, deliveries: true },
      orderBy: { updatedAt: "desc" },
      take: 200,
    }) as any;
  } catch { return []; }
}

export async function getWorkflowTasks(filters: { status?: string; projectId?: string; assigneeId?: string; priority?: string } = {}): Promise<(WorkflowTask & { assignee: TeamMember | null; project: WorkflowProject | null })[]> {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    const where: Record<string, unknown> = {};
    if (filters.status) where.status = filters.status;
    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.assigneeId) where.assigneeId = filters.assigneeId;
    if (filters.priority) where.priority = filters.priority;
    return await prisma.workflowTask.findMany({
      where,
      include: { assignee: true, project: true },
      orderBy: [{ priority: "asc" }, { dueDate: "asc" }],
      take: 200,
    }) as any;
  } catch { return []; }
}

export async function getWorkflowApprovals(): Promise<(WorkflowApproval & { project: WorkflowProject | null })[]> {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    return await prisma.workflowApproval.findMany({
      include: { project: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }) as any;
  } catch { return []; }
}

export async function getWorkflowDeliveries(): Promise<(WorkflowDelivery & { project: WorkflowProject | null })[]> {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    return await prisma.workflowDelivery.findMany({
      include: { project: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }) as any;
  } catch { return []; }
}

export async function getWorkflowOverview() {
  const prisma = getPrisma();
  if (!prisma) return null;
  try {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const [activeProjects, pendingTasks, todayShoots, waitingApproval, inEditing, readyDelivery, overdueTasks, completedThisMonth] = await Promise.all([
      prisma.workflowProject.count({ where: { archived: false, stage: { notIn: ["COMPLETED", "ARCHIVED"] } } }),
      prisma.workflowTask.count({ where: { status: { in: ["TODO", "IN_PROGRESS"] } } }),
      prisma.workflowProject.count({ where: { stage: "SHOOTING", dueDate: { gte: todayStart } } }),
      prisma.workflowApproval.count({ where: { status: { in: ["SENT_TO_CLIENT", "WAITING_FEEDBACK"] } } }),
      prisma.workflowProject.count({ where: { stage: "EDITING" } }),
      prisma.workflowProject.count({ where: { stage: "FINAL_DELIVERY" } }),
      prisma.workflowTask.count({ where: { status: { notIn: ["DONE", "CANCELLED"] }, dueDate: { lt: todayStart } } }),
      prisma.workflowProject.count({ where: { stage: "COMPLETED", updatedAt: { gte: monthStart } } }),
    ]);
    return { activeProjects, pendingTasks, todayShoots, waitingApproval, inEditing, readyDelivery, overdueTasks, completedThisMonth };
  } catch { return null; }
}

// ─── Dashboard Data ───

export type ActivityItem = {
  id: string;
  type: "project" | "booking" | "quotation" | "contract";
  action: string;
  label: string;
  subtitle: string;
  timestamp: Date;
};

export async function getRecentActivity(limit = 20): Promise<ActivityItem[]> {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    const [projects, bookings, quotations, contracts] = await Promise.all([
      prisma.workflowProject.findMany({ select: { id: true, title: true, stage: true, clientName: true, updatedAt: true }, orderBy: { updatedAt: "desc" }, take: limit }),
      prisma.booking.findMany({ select: { id: true, type: true, status: true, client: { select: { fullName: true } }, updatedAt: true }, orderBy: { updatedAt: "desc" }, take: limit }),
      prisma.quotation.findMany({ select: { id: true, quotationNo: true, status: true, client: { select: { fullName: true } }, updatedAt: true }, orderBy: { updatedAt: "desc" }, take: limit }),
      prisma.contract.findMany({ select: { id: true, title: true, status: true, client: { select: { fullName: true } }, updatedAt: true }, orderBy: { updatedAt: "desc" }, take: limit }),
    ]);
    const items: ActivityItem[] = [
      ...projects.map(p => ({ id: p.id, type: "project" as const, action: `Project ${p.stage?.replace(/_/g, " ")}`, label: p.title, subtitle: p.clientName || "", timestamp: p.updatedAt })),
      ...bookings.map(b => ({ id: b.id, type: "booking" as const, action: `Booking ${b.status}`, label: `${b.type.replace("_", " ")}`, subtitle: b.client?.fullName || "", timestamp: b.updatedAt })),
      ...quotations.map(q => ({ id: q.id, type: "quotation" as const, action: `Quotation ${q.status}`, label: q.quotationNo || "", subtitle: q.client?.fullName || "", timestamp: q.updatedAt })),
      ...contracts.map(c => ({ id: c.id, type: "contract" as const, action: `Contract ${c.status}`, label: c.title, subtitle: c.client?.fullName || "", timestamp: c.updatedAt })),
    ];
    return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
  } catch { return []; }
}

export async function getUpcomingMeetings(limit = 10) {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    const now = new Date();
    return await prisma.booking.findMany({
      where: { type: { in: ["GOOGLE_MEETING", "COMPANY_MEETING"] }, status: { in: ["PENDING", "APPROVED"] }, startTime: { gte: now } },
      include: { client: true },
      orderBy: { startTime: "asc" },
      take: limit,
    });
  } catch { return []; }
}

export async function getUpcomingShoots(limit = 10) {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    const now = new Date();
    return await prisma.booking.findMany({
      where: { type: "STUDIO", status: { in: ["PENDING", "APPROVED"] }, startTime: { gte: now } },
      include: { client: true },
      orderBy: { startTime: "asc" },
      take: limit,
    });
  } catch { return []; }
}

export async function getPendingQuotationsCount() {
  const prisma = getPrisma();
  if (!prisma) return 0;
  try {
    return await prisma.quotation.count({ where: { status: { in: ["DRAFT", "SENT"] } } });
  } catch { return 0; }
}

export async function searchEntities(q: string) {
  const prisma = getPrisma();
  if (!prisma || !q.trim()) return { projects: [], clients: [], bookings: [], quotations: [], contracts: [], tasks: [] };
  try {
    const term = q.trim();
    const [projects, clients, bookings, quotations, contracts, tasks] = await Promise.all([
      prisma.workflowProject.findMany({ where: { OR: [{ title: { contains: term, mode: "insensitive" } }, { clientName: { contains: term, mode: "insensitive" } }] }, include: { owner: true }, orderBy: { updatedAt: "desc" }, take: 10 }),
      prisma.client.findMany({ where: { OR: [{ fullName: { contains: term, mode: "insensitive" } }, { companyName: { contains: term, mode: "insensitive" } }, { email: { contains: term, mode: "insensitive" } }] }, orderBy: { updatedAt: "desc" }, take: 10 }),
      prisma.booking.findMany({ where: { OR: [{ client: { fullName: { contains: term, mode: "insensitive" } } }, { notes: { contains: term, mode: "insensitive" } }] }, include: { client: true }, orderBy: { updatedAt: "desc" }, take: 10 }),
      prisma.quotation.findMany({ where: { OR: [{ quotationNo: { contains: term, mode: "insensitive" } }, { client: { fullName: { contains: term, mode: "insensitive" } } }] }, include: { client: true }, orderBy: { updatedAt: "desc" }, take: 10 }),
      prisma.contract.findMany({ where: { OR: [{ title: { contains: term, mode: "insensitive" } }, { client: { fullName: { contains: term, mode: "insensitive" } } }] }, include: { client: true }, orderBy: { updatedAt: "desc" }, take: 10 }),
      prisma.workflowTask.findMany({ where: { title: { contains: term, mode: "insensitive" } }, include: { project: true, assignee: true }, orderBy: { updatedAt: "desc" }, take: 10 }),
    ]);
    return { projects: projects as any, clients, bookings, quotations, contracts, tasks: tasks as any };
  } catch { return { projects: [], clients: [], bookings: [], quotations: [], contracts: [], tasks: [] }; }
}

export async function getMonthlyRevenue() {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    const payments = await prisma.payment.findMany({ select: { amount: true, date: true } });
    const months: Record<string, number> = {};
    payments.forEach(p => {
      const key = `${p.date.getFullYear()}-${String(p.date.getMonth() + 1).padStart(2, "0")}`;
      months[key] = (months[key] || 0) + Number(p.amount);
    });
    return Object.entries(months).sort(([a], [b]) => a.localeCompare(b)).slice(-12).map(([month, revenue]) => ({ month, revenue }));
  } catch { return []; }
}

export async function getRevenueByService() {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    const bookings = await prisma.booking.findMany({ where: { serviceType: { not: null } }, select: { serviceType: true, payments: { select: { amount: true } } } });
    const services: Record<string, number> = {};
    bookings.forEach(b => {
      const type = b.serviceType || "Other";
      const total = b.payments.reduce((s, p) => s + Number(p.amount), 0);
      services[type] = (services[type] || 0) + total;
    });
    return Object.entries(services).sort(([, a], [, b]) => b - a);
  } catch { return []; }
}

export async function getTopClients(limit = 5) {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    const clients = await prisma.client.findMany({ include: { payments: { select: { amount: true } } } });
    return clients.map(c => ({ id: c.id, name: c.fullName, company: c.companyName, total: c.payments.reduce((s, p) => s + Number(p.amount), 0) })).sort((a, b) => b.total - a.total).slice(0, limit);
  } catch { return []; }
}

export async function getTodaysSchedule() {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    return await prisma.booking.findMany({ where: { startTime: { gte: start, lt: end } }, include: { client: true }, orderBy: { startTime: "asc" }, take: 20 });
  } catch { return []; }
}

export async function getTeamWorkload() {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    const members = await prisma.teamMember.findMany({ where: { active: true }, include: { tasks: { where: { status: { notIn: ["DONE", "CANCELLED"] } } } } });
    return members.map(m => ({ id: m.id, name: m.name, role: m.role, department: m.department, taskCount: m.tasks.length }));
  } catch { return []; }
}

export { hasDatabase };
