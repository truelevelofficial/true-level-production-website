import { redirect } from "next/navigation";
import { AdminLogin } from "@/components/admin-login";
import { getSessionEmail, isAdminEmail, isGoogleOAuthEnabled } from "@/lib/auth";

const oauthErrors: Record<string, string> = {
  google_not_configured: "Google login is not configured on the server.",
  invalid_google_state: "Google login session expired. Try again.",
  google_token_failed: "Google could not verify this login. Check the OAuth redirect URI.",
  google_token_missing: "Google did not return an access token.",
  google_user_failed: "Could not read your Google profile.",
  google_email_unverified: "Your Google email must be verified.",
  google_callback_failed: "Google login failed on the server. Try again or use email login.",
};

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const email = await getSessionEmail();
  const params = await searchParams;
  if (!email) {
    return <main className="grid min-h-screen place-items-center bg-[#F7F8FB] px-5 text-[#06111F]"><AdminLogin googleEnabled={isGoogleOAuthEnabled()} oauthError={params.error ? oauthErrors[params.error] || "Google login failed. Try again." : undefined} /></main>;
  }

  const admin = await isAdminEmail(email);
  if (admin && params.error === "admin") redirect("/admin/bookings");

  return (
    <main className="grid min-h-screen place-items-center bg-[#F7F8FB] px-5 text-[#06111F]">
      <div className="mx-auto grid w-full max-w-md gap-4 rounded-[2rem] border border-[#06111F]/10 bg-white p-7 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0B7CFF]">True Level Account</p>
        <h1 className="text-4xl font-black uppercase leading-none tracking-[-0.06em]">Account</h1>
        <p className="rounded-2xl bg-[#F7F8FB] p-4 text-sm font-bold text-[#06111F]/65">Logged in as {email}</p>
        {admin ? <a className="rounded-full bg-[#0B7CFF] px-6 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-white" href="/admin/bookings">Open Dashboard</a> : <a className="rounded-full bg-[#0B7CFF] px-6 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-white" href="/book">Book a Service</a>}
      </div>
    </main>
  );
}
