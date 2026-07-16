"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import { clearAdminSession, createAdminSession, ensureUserAccount, getSessionEmail, isAdminEmail, requireAdmin, validateAdminCredentials } from "./auth";
import { combineDateTime, dateOnly, endAfterHours } from "./dates";
import { getPrisma } from "./prisma";
import { adminBookingSchema, adminMeetingSchema, adminStudioBookingSchema, bookingDeleteSchema, bookingStatusUpdateSchema, clientDeleteSchema, clientUpdateSchema, companySettingsSchema, contractDeleteSchema, contractSchema, contractUpdateSchema, expenseDeleteSchema, expenseSchema, expenseUpdateSchema, invoiceDeleteSchema, invoicePaymentSchema, invoiceSchema, manualClientSchema, meetingBookingSchema, paymentDeleteSchema, paymentSchema, paymentUpdateSchema, quotationDeleteSchema, quotationSchema, quotationUpdateSchema, studioBookingSchema } from "./validation";
import { generateArabicContract } from "./contracts";
import { createCalendarEvent, updateCalendarEvent, cancelCalendarEvent } from "./google-calendar";
import { notifyNewBooking, notifyBookingStatusChange } from "./notifications";

function values(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

function meetingTitle(clientName: string, companyName?: string | null) {
  return companyName ? `Meeting with ${clientName} (${companyName})` : `Meeting with ${clientName}`;
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
    const result = await createCalendarEvent({
      summary: meetingTitle(input.fullName, input.companyName),
      description: input.notes || "True Level Production meeting",
      startTime,
      endTime,
    });
    if (result?.eventId) googleEventId = result.eventId;
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
  const raw = values(formData);
  const input = bookingStatusUpdateSchema.parse(raw);
  const returnTo = String(raw.returnTo || "");
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database is not configured.");

  const booking = await prisma.booking.findUnique({
    where: { id: input.bookingId },
    include: { client: true },
  });

  if (booking?.googleEventId && ["CANCELLED", "REJECTED"].includes(input.status)) {
    await cancelCalendarEvent(booking.googleEventId);
  }

  let meetingLink: string | null | undefined = undefined;
  let googleEventId: string | null | undefined = ["CANCELLED", "REJECTED"].includes(input.status) ? null : undefined;

  if (booking && input.status === "APPROVED" && booking.type === "GOOGLE_MEETING" && !booking.meetingLink && !booking.googleEventId) {
    const result = await createCalendarEvent({
      summary: meetingTitle(booking.client.fullName, booking.client.companyName),
      description: booking.notes || "True Level Production meeting",
      startTime: booking.startTime,
      endTime: booking.endTime,
    });
    if (result?.eventId) googleEventId = result.eventId;
  }

  await prisma.booking.update({ where: { id: input.bookingId }, data: { status: input.status, meetingLink, googleEventId } });
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/meetings");
  revalidatePath("/admin/studio");
  if (returnTo === "/admin/meetings") redirect(`/admin/meetings?updated=${input.status.toLowerCase()}`);
}

export async function deleteMeetingAction(formData: FormData) {
  await requireAdmin();
  const input = bookingDeleteSchema.parse(values(formData));
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database is not configured.");

  const booking = await prisma.booking.findUnique({
    where: { id: input.bookingId },
    select: { googleEventId: true, type: true },
  });
  if (!booking || !["GOOGLE_MEETING", "COMPANY_MEETING"].includes(booking.type)) redirect("/admin/meetings?error=delete-meeting");

  if (booking.googleEventId) await cancelCalendarEvent(booking.googleEventId);
  await prisma.booking.delete({ where: { id: input.bookingId } });
  revalidatePath("/admin/meetings");
  revalidatePath("/admin/bookings");
  redirect("/admin/meetings?deleted=meeting");
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
        summary: meetingTitle(current.client.fullName, current.client.companyName),
        description: current.notes || "True Level Production meeting",
        startTime: current.startTime,
        endTime: current.endTime,
      });
    } else {
      const result = await createCalendarEvent({
        summary: meetingTitle(current.client.fullName, current.client.companyName),
        description: current.notes || "True Level Production meeting",
        startTime: current.startTime,
        endTime: current.endTime,
      });
      if (result?.eventId) googleEventId = result.eventId;
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
  const parsed = contractSchema.safeParse(raw);
  if (!parsed.success) {
    const msgs = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    return { error: msgs || "بيانات غير صالحة. تأكد من ملء جميع الحقول المطلوبة." };
  }
  const input = parsed.data;
  const prisma = getPrisma();
  if (!prisma) return { error: "Database is not configured." };
  try {
    const generated = generateArabicContract(input);
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
    return { success: "تم حفظ العقد بنجاح" };
  } catch (e) {
    console.error("createContractAction", e);
    return { error: "حدث خطأ أثناء حفظ العقد. يرجى المحاولة مرة أخرى." };
  }
}

