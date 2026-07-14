"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { DetailPage } from "@/components/collections/DetailPage";
import { PublicHeroContent } from "@/components/hero/PublicHeroContent";
import { NavbarGlobal } from "@/components/layout/NavbarGlobal";
import { PublicFooterContent } from "@/components/layout/PublicFooterContent";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Switch from "@/components/ui/Switch";
import { SocialGallery } from "@/components/home/SocialGallery";
import type { NavigationItem } from "@/data/types";
import type { ExperienceItem, ExperienceKind } from "@/data/types";
import { assetPath } from "@/lib/assets";
import type { ClassEditorPreviewChrome } from "@/lib/cms/class-editor-preview";
import AdminActionModal from "./AdminActionModal";
import MediaLibraryModal from "./MediaLibraryModal";
import RichTextField from "./RichTextField";
import SharedHeroEditor from "./SharedHeroEditor";
import ClassContentTab, { defaultContent } from "./ClassContentTab";
import type {
  ClassOfferingDetails,
  ClassScheduleDay,
  Offering,
  OfferingGalleryImage,
  OfferingPriceOption,
} from "@/lib/cms/types";

type TabKey = "hero" | "basic" | "schedule" | "content" | "seo" | "additions" | "preview";
type PickerTarget = "hero" | "presentation" | "title" | "titleSecondary" | "gallery" | `gallery:${number}` | "seo" | "videoPoster" | null;
type UploadTarget = Exclude<PickerTarget, "gallery" | null> | "gallery:new";
type SaveIntent = "draft" | "publish";
type FormNotice = { type: "success" | "error"; message: string; details?: string[] };
type UploadOptimization = { originalSize: number; finalSize: number; reductionPercent: number };
type LegacyOfferingDetails = Partial<ClassOfferingDetails> & {
  additionalInfo?: unknown;
  category?: unknown;
  included?: unknown;
  introHighlight?: unknown;
  paymentMethods?: unknown;
  program?: unknown;
  videoCardImage?: unknown;
  whatYouWillLearn?: unknown;
  whoCanJoin?: unknown;
};

const DEFAULT_HERO_IMAGE = "/img/hero-bg.jpg";

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const tabs: { key: TabKey; label: string }[] = [
  { key: "hero", label: "Hero" },
  { key: "basic", label: "Información básica" },
  { key: "schedule", label: "Horario" },
  { key: "content", label: "Contenido" },
  { key: "seo", label: "SEO" },
  { key: "additions", label: "Adiciones" },
  { key: "preview", label: "Vista previa" },
];

const defaultClassDetails: ClassOfferingDetails = {
  heroVariant: "text",
  heroTitle: "",
  heroSubtitle: "",
  heroPresentationText: "",
  heroPresentationTextColor: "#FFFFFF",
  heroPresentationImage: "",
  heroMenuTone: "dark",
  heroMenuColor: "#3f3933",
  heroMenuScale: 1,
  heroLogoPositionX: "50%",
  heroLogoPositionY: "46px",
  heroLogoWidth: "118px",
  heroLogoTabletPositionX: "50%",
  heroLogoTabletPositionY: "42px",
  heroLogoTabletWidth: "106px",
  heroLogoMobilePositionX: "50%",
  heroLogoMobilePositionY: "34px",
  heroLogoMobileWidth: "92px",
  heroMenuPositionY: "132px",
  heroMenuTabletPositionY: "118px",
  heroMenuMobilePositionY: "96px",
  ctaHref: "",
  ctaConsultHref: "",
  ctaEnrollHref: "",
  ctaConsultLabel: "",
  ctaEnrollLabel: "",
  showConsultCta: true,
  showEnrollCta: true,
  highlightDescription: "",
  homeExcerpt: "",
  durationText: "",
  whatsappNumber: "",
  scheduleDescription: "",
  showScheduleOnFrontend: true,
  scheduleDays: [],
  menuPlacement: ["classes"],
  homeSections: [],
  heroImage: DEFAULT_HERO_IMAGE,
  titleImage: "",
  titleImageSecondary: "",
  titleImageScale: 1,
  titleImageScaleTablet: 1,
  titleImageScaleMobile: 1,
  titleImagePositionX: "50%",
  titleImagePositionY: "50%",
  titleImagePositionXTablet: "50%",
  titleImagePositionYTablet: "50%",
  titleImagePositionXMobile: "50%",
  titleImagePositionYMobile: "50%",
  titleImageSecondaryScale: 1,
  titleImageSecondaryScaleTablet: 1,
  titleImageSecondaryScaleMobile: 1,
  titleImageSecondaryPositionX: "50%",
  titleImageSecondaryPositionY: "50%",
  titleImageSecondaryPositionXTablet: "50%",
  titleImageSecondaryPositionYTablet: "50%",
  titleImageSecondaryPositionXMobile: "50%",
  titleImageSecondaryPositionYMobile: "50%",
  heroTitlePositionY: "50%",
  heroTitlePositionYTablet: "50%",
  heroTitlePositionYMobile: "50%",
  heroTitleScale: 1,
  heroTitleScaleTablet: 1,
  heroTitleScaleMobile: 1,
  presentationTextPositionX: "8%",
  presentationTextPositionY: "50%",
  presentationTextPositionXTablet: "8%",
  presentationTextPositionYTablet: "50%",
  presentationTextPositionXMobile: "8%",
  presentationTextPositionYMobile: "50%",
  presentationTextScale: 1,
  presentationTextScaleTablet: 1,
  presentationTextScaleMobile: 1,
  presentationImagePositionX: "70%",
  presentationImagePositionY: "50%",
  presentationImagePositionXTablet: "70%",
  presentationImagePositionYTablet: "50%",
  presentationImagePositionXMobile: "70%",
  presentationImagePositionYMobile: "50%",
  presentationImageScale: 1,
  presentationImageScaleTablet: 1,
  presentationImageScaleMobile: 1,
  galleryImages: [],
  videoUrl: "",
  videoPoster: "",
  includedItems: [],
  pricing: [],
  seoImage: "",
  showIdeaPromptSection: true,
  content: defaultContent(),
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function createId(prefix: string) {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function menuPlacementForType(type: Offering["type"]) {
  if (type === "workshop") return ["workshops"];
  if (type === "experience") return ["experiences"];
  if (type === "gift_card") return ["gift-cards"];
  return ["classes"];
}

function toLines(value: string) {
  return value.split(/\r?\n/);
}

function textValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function firstText(...values: unknown[]) {
  for (const value of values) {
    const text = textValue(value);
    if (text) return text;
  }
  return "";
}

function defaultCtaHref(details: Pick<ClassOfferingDetails, "whatsappNumber" | "content">) {
  const whatsapp = firstText(details.whatsappNumber, details.content?.contactWhatsapp, "34633788860").replace(/\D/g, "");
  return `https://wa.me/${whatsapp || "34633788860"}`;
}

function defaultConsultLabel(type: Offering["type"]) {
  return type === "gift_card" ? "Comprar" : "Consultar";
}

function defaultEnrollLabel(type: Offering["type"]) {
  return type === "gift_card" ? "Anadir al carrito" : "Inscribirme";
}

function textList(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === "string") return value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
  return [] as string[];
}

function textBlock(value: unknown) {
  return textList(value).join("\n");
}

function legacyModules(value: unknown): ClassOfferingDetails["content"]["modules"] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      const source = item && typeof item === "object" ? item as Record<string, unknown> : {};
      const title = firstText(source.title, `Módulo ${index + 1}`);
      const content = firstText(source.content, source.description);
      const points = textList(source.points);

      return {
        id: firstText(source.id) || createId("module"),
        title,
        description: [content, ...points.map((point) => `- ${point}`)].filter(Boolean).join("\n"),
        duration: firstText(source.duration),
        image: firstText(source.image),
        order: typeof source.order === "number" ? source.order : index,
      };
    })
    .filter((item) => item.title || item.description);
}

function legacyScheduleDays(schedule: string[]): ClassScheduleDay[] {
  return schedule.map((item, index) => {
    const [title, ...descriptionParts] = item.split(":");
    return {
      id: `schedule-${index}`,
      date: "",
      startTime: "",
      endTime: "",
      title: title?.trim() || "Disponible",
      description: descriptionParts.join(":").trim() || "Consultar disponibilidad",
      location: "",
      availableSeats: null,
      order: index,
    };
  });
}

