"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import type { Redirect } from "@/lib/cms/types";
import { formatAdminDate } from "@/lib/admin/date-format";
import RedirectsTable from "./RedirectsTable";

export default function RedirectsForm({ items }: { items: Redirect[] }) {
  const router = useRouter();
  const [source, setSource] = useState("");
  const [target, setTarget] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const active = items
    .filter((redirect) => redirect.status !== "deleted")
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  const permanentCount = active.filter((redirect) => redirect.redirect_type === "301").length;
  const lastUpdated = active[0]?.updated_at
    ? formatAdminDate(active[0].updated_at)
    : "Sin cambios";

  async function create(event: FormEvent) {
    event.preventDefault();
    const sourceUrl = source.trim();
    const targetUrl = target.trim();

    setError(null);
    if (!sourceUrl || !targetUrl) {
      setError("Ambas URLs son obligatorias.");
      return;
    }
    if (sourceUrl === targetUrl) {
      setError("Las URLs no pueden ser iguales.");
      return;
    }

    setIsCreating(true);
    const response = await fetch("/api/admin/redirecciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source_url: sourceUrl,
        target_url: targetUrl,
        redirect_type: "301",
        notes: "",
      }),
    });

    if (response.ok) {
      setSource("");
      setTarget("");
      router.refresh();
    } else {
      const data = await response.json().catch(() => ({ error: "No se pudo crear la redirección." }));
      setError(data.error || "No se pudo crear la redirección.");
    }
    setIsCreating(false);
  }

  return (
    <div className="redirects-page">
      <div className="section-head redirects-page__head">
        <div>
          <p className="auth-kicker">Setup página</p>
          <h2>Redirecciones</h2>
          <p className="muted">Mantén el mapa de URLs limpio para preservar señales SEO y evitar rutas rotas.</p>
        </div>
      </div>

      <div className="redirects-summary" aria-label="Resumen de redirecciones">
        <div className="redirects-summary__item">
          <span>Activas</span>
          <strong>{active.length}</strong>
        </div>
        <div className="redirects-summary__item">
          <span>Permanentes 301</span>
          <strong>{permanentCount}</strong>
        </div>
        <div className="redirects-summary__item">
          <span>Última actualización</span>
          <strong>{lastUpdated}</strong>
        </div>
      </div>

      <form className="redirects-create-form" onSubmit={create}>
        <div className="redirects-create-form__grid">
          <label className="field">
            <span>URL específica</span>
            <input value={source} onChange={(event) => setSource(event.target.value)} placeholder="/ruta-antigua" />
            <small>Ruta que quieres capturar.</small>
          </label>
          <label className="field">
            <span>URL de redirección</span>
            <input value={target} onChange={(event) => setTarget(event.target.value)} placeholder="/ruta-nueva" />
            <small>Destino final publicado.</small>
          </label>
          <div className="redirects-create-form__actions">
            <button className="primary-btn" type="submit" disabled={isCreating}>
              {isCreating ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
        {error ? <p className="form-error">{error}</p> : null}
      </form>

      {active.length === 0 ? (
        <div className="redirects-empty">
          <strong>No hay redirecciones activas</strong>
          <p>Agrega una URL específica y su destino para empezar a construir el mapa SEO.</p>
        </div>
      ) : (
        <RedirectsTable items={active} />
      )}
    </div>
  );
}
