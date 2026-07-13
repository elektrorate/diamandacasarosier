"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Redirect } from "@/lib/cms/types";

type RedirectDraft = {
  source_url: string;
  target_url: string;
};

export default function RedirectsTable({ items }: { items: Redirect[] }) {
  const router = useRouter();
  const initialDrafts = useMemo(() => {
    return Object.fromEntries(
      items.map((item) => [
        item.id,
        { source_url: item.source_url, target_url: item.target_url },
      ]),
    ) as Record<string, RedirectDraft>;
  }, [items]);

  const [drafts, setDrafts] = useState(initialDrafts);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function updateDraft(id: string, field: keyof RedirectDraft, value: string) {
    setDrafts((current) => ({
      ...current,
      [id]: {
        ...current[id],
        [field]: value,
      },
    }));
  }

  function isDirty(item: Redirect) {
    const draft = drafts[item.id];
    return draft && (draft.source_url !== item.source_url || draft.target_url !== item.target_url);
  }

  async function save(item: Redirect) {
    const draft = drafts[item.id];
    if (!draft) return;

    const source = draft.source_url.trim();
    const target = draft.target_url.trim();

    setError(null);
    if (!source || !target) {
      setError("Ambas URLs son obligatorias.");
      return;
    }
    if (source === target) {
      setError("Las URLs no pueden ser iguales.");
      return;
    }

    setSavingId(item.id);
    const response = await fetch(`/api/admin/redirecciones/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source_url: source,
        target_url: target,
        redirect_type: item.redirect_type,
        status: item.status,
      }),
    });

    if (response.ok) {
      router.refresh();
    } else {
      const data = await response.json().catch(() => ({ error: "No se pudo guardar la redirección." }));
      setError(data.error || "No se pudo guardar la redirección.");
    }
    setSavingId(null);
  }

  async function remove(id: string) {
    const confirmed = window.confirm("¿Eliminar esta redirección? Se moverá a la papelera del CMS.");
    if (!confirmed) return;

    setDeletingId(id);
    setError(null);

    const response = await fetch(`/api/admin/redirecciones/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "trash" }),
    });

    if (response.ok) {
      router.refresh();
    } else {
      const data = await response.json().catch(() => ({ error: "No se pudo eliminar la redirección." }));
      setError(data.error || "No se pudo eliminar la redirección.");
    }
    setDeletingId(null);
  }

  return (
    <div className="redirects-table-card">
      <div className="redirects-table-card__head">
        <div>
          <h3>Mapa de redirecciones</h3>
          <p className="muted">Edita cualquier fila y guarda solo los cambios necesarios.</p>
        </div>
        <span className="entity-badge">{items.length} registros</span>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="table-card redirects-table-wrap">
        <table className="admin-table redirects-table">
          <thead>
            <tr>
              <th>URL específica</th>
              <th>URL de redirección</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const draft = drafts[item.id] ?? { source_url: item.source_url, target_url: item.target_url };
              const dirty = isDirty(item);

              return (
                <tr key={item.id}>
                  <td>
                    <input
                      aria-label="URL específica"
                      value={draft.source_url}
                      onChange={(event) => updateDraft(item.id, "source_url", event.target.value)}
                      placeholder="/ruta-antigua"
                    />
                  </td>
                  <td>
                    <input
                      aria-label="URL de redirección"
                      value={draft.target_url}
                      onChange={(event) => updateDraft(item.id, "target_url", event.target.value)}
                      placeholder="/ruta-nueva"
                    />
                  </td>
                  <td>
                    <span className={`redirects-state ${dirty ? "redirects-state--dirty" : ""}`}>
                      {dirty ? "Pendiente" : "Guardado"}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions redirects-table__actions">
                      {dirty ? (
                        <button
                          type="button"
                          className="primary-btn"
                          onClick={() => save(item)}
                          disabled={savingId === item.id}
                        >
                          {savingId === item.id ? "Guardando..." : "Guardar"}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="danger-btn"
                        onClick={() => remove(item.id)}
                        disabled={deletingId === item.id}
                      >
                        {deletingId === item.id ? "Eliminando..." : "Eliminar"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