export async function updateContractAction(formData: FormData) {
  await requireAdmin();
  const raw = values(formData);
  const input = contractUpdateSchema.parse(raw);
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database is not configured.");
  const data: Record<string, unknown> = {};
  if (input.status) {
    data.status = input.status;
    if (input.status === "SIGNED") data.signedAt = new Date();
  }
  if (input.body) data.body = input.body;
  await prisma.contract.update({ where: { id: input.contractId }, data });
  revalidatePath("/admin/contracts");
}

export async function deleteContractAction(formData: FormData) {
  await requireAdmin();
  const input = contractDeleteSchema.parse(values(formData));
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database is not configured.");
  await prisma.contract.delete({ where: { id: input.contractId } });
  revalidatePath("/admin/contracts");
  redirect("/admin/contracts");
}

export async function createInvoiceAction(formData: FormData): Promise<{ success?: string; error?: string; invoiceId?: string }> {
  await requireAdmin();
  const raw = values(formData);
  const rawItems = (() => { try { return JSON.parse(String(raw.items || "[]")); } catch { return []; } })();
  const parsed = invoiceSchema.safeParse({ ...raw, items: rawItems });
  if (!parsed.success) {
    const msgs = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    return { error: msgs || "بيانات غير صالحة. تأكد من ملء جميع الحقول المطلوبة." };
  }
  const input = parsed.data;
  const prisma = getPrisma();
  if (!prisma) return { error: "Database is not configured." };
  try {
    const count = await prisma.invoice.count();
    const invoiceNo = `INV-${String(count + 1).padStart(4, "0")}`;
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNo,
        clientId: input.clientId,
        bookingId: input.bookingId || null,
        projectId: input.projectId || null,
        contractId: input.contractId || null,
        status: input.status,
        paymentStatus: input.paidAmount >= input.total ? "PAID" : input.paidAmount > 0 ? "PARTIALLY_PAID" : "UNPAID",
        invoiceDate: new Date(`${input.invoiceDate}T00:00:00`),
        dueDate: input.dueDate ? new Date(`${input.dueDate}T00:00:00`) : null,
        currency: input.currency,
        subtotal: input.subtotal,
        discount: input.discount,
        taxRate: input.taxRate,
        taxAmount: input.taxAmount,
        total: input.total,
        paidAmount: input.paidAmount,
        remainingAmount: input.remainingAmount,
        notes: input.notes || null,
        terms: input.terms || null,
        items: { create: input.items.map((item) => ({ description: item.description, quantity: item.quantity, unitPrice: item.unitPrice, discount: item.discount, total: item.total })) },
      },
      include: { items: true },
    });
    revalidatePath("/admin/accounting");
    return { success: "تم حفظ الفاتورة بنجاح", invoiceId: invoice.id };
  } catch (e) {
    console.error("createInvoiceAction", e);
    return { error: "تعذر حفظ الفاتورة. برجاء مراجعة البيانات والمحاولة مرة أخرى." };
  }
}

export async function updateInvoiceStatusAction(formData: FormData): Promise<{ success?: string; error?: string }> {
  await requireAdmin();
  const invoiceId = String(formData.get("invoiceId") || "");
  const status = String(formData.get("status") || "");
  if (!invoiceId || !status) return { error: "بيانات غير صالحة." };
  const prisma = getPrisma();
  if (!prisma) return { error: "Database is not configured." };
  try {
    const data: Record<string, unknown> = { status };
    if (status === "SENT") data.sentAt = new Date();
    await prisma.invoice.update({ where: { id: invoiceId }, data });
    revalidatePath("/admin/accounting");
    return { success: "تم تحديث حالة الفاتورة بنجاح" };
  } catch (e) {
    console.error("updateInvoiceStatusAction", e);
    return { error: "تعذر تحديث حالة الفاتورة." };
  }
}

