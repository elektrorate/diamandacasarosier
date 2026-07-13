"use client";

import { usePathname } from "next/navigation";
import { CookieBar } from "@/components/layout/CookieBar";
import MarketingPageViewTracker from "@/components/marketing/MarketingPageViewTracker";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";

export function SiteChrome() {
  const pathname = usePathname();
  if (pathname === "/auth" || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <MarketingPageViewTracker />
      <CookieBar />
      {pathname !== "/politica-privacidad" && <WhatsAppFloat />}
    </>
  );
}
