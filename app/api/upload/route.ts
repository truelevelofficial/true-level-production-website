import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.redirect(new URL("/account", request.url));
    }
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const assetPath = formData.get("assetPath") as string;
    if (!file || !assetPath?.trim()) {
      return NextResponse.redirect(new URL("/admin/management?error=missing", request.url));
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    const fullPath = path.join(process.cwd(), "public", assetPath.trim());
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, bytes);
    return NextResponse.redirect(new URL("/admin/management?success=1", request.url));
  } catch {
    return NextResponse.redirect(new URL("/admin/management?error=failed", request.url));
  }
}
