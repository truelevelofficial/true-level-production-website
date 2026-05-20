"use client";

import { useActionState, useState } from "react";
import { loginAction, signupAction } from "@/lib/actions";
import { inputClass, SubmitButton } from "./form-fields";

export function AdminLogin({ googleEnabled }: { googleEnabled: boolean }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [state, action] = useActionState(loginAction, undefined);
  const [signupState, signup] = useActionState(signupAction, undefined);

  return (
    <div className="mx-auto grid w-full max-w-md gap-4 rounded-[2rem] border border-[#06111F]/10 bg-white p-7 shadow-sm">
      <h1 className="text-4xl font-black uppercase leading-none tracking-[-0.06em]">{mode === "login" ? "Login" : "Signup"}</h1>

      {mode === "login" ? (
        <form action={action} className="grid gap-4">
          <input className={inputClass} name="email" placeholder="Email" type="email" required />
          <input className={inputClass} name="password" placeholder="Password" type="password" required />
          {state?.error ? <p className="rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">{state.error}</p> : null}
          <SubmitButton>Login</SubmitButton>
        </form>
      ) : (
        <form action={signup} className="grid gap-4">
          <input className={inputClass} name="name" placeholder="Full name" required />
          <input className={inputClass} name="email" placeholder="Email" type="email" required />
          <input className={inputClass} name="password" placeholder="Password" type="password" required />
          <input className={inputClass} name="confirmPassword" placeholder="Confirm password" type="password" required />
          {signupState?.error ? <p className="rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">{signupState.error}</p> : null}
          <SubmitButton>Create Account</SubmitButton>
        </form>
      )}

      {googleEnabled ? (
        <a className="flex w-full items-center justify-center gap-3 rounded-full border border-[#06111F]/10 bg-white px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-[#06111F] transition hover:border-[#0B7CFF] hover:text-[#0B7CFF]" href="/api/auth/google">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-[#0B7CFF] text-xs text-white">G</span>
          Continue With Google
        </a>
      ) : null}

      <p className="text-center text-sm font-bold text-[#06111F]/55">
        {mode === "login" ? "Don’t have an account?" : "Already have an account?"}{" "}
        <button className="font-black text-[#0B7CFF]" onClick={() => setMode(mode === "login" ? "signup" : "login")} type="button">
          {mode === "login" ? "Signup" : "Login"}
        </button>
      </p>
    </div>
  );
}
