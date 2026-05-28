import { getPrisma } from "./prisma";

export function monthRange(month?: string) {
  if (!month) return { current: {}, prev: {} };
  const [y, m] = month.split("-").map(Number);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 1);
  const prevStart = new Date(y, m - 2, 1);
  const prevEnd = new Date(y, m - 1, 1);
  return {
    current: { gte: start, lt: end },
    prev: { gte: prevStart, lt: prevEnd },
  };
}

export function monthLabel(month?: string) {
  if (!month) return "All Time";
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export async function getAvailableMonths() {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    const [clientMonths, bookingMonths, paymentMonths, expenseMonths, contractMonths] = await Promise.all([
      prisma.client.findMany({ select: { createdAt: true }, orderBy: { createdAt: "desc" } }),
      prisma.booking.findMany({ select: { startTime: true, createdAt: true }, orderBy: { startTime: "desc" } }),
      prisma.payment.findMany({ select: { date: true }, orderBy: { date: "desc" } }),
      prisma.expense.findMany({ select: { date: true }, orderBy: { date: "desc" } }),
      prisma.contract.findMany({ select: { createdAt: true }, orderBy: { createdAt: "desc" } }),
    ]);
    const allDates = [...clientMonths.map(r => r.createdAt), ...bookingMonths.map(r => r.startTime || r.createdAt), ...paymentMonths.map(r => r.date), ...expenseMonths.map(r => r.date), ...contractMonths.map(r => r.createdAt)];
    const monthSet = new Set<string>();
    allDates.forEach(d => monthSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`));
    return [...monthSet].sort().reverse();
  } catch { return []; }
}

export async function getLatestMonth() {
  const months = await getAvailableMonths();
  if (months.length === 0) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }
  return months[0];
}

type MonthData = {
  revenue: number; expenses: number; profit: number;
  newClients: number; wonClients: number; lostClients: number;
  meetings: number; completedMeetings: number; cancelledMeetings: number;
  studioBookings: number; studioHours: number;
  signedContracts: number; activeProjects: number; completedProjects: number;
};

async function getMonthData(dr: ReturnType<typeof monthRange>["current"]): Promise<MonthData> {
  const prisma = getPrisma();
  if (!prisma || !Object.keys(dr).length) return { revenue: 0, expenses: 0, profit: 0, newClients: 0, wonClients: 0, lostClients: 0, meetings: 0, completedMeetings: 0, cancelledMeetings: 0, studioBookings: 0, studioHours: 0, signedContracts: 0, activeProjects: 0, completedProjects: 0 };
  try {
    const [newClients, wonClients, lostClients, meetings, completedMeetings, cancelledMeetings, studioBookings, studioHours, paymentAgg, expenseAgg, signedContracts, activeProjects, completedProjects] = await Promise.all([
      prisma.client.count({ where: { createdAt: dr } }),
      prisma.client.count({ where: { pipelineStatus: "Won", updatedAt: dr } }),
      prisma.client.count({ where: { pipelineStatus: "Lost", updatedAt: dr } }),
      prisma.booking.count({ where: { type: { in: ["GOOGLE_MEETING", "COMPANY_MEETING"] }, startTime: dr } }),
      prisma.booking.count({ where: { type: { in: ["GOOGLE_MEETING", "COMPANY_MEETING"] }, status: "COMPLETED", startTime: dr } }),
      prisma.booking.count({ where: { type: { in: ["GOOGLE_MEETING", "COMPANY_MEETING"] }, status: "CANCELLED", startTime: dr } }),
      prisma.booking.count({ where: { type: "STUDIO", startTime: dr } }),
      prisma.booking.aggregate({ where: { type: "STUDIO", startTime: dr, durationHours: { not: null } }, _sum: { durationHours: true } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { date: dr } }),
      prisma.expense.aggregate({ _sum: { amount: true }, where: { date: dr } }),
      prisma.contract.count({ where: { createdAt: dr, status: "SIGNED" } }),
      prisma.project.count({ where: { status: "ACTIVE" } }).catch(() => 0),
      prisma.project.count({ where: { status: "COMPLETED" } }).catch(() => 0),
    ]);
    return {
      newClients, wonClients, lostClients,
      meetings, completedMeetings, cancelledMeetings,
      studioBookings, studioHours: Number(studioHours._sum?.durationHours ?? 0),
      revenue: Number(paymentAgg._sum?.amount ?? 0),
      expenses: Number(expenseAgg._sum?.amount ?? 0),
      profit: Number(paymentAgg._sum?.amount ?? 0) - Number(expenseAgg._sum?.amount ?? 0),
      signedContracts, activeProjects, completedProjects,
    };
  } catch { return { revenue: 0, expenses: 0, profit: 0, newClients: 0, wonClients: 0, lostClients: 0, meetings: 0, completedMeetings: 0, cancelledMeetings: 0, studioBookings: 0, studioHours: 0, signedContracts: 0, activeProjects: 0, completedProjects: 0 }; }
}

export function calcChange(current: number, prev: number): { pct: number; dir: "up" | "down" | "same" } {
  if (prev === 0 && current === 0) return { pct: 0, dir: "same" };
  if (prev === 0) return { pct: 100, dir: "up" };
  const pct = Math.round(((current - prev) / prev) * 100);
  return { pct: Math.abs(pct), dir: pct > 0 ? "up" : pct < 0 ? "down" : "same" };
}

export async function getExecutiveOverview(month?: string) {
  const { current, prev } = monthRange(month);
  const [data, prevData] = await Promise.all([getMonthData(current), getMonthData(prev)]);
  return { current: data, previous: prevData, change: {
    revenue: calcChange(data.revenue, prevData.revenue),
    expenses: calcChange(data.expenses, prevData.expenses),
    profit: calcChange(data.profit, prevData.profit),
    newClients: calcChange(data.newClients, prevData.newClients),
    meetings: calcChange(data.meetings, prevData.meetings),
    studioBookings: calcChange(data.studioBookings, prevData.studioBookings),
    studioHours: calcChange(data.studioHours, prevData.studioHours),
    signedContracts: calcChange(data.signedContracts, prevData.signedContracts),
    completedProjects: calcChange(data.completedProjects, prevData.completedProjects),
  }};
}

export async function getClientAnalytics(month?: string) {
  const prisma = getPrisma();
  if (!prisma) return null;
  const { current: dr } = monthRange(month);
  try {
    const [clients, payments, meetings] = await Promise.all([
      prisma.client.findMany({ where: Object.keys(dr).length ? { createdAt: dr } : {}, include: { payments: { select: { amount: true, status: true, date: true } }, bookings: { select: { id: true, type: true, createdAt: true } } } }),
      prisma.payment.findMany({ include: { client: true }, ...(Object.keys(dr).length ? { where: { date: dr } } : {}) }),
      prisma.booking.findMany({ where: { type: { in: ["GOOGLE_MEETING", "COMPANY_MEETING"] }, ...(Object.keys(dr).length ? { startTime: dr } : {}) }, include: { client: true } }),
    ]);
    const byType: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    const pipeline: Record<string, number> = {};
    clients.forEach(c => { byType[c.clientType || "Unspecified"] = (byType[c.clientType || "Unspecified"] || 0) + 1; bySource[c.leadSource || "Unspecified"] = (bySource[c.leadSource || "Unspecified"] || 0) + 1; pipeline[c.pipelineStatus || "No Status"] = (pipeline[c.pipelineStatus || "No Status"] || 0) + 1; });
    const won = clients.filter(c => c.pipelineStatus === "Won").length;
    const lost = clients.filter(c => c.pipelineStatus === "Lost").length;
    const total = clients.length;
    const conversionRate = total > 0 ? Math.round((won / total) * 100) : 0;
    const avgValue = clients.length > 0 ? payments.reduce((s, p) => s + Number(p.amount), 0) / clients.length : 0;
    const topRevenue = [...clients].map(c => ({ name: c.fullName, revenue: c.payments.reduce((s, p) => s + Number(p.amount), 0) })).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
    const topBookings = [...clients].filter(c => c.bookings.length > 0).map(c => ({ name: c.fullName, count: c.bookings.length })).sort((a, b) => b.count - a.count).slice(0, 10);
    const needsFollowUp = clients.filter(c => !c.lastContactDate || (Date.now() - c.lastContactDate.getTime()) > 14 * 86400000).map(c => ({ id: c.id, name: c.fullName, email: c.email, phone: c.phone, lastContact: c.lastContactDate }));
    const pendingPayments = clients.filter(c => c.payments.some(p => p.status === "UNPAID")).map(c => ({ id: c.id, name: c.fullName, amount: c.payments.filter(p => p.status === "UNPAID").reduce((s, p) => s + Number(p.amount), 0) }));
    return { totalClients: total, byType, bySource, pipeline, won, lost, conversionRate, avgValue, topRevenue, topBookings, needsFollowUp, pendingPayments };
  } catch { return null; }
}

export async function getPipelineAnalytics(month?: string) {
  const prisma = getPrisma();
  if (!prisma) return null;
  const { current: dr } = monthRange(month);
  try {
    const stages = ["New Lead", "Contacted", "Meeting Scheduled", "Proposal Sent", "Negotiation", "Won", "Lost"] as const;
    const counts = await Promise.all(stages.map(async (stage) => {
      const count = await prisma.client.count({ where: { pipelineStatus: stage, ...(Object.keys(dr).length ? { updatedAt: dr } : {}) } });
      return { stage, count };
    }));
    const withRevenue = await Promise.all(counts.map(async (c) => {
      const payments = c.stage === "Won" ? await prisma.payment.aggregate({ _sum: { amount: true }, where: { client: { pipelineStatus: "Won" } } }) : { _sum: { amount: null } };
      return { ...c, revenue: Number(payments._sum?.amount ?? 0) };
    }));
    return withRevenue;
  } catch { return null; }
}

export async function getMeetingsAnalytics(month?: string) {
  const prisma = getPrisma();
  if (!prisma) return null;
  const { current: dr } = monthRange(month);
  try {
    const bookings = await prisma.booking.findMany({ where: { type: { in: ["GOOGLE_MEETING", "COMPANY_MEETING"] }, ...(Object.keys(dr).length ? { startTime: dr } : {}) }, include: { client: true } });
    const total = bookings.length;
    const googleMeetings = bookings.filter(b => b.type === "GOOGLE_MEETING").length;
    const inCompany = bookings.filter(b => b.type === "COMPANY_MEETING").length;
    const completed = bookings.filter(b => b.status === "COMPLETED").length;
    const cancelled = bookings.filter(b => b.status === "CANCELLED").length;
    const approved = bookings.filter(b => b.status === "APPROVED").length;
    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
    const upcoming = bookings.filter(b => b.status === "APPROVED" && b.startTime > new Date()).slice(0, 20);
    const noShow = bookings.filter(b => b.status === "CANCELLED" && b.startTime < new Date()).slice(0, 10);
    const noNotes = bookings.filter(b => !b.notes).length;
    return { total, googleMeetings, inCompany, completed, cancelled, approved, approvalRate, upcoming, noShow, noNotes };
  } catch { return null; }
}

export async function getStudioAnalytics(month?: string) {
  const prisma = getPrisma();
  if (!prisma) return null;
  const { current: dr } = monthRange(month);
  try {
    const bookings = await prisma.booking.findMany({ where: { type: "STUDIO", ...(Object.keys(dr).length ? { startTime: dr } : {}) }, include: { client: true } });
    if (!bookings.length) return null;
    const total = bookings.length;
    const approved = bookings.filter(b => b.status === "APPROVED").length;
    const completed = bookings.filter(b => b.status === "COMPLETED").length;
    const cancelled = bookings.filter(b => b.status === "CANCELLED").length;
    const totalHours = bookings.reduce((s, b) => s + (b.durationHours ?? 0), 0);
    const revenue = bookings.reduce((s, b) => s + Number(b.price ?? 0), 0);
    const avgValue = total > 0 ? Math.round(revenue / total) : 0;
    const avgDuration = total > 0 ? Math.round(totalHours / total) : 0;
    const setupCount: Record<string, number> = {};
    const setupRevenue: Record<string, number> = {};
    bookings.forEach(b => {
      const setup = b.studioSetup || "Unspecified";
      setupCount[setup] = (setupCount[setup] || 0) + 1;
      setupRevenue[setup] = (setupRevenue[setup] || 0) + Number(b.price ?? 0);
    });
    const bestSetup = Object.entries(setupCount).sort((a, b) => b[1] - a[1]);
    const topClients = [...bookings.filter(b => b.client).reduce((map, b) => { const name = b.client.fullName; const existing = map.get(name) || { name, bookings: 0, revenue: 0 }; existing.bookings++; existing.revenue += Number(b.price ?? 0); map.set(name, existing); return map; }, new Map()).values()].sort((a, b) => b.revenue - a.revenue).slice(0, 10);
    const dayCount: Record<string, number> = {};
    bookings.forEach(b => { const day = b.startTime.toLocaleDateString("en", { weekday: "long" }); dayCount[day] = (dayCount[day] || 0) + 1; });
    const bestDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0];
    return { total, approved, completed, cancelled, totalHours, revenue, avgValue, avgDuration, setupCount, setupRevenue, bestSetup, topClients, bestDay: bestDay?.[0] || "N/A", upcoming: bookings.filter(b => b.status === "APPROVED" && b.startTime > new Date()) };
  } catch { return null; }
}

export async function getAccountingAnalytics(month?: string) {
  const prisma = getPrisma();
  if (!prisma) return null;
  const { current: dr, prev } = monthRange(month);
  try {
    const [payments, expenses, bookings, prevPayments, prevExpenses] = await Promise.all([
      prisma.payment.findMany({ include: { client: true }, ...(Object.keys(dr).length ? { where: { date: dr } } : {}) }),
      prisma.expense.findMany({ include: { client: true }, ...(Object.keys(dr).length ? { where: { date: dr } } : {}) }),
      prisma.booking.findMany({ where: { paymentStatus: { in: ["UNPAID", "PARTIALLY_PAID"] } }, select: { remainingAmount: true, client: { select: { fullName: true } } } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: Object.keys(prev).length ? { date: prev } : {} }),
      prisma.expense.aggregate({ _sum: { amount: true }, where: Object.keys(prev).length ? { date: prev } : {} }),
    ]);
    const revenue = payments.reduce((s, p) => s + Number(p.amount), 0);
    const cost = expenses.reduce((s, p) => s + Number(p.amount), 0);
    const profit = revenue - cost;
    const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;
    const prevRevenue = Number(prevPayments._sum?.amount ?? 0);
    const prevCost = Number(prevExpenses._sum?.amount ?? 0);
    const byCategory: Record<string, number> = {};
    expenses.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount); });
    const byClient: Record<string, number> = {};
    payments.forEach(p => { if (p.client) byClient[p.client.fullName] = (byClient[p.client.fullName] || 0) + Number(p.amount); });
    const byMethod: Record<string, number> = {};
    payments.forEach(p => { byMethod[p.method] = (byMethod[p.method] || 0) + Number(p.amount); });
    const pending = bookings.filter(b => b.remainingAmount && Number(b.remainingAmount) > 0).map(b => ({ client: b.client?.fullName || "Unknown", amount: Number(b.remainingAmount) }));
    return { revenue, expenses: cost, profit, margin, byCategory, byClient: Object.entries(byClient).sort((a, b) => b[1] - a[1]).slice(0, 10), byMethod: Object.entries(byMethod).sort((a, b) => b[1] - a[1]), pending, prevRevenue, prevCost, prevProfit: prevRevenue - prevCost };
  } catch { return null; }
}

export async function getContractsAnalytics(month?: string) {
  const prisma = getPrisma();
  if (!prisma) return null;
  const { current: dr } = monthRange(month);
  try {
    const contracts = await prisma.contract.findMany({ where: Object.keys(dr).length ? { createdAt: dr } : {}, include: { client: true } });
    const total = contracts.length;
    const draft = contracts.filter(c => c.status === "DRAFT").length;
    const sent = contracts.filter(c => c.status === "SENT").length;
    const signed = contracts.filter(c => c.status === "SIGNED").length;
    const cancelled = contracts.filter(c => c.status === "CANCELLED").length;
    const signedValue = contracts.filter(c => c.status === "SIGNED" && c.totalPrice).reduce((s, c) => s + Number(c.totalPrice), 0);
    const byType: Record<string, number> = {};
    const byClient: Record<string, number> = {};
    contracts.forEach(c => {
      byType[c.type] = (byType[c.type] || 0) + 1;
      if (c.client) byClient[c.client.fullName] = (byClient[c.client.fullName] || 0) + Number(c.totalPrice ?? 0);
    });
    const waiting = contracts.filter(c => c.status === "SENT").slice(0, 20);
    return { total, draft, sent, signed, cancelled, signedValue, byType, byClient: Object.entries(byClient).sort((a, b) => b[1] - a[1]), waiting };
  } catch { return null; }
}

export async function getSmartInsights(month?: string) {
  const prisma = getPrisma();
  if (!prisma) return [];
  const { current: dr, prev } = monthRange(month);
  const monthLabelStr = monthLabel(month);
  const prevLabelStr = month ? monthLabel(`${Number(month.split("-")[0])}-${String(Number(month.split("-")[1]) - 1).padStart(2, "0")}`) : "previous month";
  try {
    const insights: string[] = [];
    const now = new Date();

    const [allClients, paymentAgg, expenseAgg, invoices, studioBookingsList, studioAgg, contracts] = await Promise.all([
      prisma.client.findMany({ select: { leadSource: true, pipelineStatus: true, lastContactDate: true, createdAt: true } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: Object.keys(dr).length ? { date: dr } : {} }),
      prisma.expense.aggregate({ _sum: { amount: true }, where: Object.keys(dr).length ? { date: dr } : {} }),
      prisma.invoice.findMany({ where: { paymentStatus: { not: "PAID" }, dueDate: { lt: now } }, select: { id: true } }),
      prisma.booking.findMany({ where: { type: "STUDIO", ...(Object.keys(dr).length ? { startTime: dr } : {}) }, select: { studioSetup: true, durationHours: true, status: true, startTime: true } }),
      prisma.booking.aggregate({ where: { type: "STUDIO", ...(Object.keys(dr).length ? { startTime: dr } : {}) }, _sum: { durationHours: true } }),
      prisma.contract.findMany({ where: { status: "SENT" }, select: { id: true } }),
    ]);

    const leadSourceCount: Record<string, number> = {};
    allClients.forEach(c => { if (c.leadSource) leadSourceCount[c.leadSource] = (leadSourceCount[c.leadSource] || 0) + 1; });
    const topSource = Object.entries(leadSourceCount).sort((a, b) => b[1] - a[1])[0];
    if (topSource) insights.push(`🔹 <strong>${topSource[0]}</strong> generated the most leads in ${monthLabelStr} with <strong>${topSource[1]}</strong> leads.`);

    const setupCount: Record<string, number> = {};
    studioBookingsList.forEach(b => { if (b.studioSetup) setupCount[b.studioSetup] = (setupCount[b.studioSetup] || 0) + 1; });
    const topSetup = Object.entries(setupCount).sort((a, b) => b[1] - a[1])[0];
    if (topSetup) insights.push(`🔹 <strong>${topSetup[0]}</strong> was the most booked setup in ${monthLabelStr} with <strong>${topSetup[1]}</strong> bookings.`);

    const overdueCount = invoices.length;
    if (overdueCount > 0) insights.push(`⚠️ There ${overdueCount === 1 ? "is" : "are"} <strong>${overdueCount}</strong> overdue payment${overdueCount === 1 ? "" : "s"}.`);

    const monthRevenue = Number(paymentAgg._sum?.amount ?? 0);
    const monthExpensesVal = Number(expenseAgg._sum?.amount ?? 0);
    if (monthRevenue > 0 || monthExpensesVal > 0) {
      insights.push(`📊 Net for ${monthLabelStr}: <strong>${(monthRevenue - monthExpensesVal).toLocaleString()} EGP</strong> (${monthRevenue.toLocaleString()} EGP revenue, ${monthExpensesVal.toLocaleString()} EGP expenses).`);
    }

    const totalStudioHours = Number(studioAgg._sum?.durationHours ?? 0);
    const daysInMonth = month ? new Date(Number(month.split("-")[0]), Number(month.split("-")[1]), 0).getDate() : 30;
    const utilizationRate = Math.min(100, Math.round((totalStudioHours / (6 * 8 * daysInMonth)) * 100));
    if (utilizationRate < 40) insights.push(`⚠️ Studio utilization was <strong>${utilizationRate}%</strong> in ${monthLabelStr}. Consider promoting studio bookings.`);

    const lost = allClients.filter(c => c.pipelineStatus === "Lost").length;
    if (lost > 0) insights.push(`🔹 <strong>${lost}</strong> lead${lost === 1 ? "" : "s"} ${lost === 1 ? "was" : "were"} marked as Lost.`);

    const won = allClients.filter(c => c.pipelineStatus === "Won").length;
    if (won > 0) insights.push(`🎉 <strong>${won}</strong> lead${won === 1 ? "" : "s"} converted to Won.`);

    const pendingContracts = contracts.length;
    if (pendingContracts > 0) insights.push(`📄 <strong>${pendingContracts}</strong> contract${pendingContracts === 1 ? "" : "s"} waiting for signature.`);

    const noContact = allClients.filter(c => !c.lastContactDate || (now.getTime() - c.lastContactDate.getTime()) > 14 * 86400000).length;
    if (noContact > 0) insights.push(`👤 <strong>${noContact}</strong> client${noContact === 1 ? "" : "s"} haven't been contacted in more than 14 days.`);

    const studioCount = studioBookingsList.length;
    if (studioCount === 0 && month) insights.push(`📭 No studio bookings in ${monthLabelStr}.`);
    if (monthRevenue === 0 && monthExpensesVal === 0 && month) insights.push(`📭 No accounting entries in ${monthLabelStr}.`);

    return insights;
  } catch { return []; }
}
