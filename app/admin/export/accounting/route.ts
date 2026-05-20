import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAccounting } from "@/lib/admin-data";
import { toCsv } from "@/lib/csv";

export async function GET() {
  if (!(await isAdminAuthenticated())) return new NextResponse("Unauthorized", { status: 401 });
  const data = await getAccounting();
  const rows = [
    ...(data?.payments.map((item) => ({ kind: "income", amount: item.amount, category: item.method, client: item.client?.fullName, date: item.date.toISOString(), description: item.description })) ?? []),
    ...(data?.expenses.map((item) => ({ kind: "expense", amount: item.amount, category: item.category, client: item.client?.fullName, date: item.date.toISOString(), description: item.description })) ?? []),
  ];
  return new NextResponse(toCsv(rows), { headers: { "content-type": "text/csv", "content-disposition": "attachment; filename=accounting.csv" } });
}
