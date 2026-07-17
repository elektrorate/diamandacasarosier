"use client";

import { useEffect, useRef, useState } from "react";
import MediaGrid from "./MediaGrid";
import Loader from "@/components/ui/Loader";
import EmptyState from "@/components/ui/EmptyState";
import { MEDIA_FOLDERS, type MediaAsset } from "@/lib/cms/types";
import type { MediaListResult, MediaSort, MediaTypeFilter } from "@/lib/cms/media";

interface MediaApiResponse extends MediaListResult {
  error?: string;
}

export default function MediaBrowser({ initialData }: { initialData: MediaListResult }) {
  const [data, setData] = useState(initialData);
  const [page, setPage] = useState(initialData.page);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [folder, setFolder] = useState("");
  const [type, setType] = useState<MediaTypeFilter>("all");
  const [sort, setSort] = useState<MediaSort>("newest");
  const [reloadToken, setReloadToken] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFirstQuery = useRef(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    if (isFirstQuery.current) {
      isFirstQuery.current = false;
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(initialData.pageSize),
      status: "active",
      type,
      sort,
    });
    if (search) params.set("search", search);
    if (folder) params.set("folder", folder);

    fetch(`/api/admin/media?${params.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = (await response.json().catch(() => ({}))) as MediaApiResponse;
        if (!response.ok) throw new Error(payload.error || "No se pudo cargar Multimedia.");
        setData(payload);
      })
      .catch((fetchError: unknown) => {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") return;
        setError(fetchError instanceof Error ? fetchError.message : "No se pudo cargar Multimedia.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [folder, initialData.pageSize, page, reloadToken, search, sort, type]);

  function resetAndSet<T>(setter: (value: T) => void, value: T) {
    setLoading(true);
    setError(null);
    setPage(1);
    setter(value);
  }

  function handleDeleted(asset: MediaAsset) {
    const remainingOnPage = data.assets.filter((item) => item.id !== asset.id).length;
    if (remainingOnPage === 0 && page > 1) {
      setPage((current) => current - 1);
    } else {
      setReloadToken((current) => current + 1);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="field">
          <span className="field-label">Buscar archivo</span>
          <input
            className="input"
            type="search"
            value={searchInput}
            placeholder="Nombre del archivo"
            onChange={(event) => { setLoading(true); setError(null); setSearchInput(event.target.value); }}
          />
        </label>
        <label className="field">
          <span className="field-label">Carpeta</span>
          <select className="select" value={folder} onChange={(event) => resetAndSet(setFolder, event.target.value)}>
            <option value="">Todas</option>
            {MEDIA_FOLDERS.map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
        </label>
        <label className="field">
          <span className="field-label">Tipo</span>
          <select className="select" value={type} onChange={(event) => resetAndSet(setType, event.target.value as MediaTypeFilter)}>
            <option value="all">Todos</option>
            <option value="image">Imágenes</option>
            <option value="video">Vídeos</option>
            <option value="document">Documentos</option>
          </select>
        </label>
        <label className="field">
          <span className="field-label">Orden</span>
          <select className="select" value={sort} onChange={(event) => resetAndSet(setSort, event.target.value as MediaSort)}>
            <option value="newest">Más recientes</option>
            <option value="oldest">Más antiguos</option>
            <option value="name">Nombre</option>
          </select>
        </label>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="muted">{data.total} archivos · página {data.page} de {data.totalPages}</p>
        {loading ? <Loader /> : null}
      </div>

      {error ? <div className="cms-editor-error" role="alert">{error}</div> : null}
      {!loading && data.assets.length === 0 ? (
        <EmptyState icon="image" title="No se encontraron archivos" description="Prueba con otra búsqueda o cambia los filtros." />
      ) : (
        <MediaGrid assets={data.assets} onDeleted={handleDeleted} />
      )}

      {data.totalPages > 1 ? (
        <div className="flex items-center justify-between gap-4 pt-2">
          <button type="button" className="secondary-btn" disabled={loading || page <= 1} onClick={() => { setLoading(true); setPage((current) => Math.max(1, current - 1)); }}>Anterior</button>
          <span className="muted">Página {page} de {data.totalPages}</span>
          <button type="button" className="secondary-btn" disabled={loading || page >= data.totalPages} onClick={() => { setLoading(true); setPage((current) => Math.min(data.totalPages, current + 1)); }}>Siguiente</button>
        </div>
      ) : null}
    </div>
  );
}