import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { generateContractPdf } from "@/lib/pdf-contract";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const prisma = getPrisma();
    if (!prisma) {
      return new NextResponse("Database not configured", { status: 500 });
    }

    const contract = await prisma.contract.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!contract) {
      return new NextResponse("Contract not found", { status: 404 });
    }

    const pdfBytes = await generateContractPdf({
      title: contract.title,
      body: contract.body,
      clientName: contract.client?.fullName || "",
      clientCompanyName: contract.client?.companyName || null,
      contractNumber: id.slice(0, 8).toUpperCase(),
      createdAt: contract.createdAt.toISOString(),
    });

    const filename = `Contract-${id.slice(0, 8)}.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdfBytes.length),
      },
    });
  } catch (error) {
    console.error("CONTRACT PDF GENERATION ERROR", error);
    return new NextResponse(
      JSON.stringify({
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : null,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
