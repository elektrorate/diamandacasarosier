"use client";

import type { PageFaqItem, PageFaqSection } from "@/lib/cms/types";
import { MarkdownContent } from "@/components/ui/MarkdownContent";

type DraftItem = Pick<PageFaqItem, "id" | "question" | "answer" | "position" | "is_visible">;
export type PageFaqDraft = Pick<PageFaqSection, "title" | "is_enabled"> & { items: DraftItem[] };

function createItem(position: number): DraftItem {
  return {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `faq-${Date.now()}-${position}`,
    question: "",
    answer: "",
    position,
    is_visible: true,
  };
}

export function createPageFaqDraft(section?: PageFaqSection | null): PageFaqDraft {
  return {
    title: section?.title ?? "¿Todavía tienes preguntas? Te ayudamos.",
    is_enabled: section?.is_enabled ?? false,
    items: section?.items?.length
      ? section.items.map((item, index) => ({ id: item.id, question: item.question, answer: item.answer, position: index, is_visible: item.is_visible }))
      : [createItem(0)],
  };
}

export default function PageFaqEditor({
  value,
  onChange,
}: {
  value: PageFaqDraft;
  onChange: (value: PageFaqDraft) => void;
}) {
  const visibleItems = value.items.filter((item) => item.is_visible && item.question.trim());

  function updateItem(id: string, patch: Partial<DraftItem>) {
    onChange({
      ...value,
      items: value.items.map((item) => item.id === id ? { ...item, ...patch } : item),
    });
  }

  function removeItem(id: string) {
    const next = value.items.filter((item) => item.id !== id).map((item, index) => ({ ...item, position: index }));
    onChange({ ...value, items: next.length ? next : [createItem(0)] });
  }

  function moveItem(from: number, to: number) {
    if (from === to || to < 0 || to >= value.items.length) return;
    const next = [...value.items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange({ ...value, items: next.map((entry, index) => ({ ...entry, position: index })) });
  }

  return (
    <section className="form-block page-faq-editor">
      <div className="page-faq-editor__head">
        <div>
          <h3>Adiciones</h3>
          <p className="muted">FAQ personalizado asociado únicamente a esta página.</p>
        </div>
        <label className="switch-field">
          <input
            type="checkbox"
            checked={value.is_enabled}
            onChange={(event) => onChange({ ...value, is_enabled: event.target.checked })}
          />
          <span>Activar FAQ</span>
        </label>
      </div>

      <div className="grid-2">
        <label className="field span-2">
          <span>Título de la sección</span>
          <input
            value={value.title}
            onChange={(event) => onChange({ ...value, title: event.target.value })}
            placeholder="¿Todavía tienes preguntas? Te ayudamos."
          />
        </label>
      </div>

      <div className="page-faq-editor__items">
        {value.items.map((item, index) => (
          <article
            className="page-faq-editor__item"
            key={item.id}
            draggable
            onDragStart={(event) => event.dataTransfer.setData("text/plain", String(index))}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              moveItem(Number(event.dataTransfer.getData("text/plain")), index);
            }}
          >
            <div className="page-faq-editor__item-top">
              <span className="drag-handle" aria-hidden="true">::</span>
              <strong>Pregunta {index + 1}</strong>
              <label className="switch-field switch-field--small">
                <input
                  type="checkbox"
                  checked={item.is_visible}
                  onChange={(event) => updateItem(item.id, { is_visible: event.target.checked })}
                />
                <span>{item.is_visible ? "Visible" : "Oculta"}</span>
              </label>
            </div>
            <label className="field">
              <span>Pregunta</span>
              <input value={item.question} onChange={(event) => updateItem(item.id, { question: event.target.value })} />
            </label>
            <label className="field">
              <span>Respuesta</span>
              <textarea rows={4} value={item.answer} onChange={(event) => updateItem(item.id, { answer: event.target.value })} />
            </label>
            <div className="row-actions">
              <button type="button" className="secondary-btn" onClick={() => moveItem(index, index - 1)} disabled={index === 0}>Subir</button>
              <button type="button" className="secondary-btn" onClick={() => moveItem(index, index + 1)} disabled={index === value.items.length - 1}>Bajar</button>
              <button type="button" className="danger-btn" onClick={() => removeItem(item.id)}>Eliminar</button>
            </div>
          </article>
        ))}
      </div>

      <button
        type="button"
        className="secondary-btn"
        onClick={() => onChange({ ...value, items: [...value.items, createItem(value.items.length)] })}
      >
        Añadir pregunta
      </button>

      <div className="page-faq-preview">
        <p className="auth-kicker">Vista previa</p>
        {value.is_enabled && visibleItems.length ? (
          <div className="public-faq public-faq--preview">
            <div className="public-faq__container">
              <h2>{value.title || "Preguntas frecuentes"}</h2>
              <div className="public-faq__list">
                {visibleItems.map((item) => (
                  <details className="public-faq__item" key={item.id}>
                    <summary>{item.question}</summary>
                    <MarkdownContent className="public-faq__answer" source={item.answer || ""} />
                  </details>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="muted">El bloque no se mostrará hasta activarlo y tener al menos una pregunta visible.</p>
        )}
      </div>
    </section>
  );
}