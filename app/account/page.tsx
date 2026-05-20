import { redirect } from "next/navigation";
import { AdminLogin } from "@/components/admin-login";
import { getSessionEmail, isAdminEmail, isGoogleOAuthEnabled } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { ProfileForm, PasswordForm } from "@/components/account-forms";

const oauthErrors: Record<string, string> = {
  google_not_configured: "Google login is not configured on the server.",
  invalid_google_state: "Google login session expired. Try again.",
  google_token_failed: "Google could not verify this login. Check the OAuth redirect URI.",
  google_token_missing: "Google did not return an access token.",
  google_user_failed: "Could not read your Google profile.",
  google_email_unverified: "Your Google email must be verified.",
  google_callback_failed: "Google login failed on the server. Try again or use email login.",
};

function formatDate(d: Date) {
  return d.toLocaleDateString("en-EG", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("en-EG", { hour: "2-digit", minute: "2-digit" });
}

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const email = await getSessionEmail();
  const params = await searchParams;
  if (!email) {
    return <main className="grid min-h-screen place-items-center bg-[#F7F8FB] px-5 text-[#06111F]"><AdminLogin googleEnabled={isGoogleOAuthEnabled()} oauthError={params.error ? oauthErrors[params.error] || "Google login failed. Try again." : undefined} /></main>;
  }

  const admin = await isAdminEmail(email);
  if (admin && params.error === "admin") redirect("/admin/bookings");

  const prisma = getPrisma();
  let user = null;
  let bookings: { id: string; type: string; status: string; date: Date; startTime: Date; meetingType?: string | null; studioSetup?: string | null; client: { fullName: string } }[] = [];
  if (prisma) {
    user = await prisma.user.findUnique({ where: { email }, select: { name: true, email: true } });
    const client = await prisma.client.findUnique({ where: { email }, select: { id: true } });
    if (client) {
      bookings = await prisma.booking.findMany({
        where: { clientId: client.id },
        select: { id: true, type: true, status: true, date: true, startTime: true, meetingType: true, studioSetup: true, client: { select: { fullName: true } } },
        orderBy: { startTime: "desc" },
        take: 20,
      });
    }
  }

  const upcoming = bookings.filter((b) => b.status === "PENDING" || b.status === "APPROVED");
  const past = bookings.filter((b) => b.status === "COMPLETED" || b.status === "REJECTED" || b.status === "CANCELLED");

  return (
    <main className="min-h-screen bg-[#F7F8FB] px-5 py-6 text-[#06111F]">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0B7CFF]">True Level Account</p>
        <h1 className="mt-1 text-4xl font-black uppercase tracking-[-0.06em]">Account Settings</h1>

        <div className="mt-8 grid gap-6">
          <div className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
            <ProfileForm name={user?.name || null} email={email} />
          </div>

          <div className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
            <PasswordForm />
          </div>

          <div className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black uppercase tracking-[-0.05em]">My Bookings</h2>
            {bookings.length === 0 ? (
              <p className="mt-4 text-sm font-bold text-[#06111F]/45">No bookings yet.</p>
            ) : (
              <div className="mt-4 grid gap-3">
                {upcoming.map((b) => (
                  <div key={b.id} className="rounded-xl border border-[#06111F]/10 bg-[#F7F8FB] p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-black uppercase tracking-[0.08em]">
                        {b.type === "STUDIO" ? b.studioSetup || "Studio" : b.meetingType || b.type}
                      </p>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${
                        b.status === "APPROVED" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }`}>{b.status}</span>
                    </div>
                    <p className="mt-1 text-xs text-[#06111F]/55">{formatDate(b.date)} — {formatTime(b.startTime)}</p>
                  </div>
                ))}
                {past.length > 0 ? (
                  <>
                    <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-[#06111F]/35">Past bookings</p>
                    {past.slice(0, 5).map((b) => (
                      <div key={b.id} className="rounded-xl border border-[#06111F]/10 bg-[#F7F8FB] p-4 opacity-60">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-black uppercase tracking-[0.08em]">
                            {b.type === "STUDIO" ? b.studioSetup || "Studio" : b.meetingType || b.type}
                          </p>
                          <span className="rounded-full bg-[#06111F]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#06111F]/45">{b.status}</span>
                        </div>
                        <p className="mt-1 text-xs text-[#06111F]/55">{formatDate(b.date)} — {formatTime(b.startTime)}</p>
                      </div>
                    ))}
                  </>
                ) : null}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {admin ? <a className="inline-flex justify-center rounded-full bg-[#0B7CFF] px-6 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-white" href="/admin/bookings">Open Dashboard</a> : null}
            <a className="inline-flex justify-center rounded-full border border-[#06111F]/15 bg-white px-6 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-[#06111F] hover:border-[#0B7CFF] hover:text-[#0B7CFF]" href="/book">Book a Service</a>
          </div>
        </div>
      </div>
    </main>
  );
}
