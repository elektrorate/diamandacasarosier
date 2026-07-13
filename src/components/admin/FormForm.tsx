"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Form, FormField, FormFieldType } from "@/lib/cms/types";
import { FORM_TYPES, FORM_FIELD_TYPES } from "@/lib/cms/types";
import { randomUUID } from "crypto";

const typeLabels: Record<string, string> = { contact: "Contacto", newsletter: "Newsletter", landing: "Landing", workshop: "Taller", gift_card: "Gift Card", private_booking: "Reserva privada", custom: "Custom" };
const fieldTypeLabels: Record<string, string> = { text: "Texto", email: "Email", phone: "Teléfono", textarea: "Área de texto", select: "Select", checkbox: "Checkbox", radio: "Radio", date: "Fecha", number: "Número", hidden: "Oculto" };

export default function FormForm({ mode, item }: { mode: "create" | "edit"; item?: Form }) {
  const router = useRouter();
  const [name, setName] = useState(item?.name ?? "");
  const [slug, setSlug] = useState(item?.slug ?? "");
  const [type, setType] = useState(item?.type ?? "contact");
  const [status, setStatus] = useState(item?.status ?? "draft");
  const [title, setTitle] = useState(item?.title ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [successMessage, setSuccessMessage] = useState(item?.success_message ?? "Mensaje enviado correctamente.");
  const [redirectUrl, setRedirectUrl] = useState(item?.redirect_url ?? "");
  const [emailNotify, setEmailNotify] = useState(item?.email_notification_enabled ?? false);
  const [notifEmail, setNotifEmail] = useState(item?.notification_email ?? "");
  const [fields, setFields] = useState<FormField[]>(item?.fields ?? []);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function addField() {
    setFields([...fields, { id: `new_${Date.now()}`, label: "", name: "", type: "text", placeholder: "", required: false, options: [], default_value: "", sort_order: fields.length, is_visible: true }]);
  }
  function updateField(idx: number, key: string, value: unknown) { const c = [...fields]; c[idx] = { ...c[idx], [key]: value }; setFields(c); }
  function removeField(idx: number) { setFields(fields.filter((_, i) => i !== idx)); }
  function moveField(idx: number, dir: "up" | "down") {
    if ((dir === "up" && idx === 0) || (dir === "down" && idx === fields.length - 1)) return;
    const c = [...fields]; [c[idx], c[dir === "up" ? idx - 1 : idx + 1]] = [c[dir === "up" ? idx - 1 : idx + 1], c[idx]]; setFields(c);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setIsLoading(true); setError(null);
    if (!name.trim()) { setError("El nombre es obligatorio."); setIsLoading(false); return; }
    const res = await fetch(mode === "create" ? "/api/admin/formularios" : `/api/admin/formularios/${item?.id}`, {
      method: mode === "create" ? "POST" : "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, type, status, title, description, success_message: successMessage, redirect_url: redirectUrl, email_notification_enabled: emailNotify, notification_email: notifEmail, fields: fields.map((f, i) => ({ ...f, sort_order: i })) }),
    });
    if (!res.ok) { const d = await res.json().catch(() => ({ error: "Error" })); setError((d as { error?: string }).error || "Error"); setIsLoading(false); return; }
    router.push("/admin/formularios"); router.refresh();
  }

  return (
    <div className="header-form-layout">
      <div className="menu-form-main">
        <form className="editor-form" onSubmit={handleSubmit}>
          <section className="form-block"><h3>Información general</h3>
            <div className="grid-2">
              <label className="field span-2"><span>Nombre</span><input value={name} onChange={(e) => setName(e.target.value)} /></label>
              <label className="field span-2"><span>Slug</span><input value={slug} onChange={(e) => setSlug(e.target.value)} /></label>
              <label className="field"><span>Tipo</span><select value={type} onChange={(e) => setType(e.target.value as typeof type)}>{FORM_TYPES.map((t) => <option key={t} value={t}>{typeLabels[t]}</option>)}</select></label>
              <label className="field"><span>Estado</span><select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}><option value="draft">Borrador</option><option value="active">Activo</option><option value="archived">Archivado</option></select></label>
            </div>
          </section>

          <section className="form-block"><h3>Contenido</h3>
            <div className="grid-2">
              <label className="field span-2"><span>Título visible</span><input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
              <label className="field span-2"><span>Descripción</span><textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></label>
              <label className="field span-2"><span>Mensaje de éxito</span><input value={successMessage} onChange={(e) => setSuccessMessage(e.target.value)} /></label>
              <label className="field span-2"><span>URL de redirección (opcional)</span><input value={redirectUrl} onChange={(e) => setRedirectUrl(e.target.value)} /></label>
            </div>
          </section>

          <section className="form-block"><h3>Email de notificación</h3>
            <div className="grid-2">
              <label className="field checkbox-field"><input type="checkbox" checked={emailNotify} onChange={(e) => setEmailNotify(e.target.checked)} /><span>Activar notificaciones</span></label>
              {emailNotify ? <label className="field"><span>Email de notificación</span><input type="email" value={notifEmail} onChange={(e) => setNotifEmail(e.target.value)} /></label> : null}
            </div>
          </section>

          <section className="form-block">
            <div className="menu-editor-head"><h3>Campos ({fields.length})</h3><button type="button" className="primary-btn" onClick={addField}>Añadir campo</button></div>
            {fields.length === 0 ? <p className="muted">Aún no hay campos.</p> : fields.map((f, idx) => (
              <div key={f.id} className="menu-item-form-wrap" style={{ marginBottom: "0.75rem" }}>
                <div className="menu-item-row" style={{ padding: 0, marginBottom: "0.5rem" }}>
                  <span className="menu-item-label">{f.label || fieldTypeLabels[f.type]}</span>
                  <span className="entity-badge">{fieldTypeLabels[f.type]}</span>
                  <span className="menu-item-badge">{f.required ? "requerido" : ""}{!f.is_visible ? " oculto" : ""}</span>
                  <div className="row-actions" style={{ marginLeft: "auto" }}>
                    <button type="button" className="secondary-btn" onClick={() => moveField(idx, "up")} disabled={idx === 0}>▲</button>
                    <button type="button" className="secondary-btn" onClick={() => moveField(idx, "down")} disabled={idx === fields.length - 1}>▼</button>
                    <button type="button" className="danger-btn" onClick={() => removeField(idx)}>Eliminar</button>
                  </div>
                </div>
                <div className="grid-2">
                  <label className="field"><span>Label</span><input value={f.label} onChange={(e) => updateField(idx, "label", e.target.value)} /></label>
                  <label className="field"><span>Nombre (name)</span><input value={f.name} onChange={(e) => updateField(idx, "name", e.target.value)} /></label>
                  <label className="field"><span>Tipo</span><select value={f.type} onChange={(e) => updateField(idx, "type", e.target.value as FormFieldType)}>{FORM_FIELD_TYPES.map((ft) => <option key={ft} value={ft}>{fieldTypeLabels[ft]}</option>)}</select></label>
                  <label className="field"><span>Placeholder</span><input value={f.placeholder} onChange={(e) => updateField(idx, "placeholder", e.target.value)} /></label>
                  <label className="field checkbox-field"><input type="checkbox" checked={f.required} onChange={(e) => updateField(idx, "required", e.target.checked)} /><span>Requerido</span></label>
                  <label className="field checkbox-field"><input type="checkbox" checked={f.is_visible} onChange={(e) => updateField(idx, "is_visible", e.target.checked)} /><span>Visible</span></label>
                  {(f.type === "select" || f.type === "radio" || f.type === "checkbox") ? (
                    <label className="field span-2"><span>Opciones (una por línea)</span><textarea rows={3} value={f.options.join("\n")} onChange={(e) => updateField(idx, "options", e.target.value.split("\n").filter(Boolean))} /></label>
                  ) : null}
                  <label className="field"><span>Valor por defecto</span><input value={f.default_value} onChange={(e) => updateField(idx, "default_value", e.target.value)} /></label>
                </div>
              </div>
            ))}
          </section>

          {error ? <p className="form-error">{error}</p> : null}
          <div className="form-actions"><button className="primary-btn" type="submit" disabled={isLoading}>{isLoading ? "Guardando..." : mode === "create" ? "Crear formulario" : "Guardar cambios"}</button></div>
        </form>
      </div>

      <aside className="menu-preview-sidebar">
        <h3>Preview</h3>
        <div className="menu-preview-box">
          {title ? <h4 style={{ margin: "0 0 0.3rem" }}>{title}</h4> : null}
          {description ? <p className="muted" style={{ fontSize: "0.85rem" }}>{description}</p> : null}
          <hr style={{ margin: "0.75rem 0", border: "none", borderTop: "1px solid var(--line)" }} />
          {fields.filter((f) => f.is_visible).map((f, i) => (
            <div key={f.id || i} style={{ marginBottom: "0.5rem", fontSize: "0.85rem" }}>
              <label style={{ display: "block", marginBottom: "0.15rem", fontWeight: 500 }}>{f.label || fieldTypeLabels[f.type]}{f.required ? <span style={{ color: "var(--danger)" }}> *</span> : null}</label>
              {f.type === "textarea" ? <div style={{ minHeight: "2.5rem", background: "var(--bg2)", borderRadius: "4px", border: "1px solid var(--line)" }} /> :
               f.type === "select" || f.type === "radio" ? <div style={{ height: "1.8rem", background: "var(--bg2)", borderRadius: "4px", border: "1px solid var(--line)" }} /> :
               f.type === "checkbox" ? <div style={{ width: "1rem", height: "1rem", background: "var(--bg2)", borderRadius: "3px", border: "1px solid var(--line)" }} /> :
               <div style={{ height: "1.8rem", background: "var(--bg2)", borderRadius: "4px", border: "1px solid var(--line)" }} />}
            </div>
          ))}
          {fields.filter((f) => f.is_visible).length === 0 ? <p className="muted">Sin campos visibles</p> : null}
          <div style={{ marginTop: "0.75rem", padding: "0.4rem 0.8rem", background: "var(--accent)", color: "#fff", borderRadius: "4px", fontSize: "0.8rem", textAlign: "center" }}>{successMessage}</div>
        </div>
      </aside>
    </div>
  );
}
