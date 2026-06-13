import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getPrisma } from "./prisma";

export async function requirePortalAuth() {
  const c = await cookies();
  const token = c.get("portal-token")?.value;
  if (!token) redirect("/portal?error=auth");
  const prisma = getPrisma();
  if (!prisma) redirect("/portal?error=system");
  const user = await prisma.clientPortalUser.findUnique({
    where: { id: token },
    include: { client: true },
  });
  if (!user || !user.isActive) redirect("/portal?error=auth");
  return user;
}
