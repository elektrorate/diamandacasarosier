"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Faq, FaqGroup, FaqStatus } from "@/lib/cms/types";

const NEW_GROUP = "__new";

export default function FaqForm({
  mode,
  item,
  groups,
}: {
  mode: "create" | "edit";
  item?: Faq;
  groups: FaqGroup[];
}) {
  const router = useRouter();
  const activeGroups = useMemo(() => groups.filter((group) => group.status !== "deleted"), [groups]);
  const initialGroup = item?.faq_group_id || activeGroups[0]?.id || NEW_GROUP;
  const [question, setQuestion] = useState(item?.question ?? "");
  const [answer, setAnswer] = useState(item?.answer ?? "");
  const [groupId, setGroupId] = useState(initialGroup);
  const [newGroupTitle, setNewGroupTitle] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [topicTitle, setTopicTitle] = useState(item?.topic_title ?? "General");
  const [sortOrder, setSortOrder] = useState(item?.sort_order ?? 0);
  const [status, setStatus] = useState<FaqStatus>(item?.status ?? "draft");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!question.trim()) {
      setError("La pregunta es obligatoria.");
      setIsLoading(false);
      return;
    }

    if (groupId === NEW_GROUP && !newGroupTitle.trim()) {
      setError("El título principal del grupo FAQ es obligatorio.");
      setIsLoading(false);
      return;
    }

    const body = {
      question,
      answer,
      faq_group_id: groupId === NEW_GROUP ? null : groupId,
      faq_group_title: groupId === NEW_GROUP ? newGroupTitle : undefined,
      faq_group_description: groupId === NEW_GROUP ? newGroupDescription : undefined,
      topic_title: topicTitle,
      sort_order: sortOrder,
      status,
    };

    const res = await fetch(mode === "create" ? "/api/admin/components/faqs" : "/api/admin/components/faqs/" + item?.id, {
      method: mode === "create" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "Error" })) as { error?: string };
      setError(data.error || "Error");
      setIsLoading(false);
      return;
    }

    router.push("/admin/components/faqs");
    router.refresh();
  }

  return (
    <form className="editor-form" onSubmit={handleSubmit}>
      <section className="form-block">
        <h3>Componente FAQ</h3>
        <div className="grid-2">
          <label className="field">
            <span>Título principal</span>
            <select value={groupId} onChange={(event) => setGroupId(event.target.value)}>
              {activeGroups.map((group) => (
                <option key={group.id} value={group.id}>{group.title}</option>
              ))}
              <option value={NEW_GROUP}>Crear nuevo grupo FAQ</option>
            </select>
          </label>
          <label className="field">
            <span>Subtema</span>
            <input value={topicTitle} onChange={(event) => setTopicTitle(event.target.value)} placeholder="General, Reservas, Clases..." />
          </label>
          {groupId === NEW_GROUP ? (
            <>
              <label className="field">
                <span>Nombre del nuevo grupo</span>
                <input value={newGroupTitle} onChange={(event) => setNewGroupTitle(event.target.value)} placeholder="Preguntas frecuentes" />
              </label>
              <label className="field">
                <span>Descripción del grupo</span>
                <input value={newGroupDescription} onChange={(event) => setNewGroupDescription(event.target.value)} placeholder="Texto opcional para presentar el bloque" />
              </label>
            </>
          ) : null}
          <label className="field span-2">
            <span>Pregunta</span>
            <input value={question} onChange={(event) => setQuestion(event.target.value)} />
          </label>
          <label className="field span-2">
            <span>Respuesta</span>
            <textarea rows={5} value={answer} onChange={(event) => setAnswer(event.target.value)} />
          </label>
          <label className="field">
            <span>Estado</span>
            <select value={status} onChange={(event) => setStatus(event.target.value as FaqStatus)}>
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
              <option value="archived">Archivado</option>
            </select>
          </label>
          <label className="field">
            <span>Orden</span>
            <input type="number" value={sortOrder} onChange={(event) => setSortOrder(Number(event.target.value))} />
          </label>
        </div>
      </section>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="form-actions">
        <button className="primary-btn" type="submit" disabled={isLoading}>
          {isLoading ? "Guardando..." : mode === "create" ? "Crear FAQ" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
