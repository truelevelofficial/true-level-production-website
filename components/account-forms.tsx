"use client";

import { useActionState } from "react";
import { updateProfileAction, changePasswordAction } from "@/lib/actions";
import { inputClass, SubmitButton } from "./form-fields";

export function ProfileForm({ name, email }: { name: string | null; email: string }) {
  const [state, action] = useActionState(updateProfileAction, undefined);

  return (
    <form action={action} className="grid gap-4">
      <h2 className="text-xl font-black uppercase tracking-[-0.05em]">Profile</h2>
      <div>
        <label className="mb-1 block text-xs font-black uppercase tracking-[0.14em] text-[#06111F]/45">Email</label>
        <p className="rounded-xl border border-[#06111F]/10 bg-[#F7F8FB] px-4 py-3 text-sm font-bold">{email}</p>
      </div>
      <div>
        <label className="mb-1 block text-xs font-black uppercase tracking-[0.14em] text-[#06111F]/45">Name</label>
        <input className={inputClass} defaultValue={name || ""} name="name" required />
      </div>
      {state?.error ? <p className="rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">{state.error}</p> : null}
      {state?.success ? <p className="rounded-2xl bg-green-50 p-3 text-sm font-bold text-green-700">{state.success}</p> : null}
      <SubmitButton>Save Changes</SubmitButton>
    </form>
  );
}

export function PasswordForm() {
  const [state, action] = useActionState(changePasswordAction, undefined);

  return (
    <form action={action} className="grid gap-4">
      <h2 className="text-xl font-black uppercase tracking-[-0.05em]">Change Password</h2>
      <div>
        <label className="mb-1 block text-xs font-black uppercase tracking-[0.14em] text-[#06111F]/45">Current password</label>
        <input className={inputClass} name="currentPassword" required type="password" />
      </div>
      <div>
        <label className="mb-1 block text-xs font-black uppercase tracking-[0.14em] text-[#06111F]/45">New password</label>
        <input className={inputClass} name="newPassword" required type="password" />
      </div>
      <div>
        <label className="mb-1 block text-xs font-black uppercase tracking-[0.14em] text-[#06111F]/45">Confirm new password</label>
        <input className={inputClass} name="confirmPassword" required type="password" />
      </div>
      {state?.error ? <p className="rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">{state.error}</p> : null}
      {state?.success ? <p className="rounded-2xl bg-green-50 p-3 text-sm font-bold text-green-700">{state.success}</p> : null}
      <SubmitButton>Change Password</SubmitButton>
    </form>
  );
}