function toClassDetails(offering: Offering): ClassOfferingDetails {
  const legacyDetails = (offering.details ?? {}) as LegacyOfferingDetails;
  const fromDetails = { ...legacyDetails, ...(offering.details.class ?? {}) } as LegacyOfferingDetails;
  const legacyContent = defaultContent();
  legacyContent.learningContent = textBlock(fromDetails.whatYouWillLearn);
  legacyContent.participationContent = textBlock(fromDetails.whoCanJoin);
  legacyContent.paymentMethods = textBlock(fromDetails.paymentMethods);
  legacyContent.paymentMethodsList = textList(fromDetails.paymentMethods);
  legacyContent.extraInfo = firstText(fromDetails.additionalInfo);
  legacyContent.modules = legacyModules(fromDetails.program);

  const persistedContent = fromDetails.content ?? {};
  const mergedContent = {
    ...legacyContent,
    ...persistedContent,
    learningContent: firstText((persistedContent as Partial<ClassOfferingDetails["content"]>).learningContent, legacyContent.learningContent),
    participationContent: firstText((persistedContent as Partial<ClassOfferingDetails["content"]>).participationContent, legacyContent.participationContent),
    paymentMethods: firstText((persistedContent as Partial<ClassOfferingDetails["content"]>).paymentMethods, legacyContent.paymentMethods),
    paymentMethodsList: Array.isArray((persistedContent as Partial<ClassOfferingDetails["content"]>).paymentMethodsList)
      ? (persistedContent as Partial<ClassOfferingDetails["content"]>).paymentMethodsList?.map((item) => String(item).trim()).filter(Boolean) ?? []
      : textList(firstText((persistedContent as Partial<ClassOfferingDetails["content"]>).paymentMethods, legacyContent.paymentMethods)),
    extraInfo: firstText((persistedContent as Partial<ClassOfferingDetails["content"]>).extraInfo, legacyContent.extraInfo),
    modules: Array.isArray((persistedContent as Partial<ClassOfferingDetails["content"]>).modules) && (persistedContent as Partial<ClassOfferingDetails["content"]>).modules?.length
      ? (persistedContent as ClassOfferingDetails["content"]).modules
      : legacyContent.modules,
    activitiesSection: {
      ...legacyContent.activitiesSection,
      ...((persistedContent as Partial<ClassOfferingDetails["content"]>).activitiesSection ?? {}),
    },
  };
  const galleryImages: OfferingGalleryImage[] = Array.isArray(fromDetails.galleryImages) && fromDetails.galleryImages.length
    ? fromDetails.galleryImages
    : offering.gallery.map((image, index) => ({ image, alt: "", order: index }));

  const pricing = Array.isArray(fromDetails.pricing) && fromDetails.pricing.length
    ? fromDetails.pricing
    : offering.price !== null
      ? [{ description: "Precio base", price: offering.price, order: 0 }]
      : [];

  const scheduleDays = Array.isArray(fromDetails.scheduleDays) && fromDetails.scheduleDays.length ? fromDetails.scheduleDays : legacyScheduleDays(offering.schedule);
  const includedItems = Array.isArray(fromDetails.includedItems) && fromDetails.includedItems.length ? fromDetails.includedItems : textList(fromDetails.included);
  const heroVariant = fromDetails.heroVariant === "image" || fromDetails.heroVariant === "text" || fromDetails.heroVariant === "presentation"
    ? fromDetails.heroVariant
    : "text";

  return {
    ...defaultClassDetails,
    ...fromDetails,
    heroVariant,
    heroMenuTone: fromDetails.heroMenuTone === "light" || fromDetails.heroMenuTone === "dark"
      ? fromDetails.heroMenuTone
      : heroVariant === "image" || heroVariant === "presentation" ? "light" : "dark",
    heroMenuColor: firstText(fromDetails.heroMenuColor, fromDetails.heroMenuTone === "light" ? "#ffffff" : "", heroVariant === "image" || heroVariant === "presentation" ? "#ffffff" : "#3f3933"),
    heroMenuScale: typeof fromDetails.heroMenuScale === "number" ? fromDetails.heroMenuScale : Number(fromDetails.heroMenuScale) || 1,
    heroLogoPositionX: firstText(fromDetails.heroLogoPositionX, defaultClassDetails.heroLogoPositionX),
    heroLogoPositionY: firstText(fromDetails.heroLogoPositionY, defaultClassDetails.heroLogoPositionY),
    heroLogoWidth: firstText(fromDetails.heroLogoWidth, defaultClassDetails.heroLogoWidth),
    heroLogoTabletPositionX: firstText(fromDetails.heroLogoTabletPositionX, fromDetails.heroLogoPositionX, defaultClassDetails.heroLogoTabletPositionX),
    heroLogoTabletPositionY: firstText(fromDetails.heroLogoTabletPositionY, fromDetails.heroLogoPositionY, defaultClassDetails.heroLogoTabletPositionY),
    heroLogoTabletWidth: firstText(fromDetails.heroLogoTabletWidth, fromDetails.heroLogoWidth, defaultClassDetails.heroLogoTabletWidth),
    heroLogoMobilePositionX: firstText(fromDetails.heroLogoMobilePositionX, fromDetails.heroLogoPositionX, defaultClassDetails.heroLogoMobilePositionX),
    heroLogoMobilePositionY: firstText(fromDetails.heroLogoMobilePositionY, defaultClassDetails.heroLogoMobilePositionY),
    heroLogoMobileWidth: firstText(fromDetails.heroLogoMobileWidth, defaultClassDetails.heroLogoMobileWidth),
    heroMenuPositionY: firstText(fromDetails.heroMenuPositionY, defaultClassDetails.heroMenuPositionY),
    heroMenuTabletPositionY: firstText(fromDetails.heroMenuTabletPositionY, fromDetails.heroMenuPositionY, defaultClassDetails.heroMenuTabletPositionY),
    heroMenuMobilePositionY: firstText(fromDetails.heroMenuMobilePositionY, defaultClassDetails.heroMenuMobilePositionY),
    ctaHref: firstText(fromDetails.ctaHref),
    ctaConsultHref: firstText(fromDetails.ctaConsultHref, fromDetails.ctaHref),
    ctaEnrollHref: firstText(fromDetails.ctaEnrollHref, fromDetails.ctaHref),
    ctaConsultLabel: firstText(fromDetails.ctaConsultLabel),
    ctaEnrollLabel: firstText(fromDetails.ctaEnrollLabel),
    showConsultCta: fromDetails.showConsultCta ?? true,
    showEnrollCta: fromDetails.showEnrollCta ?? true,
    heroTitle: firstText(fromDetails.heroTitle, offering.title),
    heroSubtitle: firstText(fromDetails.heroSubtitle, fromDetails.category, offering.subtitle),
    heroPresentationText: firstText(fromDetails.heroPresentationText),
    heroPresentationTextColor: firstText(fromDetails.heroPresentationTextColor, defaultClassDetails.heroPresentationTextColor),
    heroPresentationImage: firstText(fromDetails.heroPresentationImage),
    highlightDescription: firstText(fromDetails.highlightDescription, fromDetails.introHighlight, offering.excerpt),
    durationText: firstText(fromDetails.durationText, offering.duration),
    heroImage: fromDetails.heroImage || offering.cover_image_url || DEFAULT_HERO_IMAGE,
    titleImage: fromDetails.titleImage ?? "",
    titleImageSecondary: fromDetails.titleImageSecondary ?? "",
    videoUrl: fromDetails.videoUrl ?? "",
    videoPoster: firstText(fromDetails.videoPoster, fromDetails.videoCardImage),
    includedItems,
    galleryImages: galleryImages
      .map((item, index) => ({
        image: item.image || "",
        alt: item.alt || "",
        seoTitle: item.seoTitle || "",
        seoDescription: item.seoDescription || "",
        order: item.order ?? index,
      }))
      .sort((a, b) => a.order - b.order),
    pricing: pricing.map((item, index) => ({ description: item.description || "", price: item.price ?? null, order: item.order ?? index })),
    scheduleDescription: firstText(fromDetails.scheduleDescription, offering.schedule.join("\n")),
    showScheduleOnFrontend: fromDetails.showScheduleOnFrontend ?? true,
    scheduleDays: scheduleDays
      .map((item, index) => ({
        id: item.id || `schedule-${index}`,
        date: item.date || "",
        startTime: item.startTime || "",
        endTime: item.endTime || "",
        title: item.title || "",
        description: item.description || "",
        location: item.location || "",
        availableSeats: item.availableSeats ?? null,
        order: item.order ?? index,
      }))
      .sort((a, b) => (a.date || "9999-12-31").localeCompare(b.date || "9999-12-31") || a.order - b.order),
    whatsappNumber: firstText(fromDetails.whatsappNumber, fromDetails.content && typeof fromDetails.content === "object" ? (fromDetails.content as Partial<ClassOfferingDetails["content"]>).contactWhatsapp : ""),
    seoImage: fromDetails.seoImage ?? "",
    content: mergedContent,
  };
}

function FieldLabel({ children, required = false }: { children: string; required?: boolean }) {
  return (
    <label className="text-label-md font-bold uppercase tracking-wide text-on-surface-variant">
      {children}{required ? " *" : ""}
    </label>
  );
}

