import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAccounting } from "@/lib/admin-data";
import { toCsv } from "@/lib/csv";

export async function GET() {
  if (!(await isAdminAuthenticated())) return new NextResponse("Unauthorized", { status: 401 });
  const data = await getAccounting();
  
  // Convert to Arabic headers for better Sheets compatibility
  const rows = [
    ...(data?.payments.map((item) => ({
      "النوع": "إيراد",
      "المبلغ": item.amount,
      "طريقة الدفع": item.method,
      "العميل": item.client?.fullName || "",
      "التاريخ": item.date.toISOString().slice(0, 10),
      "الوصف": item.description
    })) ?? []),
    ...(data?.expenses.map((item) => ({
      "النوع": "مصروف",
      "المبلغ": item.amount,
      "التصنيف": item.category,
      "العميل": item.client?.fullName || "",
      "التاريخ": item.date.toISOString().slice(0, 10),
      "الوصف": item.description
    })) ?? []),
  ];
  
  return new NextResponse(toCsv(rows), { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": "attachment; filename=الحسابات.csv" } });
}
