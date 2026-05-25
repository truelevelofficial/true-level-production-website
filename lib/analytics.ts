import { getPrisma } from "./prisma";

function dateRange(range?: string, from?: string, to?: string) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  switch (range) {
    case "today": {
      const start = new Date(y, m, now.getDate());
      return { gte: start, lt: new Date(y, m, now.getDate() + 1) };
    }
    case "week": {
      const day = now.getDay();
      const start = new Date(y, m, now.getDate() - (day === 0 ? 6 : day - 1));
      return { gte: start, lt: new Date(y, m, now.getDate() + 1) };
    }
    case "month": return { gte: new Date(y, m, 1), lt: new Date(y, m + 1, 1) };
    case "lastMonth": return { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) };
    case "year": return { gte: new Date(y, 0, 1), lt: new Date(y + 1, 0, 1) };
    case "custom":
      if (from && to) return { gte: new Date(from), lt: new Date(new Date(to).getTime() + 86400000) };
      return {};
    default: return {};
  }
}

export async function getExecutiveOverview(range?: string, from?: string, to?: string) {
  const prisma = getPrisma();
  if (!prisma) return null;
  const dr = dateRange(range, from, to);
  try {
    const [totalClients, newClients, activeLeads, wonClients, lostClients, meetings, approvedMeetings, completedMeetings, cancelledMeetings, studioBookings, studioHours, paymentAgg, expenseAgg, pendingBalances, overdueInvoices, signedContracts, activeProjects, completedProjects] = await Promise.all([
      prisma.client.count(),
      prisma.client.count({ where: { createdAt: dr } }),
      prisma.client.count({ where: { pipelineStatus: { not: null }, NOT: { pipelineStatus: { in: ["Won", "Lost"] } } } }),
      prisma.client.count({ where: { pipelineStatus: "Won" } }),
      prisma.client.count({ where: { pipelineStatus: "Lost" } }),
      prisma.booking.count({ where: { type: { in: ["GOOGLE_MEETING", "COMPANY_MEETING"] }, ...(Object.keys(dr).length ? { createdAt: dr } : {}) } }),
      prisma.booking.count({ where: { type: { in: ["GOOGLE_MEETING", "COMPANY_MEETING"] }, status: "APPROVED" } }),
      prisma.booking.count({ where: { type: { in: ["GOOGLE_MEETING", "COMPANY_MEETING"] }, status: "COMPLETED" } }),
      prisma.booking.count({ where: { type: { in: ["GOOGLE_MEETING", "COMPANY_MEETING"] }, status: "CANCELLED" } }),
      prisma.booking.count({ where: { type: "STUDIO" } }),
      prisma.booking.aggregate({ where: { type: "STUDIO", durationHours: { not: null } }, _sum: { durationHours: true } }),
      prisma.payment.aggregate({ _sum: { amount: true } }),
      prisma.expense.aggregate({ _sum: { amount: true } }),
      prisma.booking.findMany({ where: { paymentStatus: { in: ["UNPAID", "PARTIALLY_PAID"] } }, select: { remainingAmount: true } }),
      prisma.invoice.findMany({ where: { status: { not: "PAID" }, dueDate: { lt: new Date() } }, select: { amount: true } }),
      prisma.contract.count({ where: { status: "SIGNED" } }),
      prisma.project.count({ where: { status: "ACTIVE" } }).catch(() => 0),
      prisma.project.count({ where: { status: "COMPLETED" } }).catch(() => 0),
    ]);
    const revenue = Number(paymentAgg._sum?.amount ?? 0);
    const totalExpenses = Number(expenseAgg._sum?.amount ?? 0);
    const pending = pendingBalances.reduce((s, i) => s + Number(i.remainingAmount ?? 0), 0);
    const overdue = overdueInvoices.reduce((s, i) => s + Number(i.amount), 0);
    return {
      totalClients, newClients, activeLeads, wonClients, lostClients,
      meetings, approvedMeetings, completedMeetings, cancelledMeetings,
      studioBookings, studioHours: Number(studioHours._sum?.durationHours ?? 0),
      revenue, expenses: totalExpenses, profit: revenue - totalExpenses,
      pendingPayments: pending, overduePayments: overdue,
      signedContracts, activeProjects, completedProjects,
    };
  } catch { return null; }
}

