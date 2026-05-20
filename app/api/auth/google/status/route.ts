import { NextResponse } from "next/server";
import { isGoogleOAuthEnabled } from "@/lib/auth";

export function GET() {
  return NextResponse.json({ enabled: isGoogleOAuthEnabled() });
}
