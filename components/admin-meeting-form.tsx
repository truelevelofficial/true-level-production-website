"use client";

import { useState } from "react";
import { Field, inputClass } from "@/components/form-fields";
import { createAdminMeetingAction } from "@/lib/actions";

type MeetingClient = {
  id: string;
  fullName: string;
  companyName: string | null;
  phone: string;
  whatsapp: string | null;
  email: string;
};

type ClientFields = {
  fullName: string;
  companyName: string;
  phone: string;
  whatsapp: string;
  email: string;
};

const emptyClientFields: ClientFields = {
  fullName: "",
  companyName: "",
  phone: "",
  whatsapp: "",
  email: "",
};

export function AdminMeetingForm({ clients, meetingTypes, meetingStatuses, services }: { clients: MeetingClient[]; meetingTypes: readonly string[]; meetingStatuses: readonly string[]; services: readonly string[] }) {
  const [clientFields, setClientFields] = useState<ClientFields>(emptyClientFields);

  function updateField(name: keyof ClientFields, value: string) {
    setClientFields((current) => ({ ...current, [name]: value }));
  }

  function selectClient(clientId: string) {
    const client = clients.find((item) => item.id === clientId);
    if (!client) {
      setClientFields(emptyClientFields);
      return;
    }

    setClientFields({
      fullName: client.fullName,
      companyName: client.companyName || "",
      phone: client.phone,
      whatsapp: client.whatsapp || "",
      email: client.email,
    });
  }

  return (
    <form action={createAdminMeetingAction} className="mb-6 grid gap-4 rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm md:grid-cols-2">
      <div className="md:col-span-2"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">Manual meeting</p><h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.05em]">Add Meeting</h2></div>
      <Field label="Existing client"><select className={inputClass} name="clientId" onChange={(event) => selectClient(event.target.value)}><option value="">Create/link by email</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.fullName} - {client.email}</option>)}</select></Field>
      <Field label="Client name"><input className={inputClass} name="fullName" onChange={(event) => updateField("fullName", event.target.value)} required value={clientFields.fullName} /></Field>
      <Field label="Company"><input className={inputClass} name="companyName" onChange={(event) => updateField("companyName", event.target.value)} value={clientFields.companyName} /></Field>
      <Field label="Phone"><input className={inputClass} name="phone" onChange={(event) => updateField("phone", event.target.value)} required value={clientFields.phone} /></Field>
      <Field label="WhatsApp"><input className={inputClass} name="whatsapp" onChange={(event) => updateField("whatsapp", event.target.value)} value={clientFields.whatsapp} /></Field>
      <Field label="Email"><input className={inputClass} name="email" onChange={(event) => updateField("email", event.target.value)} required type="email" value={clientFields.email} /></Field>
      <Field label="Meeting type"><select className={inputClass} name="meetingType">{meetingTypes.map((type) => <option key={type}>{type}</option>)}</select></Field>
      <Field label="Status"><select className={inputClass} name="status">{meetingStatuses.map((status) => <option key={status}>{status}</option>)}</select></Field>
      <Field label="Date"><input className={inputClass} name="date" required type="date" /></Field>
      <Field label="Time"><input className={inputClass} name="time" required type="time" /></Field>
      <Field label="Duration hours"><input className={inputClass} defaultValue="1" name="durationHours" required type="number" min="1" max="12" /></Field>
      <Field label="Service"><select className={inputClass} name="serviceType">{services.map((service) => <option key={service}>{service}</option>)}</select></Field>
      <Field label="Location"><input className={inputClass} name="meetingLocation" /></Field>
      <Field label="Google Meet link"><input className={inputClass} name="meetingLink" type="url" placeholder="Auto-generated for Google Meeting type" /></Field>
      <Field label="Assigned team member"><input className={inputClass} name="assignedTeamMember" /></Field>
      <Field label="Meeting notes"><textarea className={inputClass} name="notes" rows={3} /></Field>
      <Field label="Internal notes"><textarea className={inputClass} name="internalNotes" rows={3} /></Field>
      <div className="md:col-span-2"><button className="rounded-full bg-[#0B7CFF] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white">Save Meeting</button></div>
    </form>
  );
}