export async function addInvoicePaymentAction(formData: FormData): Promise<{ success?: string; error?: string }> {
  await requireAdmin();
  const raw = values(formData);
  const parsed = invoicePaymentSchema.safeParse(raw);
  if (!parsed.success) return { error: "بيانات الدفع غير صالحة." };
  const input = parsed.data;
  const prisma = getPrisma();
  if (!prisma) return { error: "Database is not configured." };
  try {
    const invoice = await prisma.invoice.findUnique({ where: { id: input.invoiceId } });
    if (!invoice) return { error: "الفاتورة غير موجودة." };
    const newPaid = Number(invoice.paidAmount) + input.amount;
    const total = Number(invoice.total);
    const paymentStatus = newPaid >= total ? "PAID" : newPaid > 0 ? "PARTIALLY_PAID" : "UNPAID";
    await prisma.invoice.update({
      where: { id: input.invoiceId },
      data: { paidAmount: newPaid, remainingAmount: Math.max(0, total - newPaid), paymentStatus },
    });
    await prisma.payment.create({
      data: {
        amount: input.amount,
        method: input.method,
        status: "PAID" as const,
        description: input.description || `دفع فاتورة ${invoice.invoiceNo}`,
        clientId: invoice.clientId,
        invoiceId: invoice.id,
        date: new Date(`${input.paymentDate}T00:00:00`),
      },
    });
    revalidatePath("/admin/accounting");
    return { success: "تم تسجيل الدفع بنجاح" };
  } catch (e) {
    console.error("addInvoicePaymentAction", e);
    return { error: "تعذر تسجيل الدفع." };
  }
}

export async function deleteInvoiceAction(formData: FormData): Promise<{ success?: string; error?: string }> {
  await requireAdmin();
  const input = invoiceDeleteSchema.parse(values(formData));
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database is not configured.");
  try {
    await prisma.invoice.delete({ where: { id: input.invoiceId } });
    revalidatePath("/admin/accounting");
    return { success: "تم حذف الفاتورة بنجاح" };
  } catch (e) {
    console.error("deleteInvoiceAction", e);
    return { error: "تعذر حذف الفاتورة." };
  }
}

export async function createQuotationAction(formData: FormData): Promise<{ success?: string; error?: string; quotationId?: string }> {
  await requireAdmin();
  const raw = values(formData);
  const rawItems = (() => { try { return JSON.parse(String(raw.items || "[]")); } catch { return []; } })();
  const parsed = quotationSchema.safeParse({ ...raw, items: rawItems });
  if (!parsed.success) {
    const msgs = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    return { error: msgs || "بيانات غير صالحة. تأكد من ملء جميع الحقول المطلوبة." };
  }
  const input = parsed.data;
  const prisma = getPrisma();
  if (!prisma) return { error: "Database is not configured." };
  try {
    const count = await prisma.quotation.count();
    const quotationNo = `QTN-${String(count + 1).padStart(4, "0")}`;
    const quotation = await prisma.quotation.create({
      data: {
        quotationNo,
        clientId: input.clientId,
        bookingId: input.bookingId || null,
        projectId: input.projectId || null,
        status: input.status,
        serviceType: input.serviceType || null,
        currency: input.currency,
        totalAmount: input.subtotal,
        discount: input.discount,
        taxRate: input.taxRate,
        taxAmount: input.taxAmount,
        grandTotal: input.grandTotal,
        notes: input.notes || null,
        terms: input.terms || null,
        validUntil: input.validUntil ? new Date(`${input.validUntil}T00:00:00`) : null,
        items: { create: input.items.map((item) => ({ description: item.description, quantity: item.quantity, unitPrice: item.unitPrice, discount: item.discount, total: item.total })) },
      },
      include: { items: true },
    });
    revalidatePath("/admin/quotations");
    return { success: "تم حفظ عرض السعر بنجاح", quotationId: quotation.id };
  } catch (e) {
    console.error("createQuotationAction", e);
    return { error: "تعذر حفظ عرض السعر. برجاء مراجعة البيانات والمحاولة مرة أخرى." };
  }
}

export async function updateQuotationStatusAction(formData: FormData): Promise<{ success?: string; error?: string }> {
  await requireAdmin();
  const raw = values(formData);
  const parsed = quotationUpdateSchema.safeParse(raw);
  if (!parsed.success) return { error: "بيانات غير صالحة." };
  const input = parsed.data;
  const prisma = getPrisma();
  if (!prisma) return { error: "Database is not configured." };
  try {
    const data: Record<string, unknown> = {};
    if (input.status) {
      data.status = input.status;
      if (input.status === "SENT") data.sentAt = new Date();
      else if (input.status === "ACCEPTED") data.acceptedAt = new Date();
      else if (input.status === "REJECTED") { data.rejectedAt = new Date(); data.rejectedReason = input.rejectedReason || null; }
    }
    await prisma.quotation.update({ where: { id: input.quotationId }, data });
    revalidatePath("/admin/quotations");
    return { success: "تم تحديث حالة عرض السعر بنجاح" };
  } catch (e) {
    console.error("updateQuotationStatusAction", e);
    return { error: "تعذر تحديث حالة عرض السعر." };
  }
}

