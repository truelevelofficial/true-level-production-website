import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { setServiceVideoUrl } from "@/lib/site-media-config";

export async function POST(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.redirect(new URL("/account", request.url));
    }
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const url = formData.get("url") as string;
    if (!title?.trim()) {
      return NextResponse.redirect(new URL("/admin/management?error=missing", request.url));
    }
    setServiceVideoUrl(title.trim(), url?.trim() ?? "");
    return NextResponse.redirect(new URL("/admin/management?success=1", request.url));
  } catch {
    return NextResponse.redirect(new URL("/admin/management?error=failed", request.url));
  }
}
