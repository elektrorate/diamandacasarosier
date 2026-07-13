"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { Page, Header, PageType } from "@/lib/cms/types";
import { PAGE_TYPES } from "@/lib/cms/types";
import MediaSelectField from "./MediaSelectField";

const typeLabels: Record<string, string> = {
  home: "Home", studio: "Estudio", contact: "Contacto", faq: "FAQ",
  privacy: "Privacidad", cookies: "Cookies", legal: "Legal", custom: "Custom",
};

export default function PageForm({ mode, page }: { mode: "create" | "edit"; page?: Page }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: page?.title ?? "",
    slug: page?.slug ?? "",
    type: page?.type ?? "custom" as string,
    status: page?.status ?? "draft" as string,
    header_id: page?.header_id ?? "",
    social_gallery_id: page?.social_gallery_id ?? "",
    testimonials_id: page?.testimonials_id ?? "",
    footer_id: page?.footer_id ?? "",
    seo_title: page?.seo_title ?? "",
    seo_description: page?.seo_description ?? "",
    seo_image: page?.seo_image ?? "",
  });
  const [headers, setHeaders] = useState<Header[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/headers")
      .then((r) => r.json())
      .then((data) => setHeaders(data.headers ?? []))
      .catch(() => {});
  }, []);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!form.title.trim()) {
      setError("El título es obligatorio.");
      setIsLoading(false);
      return;
    }

    const response = await fetch(mode === "create" ? "/api/admin/pages" : `/api/admin/pages/${page?.id}`, {
      method: mode === "create" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        header_id: form.header_id || null,
        social_gallery_id: form.social_gallery_id || null,
        testimonials_id: form.testimonials_id || null,
        footer_id: form.footer_id || null,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: "Error al guardar." }));
      setError((data as { error?: string }).error || "Error al guardar.");
      setIsLoading(false);
      return;
    }

    router.push("/admin/pages");
    router.refresh();
  }

  return (
    <form className="editor-form" onSubmit={handleSubmit}>
      <section className="form-block">
        <h3>Información general</h3>
        <div className="grid-2">
          <label className="field span-2">
            <span>Título</span>
            <input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Sobre nosotros" />
          </label>
          <label className="field span-2">
            <span>Slug</span>
            <input value={form.slug} onChange={(e) => update("slug", e.target.value)} placeholder="se genera automáticamente" />
          </label>
          <label className="field">
            <span>Tipo</span>
            <select value={form.type} onChange={(e) => update("type", e.target.value)}>
              {PAGE_TYPES.map((t) => <option key={t} value={t}>{typeLabels[t]}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Estado</span>
            <select value={form.status} onChange={(e) => update("status", e.target.value)}>
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
              <option value="archived">Archivado</option>
            </select>
          </label>
          <label className="field">
            <span>Header</span>
            <select value={form.header_id} onChange={(e) => update("header_id", e.target.value)}>
              <option value="">Sin header</option>
              {headers.filter((h) => h.status === "published").map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="form-block">
        <h3>SEO</h3>
        <div className="grid-2">
          <label className="field span-2">
            <span>SEO title</span>
            <input value={form.seo_title} onChange={(e) => update("seo_title", e.target.value)} />
          </label>
          <label className="field span-2">
            <span>SEO description</span>
            <textarea rows={3} value={form.seo_description} onChange={(e) => update("seo_description", e.target.value)} />
          </label>
          <MediaSelectField label="SEO image" value={form.seo_image} onChange={(url) => update("seo_image", url)} />
        </div>
      </section>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="form-actions">
        <button className="primary-btn" type="submit" disabled={isLoading}>
          {isLoading ? "Guardando..." : mode === "create" ? "Crear página" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
