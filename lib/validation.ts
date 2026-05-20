import { z } from "zod";
import { bookingStatuses, contractStatuses, contractTypeValues, expenseCategories, paymentMethods, paymentStatuses, services, studioSetups } from "./constants";

const requiredText = z.string().trim().min(2).max(500);
const optionalText = z.string().trim().max(3000).optional().or(z.literal(""));
const money = z.coerce.number().min(0).max(100000000).optional();

export const clientFields = {
  fullName: requiredText,
  companyName: z.string().trim().max(200).optional().or(z.literal("")),
  phone: z.string().trim().min(7).max(40),
  email: z.string().trim().email().max(200),
};

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

export const expenseSchema = z.object({
  amount: z.coerce.number().positive().max(100000000),
  category: z.enum(expenseCategories),
  method: z.enum(paymentMethods),
  description: requiredText,
  clientId: z.string().optional().or(z.literal("")),
  date: z.string().trim().min(10),
});

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
});
