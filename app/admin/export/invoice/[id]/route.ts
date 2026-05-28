import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { getCompanySettings } from "@/lib/admin-data";
import { generateInvoiceDocx } from "@/lib/invoice-pdf/generate";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return new NextResponse("Unauthorized", { status: 401 });
  const { id } = await params;
  const prisma = getPrisma();
  if (!prisma) return new NextResponse("Database not configured", { status: 500 });
  const invoice = await prisma.invoice.findUnique({ where: { id }, include: { client: true, items: true } });
  if (!invoice) return new NextResponse("Not found", { status: 404 });
  const settings = await getCompanySettings();
  const buffer = await generateInvoiceDocx(invoice, settings);
  return new NextResponse(buffer, {
    headers: {
      "content-type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "content-disposition": `attachment; filename="invoice-${invoice.invoiceNo}.docx"`,
    },
  });
}
