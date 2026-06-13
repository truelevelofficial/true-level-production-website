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
  } catch (error) {
    console.error("getAdminSummary FAILED", error);
    return null;
  }
}

export async function getBookings(where: Record<string, unknown> = {}) {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    return await prisma.booking.findMany({ where, include: { client: true }, orderBy: { createdAt: "desc" }, take: 200 });
  } catch (error) {
    console.error("getBookings FAILED", error);
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
  } catch (error) {
    console.error("getClients FAILED", error);
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
  } catch (error) {
    console.error("getUnreadNotificationCount FAILED", error);
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

// ─── Team Center ───

export async function getTeamCenter() {
  const prisma = getPrisma();
  if (!prisma) return null;
  try {
    const members = await prisma.teamMember.findMany({
      where: { active: true },
      include: {
        tasks: { where: { status: { notIn: ["DONE", "CANCELLED"] } } },
        projects: { where: { archived: false }, select: { id: true, title: true, stage: true } },
      },
      orderBy: { name: "asc" },
    });
    const totalMembers = members.length;
    const overloaded = members.filter(m => (m.capacity ?? 100) > 0 && m.tasks.length > Math.round((m.capacity ?? 100) / 20));
    const available = members.filter(m => m.availability === "AVAILABLE" && m.tasks.length === 0);
    const avgPerformance = members.reduce((s, m) => s + (m.performanceScore ?? 0), 0) / (totalMembers || 1);
    const deptStats: Record<string, { count: number; tasks: number; score: number }> = {};
    members.forEach(m => {
      const dept = m.department || "General";
      if (!deptStats[dept]) deptStats[dept] = { count: 0, tasks: 0, score: 0 };
      deptStats[dept].count++;
      deptStats[dept].tasks += m.tasks.length;
      deptStats[dept].score += m.performanceScore ?? 0;
    });
    return { members: members as any, totalMembers, overloaded, available, avgPerformance, deptStats };
  } catch { return null; }
}

// ─── Workflow Notifications ───

export async function getWorkflowNotifications(unreadOnly = false) {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    const where = unreadOnly ? { read: false } : {};
    return await prisma.workflowNotification.findMany({
      where,
      include: { project: { select: { id: true, title: true } }, task: { select: { id: true, title: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch { return []; }
}

export async function getUnreadWorkflowNotificationCount() {
  const prisma = getPrisma();
  if (!prisma) return 0;
  try {
    return await prisma.workflowNotification.count({ where: { read: false } });
  } catch (error) { console.error("getUnreadWorkflowNotificationCount FAILED", error); return 0; }
}

// ─── Approval Requests ───

export async function getApprovalRequests(filters: { status?: string; type?: string } = {}) {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    const where: Record<string, unknown> = {};
    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;
    return await prisma.approvalRequest.findMany({
      where,
      include: { project: { select: { id: true, title: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch { return []; }
}

// ─── Content Production ───

export async function getContentProductions(filters: { stage?: string; projectId?: string } = {}) {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    const where: Record<string, unknown> = {};
    if (filters.stage) where.stage = filters.stage;
    if (filters.projectId) where.projectId = filters.projectId;
    return await prisma.contentProduction.findMany({
      where,
      include: { project: { select: { id: true, title: true } } },
      orderBy: { updatedAt: "desc" },
      take: 100,
    });
  } catch { return []; }
}

// ─── Automation Rules ───

export async function getAutomationRules() {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    return await prisma.automationRule.findMany({ orderBy: { name: "asc" } });
  } catch { return []; }
}

// ─── Reports ───

export async function getReports() {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    return await prisma.report.findMany({ orderBy: { createdAt: "desc" } });
  } catch { return []; }
}

// ─── Studio Operations ───

export async function getStudioRooms() {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    return await prisma.studioRoom.findMany({ orderBy: { name: "asc" } });
  } catch { return []; }
}

export async function getStudioEquipment() {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    return await prisma.studioEquipment.findMany({ orderBy: { name: "asc" } });
  } catch { return []; }
}

export async function getCreators() {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    return await prisma.creator.findMany({ orderBy: { name: "asc" } });
  } catch { return []; }
}

export async function getStudioCalendar(from?: Date, to?: Date) {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    const start = from || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = to || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
    return await prisma.booking.findMany({
      where: { type: "STUDIO", startTime: { gte: start }, endTime: { lte: end } },
      include: { client: true },
      orderBy: { startTime: "asc" },
    });
  } catch { return []; }
}

// ─── CRM: Client Timeline ───

export async function getClientTimeline(clientId: string) {
  const prisma = getPrisma();
  if (!prisma) return null;
  try {
    const clientData = await prisma.client.findUnique({
      where: { id: clientId },
      include: { payments: { orderBy: { date: "desc" }, take: 50 }, expenses: { orderBy: { date: "desc" }, take: 50 } },
    });
    if (!clientData) return null;
    const [bookings, quotations, contracts, invoices, projects] = await Promise.all([
      prisma.booking.findMany({ where: { clientId }, include: { client: true }, orderBy: { startTime: "desc" }, take: 50 }),
      prisma.quotation.findMany({ where: { clientId }, include: { client: true }, orderBy: { createdAt: "desc" }, take: 50 }),
      prisma.contract.findMany({ where: { clientId }, include: { client: true }, orderBy: { createdAt: "desc" }, take: 50 }),
      prisma.invoice.findMany({ where: { clientId }, include: { client: true }, orderBy: { createdAt: "desc" }, take: 50 }),
      prisma.workflowProject.findMany({ where: { clientName: clientData.fullName || undefined }, orderBy: { updatedAt: "desc" }, take: 50 }),
    ]);
    const totalRevenue = clientData.payments.reduce((s, p) => s + Number(p.amount), 0);
    const totalExpenses = clientData.expenses.reduce((s, e) => s + Number(e.amount), 0);
    return { client: clientData, bookings, quotations, contracts, invoices, projects, totalRevenue, totalExpenses };
  } catch { return null; }
}

// ─── Finance Center ───

export async function getFinanceCenter() {
  const prisma = getPrisma();
  if (!prisma) return null;
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const [allPayments, allExpenses, invoices, monthlyPayments, monthlyExpenses, yearlyPayments, yearlyExpenses] = await Promise.all([
      prisma.payment.findMany({ select: { amount: true, date: true, clientId: true, client: { select: { fullName: true } } } }),
      prisma.expense.findMany({ select: { amount: true, date: true, category: true } }),
      prisma.invoice.findMany({ select: { total: true, paidAmount: true, remainingAmount: true, status: true, paymentStatus: true } }),
      prisma.payment.findMany({ where: { date: { gte: monthStart } }, select: { amount: true } }),
      prisma.expense.findMany({ where: { date: { gte: monthStart } }, select: { amount: true } }),
      prisma.payment.findMany({ where: { date: { gte: yearStart } }, select: { amount: true } }),
      prisma.expense.findMany({ where: { date: { gte: yearStart } }, select: { amount: true } }),
    ]);
    const totalRevenue = allPayments.reduce((s, p) => s + Number(p.amount), 0);
    const totalExpenses = allExpenses.reduce((s, e) => s + Number(e.amount), 0);
    const mrr = monthlyPayments.reduce((s, p) => s + Number(p.amount), 0);
    const arr = mrr * 12;
    const outstandingInvoices = invoices.filter(i => i.paymentStatus !== "PAID" && i.paymentStatus !== "REFUNDED");
    const outstandingTotal = outstandingInvoices.reduce((s, i) => s + Number(i.remainingAmount), 0);
    const cashFlow = mrr - monthlyExpenses.reduce((s, e) => s + Number(e.amount), 0);

    // Revenue by client
    const byClient: Record<string, number> = {};
    allPayments.forEach(p => { const name = p.client?.fullName || "Unknown"; byClient[name] = (byClient[name] || 0) + Number(p.amount); });
    const revenueByClient = Object.entries(byClient).sort(([, a], [, b]) => b - a).slice(0, 10);

    // Monthly trend
    const months: Record<string, { revenue: number; expenses: number }> = {};
    allPayments.forEach(p => { const k = `${p.date.getFullYear()}-${String(p.date.getMonth() + 1).padStart(2, "0")}`; if (!months[k]) months[k] = { revenue: 0, expenses: 0 }; months[k].revenue += Number(p.amount); });
    allExpenses.forEach(e => { const k = `${e.date.getFullYear()}-${String(e.date.getMonth() + 1).padStart(2, "0")}`; if (!months[k]) months[k] = { revenue: 0, expenses: 0 }; months[k].expenses += Number(e.amount); });
    const monthlyTrend = Object.entries(months).sort(([a], [b]) => a.localeCompare(b)).slice(-12).map(([month, d]) => ({ month, revenue: d.revenue, expenses: d.expenses, profit: d.revenue - d.expenses }));

    return { totalRevenue, totalExpenses, profit: totalRevenue - totalExpenses, mrr, arr, outstandingInvoices: outstandingTotal, cashFlow, revenueByClient, monthlyTrend };
  } catch { return null; }
}

// ─── Roles ───

export async function getRoles() {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    return await prisma.role.findMany({ include: { permissions: true }, orderBy: { name: "asc" } });
  } catch { return []; }
}

// ─── Header Indicators ───

export async function getPendingTasksCount() {
  const prisma = getPrisma();
  if (!prisma) return 0;
  try { return await prisma.workflowTask.count({ where: { status: { in: ["TODO", "IN_PROGRESS"] } } }); } catch (error) { console.error("getPendingTasksCount FAILED", error); return 0; }
}

export async function getUpcomingMeetingsCount() {
  const prisma = getPrisma();
  if (!prisma) return 0;
  try {
    const now = new Date();
    return await prisma.booking.count({ where: { type: { in: ["GOOGLE_MEETING", "COMPANY_MEETING"] }, status: { in: ["PENDING", "APPROVED"] }, startTime: { gte: now } } });
  } catch (error) { console.error("getUpcomingMeetingsCount FAILED", error); return 0; }
}

export async function getOverdueItemsCount() {
  const prisma = getPrisma();
  if (!prisma) return 0;
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [tasks, invoices] = await Promise.all([
      prisma.workflowTask.count({ where: { status: { notIn: ["DONE", "CANCELLED"] }, dueDate: { lt: today } } }),
      prisma.invoice.count({ where: { paymentStatus: { in: ["UNPAID", "PARTIALLY_PAID"] }, dueDate: { lt: today } } }),
    ]);
    return tasks + invoices;
  } catch (error) { console.error("getOverdueItemsCount FAILED", error); return 0; }
}

// ─── Activity Log ───

export async function getActivityLogs(limit = 100, entityType?: string) {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    const where: Record<string, unknown> = {};
    if (entityType) where.entityType = entityType;
    return await prisma.activityLog.findMany({ where, orderBy: { createdAt: "desc" }, take: limit });
  } catch { return []; }
}

