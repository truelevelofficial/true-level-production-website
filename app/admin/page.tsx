import { redirect } from "next/navigation";
import { AdminLogin } from "@/components/admin-login";
import { isAdminAuthenticated, isGoogleOAuthEnabled } from "@/lib/auth";

export default async function AdminPage() {
  if (await isAdminAuthenticated()) redirect("/admin/bookings");
  return <main className="grid min-h-screen place-items-center bg-[#F7F8FB] px-5 text-[#06111F]"><AdminLogin googleEnabled={isGoogleOAuthEnabled()} /></main>;
}
