import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { isGoogleOAuthEnabled } from "@/lib/auth";

function baseUrl(request: NextRequest) {
  return (process.env.NEXTAUTH_URL || request.nextUrl.origin).replace(/\/$/, "");
}

export async function GET(request: NextRequest) {
  if (!isGoogleOAuthEnabled()) return NextResponse.redirect(new URL("/admin", request.url));

  const state = randomBytes(24).toString("hex");
  const store = await cookies();
  store.set("tl_google_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${baseUrl(request)}/api/auth/callback/google`,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
