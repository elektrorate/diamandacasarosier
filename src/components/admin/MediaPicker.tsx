"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Loader from "@/components/ui/Loader";
import EmptyState from "@/components/ui/EmptyState";
import type { MediaAsset } from "@/lib/cms/types";

interface MediaPickerResponse {
  assets?: MediaAsset[];
  total?: number;
  totalPages?: number;
  error?: string;
}

function isAbsoluteUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

export default function MediaPicker({
  onSelect,
  onClose,
}: {
  onSelect: (url: string) => void;
  onClose: () => void;
}) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setAssets([]);
      setPage(1);
      setSearch(searchInput.trim());
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      status: "active",
      type: "image",
      sort: "newest",
      page: String(page),
      pageSize: "24",
    });
    if (search) params.set("search", search);

    fetch(`/api/admin/media?${params.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = (await response.json().catch(() => ({}))) as MediaPickerResponse;
        if (!response.ok) throw new Error(payload.error || "No se pudo cargar la biblioteca.");
        setAssets((current) => page === 1 ? (payload.assets ?? []) : [...current, ...(payload.assets ?? [])]);
        setTotalPages(payload.totalPages ?? 1);
        setTotal(payload.total ?? 0);
      })
      .catch((fetchError: unknown) => {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") return;
        setError(fetchError instanceof Error ? fetchError.message : "No se pudo cargar la biblioteca.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [page, search]);

  return (
    <div className="media-library-picker space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="media-library-picker__title text-headline-sm text-on-surface">Biblioteca del proyecto</h3>
          <p className="media-library-picker__copy text-label-md text-on-surface-variant">Selecciona una de {total} imágenes activas.</p>
        </div>
        <button type="button" className="secondary-btn" onClick={onClose}>Cerrar</button>
      </div>

      <label className="field">
        <span className="field-label">Buscar imagen</span>
        <input className="input" type="search" value={searchInput} placeholder="Nombre del archivo" onChange={(event) => { setIsLoading(true); setError(null); setSearchInput(event.target.value); }} />
      </label>

      {error ? <div className="cms-editor-error" role="alert">{error}</div> : null}
      {isLoading && assets.length === 0 ? (
        <Loader />
      ) : assets.length === 0 ? (
        <EmptyState icon="image" title="No hay archivos" description="No se encontraron imágenes activas con esos criterios." />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {assets.map((asset) => (
              <button
                key={asset.id}
                type="button"
                className="media-library-picker__asset group text-left rounded-xl border border-outline-variant bg-surface-container-lowest overflow-hidden hover:border-primary-container hover:shadow-lg transition-all"
                onClick={() => { onSelect(asset.file_url); onClose(); }}
              >
                <div className="relative aspect-square overflow-hidden bg-surface-container">
                  {isAbsoluteUrl(asset.file_url) ? (
                    <img src={asset.file_url} alt={asset.alt_text || asset.original_name} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]" />
                  ) : (
                    <Image src={asset.file_url} alt={asset.alt_text || asset.original_name} fill sizes="(min-width: 640px) 33vw, 50vw" className="object-cover group-hover:scale-[1.02] transition-transform" unoptimized />
                  )}
                </div>
                <div className="p-3">
                  <div className="media-library-picker__name text-label-md text-on-surface font-medium truncate">{asset.original_name}</div>
                  <div className="media-library-picker__folder text-[11px] text-on-surface-variant/70 truncate">{asset.folder}</div>
                </div>
              </button>
            ))}
          </div>
          {page < totalPages ? (
            <div className="flex justify-center pt-2">
              <button type="button" className="secondary-btn" disabled={isLoading} onClick={() => { setIsLoading(true); setError(null); setPage((current) => current + 1); }}>
                {isLoading ? "Cargando..." : "Cargar más"}
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}