export async function getActivityLogsByEntity(entityType: string, entityId: string) {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    return await prisma.activityLog.findMany({ where: { entityType, entityId }, orderBy: { createdAt: "desc" }, take: 50 });
  } catch { return []; }
}

// ─── Activity Log: Helper ───

export async function logActivity(params: { action: string; entityType: string; entityId?: string; entityName?: string; description?: string; metadata?: Record<string, unknown>; userName?: string }) {
  const prisma = getPrisma();
  if (!prisma) return;
  try {
    await prisma.activityLog.create({
      data: {
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId || null,
        entityName: params.entityName || null,
        description: params.description || null,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
        userName: params.userName || "System",
      },
    });
  } catch { /* silent */ }
}

// ─── File Attachments ───

export async function getFileAttachments(projectId?: string, folder?: string) {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    const where: Record<string, unknown> = {};
    if (projectId) where.projectId = projectId;
    if (folder) where.folder = folder;
    return await prisma.fileAttachment.findMany({ where, orderBy: { createdAt: "desc" }, take: 200 });
  } catch { return []; }
}

export async function getFileAttachmentById(id: string) {
  const prisma = getPrisma();
  if (!prisma) return null;
  try {
    return await prisma.fileAttachment.findUnique({ where: { id } });
  } catch { return null; }
}

