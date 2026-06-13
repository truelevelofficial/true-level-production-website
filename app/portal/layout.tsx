import { ReactNode } from "react";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-[#F7F8FB] text-[#06111F]">{children}</div>;
}
