"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { MediaFolder } from "@/lib/cms/types";
import { MEDIA_FOLDERS } from "@/lib/cms/types";

const folderLabels: Record<string, string> = {
  home: "Home",
  headers: "Headers",
  offerings: "Offerings",
  shop: "Shop",
  bitacora: "Bitácora",
  estudio: "Estudio",
  logos: "Logos",
  general: "General",
};

export default function MediaUploader() {
  const router = useRouter();
  const [folder, setFolder] = useState<MediaFolder>("general");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("Selecciona un archivo.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const response = await fetch("/api/admin/media/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: "Error al subir archivo." }));
      setError(data.error || "Error al subir archivo.");
      setIsLoading(false);
      return;
    }

    setFile(null);
    setIsLoading(false);
    router.refresh();
  }

  return (
    <form className="uploader-card" onSubmit={handleSubmit}>
      <h3>Subir archivo</h3>

      <div className="field">
        <span>Folder</span>
        <select value={folder} onChange={(e) => setFolder(e.target.value as MediaFolder)}>
          {MEDIA_FOLDERS.map((f) => (
            <option key={f} value={f}>
              {folderLabels[f] || f}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <span>Archivo</span>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {file ? (
        <p className="muted" style={{ fontSize: "0.85rem" }}>
          {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
        </p>
      ) : null}

      {error ? <p className="form-error">{error}</p> : null}

      <button className="primary-btn inline" type="submit" disabled={isLoading || !file}>
        {isLoading ? "Subiendo..." : "Subir archivo"}
      </button>
    </form>
  );
}
