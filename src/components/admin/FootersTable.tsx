"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { FooterComponent } from "@/lib/cms/types";

type Toast = { type: "success" | "error"; message: string };

export default function FootersTable({ items }: { items: FooterComponent[] }) {
  const router = useRouter();
  const [toast, setToast] = useState<Toast | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function message(action: string) {
    if (action === "duplicate") return "Footer duplicado correctamente.";
    if (action === "publish") return "Footer publicado correctamente.";
    if (action === "draft") return "Footer pasado a borrador correctamente.";
    if (action === "trash") return "Footer enviado a la papelera correctamente.";
    return "Accion completada correctamente.";
  }

  async function run(id: string, action: string) {
    if (pendingAction) return;
    if (action === "trash" && !window.confirm("¿Mover este footer a la papelera?")) return;
    setToast(null);
    setPendingAction(`${id}:${action}`);
    try {
      const r = await fetch(`/api/admin/components/footers/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
      if (r.ok) { setToast({ type: "success", message: message(action) }); router.refresh(); return; }
      const data = await r.json().catch(() => ({})) as { error?: string };
      setToast({ type: "error", message: data.error || "No se pudo completar la accion." });
    } catch {
      setToast({ type: "error", message: "No se pudo conectar con el servidor. Intenta nuevamente." });
    } finally {
      setPendingAction(null);
    }
  }
  return (<div className="space-y-4">{toast ? <div className={`admin-toast admin-toast--${toast.type}`} role={toast.type === "error" ? "alert" : "status"} aria-live="polite">{toast.message}</div> : null}<div className="table-card"><table className="admin-table"><thead><tr><th>Nombre</th><th>Estado</th><th>Email</th><th>WhatsApp</th><th>Newsletter</th><th>Actualizado</th><th>Acciones</th></tr></thead><tbody>{items.map((i) => { const rowPending = pendingAction?.startsWith(`${i.id}:`); return (<tr key={i.id}><td><strong>{i.name}</strong></td><td>{i.status}</td><td>{i.contact_email || "—"}</td><td>{i.whatsapp || "—"}</td><td>{i.newsletter_enabled ? "Sí" : "No"}</td><td>{new Date(i.updated_at).toLocaleString()}</td><td><div className="row-actions"><a className="link-btn" href={`/admin/components/footers/${i.id}/edit`}>Editar</a><button className="secondary-btn" disabled={rowPending} onClick={() => run(i.id, "duplicate")}>{pendingAction === `${i.id}:duplicate` ? "Duplicando..." : "Duplicar"}</button>{i.status === "published" ? <button className="secondary-btn" disabled={rowPending} onClick={() => run(i.id, "draft")}>Borrador</button> : <button className="secondary-btn" disabled={rowPending} onClick={() => run(i.id, "publish")}>Publicar</button>}<button className="danger-btn" disabled={rowPending} onClick={() => run(i.id, "trash")}>Papelera</button></div></td></tr>); })}</tbody></table></div></div>);
}