export async function getProjectFolders() {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    const folders = await prisma.fileAttachment.findMany({ select: { folder: true }, distinct: ["folder"] });
    return folders.map(f => f.folder).filter(Boolean) as string[];
  } catch { return []; }
}

export async function getProjectsWithFiles() {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    const projects = await prisma.workflowProject.findMany({
      where: { fileAttachments: { some: {} } },
      include: { fileAttachments: { orderBy: { createdAt: "desc" }, take: 5 } },
      orderBy: { updatedAt: "desc" },
      take: 100,
    }) as any;
    return projects;
  } catch { return []; }
}

// ─── Notification Auto-Triggers ───

export async function createWorkflowNotification(data: { type: string; title: string; message?: string; projectId?: string; taskId?: string; targetEmail?: string; autoTriggered?: boolean }) {
  const prisma = getPrisma();
  if (!prisma) return null;
  try {
    return await prisma.workflowNotification.create({ data });
  } catch { return null; }
}

export async function getUnreadNotificationsForUser(email?: string) {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    const where: Record<string, unknown> = { read: false };
    if (email) where.targetEmail = email;
    return await prisma.workflowNotification.findMany({ where, orderBy: { createdAt: "desc" }, take: 50 });
  } catch { return []; }
}

// ─── Project Profitability ───

