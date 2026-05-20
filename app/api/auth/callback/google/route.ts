import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { bootstrapFirstGoogleAdmin, createAdminSession, ensureUserAccount, isAdminEmail, isGoogleOAuthEnabled } from "@/lib/auth";

type GoogleUser = {
  email?: string;
  email_verified?: boolean;
  name?: string;
};

function baseUrl(request: NextRequest) {
  return process.env.NEXTAUTH_URL || request.nextUrl.origin;
}

function adminUrl(request: NextRequest, error?: string) {
  const url = new URL("/admin", request.url);
  if (error) url.searchParams.set("error", error);
  return url;
}

export async function GET(request: NextRequest) {
  if (!isGoogleOAuthEnabled()) return NextResponse.redirect(adminUrl(request, "google_not_configured"));

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const store = await cookies();
  const expectedState = store.get("tl_google_oauth_state")?.value;
  store.delete("tl_google_oauth_state");

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(adminUrl(request, "invalid_google_state"));
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
      redirect_uri: `${baseUrl(request)}/api/auth/callback/google`,
    }),
  });

  if (!tokenResponse.ok) return NextResponse.redirect(adminUrl(request, "google_token_failed"));
  const tokens = (await tokenResponse.json()) as { access_token?: string };
  if (!tokens.access_token) return NextResponse.redirect(adminUrl(request, "google_token_missing"));

  const userResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { authorization: `Bearer ${tokens.access_token}` },
  });

  if (!userResponse.ok) return NextResponse.redirect(adminUrl(request, "google_user_failed"));
  const user = (await userResponse.json()) as GoogleUser;
  if (!user.email || user.email_verified === false) return NextResponse.redirect(adminUrl(request, "google_email_unverified"));

  const email = user.email.toLowerCase();
  await ensureUserAccount(email, user.name, "google");
  await bootstrapFirstGoogleAdmin(email, user.name);
  await createAdminSession(email);
  return NextResponse.redirect(new URL((await isAdminEmail(email)) ? "/admin/bookings" : "/account", request.url));
}
