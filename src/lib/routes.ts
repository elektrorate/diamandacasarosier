import type { ExperienceKind } from "@/data/types";

export const routeByKind: Record<ExperienceKind, string> = {
  class: "/clases",
  workshop: "/workshops",
  "gift-card": "/gift-cards",
  "private-booking": "/experiencias"
};

export function experienceHref(kind: ExperienceKind, slug?: string) {
  const base = routeByKind[kind];
  return slug ? `${base}/${slug}` : base;
}
