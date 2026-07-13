"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CSSProperties } from "react";
import type { FooterComponent, SocialLink } from "@/lib/cms/types";
import AdminActionModal from "./AdminActionModal";
import ColorPickerField from "./ColorPickerField";
import MediaSelectField from "./MediaSelectField";

function cssUrl(value: string) {
  return value ? `url("${value.replace(/"/g, "%22")}")` : "none";
}

export default function FooterForm({
  mode,
  item,
  singleton = false,
}: {
  mode: "create" | "edit";
  item?: FooterComponent;
  singleton?: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState(item?.name ?? "Footer principal");
  const [logoId] = useState(item?.logo_id ?? "");
  const [contactEmail] = useState(item?.contact_email ?? "");
  const [whatsapp] = useState(item?.whatsapp ?? "");
  const [address] = useState(item?.address ?? "");
  const [legalText] = useState(item?.legal_text ?? "");
  const [contactTitle, setContactTitle] = useState(item?.contact_title ?? "Contacto");
  const [contactText, setContactText] = useState(item?.contact_text ?? "+34 600 000 000\nBarcelona, Espana\nLunes a Sabado - 10:00 a 20:00\nSiguenos en Nuestras Redes:");
  const [buttonBackgroundColor, setButtonBackgroundColor] = useState(item?.social_button_color ?? item?.form_button_color ?? "#111111");
  const [buttonContentColor, setButtonContentColor] = useState(item?.social_icon_color ?? item?.form_button_text_color ?? "#ffffff");
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(item?.social_links ?? []);
  const [menuId] = useState(item?.menu_id ?? "");
  const [newsletterEnabled] = useState(item?.newsletter_enabled ?? false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState<{ type: "success" | "error"; title: string; message?: string } | null>(null);

  function addSocial() {
    setSocialLinks([
      {
        platform: "",
        url: "",
        label: "",
        icon_url: "",
        icon_color: buttonContentColor,
        button_color: buttonBackgroundColor,
      },
      ...socialLinks,
    ]);
  }

  function updateSocial(idx: number, field: keyof SocialLink, value: string) {
    const copy = [...socialLinks];
    copy[idx] = { ...copy[idx], [field]: value };
    setSocialLinks(copy);
  }

  function removeSocial(idx: number) {
    setSocialLinks(socialLinks.filter((_, index) => index !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setModal(null);

    if (!name.trim()) {
      setError("El nombre es obligatorio.");
      setIsLoading(false);
      return;
    }

    const incompleteSocial = socialLinks.find((social) => {
      const hasAnyValue = Boolean(
        social.platform.trim() ||
        social.label.trim() ||
        social.url.trim() ||
        (social.icon_url ?? "").trim()
      );
      if (!hasAnyValue) return false;
      return !social.url.trim() || !(social.icon_url ?? "").trim();
    });

    if (incompleteSocial) {
      const message = "Cada red social debe tener link e icono antes de publicar.";
      setError(message);
      setModal({ type: "error", title: "Faltan datos", message });
      setIsLoading(false);
      return;
    }

    const normalizedSocialLinks = socialLinks
      .filter((social) => social.url.trim() && (social.icon_url ?? "").trim())
      .map((social) => ({
        ...social,
        platform: social.platform.trim() || social.label.trim() || "red-social",
        label: social.label.trim() || social.platform.trim() || "Red social",
        url: social.url.trim(),
        icon_url: (social.icon_url ?? "").trim(),
        icon_color: buttonContentColor,
        button_color: buttonBackgroundColor,
      }));

    const res = await fetch(mode === "create" ? "/api/admin/components/footers" : `/api/admin/components/footers/${item?.id}`, {
      method: mode === "create" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        status: "published",
        logo_id: logoId,
        contact_email: contactEmail,
        whatsapp,
        address,
        legal_text: legalText,
        contact_title: contactTitle,
        contact_text: contactText,
        form_button_color: buttonBackgroundColor,
        form_button_text_color: buttonContentColor,
        social_button_color: buttonBackgroundColor,
        social_icon_color: buttonContentColor,
        social_links: normalizedSocialLinks,
        menu_id: menuId || null,
        newsletter_enabled: newsletterEnabled,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "Error" }));
      const message = (data as { error?: string }).error || "No se pudo guardar el footer.";
      setError(message);
      setModal({ type: "error", title: "No se pudo guardar", message });
      setIsLoading(false);
      return;
    }

    setSocialLinks(normalizedSocialLinks);
    setModal({ type: "success", title: "Footer publicado", message: "Los cambios del footer global ya estan listos." });
    router.refresh();
    setIsLoading(false);
    if (!singleton) router.push("/admin/components/footers");
  }

  return (
    <form className="editor-form cms-footer-editor" onSubmit={handleSubmit}>
      <AdminActionModal
        open={Boolean(modal)}
        type={modal?.type}
        title={modal?.title ?? ""}
        message={modal?.message}
        confirmLabel="Entendido"
        onClose={() => setModal(null)}
      />

      {!singleton ? (
        <section className="form-block cms-editor-card">
          <h3>Informacion general</h3>
          <div className="grid-2">
            <label className="field span-2"><span>Nombre</span><input value={name} onChange={(event) => setName(event.target.value)} /></label>
          </div>
        </section>
      ) : null}

      <section className="form-block cms-editor-card">
        <div className="cms-editor-card__head">
          <div>
            <p className="auth-kicker">Footer global</p>
            <h3>Contacto</h3>
            <p className="cms-editor-card__description">El texto admite saltos de linea. La ultima linea se usa como titulo de redes sociales.</p>
          </div>
        </div>
        <div className="grid-2">
          <label className="field"><span>Titulo</span><input value={contactTitle} onChange={(event) => setContactTitle(event.target.value)} /></label>
          <label className="field span-2"><span>Descripcion</span><textarea rows={6} value={contactText} onChange={(event) => setContactText(event.target.value)} /></label>
        </div>
      </section>

      <section className="form-block cms-editor-card">
        <div className="cms-editor-card__head">
          <div>
            <p className="auth-kicker">Colores</p>
            <h3>Color de Botón de Formulario y Botones de Redes Sociales</h3>
          </div>
        </div>
        <div className="cms-footer-color-grid">
          <ColorPickerField label="Color de boton (background)" value={buttonBackgroundColor} onChange={setButtonBackgroundColor} />
          <ColorPickerField label="Color de Texto e Imagenes" value={buttonContentColor} onChange={setButtonContentColor} />
        </div>
      </section>

      <section className="form-block cms-editor-card">
        <div className="cms-editor-card__head">
          <div>
            <p className="auth-kicker">Redes sociales</p>
            <h3>Links e iconos</h3>
            <p className="cms-editor-card__description">Es recomendable que el icono sea completamente blanco para que se pueda editar facilmente.</p>
          </div>
          <button type="button" className="primary-btn" onClick={addSocial}>Añadir Red Social</button>
        </div>
        <div className="cms-footer-social-list">
          {socialLinks.length === 0 ? <p className="muted">Aun no hay redes sociales.</p> : socialLinks.map((social, idx) => (
            <article className="cms-footer-social-card" key={`social-link-${idx}`}>
              <div className="grid-2">
                <label className="field"><span>Plataforma</span><input value={social.platform} onChange={(event) => updateSocial(idx, "platform", event.target.value)} placeholder="Instagram" /></label>
                <label className="field"><span>Etiqueta accesible</span><input value={social.label} onChange={(event) => updateSocial(idx, "label", event.target.value)} placeholder="Instagram Casa Rosier" /></label>
                <label className="field span-2"><span>Link</span><input value={social.url} onChange={(event) => updateSocial(idx, "url", event.target.value)} placeholder="https://..." /></label>
                <div
                  className="cms-footer-icon-field"
                  style={{
                    "--cms-footer-icon-bg": buttonBackgroundColor,
                    "--cms-footer-icon-fg": buttonContentColor,
                    "--cms-footer-icon-url": cssUrl(social.icon_url ?? ""),
                  } as CSSProperties}
                >
                  <MediaSelectField label="Icono" value={social.icon_url ?? ""} onChange={(url) => updateSocial(idx, "icon_url", url)} previewClassName="cms-footer-icon-preview" />
                </div>
              </div>
              <div className="cms-footer-social-card__actions">
                <button type="button" className="danger-btn" onClick={() => removeSocial(idx)}>Eliminar red</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="form-block cms-editor-card">
        <div className="cms-footer-fixed-links">
          <span className="material-symbols-outlined" aria-hidden="true">lock</span>
          <div>
            <h3>Enlaces fijos</h3>
            <p>Administracion y Politica y privacidad se mantienen visibles y no son editables desde esta pantalla.</p>
          </div>
        </div>
      </section>

      {error ? <p className="form-error">{error}</p> : null}
      <div className="admin-sticky-actionbar">
        <span className="admin-sticky-actionbar__meta">{socialLinks.length} redes sociales · Footer global</span>
        <button className="primary-btn" type="submit" disabled={isLoading}>{isLoading ? "Publicando..." : "Publicar"}</button>
      </div>
    </form>
  );
}
