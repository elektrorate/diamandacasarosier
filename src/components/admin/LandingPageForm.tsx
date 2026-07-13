"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { LandingPage, Header, LandingPageBlock, CampaignType, BlockType } from "@/lib/cms/types";
import { CAMPAIGN_TYPES, BLOCK_TYPES } from "@/lib/cms/types";
import MediaSelectField from "./MediaSelectField";

const campLabels: Record<string, string> = { course: "Curso", workshop: "Workshop", experience: "Experiencia", gift_card: "Gift Card", event: "Evento", lead_capture: "Lead Capture", custom: "Custom" };
const blockLabels: Record<string, string> = { text: "Texto", image: "Imagen", text_image: "Texto + Imagen", gallery: "Galería", cta: "CTA", testimonial: "Testimonial", faq: "FAQ", teacher: "Teacher", promo_banner: "Promo Banner", custom_html: "HTML personalizado" };

export default function LandingPageForm({ mode, item }: { mode: "create" | "edit"; item?: LandingPage }) {
  const router = useRouter();
  const [title, setTitle] = useState(item?.title ?? "");
  const [slug, setSlug] = useState(item?.slug ?? "");
  const [status, setStatus] = useState(item?.status ?? "draft");
  const [campaignType, setCampaignType] = useState<CampaignType>(item?.campaign_type ?? "custom");
  const [headerId, setHeaderId] = useState(item?.header_id ?? "");
  const [heroTitle, setHeroTitle] = useState(item?.hero_title ?? "");
  const [heroSubtitle, setHeroSubtitle] = useState(item?.hero_subtitle ?? "");
  const [heroImageId, setHeroImageId] = useState(item?.hero_image_id ?? "");
  const [introText, setIntroText] = useState(item?.intro_text ?? "");
  const [ctaText, setCtaText] = useState(item?.cta_text ?? "");
  const [ctaUrl, setCtaUrl] = useState(item?.cta_url ?? "");
  const [socialGalleryId, setSocialGalleryId] = useState(item?.social_gallery_id ?? "");
  const [testimonialsId, setTestimonialsId] = useState(item?.testimonials_id ?? "");
  const [footerId, setFooterId] = useState(item?.footer_id ?? "");
  const [seoTitle, setSeoTitle] = useState(item?.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState(item?.seo_description ?? "");
  const [seoImage, setSeoImage] = useState(item?.seo_image ?? "");
  const [blocks, setBlocks] = useState<LandingPageBlock[]>(item?.blocks ?? []);
  const [headers, setHeaders] = useState<Header[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { fetch("/api/admin/headers").then((r) => r.json()).then((d) => setHeaders(d.headers ?? [])).catch(() => {}); }, []);

  function addBlock() {
    setBlocks([...blocks, { id: `new_${Date.now()}`, type: "text", title: "", text: "", image_id: "", cta_text: "", cta_url: "", is_visible: true, sort_order: blocks.length, custom_html: "", created_at: new Date().toISOString(), updated_at: new Date().toISOString() }]);
  }
  function updateBlock(idx: number, field: string, value: unknown) { const c = [...blocks]; c[idx] = { ...c[idx], [field]: value }; setBlocks(c); }
  function removeBlock(idx: number) { setBlocks(blocks.filter((_, i) => i !== idx)); }
  function moveBlock(idx: number, dir: "up" | "down") { if ((dir === "up" && idx === 0) || (dir === "down" && idx === blocks.length - 1)) return; const c = [...blocks]; [c[idx], c[dir === "up" ? idx - 1 : idx + 1]] = [c[dir === "up" ? idx - 1 : idx + 1], c[idx]]; setBlocks(c); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setIsLoading(true); setError(null);
    if (!title.trim()) { setError("El título es obligatorio."); setIsLoading(false); return; }
    const res = await fetch(mode === "create" ? "/api/admin/landing-pages" : `/api/admin/landing-pages/${item?.id}`, {
      method: mode === "create" ? "POST" : "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, slug, status, campaign_type: campaignType, header_id: headerId || null, hero_title: heroTitle, hero_subtitle: heroSubtitle, hero_image_id: heroImageId, intro_text: introText, cta_text: ctaText, cta_url: ctaUrl, form_id: null, social_gallery_id: socialGalleryId || null, testimonials_id: testimonialsId || null, footer_id: footerId || null, seo_title: seoTitle, seo_description: seoDescription, seo_image: seoImage, blocks: blocks.map((b, i) => ({ ...b, sort_order: i })) }),
    });
    if (!res.ok) { const d = await res.json().catch(() => ({ error: "Error" })); setError((d as { error?: string }).error || "Error"); setIsLoading(false); return; }
    router.push("/admin/landing-pages"); router.refresh();
  }

  return (
    <div className="header-form-layout">
      <div className="menu-form-main">
        <form className="editor-form" onSubmit={handleSubmit}>
          <section className="form-block"><h3>Información general</h3>
            <div className="grid-2">
              <label className="field span-2"><span>Título</span><input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
              <label className="field span-2"><span>Slug</span><input value={slug} onChange={(e) => setSlug(e.target.value)} /></label>
              <label className="field"><span>Estado</span><select value={status} onChange={(e) => setStatus(e.target.value as LandingPage["status"])}><option value="draft">Borrador</option><option value="published">Publicado</option><option value="archived">Archivado</option></select></label>
              <label className="field"><span>Tipo de campaña</span><select value={campaignType} onChange={(e) => setCampaignType(e.target.value as CampaignType)}>{CAMPAIGN_TYPES.map((t) => <option key={t} value={t}>{campLabels[t]}</option>)}</select></label>
              <label className="field"><span>Header</span><select value={headerId} onChange={(e) => setHeaderId(e.target.value)}><option value="">Sin header</option>{headers.filter((h) => h.status === "published").map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}</select></label>
            </div>
          </section>

          <section className="form-block"><h3>Hero</h3>
            <div className="grid-2">
              <label className="field span-2"><span>Título del hero</span><input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} /></label>
              <label className="field span-2"><span>Subtítulo</span><input value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} /></label>
              <MediaSelectField label="Imagen del hero" value={heroImageId} onChange={setHeroImageId} />
            </div>
          </section>

          <section className="form-block"><h3>Contenido principal</h3>
            <div className="grid-2">
              <label className="field span-2"><span>Texto de introducción</span><textarea rows={4} value={introText} onChange={(e) => setIntroText(e.target.value)} /></label>
              <label className="field"><span>CTA texto</span><input value={ctaText} onChange={(e) => setCtaText(e.target.value)} /></label>
              <label className="field"><span>CTA URL</span><input value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} /></label>
            </div>
          </section>

          <section className="form-block"><h3>Componentes vinculados</h3>
            <div className="grid-2">
              <label className="field"><span>Galería social</span><select value={socialGalleryId} onChange={(e) => setSocialGalleryId(e.target.value)}><option value="">Ninguna</option></select></label>
              <label className="field"><span>Testimonios</span><select value={testimonialsId} onChange={(e) => setTestimonialsId(e.target.value)}><option value="">Ninguno</option></select></label>
              <label className="field"><span>Footer</span><select value={footerId} onChange={(e) => setFooterId(e.target.value)}><option value="">Ninguno</option></select></label>
            </div>
          </section>

          <section className="form-block"><h3>SEO</h3>
            <div className="grid-2">
              <label className="field span-2"><span>SEO title</span><input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} /></label>
              <label className="field span-2"><span>SEO description</span><textarea rows={3} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} /></label>
              <MediaSelectField label="SEO image" value={seoImage} onChange={setSeoImage} />
            </div>
          </section>

          <section className="form-block">
            <div className="menu-editor-head"><h3>Bloques ({blocks.length})</h3><button type="button" className="primary-btn" onClick={addBlock}>Añadir bloque</button></div>
            {blocks.length === 0 ? <p className="muted">Aún no hay bloques.</p> : blocks.map((b, idx) => (
              <div key={b.id} className="menu-item-form-wrap" style={{ marginBottom: "0.75rem" }}>
                <div className="menu-item-row" style={{ padding: 0, marginBottom: "0.5rem" }}>
                  <span className="menu-item-label">{b.title || blockLabels[b.type]}</span>
                  <span className="entity-badge">{blockLabels[b.type]}</span>
                  <span className="menu-item-badge">{b.is_visible ? "visible" : "oculto"}</span>
                  <div className="row-actions" style={{ marginLeft: "auto" }}>
                    <button type="button" className="secondary-btn" onClick={() => moveBlock(idx, "up")} disabled={idx === 0}>▲</button>
                    <button type="button" className="secondary-btn" onClick={() => moveBlock(idx, "down")} disabled={idx === blocks.length - 1}>▼</button>
                    <button type="button" className="danger-btn" onClick={() => removeBlock(idx)}>Eliminar</button>
                  </div>
                </div>
                <div className="grid-2">
                  <label className="field"><span>Tipo</span><select value={b.type} onChange={(e) => updateBlock(idx, "type", e.target.value as BlockType)}>{BLOCK_TYPES.map((t) => <option key={t} value={t}>{blockLabels[t]}</option>)}</select></label>
                  <label className="field checkbox-field"><input type="checkbox" checked={b.is_visible} onChange={(e) => updateBlock(idx, "is_visible", e.target.checked)} /><span>Visible</span></label>
                  <label className="field span-2"><span>Título</span><input value={b.title} onChange={(e) => updateBlock(idx, "title", e.target.value)} /></label>
                  <label className="field span-2"><span>Texto</span><textarea rows={3} value={b.text} onChange={(e) => updateBlock(idx, "text", e.target.value)} /></label>
                  {b.type === "image" || b.type === "text_image" ? <MediaSelectField label="Imagen" value={b.image_id} onChange={(url) => updateBlock(idx, "image_id", url)} /> : null}
                  {b.type === "cta" || b.type === "text_image" ? <><label className="field"><span>CTA texto</span><input value={b.cta_text} onChange={(e) => updateBlock(idx, "cta_text", e.target.value)} /></label><label className="field"><span>CTA URL</span><input value={b.cta_url} onChange={(e) => updateBlock(idx, "cta_url", e.target.value)} /></label></> : null}
                  {b.type === "custom_html" ? <label className="field span-2"><span>HTML</span><textarea rows={5} value={b.custom_html} onChange={(e) => updateBlock(idx, "custom_html", e.target.value)} /></label> : null}
                </div>
              </div>
            ))}
          </section>

          {error ? <p className="form-error">{error}</p> : null}
          <div className="form-actions"><button className="primary-btn" type="submit" disabled={isLoading}>{isLoading ? "Guardando..." : mode === "create" ? "Crear landing" : "Guardar cambios"}</button></div>
        </form>
      </div>

      <aside className="menu-preview-sidebar">
        <h3>Preview</h3>
        <div className="menu-preview-box">
          <p className="auth-kicker">{campLabels[campaignType]}</p>
          <h3 style={{ margin: "0.3rem 0" }}>{heroTitle || title || "Sin título"}</h3>
          {heroSubtitle ? <p className="muted">{heroSubtitle}</p> : null}
          <hr style={{ margin: "0.75rem 0", border: "none", borderTop: "1px solid var(--line)" }} />
          <p className="muted" style={{ fontSize: "0.85rem" }}>{blocks.length} bloque{blocks.length !== 1 ? "s" : ""}</p>
          {blocks.filter((b) => b.is_visible).map((b, i) => (
            <div key={b.id} style={{ padding: "0.3rem 0", borderTop: i > 0 ? "1px solid var(--line)" : "none", fontSize: "0.85rem" }}>
              <span className="entity-badge">{blockLabels[b.type]}</span>
              {b.title ? <span style={{ marginLeft: "0.4rem" }}>{b.title}</span> : null}
            </div>
          ))}
          {ctaText ? <div style={{ marginTop: "0.75rem" }}><span className="header-preview-cta">{ctaText}</span></div> : null}
        </div>
      </aside>
    </div>
  );
}
