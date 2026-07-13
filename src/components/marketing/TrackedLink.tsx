"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { trackMarketingEvent, type TrackMarketingEventInput } from "@/lib/marketing/track-event";

type TrackedLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick"> & {
  href: string;
  children: ReactNode;
  eventName: TrackMarketingEventInput["eventName"];
  tracking?: Omit<TrackMarketingEventInput, "eventName">;
  onClick?: AnchorHTMLAttributes<HTMLAnchorElement>["onClick"];
};

export default function TrackedLink({ href, children, eventName, tracking, target, rel, ...props }: TrackedLinkProps) {
  async function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    props.onClick?.(event);
    if (event.defaultPrevented) return;

    void trackMarketingEvent({
      eventName,
      pageUrl: tracking?.pageUrl,
      pageTitle: tracking?.pageTitle,
      contentType: tracking?.contentType,
      contentId: tracking?.contentId,
      campaignId: tracking?.campaignId,
      source: tracking?.source,
      medium: tracking?.medium,
      device: tracking?.device,
      country: tracking?.country,
      city: tracking?.city,
      metadata: tracking?.metadata,
    });

  }

  return (
    <Link href={href} target={target} rel={rel} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
