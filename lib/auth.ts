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

function encodeSessionPayload(payload: { email: string; expires: number }) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodeSessionPayload(value: string) {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as { email?: string; expires?: number };
  } catch {
    return null;
  }
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function getSessionEmail() {
  const store = await cookies();
  const value = store.get(cookieName)?.value;
  if (!value) return null;
  const separatorIndex = value.lastIndexOf(".");
  if (separatorIndex === -1) return null;

  const payload = value.slice(0, separatorIndex);
  const signature = value.slice(separatorIndex + 1);
  const decoded = decodeSessionPayload(payload);
  if (!decoded?.email || !decoded.expires || !signature) return null;
  if (decoded.expires < Date.now()) return null;
  if (!safeEqual(sign(payload), signature)) return null;
  return decoded.email;
}

export async function isAuthenticated() {
  return Boolean(await getSessionEmail());
}

export async function isAdminEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  if (process.env.ADMIN_EMAIL?.trim().toLowerCase() === normalized) return true;
  const prisma = getPrisma();
  if (!prisma) return false;
  try {
    const admin = await prisma.adminUser.findUnique({ where: { email: normalized }, select: { id: true } });
    return Boolean(admin);
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated() {
  const email = await getSessionEmail();
  return email ? isAdminEmail(email) : false;
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) redirect("/account");
}

export async function createAdminSession(email: string) {
  const store = await cookies();
  const payload = encodeSessionPayload({ email, expires: Date.now() + 1000 * 60 * 60 * 10 });
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

export async function ensureUserAccount(email: string, name?: string, provider = "credentials") {
  const normalized = email.trim().toLowerCase();
  const prisma = getPrisma();
  if (!prisma) return;
  try {
    await prisma.user.upsert({
      where: { email: normalized },
      update: { name: name || undefined, provider },
      create: { email: normalized, name: name || null, provider },
    });
  } catch {
    // The account session can still work if the new User table has not been pushed yet.
  }
}

export async function bootstrapFirstGoogleAdmin(email: string, name?: string) {
  const prisma = getPrisma();
  if (!prisma) return;
  try {
    const adminCount = await prisma.adminUser.count();
    if (adminCount === 0) {
      await prisma.adminUser.create({
        data: { email: email.trim().toLowerCase(), name: name || null, passwordHash: await hash(randomBytes(32).toString("hex"), 12), role: "OWNER" },
      });
    }
  } catch {
    // Admin bootstrap is best-effort; explicit ADMIN_EMAIL still grants dashboard access.
  }
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(cookieName);
}

export async function validateAdminCredentials(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  const prisma = getPrisma();
  if (prisma) {
    try {
      const user = await prisma.user.findUnique({ where: { email: normalized } });
      if (user?.passwordHash && (await compare(password, user.passwordHash))) return true;
    } catch {
      // User table may not exist until db:push runs.
    }

    try {
      const admin = await prisma.adminUser.findUnique({ where: { email: normalized } });
      if (admin && (await compare(password, admin.passwordHash))) return true;
    } catch {
      // Fall back to env credentials below.
    }
  }

  const expectedEmail = process.env.ADMIN_EMAIL;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedEmail || !expectedPassword) return false;
  return safeEqual(email, expectedEmail) && safeEqual(password, expectedPassword);
}
