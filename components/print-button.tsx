export function PrintButton({ contractId }: { contractId: string }) {
  return (
    <a
      className="rounded-full bg-[#06111F] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white no-print"
      href={`/api/contracts/${contractId}/pdf`}
      target="_blank"
      rel="noopener noreferrer"
    >
      تصدير PDF
    </a>
  );
}
