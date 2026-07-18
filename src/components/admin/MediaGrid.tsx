"use client";

import Image from "next/image";
import { useState } from "react";
import type { MediaAsset } from "@/lib/cms/types";

type Toast = { type: "success" | "error"; message: string };

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImage(asset: MediaAsset) {
  return ["jpg", "jpeg", "png", "webp", "gif", "svg", "avif"].includes(asset.file_type);
}

function isVideo(asset: MediaAsset) {
  return ["mp4", "webm", "mov", "m4v"].includes(asset.file_type);
}

function absoluteUrl(url: string) {
  if (/^https?:\/\//i.test(url)) return url;
  return window.location.origin + url;
}

function isAbsoluteUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

export default function MediaGrid({
  assets,
  onSelect,
  onDeleted,
}: {
  assets: MediaAsset[];
  onSelect?: (url: string) => void;
  onDeleted?: (asset: MediaAsset) => void;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  async function copyUrl(url: string, id: string) {
    await navigator.clipboard.writeText(absoluteUrl(url));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function showToast(nextToast: Toast) {
    setToast(nextToast);
    window.setTimeout(() => setToast(null), 3000);
  }

  async function deletePhoto(asset: MediaAsset) {
    if (deletingId) return;
    if (!window.confirm("¿Eliminar esta foto definitivamente de Multimedia y Supabase?")) return;

    setDeletingId(asset.id);
    try {
      const response = await fetch("/api/admin/media/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: asset.id, action: "permanent" }),
      });

      if (response.ok) {
        showToast({ type: "success", message: "Foto eliminada correctamente." });
        onDeleted?.(asset);
        return;
      }

      const data = (await response.json().catch(() => ({}))) as { error?: string };
      showToast({ type: "error", message: data.error || "No se pudo eliminar la foto." });
    } catch {
      showToast({ type: "error", message: "No se pudo conectar con el servidor. Intenta nuevamente." });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {toast ? (
        <div
          className={`rounded-xl border px-4 py-3 text-label-md ${
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-error bg-error-container text-on-error-container"
          }`}
          role={toast.type === "error" ? "alert" : "status"}
          aria-live="polite"
        >
          {toast.message}
        </div>
      ) : null}

      <div className="media-grid">
        {assets.map((asset) => {
          const isPhoto = isImage(asset);
          const isDeleting = deletingId === asset.id;

          return (
            <div key={asset.id} className="media-card">
              <div className="media-preview relative">
                {isPhoto ? (
                  isAbsoluteUrl(asset.file_url) ? (
                    <img src={asset.file_url} alt={asset.alt_text || asset.original_name} className="media-img-preview" loading="lazy" decoding="async" />
                  ) : (
                    <Image src={asset.file_url} alt={asset.alt_text || asset.original_name} fill sizes="220px" className="object-cover" unoptimized />
                  )
                ) : isVideo(asset) ? (
                  <video src={asset.file_url} className="media-video-preview" controls preload="metadata" />
                ) : (
                  <div className="media-file-icon">
                    <span>{asset.file_type.toUpperCase() || "FILE"}</span>
                  </div>
                )}
              </div>

              <div className="media-info">
                <strong className="media-name">{asset.original_name}</strong>
                <p className="muted">{asset.folder} · {formatSize(asset.size)}</p>
                <a className="media-url" href={asset.file_url} target="_blank" rel="noopener noreferrer">
                  {asset.file_url}
                </a>
              </div>

              <div className="media-actions">
                {onSelect ? (
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={() => onSelect(asset.file_url)}
                  >
                    Seleccionar
                  </button>
                ) : null}
                <button
                  type="button"
                  className="secondary-btn"
                  disabled={Boolean(deletingId)}
                  onClick={() => copyUrl(asset.file_url, asset.id)}
                >
                  {copiedId === asset.id ? "Copiado" : "Copiar URL"}
                </button>
                {!onSelect && isPhoto ? (
                  <button
                    type="button"
                    className="danger-btn"
                    disabled={Boolean(deletingId)}
                    onClick={() => deletePhoto(asset)}
                  >
                    {isDeleting ? "Eliminando..." : "Eliminar foto"}
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
