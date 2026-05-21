"use client";

import { useActionState } from "react";
import { runCalendarDiagnosticAction } from "@/lib/actions";
import { SubmitButton } from "./form-fields";

export function CalendarDiagnostic() {
  const [state, action] = useActionState(runCalendarDiagnosticAction, undefined);

  return (
    <div className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">Google Calendar</p>
        <h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.05em]">Diagnostic</h2>
        <p className="mt-1 text-sm text-gray-500">Test Google Calendar API connectivity step by step.</p>
      </div>

      {state?.steps ? (
        <div className="mt-4 space-y-2">
          {state.steps.map((s, i) => (
            <div key={i} className={`rounded-xl p-3 text-sm font-medium ${s.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
              <span className="mr-2">{s.success ? "✓" : "✗"}</span>
              <strong>{s.step}:</strong> {s.detail}
            </div>
          ))}
        </div>
      ) : null}

      <form action={action} className="mt-4">
        <SubmitButton>Run Diagnostic</SubmitButton>
      </form>
    </div>
  );
}
