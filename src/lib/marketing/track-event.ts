export type TrackMarketingEventInput = {
  eventName: string;
  pageUrl?: string;
  pageTitle?: string;
  contentType?: string;
  contentId?: string;
  campaignId?: string;
  source?: string;
  medium?: string;
  device?: string;
  country?: string;
  city?: string;
  metadata?: Record<string, unknown>;
};

export async function trackMarketingEvent(input: TrackMarketingEventInput): Promise<boolean> {
  try {
    const payload = JSON.stringify(input);

    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const ok = navigator.sendBeacon("/api/marketing/track-event", new Blob([payload], { type: "application/json" }));
      if (ok) return true;
    }

    const response = await fetch("/api/marketing/track-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    });

    return response.ok;
  } catch {
    return false;
  }
}
