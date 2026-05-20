import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "True Level Production",
  description:
    "Creative production company and studio for brand films, reels, UGC, event coverage, campaign assets, and studio shoots.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
