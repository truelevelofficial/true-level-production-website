"use client";

import { useEffect } from "react";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Admin page error:", error.message, error.stack, error.digest ? `digest=${error.digest}` : "");
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F8FB] p-6 text-[#06111F]">
      <div className="w-full max-w-2xl rounded-[2rem] border border-[#06111F]/10 bg-white p-8 shadow-sm">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-red-50 text-2xl">⚠️</div>
        <h1 className="text-center text-xl font-black uppercase tracking-[-0.03em]">Server Error</h1>
        <p className="mt-3 text-center text-sm leading-6 text-[#06111F]/55">The page could not load due to a temporary error.</p>
        <details className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <summary className="cursor-pointer text-xs font-black uppercase tracking-[0.1em] text-red-700">Error details</summary>
          <pre className="mt-3 overflow-auto whitespace-pre-wrap break-all text-xs leading-6 text-red-900">{error.message}{error.stack ? `\n\n${error.stack}` : ""}</pre>
        </details>
        <div className="mt-6 text-center">
          <button
            onClick={reset}
            className="rounded-full bg-[#0B7CFF] px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-white shadow-xl shadow-blue-500/20 transition hover:bg-[#06111F]"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
