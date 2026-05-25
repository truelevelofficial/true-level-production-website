import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "True Level Production",
  description:
    "Creative production company and studio for brand films, reels, UGC, event coverage, campaign assets, and studio shoots.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className={cairo.variable} lang="ar">
      <body>{children}</body>
    </html>
  );
}
