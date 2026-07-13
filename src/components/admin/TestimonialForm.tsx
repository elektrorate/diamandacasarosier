"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Testimonial, TestimonialStatus } from "@/lib/cms/types";
import AdminActionModal from "./AdminActionModal";
import MediaSelectField from "./MediaSelectField";

type Notice = { type: "success" | "error"; title: string; message: string };

export default function TestimonialForm({ mode, item }: { mode: "create" | "edit"; item?: Testimonial }) {
  const router = useRouter();
  const [name, setName] = useState(item?.name ?? "");
  const [role, setRole] = useState(item?.role ?? "");
  const [text, setText] = useState(item?.text ?? "");
  const [avatarId, setAvatarId] = useState(item?.avatar_id ?? "");
  const [sortOrder, setSortOrder] = useState(item?.sort_order ?? 0);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [savingStatus, setSavingStatus] = useState<TestimonialStatus | null>(null);
  const [returnAfterNotice, setReturnAfterNotice] = useState(false);

  useEffect(() => {
    if (!notice || notice.type === "success") return;
    const timer = window.setTimeout(() => setNotice(null), 4200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  async function save(nextStatus: "draft" | "published") {
    setSavingStatus(nextStatus); setNotice(null);
    if (!name.trim()) { setNotice({ type: "error", title: "Revisa el testimonio", message: "El nombre es obligatorio." }); setSavingStatus(null); return; }
    try {
      const res = await fetch(mode === "create" ? "/api/admin/components/testimonials" : `/api/admin/components/testimonials/${item?.id}`, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, text, avatar_id: avatarId, status: nextStatus, sort_order: sortOrder, is_featured: false }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({ error: "No se pudo guardar el testimonio." }));
        setNotice({
          type: "error",
          title: "No se pudo completar",
          message: (d as { error?: string }).error || "No se pudo guardar el testimonio.",
        });
        return;
      }
      setNotice({
        type: "success",
        title: "Acción completada",
        message: nextStatus === "published" ? "Publicado exitosamente." : "Borrador guardado correctamente.",
      });
      router.refresh();
      if (mode === "create") setReturnAfterNotice(true);
    } catch {
      setNotice({
        type: "error",
        title: "No se pudo conectar",
        message: "No se pudo conectar con el servidor. Intenta nuevamente.",
      });
    } finally {
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
          if (returnAfterNotice) router.push("/admin/components/testimonials");
        }}
      />

      <section className="form-block">
        <h3>Información del testimonio</h3>
        <div className="grid-2">
          <label className="field span-2"><span>Nombre</span><input value={name} onChange={(e) => setName(e.target.value)} /></label>
          <label className="field span-2"><span>Rol o contexto</span><input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Alumna de cerámica" /></label>
          <label className="field span-2"><span>Texto</span><textarea rows={5} value={text} onChange={(e) => setText(e.target.value)} maxLength={260} /><small>{text.length}/260</small></label>
          <MediaSelectField label="Avatar" value={avatarId} onChange={setAvatarId} className="span-2 testimonial-avatar-field" />
          <label className="field"><span>Orden</span><input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} /></label>
        </div>
      </section>
      <aside className="form-preview-card testimonial-preview-card" aria-label="Vista previa del testimonio">
        <p className="auth-kicker">Vista previa</p>
        <div className="testimonial-preview-card__avatar">
          {avatarId ? <img src={avatarId} alt={name || "Avatar"} /> : <span>{(name || "T").slice(0, 1).toUpperCase()}</span>}
        </div>
        <blockquote>{text || "El texto del testimonio aparecerá aquí."}</blockquote>
        <strong>{name || "Nombre de la persona"}</strong>
        <span>{role || "Rol o contexto"}</span>
      </aside>
      <div className="form-actions">
        <button className="secondary-btn" type="submit" disabled={savingStatus !== null}>
          {savingStatus === "draft" ? "Guardando..." : "Borrador"}
        </button>
        <button className="primary-btn" type="button" onClick={() => void save("published")} disabled={savingStatus !== null}>
          {savingStatus === "published" ? "Publicando..." : "Publicar"}
        </button>
      </div>
    </form>
  );
}