export async function deleteQuotationAction(formData: FormData): Promise<{ success?: string; error?: string }> {
  await requireAdmin();
  const input = quotationDeleteSchema.parse(values(formData));
  const prisma = getPrisma();
  if (!prisma) return { error: "Database is not configured." };
  try {
    await prisma.quotation.delete({ where: { id: input.quotationId } });
    revalidatePath("/admin/quotations");
    return { success: "تم حذف عرض السعر بنجاح" };
  } catch (e) {
    console.error("deleteQuotationAction", e);
    return { error: "تعذر حذف عرض السعر." };
  }
}

export async function runCalendarDiagnosticAction(): Promise<{ steps: { step: string; success: boolean; detail: string }[] }> {
  await requireAdmin();
  const { diagnoseGoogleCalendar } = await import("./google-calendar");
  const steps = await diagnoseGoogleCalendar();
  return { steps };
}

// ─── Workflow: Team Members ───

export async function createTeamMemberAction(formData: FormData) {
  await requireAdmin();
  const name = formData.get("name") as string;
  if (!name?.trim()) return;
  try {
    const prisma = getPrisma();
    if (!prisma) return;
    await prisma.teamMember.create({ data: { name: name.trim(), role: (formData.get("role") as string) || null, department: (formData.get("department") as string) || null, email: (formData.get("email") as string) || null, phone: (formData.get("phone") as string) || null, notes: (formData.get("notes") as string) || null } });
    revalidatePath("/admin/workflow");
  } catch { /* empty */ }
}

export async function updateTeamMemberAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return;
  try {
    const prisma = getPrisma();
    if (!prisma) return;
    const data: Record<string, unknown> = {};
    for (const key of ["name", "role", "department", "email", "phone", "notes"]) {
      const v = formData.get(key) as string;
      if (v !== null) data[key] = v.trim() || null;
    }
    await prisma.teamMember.update({ where: { id }, data });
    revalidatePath("/admin/workflow");
  } catch { /* empty */ }
}

export async function toggleTeamMemberActiveAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return;
  try {
    const prisma = getPrisma();
    if (!prisma) return;
    const member = await prisma.teamMember.findUnique({ where: { id } });
    if (!member) return;
    await prisma.teamMember.update({ where: { id }, data: { active: !member.active } });
    revalidatePath("/admin/workflow");
  } catch { /* empty */ }
}

// ─── Workflow: Projects ───

export async function createWorkflowProjectAction(formData: FormData) {
  await requireAdmin();
  const title = formData.get("title") as string;
  if (!title?.trim()) return;
  try {
    const prisma = getPrisma();
    if (!prisma) return;
    await prisma.workflowProject.create({
      data: {
        title: title.trim(),
        clientName: (formData.get("clientName") as string) || null,
        serviceType: (formData.get("serviceType") as string) || null,
        stage: (formData.get("stage") as string) || "NEW_LEAD",
        priority: (formData.get("priority") as string) || "NORMAL",
        ownerId: (formData.get("ownerId") as string) || null,
        dueDate: (formData.get("dueDate") as string) ? new Date(formData.get("dueDate") as string) : null,
        notes: (formData.get("notes") as string) || null,
        quotationId: (formData.get("quotationId") as string) || null,
        contractId: (formData.get("contractId") as string) || null,
        invoiceId: (formData.get("invoiceId") as string) || null,
        bookingId: (formData.get("bookingId") as string) || null,
      },
    });
    revalidatePath("/admin/workflow");
  } catch { /* empty */ }
}

export async function updateWorkflowProjectAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return;
  try {
    const prisma = getPrisma();
    if (!prisma) return;
    const data: Record<string, unknown> = {};
    for (const key of ["title", "clientName", "serviceType", "stage", "priority", "notes", "quotationId", "contractId", "invoiceId", "bookingId"]) {
      const v = formData.get(key) as string;
      if (v !== null) data[key] = v.trim() || null;
    }
    const ownerId = formData.get("ownerId") as string;
    if (ownerId !== null) data.ownerId = ownerId || null;
    const dueDate = formData.get("dueDate") as string;
    if (dueDate !== null) data.dueDate = dueDate ? new Date(dueDate) : null;
    await prisma.workflowProject.update({ where: { id }, data });
    revalidatePath("/admin/workflow");
  } catch { /* empty */ }
}

export async function updateWorkflowStageAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const stage = formData.get("stage") as string;
  if (!id || !stage) return;
  try {
    const prisma = getPrisma();
    if (!prisma) return;
    await prisma.workflowProject.update({ where: { id }, data: { stage } });
    revalidatePath("/admin/workflow");
  } catch { /* empty */ }
}

export async function archiveWorkflowProjectAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return;
  try {
    const prisma = getPrisma();
    if (!prisma) return;
    await prisma.workflowProject.update({ where: { id }, data: { archived: true } });
    revalidatePath("/admin/workflow");
  } catch { /* empty */ }
}

