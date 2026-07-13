"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Faq } from "@/lib/cms/types";

const catLabels: Record<string, string> = { general: "General", classes: "Clases", shop: "Shop", booking: "Reservas" };
type Toast = { type: "success" | "error"; message: string };

export default function FaqsTable({ items }: { items: Faq[] }) {
  const router = useRouter();
  const [toast, setToast] = useState<Toast | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(null), 3200); return () => window.clearTimeout(timer); }, [toast]);
  function message(action: string) { if (action === "duplicate") return "FAQ duplicada correctamente."; if (action === "publish") return "FAQ publicada correctamente."; if (action === "draft") return "FAQ pasada a borrador correctamente."; if (action === "trash") return "FAQ enviada a la papelera correctamente."; return "Accion completada correctamente."; }
  async function run(id: string, action: string) {
    if (pendingAction) return;
    if (action === "trash" && !window.confirm("¿Mover esta FAQ a la papelera?")) return;
    setToast(null); setPendingAction(`${id}:${action}`);
    try {
      const r = await fetch(`/api/admin/components/faqs/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
      if (r.ok) { setToast({ type: "success", message: message(action) }); router.refresh(); return; }
      const data = await r.json().catch(() => ({})) as { error?: string };
      setToast({ type: "error", message: data.error || "No se pudo completar la accion." });
    } catch {
      setToast({ type: "error", message: "No se pudo conectar con el servidor. Intenta nuevamente." });
    } finally { setPendingAction(null); }
  }
  return (<div className="space-y-4">{toast ? <div className={`admin-toast admin-toast--${toast.type}`} role={toast.type === "error" ? "alert" : "status"} aria-live="polite">{toast.message}</div> : null}<div className="table-card"><table className="admin-table"><thead><tr><th>Pregunta</th><th>Categoría</th><th>Orden</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{items.map((i) => { const rowPending = pendingAction?.startsWith(`${i.id}:`); return (<tr key={i.id}><td><strong>{i.question}</strong></td><td><span className="entity-badge">{catLabels[i.category] || i.category}</span></td><td>{i.sort_order}</td><td>{i.status}</td><td><div className="row-actions"><a className="link-btn" href={`/admin/components/faqs/${i.id}/edit`}>Editar</a><button className="secondary-btn" disabled={rowPending} onClick={() => run(i.id, "duplicate")}>{pendingAction === `${i.id}:duplicate` ? "Duplicando..." : "Duplicar"}</button>{i.status === "published" ? <button className="secondary-btn" disabled={rowPending} onClick={() => run(i.id, "draft")}>Borrador</button> : <button className="secondary-btn" disabled={rowPending} onClick={() => run(i.id, "publish")}>Publicar</button>}<button className="danger-btn" disabled={rowPending} onClick={() => run(i.id, "trash")}>Papelera</button></div></td></tr>); })}</tbody></table></div></div>);
}
