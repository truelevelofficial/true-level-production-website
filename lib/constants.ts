export const bookingStatuses = ["PENDING", "APPROVED", "REJECTED", "COMPLETED", "CANCELLED"] as const;
export const paymentStatuses = ["UNPAID", "PARTIALLY_PAID", "PAID", "REFUNDED"] as const;
export const paymentMethods = ["CASH", "BANK_TRANSFER", "VODAFONE_CASH", "INSTAPAY", "OTHER"] as const;
export const expenseCategories = ["RENT", "SALARIES", "EQUIPMENT", "ADS", "UTILITIES", "TRANSPORTATION", "FREELANCERS", "MAINTENANCE", "OTHER"] as const;
export const contractStatuses = ["DRAFT", "SENT", "SIGNED", "CANCELLED"] as const;

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

export const contractTypes = [
  ["STUDIO_RENTAL", "Studio Rental Agreement"],
  ["VIDEO_PRODUCTION", "Video Production Agreement"],
  ["UGC_CREATOR_CAMPAIGN", "UGC Creator Campaign Agreement"],
  ["EVENT_COVERAGE", "Event Coverage Agreement"],
  ["MONTHLY_CONTENT_MANAGEMENT", "Monthly Content Management Agreement"],
  ["GENERAL_SERVICE", "General Service Agreement"],
] as const;

export const contractTypeValues = ["STUDIO_RENTAL", "VIDEO_PRODUCTION", "UGC_CREATOR_CAMPAIGN", "EVENT_COVERAGE", "MONTHLY_CONTENT_MANAGEMENT", "GENERAL_SERVICE"] as const;
