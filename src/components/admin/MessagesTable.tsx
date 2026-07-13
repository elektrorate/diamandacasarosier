"use client";

import { useMemo, useState } from "react";
import AdminActionModal from "./AdminActionModal";
import type { FormSubmission, FormSubmissionStatus } from "@/lib/cms/types";

const statusLabels: Record<FormSubmissionStatus, string> = {
  new: "Nuevo",
  read: "Leído",
  replied: "Respondido",
  archived: "Archivado",
  spam: "Spam",
  deleted: "Eliminado",
};

type InboxFilter = "all" | "new";
type ActionModalState = {
  type: "success" | "error" | "confirm";
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm?: () => void;
} | null;

const inboxTabs: Array<{ value: InboxFilter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "new", label: "No leídos" },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function shortDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

function previewText(item: FormSubmission) {
  const text = item.message || item.subject || item.form_name;
  return text.length > 96 ? `${text.slice(0, 96)}...` : text;
}

function extraData(item: FormSubmission) {
  const hiddenKeys = new Set(["name", "email", "phone", "subject", "message", "source_page"]);
  return Object.entries(item.data).filter(([key]) => !hiddenKeys.has(key));
}

function sourceLabel(item: FormSubmission) {
  return item.source_page?.trim() || item.form_name?.trim() || "formulario";
}

function originTitle(item: FormSubmission) {
  return `Mensaje desde ${sourceLabel(item)}`;
}

