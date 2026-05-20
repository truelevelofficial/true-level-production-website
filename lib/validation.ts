import { z } from "zod";
import { adminMeetingTypes, bookingStatuses, clientTypes, contractStatuses, contractTypeValues, expenseCategories, paymentMethods, paymentStatuses, services, studioDurationTypes, studioSetups } from "./constants";

const requiredText = z.string().trim().min(2).max(500);
const optionalText = z.string().trim().max(3000).optional().or(z.literal(""));
const money = z.coerce.number().min(0).max(100000000).optional();

export const clientFields = {
  fullName: requiredText,
  companyName: z.string().trim().max(200).optional().or(z.literal("")),
  phone: z.string().trim().min(7).max(40),
  whatsapp: z.string().trim().max(40).optional().or(z.literal("")),
  email: z.string().trim().email().max(200),
};

export const manualClientSchema = z.object({
  ...clientFields,
  address: z.string().trim().max(300).optional().or(z.literal("")),
  taxId: z.string().trim().max(100).optional().or(z.literal("")),
  clientType: z.enum(clientTypes).optional().or(z.literal("")),
  notes: optionalText,
});

export const clientUpdateSchema = manualClientSchema.extend({ clientId: z.string().min(1) });
export const clientDeleteSchema = z.object({ clientId: z.string().min(1) });

export const adminMeetingSchema = z.object({
  clientId: z.string().optional().or(z.literal("")),
  ...clientFields,
  meetingType: z.enum(adminMeetingTypes),
  status: z.enum(["PENDING", "APPROVED", "COMPLETED", "CANCELLED", "REJECTED"]),
  date: z.string().trim().min(10),
  time: z.string().trim().min(4).max(8),
  durationHours: z.coerce.number().int().min(1).max(12),
  meetingLocation: z.string().trim().max(300).optional().or(z.literal("")),
  meetingLink: z.string().trim().url().optional().or(z.literal("")),
  serviceType: z.enum(services),
  assignedTeamMember: z.string().trim().max(120).optional().or(z.literal("")),
  notes: optionalText,
  internalNotes: optionalText,
});

export const adminStudioBookingSchema = z.object({
  clientId: z.string().optional().or(z.literal("")),
  ...clientFields,
  studioSetup: z.enum(studioSetups),
  status: z.enum(["PENDING", "APPROVED", "COMPLETED", "CANCELLED"]),
  paymentStatus: z.enum(paymentStatuses),
  date: z.string().trim().min(10),
  startTime: z.string().trim().min(4).max(8),
  durationType: z.enum(studioDurationTypes),
  durationHours: z.coerce.number().int().min(1).max(12),
  peopleCount: z.coerce.number().int().min(1).max(100),
  bookingPurpose: requiredText,
  price: z.coerce.number().min(0).optional(),
  deposit: z.coerce.number().min(0).optional(),
  notes: optionalText,
  internalNotes: optionalText,
});

export const bookingStatusUpdateSchema = z.object({
  bookingId: z.string().min(1),
  status: z.enum(bookingStatuses),
});

export const companySettingsSchema = z.object({
  companyName: z.string().trim().max(200).optional().or(z.literal("")),
  companyLegalName: z.string().trim().max(200).optional().or(z.literal("")),
  companyAddress: z.string().trim().max(500).optional().or(z.literal("")),
  companyPhone: z.string().trim().max(80).optional().or(z.literal("")),
  companyEmail: z.string().trim().email().optional().or(z.literal("")),
  taxNumber: z.string().trim().max(120).optional().or(z.literal("")),
  commercialRegistrationNumber: z.string().trim().max(120).optional().or(z.literal("")),
  defaultContractRepresentative: z.string().trim().max(200).optional().or(z.literal("")),
  defaultCurrency: z.string().trim().max(20).optional().or(z.literal("")),
  studioHourlyPrice: z.coerce.number().min(0).optional(),
  studioHalfDayPrice: z.coerce.number().min(0).optional(),
  studioFullDayPrice: z.coerce.number().min(0).optional(),
  defaultDepositPercentage: z.coerce.number().min(0).max(100).optional(),
  defaultCancellationPolicy: z.string().trim().max(3000).optional().or(z.literal("")),
  defaultPaymentTerms: z.string().trim().max(3000).optional().or(z.literal("")),
  notificationEmail: z.string().trim().email().optional().or(z.literal("")),
});

