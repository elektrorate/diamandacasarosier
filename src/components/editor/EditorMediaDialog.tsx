"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import MediaLibraryModal from "@/components/admin/MediaLibraryModal";
import { normalizeEditorUrl } from "./markdown-codec";
import type { MediaSourceMode } from "./editor-types";

export default function EditorMediaDialog({
  open,
  kind,
  onClose,
  onInsertImage,
  onInsertIframe,
}: {
  open: boolean;
  kind: "image" | "iframe";
  onClose: () => void;
  onInsertImage: (src: string, alt: string) => void;
  onInsertIframe: (src: string) => void;
}) {
  const [mode, setMode] = useState<MediaSourceMode>("library");
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  if (!open) return null;

  const reset = () => {
    setUrl("");
    setAlt("");
    setError("");
    setUploading(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const insertUrl = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const safeUrl = normalizeEditorUrl(url);
    if (!safeUrl) {
      setError("Introduce una URL valida.");
      return;
    }
    if (kind === "image") onInsertImage(safeUrl, alt.trim());
    else onInsertIframe(safeUrl);
    close();
  };

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Selecciona una imagen valida.");
      return;
    }
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "editor");
    formData.append("title", file.name);
    formData.append("alt_text", alt || file.name);

    try {
      const response = await fetch("/api/admin/media/upload", { method: "POST", body: formData });
      const data = await response.json().catch(() => ({})) as { asset?: { file_url?: string }; error?: string };
      if (!response.ok) throw new Error(data.error || "No se pudo subir la imagen.");
      const src = data.asset?.file_url;
      if (!src) throw new Error("La subida no devolvio una URL.");
      onInsertImage(src, alt.trim() || file.name);
      close();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "No se pudo subir la imagen.");
    } finally {
      setUploading(false);
    }
  };

  if (kind === "image" && mode === "library") {
    return (
      <MediaLibraryModal
        open={open}
        onClose={close}
        onSelect={(src) => {
          onInsertImage(src, alt.trim());
          close();
        }}
      />
    );
  }

  return (
    <div className="tiptap-media-dialog" role="dialog" aria-modal="true" aria-label={kind === "image" ? "Insertar imagen" : "Insertar iframe"}>
      <button type="button" className="tiptap-media-dialog__backdrop" aria-label="Cerrar" onClick={close} />
      <form className="tiptap-media-dialog__panel" onSubmit={insertUrl}>
        <div className="tiptap-media-dialog__head">
          <h3>{kind === "image" ? "Insertar imagen" : "Insertar iframe"}</h3>
          <button type="button" onClick={close} aria-label="Cerrar">?</button>
        </div>
        {kind === "image" ? (
          <div className="tiptap-media-dialog__modes" role="group" aria-label="Origen de imagen">
            <button type="button" className={mode === "library" ? "is-active" : ""} onClick={() => setMode("library")}>Biblioteca</button>
            <button type="button" className={mode === "upload" ? "is-active" : ""} onClick={() => setMode("upload")}>Subir</button>
            <button type="button" className={mode === "url" ? "is-active" : ""} onClick={() => setMode("url")}>URL</button>
          </div>
        ) : null}
        {kind === "image" ? (
          <label>
            Texto alternativo
            <input value={alt} onChange={(event) => setAlt(event.target.value)} placeholder="Descripcion breve" />
          </label>
        ) : null}
        {mode === "upload" && kind === "image" ? (
          <label className="tiptap-media-dialog__upload">
            {uploading ? "Subiendo..." : "Seleccionar imagen"}
            <input type="file" accept="image/*" disabled={uploading} onChange={uploadImage} />
          </label>
        ) : (
          <label>
            URL
            <input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://..." />
          </label>
        )}
        {error ? <p className="tiptap-media-dialog__error">{error}</p> : null}
        <div className="tiptap-media-dialog__actions">
          <button type="button" onClick={close}>Cancelar</button>
          {mode !== "upload" || kind === "iframe" ? <button type="submit">Insertar</button> : null}
        </div>
      </form>
    </div>
  );
}