// ─── Workflow: Tasks ───

export async function createWorkflowTaskAction(formData: FormData) {
  await requireAdmin();
  const title = formData.get("title") as string;
  if (!title?.trim()) return;
  try {
    const prisma = getPrisma();
    if (!prisma) return;
    await prisma.workflowTask.create({
      data: {
        title: title.trim(),
        description: (formData.get("description") as string) || null,
        projectId: (formData.get("projectId") as string) || null,
        assigneeId: (formData.get("assigneeId") as string) || null,
        department: (formData.get("department") as string) || null,
        status: (formData.get("status") as string) || "TODO",
        priority: (formData.get("priority") as string) || "NORMAL",
        dueDate: (formData.get("dueDate") as string) ? new Date(formData.get("dueDate") as string) : null,
        notes: (formData.get("notes") as string) || null,
      },
    });
    revalidatePath("/admin/workflow");
  } catch { /* empty */ }
}

export async function updateWorkflowTaskAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return;
  try {
    const prisma = getPrisma();
    if (!prisma) return;
    const data: Record<string, unknown> = {};
    for (const key of ["title", "description", "department", "status", "priority", "notes"]) {
      const v = formData.get(key) as string;
      if (v !== null) data[key] = v.trim() || null;
    }
    const projectId = formData.get("projectId") as string;
    if (projectId !== null) data.projectId = projectId || null;
    const assigneeId = formData.get("assigneeId") as string;
    if (assigneeId !== null) data.assigneeId = assigneeId || null;
    const dueDate = formData.get("dueDate") as string;
    if (dueDate !== null) data.dueDate = dueDate ? new Date(dueDate) : null;
    if (data.status === "DONE") data.completedAt = new Date();
    await prisma.workflowTask.update({ where: { id }, data });
    revalidatePath("/admin/workflow");
  } catch { /* empty */ }
}

export async function deleteWorkflowTaskAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return;
  try {
    const prisma = getPrisma();
    if (!prisma) return;
    await prisma.workflowTask.delete({ where: { id } });
    revalidatePath("/admin/workflow");
  } catch { /* empty */ }
}

// ─── Workflow: Approvals ───

export async function createApprovalAction(formData: FormData) {
  await requireAdmin();
  const title = formData.get("title") as string;
  if (!title?.trim()) return;
  try {
    const prisma = getPrisma();
    if (!prisma) return;
    await prisma.workflowApproval.create({
      data: {
        title: title.trim(),
        projectId: (formData.get("projectId") as string) || null,
        clientName: (formData.get("clientName") as string) || null,
        status: (formData.get("status") as string) || "NOT_SENT",
        sentDate: (formData.get("sentDate") as string) ? new Date(formData.get("sentDate") as string) : null,
        dueDate: (formData.get("dueDate") as string) ? new Date(formData.get("dueDate") as string) : null,
        notes: (formData.get("notes") as string) || null,
      },
    });
    revalidatePath("/admin/workflow");
  } catch { /* empty */ }
}

export async function updateApprovalStatusAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  if (!id || !status) return;
  try {
    const prisma = getPrisma();
    if (!prisma) return;
    await prisma.workflowApproval.update({ where: { id }, data: { status, notes: (formData.get("notes") as string) || null } });
    revalidatePath("/admin/workflow");
  } catch { /* empty */ }
}

// ─── Workflow: Deliveries ───

export async function createDeliveryAction(formData: FormData) {
  await requireAdmin();
  const title = formData.get("title") as string;
  if (!title?.trim()) return;
  try {
    const prisma = getPrisma();
    if (!prisma) return;
    await prisma.workflowDelivery.create({
      data: {
        title: title.trim(),
        projectId: (formData.get("projectId") as string) || null,
        deliverableType: (formData.get("deliverableType") as string) || null,
        deliveryLink: (formData.get("deliveryLink") as string) || null,
        status: (formData.get("status") as string) || "PREPARING",
        deliveryDate: (formData.get("deliveryDate") as string) ? new Date(formData.get("deliveryDate") as string) : null,
        notes: (formData.get("notes") as string) || null,
      },
    });
    revalidatePath("/admin/workflow");
  } catch { /* empty */ }
}

export async function updateDeliveryStatusAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  if (!id || !status) return;
  try {
    const prisma = getPrisma();
    if (!prisma) return;
    await prisma.workflowDelivery.update({ where: { id }, data: { status, notes: (formData.get("notes") as string) || null } });
    revalidatePath("/admin/workflow");
  } catch { /* empty */ }
}

// ─── Workflow Notifications ───

