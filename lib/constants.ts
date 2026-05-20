export const bookingStatuses = ["PENDING", "APPROVED", "REJECTED", "COMPLETED", "CANCELLED"] as const;
export const paymentStatuses = ["UNPAID", "PARTIALLY_PAID", "PAID", "REFUNDED"] as const;
export const paymentMethods = ["CASH", "BANK_TRANSFER", "VODAFONE_CASH", "INSTAPAY", "OTHER"] as const;
export const expenseCategories = ["RENT", "SALARIES", "EQUIPMENT", "ADS", "UTILITIES", "TRANSPORTATION", "FREELANCERS", "MAINTENANCE", "OFFICE_SUPPLIES", "OTHER"] as const;

export const paymentStatusArabic: Record<string, string> = {
  UNPAID: "غير مدفوع",
  PARTIALLY_PAID: "مدفوع جزئيا",
  PAID: "مدفوع",
  REFUNDED: "مسترد",
};

export const paymentMethodArabic: Record<string, string> = {
  CASH: "Cash",
  BANK_TRANSFER: "Bank Transfer",
  VODAFONE_CASH: "Vodafone Cash",
  INSTAPAY: "Instapay",
  OTHER: "Other",
};

export const expenseCategoryArabic: Record<string, string> = {
  RENT: "Rent",
  SALARIES: "Salaries",
  EQUIPMENT: "Equipment",
  ADS: "Ads",
  UTILITIES: "Utilities",
  TRANSPORTATION: "Transportation",
  FREELANCERS: "Freelancers",
  MAINTENANCE: "Maintenance",
  OFFICE_SUPPLIES: "Office supplies",
  OTHER: "Other",
};
export const contractStatuses = ["DRAFT", "SENT", "SIGNED", "CANCELLED"] as const;

export const contractStatusArabic: Record<string, string> = {
  DRAFT: "مسودة",
  SENT: "مرسل",
  SIGNED: "موقع",
  CANCELLED: "ملغي",
};

export const services = [
  "Brand Films",
  "Creative Direction",
  "UGC Content",
  "Studio Shoots",
  "Event Coverage",
  "Campaign Assets",
] as const;

export const studioSetups = [
  "Cyclorama",
  "Creator Corner",
  "Product Zone",
  "Podcast Setup",
  "Lifestyle Setup",
  "Custom Setup",
] as const;

export const clientTypes = [
  "Brand",
  "Agency",
  "Creator",
  "Restaurant",
  "Cafe",
  "Fashion brand",
  "Beauty brand",
  "Skincare brand",
  "E-commerce",
  "Event organizer",
  "Startup",
  "Coach",
  "Consultant",
  "Clinic",
  "Other",
] as const;

export const leadSources = ["Instagram", "Facebook", "TikTok", "Website", "WhatsApp", "Referral", "Existing Client", "Event", "Cold Outreach", "Paid Ads", "Other"] as const;
export const pipelineStatuses = ["New Lead", "Contacted", "Meeting Scheduled", "Proposal Sent", "Negotiation", "Won", "Lost"] as const;

export const adminMeetingTypes = [
  "Google Meeting",
  "In-company meeting",
  "Client visit",
  "Project briefing",
  "Follow-up meeting",
] as const;

export const adminMeetingStatuses = ["PENDING", "APPROVED", "COMPLETED", "CANCELLED", "REJECTED"] as const;
export const adminStudioStatuses = ["PENDING", "APPROVED", "COMPLETED", "CANCELLED"] as const;
export const studioDurationTypes = ["HOURLY", "HALF_DAY", "FULL_DAY"] as const;

export const contractTypes = [
  ["STUDIO_RENTAL", "عقد تأجير استوديو"],
  ["VIDEO_PRODUCTION", "عقد إنتاج فيديو"],
  ["UGC_CREATOR_CAMPAIGN", "عقد حملة UGC"],
  ["EVENT_COVERAGE", "عقد تغطية فعالية"],
  ["MONTHLY_CONTENT_MANAGEMENT", "عقد إدارة محتوى شهري"],
  ["GENERAL_SERVICE", "عقد خدمات عام"],
] as const;

export const contractTypeValues = ["STUDIO_RENTAL", "VIDEO_PRODUCTION", "UGC_CREATOR_CAMPAIGN", "EVENT_COVERAGE", "MONTHLY_CONTENT_MANAGEMENT", "GENERAL_SERVICE"] as const;