export async function getClientAnalytics(range?: string, from?: string, to?: string) {
  const prisma = getPrisma();
  if (!prisma) return null;
  const dr = dateRange(range, from, to);
  try {
    const [clients, payments, meetings] = await Promise.all([
      prisma.client.findMany({ include: { payments: { select: { amount: true, status: true }, ...(Object.keys(dr).length ? { where: { date: dr } } : {}) }, bookings: { select: { id: true, type: true, createdAt: true } } } }),
      prisma.payment.findMany({ include: { client: true }, ...(Object.keys(dr).length ? { where: { date: dr } } : {}) }),
      prisma.booking.findMany({ where: { type: { in: ["GOOGLE_MEETING", "COMPANY_MEETING"] }, ...(Object.keys(dr).length ? { createdAt: dr } : {}) }, include: { client: true } }),
    ]);
    const monthlyLeads = Array.from({ length: 12 }, (_, i) => {
      const month = new Date();
      month.setMonth(month.getMonth() - i);
      const start = new Date(month.getFullYear(), month.getMonth(), 1);
      const end = new Date(month.getFullYear(), month.getMonth() + 1, 1);
      return { month: start.toISOString().slice(0, 7), count: clients.filter(c => c.createdAt >= start && c.createdAt < end).length };
    }).reverse();
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
    return { totalClients: total, monthlyLeads, byType, bySource, pipeline, won, lost, conversionRate, avgValue, topRevenue, topBookings, needsFollowUp, pendingPayments };
  } catch { return null; }
}

export async function getPipelineAnalytics() {
  const prisma = getPrisma();
  if (!prisma) return null;
  try {
    const stages = ["New Lead", "Contacted", "Meeting Scheduled", "Proposal Sent", "Negotiation", "Won", "Lost"] as const;
    const counts = await Promise.all(stages.map(async (stage) => {
      const count = await prisma.client.count({ where: { pipelineStatus: stage } });
      return { stage, count };
    }));
    const withRevenue = await Promise.all(counts.map(async (c) => {
      const payments = c.stage === "Won" ? await prisma.payment.aggregate({ _sum: { amount: true }, where: { client: { pipelineStatus: "Won" } } }) : { _sum: { amount: null } };
      return { ...c, revenue: Number(payments._sum?.amount ?? 0) };
    }));
    return withRevenue;
  } catch { return null; }
}

export async function getMeetingsAnalytics(range?: string, from?: string, to?: string) {
  const prisma = getPrisma();
  if (!prisma) return null;
  const dr = dateRange(range, from, to);
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

export async function getStudioAnalytics(range?: string, from?: string, to?: string) {
  const prisma = getPrisma();
  if (!prisma) return null;
  const dr = dateRange(range, from, to);
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
    const setupDuration: Record<string, number> = {};
    bookings.forEach(b => {
      const setup = b.studioSetup || "Unspecified";
      setupCount[setup] = (setupCount[setup] || 0) + 1;
      setupRevenue[setup] = (setupRevenue[setup] || 0) + Number(b.price ?? 0);
      setupDuration[setup] = (setupDuration[setup] || 0) + (b.durationHours ?? 0);
    });
    const bestSetup = Object.entries(setupCount).sort((a, b) => b[1] - a[1]);
    const topClients = [...bookings.filter(b => b.client).reduce((map, b) => { const name = b.client.fullName; const existing = map.get(name) || { name, bookings: 0, revenue: 0 }; existing.bookings++; existing.revenue += Number(b.price ?? 0); map.set(name, existing); return map; }, new Map()).values()].sort((a, b) => b.revenue - a.revenue).slice(0, 10);
    return { total, approved, completed, cancelled, totalHours, revenue, avgValue, avgDuration, setupCount, setupRevenue, bestSetup, topClients, upcoming: bookings.filter(b => b.status === "APPROVED" && b.startTime > new Date()) };
  } catch { return null; }
}

export async function getAccountingAnalytics(range?: string, from?: string, to?: string) {
  const prisma = getPrisma();
  if (!prisma) return null;
  const dr = dateRange(range, from, to);
  try {
    const [payments, expenses, bookings] = await Promise.all([
      prisma.payment.findMany({ include: { client: true }, ...(Object.keys(dr).length ? { where: { date: dr } } : {}) }),
      prisma.expense.findMany({ include: { client: true }, ...(Object.keys(dr).length ? { where: { date: dr } } : {}) }),
      prisma.booking.findMany({ where: { paymentStatus: { in: ["UNPAID", "PARTIALLY_PAID"] } }, select: { remainingAmount: true, client: { select: { fullName: true } } } }),
    ]);
    const revenue = payments.reduce((s, p) => s + Number(p.amount), 0);
    const cost = expenses.reduce((s, p) => s + Number(p.amount), 0);
    const profit = revenue - cost;
    const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;
    const byCategory: Record<string, number> = {};
    expenses.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount); });
    const byClient: Record<string, number> = {};
    payments.forEach(p => { if (p.client) byClient[p.client.fullName] = (byClient[p.client.fullName] || 0) + Number(p.amount); });
    const byMethod: Record<string, number> = {};
    payments.forEach(p => { byMethod[p.method] = (byMethod[p.method] || 0) + Number(p.amount); });
    const pending = bookings.filter(b => b.remainingAmount && Number(b.remainingAmount) > 0).map(b => ({ client: b.client?.fullName || "Unknown", amount: Number(b.remainingAmount) }));
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(); month.setMonth(month.getMonth() - i);
      const start = new Date(month.getFullYear(), month.getMonth(), 1);
      const end = new Date(month.getFullYear(), month.getMonth() + 1, 1);
      const mRevenue = payments.filter(p => p.date >= start && p.date < end).reduce((s, p) => s + Number(p.amount), 0);
      const mCost = expenses.filter(e => e.date >= start && e.date < end).reduce((s, e) => s + Number(e.amount), 0);
      return { month: start.toISOString().slice(0, 7), revenue: mRevenue, expenses: mCost, profit: mRevenue - mCost };
    }).reverse();
    return { revenue, expenses: cost, profit, margin, byCategory, byClient: Object.entries(byClient).sort((a, b) => b[1] - a[1]).slice(0, 10), byMethod: Object.entries(byMethod).sort((a, b) => b[1] - a[1]), pending, monthlyData };
  } catch { return null; }
}

