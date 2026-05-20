import { AdminShell, Card, SetupNotice } from "@/components/admin-shell";
import { Field, inputClass } from "@/components/form-fields";
import { createExpenseAction, createPaymentAction } from "@/lib/actions";
import { expenseCategories, paymentMethods, paymentStatuses } from "@/lib/constants";
import { getAccounting, hasDatabase } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";

export default async function AccountingPage() {
  await requireAdmin();
  const data = await getAccounting();
  return (
    <AdminShell title="Accounting">
      {!hasDatabase() ? <SetupNotice /> : null}
      <p className="mb-6 rounded-2xl bg-white p-4 text-sm font-bold text-[#06111F]/55">Internal tracking only. This dashboard does not replace certified accounting, tax filing, or official legal financial records.</p>
      {data ? <div className="mb-6 grid gap-4 md:grid-cols-4"><Card title="Total Revenue" value={`${data.revenue} EGP`} /><Card title="Total Expenses" value={`${data.totalExpenses} EGP`} /><Card title="Net Profit" value={`${data.profit} EGP`} /><Card title="Pending Balances" value={`${data.pending} EGP`} /></div> : null}
      <a className="mb-4 inline-flex rounded-full border border-[#06111F]/10 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#06111F]" href="/admin/export/accounting">Export Accounting CSV</a>
      <div className="grid gap-6 lg:grid-cols-2">
        <form action={createPaymentAction} className="grid gap-4 rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
          <h2 className="text-3xl font-black uppercase tracking-[-0.05em]">Add Income</h2>
          <Field label="Amount"><input className={inputClass} name="amount" required type="number" /></Field>
          <Field label="Method"><select className={inputClass} name="method">{paymentMethods.map((item) => <option key={item}>{item}</option>)}</select></Field>
          <Field label="Status"><select className={inputClass} name="status">{paymentStatuses.map((item) => <option key={item}>{item}</option>)}</select></Field>
          <Field label="Client"><select className={inputClass} name="clientId"><option value="">None</option>{data?.clients.map((client) => <option key={client.id} value={client.id}>{client.fullName}</option>)}</select></Field>
          <Field label="Booking"><select className={inputClass} name="bookingId"><option value="">None</option>{data?.bookings.map((booking) => <option key={booking.id} value={booking.id}>{booking.client.fullName} - {booking.type}</option>)}</select></Field>
          <Field label="Date"><input className={inputClass} name="date" required type="date" /></Field>
          <Field label="Description"><textarea className={inputClass} name="description" /></Field>
          <button className="rounded-full bg-[#0B7CFF] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white">Save Income</button>
        </form>
        <form action={createExpenseAction} className="grid gap-4 rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
          <h2 className="text-3xl font-black uppercase tracking-[-0.05em]">Add Expense</h2>
          <Field label="Amount"><input className={inputClass} name="amount" required type="number" /></Field>
          <Field label="Category"><select className={inputClass} name="category">{expenseCategories.map((item) => <option key={item}>{item}</option>)}</select></Field>
          <Field label="Method"><select className={inputClass} name="method">{paymentMethods.map((item) => <option key={item}>{item}</option>)}</select></Field>
          <Field label="Client"><select className={inputClass} name="clientId"><option value="">None</option>{data?.clients.map((client) => <option key={client.id} value={client.id}>{client.fullName}</option>)}</select></Field>
          <Field label="Date"><input className={inputClass} name="date" required type="date" /></Field>
          <Field label="Description"><textarea className={inputClass} name="description" required /></Field>
          <button className="rounded-full bg-[#06111F] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white">Save Expense</button>
        </form>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6"><h2 className="text-2xl font-black uppercase">Recent Income</h2>{data?.payments.map((item) => <p className="mt-3 text-sm text-[#06111F]/60" key={item.id}>{String(item.amount)} EGP - {item.method} - {item.client?.fullName || "No client"}</p>)}</section>
        <section className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6"><h2 className="text-2xl font-black uppercase">Recent Expenses</h2>{data?.expenses.map((item) => <p className="mt-3 text-sm text-[#06111F]/60" key={item.id}>{String(item.amount)} EGP - {item.category} - {item.description}</p>)}</section>
      </div>
    </AdminShell>
  );
}
