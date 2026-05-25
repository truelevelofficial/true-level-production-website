import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getClientAnalytics, getMeetingsAnalytics, getStudioAnalytics, getAccountingAnalytics, monthLabel } from "@/lib/analytics";
import { toCsv } from "@/lib/csv";

export async function GET(request: NextRequest, { params }: { params: Promise<{ report: string }> }) {
  if (!(await isAdminAuthenticated())) return new NextResponse("Unauthorized", { status: 401 });
  const { report } = await params;
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month") || undefined;
  const label = month ? monthLabel(month).toLowerCase().replace(/\s+/g, "-") : "all-time";

  let rows: Record<string, unknown>[] = [];

  switch (report) {
    case "clients": {
      const data = await getClientAnalytics(month);
      if (data) rows = data.topRevenue.map((c) => ({ "Client": c.name, "Revenue": c.revenue }));
      break;
    }
    case "meetings": {
      const data = await getMeetingsAnalytics(month);
      if (data) rows = data.upcoming.map((m) => ({ "Client": m.client.fullName, "Type": m.meetingType || m.type, "Date": m.startTime.toISOString().slice(0, 10), "Status": m.status }));
      break;
    }
    case "studio": {
      const data = await getStudioAnalytics(month);
      if (data) Object.entries(data.setupCount).forEach(([k, v]) => rows.push({ "Setup": k, "Bookings": v, "Revenue": Math.round(data.setupRevenue[k] || 0) }));
      break;
    }
    case "accounting": {
      const data = await getAccountingAnalytics(month);
      if (data) rows = data.byClient.map(([name, amount]) => ({ "Client": name, "Revenue": amount }));
      break;
    }
    default:
      return new NextResponse("Unknown report", { status: 404 });
  }

  const csv = toCsv(rows);
  return new NextResponse(csv, {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename=${report}-report-${label}.csv` },
  });
}
