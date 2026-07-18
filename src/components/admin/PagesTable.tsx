"use client";

import { useRouter } from "next/navigation";
import type { Page, PageStatus } from "@/lib/cms/types";
import { formatAdminDateTime } from "@/lib/admin/date-format";

const typeLabels: Record<string, string> = {
  home: "Home",
  studio: "Estudio",
  contact: "Contacto",
  faq: "FAQ",
  privacy: "Privacidad",
  cookies: "Cookies",
  legal: "Legal",
  custom: "Custom",
};

const statusLabels: Record<PageStatus, string> = {
  draft: "Borrador",
  published: "Publicado",
  archived: "Archivado",
  deleted: "Papelera",
};

function pagePath(slug: string) {
  return slug.startsWith("/") ? slug : `/${slug}`;
}

function statusClass(status: PageStatus) {
  return `pages-status is-${status}`;
}

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

  function renderMenu(page: Page) {
    const nextPublishAction = page.status === "published" ? "draft" : "publish";
    const nextPublishLabel = page.status === "published" ? "Pasar a borrador" : "Publicar";

    return (
      <details className="pages-row-menu">
        <summary aria-label={`Más acciones para ${page.title}`}>...</summary>
        <div className="pages-menu-panel">
          <a className="pages-menu-item" href={pagePath(page.slug)} target="_blank" rel="noreferrer">Ver página</a>
          <button className="pages-menu-item" type="button" onClick={() => runAction(page.id, "duplicate")}>Duplicar</button>
          <button className="pages-menu-item" type="button" onClick={() => runAction(page.id, nextPublishAction)}>{nextPublishLabel}</button>
          <button className="pages-menu-item" type="button" onClick={() => runAction(page.id, "archive")}>Archivar</button>
          <button className="pages-menu-item is-danger" type="button" onClick={() => runAction(page.id, "trash")}>Papelera</button>
        </div>
      </details>
    );
  }

  return (
    <section className="pages-list">
      <div className="pages-list-summary">{pages.length} páginas</div>

      <div className="table-card pages-table-card pages-desktop-table">
        <table className="admin-table pages-admin-table">
          <thead>
            <tr>
              <th>Página</th>
              <th>URL</th>
              <th>Estado</th>
              <th>Actualizado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id}>
                <td>
                  <strong className="pages-page-title">{page.title}</strong>
                  <span className="pages-page-meta">{typeLabels[page.type] || page.type}</span>
                </td>
                <td><code className="pages-url">{pagePath(page.slug)}</code></td>
                <td><span className={statusClass(page.status)}>{statusLabels[page.status]}</span></td>
                <td className="pages-updated">{formatAdminDateTime(page.updated_at)}</td>
                <td>
                  <div className="pages-actions">
                    <a className="pages-action-edit" href={`/admin/pages/${page.id}/edit`}>Editar</a>
                    {renderMenu(page)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pages-mobile-list">
        {pages.map((page) => (
          <article className="pages-mobile-card" key={page.id}>
            <div className="pages-mobile-card__main">
              <div>
                <h3>{page.title}</h3>
                <p>{typeLabels[page.type] || page.type} · <code>{pagePath(page.slug)}</code></p>
              </div>
              <span className={statusClass(page.status)}>{statusLabels[page.status]}</span>
            </div>
            <div className="pages-mobile-card__foot">
              <span>{formatAdminDateTime(page.updated_at)}</span>
              <div className="pages-actions">
                <a className="pages-action-edit" href={`/admin/pages/${page.id}/edit`}>Editar</a>
                {renderMenu(page)}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
