"use client";

type AdminActionModalType = "success" | "error" | "info" | "confirm";

export default function AdminActionModal({
  open,
  type = "info",
  title,
  message,
  details,
  confirmLabel = "Aceptar",
  cancelLabel = "Cancelar",
  onConfirm,
  onClose,
}: {
  open: boolean;
  type?: AdminActionModalType;
  title: string;
  message?: string;
  details?: string[];
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onClose: () => void;
}) {
  if (!open) return null;

  const isConfirm = type === "confirm";

  return (
    <div className="admin-action-modal" role="dialog" aria-modal="true" aria-labelledby="admin-action-modal-title">
      <button type="button" className="admin-action-modal__backdrop" aria-label="Cerrar modal" onClick={onClose} />
      <div className={`admin-action-modal__panel admin-action-modal__panel--${type}`}>
        <div className="admin-action-modal__icon" aria-hidden="true">
          <span className="material-symbols-outlined">
            {type === "success" ? "check_circle" : type === "error" ? "error" : type === "confirm" ? "help" : "info"}
          </span>
        </div>
        <div className="admin-action-modal__body">
          <h3 id="admin-action-modal-title">{title}</h3>
          {message ? <p>{message}</p> : null}
          {details?.length ? (
            <ul className="admin-action-modal__details">
              {details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="admin-action-modal__actions">
          {isConfirm ? (
            <button type="button" className="secondary-btn" onClick={onClose}>
              {cancelLabel}
            </button>
          ) : null}
          <button
            type="button"
            className={type === "error" ? "danger-btn" : "primary-btn"}
            onClick={() => {
              onConfirm?.();
              onClose();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
