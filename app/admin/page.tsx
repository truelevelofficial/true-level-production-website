import { redirect } from "next/navigation";
import { AdminLogin } from "@/components/admin-login";
import { isAdminAuthenticated, isGoogleOAuthEnabled } from "@/lib/auth";

const oauthErrors: Record<string, string> = {
  google_not_configured: "Google login is not configured on the server.",
  invalid_google_state: "Google login session expired. Try again.",
  google_token_failed: "Google could not verify this login. Check the OAuth redirect URI.",
  google_token_missing: "Google did not return an access token.",
  google_user_failed: "Could not read your Google profile.",
  google_email_unverified: "Your Google email must be verified.",
  google_admin_denied: "This Google email is not allowed for admin access.",
};

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await isAdminAuthenticated()) redirect("/admin/bookings");
  const params = await searchParams;
  return <main className="grid min-h-screen place-items-center bg-[#F7F8FB] px-5 text-[#06111F]"><AdminLogin googleEnabled={isGoogleOAuthEnabled()} oauthError={params.error ? oauthErrors[params.error] || "Google login failed. Try again." : undefined} /></main>;
}
