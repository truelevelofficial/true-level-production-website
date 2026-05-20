import { AdminShell, SetupNotice } from "@/components/admin-shell";
import { Field, inputClass } from "@/components/form-fields";
import { createContractAction } from "@/lib/actions";
import { contractStatuses, contractTypes, services } from "@/lib/constants";
import { getContracts, hasDatabase } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";

export default async function ContractsPage() {
  await requireAdmin();
  const contracts = await getContracts();
  return (
    <AdminShell title="Contracts">
      {!hasDatabase() ? <SetupNotice /> : null}
      <p className="mb-6 rounded-2xl bg-white p-4 text-sm font-bold text-[#06111F]/55">Generated contracts are Arabic drafts/templates and must be reviewed by a licensed Egyptian lawyer before official use.</p>
      <form action={createContractAction} className="grid gap-4 rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm md:grid-cols-2">
        <Field label="Contract type"><select className={inputClass} name="type">{contractTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
        <Field label="Status"><select className={inputClass} name="status">{contractStatuses.map((status) => <option key={status}>{status}</option>)}</select></Field>
        <Field label="Client name"><input className={inputClass} name="clientName" required /></Field>
        <Field label="Client company"><input className={inputClass} name="clientCompanyName" /></Field>
        <Field label="National ID or tax ID"><input className={inputClass} name="clientTaxId" /></Field>
        <Field label="Client address"><input className={inputClass} name="clientAddress" /></Field>
        <Field label="Client phone"><input className={inputClass} name="clientPhone" required /></Field>
        <Field label="Client email"><input className={inputClass} name="clientEmail" required type="email" /></Field>
        <Field label="True Level representative"><input className={inputClass} name="representativeName" required /></Field>
        <Field label="Service type"><select className={inputClass} name="serviceType">{services.map((service) => <option key={service}>{service}</option>)}</select></Field>
        <Field label="Project start"><input className={inputClass} name="projectStartDate" required type="date" /></Field>
        <Field label="Project end"><input className={inputClass} name="projectEndDate" required type="date" /></Field>
        <Field label="Shooting date"><input className={inputClass} name="shootingDate" required type="date" /></Field>
        <Field label="Location"><input className={inputClass} name="location" required /></Field>
        <Field label="Total price"><input className={inputClass} name="totalPrice" required type="number" /></Field>
        <Field label="Deposit"><input className={inputClass} name="depositAmount" required type="number" /></Field>
        <Field label="Remaining"><input className={inputClass} name="remainingAmount" required type="number" /></Field>
        <Field label="Revision rounds"><input className={inputClass} defaultValue="2" name="revisionRounds" required type="number" /></Field>
        <Field label="Project description"><textarea className={inputClass} name="projectDescription" required /></Field>
        <Field label="Deliverables"><textarea className={inputClass} name="deliverables" required /></Field>
        <Field label="Payment terms"><textarea className={inputClass} name="paymentTerms" required /></Field>
        <Field label="Cancellation policy"><textarea className={inputClass} name="cancellationPolicy" required /></Field>
        <Field label="Delivery timeline"><textarea className={inputClass} name="deliveryTimeline" required /></Field>
        <Field label="Usage rights"><textarea className={inputClass} name="usageRights" required /></Field>
        <Field label="Confidentiality clause"><textarea className={inputClass} name="confidentialityClause" required /></Field>
        <Field label="Late payment clause"><textarea className={inputClass} name="latePaymentClause" required /></Field>
        <Field label="Additional notes"><textarea className={inputClass} name="additionalNotes" /></Field>
        <div className="md:col-span-2"><button className="rounded-full bg-[#0B7CFF] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white">Generate Contract Draft</button></div>
      </form>
      <div className="mt-6 grid gap-4">
        {contracts.map((contract) => <article className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm" key={contract.id} dir="rtl">
          <p className="text-sm font-bold text-[#0B7CFF]">{contract.status}</p>
          <h2 className="mt-2 text-2xl font-black">{contract.title}</h2>
          <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-[#F7F8FB] p-4 text-sm leading-7 text-[#06111F]/70">{contract.body}</pre>
          <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-[#06111F]/45">Use browser print to export as PDF.</p>
        </article>)}
      </div>
    </AdminShell>
  );
}
