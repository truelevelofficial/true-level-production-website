"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import { clearAdminSession, createAdminSession, ensureUserAccount, isAdminEmail, requireAdmin, validateAdminCredentials } from "./auth";
import { combineDateTime, dateOnly, endAfterHours } from "./dates";
import { getPrisma } from "./prisma";
import { adminBookingSchema, contractSchema, expenseSchema, meetingBookingSchema, paymentSchema, studioBookingSchema } from "./validation";
import { generateArabicContract } from "./contracts";
import { createCalendarEventWithMeet } from "./google-calendar";
import { notifyNewBooking, notifyBookingStatusChange } from "./notifications";

function values(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

async function upsertClient(data: { fullName: string; companyName?: string; phone: string; email: string }) {
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database is not configured. Add DATABASE_URL before using forms.");
  return prisma.client.upsert({
    where: { email: data.email },
    update: { fullName: data.fullName, companyName: data.companyName || null, phone: data.phone },
    create: { fullName: data.fullName, companyName: data.companyName || null, phone: data.phone, email: data.email },
  });
}

export async function loginAction(_prev: { error?: string } | undefined, formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  if (!(await validateAdminCredentials(email, password))) return { error: "Invalid email or password." };
  await createAdminSession(email.trim().toLowerCase());
  if (await isAdminEmail(email)) redirect("/admin/bookings");
  redirect("/");
}

export async function signupAction(_prev: { error?: string } | undefined, formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");
  if (name.length < 2) return { error: "Name is required." };
  if (!email.includes("@")) return { error: "Valid email is required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirmPassword) return { error: "Passwords do not match." };

  const prisma = getPrisma();
  if (!prisma) return { error: "Database is not configured." };
  try {
    const existingUser = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existingUser) return { error: "This email already has an account. Please login." };

    await prisma.user.create({ data: { name, email, passwordHash: await hash(password, 12), provider: "credentials" } });
  } catch {
    return { error: "Account database table is not ready. Run db:push, then try again." };
  }
  await createAdminSession(email);
  if (await isAdminEmail(email)) redirect("/admin/bookings");
  redirect("/");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin");
}

export async function createMeetingBookingAction(formData: FormData) {
  const input = meetingBookingSchema.parse(values(formData));
  const client = await upsertClient(input);
  const startTime = combineDateTime(input.date, input.time);
  const endTime = endAfterHours(startTime, 1);
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database is not configured.");
  await prisma.booking.create({
    data: {
      type: input.meetingType,
      meetingType: input.meetingType === "GOOGLE_MEETING" ? "Google Meeting" : "Company Meeting",
      clientId: client.id,
      date: dateOnly(input.date),
      startTime,
      endTime,
      durationHours: 1,
      serviceType: input.serviceType,
      notes: input.notes || null,
    },
  });
  await notifyNewBooking(client.fullName, input.meetingType === "GOOGLE_MEETING" ? "Google Meeting" : "Company Meeting", client.email);
  redirect("/booking-success");
}

export async function createStudioBookingAction(formData: FormData) {
  const input = studioBookingSchema.parse(values(formData));
  const durationHours = input.durationType === "HALF_DAY" ? 6 : input.durationType === "FULL_DAY" ? 12 : input.durationHours;
  const startTime = combineDateTime(input.date, input.startTime);
  const endTime = endAfterHours(startTime, durationHours);
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database is not configured.");

  const conflict = await prisma.booking.findFirst({
    where: {
      type: "STUDIO",
      studioSetup: input.studioSetup,
      status: { in: ["PENDING", "APPROVED"] },
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    },
    select: { id: true },
  });
  if (conflict) throw new Error("This studio setup is already requested or booked for the selected time.");

  const client = await upsertClient(input);
  await prisma.booking.create({
    data: {
      type: "STUDIO",
      clientId: client.id,
      date: dateOnly(input.date),
      startTime,
      endTime,
      durationHours,
      studioSetup: input.studioSetup,
      bookingPurpose: input.bookingPurpose,
      peopleCount: input.peopleCount,
      notes: input.notes || null,
    },
  });
  await notifyNewBooking(client.fullName, `Studio (${input.studioSetup})`, client.email);
  redirect("/booking-success");
}

export async function updateBookingAction(formData: FormData) {
  await requireAdmin();
  const input = adminBookingSchema.parse(values(formData));
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database is not configured.");

  const current = await prisma.booking.findUnique({ where: { id: input.bookingId }, include: { client: true } });
  if (!current) throw new Error("Booking not found.");

  let meetingLink = input.meetingLink;
  if (input.status === "APPROVED" && current.type === "GOOGLE_MEETING" && !meetingLink) {
    const link = await createCalendarEventWithMeet({
      summary: `Meeting with ${current.client.fullName}`,
      description: current.notes || "True Level Production meeting",
      startTime: current.startTime,
      endTime: current.endTime,
      attendeeEmail: current.client.email,
    });
    if (link) meetingLink = link;
  }

  const price = input.price ?? 0;
  const deposit = input.deposit ?? 0;
  const discount = input.discount ?? 0;
  await prisma.booking.update({
    where: { id: input.bookingId },
    data: {
      status: input.status,
      price,
      deposit,
      discount,
      remainingAmount: Math.max(price - deposit - discount, 0),
      paymentStatus: input.paymentStatus,
      meetingLink: meetingLink || null,
      internalNotes: input.internalNotes || null,
    },
  });

  if (input.status !== current.status) {
    await notifyBookingStatusChange(current.client.email, current.client.fullName, current.type, input.status, meetingLink || undefined);
  }
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/meetings");
  revalidatePath("/admin/studio");
}

export async function createPaymentAction(formData: FormData) {
  await requireAdmin();
  const input = paymentSchema.parse(values(formData));
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database is not configured.");
  await prisma.payment.create({
    data: {
      amount: input.amount,
      method: input.method,
      status: input.status,
      description: input.description || null,
      clientId: input.clientId || null,
      bookingId: input.bookingId || null,
      date: dateOnly(input.date),
    },
  });
  revalidatePath("/admin/accounting");
}

export async function createExpenseAction(formData: FormData) {
  await requireAdmin();
  const input = expenseSchema.parse(values(formData));
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database is not configured.");
  await prisma.expense.create({
    data: {
      amount: input.amount,
      category: input.category,
      method: input.method,
      description: input.description,
      clientId: input.clientId || null,
      date: dateOnly(input.date),
    },
  });
  revalidatePath("/admin/accounting");
}

export async function createContractAction(formData: FormData) {
  await requireAdmin();
  const raw = values(formData);
  const input = contractSchema.parse(raw);
  const generated = generateArabicContract(raw);
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database is not configured.");
  const client = await upsertClient({
    fullName: input.clientName,
    companyName: input.clientCompanyName,
    phone: input.clientPhone,
    email: input.clientEmail,
  });
  await prisma.contract.create({
    data: {
      type: input.type,
      status: input.status,
      title: generated.title,
      body: generated.body,
      clientId: client.id,
      totalPrice: input.totalPrice,
      deposit: input.depositAmount,
      remaining: input.remainingAmount,
    },
  });
  revalidatePath("/admin/contracts");
}
