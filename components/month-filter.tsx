"use client";

import { useRouter } from "next/navigation";

export function MonthFilter({ months, current, baseUrl }: { months: string[]; current?: string; baseUrl: string }) {
  const router = useRouter();
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const active = current || (months.includes(currentMonth) ? currentMonth : months[0] || currentMonth);

  function handleChange(val: string) {
    const params = new URLSearchParams(window.location.search);
    if (val === "all") params.delete("month");
    else params.set("month", val);
    params.delete("tab");
    router.push(`${baseUrl}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-black uppercase tracking-[0.14em] text-[#06111F]/40">Month</label>
      <select
        className="rounded-full border border-[#06111F]/10 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.1em]"
        defaultValue={active}
        onChange={(e) => handleChange(e.target.value)}
      >
        <option value="all">All Time</option>
        {months.map((m) => <option key={m} value={m}>{new Date(Number(m.split("-")[0]), Number(m.split("-")[1]) - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</option>)}
        {!months.includes(currentMonth) ? <option value={currentMonth}>{new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })} (no data)</option> : null}
      </select>
    </div>
  );
}
