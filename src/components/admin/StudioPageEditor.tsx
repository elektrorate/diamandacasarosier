"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "@/components/admin/AdminLink";
import { SocialGallery } from "@/components/home/SocialGallery";
import PublicFaqSection from "@/features/shared/contextual-sections/PublicFaqSection";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import type { NavigationItem } from "@/data/types";
import { getIdeaPromptContent } from "@/features/shared/contextual-sections/ideaPromptContent";
import Switch from "@/components/ui/Switch";
import { StudioProfileBlock } from "@/features/studio/StudioProfileBlock";
import { assetPath } from "@/lib/assets";
import { normalizeHeroSettings } from "@/lib/cms/hero-settings";
import type { SiteSettings } from "@/lib/cms/settings";
import type { Faq, FaqGroup, SocialGallery as CmsSocialGallery, StudioPageSettings, Teacher } from "@/lib/cms/types";
import AdminActionModal from "./AdminActionModal";
import CmsPublicHeroPreview from "./CmsPublicHeroPreview";
import RichTextField from "./RichTextField";
import SharedHeroEditor from "./SharedHeroEditor";
import TeachersTable from "./TeachersTable";

type TabKey = "hero" | "specialists" | "content" | "additions" | "preview";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "hero", label: "Hero" },
  { key: "specialists", label: "Especialistas" },
  { key: "content", label: "Texto libre" },
  { key: "additions", label: "Adiciones" },
  { key: "preview", label: "Vista previa" },
];

