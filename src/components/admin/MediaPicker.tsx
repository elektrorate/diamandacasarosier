"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Loader from "@/components/ui/Loader";
import EmptyState from "@/components/ui/EmptyState";
import type { MediaAsset } from "@/lib/cms/types";

function isImage(asset: MediaAsset) {
  const extension = asset.file_type.toLowerCase();
  const mimeType = asset.mime_type.toLowerCase();
  return ["jpg", "jpeg", "png", "webp", "gif", "svg", "avif"].includes(extension) || mimeType.startsWith("image/");
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/admin/media?status=active");
      if (response.ok) {
        const data = await response.json();
        setAssets(data.assets || []);
      } else {
        setAssets([]);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  return (
    <div className="media-library-picker space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="media-library-picker__title text-headline-sm text-on-surface">Biblioteca del proyecto</h3>
          <p className="media-library-picker__copy text-label-md text-on-surface-variant">Selecciona una imagen activa.</p>
        </div>
        <button type="button" className="secondary-btn" onClick={onClose}>
          Cerrar
        </button>
      </div>
      {isLoading ? (
        <Loader />
      ) : assets.filter((a) => a.status === "active" && isImage(a)).length === 0 ? (
        <EmptyState
          icon="image"
          title="No hay archivos"
          description="No se encontraron imágenes activas en la biblioteca."
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {assets
            .filter((a) => a.status === "active" && isImage(a))
            .map((asset) => (
              <button
                key={asset.id}
                type="button"
                className="media-library-picker__asset group text-left rounded-xl border border-outline-variant bg-surface-container-lowest overflow-hidden hover:border-primary-container hover:shadow-lg transition-all"
                onClick={() => {
                  onSelect(asset.file_url);
                  onClose();
                }}
              >
                <div className="relative aspect-square overflow-hidden bg-surface-container">
                  {isAbsoluteUrl(asset.file_url) ? (
                    <img src={asset.file_url} alt={asset.alt_text || asset.original_name} className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]" />
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
      )}
    </div>
  );
}