export async function getProjectProfitability() {
  const prisma = getPrisma();
  if (!prisma) return null;
  try {
    const projects = await prisma.workflowProject.findMany({
      where: { archived: false },
      include: {
        tasks: { select: { id: true, status: true } },
        fileAttachments: { select: { id: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 200,
    }) as any;

    // Get all payments linked to projects via booking/client
    // Get invoice totals linked to projects
    const allInvoices = await prisma.invoice.findMany({
      where: { projectId: { not: null } },
      select: { projectId: true, total: true, paidAmount: true, remainingAmount: true },
    });

    // Get expenses
    const allExpenses = await prisma.expense.findMany({ select: { amount: true, description: true, date: true } });
    const totalExpenses = allExpenses.reduce((s, e) => s + Number(e.amount), 0);

    // Calculate per-project metrics
    interface ProjectEntry { id: string; title: string; stage: string; taskCount: number; completedTasks: number; invoiceTotal: number; paidAmount: number; fileCount: number }
    const projectMap: Record<string, ProjectEntry> = {};
    for (const p of projects) {
      projectMap[p.id] = {
        id: p.id, title: p.title, stage: p.stage,
        taskCount: p.tasks?.length || 0,
        completedTasks: p.tasks?.filter((t: any) => t.status === "DONE").length || 0,
        invoiceTotal: 0, paidAmount: 0, fileCount: p.fileAttachments?.length || 0,
      };
    }
    for (const inv of allInvoices) {
      const pid = inv.projectId!;
      if (projectMap[pid]) {
        projectMap[pid].invoiceTotal += Number(inv.total);
        projectMap[pid].paidAmount += Number(inv.paidAmount);
      }
    }

    const profitability = Object.values(projectMap).map(p => ({
      ...p,
      estimatedProfit: p.invoiceTotal,
      margin: p.invoiceTotal > 0 ? Math.round((p.invoiceTotal / (p.invoiceTotal + totalExpenses * 0.01)) * 100) : 0,
      progress: p.taskCount > 0 ? Math.round((p.completedTasks / p.taskCount) * 100) : 0,
    })).sort((a, b) => b.estimatedProfit - a.estimatedProfit);

    const totalRevenue = profitability.reduce((s, p) => s + p.estimatedProfit, 0);
    const totalProfit = totalRevenue - totalExpenses;
    const avgMargin = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

    return { profitability, totalRevenue, totalExpenses, totalProfit, avgMargin, projectCount: profitability.length };
  } catch { return null; }
}

// ─── Client Portal ───

export async function getClientPortalUser(email: string) {
  const prisma = getPrisma();
  if (!prisma) return null;
  try {
    return await prisma.clientPortalUser.findUnique({
      where: { email },
      include: { client: true },
    });
  } catch { return null; }
}

export async function getClientPortalUserByClientId(clientId: string) {
  const prisma = getPrisma();
  if (!prisma) return null;
  try {
    return await prisma.clientPortalUser.findUnique({
      where: { clientId },
      include: { client: true },
    });
  } catch { return null; }
}

export async function getPortalDeliverables(clientName: string) {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    return await prisma.workflowDelivery.findMany({
      where: { project: { clientName } },
      include: { project: { select: { id: true, title: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }) as any;
  } catch { return []; }
}

export async function getPortalQuotations(clientId: string) {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    return await prisma.quotation.findMany({
      where: { clientId, status: { in: ["SENT", "ACCEPTED"] } },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }) as any;
  } catch { return []; }
}

export async function getPortalContracts(clientId: string) {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    return await prisma.contract.findMany({
      where: { clientId, status: { in: ["SENT", "SIGNED"] } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }) as any;
  } catch { return []; }
}

export async function getPortalInvoices(clientId: string) {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    return await prisma.invoice.findMany({
      where: { clientId, status: "SENT" },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }) as any;
  } catch { return []; }
}

export async function getPortalProjects(clientName: string) {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    return await prisma.workflowProject.findMany({
      where: { clientName, archived: false },
      include: { deliveries: true, fileAttachments: true },
      orderBy: { updatedAt: "desc" },
      take: 50,
    }) as any;
  } catch { return []; }
}

export { hasDatabase };
