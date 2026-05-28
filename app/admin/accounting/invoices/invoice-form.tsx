"use client";

import { useTransition, useState, useRef, useEffect, useCallback } from "react";
import { Field, inputClass } from "@/components/form-fields";
import { createInvoiceAction } from "@/lib/actions";
import { paymentMethods, paymentMethodArabic } from "@/lib/constants";

interface ItemRow {
  key: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

function calcItemTotal(qty: number, price: number, discount: number) {
  return Math.max(0, qty * price - discount);
}

let keyCounter = 0;
function newKey() { return `item_${++keyCounter}_${Date.now()}`; }

function defaultItem(): ItemRow {
  return { key: newKey(), description: "", quantity: 1, unitPrice: 0, discount: 0, total: 0 };
}

export function InvoiceForm({ clients, settings, invoice }: { clients: { id: string; fullName: string; companyName?: string | null }[]; settings: Record<string, string>; invoice?: any }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: string; error?: string; invoiceId?: string } | null>(null);
  const [items, setItems] = useState<ItemRow[]>([defaultItem()]);
  const [taxRate, setTaxRate] = useState(Number(settings.invoiceTaxRate) || 0);
  const msgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && msgRef.current) msgRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [result]);

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const itemsDiscount = items.reduce((s, i) => s + i.discount, 0);
  const taxAmount = (subtotal - itemsDiscount) * (taxRate / 100);
  const total = Math.max(0, subtotal - itemsDiscount + taxAmount);

  const updateItem = useCallback((key: string, field: keyof ItemRow, value: string) => {
    setItems((prev) => prev.map((item) => {
      if (item.key !== key) return item;
      const updated = { ...item, [field]: field === "description" ? value : Number(value) || 0 };
      updated.total = calcItemTotal(
        field === "quantity" ? Number(value) || 0 : updated.quantity,
        field === "unitPrice" ? Number(value) || 0 : updated.unitPrice,
        field === "discount" ? Number(value) || 0 : updated.discount
      );
      return updated;
    }));
  }, []);

  const addItem = () => setItems((prev) => [...prev, defaultItem()]);
  const removeItem = (key: string) => setItems((prev) => prev.filter((i) => i.key !== key));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("items", JSON.stringify(items.map(({ key: _k, ...rest }) => rest)));
    fd.set("subtotal", String(subtotal));
    fd.set("discount", String(itemsDiscount));
    fd.set("taxRate", String(taxRate));
    fd.set("taxAmount", String(taxAmount));
    fd.set("total", String(total));
    const paidAmount = Number(fd.get("paidAmount")) || 0;
    fd.set("paidAmount", String(paidAmount));
    fd.set("remainingAmount", String(Math.max(0, total - paidAmount)));
    setResult(null);
    startTransition(async () => {
      const res = await createInvoiceAction(fd);
      setResult(res);
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate dir="rtl">
      <div ref={msgRef} className="mb-4">
        {result?.error ? <p className="rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">{result.error}</p> : null}
        {result?.success ? (
          <div>
            <p className="rounded-2xl bg-green-50 p-3 text-sm font-bold text-green-700">{result.success}</p>
            {result.invoiceId ? <a className="mt-2 inline-block text-sm font-bold text-[#0B7CFF]" href={`/admin/accounting/invoices/${result.invoiceId}`}>عرض الفاتورة ←</a> : null}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Field label="العميل">
          <select className={inputClass} name="clientId" required>
            <option value="">اختر العميل</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.fullName}{c.companyName ? ` (${c.companyName})` : ""}</option>)}
          </select>
        </Field>
        <Field label="تاريخ الفاتورة"><input className={inputClass} name="invoiceDate" required type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></Field>
        <Field label="تاريخ الاستحقاق"><input className={inputClass} name="dueDate" type="date" /></Field>
        <Field label="العملة">
          <select className={inputClass} name="currency" defaultValue="EGP">
            <option value="EGP">EGP</option>
            <option value="USD">USD</option>
          </select>
        </Field>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-[0.14em] text-[#06111F]/40">بنود الفاتورة</h3>
          <button className="rounded-full bg-[#0B7CFF]/10 px-4 py-2 text-xs font-bold text-[#0B7CFF]" onClick={addItem} type="button">+ إضافة بند</button>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-[#06111F]/10">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-[#06111F]/10 text-xs font-black uppercase tracking-[0.1em] text-[#06111F]/40">
                <th className="p-3">الوصف</th><th className="p-3 w-20">الكمية</th><th className="p-3 w-28">سعر الوحدة</th><th className="p-3 w-24">الخصم</th><th className="p-3 w-28">الإجمالي</th><th className="p-3 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr className="border-b border-[#06111F]/5" key={item.key}>
                  <td className="p-2"><input className={`${inputClass} text-sm`} value={item.description} onChange={(e) => updateItem(item.key, "description", e.target.value)} placeholder="وصف الخدمة" required /></td>
                  <td className="p-2"><input className={`${inputClass} text-sm`} type="number" min="0.01" step="1" value={item.quantity} onChange={(e) => updateItem(item.key, "quantity", e.target.value)} required /></td>
                  <td className="p-2"><input className={`${inputClass} text-sm`} type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => updateItem(item.key, "unitPrice", e.target.value)} required /></td>
                  <td className="p-2"><input className={`${inputClass} text-sm`} type="number" min="0" step="0.01" value={item.discount} onChange={(e) => updateItem(item.key, "discount", e.target.value)} /></td>
                  <td className="p-2 text-sm font-bold">{item.total.toLocaleString()} EGP</td>
                  <td className="p-2">{items.length > 1 ? <button className="text-xs font-bold text-red-500 hover:text-red-700" onClick={() => removeItem(item.key)} type="button">حذف</button> : null}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Field label="الإجمالي قبل الخصم"><div className={`${inputClass} bg-[#F7F8FB] font-bold`}>{subtotal.toLocaleString()} EGP</div></Field>
        <Field label="الخصم"><div className={`${inputClass} bg-[#F7F8FB] font-bold`}>{itemsDiscount.toLocaleString()} EGP</div></Field>
        <Field label="الضريبة (%)">
          <input className={inputClass} type="number" min="0" max="100" step="0.01" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value) || 0)} />
        </Field>
        <Field label="الإجمالي النهائي"><div className={`${inputClass} bg-[#F7F8FB] font-black text-lg text-[#0B7CFF]`}>{total.toLocaleString()} EGP</div></Field>
        <Field label="المبلغ المدفوع"><input className={inputClass} name="paidAmount" type="number" min="0" step="0.01" defaultValue="0" /></Field>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label="ملاحظات"><textarea className={inputClass} name="notes" rows={3} placeholder="اختياري" /></Field>
        <Field label="الشروط"><textarea className={inputClass} name="terms" rows={3} placeholder="شروط الدفع" /></Field>
      </div>

      <div className="mt-6 flex gap-3">
        <button type="submit" disabled={isPending} className="rounded-full bg-[#0B7CFF] px-8 py-4 text-sm font-black uppercase tracking-[0.14em] text-white shadow-lg shadow-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50">
          {isPending ? "جاري الحفظ…" : "حفظ الفاتورة"}
        </button>
        <a className="rounded-full border border-[#06111F]/10 px-8 py-4 text-sm font-black uppercase tracking-[0.14em] text-[#06111F]" href="/admin/accounting/invoices">إلغاء</a>
      </div>
    </form>
  );
}
