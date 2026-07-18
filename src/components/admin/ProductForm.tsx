"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Product, ProductCategory } from "@/lib/cms/types";
import AdminActionModal from "./AdminActionModal";
import MediaSelectField from "./MediaSelectField";

const statusLabels: Record<string, string> = {
  draft: "Borrador",
  published: "Publicado",
  archived: "Archivado",
};

type SaveIntent = "draft" | "publish";
type ModalState = {
  type: "success" | "error";
  title: string;
  message?: string;
  details?: string[];
  redirectOnClose?: boolean;
} | null;

function SectionIcon({ children }: { children: string }) {
  return <span className="material-symbols-outlined" aria-hidden="true">{children}</span>;
}

function SectionHead({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="shop-product-editor__section-head">
      <SectionIcon>{icon}</SectionIcon>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function skuFromName(value: string) {
  const base = slugify(value).replace(/-/g, "").toUpperCase();
  return base ? `CR-${base.slice(0, 18)}` : "";
}

export default function ProductForm({ mode, item }: { mode: "create" | "edit"; item?: Product }) {
  const router = useRouter();
  const [name, setName] = useState(item?.name ?? "");
  const [slug, setSlug] = useState(item?.slug ?? "");
  const [sku, setSku] = useState(item?.sku ?? "");
  const [status, setStatus] = useState(item?.status ?? "draft");
  const [description, setDescription] = useState(item?.description ?? "");
  const [excerpt, setExcerpt] = useState(item?.excerpt ?? "");
  const [mainImageId, setMainImageId] = useState(item?.main_image_id ?? "");
  const [galleryInput, setGalleryInput] = useState((item?.gallery ?? []).join("\n"));
  const [price, setPrice] = useState<number | null>(item?.price ?? null);
  const [stock, setStock] = useState<number | null>(item?.stock ?? null);
  const [lowStockThreshold, setLowStockThreshold] = useState(item?.low_stock_threshold ?? 5);
  const [categoryId, setCategoryId] = useState(item?.category_id ?? "");
  const [characteristics, setCharacteristics] = useState(item?.characteristics ?? "");
  const [weight, setWeight] = useState(item?.weight ?? "");
  const [dimensions, setDimensions] = useState(item?.dimensions ?? "");
  const [ctaLabel, setCtaLabel] = useState(item?.cta_label ?? "Comprar");
  const [ctaUrl, setCtaUrl] = useState(item?.cta_url ?? "https://wa.me/34633788860");
  const [seoTitle, setSeoTitle] = useState(item?.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState(item?.seo_description ?? "");
  const [seoImage, setSeoImage] = useState(item?.seo_image ?? "");
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savingIntent, setSavingIntent] = useState<SaveIntent | null>(null);
  const [modal, setModal] = useState<ModalState>(null);

  useEffect(() => {
    fetch("/api/admin/shop/categories")
      .then((response) => response.json())
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => {});
  }, []);

  function handleNameChange(value: string) {
    setName(value);
    setSlug(slugify(value));
    setSku(skuFromName(value));
  }

  function validationDetails(intent: SaveIntent) {
    const details: string[] = [];
    const normalizedSlug = slugify(slug);
    const normalizedSku = skuFromName(name);

    if (!name.trim()) details.push("Nombre es obligatorio.");
    if (!normalizedSlug) details.push("Slug no pudo generarse. Escribe un nombre con letras o números.");
    if (slug && slug !== normalizedSlug) details.push("Slug solo puede usar minúsculas, números y guiones.");
    if (!normalizedSku) details.push("SKU no pudo generarse. Escribe un nombre válido.");
    if (price !== null && (!Number.isFinite(price) || price < 0)) details.push("Precio debe ser un número mayor o igual a 0.");
    if (stock !== null && (!Number.isInteger(stock) || stock < 0)) details.push("Stock debe ser un número entero mayor o igual a 0.");
    if (!Number.isInteger(lowStockThreshold) || lowStockThreshold < 0) details.push("Stock mínimo debe ser un número entero mayor o igual a 0.");
    if (ctaUrl.trim() && !/^(https?:\/\/|\/|mailto:|tel:)/.test(ctaUrl.trim())) details.push("Link del CTA debe empezar con https://, /, mailto: o tel:.");
    if (ctaLabel.trim() && !ctaUrl.trim()) details.push("Si el CTA tiene texto, también necesita un link destino.");
    if (ctaUrl.trim() && !ctaLabel.trim()) details.push("Si el CTA tiene link, también necesita texto de botón.");

    if (intent === "publish") {
      if (price === null) details.push("Precio es obligatorio para publicar.");
      if (!excerpt.trim()) details.push("Extracto es obligatorio para publicar.");
      if (!description.trim()) details.push("Descripción es obligatoria para publicar.");
      if (!mainImageId.trim()) details.push("Imagen principal es obligatoria para publicar.");
    }

    return details;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const intent: SaveIntent = submitter?.value === "publish" ? "publish" : "draft";
    const nextStatus = intent === "publish" ? "published" : "draft";
    const details = validationDetails(intent);

    if (details.length) {
      setModal({
        type: "error",
        title: "No se pudo guardar",
        message: "Revisa estos campos antes de continuar.",
        details,
      });
      return;
    }

    setIsLoading(true);
    setSavingIntent(intent);
    setError(null);

    const response = await fetch(mode === "create" ? "/api/admin/shop/products" : `/api/admin/shop/products/${item?.id}`, {
      method: mode === "create" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        slug: slugify(slug || name),
        sku: skuFromName(name),
        status: nextStatus,
        description: description.trim(),
        excerpt: excerpt.trim(),
        main_image_id: mainImageId,
        gallery: galleryInput.split("\n").map((value) => value.trim()).filter(Boolean),
        price,
        stock,
        low_stock_threshold: lowStockThreshold,
        category_id: categoryId,
        characteristics,
        weight,
        dimensions,
        cta_label: ctaLabel.trim(),
        cta_url: ctaUrl.trim(),
        seo_title: seoTitle,
        seo_description: seoDescription,
        seo_image: seoImage,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: "Error" }));
      const message = (data as { error?: string }).error || "Error";
      setError(message);
      setModal({
        type: "error",
        title: "No se pudo guardar",
        message,
      });
      setIsLoading(false);
      setSavingIntent(null);
      return;
    }

    setStatus(nextStatus);
    setModal({
      type: "success",
      title: intent === "publish" ? "Producto publicado" : "Borrador guardado",
      message: intent === "publish" ? "Los cambios del producto se guardaron correctamente." : "El producto se guardó como borrador correctamente.",
      redirectOnClose: true,
    });
    setIsLoading(false);
    setSavingIntent(null);
  }

  return (
    <form className="shop-product-editor" onSubmit={handleSubmit}>
      <AdminActionModal
        open={Boolean(modal)}
        type={modal?.type ?? "info"}
        title={modal?.title ?? ""}
        message={modal?.message}
        details={modal?.details}
        confirmLabel="Entendido"
        onClose={() => {
          const shouldRedirect = modal?.redirectOnClose;
          setModal(null);
          if (shouldRedirect) {
            router.push("/admin/shop?tab=items");
            router.refresh();
          }
        }}
      />
      <header className="shop-product-editor__hero">
        <div>
          <p className="auth-kicker">Producto de tienda</p>
          <h3>{mode === "create" ? "Nuevo artículo" : name || "Editar artículo"}</h3>
          <p>Organiza la información comercial, contenido público, inventario e imagen principal.</p>
        </div>
        <span className={`status-pill status-pill--${status}`}>{statusLabels[status] ?? status}</span>
      </header>

      <div className="shop-product-editor__layout">
        <div className="shop-product-editor__main">
          <section className="form-block shop-product-editor__section">
            <SectionHead icon="inventory_2" title="Información general" description="Datos visibles para administrar y encontrar el producto." />
            <div className="grid-2">
              <label className="field span-2"><span>Nombre</span><input value={name} onChange={(event) => handleNameChange(event.target.value)} /></label>
              <label className="field"><span>Slug</span><input value={slug} readOnly /></label>
              <label className="field"><span>SKU</span><input value={sku} readOnly /></label>
              <label className="field"><span>Categoría</span><select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}><option value="">Sin categoría</option>{categories.filter((category) => category.status !== "deleted").map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
            </div>
          </section>

          <section className="form-block shop-product-editor__section">
            <SectionHead icon="edit_note" title="Contenido" description="Texto breve para tarjetas y descripción completa para la ficha del artículo." />
            <div className="grid-2">
              <label className="field span-2"><span>Extracto</span><textarea rows={3} value={excerpt} onChange={(event) => setExcerpt(event.target.value)} /></label>
              <label className="field span-2"><span>Descripción</span><textarea rows={7} value={description} onChange={(event) => setDescription(event.target.value)} /></label>
              <label className="field span-2"><span>Galería (una URL por línea)</span><textarea rows={4} value={galleryInput} onChange={(event) => setGalleryInput(event.target.value)} /></label>
            </div>
          </section>

          <section className="form-block shop-product-editor__section">
            <SectionHead icon="sell" title="Precio y stock" description="Configura precio e inventario disponible." />
            <div className="shop-product-editor__metrics">
              <label className="field"><span>Precio</span><input type="number" step="0.01" value={price ?? ""} onChange={(event) => setPrice(event.target.value ? Number(event.target.value) : null)} /></label>
              <label className="field"><span>Stock</span><input type="number" value={stock ?? ""} onChange={(event) => setStock(event.target.value ? Number(event.target.value) : null)} /></label>
              <label className="field"><span>Stock mínimo</span><input type="number" value={lowStockThreshold} onChange={(event) => setLowStockThreshold(Number(event.target.value))} /></label>
            </div>
          </section>

          <section className="form-block shop-product-editor__section">
            <SectionHead icon="straighten" title="Características" description="Detalles físicos y notas técnicas que ayudan a comparar piezas." />
            <div className="grid-2">
              <label className="field span-2"><span>Características</span><textarea rows={4} value={characteristics} onChange={(event) => setCharacteristics(event.target.value)} /></label>
              <label className="field"><span>Peso</span><input value={weight} onChange={(event) => setWeight(event.target.value)} /></label>
              <label className="field"><span>Dimensiones</span><input value={dimensions} onChange={(event) => setDimensions(event.target.value)} /></label>
            </div>
          </section>
        </div>

        <aside className="shop-product-editor__side">
          <section className="form-block shop-product-editor__section shop-product-editor__media-card">
            <SectionHead icon="image" title="Imagen principal" description="Fotografía base para la tienda y ficha del producto." />
            <MediaSelectField label="Imagen principal" value={mainImageId} onChange={setMainImageId} previewClassName="shop-product-editor__image-preview" />
          </section>


          <section className="form-block shop-product-editor__section">
            <SectionHead icon="ads_click" title="CTA" description="Botón principal visible en la ficha pública del producto." />
            <div className="grid-2">
              <label className="field span-2"><span>Texto del botón</span><input value={ctaLabel} onChange={(event) => setCtaLabel(event.target.value)} placeholder="Comprar" /></label>
              <label className="field span-2"><span>Link destino</span><input value={ctaUrl} onChange={(event) => setCtaUrl(event.target.value)} placeholder="https://wa.me/..." /></label>
            </div>
          </section>

          <section className="form-block shop-product-editor__section">
            <SectionHead icon="travel_explore" title="SEO" description="Metadatos usados al compartir o indexar el artículo." />
            <div className="grid-2">
              <label className="field span-2"><span>SEO title</span><input value={seoTitle} onChange={(event) => setSeoTitle(event.target.value)} /></label>
              <label className="field span-2"><span>SEO description</span><textarea rows={4} value={seoDescription} onChange={(event) => setSeoDescription(event.target.value)} /></label>
              <div className="span-2">
                <MediaSelectField label="SEO image" value={seoImage} onChange={setSeoImage} previewClassName="shop-product-editor__seo-preview" />
              </div>
            </div>
          </section>
        </aside>
      </div>

      {error ? <p className="form-error">{error}</p> : null}
      <div className="admin-sticky-actionbar shop-product-editor__actions">
        <span className="admin-sticky-actionbar__meta">{statusLabels[status] ?? status} · {price !== null ? `${price} €` : "Sin precio"} · {stock !== null ? `${stock} en stock` : "Stock ilimitado"}</span>
        <button className="secondary-btn" type="submit" name="intent" value="draft" disabled={isLoading}>
          <span className="material-symbols-outlined" aria-hidden="true">save</span>
          {isLoading && savingIntent === "draft" ? "Guardando..." : "Borrador"}
        </button>
        <button className="primary-btn" type="submit" name="intent" value="publish" disabled={isLoading}>
          <span className="material-symbols-outlined" aria-hidden="true">publish</span>
          {isLoading && savingIntent === "publish" ? "Publicando..." : "Publicar producto"}
        </button>
      </div>
    </form>
  );
}
