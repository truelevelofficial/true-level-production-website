import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { generateContractDocx } from "@/lib/export-docx";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return new NextResponse("Unauthorized", { status: 401 });
  const { id } = await params;
  const prisma = getPrisma();
  if (!prisma) return new NextResponse("Database not configured", { status: 500 });
  const contract = await prisma.contract.findUnique({ where: { id } });
  if (!contract) return new NextResponse("Not found", { status: 404 });
  const buffer = await generateContractDocx(contract.title, contract.body);
  return new NextResponse(buffer, { headers: { "content-type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "content-disposition": `attachment; filename="contract-${id}.docx"` } });
}
