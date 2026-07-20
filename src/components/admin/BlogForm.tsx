"use client";

import Image from "next/image";
import Link from "@/components/admin/AdminLink";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BlogDetail } from "@/components/blog/BlogDetail";
import { SocialGallery } from "@/components/home/SocialGallery";
import type { BlogContentBlock, BlogPost as PublicBlogPost, NavigationItem } from "@/data/types";
import type { BlogPost as CmsBlogPost, BlogPostBlock, BlogPostStatus } from "@/lib/cms/types";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import Switch from "@/components/ui/Switch";
import AdminActionModal from "./AdminActionModal";
import CmsPublicHeroPreview from "./CmsPublicHeroPreview";
import MediaSelectField from "./MediaSelectField";
import RichTextField from "@/components/editor/RichTextEditor";
import SharedHeroEditor from "./SharedHeroEditor";
import { normalizeHeroSettings } from "@/lib/cms/hero-settings";
import type { SiteSettings } from "@/lib/cms/settings";
import { formatDate } from "@/lib/utils";

type StepKey = "hero" | "structure" | "preview";

const categoryOptions = ["Procesos", "Esmaltes", "Taller"] as const;
function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
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
  help,
  required,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; help?: string; required?: boolean; error?: string }) {
  return (
    <div className="space-y-1.5">
      <FieldLabel required={required}>{label}</FieldLabel>
      <input
        {...props}
        className={`block min-h-11 w-full rounded-xl border bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface transition-colors placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary-container ${
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
  help,
  required,
  error,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; help?: string; required?: boolean; error?: string }) {
  return (
    <div className="space-y-1.5">
      <FieldLabel required={required}>{label}</FieldLabel>
      <textarea
        {...props}
        className={`block min-h-[112px] w-full rounded-xl border bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface transition-colors placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary-container ${
          error ? "border-error" : "border-outline-variant"
        } ${props.className ?? ""}`}
      />
      {help && !error ? <p className="text-label-md text-on-surface-variant/70">{help}</p> : null}
      {error ? <p className="text-label-md text-error">{error}</p> : null}
    </div>
  );
}

function SelectField({
  label,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <FieldLabel>{label}</FieldLabel>
      <select
        {...props}
        className="block min-h-11 w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-container"
      >
        {children}
      </select>
    </div>
  );
}

function SwitchField({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <Switch checked={checked} label={label} description={description} onCheckedChange={onChange} />
  );
}

function paragraphsFromText(text: string): BlogContentBlock[] {
  return text
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((content) => ({ type: "paragraph", content }));
}

function blocksToPreviewContent(blocks: BlogPostBlock[]): BlogContentBlock[] {
  const content: BlogContentBlock[] = [];
  let pendingImages: Array<{ src: string; alt?: string }> = [];

  const flushImages = () => {
    if (pendingImages.length === 1) content.push({ type: "image", src: pendingImages[0].src, alt: pendingImages[0].alt });
    else if (pendingImages.length > 1) content.push({ type: "gallery", images: pendingImages });
    pendingImages = [];
  };

  for (const block of blocks.filter((item) => item.is_visible !== false)) {
    if (block.type === "image") {
      if (block.image_id) pendingImages.push({ src: block.image_id, alt: block.title || undefined });
      continue;
    }

    flushImages();

    if (block.type === "heading") content.push({ type: "heading", level: block.custom_html === "2" ? 2 : 3, content: block.title || block.text });
    else if (block.type === "quote") content.push({ type: "quote", content: block.text || block.title });
    else if (block.type === "list") {
      const items = block.text.split("\n").map((item) => item.replace(/^[-*\d.]+\s*/, "").trim()).filter(Boolean);
      if (items.length) content.push({ type: "list", items });
    } else if (block.type === "cta" && block.title && block.source_url) {
      content.push({ type: "cta", text: block.title, href: block.source_url });
    } else {
      content.push(...paragraphsFromText(block.text || block.title));
    }
  }

  flushImages();
  return content;
}

function BlogPublicPreview({
  title,
  excerpt,
  cover,
  blocks,
  hero,
  category,
  slug,
  status,
  isFeatured,
  featuredOrder,
  featuredExcerpt,
  visibleInListing,
  sortOrder,
  seoTitle,
  seoDescription,
  publishedAt,
  navigationItems,
  menuSettings,
}: {
  title: string;
  excerpt: string;
  cover: string;
  blocks: BlogPostBlock[];
  hero: CmsBlogPost["hero"];
  category: string;
  slug: string;
  status: BlogPostStatus;
  isFeatured: boolean;
  featuredOrder: number;
  featuredExcerpt: string;
  visibleInListing: boolean;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
  publishedAt: string;
  navigationItems: NavigationItem[];
  menuSettings: SiteSettings["menu"];
}) {
  const previewPost: PublicBlogPost = {
    id: "preview",
    title: title || "Título de la bitácora",
    slug: slug || "vista-previa",
    excerpt: excerpt || "Texto introductorio de la bitácora.",
    coverImage: cover || hero.heroImage || "/img/social-2.jpg",
    category: category || "Procesos",
    tags: [],
    author: "Casa Rosier",
    authorInitial: "C",
    status: status === "published" ? "published" : "draft",
    isFeatured,
    featuredOrder,
    featuredImage: cover || undefined,
    featuredExcerpt: featuredExcerpt || excerpt,
    featuredOnHome: false,
    visibleInListing,
    manualOrder: sortOrder,
    publishedAt,
    seoTitle: seoTitle || title,
    seoDescription: seoDescription || excerpt,
    hero,
    contentBlocks: blocksToPreviewContent(blocks),
  };
  const heroVariant = hero.heroVariant ?? "image";

  return (
    <div className="cms-preview-frame">
      <div className="cms-public-preview__toolbar">
        Vista previa de escritorio · {status === "published" ? "Publicado" : "Borrador"}
      </div>
      <div className="cms-public-preview blog-post-page">
        <div className="cms-public-preview__scale">
          <CmsPublicHeroPreview
            hero={hero}
            navigationItems={navigationItems}
            menuSettings={menuSettings}
            height="small"
            className="blog-hero"
          >
            {heroVariant === "presentation" ? (
              <div className="page-hero__presentation">
              <div className="page-hero__presentation-text" style={{ color: hero.heroPresentationTextColor || "#FFFFFF" }}>
                <MarkdownContent source={hero.heroPresentationText || hero.heroTitle || title} className="page-hero__presentation-copy" />
              </div>
              {hero.heroPresentationImage ? (
                <div className="page-hero__presentation-image">
                  <Image src={hero.heroPresentationImage} alt={hero.heroTitle || title} fill sizes="420px" className="object-contain" unoptimized />
                </div>
              ) : null}
              </div>
            ) : (
              <>
                <p className="blog-post-hero__category">{previewPost.category}</p>
                <h1 className="page-hero__title blog-hero__title">{hero.heroTitle || previewPost.title}</h1>
                <p className="blog-post-hero__meta">{previewPost.author} · {formatDate(previewPost.publishedAt)}</p>
              </>
            )}
          </CmsPublicHeroPreview>

          <div className="cms-public-preview__body">
            <BlogDetail post={previewPost} adjacent={{ previous: null, next: null }} relatedPosts={[]} />
            <SocialGallery />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BlogForm({
  mode,
  item,
  navigationItems,
  menuSettings,
}: {
  mode: "create" | "edit";
  item?: CmsBlogPost;
  navigationItems: NavigationItem[];
  menuSettings: SiteSettings["menu"];
}) {
  const router = useRouter();
  const itemCategory = item?.category ?? "Procesos";
  const hasKnownCategory = categoryOptions.includes(itemCategory as (typeof categoryOptions)[number]);
  const [step, setStep] = useState<StepKey>("hero");
  const [title, setTitle] = useState(item?.title ?? "");
  const [slug, setSlug] = useState(item?.slug ?? "");
  const [status, setStatus] = useState<BlogPostStatus>(item?.status ?? "draft");
  const [excerpt, setExcerpt] = useState(item?.excerpt ?? "");
  const [listingExcerpt, setListingExcerpt] = useState(item?.listing_excerpt ?? "");
  const [featuredImageId, setFeaturedImageId] = useState(item?.featured_image_id ?? "");
  const [categoryMode, setCategoryMode] = useState(hasKnownCategory ? itemCategory : "custom");
  const [customCategory, setCustomCategory] = useState(hasKnownCategory ? "" : itemCategory);
  const [isFeatured] = useState(item?.is_featured ?? false);
  const [featuredOrder] = useState(item?.featured_order ?? 0);
  const [featuredExcerpt] = useState(item?.featured_excerpt ?? "");
  const [visibleInListing, setVisibleInListing] = useState(item?.visible_in_listing ?? true);
  const [sortOrder, setSortOrder] = useState(item?.sort_order ?? 0);
  const [tagsInput, setTagsInput] = useState(item?.tags?.join(", ") ?? "");
  const [seoTitle, setSeoTitle] = useState(item?.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState(item?.seo_description ?? "");
  const [seoImage, setSeoImage] = useState(item?.seo_image ?? "");
  const [hero, setHero] = useState(() => normalizeHeroSettings(item?.hero, {
    heroTitle: item?.title ?? "",
    heroSubtitle: item?.category ?? "Bitácora",
    heroImage: item?.featured_image_id ?? item?.seo_image ?? "/img/hero-bg.jpg",
  }));
  const [blocks] = useState<BlogPostBlock[]>(item?.blocks ?? []);
  const [modal, setModal] = useState<{ type: "success" | "error"; title: string; message?: string; redirectToList?: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const readingTime = useMemo(
    () => Math.max(1, Math.ceil(blocks.map((block) => [block.title, block.text].join(" ")).join(" ").split(/\s+/).filter(Boolean).length / 200)),
    [blocks],
  );
  const editorTitle = title.trim() || (mode === "create" ? "Nuevo artículo" : item?.title || "Bitácora");
  const visibleBlockCount = blocks.filter((block) => block.is_visible).length;
  const currentCategory = categoryMode === "custom" ? customCategory.trim() : categoryMode;
  const previewPublishedAt = item?.published_at || item?.updated_at || item?.created_at || "2026-01-01T00:00:00.000Z";

  async function save(nextStatus = status) {
    setIsLoading(true);
    setModal(null);

    if (!title.trim()) {
      setModal({ type: "error", title: "Falta el título", message: "El título es obligatorio para guardar la bitácora." });
      setIsLoading(false);
      setStep("structure");
      return;
    }

    const category = categoryMode === "custom" ? customCategory.trim() : categoryMode;
    const tags = tagsInput.split(",").map((tag) => tag.trim()).filter(Boolean);
    const res = await fetch(mode === "create" ? "/api/admin/bitacora" : `/api/admin/bitacora/${item?.id}`, {
      method: mode === "create" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        slug,
        status: nextStatus,
        excerpt,
        listing_excerpt: listingExcerpt.trim(),
        content: "",
        featured_image_id: featuredImageId,
        author_id: "Casa Rosier",
        category: category || "Procesos",
        tags,
        is_featured: isFeatured,
        featured_order: featuredOrder,
        featured_excerpt: featuredExcerpt,
        visible_in_listing: visibleInListing,
        sort_order: sortOrder,
        seo_title: seoTitle,
        seo_description: seoDescription,
        seo_image: seoImage,
        hero: normalizeHeroSettings(hero, {
          heroTitle: title,
          heroSubtitle: category || "Bitácora",
          heroImage: featuredImageId || seoImage || "/img/hero-bg.jpg",
        }),
        blocks: blocks.map((block, i) => ({ ...block, sort_order: i })),
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "Error" }));
      setModal({ type: "error", title: "No se pudo guardar", message: (data as { error?: string }).error || "No se pudo guardar la bitácora." });
      setIsLoading(false);
      return;
    }

    setModal({
      type: "success",
      title: nextStatus === "published" ? "Bitácora publicada" : "Bitácora guardada",
      message: nextStatus === "published" ? "El artículo ya está publicado correctamente." : "El borrador se guardó correctamente.",
      redirectToList: true,
    });
    setIsLoading(false);
    router.refresh();
  }

  return (
    <div className="cms-editor-shell">
      <AdminActionModal
        open={Boolean(modal)}
        type={modal?.type}
        title={modal?.title ?? ""}
        message={modal?.message}
        confirmLabel="Entendido"
        onClose={() => {
          const shouldRedirect = modal?.redirectToList;
          setModal(null);
          if (shouldRedirect) router.push("/admin/bitacora");
        }}
      />

      <header className="cms-page-editor-head">
        <div className="cms-page-editor-head__main">
          <h1>{editorTitle}</h1>
          <p>Edición personalizada de página de bitácora</p>
          <div className="cms-page-editor-meta" aria-label="Resumen del artículo">
            <span className={`status-pill status-pill--${status}`}>{status}</span>
            <span>{readingTime} min de lectura</span>
            <span>{visibleBlockCount} bloques visibles</span>
          </div>
        </div>
        <div className="cms-page-editor-actions">
          <Link className="secondary-btn" href="/admin/bitacora">Volver</Link>
          <button type="button" className="secondary-btn cms-outline-accent" onClick={() => save("draft")} disabled={isLoading}>
            {isLoading ? "Guardando..." : "Borrador"}
          </button>
          <button type="button" className="primary-btn" onClick={() => save("published")} disabled={isLoading}>
            {isLoading ? "Publicando..." : "Publicar"}
          </button>
        </div>
      </header>

      <nav className="cms-editor-tabs" aria-label="Secciones del editor">
        <button type="button" className={step === "hero" ? "is-active" : ""} onClick={() => setStep("hero")}>
          Hero
        </button>
        <button type="button" className={step === "structure" ? "is-active" : ""} onClick={() => setStep("structure")}>
          Estructura
        </button>
        <button type="button" className={step === "preview" ? "is-active" : ""} onClick={() => setStep("preview")}>
          Vista previa
        </button>
      </nav>

      <div className="cms-editor-main">
        {step === "hero" ? (
          <SharedHeroEditor
            details={hero}
            titleFallback={title || "Título de la bitácora"}
            subtitleFallback={categoryMode === "custom" ? customCategory : categoryMode}
            onChange={(next) => setHero((current) => ({ ...current, ...next }))}
          />
        ) : step === "structure" ? (
          <div className="space-y-6">
            <section className="form-block cms-editor-card">
              <div className="cms-editor-card__head">
                <div>
                  <p className="auth-kicker">Paso 1</p>
                  <h3>Presentación del artículo</h3>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <TextField label="Título" required value={title} onChange={(event) => setTitle(event.target.value)} onBlur={() => { if (!slug.trim()) setSlug(slugify(title)); }} />
                <TextField label="Slug" value={slug} help="Se genera automáticamente si lo dejas vacío." onChange={(event) => setSlug(slugify(event.target.value))} />
                <div className="md:col-span-2">
                  <TextField
                    label="Extracto"
                    value={listingExcerpt}
                    maxLength={240}
                    placeholder="Resumen breve para el listado"
                    help={`${listingExcerpt.trim().split(/\s+/).filter(Boolean).length}/10 palabras. Si queda vacío, se generará desde el contenido.`}
                    onChange={(event) => setListingExcerpt(event.target.value.trimStart().split(/\s+/).slice(0, 10).join(" "))}
                  />
                </div>
                <div className="md:col-span-2">
                  <RichTextField label="Texto introductorio" required value={excerpt} onChange={setExcerpt} minHeight="170px" />
                </div>
                <SelectField label="Estado" value={status} onChange={(event) => setStatus(event.target.value as BlogPostStatus)}>
                  <option value="draft">Borrador</option>
                  <option value="published">Publicado</option>
                  <option value="archived">Archivado</option>
                </SelectField>
                <SelectField label="Tipo" value={categoryMode} onChange={(event) => setCategoryMode(event.target.value)}>
                  {categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}
                  <option value="custom">Nuevo tipo</option>
                </SelectField>
                {categoryMode === "custom" ? <TextField label="Nuevo tipo" value={customCategory} onChange={(event) => setCustomCategory(event.target.value)} /> : null}
                <TextField label="Orden" type="number" value={sortOrder} onChange={(event) => setSortOrder(Number(event.target.value))} />
                <TextField label="Tags" value={tagsInput} placeholder="cerámica, proceso, taller" onChange={(event) => setTagsInput(event.target.value)} className="md:col-span-2" />
                <div className="md:col-span-2">
                  <MediaSelectField label="Imagen principal" value={featuredImageId} onChange={setFeaturedImageId} />
                </div>
                <SwitchField checked={visibleInListing} onChange={setVisibleInListing} label="Visible en listado" description="Controla si aparece en el grid principal de /blog." />
              </div>
            </section>

            <section className="form-block cms-editor-card">
              <div className="cms-editor-card__head">
                <div>
                  <p className="auth-kicker">SEO</p>
                  <h3>Metadatos</h3>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <TextField label="SEO title" value={seoTitle} maxLength={70} help={`${seoTitle.length}/70 caracteres`} onChange={(event) => setSeoTitle(event.target.value)} className="md:col-span-2" />
                <TextAreaField label="SEO description" value={seoDescription} maxLength={160} help={`${seoDescription.length}/160 caracteres`} onChange={(event) => setSeoDescription(event.target.value)} className="md:col-span-2" />
                <div className="md:col-span-2"><MediaSelectField label="SEO image" value={seoImage} onChange={setSeoImage} /></div>
              </div>
            </section>

            <div className="sticky-form-actions form-actions">
              <button type="button" className="secondary-btn" onClick={() => setStep("preview")}>Continuar a vista previa</button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <BlogPublicPreview
              title={title}
              excerpt={excerpt}
              cover={featuredImageId}
              blocks={blocks}
              hero={hero}
              category={currentCategory || "Procesos"}
              slug={slug}
              status={status}
              isFeatured={isFeatured}
              featuredOrder={featuredOrder}
              featuredExcerpt={featuredExcerpt}
              visibleInListing={visibleInListing}
              sortOrder={sortOrder}
              seoTitle={seoTitle}
              seoDescription={seoDescription}
              publishedAt={previewPublishedAt}
              navigationItems={navigationItems}
              menuSettings={menuSettings}
            />
          </div>
        )}
      </div>

      <div className="admin-sticky-actionbar">
        <span className="admin-sticky-actionbar__meta">{readingTime} min de lectura · {visibleBlockCount} bloques visibles</span>
        <button type="button" className="secondary-btn" onClick={() => setStep("preview")}>
          Vista previa
        </button>
        <button type="button" className="secondary-btn" onClick={() => save("draft")} disabled={isLoading}>
          {isLoading ? "Guardando..." : "Borrador"}
        </button>
        <button type="button" className="primary-btn" onClick={() => save("published")} disabled={isLoading}>
          {isLoading ? "Publicando..." : "Publicar"}
        </button>
      </div>
    </div>
  );
}