export async function markNotificationReadAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return;
  try {
    const prisma = getPrisma();
    if (!prisma) return;
    await prisma.workflowNotification.update({ where: { id }, data: { read: true } });
    revalidatePath("/admin/notifications");
  } catch { /* empty */ }
}

export async function createNotificationAction(formData: FormData) {
  await requireAdmin();
  const title = formData.get("title") as string;
  if (!title?.trim()) return;
  try {
    const prisma = getPrisma();
    if (!prisma) return;
    await prisma.workflowNotification.create({
      data: {
        type: (formData.get("type") as string) || "TASK_ASSIGNED",
        title: title.trim(),
        message: (formData.get("message") as string) || null,
        projectId: (formData.get("projectId") as string) || null,
        taskId: (formData.get("taskId") as string) || null,
      },
    });
    revalidatePath("/admin/notifications");
  } catch { /* empty */ }
}

// ─── Approval Requests ───

export async function createApprovalRequestAction(formData: FormData) {
  await requireAdmin();
  const title = formData.get("title") as string;
  if (!title?.trim()) return;
  try {
    const prisma = getPrisma();
    if (!prisma) return;
    await prisma.approvalRequest.create({
      data: {
        type: (formData.get("type") as string) || "QUOTATION",
        title: title.trim(),
        requestedBy: (formData.get("requestedBy") as string) || null,
        projectId: (formData.get("projectId") as string) || null,
        quotationId: (formData.get("quotationId") as string) || null,
        contractId: (formData.get("contractId") as string) || null,
        notes: (formData.get("notes") as string) || null,
      },
    });
    revalidatePath("/admin/workflow");
  } catch { /* empty */ }
}

export async function approveApprovalRequestAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return;
  try {
    const prisma = getPrisma();
    if (!prisma) return;
    await prisma.approvalRequest.update({
      where: { id },
      data: { status: "APPROVED", approvedBy: (formData.get("approvedBy") as string) || "Admin", approvedAt: new Date(), notes: (formData.get("notes") as string) || undefined },
    });
    revalidatePath("/admin/workflow");
  } catch { /* empty */ }
}

export async function rejectApprovalRequestAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return;
  try {
    const prisma = getPrisma();
    if (!prisma) return;
    await prisma.approvalRequest.update({
      where: { id },
      data: { status: "REJECTED", rejectedBy: (formData.get("rejectedBy") as string) || "Admin", rejectedAt: new Date(), notes: (formData.get("notes") as string) || undefined },
    });
    revalidatePath("/admin/workflow");
  } catch { /* empty */ }
}

// ─── Content Production ───

export async function createContentProductionAction(formData: FormData) {
  await requireAdmin();
  const title = formData.get("title") as string;
  if (!title?.trim()) return;
  try {
    const prisma = getPrisma();
    if (!prisma) return;
    await prisma.contentProduction.create({
      data: {
        title: title.trim(),
        contentType: (formData.get("contentType") as string) || "REEL",
        stage: (formData.get("stage") as string) || "IDEA",
        platform: (formData.get("platform") as string) || null,
        script: (formData.get("script") as string) || null,
        dueDate: (formData.get("dueDate") as string) ? new Date(formData.get("dueDate") as string) : null,
        projectId: (formData.get("projectId") as string) || null,
        notes: (formData.get("notes") as string) || null,
      },
    });
    revalidatePath("/admin/workflow");
  } catch { /* empty */ }
}

export async function updateContentStageAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const stage = formData.get("stage") as string;
  if (!id || !stage) return;
  try {
    const prisma = getPrisma();
    if (!prisma) return;
    const data: Record<string, unknown> = { stage };
    if (stage === "PUBLISHED") data.publishedAt = new Date();
    await prisma.contentProduction.update({ where: { id }, data });
    revalidatePath("/admin/workflow");
  } catch { /* empty */ }
}

// ─── Automation Rules ───

export async function createAutomationRuleAction(formData: FormData) {
  await requireAdmin();
  const name = formData.get("name") as string;
  if (!name?.trim()) return;
  try {
    const prisma = getPrisma();
    if (!prisma) return;
    await prisma.automationRule.create({
      data: {
        name: name.trim(),
        trigger: (formData.get("trigger") as string) || "",
        action: (formData.get("action") as string) || "{}",
        active: formData.get("active") !== "false",
      },
    });
    revalidatePath("/admin/automation");
  } catch { /* empty */ }
}

export async function toggleAutomationRuleAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return;
  try {
    const prisma = getPrisma();
    if (!prisma) return;
    const rule = await prisma.automationRule.findUnique({ where: { id } });
    if (!rule) return;
    await prisma.automationRule.update({ where: { id }, data: { active: !rule.active } });
    revalidatePath("/admin/automation");
  } catch { /* empty */ }
}

