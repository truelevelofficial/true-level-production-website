import { z } from "zod";
import { adminMeetingTypes, bookingStatuses, clientTypes, contractStatuses, contractTypeValues, expenseCategories, invoiceStatuses, leadSources, paymentMethods, paymentStatuses, pipelineStatuses, quotationStatuses, services, studioDurationTypes, studioSetups } from "./constants";

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
  commercialRegistrationNumber: z.string().trim().max(120).optional().or(z.literal("")),
  clientType: z.enum(clientTypes).optional().or(z.literal("")),
  leadSource: z.enum(leadSources).optional().or(z.literal("")),
  pipelineStatus: z.enum(pipelineStatuses).optional().or(z.literal("")),
  assignedTeamMember: z.string().trim().max(120).optional().or(z.literal("")),
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
export const bookingDeleteSchema = z.object({ bookingId: z.string().min(1) });

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

export const contractDeleteSchema = z.object({ contractId: z.string().min(1) });

export const contractUpdateSchema = z.object({
  contractId: z.string().min(1),
  status: z.enum(contractStatuses).optional(),
  body: z.string().trim().max(30000).optional(),
});

export const invoiceItemSchema = z.object({
  description: requiredText,
  quantity: z.coerce.number().min(0.01).max(999999),
  unitPrice: z.coerce.number().min(0).max(100000000),
  discount: z.coerce.number().min(0).max(100000000).default(0),
  total: z.coerce.number().min(0).max(100000000),
});

export const invoiceSchema = z.object({
  clientId: z.string().min(1),
  bookingId: z.string().optional().or(z.literal("")),
  projectId: z.string().optional().or(z.literal("")),
  contractId: z.string().optional().or(z.literal("")),
  status: z.enum(invoiceStatuses).default("DRAFT"),
  invoiceDate: z.string().trim().min(10),
  dueDate: z.string().trim().min(10).optional().or(z.literal("")),
  currency: z.string().trim().max(10).default("EGP"),
  subtotal: z.coerce.number().min(0).max(100000000),
  discount: z.coerce.number().min(0).max(100000000).default(0),
  taxRate: z.coerce.number().min(0).max(100).default(0),
  taxAmount: z.coerce.number().min(0).max(100000000).default(0),
  total: z.coerce.number().min(0).max(100000000),
  paidAmount: z.coerce.number().min(0).max(100000000).default(0),
  remainingAmount: z.coerce.number().min(0).max(100000000),
  notes: optionalText,
  terms: optionalText,
  items: z.array(invoiceItemSchema).min(1, "يجب إضافة بند واحد على الأقل"),
});

export const invoicePaymentSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.coerce.number().positive().max(100000000),
  paymentDate: z.string().trim().min(10),
  method: z.enum(paymentMethods),
  description: optionalText,
});

export const invoiceDeleteSchema = z.object({ invoiceId: z.string().min(1) });

export const quotationItemSchema = z.object({
  description: requiredText,
  quantity: z.coerce.number().min(0.01).max(999999),
  unitPrice: z.coerce.number().min(0).max(100000000),
  discount: z.coerce.number().min(0).max(100000000).default(0),
  total: z.coerce.number().min(0).max(100000000),
});

export const quotationSchema = z.object({
  clientId: z.string().min(1, "يجب اختيار عميل"),
  bookingId: z.string().optional().or(z.literal("")),
  projectId: z.string().optional().or(z.literal("")),
  status: z.enum(quotationStatuses).default("DRAFT"),
  serviceType: optionalText,
  currency: z.string().default("EGP"),
  subtotal: z.coerce.number().min(0).max(100000000),
  discount: z.coerce.number().min(0).max(100000000).default(0),
  taxRate: z.coerce.number().min(0).max(100).default(0),
  taxAmount: z.coerce.number().min(0).max(100000000).default(0),
  grandTotal: z.coerce.number().min(0).max(100000000),
  notes: optionalText,
  terms: optionalText,
  validUntil: z.string().trim().min(10).optional().or(z.literal("")),
  items: z.array(quotationItemSchema).min(1, "يجب إضافة بند واحد على الأقل"),
});

export const quotationUpdateSchema = z.object({
  quotationId: z.string().min(1),
  status: z.enum(quotationStatuses).optional(),
  rejectedReason: optionalText,
});

export const quotationDeleteSchema = z.object({ quotationId: z.string().min(1) });

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
  /* Type-specific optional fields */
  numberOfVideos: z.coerce.number().int().min(0).max(999).optional().default(0),
  videoDuration: z.string().trim().max(100).optional().or(z.literal("")),
  platforms: z.string().trim().max(500).optional().or(z.literal("")),
  rawFilesIncluded: z.string().trim().max(20).optional().or(z.literal("")),
  numberOfCreators: z.coerce.number().int().min(0).max(999).optional().default(0),
  usagePeriod: z.string().trim().max(200).optional().or(z.literal("")),
  repostingRights: z.string().trim().max(500).optional().or(z.literal("")),
  productDelivery: z.string().trim().max(500).optional().or(z.literal("")),
  eventName: z.string().trim().max(300).optional().or(z.literal("")),
  venue: z.string().trim().max(300).optional().or(z.literal("")),
  coverageHours: z.coerce.number().int().min(0).max(48).optional().default(0),
  teamSize: z.coerce.number().int().min(0).max(50).optional().default(0),
  startMonth: z.string().trim().max(20).optional().or(z.literal("")),
  endMonth: z.string().trim().max(20).optional().or(z.literal("")),
  monthlyDeliverables: z.string().trim().max(500).optional().or(z.literal("")),
  numberOfReels: z.coerce.number().int().min(0).max(999).optional().default(0),
  numberOfPosts: z.coerce.number().int().min(0).max(999).optional().default(0),
  postingIncluded: z.string().trim().max(20).optional().or(z.literal("")),
  mediaBuyingIncluded: z.string().trim().max(20).optional().or(z.literal("")),
   monthlyFee: z.coerce.number().min(0).optional().default(0),
  creatorPercentage: z.coerce.number().min(0).max(100).optional().default(25),
  penaltyAmount: z.coerce.number().min(0).optional().default(50000),
  clauses: z.string().optional().or(z.literal("")),
});
