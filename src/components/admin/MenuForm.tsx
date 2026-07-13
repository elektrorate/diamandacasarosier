"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import type { Menu, MenuLocation, MenuStatus } from "@/lib/cms/types";
import { MENU_LOCATIONS } from "@/lib/cms/types";
import MenuItemsEditor from "./MenuItemsEditor";
import MenuPreview from "./MenuPreview";

const locLabels: Record<string, string> = { main: "Principal", mobile: "Móvil", footer: "Footer" };

export default function MenuForm({ mode, menu }: { mode: "create" | "edit"; menu?: Menu }) {
  const router = useRouter();
  const [name, setName] = useState(menu?.name ?? "");
  const [location, setLocation] = useState<MenuLocation>(menu?.location ?? "main");
  const [status, setStatus] = useState<MenuStatus>(menu?.status ?? "draft");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!name.trim()) {
      setError("El nombre es obligatorio.");
      setIsLoading(false);
      return;
    }

    const response = await fetch(mode === "create" ? "/api/admin/menus" : `/api/admin/menus/${menu?.id}`, {
      method: mode === "create" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, location, status }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: "Error al guardar." }));
      setError((data as { error?: string }).error || "Error al guardar.");
      setIsLoading(false);
      return;
    }

    if (mode === "create") {
      router.push("/admin/menu");
    }
    router.refresh();
    setIsLoading(false);
  }

  return (
    <div className="menu-form-layout">
      <div className="menu-form-main">
        <form className="editor-form" onSubmit={handleSubmit}>
          <section className="form-block">
            <h3>Información del menú</h3>
            <div className="grid-2">
              <label className="field span-2">
                <span>Nombre</span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Menú principal" />
              </label>
              <label className="field">
                <span>Ubicación</span>
                <select value={location} onChange={(e) => setLocation(e.target.value as MenuLocation)}>
                  {MENU_LOCATIONS.map((l) => <option key={l} value={l}>{locLabels[l]}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Estado</span>
                <select value={status} onChange={(e) => setStatus(e.target.value as MenuStatus)}>
                  <option value="active">Activo</option>
                  <option value="draft">Borrador</option>
                  <option value="archived">Archivado</option>
                </select>
              </label>
            </div>
          </section>

          {error ? <p className="form-error">{error}</p> : null}

          <div className="form-actions">
            <button className="primary-btn" type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : mode === "create" ? "Crear menú" : "Guardar cambios"}
            </button>
          </div>
        </form>

        {mode === "edit" && menu ? (
          <div style={{ marginTop: "1.5rem" }}>
            <MenuItemsEditor key={refreshKey} menu={menu} onItemsChange={triggerRefresh} />
          </div>
        ) : null}
      </div>

      <aside className="menu-preview-sidebar">
        <h3>Preview</h3>
        {mode === "edit" && menu ? (
          <MenuPreview menu={{ ...menu, name, location, status }} />
        ) : mode === "create" ? (
          <div className="menu-preview-box">
            <p className="muted">Crea el menú primero para ver la previsualización.</p>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
