"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackMarketingEvent } from "@/lib/marketing/track-event";

export default function MarketingPageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    void trackMarketingEvent({
      eventName: "page_view",
      pageUrl: pathname,
      metadata: { referrer: document.referrer || "" },
    });
  }, [pathname]);

  return null;
}
