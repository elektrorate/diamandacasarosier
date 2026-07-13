"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ProductCategory } from "@/lib/cms/types";
import MediaSelectField from "./MediaSelectField";

export default function CategoryForm({ mode, item }: { mode: "create" | "edit"; item?: ProductCategory }) {
  const router = useRouter();
  const [name, setName] = useState(item?.name ?? "");
  const [slug, setSlug] = useState(item?.slug ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [imageId, setImageId] = useState(item?.image_id ?? "");
  const [status, setStatus] = useState(item?.status ?? "active");
  const [sortOrder, setSortOrder] = useState(item?.sort_order ?? 0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setIsLoading(true); setError(null);
    if (!name.trim()) { setError("El nombre es obligatorio."); setIsLoading(false); return; }
    const res = await fetch(mode === "create" ? "/api/admin/shop/categories" : `/api/admin/shop/categories/${item?.id}`, {
      method: mode === "create" ? "POST" : "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, description, image_id: imageId, status, sort_order: sortOrder }),
    });
    if (!res.ok) { const d = await res.json().catch(() => ({ error: "Error" })); setError((d as { error?: string }).error || "Error"); setIsLoading(false); return; }
    router.push("/admin/shop/categories"); router.refresh();
  }

  return (<form className="editor-form" onSubmit={handleSubmit}><section className="form-block"><h3>{mode === "create" ? "Nueva categoría" : "Editar categoría"}</h3>
    <div className="grid-2">
      <label className="field span-2"><span>Nombre</span><input value={name} onChange={(e) => setName(e.target.value)} /></label>
      <label className="field span-2"><span>Slug</span><input value={slug} onChange={(e) => setSlug(e.target.value)} /></label>
      <label className="field span-2"><span>Descripción</span><textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></label>
      <MediaSelectField label="Imagen" value={imageId} onChange={setImageId} />
      <label className="field"><span>Estado</span><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="active">Activa</option><option value="inactive">Inactiva</option></select></label>
      <label className="field"><span>Orden</span><input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} /></label>
    </div>
  </section>{error ? <p className="form-error">{error}</p> : null}<div className="form-actions"><button className="primary-btn" type="submit" disabled={isLoading}>{isLoading ? "Guardando..." : mode === "create" ? "Crear categoría" : "Guardar cambios"}</button></div></form>);
}
