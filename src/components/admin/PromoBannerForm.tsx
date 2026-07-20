"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { PromoBanner, PromoStatus } from "@/lib/cms/types";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import AdminActionModal from "./AdminActionModal";
import MediaSelectField from "./MediaSelectField";
import RichTextField from "@/components/editor/RichTextEditor";

const limits = {
  key_text: 40,
  title: 60,
  text: 600,
  detail_text: 600,
  button_text: 28,
};
const promoRichTextControls = ["bold", "italic", "ul", "ol", "link"] as const;
type Notice = { type: "success" | "error" | "info"; title: string; message: string };

function getInitialForm(item?: PromoBanner) {
  return {
    key_text: item?.key_text ?? "",
    title: item?.title ?? "",
    text: item?.text ?? "",
    detail_text: item?.detail_text ?? "",
    image_url: item?.image_url ?? "",
    button_text: item?.button_text ?? "Reservar plaza",
    link_url: item?.link_url ?? "",
    visual_variant: item?.visual_variant ?? "default",
  };
}

function serializeForm(form: ReturnType<typeof getInitialForm>) {
  return JSON.stringify(form);
}

function getErrorMessage(data: unknown, fallback: string) {
  if (data && typeof data === "object" && "error" in data && typeof data.error === "string" && data.error.trim()) {
    return data.error;
  }
  return fallback;
}