export async function getContractsAnalytics() {
  const prisma = getPrisma();
  if (!prisma) return null;
  try {
    const contracts = await prisma.contract.findMany({ include: { client: true } });
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

export async function getSmartInsights() {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    const insights: string[] = [];
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [allClients, paymentAgg, expenseAgg, invoices, studioBookingsMetrics, studioBookingsCount, contracts] = await Promise.all([
      prisma.client.findMany({ select: { leadSource: true, pipelineStatus: true, lastContactDate: true, createdAt: true } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { date: { gte: monthStart } } }),
      prisma.expense.aggregate({ _sum: { amount: true }, where: { date: { gte: monthStart } } }),
      prisma.invoice.findMany({ where: { status: { not: "PAID" }, dueDate: { lt: now } }, select: { id: true } }),
      prisma.booking.findMany({ where: { type: "STUDIO", startTime: { gte: monthStart } }, select: { studioSetup: true, durationHours: true, status: true } }),
      prisma.booking.aggregate({ where: { type: "STUDIO" }, _sum: { durationHours: true } }),
      prisma.contract.findMany({ where: { status: "SENT" }, select: { id: true } }),
    ]);

    const leadSourceCount: Record<string, number> = {};
    allClients.forEach(c => { if (c.leadSource) leadSourceCount[c.leadSource] = (leadSourceCount[c.leadSource] || 0) + 1; });
    const topSource = Object.entries(leadSourceCount).sort((a, b) => b[1] - a[1])[0];
    if (topSource) insights.push(`🔹 <strong>${topSource[0]}</strong> generated the most leads this month with <strong>${topSource[1]}</strong> leads.`);

    const setupCount: Record<string, number> = {};
    studioBookingsMetrics.forEach(b => { if (b.studioSetup) setupCount[b.studioSetup] = (setupCount[b.studioSetup] || 0) + 1; });
    const topSetup = Object.entries(setupCount).sort((a, b) => b[1] - a[1])[0];
    if (topSetup) insights.push(`🔹 <strong>${topSetup[0]}</strong> is the most booked setup this month with <strong>${topSetup[1]}</strong> bookings.`);

    const overdueCount = invoices.length;
    if (overdueCount > 0) insights.push(`⚠️ There ${overdueCount === 1 ? "is" : "are"} <strong>${overdueCount}</strong> overdue payment${overdueCount === 1 ? "" : "s"}.`);

    const lost = allClients.filter(c => c.pipelineStatus === "Lost").length;
    if (lost > 0) insights.push(`🔹 <strong>${lost}</strong> lead${lost === 1 ? "" : "s"} ${lost === 1 ? "was" : "were"} marked as Lost.`);

    const won = allClients.filter(c => c.pipelineStatus === "Won").length;
    if (won > 0) insights.push(`🎉 <strong>${won}</strong> lead${won === 1 ? "" : "s"} converted to Won.`);

    const monthRevenue = Number(paymentAgg._sum?.amount ?? 0);
    const monthExpensesVal = Number(expenseAgg._sum?.amount ?? 0);
    if (monthRevenue > 0 || monthExpensesVal > 0) {
      insights.push(`📊 Month net: <strong>${monthRevenue - monthExpensesVal} EGP</strong> (${monthRevenue} EGP revenue, ${monthExpensesVal} EGP expenses).`);
    }

    const totalStudioHours = Number(studioBookingsCount._sum?.durationHours ?? 0);
    const utilizationRate = Math.min(100, Math.round((totalStudioHours / (6 * 8 * 30)) * 100));
    if (utilizationRate < 40) insights.push(`⚠️ Studio utilization is <strong>${utilizationRate}%</strong> this month. Consider promoting studio bookings.`);

    const pendingContracts = contracts.length;
    if (pendingContracts > 0) insights.push(`📄 <strong>${pendingContracts}</strong> contract${pendingContracts === 1 ? "" : "s"} waiting for signature.`);

    const noContact = allClients.filter(c => !c.lastContactDate || (now.getTime() - c.lastContactDate.getTime()) > 14 * 86400000).length;
    if (noContact > 0) insights.push(`👤 <strong>${noContact}</strong> client${noContact === 1 ? "" : "s"} haven't been contacted in more than 14 days.`);

    return insights;
  } catch { return []; }
}
