"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import { clearAdminSession, createAdminSession, ensureUserAccount, getSessionEmail, isAdminEmail, requireAdmin, validateAdminCredentials } from "./auth";
import { combineDateTime, dateOnly, endAfterHours } from "./dates";
import { getPrisma } from "./prisma";
import { adminBookingSchema, adminMeetingSchema, adminStudioBookingSchema, bookingStatusUpdateSchema, clientDeleteSchema, clientUpdateSchema, companySettingsSchema, contractSchema, expenseDeleteSchema, expenseSchema, expenseUpdateSchema, manualClientSchema, meetingBookingSchema, paymentDeleteSchema, paymentSchema, paymentUpdateSchema, studioBookingSchema } from "./validation";
import { generateArabicContract } from "./contracts";
import { createCalendarEventWithMeet, updateCalendarEvent, cancelCalendarEvent } from "./google-calendar";
import { notifyNewBooking, notifyBookingStatusChange } from "./notifications";

function values(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

async function upsertClient(data: { fullName: string; companyName?: string; phone: string; whatsapp?: string; email: string; clientType?: string }) {
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database is not configured. Add DATABASE_URL before using forms.");
  const existing = await prisma.client.findFirst({ where: { OR: [{ email: data.email }, { phone: data.phone }] } });
  if (existing) {
    const emailOwner = existing.email === data.email ? existing : await prisma.client.findUnique({ where: { email: data.email } });
    return prisma.client.update({
      where: { id: existing.id },
      data: {
        fullName: data.fullName,
        companyName: data.companyName || null,
        phone: data.phone,
        whatsapp: data.whatsapp || null,
        email: !emailOwner || emailOwner.id === existing.id ? data.email : existing.email,
        clientType: data.clientType || existing.clientType,
      },
    });
  }
  return prisma.client.create({ data: { fullName: data.fullName, companyName: data.companyName || null, phone: data.phone, whatsapp: data.whatsapp || null, email: data.email, clientType: data.clientType || null } });
}

async function getOrCreateAdminClient(input: { clientId?: string; fullName: string; companyName?: string; phone: string; whatsapp?: string; email: string }) {
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database is not configured.");
  if (input.clientId) {
    const client = await prisma.client.findUnique({ where: { id: input.clientId } });
    if (client) return client;
  }
  return upsertClient(input);
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

export async function updateProfileAction(_prev: { error?: string; success?: string } | undefined, formData: FormData) {
  const email = await getSessionEmail();
  if (!email) return { error: "Not logged in." };
  const name = String(formData.get("name") || "").trim();
  if (name.length < 2) return { error: "Name must be at least 2 characters." };
  const prisma = getPrisma();
  if (!prisma) return { error: "Database is not configured." };
  try {
    await prisma.user.update({ where: { email }, data: { name } });
    return { success: "Profile updated." };
  } catch {
    return { error: "Could not update profile." };
  }
}

export async function changePasswordAction(_prev: { error?: string; success?: string } | undefined, formData: FormData) {
  const email = await getSessionEmail();
  if (!email) return { error: "Not logged in." };
  const current = String(formData.get("currentPassword") || "");
  const newPass = String(formData.get("newPassword") || "");
  const confirm = String(formData.get("confirmPassword") || "");
  if (newPass.length < 8) return { error: "New password must be at least 8 characters." };
  if (newPass !== confirm) return { error: "Passwords do not match." };
  const prisma = getPrisma();
  if (!prisma) return { error: "Database is not configured." };
  try {
    const user = await prisma.user.findUnique({ where: { email }, select: { passwordHash: true } });
    if (!user?.passwordHash) return { error: "Cannot change password for this account." };
    const { compare } = await import("bcryptjs");
    if (!(await compare(current, user.passwordHash))) return { error: "Current password is incorrect." };
    const { hash } = await import("bcryptjs");
    await prisma.user.update({ where: { email }, data: { passwordHash: await hash(newPass, 12) } });
    return { success: "Password changed." };
  } catch {
    return { error: "Could not change password." };
  }
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin");
}

export async function createClientAction(formData: FormData) {
  await requireAdmin();
  const parsed = manualClientSchema.safeParse(values(formData));
  if (!parsed.success) redirect("/admin/clients?error=invalid-client");
  const input = parsed.data;
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database is not configured.");
  await prisma.client.upsert({
    where: { email: input.email },
    update: {
      fullName: input.fullName,
      companyName: input.companyName || null,
      phone: input.phone,
      whatsapp: input.whatsapp || null,
      address: input.address || null,
      taxId: input.taxId || null,
      commercialRegistrationNumber: input.commercialRegistrationNumber || null,
      clientType: input.clientType || null,
      leadSource: input.leadSource || null,
      pipelineStatus: input.pipelineStatus || "New Lead",
      assignedTeamMember: input.assignedTeamMember || null,
      notes: input.notes || null,
    },
    create: {
      fullName: input.fullName,
      companyName: input.companyName || null,
      phone: input.phone,
      whatsapp: input.whatsapp || null,
      email: input.email,
      address: input.address || null,
      taxId: input.taxId || null,
      commercialRegistrationNumber: input.commercialRegistrationNumber || null,
      clientType: input.clientType || null,
      leadSource: input.leadSource || null,
      pipelineStatus: input.pipelineStatus || "New Lead",
      assignedTeamMember: input.assignedTeamMember || null,
      notes: input.notes || null,
    },
  });
  revalidatePath("/admin/clients");
}

export async function updateClientAction(formData: FormData) {
  await requireAdmin();
  const parsed = clientUpdateSchema.safeParse(values(formData));
  if (!parsed.success) redirect("/admin/clients?error=invalid-client");
  const input = parsed.data;
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database is not configured.");
  await prisma.client.update({
    where: { id: input.clientId },
    data: {
      fullName: input.fullName,
      companyName: input.companyName || null,
      phone: input.phone,
      whatsapp: input.whatsapp || null,
      email: input.email,
      address: input.address || null,
      taxId: input.taxId || null,
      commercialRegistrationNumber: input.commercialRegistrationNumber || null,
      clientType: input.clientType || null,
      leadSource: input.leadSource || null,
      pipelineStatus: input.pipelineStatus || "New Lead",
      assignedTeamMember: input.assignedTeamMember || null,
      notes: input.notes || null,
    },
  });
  revalidatePath("/admin/clients");
}

export async function deleteClientAction(formData: FormData) {
  await requireAdmin();
  const input = clientDeleteSchema.parse(values(formData));
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database is not configured.");
  await prisma.client.delete({ where: { id: input.clientId } });
  revalidatePath("/admin/clients");
}

export async function createAdminMeetingAction(formData: FormData) {
  await requireAdmin();
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database is not configured.");

  const raw = values(formData);
  const selectedClientId = String(raw.clientId || "");
  if (selectedClientId) {
    const selectedClient = await prisma.client.findUnique({ where: { id: selectedClientId } });
    if (selectedClient) {
      raw.fullName ||= selectedClient.fullName;
      raw.companyName ||= selectedClient.companyName || "";
      raw.phone ||= selectedClient.phone;
      raw.whatsapp ||= selectedClient.whatsapp || "";
      raw.email ||= selectedClient.email;
    }
  }

  const parsed = adminMeetingSchema.safeParse(raw);
  if (!parsed.success) redirect("/admin/meetings?error=invalid-meeting");

  const input = parsed.data;
  const client = await getOrCreateAdminClient(input);
  const startTime = combineDateTime(input.date, input.time);
  const endTime = endAfterHours(startTime, input.durationHours);

  let meetingLink = input.meetingLink || null;
  let googleEventId: string | null = null;

  if (input.meetingType === "Google Meeting" && !meetingLink) {
    const result = await createCalendarEventWithMeet({
      summary: `Meeting with ${input.fullName}`,
      description: input.notes || "True Level Production meeting",
      startTime,
      endTime,
      attendeeEmail: input.email,
    });
    if (result) {
      meetingLink = result.hangoutLink;
      googleEventId = result.eventId;
    }
  }

  await prisma.booking.create({
    data: {
      type: input.meetingType === "Google Meeting" ? "GOOGLE_MEETING" : "COMPANY_MEETING",
      status: input.status,
      clientId: client.id,
      date: dateOnly(input.date),
      startTime,
      endTime,
      durationHours: input.durationHours,
      serviceType: input.serviceType,
      meetingType: input.meetingType,
      meetingLocation: input.meetingLocation || null,
      meetingLink,
      googleEventId,
      assignedTeamMember: input.assignedTeamMember || null,
      notes: input.notes || null,
      internalNotes: input.internalNotes || null,
    },
  });
  revalidatePath("/admin/meetings");
  revalidatePath("/admin/bookings");
  redirect("/admin/meetings?saved=meeting");
}

export async function createAdminStudioBookingAction(formData: FormData) {
  await requireAdmin();
  const input = adminStudioBookingSchema.parse(values(formData));
  const durationHours = input.durationType === "HALF_DAY" ? 6 : input.durationType === "FULL_DAY" ? 12 : input.durationHours;
  const startTime = combineDateTime(input.date, input.startTime);
  const endTime = endAfterHours(startTime, durationHours);
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database is not configured.");
  const conflict = await prisma.booking.findFirst({
    where: { type: "STUDIO", studioSetup: input.studioSetup, status: { in: ["PENDING", "APPROVED"] }, startTime: { lt: endTime }, endTime: { gt: startTime } },
    select: { id: true },
  });
  if (conflict) throw new Error("This studio setup is already booked for the selected time.");
  const client = await getOrCreateAdminClient(input);
  const price = input.price ?? 0;
  const deposit = input.deposit ?? 0;
  await prisma.booking.create({
    data: {
      type: "STUDIO",
      status: input.status,
      clientId: client.id,
      date: dateOnly(input.date),
      startTime,
      endTime,
      durationHours,
      studioSetup: input.studioSetup,
      bookingSubtype: input.durationType,
      bookingPurpose: input.bookingPurpose,
      peopleCount: input.peopleCount,
      price,
      deposit,
      remainingAmount: Math.max(price - deposit, 0),
      paymentStatus: input.paymentStatus,
      notes: input.notes || null,
      internalNotes: input.internalNotes || null,
    },
  });
  revalidatePath("/admin/studio");
  revalidatePath("/admin/bookings");
}

export async function updateBookingStatusAction(formData: FormData) {
  await requireAdmin();
  const input = bookingStatusUpdateSchema.parse(values(formData));
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database is not configured.");

  const booking = await prisma.booking.findUnique({
    where: { id: input.bookingId },
    select: { googleEventId: true, type: true },
  });

  if (booking?.googleEventId && ["CANCELLED", "REJECTED"].includes(input.status)) {
    await cancelCalendarEvent(booking.googleEventId);
  }

  await prisma.booking.update({ where: { id: input.bookingId }, data: { status: input.status, googleEventId: ["CANCELLED", "REJECTED"].includes(input.status) ? null : undefined } });
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/meetings");
  revalidatePath("/admin/studio");
}

export async function updateCompanySettingsAction(_prev: { error?: string; success?: string } | FormData | undefined, maybeFormData?: FormData) {
  await requireAdmin();
  const formData = maybeFormData ?? (_prev instanceof FormData ? _prev : null);
  if (!formData) return { error: "Settings form data is missing." };
  const parsed = companySettingsSchema.safeParse(values(formData));
  if (!parsed.success) return { error: "Please check the settings fields and try again." };
  const prisma = getPrisma();
  if (!prisma) return { error: "Database is not configured." };
  try {
    for (const [key, value] of Object.entries(parsed.data)) {
      await prisma.companySettings.upsert({
        where: { key },
        update: { value: value == null ? "" : String(value) },
        create: { key, value: value == null ? "" : String(value) },
      });
    }
    revalidatePath("/admin/settings");
    revalidatePath("/admin/contracts");
    return { success: "Settings saved successfully." };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown settings save error";
    console.error("Company settings save failed", { message });
    return { error: "Could not save settings. Check database connection and try again." };
  }
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
      status: "PENDING",
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
      status: "PENDING",
      clientId: client.id,
      date: dateOnly(input.date),
      startTime,
      endTime,
      durationHours,
      studioSetup: input.studioSetup,
      bookingSubtype: input.durationType,
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
  let googleEventId = current.googleEventId;
  if (input.status === "APPROVED" && current.type === "GOOGLE_MEETING" && !meetingLink) {
    if (googleEventId) {
      await updateCalendarEvent({
        eventId: googleEventId,
        summary: `Meeting with ${current.client.fullName}`,
        description: current.notes || "True Level Production meeting",
        startTime: current.startTime,
        endTime: current.endTime,
        attendeeEmail: current.client.email,
      });
    } else {
      const result = await createCalendarEventWithMeet({
        summary: `Meeting with ${current.client.fullName}`,
        description: current.notes || "True Level Production meeting",
        startTime: current.startTime,
        endTime: current.endTime,
        attendeeEmail: current.client.email,
      });
      if (result) {
        meetingLink = result.hangoutLink ?? undefined;
        googleEventId = result.eventId;
      }
    }
  }

  if (googleEventId && ["CANCELLED", "REJECTED"].includes(input.status) && !["CANCELLED", "REJECTED"].includes(current.status)) {
    await cancelCalendarEvent(googleEventId);
    googleEventId = null;
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
      googleEventId,
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

export async function updatePaymentAction(formData: FormData) {
  await requireAdmin();
  const input = paymentUpdateSchema.parse(values(formData));
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database is not configured.");
  await prisma.payment.update({
    where: { id: input.paymentId },
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

export async function deletePaymentAction(formData: FormData) {
  await requireAdmin();
  const input = paymentDeleteSchema.parse(values(formData));
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database is not configured.");
  await prisma.payment.delete({ where: { id: input.paymentId } });
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

export async function updateExpenseAction(formData: FormData) {
  await requireAdmin();
  const input = expenseUpdateSchema.parse(values(formData));
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database is not configured.");
  await prisma.expense.update({
    where: { id: input.expenseId },
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

export async function deleteExpenseAction(formData: FormData) {
  await requireAdmin();
  const input = expenseDeleteSchema.parse(values(formData));
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database is not configured.");
  await prisma.expense.delete({ where: { id: input.expenseId } });
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
      body: input.bodyOverride || generated.body,
      clientId: client.id,
      totalPrice: input.totalPrice,
      deposit: input.depositAmount,
      remaining: input.remainingAmount,
    },
  });
  revalidatePath("/admin/contracts");
}