export default function PromoBannerForm({ mode, item }: { mode: "create" | "edit"; item?: PromoBanner }) {
  const router = useRouter();
  const [form, setForm] = useState(() => getInitialForm(item));
  const [savedSnapshot, setSavedSnapshot] = useState(() => serializeForm(getInitialForm(item)));
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savingStatus, setSavingStatus] = useState<Extract<PromoStatus, "draft" | "published"> | null>(null);
  const [returnAfterNotice, setReturnAfterNotice] = useState(false);
  const isDirty = mode === "edit" && serializeForm(form) !== savedSnapshot;

  useEffect(() => {
    if (!notice || notice.type !== "error") return;
    const timer = window.setTimeout(() => setNotice(null), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (mode !== "edit" || !isDirty) return;

    const showBlockedNavigationNotice = () => {
      setReturnAfterNotice(false);
      setNotice({
        type: "info",
        title: "Cambios sin guardar",
        message: "Guarda el banner como Borrador o Publícalo antes de salir de esta página.",
      });
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    const handleDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor?.href || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const nextUrl = new URL(anchor.href, window.location.href);
      const currentUrl = new URL(window.location.href);
      if (nextUrl.href === currentUrl.href || nextUrl.hash && nextUrl.origin === currentUrl.origin && nextUrl.pathname === currentUrl.pathname && nextUrl.search === currentUrl.search) return;

      event.preventDefault();
      event.stopPropagation();
      showBlockedNavigationNotice();
    };

    const handlePopState = () => {
      window.history.pushState({ promoBannerEditGuard: true }, "", window.location.href);
      showBlockedNavigationNotice();
    };

    window.history.pushState({ promoBannerEditGuard: true }, "", window.location.href);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [isDirty, mode]);

  function upd<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    const max = limits[k as keyof typeof limits];
    setForm((p) => ({ ...p, [k]: typeof v === "string" && max ? v.slice(0, max) : v }));
  }

  async function save(nextStatus: Extract<PromoStatus, "draft" | "published">) {
    setIsLoading(true);
    setSavingStatus(nextStatus);
    setNotice(null);
    setReturnAfterNotice(false);

    if (!form.title.trim()) {
      setNotice({ type: "error", title: "Revisa el banner", message: "El título es obligatorio." });
      setIsLoading(false);
      setSavingStatus(null);
      return;
    }

    if (nextStatus === "published" && !form.image_url.trim()) {
      setNotice({ type: "error", title: "Revisa el banner", message: "Para publicar debes establecer una imagen." });
      setIsLoading(false);
      setSavingStatus(null);
      return;
    }

    try {
      const body = {
        ...form,
        status: nextStatus,
        start_date: "",
        end_date: "",
      };
      const res = await fetch(mode === "create" ? "/api/admin/components/promo-banners" : `/api/admin/components/promo-banners/${item?.id}`, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "No se pudo guardar el banner promocional." }));
        setNotice({
          type: "error",
          title: "No se pudo completar",
          message: getErrorMessage(data, "No se pudo guardar el banner promocional."),
        });
        return;
      }

      setNotice({
        type: "success",
        title: "Acción completada",
        message: nextStatus === "published" ? "Publicado exitosamente." : "Borrador guardado correctamente.",
      });
      setSavedSnapshot(serializeForm(form));
      router.refresh();
      setReturnAfterNotice(true);
    } catch {
      setNotice({
        type: "error",
        title: "No se pudo conectar",
        message: "No se pudo conectar con el servidor. Intenta nuevamente.",
      });
    } finally {
      setIsLoading(false);
      setSavingStatus(null);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void save("draft");
  }

  return (
    <form className="editor-form preview-editor-form" onSubmit={handleSubmit}>
      <AdminActionModal
        open={Boolean(notice)}
        type={notice?.type}
        title={notice?.title ?? ""}
        message={notice?.message}
        confirmLabel="Entendido"
        onClose={() => {
          setNotice(null);
          if (returnAfterNotice) router.push("/admin/components/promo-banners");
        }}
      />

      <section className="form-block">
        <h3>Banner promocional</h3>
        <div className="promo-banner-form-grid">
          <div className="promo-banner-form-grid__media">
            <MediaSelectField label="Imagen del modal" value={form.image_url} onChange={(url) => upd("image_url", url)} />
          </div>
          <div className="promo-banner-form-grid__main">
            <label className="field">
              <span>Texto clave</span>
              <input maxLength={limits.key_text} value={form.key_text} onChange={(e) => upd("key_text", e.target.value)} />
              <small>Texto de anclaje etiquetado con un color determinado dentro del banner. {form.key_text.length}/{limits.key_text}</small>
            </label>
            <label className="field"><span>Título</span><input maxLength={limits.title} value={form.title} onChange={(e) => upd("title", e.target.value)} /><small>{form.title.length}/{limits.title}</small></label>
            <div className="promo-banner-form-grid__rich-field">
              <RichTextField label="Descripción general" value={form.text} onChange={(value) => upd("text", value)} minHeight="168px" maxLength={limits.text} controls={[...promoRichTextControls]} />
            </div>
          </div>
          <div className="promo-banner-form-grid__detail promo-banner-form-grid__rich-field">
            <RichTextField label="Descripción específica" value={form.detail_text} onChange={(value) => upd("detail_text", value)} minHeight="150px" maxLength={limits.detail_text} controls={[...promoRichTextControls]} />
          </div>
          <div className="promo-banner-form-grid__meta">
            <label className="field"><span>Texto del botón</span><input maxLength={limits.button_text} value={form.button_text} onChange={(e) => upd("button_text", e.target.value)} /><small>{form.button_text.length}/{limits.button_text}</small></label>
            <label className="field"><span>URL de redirección</span><input value={form.link_url} onChange={(e) => upd("link_url", e.target.value)} /></label>
          </div>
        </div>
      </section>
      <aside className="form-preview-card promo-preview-card" aria-label="Vista previa del banner promocional">
        <p className="auth-kicker">{form.key_text || "Texto clave"}</p>
        <div className="promo-preview-card__image">
          {form.image_url ? <img src={form.image_url} alt={form.title || "Banner promocional"} /> : <span>Imagen del modal</span>}
        </div>
        <h3>{form.title || "Título del banner"}</h3>
        <MarkdownContent className="promo-preview-card__copy" source={form.text || "Descripción general del modal promocional."} />
        <MarkdownContent className="promo-preview-card__detail" source={form.detail_text || "Descripción específica o detalle importante."} />
        <span className="promo-preview-card__button">{form.button_text || "Texto del botón"}</span>
      </aside>
      <div className="form-actions">
        <button className="secondary-btn" type="submit" disabled={isLoading}>
          {savingStatus === "draft" ? "Guardando..." : "Borrador"}
        </button>
        <button className="primary-btn" type="button" onClick={() => void save("published")} disabled={isLoading}>
          {savingStatus === "published" ? "Publicando..." : "Publicar"}
        </button>
      </div>
    </form>
  );
}