function TextField({
  label,
  required,
  error,
  help,
  validationKey,
  value,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; required?: boolean; error?: string; help?: string; validationKey?: string }) {
  return (
    <div
      className={`space-y-1.5 rounded-xl ${error ? "ring-2 ring-error/30 ring-offset-2 ring-offset-surface-container-lowest" : ""}`}
      data-validation-key={validationKey}
    >
      <FieldLabel required={required}>{label}</FieldLabel>
      <input
        {...props}
        value={value ?? ""}
        className={`block w-full rounded-xl border bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface transition-colors placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary-container ${
          error ? "border-error" : "border-outline-variant"
        } ${props.className ?? ""}`}
      />
      {help && !error ? <p className="text-label-md text-on-surface-variant/70">{help}</p> : null}
      {error ? <p className="text-label-md text-error">{error}</p> : null}
    </div>
  );
}

function TextAreaField({
  label,
  error,
  help,
  validationKey,
  value,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string; help?: string; validationKey?: string }) {
  return (
    <div
      className={`space-y-1.5 rounded-xl ${error ? "ring-2 ring-error/30 ring-offset-2 ring-offset-surface-container-lowest" : ""}`}
      data-validation-key={validationKey}
    >
      <FieldLabel>{label}</FieldLabel>
      <textarea
        {...props}
        value={value ?? ""}
        className={`block min-h-[110px] w-full rounded-xl border bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface transition-colors placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary-container ${
          error ? "border-error" : "border-outline-variant"
        } ${props.className ?? ""}`}
      />
      {help && !error ? <p className="text-label-md text-on-surface-variant/70">{help}</p> : null}
      {error ? <p className="text-label-md text-error">{error}</p> : null}
    </div>
  );
}

function ImagePreview({ src, alt, aspect = "aspect-video" }: { src: string; alt: string; aspect?: string }) {
  if (!src) return null;
  return (
    <div className={`relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-high ${aspect}`}>
      <Image src={src} alt={alt} fill sizes="720px" className="object-cover" unoptimized />
    </div>
  );
}

