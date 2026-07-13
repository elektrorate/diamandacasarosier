import type { ExperienceItem, ExperienceKind } from "@/data/types";
import { getPublicExperienceItems } from "./experienceDetailRouting";

export interface ExperienceCollectionConfig {
  kind: ExperienceKind;
  bodyClass: string;
  eyebrow: string;
  title: string;
  lede: string;
  items: readonly ExperienceItem[];
}

export const experienceCollections = {
  classes: {
    kind: "class",
    bodyClass: "collection-page classes-page",
    eyebrow: "En Barcelona",
    title: "Cursos y talleres de ceramica",
    lede: "Un espacio para aprender ceramica con calma, explorar tecnicas, tocar la materia y encontrar una practica guiada que acompana cada proceso desde el primer gesto.",
    items: []
  },
  workshops: {
    kind: "workshop",
    bodyClass: "collection-page classes-page",
    eyebrow: "En Barcelona",
    title: "Workshops de ceramica",
    lede: "Un espacio para aprender ceramica con calma, explorar tecnicas, tocar la materia y encontrar una practica guiada que acompana cada proceso desde el primer gesto.",
    items: []
  },
  privateBookings: {
    kind: "private-booking",
    bodyClass: "collection-page experiences-page",
    eyebrow: "Experiencias en Barcelona",
    title: "Experiencias",
    lede: "Sesiones privadas y encuentros de taller pensados para compartir la ceramica con calma, acompanamiento cercano y una experiencia cuidada desde el primer momento.",
    items: []
  },
  giftCards: {
    kind: "gift-card",
    bodyClass: "collection-page classes-page",
    eyebrow: "Experiencias regalo",
    title: "Tarjetas de regalo",
    lede: "Gift cards para regalar tiempo de taller, materia y una experiencia ceramica serena, pensada para compartir algo manual, sensible y verdaderamente memorable.",
    items: []
  }
} satisfies Record<string, ExperienceCollectionConfig>;

export async function getExperienceCollectionConfig(key: keyof typeof experienceCollections) {
  const config = experienceCollections[key];
  const items = (await getPublicExperienceItems())
    .filter((item) => item.kind === config.kind)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

  return { ...config, items } satisfies ExperienceCollectionConfig;
}
