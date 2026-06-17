"use client";

import { useTransition, useRef, useState } from "react";
import { deleteQuotationAction, updateQuotationStatusAction } from "@/lib/actions";

export function QuotationActions({ quotation }: { quotation: { id: string; status: string; quotationNo: string | null } }) {
  const [isPending, startTransition] = useTransition();
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [statusResult, setStatusResult] = useState<{ success?: string; error?: string } | null>(null);

  const doAction = (action: string, extra?: Record<string, string>) => {
    setStatusResult(null);
    const fd = new FormData();
    fd.set("quotationId", quotation.id);
    if (action === "delete") {
      if (!confirm("هل أنت متأكد من حذف عرض السعر؟")) return;
      startTransition(async () => {
        const res = await deleteQuotationAction(fd);
        setStatusResult(res);
      });
    } else {
      fd.set("status", action);
      if (extra) Object.entries(extra).forEach(([k, v]) => fd.set(k, v));
      startTransition(async () => {
        const res = await updateQuotationStatusAction(fd);
        setStatusResult(res);
        detailsRef.current?.removeAttribute("open");
      });
    }
  };

  return (
    <div className="relative">
      {statusResult?.success ? <p className="mb-2 rounded-xl bg-green-50 p-2 text-xs font-bold text-green-700">{statusResult.success}</p> : null}
      {statusResult?.error ? <p className="mb-2 rounded-xl bg-red-50 p-2 text-xs font-bold text-red-700">{statusResult.error}</p> : null}
      <details ref={detailsRef} className="relative">
        <summary className="cursor-pointer rounded-full border border-[#06111F]/10 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.1em]">إجراءات</summary>
        <div className="absolute left-0 top-full z-10 mt-1 w-44 overflow-hidden rounded-xl border border-[#06111F]/10 bg-white shadow-xl" dir="rtl">
          <a className="block px-4 py-2 text-xs font-bold text-[#06111F] transition hover:bg-blue-50 hover:text-[#0B7CFF]" href={`/admin/quotations/${quotation.id}`}>عرض / تعديل</a>
          <a className="block px-4 py-2 text-xs font-bold text-[#0B7CFF] transition hover:bg-blue-50" href={`/api/quotations/${quotation.id}/pdf`} target="_blank">Download PDF</a>
          {quotation.status === "DRAFT" ? <button className="block w-full px-4 py-2 text-left text-xs font-bold text-blue-600 transition hover:bg-blue-50" disabled={isPending} onClick={() => doAction("SENT")} type="button">تحديد كـ "مرسلة"</button> : null}
          {quotation.status === "SENT" ? <><button className="block w-full px-4 py-2 text-left text-xs font-bold text-green-600 transition hover:bg-green-50" disabled={isPending} onClick={() => doAction("ACCEPTED")} type="button">تحديد كـ "تم القبول"</button><button className="block w-full px-4 py-2 text-left text-xs font-bold text-red-600 transition hover:bg-red-50" disabled={isPending} onClick={() => doAction("REJECTED")} type="button">تحديد كـ "تم الرفض"</button></> : null}
          <button className="block w-full px-4 py-2 text-left text-xs font-bold text-red-700 transition hover:bg-red-50" disabled={isPending} onClick={() => doAction("delete")} type="button">حذف</button>
        </div>
      </details>
    </div>
  );
}
