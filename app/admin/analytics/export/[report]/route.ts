import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getClientAnalytics, getMeetingsAnalytics, getStudioAnalytics, getAccountingAnalytics } from "@/lib/analytics";
import { toCsv } from "@/lib/csv";
import { expenseCategoryArabic, paymentMethodArabic } from "@/lib/constants";

export async function GET(request: NextRequest, { params }: { params: Promise<{ report: string }> }) {
  if (!(await isAdminAuthenticated())) return new NextResponse("Unauthorized", { status: 401 });
  const { report } = await params;
  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || undefined;
  const from = searchParams.get("from") || undefined;
  const to = searchParams.get("to") || undefined;

  let rows: Record<string, unknown>[] = [];

  switch (report) {
    case "clients": {
      const data = await getClientAnalytics(range, from, to);
      if (data) {
        rows = data.topRevenue.map((c) => ({ "Client": c.name, "Revenue": c.revenue, "Bookings": data.topBookings.find(b => b.name === c.name)?.count || 0 }));
      }
      break;
    }
    case "meetings": {
      const data = await getMeetingsAnalytics(range, from, to);
      if (data) {
        rows = data.upcoming.map((m) => ({ "Client": m.client.fullName, "Type": m.meetingType || m.type, "Date": m.startTime.toISOString().slice(0, 10), "Status": m.status }));
      }
      break;
    }
    case "studio": {
      const data = await getStudioAnalytics(range, from, to);
      if (data) {
        data.topClients.forEach((c: Record<string, unknown>) => rows.push({ "Client": String(c.name), "Bookings": String(c.bookings), "Revenue": Number(c.revenue).toLocaleString() }));
      }
      break;
    }
    case "accounting": {
      const data = await getAccountingAnalytics(range, from, to);
      if (data) {
        rows = data.monthlyData.map((m) => ({ "Month": m.month, "Revenue": m.revenue, "Expenses": m.expenses, "Profit": m.profit }));
      }
      break;
    }
    default:
      return new NextResponse("Unknown report", { status: 404 });
  }

  const csv = toCsv(rows);
  return new NextResponse(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename=${report}-report.csv` } });
}