export default function StudioPageEditor({
  page,
  teachers,
  navigationItems,
  menuSettings,
  socialGallery,
  faqs,
  faqGroups,
}: {
  page: StudioPageSettings;
  teachers: Teacher[];
  navigationItems: NavigationItem[];
  menuSettings: SiteSettings["menu"];
  socialGallery: CmsSocialGallery | null;
  faqs: Faq[];
  faqGroups: FaqGroup[];
}) {
  const [tab, setTab] = useState<TabKey>("hero");
  const [status, setStatus] = useState(page.status);
  const [hero, setHero] = useState(() => normalizeHeroSettings(page.hero, {
    heroTitle: "El Estudio",
    heroSubtitle: "Casa Rosier",
  }));
  const [introContent, setIntroContent] = useState(page.introContent);
  const [showIdeaPromptSection, setShowIdeaPromptSection] = useState(page.showIdeaPromptSection);
  const [showFaqSection, setShowFaqSection] = useState(page.showFaqSection);
  const [faqGroupId, setFaqGroupId] = useState(page.faqGroupId);
  const [seoTitle] = useState(page.seo_title);
  const [seoDescription] = useState(page.seo_description);
  const [seoImage] = useState(page.seo_image);
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState<{ type: "success" | "error"; title: string; message?: string } | null>(null);

  const visibleTeachers = teachers
    .filter((teacher) => teacher.status !== "deleted")
    .sort((a, b) => a.sort_order - b.sort_order);
  const publishedTeachers = visibleTeachers.filter((teacher) => teacher.status === "published");
  const socialGalleryProps = getStudioSocialGalleryProps(socialGallery);
  const selectedFaqBlock = getSelectedFaqBlock(faqs, faqGroups, faqGroupId);

  async function save(nextStatus = status) {
    setIsLoading(true);
    setModal(null);
    const response = await fetch("/api/admin/studio-page", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: nextStatus,
        hero,
        introContent,
        showIdeaPromptSection,

        showFaqSection,

        faqGroupId,
        seo_title: seoTitle,
        seo_description: seoDescription,
        seo_image: seoImage,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({})) as { error?: string };
      setModal({ type: "error", title: "No se pudo guardar", message: data.error || "Intenta de nuevo." });
      setIsLoading(false);
      return;
    }

    setStatus(nextStatus);
    setModal({
      type: "success",
      title: nextStatus === "published" ? "Página publicada" : "Borrador guardado",
      message: "Los cambios de El Estudio se guardaron correctamente.",
    });
    setIsLoading(false);
  }

  return (
    <div className="cms-editor-shell">
      <AdminActionModal
        open={Boolean(modal)}
        type={modal?.type}
        title={modal?.title ?? ""}
        message={modal?.message}
        confirmLabel="Entendido"
        onClose={() => setModal(null)}
      />

      <header className="cms-page-editor-head">
        <div className="cms-page-editor-head__main">
          <h1>El Estudio</h1>
          <p>Edición personalizada de página del estudio</p>
          <div className="cms-page-editor-meta" aria-label="Resumen de página">
            <span className={`status-pill status-pill--${status}`}>{status}</span>
            <span>{publishedTeachers.length} especialistas publicados</span>
            <span>{showIdeaPromptSection ? "Idea activa" : "Idea oculta"}</span>
            <span>{showFaqSection ? "FAQ activo" : "FAQ oculto"}</span>
          </div>
        </div>
        <div className="cms-page-editor-actions">
          <Link className="secondary-btn" href="/admin">Volver</Link>
          <button type="button" className="secondary-btn cms-outline-accent" onClick={() => save("draft")} disabled={isLoading}>
            {isLoading ? "Guardando..." : "Borrador"}
          </button>
          <button type="button" className="primary-btn" onClick={() => save("published")} disabled={isLoading}>
            {isLoading ? "Publicando..." : "Publicar"}
          </button>
        </div>
      </header>

      <nav className="cms-editor-tabs" aria-label="Secciones del editor de Estudio">
        {tabs.map((item) => (
          <button type="button" key={item.key} className={tab === item.key ? "is-active" : ""} onClick={() => setTab(item.key)}>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="cms-editor-main">
        {tab === "hero" ? (
          <SharedHeroEditor
            details={hero}
            titleFallback="El Estudio"
            subtitleFallback="Casa Rosier"
            onChange={(next) => setHero((current) => ({ ...current, ...next }))}
          />
        ) : null}

        {tab === "specialists" ? (
          <section className="form-block cms-editor-card">
            <div className="cms-editor-card__head">
              <div>
                <p className="auth-kicker">Paso 2</p>
                <h3>Especialistas</h3>
              </div>
              <Link className="primary-btn" href="/admin/estudio/new">Crear especialista</Link>
            </div>
            {visibleTeachers.length ? <TeachersTable items={visibleTeachers} basePath="/admin/estudio" showDuplicate={false} showArchive={false} /> : (
              <div className="empty-inline">
                <strong>Aún no hay especialistas.</strong>
                <span>Crea perfiles para mostrarlos en la página pública.</span>
              </div>
            )}
          </section>
        ) : null}

        {tab === "content" ? (
          <section className="form-block cms-editor-card">
            <div className="cms-editor-card__head">
              <div>
                <p className="auth-kicker">Paso 3</p>
                <h3>Editor libre</h3>
              </div>
            </div>
            <RichTextField label="Contenido libre" value={introContent} onChange={setIntroContent} minHeight="320px" />
          </section>
        ) : null}

        {tab === "additions" ? (
          <div className="cms-studio-additions">
            <section className="form-block cms-editor-card cms-studio-additions__card">
              <div className="cms-studio-additions__head">
                <h3>Adiciones</h3>
                <p>Activa bloques complementarios que se muestran al final de la página, antes del footer.</p>
              </div>
              <div className="cms-studio-additions__toggle-row">
                <Switch
                  checked={showFaqSection}
                  onCheckedChange={setShowFaqSection}
                  label="Incluir FAQ al final de la pagina"
                  description="Muestra preguntas frecuentes publicadas antes de la galeria social y del footer."
                />
                <label className="field cms-studio-additions__select">
                  <span>FAQ a mostrar</span>
                  <select value={faqGroupId} onChange={(event) => setFaqGroupId(event.target.value)} disabled={!showFaqSection}>
                    <option value="">Seleccionar FAQ</option>
                    {faqGroups.filter((group) => group.status === "published" && group.deleted_at === null).map((group) => (
                      <option key={group.id} value={group.id}>{group.title}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="cms-studio-additions__toggle-row">
                <Switch
                  checked={showIdeaPromptSection}
                  onCheckedChange={setShowIdeaPromptSection}
                  label="Incluir galeria social al final de la pagina"
                  description="Muestra la seccion de galeria social publica antes del footer."
                />
              </div>
            </section>

            <section className="form-block cms-editor-card cms-studio-additions__card">
              <div className="cms-studio-additions__head">
                <h3>Vista del componente</h3>
                <p>Referencia real de las adiciones que se insertaran al final de la pagina publica.</p>
              </div>
              <div className="cms-studio-additions__preview" aria-label="Vista previa de adiciones publicas">
                {showFaqSection ? (
                  selectedFaqBlock ? (
                    <PublicFaqSection block={selectedFaqBlock} />
                  ) : (
                    <div className="empty-inline">
                      <strong>No hay una FAQ publicada seleccionada.</strong>
                      <span>Selecciona un grupo FAQ publicado para mostrarlo en el frontend.</span>
                    </div>
                  )
                ) : null}
                {showIdeaPromptSection ? (
                  <SocialGallery {...socialGalleryProps} />
                ) : null}
                {!showFaqSection && !showIdeaPromptSection ? (
                  <div className="empty-inline">
                    <strong>Adiciones desactivadas.</strong>
                    <span>Activa al menos una adicion para ver el componente publico.</span>
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        ) : null}

        {tab === "preview" ? (
          <StudioPreview
            hero={hero}
            introContent={introContent}
            teachers={publishedTeachers}
            showIdeaPromptSection={showIdeaPromptSection}

            showFaqSection={showFaqSection}

            faqGroupId={faqGroupId}

            faqs={faqs}
            faqGroups={faqGroups}
            navigationItems={navigationItems}
            menuSettings={menuSettings}
            socialGallery={socialGallery}
          />
        ) : null}
      </div>

      <div className="admin-sticky-actionbar">
        <span className="admin-sticky-actionbar__meta">{publishedTeachers.length} especialistas publicados · {showIdeaPromptSection ? "Idea activa" : "Idea oculta"} · {showFaqSection ? "FAQ activo" : "FAQ oculto"}</span>
        <button type="button" className="secondary-btn" onClick={() => setTab("preview")}>Vista previa</button>
        <button type="button" className="secondary-btn" onClick={() => save("draft")} disabled={isLoading}>{isLoading ? "Guardando..." : "Borrador"}</button>
        <button type="button" className="primary-btn" onClick={() => save("published")} disabled={isLoading}>{isLoading ? "Publicando..." : "Publicar"}</button>
      </div>
    </div>
  );
}

function StudioPreview({
  hero,
  introContent,
  teachers,
  showIdeaPromptSection,

  showFaqSection,

  faqGroupId,

  faqs,
  faqGroups,
  navigationItems,
  menuSettings,
  socialGallery,
}: {
  hero: StudioPageSettings["hero"];
  introContent: string;
  teachers: Teacher[];
  showIdeaPromptSection: boolean;

  showFaqSection: boolean;

  faqGroupId: string;

  faqs: Faq[];
  faqGroups: FaqGroup[];
  navigationItems: NavigationItem[];
  menuSettings: SiteSettings["menu"];
  socialGallery: CmsSocialGallery | null;
}) {
  const socialGalleryProps = getStudioSocialGalleryProps(socialGallery);
  const selectedFaqBlock = getSelectedFaqBlock(faqs, faqGroups, faqGroupId);

  return (
    <div className="cms-preview-frame">
      <div className="cms-public-preview__toolbar">
        Vista previa de escritorio · Publicado
      </div>
      <div className="cms-public-preview studio-page">
        <div className="cms-public-preview__scale">
          <CmsPublicHeroPreview
            hero={hero}
            navigationItems={navigationItems}
            menuSettings={menuSettings}
            height="large"
          >
            {hero.heroVariant === "presentation" ? (
              <div className="page-hero__presentation">
                <div className="page-hero__presentation-text" style={{ color: hero.heroPresentationTextColor || "#FFFFFF" }}>
                  <MarkdownContent source={hero.heroPresentationText || hero.heroTitle} className="page-hero__presentation-copy" />
                </div>
                {hero.heroPresentationImage ? (
                  <div className="page-hero__presentation-image">
                    <Image src={hero.heroPresentationImage} alt={hero.heroTitle || "El Estudio"} fill sizes="420px" className="object-contain" unoptimized />
                  </div>
                ) : null}
              </div>
            ) : hero.heroVariant === "image" ? (
              <div className="page-hero__script-stack">
                {hero.titleImage ? (
                  <Image src={hero.titleImage} alt={hero.heroTitle || "El Estudio"} fill sizes="520px" className="page-hero__script-image page-hero__script-image--back" unoptimized />
                ) : null}
                {hero.titleImageSecondary ? (
                  <Image src={hero.titleImageSecondary} alt={hero.heroTitle || "El Estudio"} fill sizes="520px" className="page-hero__script-image page-hero__script-image--front" unoptimized />
                ) : null}
              </div>
            ) : (
              <div>
                <h1 className="page-hero__title">{hero.heroTitle || "El Estudio"}</h1>
                {hero.heroSubtitle ? <p className="page-hero__eyebrow">{hero.heroSubtitle}</p> : null}
              </div>
            )}
          </CmsPublicHeroPreview>
          <section className="studio-editorial-intro section is-visible">
            <div className="studio-editorial-intro__inner">
              <MarkdownContent className="studio-editorial-intro__lede" source={introContent} />
            </div>
          </section>
          <section className="studio-narrative section">
            <div className="container studio-narrative__container">
              {teachers.map((teacher) => (
                <StudioProfileBlock key={teacher.id} name={teacher.name} role={teacher.specialty} image={assetPath(teacher.image_id || "/img/social-1.jpg")} intro={teacher.bio} />
              ))}
            </div>
          </section>
          {showFaqSection && selectedFaqBlock ? <PublicFaqSection block={selectedFaqBlock} /> : null}
          {showIdeaPromptSection ? <SocialGallery {...socialGalleryProps} /> : null}
        </div>
      </div>
    </div>
  );
}


function getSelectedFaqBlock(faqs: Faq[], groups: FaqGroup[], groupId: string) {
  if (!groupId) return null;
  const group = groups.find((item) => item.id === groupId && item.status === "published" && item.deleted_at === null);
  if (!group) return null;
  const selectedFaqs = faqs
    .filter((faq) => faq.status === "published" && faq.deleted_at === null && faq.faq_group_id === groupId)
    .sort((a, b) => (a.topic_title || "").localeCompare(b.topic_title || "") || a.sort_order - b.sort_order || a.question.localeCompare(b.question));
  if (!selectedFaqs.length) return null;
  return { group, faqs: selectedFaqs };
}

function getStudioSocialGalleryProps(gallery: CmsSocialGallery | null) {
  const fallback = getIdeaPromptContent("studio");
  const posts = gallery?.items
    .filter((item) => item.is_visible !== false && item.image_url)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((item) => ({
      image: item.image_url,
      title: item.title,
      body: item.description,
      instagramUrl: item.instagram_url,
    }));

  return {
    id: fallback.id,
    title: gallery?.title || fallback.title,
    subtitle: gallery?.description || fallback.subtitle,
    posts: posts?.length ? posts : fallback.posts,
    ariaLabel: fallback.ariaLabel,
    sourceHref: gallery?.cta_url || fallback.sourceHref,
  };
}


