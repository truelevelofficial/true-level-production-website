import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(cookieName);
}

export function validateAdminCredentials(email: string, password: string) {
  const expectedEmail = process.env.ADMIN_EMAIL;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedEmail || !expectedPassword) return false;
  return safeEqual(email, expectedEmail) && safeEqual(password, expectedPassword);
}
