import { createMeetingBookingAction } from "@/lib/actions";
import { services } from "@/lib/constants";
import { Field, inputClass, PageShell, SubmitButton } from "@/components/form-fields";

export default async function MeetingBookingPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const params = await searchParams;
  const type = params.type === "COMPANY_MEETING" ? "COMPANY_MEETING" : "GOOGLE_MEETING";
  return (
    <PageShell eyebrow="Meeting Booking" title={type === "GOOGLE_MEETING" ? "Book a Google meeting." : "Book a company meeting."} text="Submit your project details and preferred time. Every meeting is reviewed before approval.">
      <form action={createMeetingBookingAction} className="grid gap-5 rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm md:grid-cols-2">
        <input name="meetingType" type="hidden" value={type} />
        <Field label="Full name"><input className={inputClass} name="fullName" required /></Field>
        <Field label="Company name"><input className={inputClass} name="companyName" /></Field>
        <Field label="Phone number"><input className={inputClass} name="phone" required /></Field>
        <Field label="Email"><input className={inputClass} name="email" required type="email" /></Field>
        <Field label="Date"><input className={inputClass} name="date" required type="date" /></Field>
        <Field label="Time"><input className={inputClass} name="time" required type="time" /></Field>
        <Field label="Service interested in"><select className={inputClass} name="serviceType">{services.map((service) => <option key={service}>{service}</option>)}</select></Field>
        <Field label="Meeting notes"><textarea className={inputClass} name="notes" rows={4} /></Field>
        <div className="md:col-span-2"><SubmitButton>Submit Meeting Request</SubmitButton></div>
      </form>
    </PageShell>
  );
}