export const meetingBookingSchema = z.object({
  ...clientFields,
  meetingType: z.enum(["GOOGLE_MEETING", "COMPANY_MEETING"]),
  date: z.string().trim().min(10),
  time: z.string().trim().min(4).max(8),
  serviceType: z.enum(services),
  notes: optionalText,
});

export const studioBookingSchema = z.object({
  ...clientFields,
  studioSetup: z.enum(studioSetups),
  date: z.string().trim().min(10),
  startTime: z.string().trim().min(4).max(8),
  durationType: z.enum(["HOURLY", "HALF_DAY", "FULL_DAY"]),
  durationHours: z.coerce.number().int().min(1).max(12),
  bookingPurpose: requiredText,
  peopleCount: z.coerce.number().int().min(1).max(100),
  notes: optionalText,
});

export const adminBookingSchema = z.object({
  bookingId: z.string().min(1),
  status: z.enum(bookingStatuses),
  price: money,
  deposit: money,
  discount: money,
  paymentStatus: z.enum(paymentStatuses),
  meetingLink: z.string().trim().url().optional().or(z.literal("")),
  internalNotes: optionalText,
});

export const paymentSchema = z.object({
  amount: z.coerce.number().positive().max(100000000),
  method: z.enum(paymentMethods),
  status: z.enum(paymentStatuses),
  description: optionalText,
  clientId: z.string().optional().or(z.literal("")),
  bookingId: z.string().optional().or(z.literal("")),
  date: z.string().trim().min(10),
});

export const paymentUpdateSchema = paymentSchema.extend({ paymentId: z.string().min(1) });
export const paymentDeleteSchema = z.object({ paymentId: z.string().min(1) });

export const expenseSchema = z.object({
  amount: z.coerce.number().positive().max(100000000),
  category: z.enum(expenseCategories),
  method: z.enum(paymentMethods),
  description: requiredText,
  clientId: z.string().optional().or(z.literal("")),
  date: z.string().trim().min(10),
});

export const expenseUpdateSchema = expenseSchema.extend({ expenseId: z.string().min(1) });
export const expenseDeleteSchema = z.object({ expenseId: z.string().min(1) });

export const contractSchema = z.object({
  type: z.enum(contractTypeValues),
  status: z.enum(contractStatuses).default("DRAFT"),
  clientName: requiredText,
  clientCompanyName: z.string().trim().max(200).optional().or(z.literal("")),
  clientTaxId: z.string().trim().max(100).optional().or(z.literal("")),
  clientAddress: z.string().trim().max(300).optional().or(z.literal("")),
  clientPhone: z.string().trim().min(7).max(40),
  clientEmail: z.string().trim().email().max(200),
  representativeName: requiredText,
  serviceType: requiredText,
  projectDescription: requiredText,
  deliverables: requiredText,
  projectStartDate: z.string().trim().min(10),
  projectEndDate: z.string().trim().min(10),
  shootingDate: z.string().trim().min(10),
  location: requiredText,
  totalPrice: z.coerce.number().min(0),
  depositAmount: z.coerce.number().min(0),
  remainingAmount: z.coerce.number().min(0),
  paymentTerms: requiredText,
  cancellationPolicy: requiredText,
  deliveryTimeline: requiredText,
  usageRights: requiredText,
  revisionRounds: z.coerce.number().int().min(0).max(20),
  confidentialityClause: requiredText,
  latePaymentClause: requiredText,
  additionalNotes: optionalText,
  bodyOverride: z.string().trim().max(30000).optional().or(z.literal("")),
});
