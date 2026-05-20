"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions";
import { inputClass, SubmitButton } from "./form-fields";

export function AdminLogin() {
  const [state, action] = useActionState(loginAction, undefined);
  return (
    <form action={action} className="mx-auto grid max-w-md gap-4 rounded-[2rem] border border-[#06111F]/10 bg-white p-7 shadow-sm">
      <h1 className="text-4xl font-black uppercase leading-none tracking-[-0.06em]">Admin Login</h1>
      <input className={inputClass} name="email" placeholder="Admin email" type="email" required />
      <input className={inputClass} name="password" placeholder="Password" type="password" required />
      {state?.error ? <p className="rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">{state.error}</p> : null}
      <SubmitButton>Login</SubmitButton>
    </form>
  );
}
