import { getPrisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ContractPreview } from "@/components/contract-preview";

export default async function PrintContractPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const prisma = getPrisma();
  if (!prisma) return <p className="p-10 text-center">Database not configured.</p>;

  const contract = await prisma.contract.findUnique({
    where: { id },
    include: { client: true },
  });

  if (!contract) notFound();

  return (
    <html>
      <head>
        <title>{contract.title}</title>
        <style>{`
          @page { margin: 14mm 18mm 20mm 18mm; size: A4; }
          body { margin: 0; padding: 20px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          * { font-family: var(--font-cairo), 'Traditional Arabic', 'Noto Naskh Arabic', Tahoma, sans-serif; }
          .no-print { display: none !important; }
          .contract-document { max-width: 210mm; margin: 0 auto; background: #fff; padding: 44px 52px; box-shadow: none !important; border: none !important; }
          .contract-page { background: #fff; }
          .contract-section { page-break-inside: avoid; }
          .contract-signatures { page-break-inside: avoid; break-inside: avoid; }
          .contract-header { page-break-after: avoid; }
          .contract-title-area { page-break-after: avoid; }
        `}</style>
      </head>
      <body>
        <ContractPreview
          body={contract.body}
          clientName={contract.client?.fullName || ""}
          clientCompanyName={contract.client?.companyName}
          title={contract.title}
          totalPrice={contract.totalPrice ? Number(contract.totalPrice).toLocaleString("ar-EG") : null}
          contractNumber={id.slice(0, 8).toUpperCase()}
          createdAt={contract.createdAt.toISOString()}
        />
        <script dangerouslySetInnerHTML={{ __html: `
          window.onload = function() { window.print(); };
          window.onafterprint = function() { window.close(); };
        ` }} />
      </body>
    </html>
  );
}