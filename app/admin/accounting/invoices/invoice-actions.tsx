"use client";

import { useTransition, useState } from "react";
import { updateInvoiceStatusAction, deleteInvoiceAction } from "@/lib/actions";

export function InvoiceActions({ invoiceId, status }: { invoiceId: string; status: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ success?: string; error?: string } | null>(null);

  const doAction = (action: string) => {
    const fd = new FormData();
    fd.set("invoiceId", invoiceId);
    if (action === "markSent") {
      fd.set("status", "SENT");
      startTransition(async () => { setMsg(await updateInvoiceStatusAction(fd)); });
    } else if (action === "markCancelled") {
      fd.set("status", "CANCELLED");
      startTransition(async () => { setMsg(await updateInvoiceStatusAction(fd)); });
    } else if (action === "delete") {
      if (!confirm("هل أنت متأكد من حذف هذه الفاتورة؟ لا يمكن التراجع عن هذا الإجراء.")) return;
      fd.set("invoiceId", invoiceId);
      startTransition(async () => { setMsg(await deleteInvoiceAction(fd)); });
    }
  };

  return (
    <div className="relative">
      <button className="rounded-full bg-[#0B7CFF]/10 px-3 py-1 text-xs font-black uppercase tracking-[0.1em] text-[#0B7CFF]" onClick={() => setOpen(!open)} type="button">
        {isPending ? "جاري…" : "إجراءات"}
      </button>
      {msg?.success ? <p className="mt-1 text-xs font-bold text-green-600">{msg.success}</p> : null}
      {msg?.error ? <p className="mt-1 text-xs font-bold text-red-600">{msg.error}</p> : null}
      {open ? (
        <div className="absolute left-0 top-full z-10 mt-2 w-48 rounded-2xl border border-[#06111F]/10 bg-white p-3 shadow-xl">
          <div className="flex flex-col gap-2">
            <a className="rounded-full bg-[#06111F]/5 px-4 py-2 text-center text-xs font-bold text-[#06111F] hover:bg-[#0B7CFF]/10" href={`/admin/accounting/invoices/${invoiceId}`}>عرض / تعديل</a>
            {status === "DRAFT" ? <button className="rounded-full bg-blue-500 px-4 py-2 text-xs font-bold text-white hover:bg-blue-600" onClick={() => doAction("markSent")} type="button">تعيين كمرسلة</button> : null}
            {status !== "CANCELLED" ? <button className="rounded-full bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600" onClick={() => doAction("markCancelled")} type="button">إلغاء</button> : null}
            <button className="rounded-full bg-red-100 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-200" onClick={() => doAction("delete")} type="button">حذف</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
