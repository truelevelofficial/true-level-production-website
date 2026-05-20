import { createStudioBookingAction } from "@/lib/actions";
import { studioSetups } from "@/lib/constants";
import { Field, inputClass, PageShell, SubmitButton } from "@/components/form-fields";
import { requireAuth } from "@/lib/auth";

export default async function StudioBookingPage() {
  await requireAuth();
  return (
    <PageShell eyebrow="Studio Booking" title="Reserve the scene." text="Choose your setup, timing, duration, and production purpose. Conflicting slots are blocked for pending and approved bookings.">
      <form action={createStudioBookingAction} className="grid gap-5 rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm md:grid-cols-2">
        <Field label="Full name"><input className={inputClass} name="fullName" required /></Field>
        <Field label="Company name"><input className={inputClass} name="companyName" /></Field>
        <Field label="Phone number"><input className={inputClass} name="phone" required /></Field>
        <Field label="Email"><input className={inputClass} name="email" required type="email" /></Field>
        <Field label="Studio setup"><select className={inputClass} name="studioSetup">{studioSetups.map((setup) => <option key={setup}>{setup}</option>)}</select></Field>
        <Field label="Date"><input className={inputClass} name="date" required type="date" /></Field>
        <Field label="Start time"><input className={inputClass} name="startTime" required type="time" /></Field>
        <Field label="Duration type"><select className={inputClass} name="durationType"><option value="HOURLY">Hourly</option><option value="HALF_DAY">Half day - 6 hours</option><option value="FULL_DAY">Full day - 12 hours</option></select></Field>
        <Field label="Hours for hourly booking"><input className={inputClass} defaultValue="1" max="12" min="1" name="durationHours" type="number" /></Field>
        <Field label="Number of people"><input className={inputClass} defaultValue="1" min="1" name="peopleCount" type="number" /></Field>
        <Field label="Booking purpose"><input className={inputClass} name="bookingPurpose" required /></Field>
        <Field label="Extra notes"><textarea className={inputClass} name="notes" rows={4} /></Field>
        <div className="md:col-span-2"><SubmitButton>Submit Studio Request</SubmitButton></div>
      </form>
    </PageShell>
  );
}
