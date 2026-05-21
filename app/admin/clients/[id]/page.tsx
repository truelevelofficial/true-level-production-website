import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell, Card, SetupNotice } from "@/components/admin-shell";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { Field, inputClass } from "@/components/form-fields";
import { getClientById, hasDatabase } from "@/lib/admin-data";
import { createExpenseAction } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";
import { displayDate } from "@/lib/dates";
import { expenseCategories, paymentMethods, expenseCategoryArabic, paymentMethodArabic } from "@/lib/constants";

export default async function ClientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const client = await getClientById(id);
  if (!client) notFound();

  const meetings = client.bookings.filter((booking) => booking.type === "GOOGLE_MEETING" || booking.type === "COMPANY_MEETING");
  const studioBookings = client.bookings.filter((booking) => booking.type === "STUDIO");
  const revenue = client.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const expenses = client.expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  return (
    <AdminShell title="Client Profile">
      {!hasDatabase() ? <SetupNotice /> : null}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0B7CFF]">Client profile</p>
          <h1 className="mt-1 text-4xl font-black uppercase tracking-[-0.06em]">{client.fullName}</h1>
          <p className="mt-2 text-sm font-bold text-[#06111F]/55">{client.companyName || "No company"}</p>
        </div>
        <Link className="rounded-full border border-[#06111F]/10 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#06111F]" href="/admin/clients">Back to clients</Link>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card title="Pipeline" value={client.pipelineStatus || "New Lead"} />
        <Card title="Bookings" value={String(client.bookings.length)} />
        <Card title="Revenue" value={`${revenue} EGP`} />
        <Card title="Contracts" value={String(client.contracts.length)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black uppercase tracking-[-0.05em]">Client Information</h2>
          <div className="mt-5 grid gap-3 text-sm font-bold text-[#06111F]/65">
            <p>Email: {client.email}</p>
            <p>Phone: {client.phone}</p>
            <p>WhatsApp: {client.whatsapp || "-"}</p>
            <p>Address: {client.address || "-"}</p>
            <p>Tax number: {client.taxId || "-"}</p>
            <p>Commercial registration: {client.commercialRegistrationNumber || "-"}</p>
            <p>Client type: {client.clientType || "-"}</p>
            <p>Lead source: {client.leadSource || "-"}</p>
            <p>Assigned team member: {client.assignedTeamMember || "-"}</p>
            <p>Created: {displayDate(client.createdAt)}</p>
          </div>
          {client.notes ? <div className="mt-5 rounded-2xl bg-[#F7F8FB] p-4 text-sm leading-7 text-[#06111F]/65"><p className="font-black text-[#06111F]">Notes</p>{client.notes}</div> : null}
        </section>

        <section className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black uppercase tracking-[-0.05em]">Activity Summary</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Card title="Meetings" value={String(meetings.length)} />
            <Card title="Studio bookings" value={String(studioBookings.length)} />
            <Card title="Payments" value={String(client.payments.length)} />
            <Card title="Expenses" value={`${expenses} EGP`} />
          </div>
        </section>
      </div>

       <div className="mb-6 grid gap-6 lg:grid-cols-2">
         <History title="Meetings" rows={meetings.map((booking) => `${booking.meetingType || booking.type} / ${booking.status} / ${displayDate(booking.startTime)}`)} />
         <History title="Bookings" rows={studioBookings.map((booking) => `${booking.studioSetup || booking.type} / ${booking.status} / ${displayDate(booking.startTime)}`)} />
         <History title="Payments" rows={client.payments.map((payment) => `${displayDate(payment.date)} / ${String(payment.amount)} EGP / ${payment.method} / ${payment.status}`)} />
         <History title="Contracts" rows={client.contracts.map((contract) => `${contract.title} / ${contract.status} / ${displayDate(contract.createdAt)}`)} />
         <Placeholder title="Projects" />
         <Placeholder title="Quotations" />
         <Placeholder title="Files" />
         <Placeholder title="Activity Log" />
       </div>

       <section className="mb-6 rounded-[2rem] border border-[#06111F]/10 bg-white p-6">
         <h2 className="text-2xl font-black uppercase tracking-[-0.05em]">إضافة مصروف للعميل</h2>
         <form action={createExpenseAction} className="grid gap-4">
           <Field label="المبلغ"><input className={inputClass} name="amount" required type="number" /></Field>
           <Field label="التصنيف"><select className={inputClass} name="category">{expenseCategories.map((item) => <option key={item} value={item}>{expenseCategoryArabic[item]}</option>)}</select></Field>
           <Field label="طريقة الدفع"><select className={inputClass} name="method">{paymentMethods.map((item) => <option key={item} value={item}>{paymentMethodArabic[item]}</option>)}</select></Field>
           <Field label="الوصف"><textarea className={inputClass} name="description" required /></Field>
           <input name="clientId" type="hidden" value={id} />
           <input name="date" type="hidden" defaultValue={new Date().toISOString().slice(0, 10)} />
           <button className="rounded-full bg-[#06111F] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white">حفظ المصروف</button>
         </form>
       </section>
    </AdminShell>
  );
}

function History({ title, rows }: { title: string; rows: string[] }) {
  return (
    <section className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-black uppercase tracking-[-0.05em]">{title}</h2>
      <div className="mt-4 grid gap-2 text-sm font-bold text-[#06111F]/60">
        {rows.length === 0 ? <p>No records yet.</p> : rows.map((row) => <p className="rounded-xl bg-[#F7F8FB] p-3" key={row}>{row}</p>)}
      </div>
    </section>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <section className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-black uppercase tracking-[-0.05em]">{title}</h2>
      <p className="mt-4 text-sm font-bold text-[#06111F]/45">This module will connect in the next phase.</p>
    </section>
  );
}
