"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import MediaPicker from "./MediaPicker";

export default function MediaLibraryModal({
  open,
  onSelect,
  onClose,
}: {
  open: boolean;
  onSelect: (url: string) => void;
  onClose: () => void;
}) {
  const canUseDocument = typeof document !== "undefined";

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || !canUseDocument) return null;

  return createPortal(
    <div
      className="media-library-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Biblioteca de imágenes"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <button
        type="button"
        className="media-library-modal__backdrop"
        aria-label="Cerrar biblioteca"
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          border: 0,
          background: "rgb(11 28 48 / 46%)",
          cursor: "pointer",
        }}
      />
      <div
        className="media-library-modal__panel"
        style={{
          position: "relative",
          width: "min(980px, 100%)",
          maxHeight: "min(820px, calc(100dvh - 48px))",
          overflow: "auto",
          border: "1px solid #cac4d4",
          borderRadius: 14,
          background: "#fff",
          boxShadow: "0 22px 70px rgb(11 28 48 / 24%)",
          padding: 22,
        }}
      >
        <MediaPicker onSelect={onSelect} onClose={onClose} />
      </div>
    </div>,
    document.body,
  );
}
