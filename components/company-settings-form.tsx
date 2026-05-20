"use client";

import { useActionState } from "react";
import { updateCompanySettingsAction } from "@/lib/actions";
import { Field, inputClass, SubmitButton } from "./form-fields";

export function CompanySettingsForm({ settings }: { settings: Record<string, string> }) {
  const [state, action] = useActionState(updateCompanySettingsAction, undefined);

  return (
    <form action={action} className="grid gap-4 rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm md:grid-cols-2">
      <div className="md:col-span-2">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">Company settings</p>
        <h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.05em]">True Level defaults</h2>
      </div>
      {state?.error ? <p className="rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700 md:col-span-2">{state.error}</p> : null}
      {state?.success ? <p className="rounded-2xl bg-green-50 p-3 text-sm font-bold text-green-700 md:col-span-2">{state.success}</p> : null}
      <Field label="Company name"><input className={inputClass} defaultValue={settings.companyName || "True Level Production"} name="companyName" /></Field>
      <Field label="Company legal name"><input className={inputClass} defaultValue={settings.companyLegalName || ""} name="companyLegalName" /></Field>
      <Field label="Company address"><input className={inputClass} defaultValue={settings.companyAddress || "Cairo, Egypt"} name="companyAddress" /></Field>
      <Field label="Company phone"><input className={inputClass} defaultValue={settings.companyPhone || "01143331405"} name="companyPhone" /></Field>
      <Field label="Company email"><input className={inputClass} defaultValue={settings.companyEmail || "contact@truelevel.co"} name="companyEmail" type="email" /></Field>
      <Field label="Tax number"><input className={inputClass} defaultValue={settings.taxNumber || ""} name="taxNumber" /></Field>
      <Field label="Commercial registration number"><input className={inputClass} defaultValue={settings.commercialRegistrationNumber || ""} name="commercialRegistrationNumber" /></Field>
      <Field label="Default contract representative"><input className={inputClass} defaultValue={settings.defaultContractRepresentative || ""} name="defaultContractRepresentative" /></Field>
      <Field label="Default currency"><input className={inputClass} defaultValue={settings.defaultCurrency || "EGP"} name="defaultCurrency" /></Field>
      <Field label="Studio hourly price"><input className={inputClass} defaultValue={settings.studioHourlyPrice || "0"} name="studioHourlyPrice" type="number" /></Field>
      <Field label="Studio half-day price"><input className={inputClass} defaultValue={settings.studioHalfDayPrice || "0"} name="studioHalfDayPrice" type="number" /></Field>
      <Field label="Studio full-day price"><input className={inputClass} defaultValue={settings.studioFullDayPrice || "0"} name="studioFullDayPrice" type="number" /></Field>
      <Field label="Default deposit percentage"><input className={inputClass} defaultValue={settings.defaultDepositPercentage || "50"} name="defaultDepositPercentage" type="number" /></Field>
      <Field label="Notification email"><input className={inputClass} defaultValue={settings.notificationEmail || ""} name="notificationEmail" type="email" /></Field>
      <Field label="Default cancellation policy"><textarea className={inputClass} defaultValue={settings.defaultCancellationPolicy || ""} name="defaultCancellationPolicy" rows={4} /></Field>
      <Field label="Default payment terms"><textarea className={inputClass} defaultValue={settings.defaultPaymentTerms || ""} name="defaultPaymentTerms" rows={4} /></Field>
      <div className="md:col-span-2"><SubmitButton>Save Settings</SubmitButton></div>
    </form>
  );
}
