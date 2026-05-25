"use client";

export function PrintButton() {
  return <button className="rounded-full bg-[#06111F] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white no-print" onClick={() => window.print()} type="button">تصدير PDF</button>;
}
