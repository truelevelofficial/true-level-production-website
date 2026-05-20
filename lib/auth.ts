import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { compare, hash } from "bcryptjs";
import { getPrisma } from "./prisma";

const cookieName = "tl_admin_session";

function secret() {
  return process.env.ADMIN_SESSION_SECRET || "development-only-change-this-secret";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function isAdminAuthenticated() {
  const store = await cookies();
  const value = store.get(cookieName)?.value;
  if (!value) return false;
  const [email, expires, signature] = value.split(".");
  if (!email || !expires || !signature) return false;
  if (Number(expires) < Date.now()) return false;
  return safeEqual(sign(`${email}.${expires}`), signature);
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) redirect("/admin");
}

export async function createAdminSession(email: string) {
  const store = await cookies();
  const expires = String(Date.now() + 1000 * 60 * 60 * 10);
  const payload = `${email}.${expires}`;
  store.set(cookieName, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 10,
  });
}

export function isGoogleOAuthEnabled() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export async function authorizeGoogleAdminEmail(email: string, name?: string) {
  const normalized = email.trim().toLowerCase();
  if (process.env.ADMIN_EMAIL?.trim().toLowerCase() === normalized) return true;
  const prisma = getPrisma();
  if (!prisma) return false;

  const admin = await prisma.adminUser.findUnique({ where: { email: normalized }, select: { id: true } });
  if (admin) return true;

  const adminCount = await prisma.adminUser.count();
  if (adminCount > 0) return false;

  await prisma.adminUser.create({
    data: {
      email: normalized,
      name: name || normalized.split("@")[0],
      passwordHash: await hash(randomBytes(32).toString("hex"), 12),
      role: "OWNER",
    },
  });
  return true;
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(cookieName);
}

export async function validateAdminCredentials(email: string, password: string) {
  const prisma = getPrisma();
  if (prisma) {
    const admin = await prisma.adminUser.findUnique({ where: { email } });
    if (admin && (await compare(password, admin.passwordHash))) return true;
  }

  const expectedEmail = process.env.ADMIN_EMAIL;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedEmail || !expectedPassword) return false;
  return safeEqual(email, expectedEmail) && safeEqual(password, expectedPassword);
}