export async function deleteAutomationRuleAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return;
  try {
    const prisma = getPrisma();
    if (!prisma) return;
    await prisma.automationRule.delete({ where: { id } });
    revalidatePath("/admin/automation");
  } catch { /* empty */ }
}

// ─── Studio Operations ───

export async function createStudioRoomAction(formData: FormData) {
  await requireAdmin();
  const name = formData.get("name") as string;
  if (!name?.trim()) return;
  try {
    const prisma = getPrisma();
    if (!prisma) return;
    await prisma.studioRoom.create({ data: { name: name.trim(), type: (formData.get("type") as string) || "STUDIO" } });
    revalidatePath("/admin/studio");
  } catch { /* empty */ }
}

export async function createStudioEquipmentAction(formData: FormData) {
  await requireAdmin();
  const name = formData.get("name") as string;
  if (!name?.trim()) return;
  try {
    const prisma = getPrisma();
    if (!prisma) return;
    await prisma.studioEquipment.create({ data: { name: name.trim(), category: (formData.get("category") as string) || null } });
    revalidatePath("/admin/studio");
  } catch { /* empty */ }
}

export async function createCreatorAction(formData: FormData) {
  await requireAdmin();
  const name = formData.get("name") as string;
  if (!name?.trim()) return;
  try {
    const prisma = getPrisma();
    if (!prisma) return;
    await prisma.creator.create({
      data: {
        name: name.trim(),
        email: (formData.get("email") as string) || null,
        phone: (formData.get("phone") as string) || null,
        specialty: (formData.get("specialty") as string) || null,
      },
    });
    revalidatePath("/admin/studio");
  } catch { /* empty */ }
}

// ─── Team Member Capacity ───

export async function updateTeamMemberCapacityAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return;
  try {
    const prisma = getPrisma();
    if (!prisma) return;
    const capacity = formData.get("capacity") ? parseInt(formData.get("capacity") as string) : undefined;
    const performanceScore = formData.get("performanceScore") ? parseFloat(formData.get("performanceScore") as string) : undefined;
    const availability = (formData.get("availability") as string) || undefined;
    await prisma.teamMember.update({
      where: { id },
      data: { capacity: capacity ?? undefined, performanceScore: performanceScore ?? undefined, availability: availability ?? undefined },
    });
    revalidatePath("/admin/team-center");
  } catch { /* empty */ }
}

// ─── Roles ───

export async function createRoleAction(formData: FormData) {
  await requireAdmin();
  const name = formData.get("name") as string;
  if (!name?.trim()) return;
  try {
    const prisma = getPrisma();
    if (!prisma) return;
    await prisma.role.create({
      data: {
        name: name.trim(),
        description: (formData.get("description") as string) || null,
      },
    });
    revalidatePath("/admin/settings");
  } catch { /* empty */ }
}

export async function updateRolePermissionsAction(formData: FormData) {
  await requireAdmin();
  const roleId = formData.get("roleId") as string;
  const resource = formData.get("resource") as string;
  const action = formData.get("action") as string;
  const grant = formData.get("grant") === "true";
  if (!roleId || !resource || !action) return;
  try {
    const prisma = getPrisma();
    if (!prisma) return;
    if (grant) {
      await prisma.permission.upsert({
        where: { roleId_resource_action: { roleId, resource, action } },
        create: { roleId, resource, action },
        update: {},
      });
    } else {
      await prisma.permission.deleteMany({ where: { roleId, resource, action } });
    }
    revalidatePath("/admin/settings");
  } catch { /* empty */ }
}

// ─── Reports ───

export async function saveReportAction(formData: FormData) {
  await requireAdmin();
  const name = formData.get("name") as string;
  if (!name?.trim()) return;
  try {
    const prisma = getPrisma();
    if (!prisma) return;
    await prisma.report.create({
      data: {
        type: (formData.get("type") as string) || "REVENUE",
        name: name.trim(),
        config: (formData.get("config") as string) || null,
      },
    });
    revalidatePath("/admin/reporting");
  } catch { /* empty */ }
}

export async function deleteReportAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return;
  try {
    const prisma = getPrisma();
    if (!prisma) return;
    await prisma.report.delete({ where: { id } });
    revalidatePath("/admin/reporting");
  } catch { /* empty */ }
}

// ─── File Manager ───

