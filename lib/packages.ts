export interface PackageData {
  slug: string;
  title: string;
  intro: string;
  bestFor: string[];
  included: string[];
  deliverables: string[];
  addons: string[];
  ctaLabel: string;
  bookingLink: string;
  metaTitle: string;
  metaDescription: string;
}

export const packages: PackageData[] = [
  {
    slug: "studio-rent",
    title: "Studio Rent Package",
    intro:
      "Book True Level studio spaces for reels, product shoots, podcasts, and campaign content with ready-made production setups.",
    bestFor: [
      "Creators",
      "Brands",
      "Product shoots",
      "Talking-head reels",
      "Podcast-style content",
      "UGC filming",
    ],
    included: [
      "Studio space booking",
      "Cyclorama or ready setup access",
      "Basic production environment",
      "Flexible hourly / half-day / full-day options",
      "Optional lighting setup if available",
    ],
    deliverables: [
      "Studio rental slot",
      "Setup access",
      "Basic assistance during session if included",
      "Optional production support as add-on",
    ],
    addons: [
      "Camera operator",
      "Lighting setup",
      "Photographer",
      "Videographer",
      "Video editing",
      "Extra hours",
      "Props / custom setup",
    ],
    ctaLabel: "Book Studio",
    bookingLink: "/book?package=studio-rent",
    metaTitle: "Studio Rent Package | True Level Production",
    metaDescription:
      "Book True Level studio spaces for reels, product shoots, podcasts, and campaign content with ready-made production setups.",
  },
  {
    slug: "content-creators-campaign",
    title: "Content Creators Campaign",
    intro:
      "Build a creator-led campaign with selected content creators producing social-first videos for your brand.",
    bestFor: [
      "Brand awareness",
      "Product launches",
      "Social proof",
      "Creator ads",
      "Short-form campaigns",
    ],
    included: [
      "Campaign concept",
      "Creator direction",
      "Content brief",
      "Creator content production",
      "Review and approval flow",
      "Final content delivery",
    ],
    deliverables: [
      "Creator videos",
      "Platform-ready content",
      "Captions or hooks if included",
      "Usage-ready assets",
    ],
    addons: [
      "Extra creators",
      "Paid ads usage rights",
      "Whitelisting",
      "Additional edits",
      "Product seeding coordination",
      "Posting schedule",
    ],
    ctaLabel: "Start Creator Campaign",
    bookingLink: "/book?package=content-creators-campaign",
    metaTitle: "Content Creators Campaign | True Level Production",
    metaDescription:
      "Build a creator-led campaign with selected content creators producing social-first videos for your brand.",
  },
  {
    slug: "event-production",
    title: "Event Production",
    intro:
      "Capture and produce event content that turns live moments into social-ready assets, highlights, and campaign material.",
    bestFor: [
      "Launch events",
      "Corporate events",
      "Gaming events",
      "Brand activations",
      "Conferences",
      "Community events",
    ],
    included: [
      "Event coverage planning",
      "On-ground shooting",
      "Highlight moments capture",
      "Photo or video coverage depending on package",
      "Post-event editing",
    ],
    deliverables: [
      "Event reels",
      "Highlight video",
      "Edited photos if included",
      "Social media cuts",
      "Final exports",
    ],
    addons: [
      "Extra camera operator",
      "Same-day edit",
      "Photographer",
      "Aftermovie",
      "Live social coverage",
      "Drone if available and permitted",
    ],
    ctaLabel: "Book Event Production",
    bookingLink: "/book?package=event-production",
    metaTitle: "Event Production | True Level Production",
    metaDescription:
      "Capture and produce event content that turns live moments into social-ready assets, highlights, and campaign material.",
  },
  {
    slug: "ugc-campaign",
    title: "UGC Campaign",
    intro:
      "Create authentic UGC-style videos that make your brand feel real, relatable, and ready for social platforms.",
    bestFor: [
      "E-commerce brands",
      "Beauty products",
      "Food brands",
      "Apps",
      "Local businesses",
      "Performance ads",
    ],
    included: [
      "UGC concept",
      "Script or talking points",
      "Studio or creator filming",
      "Short-form video production",
      "Basic editing",
      "Platform-ready exports",
    ],
    deliverables: [
      "UGC videos",
      "Multiple hooks if included",
      "Vertical exports",
      "Product-focused edits",
      "Ready-to-use ad creatives",
    ],
    addons: [
      "Extra hooks",
      "Extra creators",
      "Extra product scenes",
      "Voice over",
      "Subtitles",
      "Paid ads cutdowns",
    ],
    ctaLabel: "Build UGC Campaign",
    bookingLink: "/book?package=ugc-campaign",
    metaTitle: "UGC Campaign | True Level Production",
    metaDescription:
      "Create authentic UGC-style videos that make your brand feel real, relatable, and ready for social platforms.",
  },
  {
    slug: "monthly-marketing-campaign",
    title: "Monthly Marketing Campaign",
    intro:
      "A monthly production and marketing package for brands that need consistent content, clear planning, and regular creative output.",
    bestFor: [
      "Monthly social media content",
      "Always-on brand presence",
      "Product promotion",
      "Local business marketing",
      "Campaign planning",
      "Content calendars",
    ],
    included: [
      "Monthly content plan",
      "Reels or short-form videos",
      "Caption/copy support",
      "Creative direction",
      "Production schedule",
      "Monthly review",
    ],
    deliverables: [
      "Monthly content calendar",
      "Reels/videos according to package",
      "Captions if included",
      "Campaign ideas",
      "Monthly performance notes if available",
    ],
    addons: [
      "Media buying",
      "Extra shoot day",
      "Extra reels",
      "Extra designs",
      "Community management",
      "Influencer/creator campaign",
    ],
    ctaLabel: "Start Monthly Campaign",
    bookingLink: "/book?package=monthly-marketing-campaign",
    metaTitle: "Monthly Marketing Campaign | True Level Production",
    metaDescription:
      "A monthly production and marketing package for brands that need consistent content, clear planning, and regular creative output.",
  },
];

export function getPackageBySlug(slug: string) {
  return packages.find((p) => p.slug === slug) ?? null;
}
