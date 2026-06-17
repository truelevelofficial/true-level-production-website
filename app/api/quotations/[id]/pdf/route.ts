import { NextRequest, NextResponse } from "next/server";
import { getQuotationById } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { generateQuotationPdf } from "@/lib/pdf-quotation";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const quotation = await getQuotationById(id);
    if (!quotation) {
      return new NextResponse("Quotation not found", { status: 404 });
    }

    const pdfBytes = await generateQuotationPdf(quotation);
    const filename = `Quotation-${quotation.quotationNo || id}.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdfBytes.length),
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return new NextResponse("Failed to generate PDF", { status: 500 });
  }
}
