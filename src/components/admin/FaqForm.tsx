"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Faq, FaqCategory, FaqStatus } from "@/lib/cms/types";
import { FAQ_CATEGORIES } from "@/lib/cms/types";

const catLabels: Record<string, string> = { general: "General", classes: "Clases", shop: "Shop", booking: "Reservas" };

export default function FaqForm({ mode, item }: { mode: "create" | "edit"; item?: Faq }) {
  const router = useRouter();
  const [question, setQuestion] = useState(item?.question ?? "");
  const [answer, setAnswer] = useState(item?.answer ?? "");
  const [category, setCategory] = useState(item?.category ?? "general");
  const [sortOrder, setSortOrder] = useState(item?.sort_order ?? 0);
  const [status, setStatus] = useState(item?.status ?? "draft");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setIsLoading(true); setError(null);
    if (!question.trim()) { setError("La pregunta es obligatoria."); setIsLoading(false); return; }
    const res = await fetch(mode === "create" ? "/api/admin/components/faqs" : `/api/admin/components/faqs/${item?.id}`, {
      method: mode === "create" ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, answer, category, sort_order: sortOrder, status }),
    });
    if (!res.ok) { const d = await res.json().catch(() => ({ error: "Error" })); setError((d as { error?: string }).error || "Error"); setIsLoading(false); return; }
    router.push("/admin/components/faqs"); router.refresh();
  }

  return (
    <form className="editor-form" onSubmit={handleSubmit}>
      <section className="form-block">
        <h3>FAQ</h3>
        <div className="grid-2">
          <label className="field span-2"><span>Pregunta</span><input value={question} onChange={(e) => setQuestion(e.target.value)} /></label>
          <label className="field span-2"><span>Respuesta</span><textarea rows={5} value={answer} onChange={(e) => setAnswer(e.target.value)} /></label>
          <label className="field"><span>Categoría</span><select value={category} onChange={(e) => setCategory(e.target.value as FaqCategory)}>{FAQ_CATEGORIES.map((c) => <option key={c} value={c}>{catLabels[c]}</option>)}</select></label>
          <label className="field"><span>Estado</span><select value={status} onChange={(e) => setStatus(e.target.value as FaqStatus)}><option value="draft">Borrador</option><option value="published">Publicado</option><option value="archived">Archivado</option></select></label>
          <label className="field"><span>Orden</span><input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} /></label>
        </div>
      </section>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="form-actions"><button className="primary-btn" type="submit" disabled={isLoading}>{isLoading ? "Guardando..." : mode === "create" ? "Crear FAQ" : "Guardar cambios"}</button></div>
    </form>
  );
}
