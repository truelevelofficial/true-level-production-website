"use client";

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F8FB] p-6 text-[#06111F]">
      <div className="w-full max-w-md rounded-[2rem] border border-[#06111F]/10 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-red-50 text-2xl">⚠️</div>
        <h1 className="text-xl font-black uppercase tracking-[-0.03em]">Server Error</h1>
        <p className="mt-3 text-sm leading-6 text-[#06111F]/55">The page could not load due to a temporary error. This has been logged.</p>
        <button
          onClick={reset}
          className="mt-6 rounded-full bg-[#0B7CFF] px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-white shadow-xl shadow-blue-500/20 transition hover:bg-[#06111F]"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
