"use client";

import { useRouter } from "next/navigation";
import type { Page } from "@/lib/cms/types";
import { formatAdminDateTime } from "@/lib/admin/date-format";

const typeLabels: Record<string, string> = {
  home: "Home", studio: "Estudio", contact: "Contacto", faq: "FAQ",
  privacy: "Privacidad", cookies: "Cookies", legal: "Legal", custom: "Custom",
};

export default function PagesTable({ pages }: { pages: Page[] }) {
  const router = useRouter();

  async function runAction(id: string, action: string) {
    const res = await fetch(`/api/admin/pages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) router.refresh();
  }

  return (
    <div className="table-card pages-table-card">
      <table className="admin-table pages-admin-table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Acciones</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Header</th>
            <th>Slug</th>
            <th>Actualizado</th>
          </tr>
        </thead>
        <tbody>
          {pages.map((page) => (
            <tr key={page.id}>
              <td><strong>{page.title}</strong></td>
              <td>
                <div className="row-actions">
                  <a className="link-btn" href={`/admin/pages/${page.id}/edit`}>Editar</a>
                  <button className="secondary-btn" onClick={() => runAction(page.id, "duplicate")}>Duplicar</button>
                  {page.status === "published" ? (
                    <button className="secondary-btn" onClick={() => runAction(page.id, "draft")}>Borrador</button>
                  ) : (
                    <button className="secondary-btn" onClick={() => runAction(page.id, "publish")}>Publicar</button>
                  )}
                  <button className="secondary-btn" onClick={() => runAction(page.id, "archive")}>Archivar</button>
                  <button className="danger-btn" onClick={() => runAction(page.id, "trash")}>Papelera</button>
                </div>
              </td>
              <td><span className="entity-badge">{typeLabels[page.type] || page.type}</span></td>
              <td>{page.status}</td>
              <td>{page.header_id ? "Sí" : "—"}</td>
              <td>/{page.slug}</td>
              <td>{formatAdminDateTime(page.updated_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
