"use client";

import Image from "next/image";
import { useState } from "react";
import MediaLibraryModal from "./MediaLibraryModal";

function isAbsoluteUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

function localImageSrc(url: string) {
  if (!url) return "";
  return url.startsWith("/") ? url : `/${url}`;
}

export default function MediaSelectField({
  label,
  value,
  onChange,
  className,
  previewClassName,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  className?: string;
  previewClassName?: string;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadFile(file: File) {
    setIsUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "general");

    const response = await fetch("/api/admin/media/upload", {
      method: "POST",
      body: formData,
    });
    const data = await response.json().catch(() => ({})) as { asset?: { file_url?: string }; error?: string };
    setIsUploading(false);

    if (!response.ok || !data.asset?.file_url) {
      setError(data.error || "No se pudo subir la imagen.");
      return;
    }

    onChange(data.asset.file_url);
  }

  return (
    <div className={["media-select-field", className].filter(Boolean).join(" ")}>
      <span className="field-label">{label}</span>
      <div className={["img-preview relative", previewClassName].filter(Boolean).join(" ")}>
        {value ? (
          isAbsoluteUrl(value) ? (
            <img src={value} alt={label} className="media-img-preview" />
          ) : (
            <Image src={localImageSrc(value)} alt={label} fill sizes="260px" className="object-cover" unoptimized />
          )
        ) : (
          <span className="media-select-field__empty">Sin imagen</span>
        )}
      </div>
      <div className="media-select-field__actions">
        <button
          type="button"
          className="secondary-btn"
          aria-expanded={showPicker}
          onClick={() => setShowPicker(true)}
        >
          Biblioteca
        </button>
        <label className="secondary-btn" style={{ cursor: isUploading ? "wait" : "pointer" }}>
          {isUploading ? "Subiendo..." : "Subir"}
          <input
            type="file"
            accept="image/*"
            hidden
            disabled={isUploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void uploadFile(file);
              event.target.value = "";
            }}
          />
        </label>
        {value ? (
          <button type="button" className="danger-btn" onClick={() => onChange("")}>
            Limpiar
          </button>
        ) : null}
      </div>
      {error ? <p className="form-error">{error}</p> : null}

      <MediaLibraryModal
        open={showPicker}
        onSelect={(url) => {
          onChange(url);
          setShowPicker(false);
        }}
        onClose={() => setShowPicker(false)}
      />
    </div>
  );
}
