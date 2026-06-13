export default function AdminLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F8FB] p-6 text-[#06111F]">
      <div className="w-full max-w-md rounded-[2rem] border border-[#06111F]/10 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-[#0B7CFF]/10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#0B7CFF] border-t-transparent" />
        </div>
        <h1 className="text-xl font-black uppercase tracking-[-0.03em]">Loading</h1>
        <p className="mt-3 text-sm leading-6 text-[#06111F]/55">Preparing your dashboard...</p>
      </div>
    </div>
  );
}