export default function MessagesTable({ items }: { items: FormSubmission[] }) {
  const [messages, setMessages] = useState(items);
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<InboxFilter>("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<ActionModalState>(null);

  const counts = useMemo(() => ({
    all: messages.length,
    new: messages.filter((item) => item.status === "new").length,
  }), [messages]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return messages
      .filter((item) => {
        const matchesFilter = filter === "all" || item.status === filter;
        const haystack = [
          item.name,
          item.email,
          item.phone,
          item.subject,
          item.message,
          item.form_name,
          item.source_page,
        ].join(" ").toLowerCase();
        return matchesFilter && (!normalizedQuery || haystack.includes(normalizedQuery));
      })
      .sort((a, b) => {
        const diff = Date.parse(b.created_at) - Date.parse(a.created_at);
        return sort === "newest" ? diff : -diff;
      });
  }, [messages, query, filter, sort]);

  const selected = messages.find((item) => item.id === selectedId) ?? filteredItems[0] ?? null;
  const replySubject = selected ? encodeURIComponent(`Re: ${selected.subject || "Tu mensaje a Casa Rosier"}`) : "";

  function showResult(type: "success" | "error", title: string, message: string) {
    setActionModal({ type, title, message });
  }

  async function updateStatus(id: string, nextStatus: FormSubmissionStatus) {
    const previousMessages = messages;
    const now = new Date().toISOString();
    setMessages((current) => current.map((item) => (
      item.id === id ? { ...item, status: nextStatus, updated_at: now } : item
    )));
    setSelectedId(id);
    setPendingAction(`${id}:status:${nextStatus}`);
    const response = await fetch(`/api/admin/mensajes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "status", status: nextStatus }),
    });
    const data = await response.json().catch(() => ({})) as { submission?: FormSubmission; error?: string };
    if (!response.ok || !data.submission) {
      setMessages(previousMessages);
      showResult("error", "No se pudo actualizar", data.error || "No se pudo actualizar el mensaje.");
      setPendingAction(null);
      return;
    }
    setMessages((current) => current.map((item) => item.id === id ? data.submission! : item));
    setSelectedId(id);
    if (nextStatus !== "read") {
      showResult("success", "Acción completada", "Mensaje actualizado correctamente.");
    }
    setPendingAction(null);
  }

  async function moveToTrash(id: string) {
    setPendingAction(`${id}:trash`);
    const response = await fetch(`/api/admin/mensajes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "trash" }),
    });
    const data = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) {
      showResult("error", "No se pudo enviar", data.error || "No se pudo mover el mensaje a papelera.");
      setPendingAction(null);
      return;
    }
    setMessages((current) => {
      const next = current.filter((item) => item.id !== id);
      setSelectedId(next[0]?.id ?? "");
      return next;
    });
    showResult("success", "Acción completada", "Mensaje enviado a la papelera correctamente.");
    setPendingAction(null);
  }

  function requestTrash(item: FormSubmission) {
    setActionModal({
      type: "confirm",
      title: "Enviar a papelera",
      message: `Se moverá el mensaje de ${item.name || item.email || "este contacto"} a la papelera.`,
      confirmLabel: "Papelera",
      onConfirm: () => void moveToTrash(item.id),
    });
  }

  function selectMessage(item: FormSubmission) {
    setSelectedId(item.id);
    if (item.status === "new") void updateStatus(item.id, "read");
  }

  return (
    <div className="messages-inbox messages-inbox--split">
      <AdminActionModal
        open={Boolean(actionModal)}
        type={actionModal?.type ?? "info"}
        title={actionModal?.title ?? ""}
        message={actionModal?.message}
        confirmLabel={actionModal?.confirmLabel ?? "Entendido"}
        cancelLabel="Cancelar"
        onConfirm={actionModal?.onConfirm}
        onClose={() => setActionModal(null)}
      />

      <div className="messages-sidebar">
        <div className="messages-tabs" aria-label="Filtrar mensajes">
          {inboxTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={filter === tab.value ? "messages-tab is-active" : "messages-tab"}
              onClick={() => setFilter(tab.value)}
            >
              {tab.label}
              {tab.value !== "all" ? <span>{counts[tab.value]}</span> : null}
            </button>
          ))}
        </div>

        <div className="messages-filters">
          <label className="field">
            <span>Buscar</span>
            <input
              type="search"
              placeholder="Nombre, correo, asunto o texto"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label className="field">
            <span>Orden</span>
            <select value={sort} onChange={(event) => setSort(event.target.value as "newest" | "oldest")}>
              <option value="newest">Más reciente primero</option>
              <option value="oldest">Menos reciente primero</option>
            </select>
          </label>
        </div>

        <div className="messages-list" role="listbox" aria-label="Mensajes recibidos">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              type="button"
              role="option"
              aria-selected={selected?.id === item.id}
              className={[
                "message-list-item",
                selected?.id === item.id ? "is-selected" : "",
                item.status === "new" ? "is-unread" : "",
              ].filter(Boolean).join(" ")}
              onClick={() => selectMessage(item)}
            >
              <span className="message-list-item__top">
                <strong>{item.name || "Sin nombre"}</strong>
                <small>{shortDate(item.created_at)}</small>
              </span>
              <span className="message-list-item__subject">{originTitle(item)}</span>
              <span className="message-list-item__preview">{previewText(item)}</span>
              <span className={`message-status-pill message-status-pill--${item.status}`}>{statusLabels[item.status]}</span>
            </button>
          ))}
          {filteredItems.length === 0 ? (
            <p className="messages-empty">No hay mensajes para los filtros seleccionados.</p>
          ) : null}
        </div>
      </div>

      <section className="message-detail-panel" aria-live="polite">
        {selected ? (
          <>
            <div className="message-detail-panel__head">
              <div>
                <p className="auth-kicker">{originTitle(selected)}</p>
                <h3>{selected.subject || "Sin asunto"}</h3>
              </div>
              <div className="message-detail-panel__tools">
                <button
                  type="button"
                  className="danger-btn"
                  disabled={pendingAction === `${selected.id}:trash`}
                  onClick={() => requestTrash(selected)}
                >
                  {pendingAction === `${selected.id}:trash` ? "Enviando..." : "Papelera"}
                </button>
              </div>
            </div>

            <div className="message-contact-grid">
              <div><span>Nombre</span><strong>{selected.name || "Sin nombre"}</strong></div>
              <div><span>Email</span><a href={`mailto:${selected.email}`}>{selected.email}</a></div>
              {selected.phone ? <div><span>Teléfono</span><a href={`tel:${selected.phone}`}>{selected.phone}</a></div> : null}
              <div><span>Recibido</span><strong>{formatDate(selected.created_at)}</strong></div>
              <div><span>Estado</span><strong>{statusLabels[selected.status]}</strong></div>
              {selected.source_page ? <div><span>Origen</span><strong>{selected.source_page}</strong></div> : null}
            </div>

            <div className="message-body-card">
              <p>{selected.message || "Este mensaje no incluye contenido adicional."}</p>
            </div>

            {extraData(selected).length ? (
              <div className="message-extra-data">
                <h4>Datos adicionales</h4>
                {extraData(selected).map(([key, value]) => (
                  <div key={key}>
                    <span>{key}</span>
                    <strong>{String(value)}</strong>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="message-actions-bar">
              <a className="primary-btn" href={`mailto:${selected.email}?subject=${replySubject}`}>
                Responder por Email
              </a>
              {selected.phone ? <a className="secondary-btn message-call-btn" href={`tel:${selected.phone}`}>Llamar</a> : null}
              {selected.status !== "read" ? (
                <button type="button" className="secondary-btn" onClick={() => updateStatus(selected.id, "read")}>Marcar leído</button>
              ) : null}
            </div>
          </>
        ) : (
          <div className="message-detail-empty">
            <h3>Selecciona un mensaje</h3>
            <p>El detalle aparecerá aquí cuando haya mensajes disponibles.</p>
          </div>
        )}
      </section>
    </div>
  );
}
