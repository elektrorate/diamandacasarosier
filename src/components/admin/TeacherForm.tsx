"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Teacher, TeacherStatus } from "@/lib/cms/types";
import MediaSelectField from "./MediaSelectField";
import RichTextField from "./RichTextField";

export default function TeacherForm({
  mode,
  item,
  basePath = "/admin/components/teachers",
}: {
  mode: "create" | "edit";
  item?: Teacher;
  basePath?: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(item?.name ?? "");
  const [bio, setBio] = useState(item?.bio ?? "");
  const [imageId, setImageId] = useState(item?.image_id ?? "");
  const [instagram, setInstagram] = useState(item?.instagram ?? "");
  const [specialty, setSpecialty] = useState(item?.specialty ?? "");
  const [status, setStatus] = useState(item?.status ?? "draft");
  const [sortOrder, setSortOrder] = useState(item?.sort_order ?? 0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setIsLoading(true); setError(null);
    if (!name.trim()) { setError("El nombre es obligatorio."); setIsLoading(false); return; }
    const res = await fetch(mode === "create" ? "/api/admin/components/teachers" : `/api/admin/components/teachers/${item?.id}`, {
      method: mode === "create" ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, bio, image_id: imageId, instagram, specialty, status, sort_order: sortOrder }),
    });
    if (!res.ok) { const d = await res.json().catch(() => ({ error: "Error" })); setError((d as { error?: string }).error || "Error"); setIsLoading(false); return; }
    router.push(basePath); router.refresh();
  }

  return (
    <form className="editor-form" onSubmit={handleSubmit}>
      <section className="form-block cms-editor-card">
        <div className="cms-editor-card__head">
          <div>
            <p className="auth-kicker">Perfil</p>
            <h3>Especialista</h3>
          </div>
        </div>
        <div className="studio-specialist-form">
          <label className="field"><span>Nombre</span><input value={name} onChange={(e) => setName(e.target.value)} /></label>
          <label className="field"><span>Subtítulo / título profesional</span><input value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="Ceramista y especialista" /></label>
          <label className="field span-2"><span>Instagram</span><input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@usuario" /></label>
          <div className="span-2">
            <MediaSelectField label="Imagen" value={imageId} onChange={setImageId} />
          </div>
          <div className="span-2">
            <RichTextField label="Descripción" value={bio} onChange={setBio} minHeight="220px" />
          </div>
          <label className="field"><span>Estado</span><select value={status} onChange={(e) => setStatus(e.target.value as TeacherStatus)}><option value="draft">Borrador</option><option value="published">Publicado</option><option value="archived">Archivado</option></select></label>
          <label className="field"><span>Orden</span><input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} /></label>
        </div>
      </section>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="form-actions"><button className="primary-btn" type="submit" disabled={isLoading}>{isLoading ? "Guardando..." : mode === "create" ? "Crear especialista" : "Guardar cambios"}</button></div>
    </form>
  );
}