function renderPlainText(value: string) {
  return value
    .replace(/\*\*/g, "")
    .replace(/_/g, "")
    .replace(/<u>|<\/u>/g, "")
    .replace(/~~/g, "")
    .replace(/^#+\s*/gm, "")
    .trim();
}

function kindForOfferingType(type: Offering["type"]): ExperienceKind {
  if (type === "workshop") return "workshop";
  if (type === "gift_card") return "gift-card";
  if (type === "experience") return "private-booking";
  return "class";
}

function formatPreviewPrice(value: number | null) {
  return value === null ? "" : `${value} EUR`;
}

function previewSchedule(details: ClassOfferingDetails) {
  if (!details.showScheduleOnFrontend) return [];
  return details.scheduleDescription.trim()
    ? [{ day: "Horario", slots: toLines(details.scheduleDescription).filter(Boolean) }]
    : [];
}

function previewProgram(details: ClassOfferingDetails) {
  return [...details.content.modules]
    .sort((a, b) => a.order - b.order)
    .map((item, index) => ({
      title: item.title || `Módulo ${index + 1}`,
      content: item.description,
    }))
    .filter((item) => item.title || item.content);
}

const previewNavigationItems: NavigationItem[] = [
  { label: "Inicio", href: "/#hero", order: 0, visible: true },
  { label: "Clases", href: "/clases", order: 1, visible: true, children: [] },
  { label: "Workshops", href: "/workshops", order: 2, visible: true, children: [] },
  { label: "Experiencias", href: "/experiencias", order: 3, visible: true, children: [] },
  { label: "Gift Cards", href: "/gift-cards", order: 4, visible: true, children: [] },
  {
    label: "El Estudio",
    href: "/el-estudio",
    order: 5,
    visible: true,
    children: [
      { label: "El Estudio", href: "/el-estudio", order: 0, visible: true },
      { label: "Bitácora", href: "/blog", order: 1, visible: true },
    ],
  },
  { label: "Shop", href: "/shop", order: 6, visible: true },
];

const fallbackPreviewChrome: ClassEditorPreviewChrome = {
  navigationItems: previewNavigationItems,
  menuSettings: {
    header_logo_url: "/img/logo-header.png",
    scroll_menu_background_color: "#8c7457",
    scroll_menu_text_color: "#fff9f1",
    scroll_menu_icon_color: "#fff9f1",
    scroll_menu_logo_tint_enabled: false,
    scroll_menu_logo_tint_color: "#fff9f1",
  },
  socialGallery: null,
  footer: null,
};

function socialGalleryPosts(previewChrome: ClassEditorPreviewChrome) {
  return previewChrome.socialGallery?.items
    .filter((item) => item.is_visible !== false && item.image_url)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((item) => ({
      image: item.image_url,
      title: item.title,
      body: item.description,
      instagramUrl: item.instagram_url,
    }));
}

function PublicSocialGalleryPreview({ previewChrome }: { previewChrome: ClassEditorPreviewChrome }) {
  const gallery = previewChrome.socialGallery;
  const posts = socialGalleryPosts(previewChrome);

  return (
    <SocialGallery
      title={gallery?.title || undefined}
      subtitle={gallery?.description || undefined}
      posts={posts?.length ? posts : undefined}
      sourceHref={gallery?.cta_url || undefined}
    />
  );
}

function buildPreviewItem({
  offeringType,
  title,
  slug,
  subtitle,
  description,
  details,
}: {
  offeringType: Offering["type"];
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  details: ClassOfferingDetails;
}): ExperienceItem {
  const kind = kindForOfferingType(offeringType);
  const galleryImages = details.galleryImages
    .filter((item) => item.image)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((item) => item.image);
  const fallbackImage = details.heroImage || details.videoPoster || DEFAULT_HERO_IMAGE;
  const fallbackCta = defaultCtaHref(details);
  const consultHref = details.showConsultCta === false ? "" : details.ctaConsultHref || details.ctaHref || fallbackCta;
  const enrollHref = details.showEnrollCta === false ? "" : details.ctaEnrollHref || details.ctaHref || fallbackCta;
  const priceOptions = details.pricing
    .filter((item) => item.description.trim() || item.price !== null)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((item) => ({
      label: item.description || "Precio",
      price: formatPreviewPrice(item.price),
    }));
  const paymentMethods = details.content.paymentMethodsList?.length
    ? details.content.paymentMethodsList
    : toLines(details.content.paymentMethods.replace(/,/g, "\n"));

  return {
    id: "preview",
    kind,
    slug: slugify(slug || title || "vista-previa"),
    title: title || "Título del producto",
    subtitle: subtitle || title || "Título del producto",
    category: details.heroSubtitle || offeringType,
    excerpt: details.highlightDescription,
    description: toLines(description),
    coverImage: galleryImages[0] || fallbackImage,
    heroImage: fallbackImage,
    heroVariant: details.heroVariant,
    heroMenuTone: details.heroMenuTone,
    heroMenuColor: details.heroMenuColor,
    heroMenuScale: details.heroMenuScale,
    heroLogoPositionX: details.heroLogoPositionX,
    heroLogoPositionY: details.heroLogoPositionY,
    heroLogoWidth: details.heroLogoWidth,
    heroLogoTabletPositionX: details.heroLogoTabletPositionX,
    heroLogoTabletPositionY: details.heroLogoTabletPositionY,
    heroLogoTabletWidth: details.heroLogoTabletWidth,
    heroLogoMobilePositionX: details.heroLogoMobilePositionX,
    heroLogoMobilePositionY: details.heroLogoMobilePositionY,
    heroLogoMobileWidth: details.heroLogoMobileWidth,
    heroMenuPositionY: details.heroMenuPositionY,
    heroMenuTabletPositionY: details.heroMenuTabletPositionY,
    heroMenuMobilePositionY: details.heroMenuMobilePositionY,
    heroTitleImage: details.titleImage,
    heroTitleImageSecondary: details.titleImageSecondary,
    heroPresentationText: details.heroPresentationText,
    heroPresentationTextColor: details.heroPresentationTextColor,
    heroPresentationImage: details.heroPresentationImage,
    heroTitle: details.heroTitle || title || "Título del hero",
    listingTitle: title || "Título del producto",
    listingSubtitle: details.heroSubtitle || "",
    introHighlight: details.highlightDescription || "Texto remarcado color café.",
    galleryImages: galleryImages.length ? galleryImages : [fallbackImage],
    videoCardImage: details.videoPoster || galleryImages[0] || fallbackImage,
    videoCardLabel: details.videoUrl ? "VIDEO" : "IMAGEN",
    priceOptions: priceOptions.length ? priceOptions : [{ label: "Precio", price: "0 EUR" }],
    duration: details.durationText || "Duración pendiente",
    schedule: previewSchedule(details),
    included: details.includedItems.filter((item) => item.trim()),
    program: previewProgram(details),
    programSectionTitle: details.content.modulesSectionTitle.trim() || "Contenido del curso",
    learningSectionTitle: details.content.learningSectionTitle.trim() || "¿Qué aprenderás?",
    whatYouWillLearn: toLines(details.content.learningContent),
    participationSectionTitle: details.content.participationSectionTitle.trim() || "¿Quién puede participar?",
    whoCanJoin: toLines(details.content.participationContent),
    paymentMethods: paymentMethods.length ? paymentMethods : ["Transferencia bancaria", "Tarjeta", "Efectivo"],
    additionalInfo:
      details.content.extraInfo ||
      `Cualquier consulta o información adicional que necesites, puedes escribir al WhatsApp ${details.whatsappNumber || details.content.contactWhatsapp || "633788860"}.`,
    showIdeaPromptSection: details.showIdeaPromptSection,
    ctaHref: consultHref,
    ctaConsultHref: consultHref,
    ctaEnrollHref: enrollHref,
    ctaConsultLabel: details.ctaConsultLabel.trim() || defaultConsultLabel(offeringType),
    ctaEnrollLabel: details.ctaEnrollLabel.trim() || defaultEnrollLabel(offeringType),
    seoTitle: title || "Vista previa",
    seoDescription: details.highlightDescription || renderPlainText(description),
    isPublished: false,
    order: 0,
  };
}

function PreviewPane({
  offeringType,
  title,
  slug,
  subtitle,
  description,
  status,
  details,
  previewChrome,
}: {
  offeringType: Offering["type"];
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  status: "draft" | "published";
  details: ClassOfferingDetails;
  previewChrome: ClassEditorPreviewChrome;
}) {
  const previewItem = buildPreviewItem({ offeringType, title, slug, subtitle, description, details });
  const promoPage = previewItem.kind === "private-booking" ? undefined : previewItem.kind.replace("-card", "");

  return (
    <div className="cms-preview-frame">
      <div className="cms-public-preview__toolbar">
        Vista previa de escritorio · {status === "published" ? "Publicado" : "Borrador"}
      </div>
      <div
        className="cms-public-preview class-detail-page"
        data-promo-page={promoPage}
      >
        <div className="cms-public-preview__scale">
          <PreviewHeader item={previewItem} details={details} previewChrome={previewChrome} />

          <div className="cms-public-preview__body">
            <DetailPage item={previewItem} />
            {previewItem.showIdeaPromptSection ? <PublicSocialGalleryPreview previewChrome={previewChrome} /> : null}
          </div>
          <PublicFooterContent footer={previewChrome.footer} preview />
        </div>
      </div>
    </div>
  );
}

function PreviewHeader({
  item,
  details,
  previewChrome,
}: {
  item: ExperienceItem;
  details: ClassOfferingDetails;
  previewChrome: ClassEditorPreviewChrome;
}) {
  const variant = item.heroVariant ?? "text";
  const isImageLike = variant === "image" || variant === "presentation";
  const style = {
    "--page-hero-image": `url("${assetPath(item.heroImage)}")`,
    "--hero-logo-position-x": item.heroLogoPositionX ?? "50%",
    "--hero-logo-position-y": item.heroLogoPositionY ?? "46px",
    "--hero-logo-width": item.heroLogoWidth ?? "118px",
    "--hero-logo-tablet-position-x": item.heroLogoTabletPositionX ?? item.heroLogoPositionX ?? "50%",
    "--hero-logo-tablet-position-y": item.heroLogoTabletPositionY ?? item.heroLogoPositionY ?? "42px",
    "--hero-logo-tablet-width": item.heroLogoTabletWidth ?? item.heroLogoWidth ?? "106px",
    "--hero-logo-mobile-position-x": item.heroLogoMobilePositionX ?? item.heroLogoPositionX ?? "50%",
    "--hero-logo-mobile-position-y": item.heroLogoMobilePositionY ?? "34px",
    "--hero-logo-mobile-width": item.heroLogoMobileWidth ?? "92px",
    "--hero-menu-position-y": item.heroMenuPositionY ?? "132px",
    "--hero-menu-tablet-position-y": item.heroMenuTabletPositionY ?? item.heroMenuPositionY ?? "118px",
    "--hero-menu-mobile-position-y": item.heroMenuMobilePositionY ?? "96px",
    "--hero-menu-color": item.heroMenuColor ?? (item.heroMenuTone === "light" ? "#ffffff" : "#3f3933"),
    "--hero-menu-scale": item.heroMenuScale ?? 1,
    "--title-image-scale": details.titleImageScale ?? 1,
    "--title-image-scale-tablet": details.titleImageScaleTablet ?? details.titleImageScale ?? 1,
    "--title-image-scale-mobile": details.titleImageScaleMobile ?? details.titleImageScale ?? 1,
    "--title-image-position-x": details.titleImagePositionX ?? "50%",
    "--title-image-position-y": details.titleImagePositionY ?? "50%",
    "--title-image-position-x-tablet": details.titleImagePositionXTablet ?? details.titleImagePositionX ?? "50%",
    "--title-image-position-y-tablet": details.titleImagePositionYTablet ?? details.titleImagePositionY ?? "50%",
    "--title-image-position-x-mobile": details.titleImagePositionXMobile ?? details.titleImagePositionX ?? "50%",
    "--title-image-position-y-mobile": details.titleImagePositionYMobile ?? "50%",
    "--title-image-secondary-scale": details.titleImageSecondaryScale ?? 1,
    "--title-image-secondary-scale-tablet": details.titleImageSecondaryScaleTablet ?? details.titleImageSecondaryScale ?? 1,
    "--title-image-secondary-scale-mobile": details.titleImageSecondaryScaleMobile ?? details.titleImageSecondaryScale ?? 1,
    "--title-image-secondary-position-x": details.titleImageSecondaryPositionX ?? "50%",
    "--title-image-secondary-position-y": details.titleImageSecondaryPositionY ?? "50%",
    "--title-image-secondary-position-x-tablet": details.titleImageSecondaryPositionXTablet ?? details.titleImageSecondaryPositionX ?? "50%",
    "--title-image-secondary-position-y-tablet": details.titleImageSecondaryPositionYTablet ?? details.titleImageSecondaryPositionY ?? "50%",
    "--title-image-secondary-position-x-mobile": details.titleImageSecondaryPositionXMobile ?? details.titleImageSecondaryPositionX ?? "50%",
    "--title-image-secondary-position-y-mobile": details.titleImageSecondaryPositionYMobile ?? "50%",
    "--presentation-text-position-x": details.presentationTextPositionX ?? "8%",
    "--presentation-text-position-y": details.presentationTextPositionY ?? "50%",
    "--presentation-text-position-x-tablet": details.presentationTextPositionXTablet ?? details.presentationTextPositionX ?? "8%",
    "--presentation-text-position-y-tablet": details.presentationTextPositionYTablet ?? details.presentationTextPositionY ?? "50%",
    "--presentation-text-position-x-mobile": details.presentationTextPositionXMobile ?? details.presentationTextPositionX ?? "8%",
    "--presentation-text-position-y-mobile": details.presentationTextPositionYMobile ?? "50%",
    "--presentation-text-scale": details.presentationTextScale ?? 1,
    "--presentation-text-scale-tablet": details.presentationTextScaleTablet ?? details.presentationTextScale ?? 1,
    "--presentation-text-scale-mobile": details.presentationTextScaleMobile ?? 1,
    "--presentation-image-position-x": details.presentationImagePositionX ?? "70%",
    "--presentation-image-position-y": details.presentationImagePositionY ?? "50%",
    "--presentation-image-position-x-tablet": details.presentationImagePositionXTablet ?? details.presentationImagePositionX ?? "70%",
    "--presentation-image-position-y-tablet": details.presentationImagePositionYTablet ?? details.presentationImagePositionY ?? "50%",
    "--presentation-image-position-x-mobile": details.presentationImagePositionXMobile ?? details.presentationImagePositionX ?? "70%",
    "--presentation-image-position-y-mobile": details.presentationImagePositionYMobile ?? "50%",
    "--presentation-image-scale": details.presentationImageScale ?? 1,
    "--presentation-image-scale-tablet": details.presentationImageScaleTablet ?? details.presentationImageScale ?? 1,
    "--presentation-image-scale-mobile": details.presentationImageScaleMobile ?? 1,
  } as CSSProperties;
  const scrollThreshold = Number.parseInt(item.heroMenuPositionY ?? "", 10) || 132;
  const titleContent = (
    <div>
      {item.category ? <p className="page-hero__eyebrow">{item.category}</p> : null}
      <h1 className="page-hero__title">{item.heroTitle || item.title}</h1>
    </div>
  );

  return (
    <>
      <header
        className={`header-interno page-hero header-interno--ready header-interno--center header-interno--overlay-warm ${
          isImageLike ? "header-interno--image-hero" : "header-interno--text-hero page-hero--nav-only"
        } ${variant === "presentation" ? "header-interno--presentation-hero" : ""} header-interno--menu-${item.heroMenuTone ?? (isImageLike ? "light" : "dark")} header-interno--medium`}
        style={style}
        data-header-height="medium"
        data-header-alignment="center"
        data-header-overlay="warm"
      >
        <NavbarGlobal
          navigationItems={previewChrome.navigationItems}
          logoUrl={previewChrome.menuSettings.header_logo_url}
          scrollMenuBackgroundColor={previewChrome.menuSettings.scroll_menu_background_color}
          scrollMenuTextColor={previewChrome.menuSettings.scroll_menu_text_color}
          scrollMenuIconColor={previewChrome.menuSettings.scroll_menu_icon_color}
          scrollMenuLogoTintEnabled={previewChrome.menuSettings.scroll_menu_logo_tint_enabled}
          scrollMenuLogoTintColor={previewChrome.menuSettings.scroll_menu_logo_tint_color}
          scrollThreshold={scrollThreshold}
          tabletScrollThreshold={Number.parseInt(item.heroMenuTabletPositionY ?? "", 10) || scrollThreshold}
          mobileScrollThreshold={Number.parseInt(item.heroMenuMobilePositionY ?? "", 10) || 96}
          heroMenuColor={item.heroMenuColor}
          heroMenuScale={item.heroMenuScale}
        />
        {isImageLike ? (
          <PublicHeroContent
            hero={{
              ...details,
              heroPresentationText: details.heroPresentationText || "# Chagall, Master Drawings\n\nFebruary 27-May 28, 2018",
            }}
          />
        ) : (
          <div className="header-interno__inner page-hero__inner container" aria-hidden="true" />
        )}
      </header>
      {!isImageLike ? (
        <section className="page-title-block page-title-block--center page-title-block--medium">
          <div className="page-title-block__inner container">{titleContent}</div>
        </section>
      ) : null}
    </>
  );
}

export default function ClassEditForm({
  offering,
  mode = "edit",
  basePath = "/admin/clases",
  previewChrome = fallbackPreviewChrome,
}: {
  offering: Offering;
  mode?: "create" | "edit";
  basePath?: string;
  previewChrome?: ClassEditorPreviewChrome;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("hero");
  const [title, setTitle] = useState(offering.title);
  const [slug, setSlug] = useState(offering.slug);
  const [subtitle, setSubtitle] = useState(offering.subtitle);
  const [description, setDescription] = useState(offering.description);
  const [status, setStatus] = useState<"draft" | "published">(offering.status === "published" ? "published" : "draft");
  const [seoTitle, setSeoTitle] = useState(offering.seo_title);
  const [seoDescription, setSeoDescription] = useState(offering.seo_description);
  const [details, setDetails] = useState<ClassOfferingDetails>(() => toClassDetails(offering));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<FormNotice | null>(null);
  const [pendingValidationFocus, setPendingValidationFocus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savingIntent, setSavingIntent] = useState<SaveIntent | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
  const [draggedGalleryIndex, setDraggedGalleryIndex] = useState<number | null>(null);
  const [uploadingTarget, setUploadingTarget] = useState<UploadTarget | null>(null);
  const [galleryUploadInfo, setGalleryUploadInfo] = useState<Record<string, UploadOptimization>>({});

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  function updateDetails(next: Partial<ClassOfferingDetails>) {
    setDetails((current) => ({ ...current, ...next }));
    setIsDirty(true);
  }

  function updatePricing(index: number, next: Partial<OfferingPriceOption>) {
    updateDetails({ pricing: details.pricing.map((item, i) => (i === index ? { ...item, ...next } : item)) });
  }

  function addPricing() {
    updateDetails({ pricing: [...details.pricing, { description: "", price: null, order: details.pricing.length }] });
  }

  function removePricing(index: number) {
    updateDetails({ pricing: details.pricing.filter((_, i) => i !== index).map((item, order) => ({ ...item, order })) });
  }

  function updateGalleryImage(index: number, next: Partial<OfferingGalleryImage>) {
    updateDetails({ galleryImages: details.galleryImages.map((item, i) => (i === index ? { ...item, ...next } : item)) });
  }

  function moveGalleryImage(from: number, to: number) {
    if (to < 0 || to >= details.galleryImages.length || from === to) return;
    const next = [...details.galleryImages];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    updateDetails({ galleryImages: next.map((item, order) => ({ ...item, order })) });
  }

  function removeGalleryImage(index: number) {
    updateDetails({ galleryImages: details.galleryImages.filter((_, i) => i !== index).map((item, order) => ({ ...item, order })) });
  }

  function updateIncludedItems(value: string) {
    updateDetails({ includedItems: toLines(value) });
  }

  function handleSelectImage(url: string) {
    if (pickerTarget === "hero") updateDetails({ heroImage: url });
    if (pickerTarget === "presentation") updateDetails({ heroPresentationImage: url });
    if (pickerTarget === "title") updateDetails({ titleImage: url });
    if (pickerTarget === "titleSecondary") updateDetails({ titleImageSecondary: url });
    if (pickerTarget === "seo") updateDetails({ seoImage: url });
    if (pickerTarget === "videoPoster") updateDetails({ videoPoster: url });
    if (pickerTarget === "gallery") {
      updateDetails({ galleryImages: [...details.galleryImages, { image: url, alt: "", seoTitle: "", seoDescription: "", order: details.galleryImages.length }] });
    }
    if (pickerTarget?.startsWith("gallery:")) {
      const index = Number(pickerTarget.split(":")[1]);
      if (Number.isInteger(index)) updateGalleryImage(index, { image: url });
    }
    setPickerTarget(null);
  }

  async function uploadImage(target: UploadTarget, file: File) {
    if (!file.type.startsWith("image/")) {
      setToast({ type: "error", message: "Selecciona un archivo de imagen valido." });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setToast({ type: "error", message: "La imagen supera el limite de 10 MB." });
      return;
    }

    setUploadingTarget(target);
    setToast(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "offerings");
    formData.append("title", file.name);
    formData.append("alt_text", title || file.name);

    try {
      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json().catch(() => ({})) as { asset?: { file_url?: string }; error?: string; optimization?: UploadOptimization };
      if (!response.ok) throw new Error(data.error || "No se pudo subir la imagen.");
      const url = data.asset?.file_url;
      if (!url) throw new Error("La subida no devolvió una URL.");

      if (target === "hero") updateDetails({ heroImage: url });
      if (target === "presentation") updateDetails({ heroPresentationImage: url });
      if (target === "title") updateDetails({ titleImage: url });
      if (target === "titleSecondary") updateDetails({ titleImageSecondary: url });
      if (target === "seo") updateDetails({ seoImage: url });
      if (target === "videoPoster") updateDetails({ videoPoster: url });
      if (target === "gallery:new") {
        updateDetails({ galleryImages: [...details.galleryImages, { image: url, alt: "", seoTitle: "", seoDescription: "", order: details.galleryImages.length }] });
        if (data.optimization) setGalleryUploadInfo((previous) => ({ ...previous, [url]: data.optimization! }));
      }

      if (target.startsWith("gallery:")) {
        const index = Number(target.split(":")[1]);
        if (Number.isInteger(index)) {
          updateGalleryImage(index, { image: url });
          if (data.optimization) setGalleryUploadInfo((previous) => ({ ...previous, [url]: data.optimization! }));
        }
      }
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "No se pudo subir la imagen.",
      });
    } finally {
      setUploadingTarget(null);
    }
  }

  function errorTab(errorKey: string): TabKey {
    if (errorKey === "heroTitle") return "hero";
    if (errorKey.startsWith("schedule-")) return "schedule";
    if (errorKey.startsWith("pricing-") || errorKey === "title" || errorKey === "slug" || errorKey === "whatsappNumber") return "basic";
    if (errorKey.startsWith("gallery-")) return "content";
    return "basic";
  }

  function focusValidationTarget(errorKey: string) {
    const selector = `[data-validation-key="${CSS.escape(errorKey)}"]`;
    window.setTimeout(() => {
      const target = document.querySelector<HTMLElement>(selector);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      const focusable = target.matches("input, textarea, select, button, [contenteditable='true']")
        ? target
        : target.querySelector<HTMLElement>("input, textarea, select, button, [contenteditable='true']");
      window.setTimeout(() => focusable?.focus({ preventScroll: true }), 250);
    }, 80);
  }

  function errorLabel(errorKey: string) {
    if (errorKey === "title") return "Información básica - Título interno";
    if (errorKey === "slug") return "Información básica - Slug (URL)";
    if (errorKey === "heroTitle") return "Hero - Título del hero";
    if (errorKey === "whatsappNumber") return "Información básica - WhatsApp";

    const pricing = errorKey.match(/^pricing-(\d+)$/);
    if (pricing) return `Información básica - Precio ${Number(pricing[1]) + 1}`;

    const gallery = errorKey.match(/^gallery-(\d+)$/);
    if (gallery) return `Adiciones - Imagen de galería ${Number(gallery[1]) + 1}`;

    const schedule = errorKey.match(/^schedule-(date|end|seats)-(\d+)$/);
    if (schedule) return `Horario - Día ${Number(schedule[2]) + 1}`;

    return errorKey;
  }

  function validationDetails(nextErrors: Record<string, string>) {
    return Object.entries(nextErrors).map(([key, message]) => `${errorLabel(key)}: ${message}`);
  }

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (!title.trim()) nextErrors.title = "El título es obligatorio.";
    if (!slug.trim()) nextErrors.slug = "El slug es obligatorio.";
    if (details.heroVariant === "text" && !details.heroTitle.trim()) nextErrors.heroTitle = "Agrega el título del hero.";
    if (details.heroVariant === "presentation" && !details.heroPresentationText.trim()) nextErrors.heroTitle = "Agrega el texto de presentación.";
    if (details.whatsappNumber && !/^\d+$/.test(details.whatsappNumber)) nextErrors.whatsappNumber = "Usa solo números, sin espacios.";
    details.pricing.forEach((item, index) => {
      if (item.price !== null && Number(item.price) < 0) nextErrors[`pricing-${index}`] = "El precio no puede ser negativo.";
    });
    details.galleryImages.forEach((item, index) => {
      if (item.image && !item.alt.trim()) nextErrors[`gallery-${index}`] = "El texto alternativo es obligatorio.";
    });
    setErrors(nextErrors);
    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setToast(null);

    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const intent: SaveIntent = submitter?.value === "publish" ? "publish" : "draft";
    const nextStatus = intent === "publish" ? "published" : "draft";

    const validationErrors = validate();
    const validationKeys = Object.keys(validationErrors);
    if (validationKeys.length > 0) {
      const firstErrorKey = validationKeys[0];
      setPendingValidationFocus(firstErrorKey);
      setActiveTab(errorTab(firstErrorKey));
      setToast({
        type: "error",
        message: `Encontré ${validationKeys.length === 1 ? "1 campo que necesita atención" : `${validationKeys.length} campos que necesitan atención`}.`,
        details: validationDetails(validationErrors),
      });
      return;
    }

    setIsSaving(true);
    setSavingIntent(intent);

    try {
      const pricing = details.pricing.filter((item) => item.description.trim() || item.price !== null).map((item, order) => ({ ...item, order }));
      const galleryImages = details.galleryImages.filter((item) => item.image).map((item, order) => ({ ...item, order }));
      const scheduleDays: ClassOfferingDetails["scheduleDays"] = [];
      const primaryPrice = pricing.find((item) => item.price !== null)?.price ?? null;
      const coverImage = details.heroVariant === "image" || details.heroVariant === "presentation" ? details.heroImage || DEFAULT_HERO_IMAGE : galleryImages[0]?.image || details.videoPoster || offering.cover_image_url;

      const response = await fetch(mode === "create" ? "/api/admin/offerings" : `/api/admin/offerings/${offering.id}`, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: slugify(slug),
          subtitle: subtitle.trim(),
          excerpt: details.highlightDescription.trim(),
          description,
          duration: details.durationText.trim(),
          type: offering.type,
          status: nextStatus,
          price: primaryPrice,
          currency: "EUR",
          cover_image_url: coverImage,
          gallery: galleryImages.map((item) => item.image),
          seo_title: seoTitle.trim(),
          seo_description: seoDescription.trim(),
          details: {
            ...offering.details,
            class: {
              ...details,
              heroMenuTone: details.heroMenuTone,
              heroMenuColor: details.heroMenuColor,
              heroMenuScale: details.heroMenuScale,
              heroImage: details.heroVariant === "image" || details.heroVariant === "presentation" ? details.heroImage || DEFAULT_HERO_IMAGE : details.heroImage,
              heroPresentationText: details.heroPresentationText.trim(),
              heroPresentationTextColor: details.heroPresentationTextColor.trim() || defaultClassDetails.heroPresentationTextColor,
              heroPresentationImage: details.heroPresentationImage.trim(),
              heroLogoPositionX: details.heroLogoPositionX.trim() || defaultClassDetails.heroLogoPositionX,
              heroLogoPositionY: details.heroLogoPositionY.trim() || defaultClassDetails.heroLogoPositionY,
              heroLogoWidth: details.heroLogoWidth.trim() || defaultClassDetails.heroLogoWidth,
              heroLogoTabletPositionX: details.heroLogoTabletPositionX.trim() || defaultClassDetails.heroLogoTabletPositionX,
              heroLogoTabletPositionY: details.heroLogoTabletPositionY.trim() || defaultClassDetails.heroLogoTabletPositionY,
              heroLogoTabletWidth: details.heroLogoTabletWidth.trim() || defaultClassDetails.heroLogoTabletWidth,
              heroLogoMobilePositionX: details.heroLogoMobilePositionX.trim() || defaultClassDetails.heroLogoMobilePositionX,
              heroLogoMobilePositionY: details.heroLogoMobilePositionY.trim() || defaultClassDetails.heroLogoMobilePositionY,
              heroLogoMobileWidth: details.heroLogoMobileWidth.trim() || defaultClassDetails.heroLogoMobileWidth,
              heroMenuPositionY: details.heroMenuPositionY.trim() || defaultClassDetails.heroMenuPositionY,
              heroMenuTabletPositionY: details.heroMenuTabletPositionY.trim() || defaultClassDetails.heroMenuTabletPositionY,
              heroMenuMobilePositionY: details.heroMenuMobilePositionY.trim() || defaultClassDetails.heroMenuMobilePositionY,
              showConsultCta: details.showConsultCta,
              showEnrollCta: details.showEnrollCta,
              ctaHref: details.showConsultCta ? details.ctaConsultHref.trim() || details.ctaHref.trim() : "",
              ctaConsultHref: details.showConsultCta ? details.ctaConsultHref.trim() : "",
              ctaEnrollHref: details.showEnrollCta ? details.ctaEnrollHref.trim() : "",
              ctaConsultLabel: details.showConsultCta ? details.ctaConsultLabel.trim() || defaultConsultLabel(offering.type) : "",
              ctaEnrollLabel: details.showEnrollCta ? details.ctaEnrollLabel.trim() || defaultEnrollLabel(offering.type) : "",
              menuPlacement: menuPlacementForType(offering.type),
              homeSections: [],
              pricing,
              galleryImages,
              scheduleDays,
              includedItems: details.includedItems.map((item) => item.trim()).filter(Boolean),
              heroTitle: details.heroTitle.trim(),
              heroSubtitle: details.heroSubtitle.trim(),
              highlightDescription: details.highlightDescription.trim(),
              homeExcerpt: details.homeExcerpt.trim(),
              durationText: details.durationText.trim(),
              whatsappNumber: details.whatsappNumber.trim(),
              scheduleDescription: details.scheduleDescription.trim(),
              showScheduleOnFrontend: details.showScheduleOnFrontend,
              seoImage: details.seoImage,
              videoUrl: details.videoUrl.trim(),
              videoPoster: details.videoPoster.trim(),
              content: {
                ...details.content,
                learningSectionTitle: details.content.learningSectionTitle.trim(),
                learningContent: details.content.learningContent.trim(),
                participationSectionTitle: details.content.participationSectionTitle.trim(),
                participationContent: details.content.participationContent.trim(),
                paymentMethods: (details.content.paymentMethodsList?.length ? details.content.paymentMethodsList : toLines(details.content.paymentMethods)).map((item) => item.trim()).filter(Boolean).join("\n"),
                paymentMethodsList: (details.content.paymentMethodsList?.length ? details.content.paymentMethodsList : toLines(details.content.paymentMethods)).map((item) => item.trim()).filter(Boolean),
                contactWhatsapp: details.content.contactWhatsapp.trim(),
                contactEmail: details.content.contactEmail.trim(),
                extraInfo: details.content.extraInfo.trim(),
                modulesSectionTitle: details.content.modulesSectionTitle.trim(),
                modulesAccordionTitle: details.content.modulesAccordionTitle.trim(),
                modules: details.content.modules.map((mod, order) => ({ ...mod, title: mod.title.trim(), description: mod.description.trim(), order })),
                activitiesSection: {
                  ...details.content.activitiesSection,
                  title: details.content.activitiesSection.title.trim(),
                  content: details.content.activitiesSection.content.trim(),
                  items: details.content.activitiesSection.items.map((item, order) => ({ ...item, title: item.title.trim(), description: item.description.trim(), order })),
                },
              },
            },
          },
        }),
      });

      const data = (await response.json().catch(() => ({}))) as { offering?: Offering; error?: string };
      if (!response.ok) {
        setToast({ type: "error", message: data.error || "No se pudieron guardar los cambios." });
        return;
      }

      setStatus(nextStatus);
      setIsDirty(false);
      setToast({
        type: "success",
        message: nextStatus === "published" ? "Publicado exitosamente." : "Borrador guardado correctamente.",
      });
      if (mode === "create" && data.offering?.id) {
        router.push(`${basePath}/${data.offering.id}/edit`);
      } else {
        router.refresh();
      }
    } catch {
      setToast({ type: "error", message: "No se pudo conectar con el servidor. Intenta nuevamente." });
    } finally {
      setIsSaving(false);
      setSavingIntent(null);
    }
  }

  function handleCancel() {
    if (isDirty && !window.confirm("Hay cambios sin guardar. ¿Salir igualmente?")) return;
    router.push(basePath);
  }

  return (
    <>
      <AdminActionModal
        open={Boolean(toast)}
        type={toast?.type}
        title={toast?.type === "success" ? "Acción completada" : "Revisa la edición"}
        message={toast?.message}
        details={toast?.details}
        confirmLabel="Entendido"
        onClose={() => {
          const focusKey = toast?.type === "error" ? pendingValidationFocus : null;
          setToast(null);
          if (focusKey) {
            focusValidationTarget(focusKey);
            setPendingValidationFocus(null);
          }
        }}
      />

      <div className="mb-6 border-b border-outline-variant">
        <div className="flex gap-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`whitespace-nowrap border-b-2 px-1 pb-3 text-label-md font-bold transition-colors ${
                activeTab === tab.key ? "border-secondary text-secondary" : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <form id="class-edit-form" onSubmit={handleSubmit} className="class-edit-form space-y-6">
        {activeTab === "hero" ? (
          <SharedHeroEditor
            details={details}
            titleFallback={title || "Título del hero"}
            subtitleFallback={subtitle || "Clases - Iniciación"}
            onChange={(next) => updateDetails(next as Partial<ClassOfferingDetails>)}
          />
        ) : null}

        {activeTab === "basic" ? (
          <>
            <Card padding="lg" className="space-y-5 rounded-2xl">
              <h2 className="text-headline-sm text-on-surface">Información básica</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <TextField
                  label="Título interno"
                  required
                  value={title}
                  error={errors.title}
                  validationKey="title"
                  onChange={(event) => { setTitle(event.target.value); setIsDirty(true); }}
                  onBlur={() => { if (!slug.trim()) setSlug(slugify(title)); }}
                />
                <TextField
                  label="Slug (URL)"
                  required
                  value={slug}
                  error={errors.slug}
                  validationKey="slug"
                  help="Si el slug ya existe, se agregará automáticamente un número al final."
                  onChange={(event) => { setSlug(slugify(event.target.value)); setIsDirty(true); }}
                />
              </div>
              <TextField label="Título del producto en página" value={subtitle} onChange={(event) => { setSubtitle(event.target.value); setIsDirty(true); }} />
              <RichTextField label="Texto remarcado café" value={details.highlightDescription} onChange={(value) => updateDetails({ highlightDescription: value })} minHeight="150px" />
              <RichTextField label="Texto normal / descripción" value={description} onChange={(value) => { setDescription(value); setIsDirty(true); }} minHeight="220px" />
              <div className="grid gap-4 md:grid-cols-2">
                <TextField label="Duración" value={details.durationText} placeholder="Sesiones de 2 h." onChange={(event) => updateDetails({ durationText: event.target.value })} />
                <TextField
                  label="WhatsApp"
                  value={details.whatsappNumber}
                  error={errors.whatsappNumber}
                  validationKey="whatsappNumber"
                  help="Formato internacional sin espacios. Ej: 34633788860"
                  onChange={(event) => updateDetails({ whatsappNumber: event.target.value })}
                />
              </div>
            </Card>

            <Card padding="lg" className="space-y-5 rounded-2xl">
              <div>
                <h2 className="text-headline-sm text-on-surface">Botones CTA</h2>
                <p className="mt-1 text-body-md text-on-surface-variant">
                  Define a dónde dirige cada botón de la página pública. Si un campo queda vacío, se usará WhatsApp.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
                  <Switch
                    checked={details.showConsultCta}
                    label="Mostrar Consultar / Comprar"
                    description="Controla el botón principal dentro de la ficha pública."
                    onCheckedChange={(checked) => updateDetails({ showConsultCta: checked })}
                  />
                  {details.showConsultCta ? (
                    <>
                      <TextField
                        label="Texto del botón"
                        value={details.ctaConsultLabel}
                        placeholder={defaultConsultLabel(offering.type)}
                        help="Texto final visible en la página pública."
                        onChange={(event) => updateDetails({ ctaConsultLabel: event.target.value })}
                      />
                      <TextField
                        label="URL de Consultar"
                        value={details.ctaConsultHref}
                        placeholder={defaultCtaHref(details)}
                        help="Destino del botón principal."
                        onChange={(event) => updateDetails({ ctaConsultHref: event.target.value, ctaHref: event.target.value })}
                      />
                    </>
                  ) : null}
                </div>
                <div className="space-y-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
                  <Switch
                    checked={details.showEnrollCta}
                    label="Mostrar Inscribirme"
                    description="Controla el CTA final de la ficha pública."
                    onCheckedChange={(checked) => updateDetails({ showEnrollCta: checked })}
                  />
                  {details.showEnrollCta ? (
                    <>
                      <TextField
                        label="Texto del botón"
                        value={details.ctaEnrollLabel}
                        placeholder={defaultEnrollLabel(offering.type)}
                        help="Texto final visible en la página pública."
                        onChange={(event) => updateDetails({ ctaEnrollLabel: event.target.value })}
                      />
                      <TextField
                        label="URL de Inscribirme"
                        value={details.ctaEnrollHref}
                        placeholder={defaultCtaHref(details)}
                        help="Destino del CTA final."
                        onChange={(event) => updateDetails({ ctaEnrollHref: event.target.value })}
                      />
                    </>
                  ) : null}
                </div>
              </div>
            </Card>

            <Card padding="lg" className="space-y-5 rounded-2xl">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-headline-sm text-on-surface">Precios</h2>
                <Button type="button" onClick={addPricing} size="sm">Agregar opción</Button>
              </div>
              <div className="space-y-3">
                {details.pricing.length ? details.pricing.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 gap-3 rounded-xl border border-outline-variant p-4 md:grid-cols-[1fr_140px_auto] md:items-start">
                    <TextField label="Descripción" placeholder="Bono 4 clases" value={item.description} onChange={(event) => updatePricing(index, { description: event.target.value })} />
                    <TextField label="Precio (€)" type="number" min={0} value={item.price ?? ""} error={errors[`pricing-${index}`]} validationKey={`pricing-${index}`} onChange={(event) => updatePricing(index, { price: event.target.value === "" ? null : Number(event.target.value) })} />
                    <button type="button" onClick={() => removePricing(index)} className="mt-7 inline-flex h-10 w-10 items-center justify-center rounded-lg text-error hover:bg-error-container" aria-label="Eliminar precio">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                )) : <p className="text-body-md text-on-surface-variant">No hay opciones de precio cargadas.</p>}
              </div>
            </Card>
          </>
        ) : null}

        {activeTab === "schedule" ? (
          <>
            <Card padding="lg" className="space-y-5 rounded-2xl">
              <div>
                <h2 className="text-headline-sm text-on-surface">Horario</h2>
                <p className="mt-1 text-body-md text-on-surface-variant">
                  Escribe el horario como texto libre y define si debe mostrarse en la página pública.
                </p>
              </div>
              <TextAreaField label="Horario en texto" value={details.scheduleDescription} onChange={(event) => updateDetails({ scheduleDescription: event.target.value, scheduleDays: [] })} className="min-h-[160px]" />
              <Switch
                checked={details.showScheduleOnFrontend}
                label="Mostrar horarios en la página pública"
                description="Controla si el texto de horario aparece dentro de la ficha del producto."
                onCheckedChange={(checked) => updateDetails({ showScheduleOnFrontend: checked })}
              />
            </Card>
          </>
        ) : null}

        {activeTab === "content" ? (
          <>
            <Card padding="lg" className="space-y-5 rounded-2xl">
              <h2 className="text-headline-sm text-on-surface">Galería, video e incluye</h2>
              <RichTextField
                label="Qué incluye"
                value={details.includedItems.join("\n")}
                onChange={updateIncludedItems}
                minHeight="150px"
                placeholder="Un elemento por línea. Puedes usar negritas, itálica, listas y enlaces."
              />
              <div className="grid gap-4 md:grid-cols-[1fr_260px]">
                <TextField label="Video URL" value={details.videoUrl} placeholder="https://..." onChange={(event) => updateDetails({ videoUrl: event.target.value })} />
                <div>
                  <FieldLabel>Poster del video</FieldLabel>
                  <ImagePreview src={details.videoPoster} alt="Poster de video" />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <label className="secondary-btn cms-hero-image-field__button" htmlFor="videoPoster-upload" aria-disabled={uploadingTarget === "videoPoster"}>
                      {uploadingTarget === "videoPoster" ? "Subiendo..." : details.videoPoster ? "Sustituir" : "Subir imagen"}
                    </label>
                    <input
                      id="videoPoster-upload"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      disabled={uploadingTarget === "videoPoster"}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void uploadImage("videoPoster", file);
                        event.target.value = "";
                      }}
                    />
                    <Button type="button" variant="outlined" size="sm" onClick={() => setPickerTarget("videoPoster")}>
                      {details.videoPoster ? "Abrir biblioteca" : "Seleccionar imagen"}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            <Card padding="lg" className="space-y-5 rounded-2xl">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-headline-sm text-on-surface">Imágenes de producto</h2>
                  <p className="mt-1 text-body-md text-on-surface-variant">Ordena las imágenes y agrega un texto alternativo breve para accesibilidad.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className="secondary-btn cms-hero-image-field__button" htmlFor="gallery-new-upload" aria-disabled={uploadingTarget === "gallery:new"}>
                    {uploadingTarget === "gallery:new" ? "Subiendo..." : "Subir imagen"}
                  </label>
                  <input
                    id="gallery-new-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="sr-only"
                    disabled={uploadingTarget === "gallery:new"}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void uploadImage("gallery:new", file);
                      event.target.value = "";
                    }}
                  />
                  <Button type="button" variant="outlined" onClick={() => setPickerTarget("gallery")}>Anadir imagen</Button>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {details.galleryImages.map((item, index) => (
                  <div
                    key={`${item.image}-${index}`}
                    draggable
                    onDragStart={() => setDraggedGalleryIndex(index)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => {
                      if (draggedGalleryIndex !== null) moveGalleryImage(draggedGalleryIndex, index);
                      setDraggedGalleryIndex(null);
                    }}
                    className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="text-label-md font-bold uppercase tracking-wide text-on-surface-variant">Imagen {index + 1}</span>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => moveGalleryImage(index, index - 1)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface-container-high" aria-label="Subir imagen">
                          <span className="material-symbols-outlined text-lg">arrow_upward</span>
                        </button>
                        <button type="button" onClick={() => moveGalleryImage(index, index + 1)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface-container-high" aria-label="Bajar imagen">
                          <span className="material-symbols-outlined text-lg">arrow_downward</span>
                        </button>
                        <button type="button" onClick={() => removeGalleryImage(index)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-error hover:bg-error-container" aria-label="Eliminar imagen">
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-[160px_minmax(0,1fr)] md:items-start">
                      <div className="space-y-2">
                        <ImagePreview src={item.image} alt={item.alt || `Imagen ${index + 1}`} aspect="h-24 w-full md:h-[104px]" />
                        {galleryUploadInfo[item.image] ? (
                          <p className="text-xs leading-5 text-on-surface-variant">
                            Original: {formatFileSize(galleryUploadInfo[item.image].originalSize)}. Optimizada: {formatFileSize(galleryUploadInfo[item.image].finalSize)} ({galleryUploadInfo[item.image].reductionPercent}% menos).
                          </p>
                        ) : null}
                        <div className="flex flex-col gap-2">
<Button type="button" variant="outlined" size="sm" className="w-full" onClick={() => setPickerTarget(`gallery:${index}`)}>
                            Sustituir
                          </Button>
                        </div>
                      </div>
                      <TextField label="Texto alternativo (ALT)" required value={item.alt} error={errors[`gallery-${index}`]} validationKey={`gallery-${index}`} onChange={(event) => updateGalleryImage(index, { alt: event.target.value })} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <ClassContentTab
              content={details.content}
              onChange={(content) => updateDetails({ content })}
              onDirty={() => setIsDirty(true)}
            />
          </>
        ) : null}

        {activeTab === "seo" ? (
          <>
            <Card padding="lg" className="space-y-5 rounded-2xl">
              <h2 className="text-headline-sm text-on-surface">SEO</h2>
              <TextField label="Título SEO" value={seoTitle} maxLength={70} help={`Caracteres: ${seoTitle.length}/70`} onChange={(event) => { setSeoTitle(event.target.value); setIsDirty(true); }} />
              <TextAreaField label="Descripción SEO" value={seoDescription} maxLength={160} help={`Caracteres: ${seoDescription.length}/160`} onChange={(event) => { setSeoDescription(event.target.value); setIsDirty(true); }} className="min-h-[100px]" />
            </Card>
            <Card padding="lg" className="space-y-5 rounded-2xl">
              <h2 className="text-headline-sm text-on-surface">Open Graph</h2>
              <ImagePreview src={details.seoImage} alt="Imagen SEO" />
              <Button type="button" variant="outlined" size="sm" onClick={() => setPickerTarget("seo")}>{details.seoImage ? "Reemplazar imagen" : "Establecer imagen SEO"}</Button>
              <div className="overflow-hidden rounded-xl border border-outline-variant bg-white p-4">
                <p className="truncate text-sm text-[#1a0dab]">{seoTitle || title || "Título SEO"}</p>
                <p className="truncate text-sm text-[#006d21]">{slug ? `casarosierceramica.com/clases/${slug}` : "casarosierceramica.com/clases/ejemplo"}</p>
                <p className="mt-1 line-clamp-2 text-sm text-[#545454]">{seoDescription || renderPlainText(description) || "Descripción SEO de la clase..."}</p>
              </div>
            </Card>
          </>
        ) : null}

        {activeTab === "additions" ? (
          <>
            <Card padding="lg" className="space-y-5 rounded-2xl">
              <div>
                <h2 className="text-headline-sm text-on-surface">Adiciones</h2>
                <p className="mt-1 text-body-md text-on-surface-variant">Activa bloques complementarios que se muestran al final de la página, antes del footer.</p>
              </div>
              <Switch
                checked={details.showIdeaPromptSection}
                label="Incluir galería social al final de la página"
                description="Muestra la sección “Y tu, cuando tuviste tu ultima idea?” con la galería social pública antes del footer."
                onCheckedChange={(checked) => updateDetails({ showIdeaPromptSection: checked })}
              />
            </Card>

            <Card padding="lg" className="space-y-5 rounded-2xl">
              <div>
                <h2 className="text-headline-sm text-on-surface">Vista del componente</h2>
                <p className="mt-1 text-body-md text-on-surface-variant">Referencia real de la sección que se insertará al final de la página pública.</p>
              </div>
              {details.showIdeaPromptSection ? (
                <div className="overflow-hidden rounded-2xl border border-outline-variant bg-white">
                  <PublicSocialGalleryPreview previewChrome={previewChrome} />
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-low p-8 text-center">
                  <p className="text-body-md font-semibold text-on-surface">La galería social está deshabilitada para esta página.</p>
                  <p className="mt-1 text-label-md text-on-surface-variant">Activa el switch superior para incluirla antes del footer.</p>
                </div>
              )}
            </Card>
          </>
        ) : null}

        {activeTab === "preview" ? (
          <>
            <PreviewPane offeringType={offering.type} title={title} slug={slug} subtitle={subtitle} description={description} status={status} details={details} previewChrome={previewChrome} />
            <Card padding="lg" className="space-y-5 rounded-2xl">
              <h2 className="text-headline-sm text-on-surface">Publicación</h2>
              <p className="text-body-md text-on-surface-variant">Guarda como borrador o publica esta página. Al publicar, este producto queda listo para mostrarse en su categoría correspondiente.</p>
              <div className="flex flex-wrap gap-3">
                <Button type="submit" name="intent" value="draft" variant="outlined" disabled={isSaving} aria-busy={isSaving && savingIntent === "draft"}>
                  {isSaving && savingIntent === "draft" ? "Guardando..." : "Borrador"}
                </Button>
                <Button type="submit" name="intent" value="publish" disabled={isSaving} aria-busy={isSaving && savingIntent === "publish"}>
                  {isSaving && savingIntent === "publish" ? "Publicando..." : "Publicar"}
                </Button>
              </div>
            </Card>
          </>
        ) : null}

        <div className="border-t border-outline-variant pt-5">
          <Button type="button" variant="ghost" onClick={handleCancel}>Cancelar</Button>
        </div>

        <div className="admin-sticky-actionbar">
          <span className="admin-sticky-actionbar__meta">{isDirty ? "Cambios sin guardar" : "Cambios al día"}</span>
          <Button type="button" variant="outlined" onClick={() => setActiveTab("preview")}>
            Vista previa
          </Button>
          <Button type="submit" name="intent" value="draft" variant="outlined" disabled={isSaving} aria-busy={isSaving && savingIntent === "draft"}>
            {isSaving && savingIntent === "draft" ? "Guardando..." : "Borrador"}
          </Button>
          <Button type="submit" name="intent" value="publish" disabled={isSaving} aria-busy={isSaving && savingIntent === "publish"}>
            {isSaving && savingIntent === "publish" ? "Publicando..." : "Publicar"}
          </Button>
        </div>
      </form>

      <MediaLibraryModal
        open={pickerTarget !== null}
        onSelect={handleSelectImage}
        onClose={() => setPickerTarget(null)}
      />
    </>
  );
}