export async function createFileAttachmentAction(formData: FormData) {
  await requireAdmin();
  const fileName = formData.get("fileName") as string;
  if (!fileName?.trim()) return;
  try {
    const prisma = getPrisma();
    if (!prisma) return;
    await prisma.fileAttachment.create({
      data: {
        fileName: fileName.trim(),
        originalName: (formData.get("originalName") as string) || fileName.trim(),
        mimeType: (formData.get("mimeType") as string) || null,
        fileSize: formData.get("fileSize") ? parseInt(formData.get("fileSize") as string) : null,
        url: (formData.get("url") as string) || null,
        projectId: (formData.get("projectId") as string) || null,
        clientId: (formData.get("clientId") as string) || null,
        invoiceId: (formData.get("invoiceId") as string) || null,
        uploaderName: (formData.get("uploaderName") as string) || null,
        notes: (formData.get("notes") as string) || null,
        folder: (formData.get("folder") as string) || "General",
      },
    });
    revalidatePath("/admin/files");
    if (formData.get("projectId")) revalidatePath("/admin/workflow");
  } catch { /* empty */ }
}

export async function deleteFileAttachmentAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return;
  try {
    const prisma = getPrisma();
    if (!prisma) return;
    await prisma.fileAttachment.delete({ where: { id } });
    revalidatePath("/admin/files");
    revalidatePath("/admin/workflow");
  } catch { /* empty */ }
}

// ─── Notification Engine: Auto-Trigger ───

export async function triggerNotificationAction(formData: FormData) {
  await requireAdmin();
  const title = formData.get("title") as string;
  if (!title?.trim()) return;
  try {
    const prisma = getPrisma();
    if (!prisma) return;
    await prisma.workflowNotification.create({
      data: {
        type: (formData.get("type") as string) || "CUSTOM",
        title: title.trim(),
        message: (formData.get("message") as string) || null,
        projectId: (formData.get("projectId") as string) || null,
        taskId: (formData.get("taskId") as string) || null,
        targetEmail: (formData.get("targetEmail") as string) || null,
        autoTriggered: true,
      },
    });
    revalidatePath("/admin/notifications");
  } catch { /* empty */ }
}

export async function markAllNotificationsReadAction() {
  await requireAdmin();
  try {
    const prisma = getPrisma();
    if (!prisma) return;
    await prisma.workflowNotification.updateMany({ where: { read: false }, data: { read: true, readAt: new Date() } });
    revalidatePath("/admin/notifications");
  } catch { /* empty */ }
}

export async function dismissOldNotificationsAction() {
  await requireAdmin();
  try {
    const prisma = getPrisma();
    if (!prisma) return;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await prisma.workflowNotification.deleteMany({ where: { read: true, createdAt: { lt: thirtyDaysAgo } } });
    revalidatePath("/admin/notifications");
  } catch { /* empty */ }
}

// ─── Client Portal ───

export async function createPortalUserAction(formData: FormData) {
  await requireAdmin();
  const clientId = formData.get("clientId") as string;
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  if (!clientId || !email || !password || password.length < 6) return;
  try {
    const prisma = getPrisma();
    if (!prisma) return;
    const existing = await prisma.clientPortalUser.findUnique({ where: { clientId } }).catch(() => null);
    if (existing) return;
    const { hash } = await import("bcryptjs");
    await prisma.clientPortalUser.create({
      data: { clientId, email, passwordHash: await hash(password, 12) },
    });
    revalidatePath("/admin/clients");
  } catch { /* empty */ }
}

export async function portalLoginAction(_prev: { error?: string } | undefined, formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  if (!email || !password) return { error: "Email and password required." };
  try {
    const prisma = getPrisma();
    if (!prisma) return { error: "System unavailable." };
    const user = await prisma.clientPortalUser.findUnique({ where: { email }, include: { client: true } });
    if (!user || !user.isActive) return { error: "Invalid credentials." };
    const { compare } = await import("bcryptjs");
    if (!(await compare(password, user.passwordHash))) return { error: "Invalid credentials." };
    const { cookies } = await import("next/headers");
    const c = await cookies();
    c.set("portal-token", user.id, { httpOnly: true, secure: true, sameSite: "lax", path: "/portal", maxAge: 60 * 60 * 24 });
    await prisma.clientPortalUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    redirect("/portal/dashboard");
  } catch { return { error: "Login failed." }; }
}

export async function portalLogoutAction() {
  const { cookies } = await import("next/headers");
  const c = await cookies();
  c.delete("portal-token");
  redirect("/portal");
}

// ─── Activity Log: Bulk auto-log helper ───

export async function autoLogActivity(entityType: string, entityId: string, action: string, metadata?: Record<string, unknown>) {
  try {
    const prisma = getPrisma();
    if (!prisma) return;
    await prisma.activityLog.create({
      data: { action, entityType, entityId, metadata: metadata ? JSON.stringify(metadata) : null, userName: "System" },
    });
  } catch { /* silent */ }
}


