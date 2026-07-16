"use client";

import { useEffect, useState } from "react";
import AdminPagination from "./AdminPagination";
import type { HistoryLog } from "@/lib/cms/types";
import { formatAdminDateTime } from "@/lib/admin/date-format";

const actionLabels: Record<string, string> = {
  create: "Creación", update: "Actualización", publish: "Publicación", unpublish: "Despublicación",
  archive: "Archivado", trash: "Papelera", restore: "Restauración", delete_permanently: "Eliminación definitiva",
  duplicate: "Duplicado", login: "Inicio de sesión",
};

type DateSort = "newest" | "oldest";
type HistoryResponse = {
  logs?: HistoryLog[];
  items?: HistoryLog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  sort: DateSort;
  error?: string;
};

export default function HistoryLogsTable({
  initialItems,
  initialTotal,
  initialPage,
  initialPageSize,
  initialTotalPages,
  initialSort,
}: {
  initialItems: HistoryLog[];
  initialTotal: number;
  initialPage: number;
  initialPageSize: number;
  initialTotalPages: number;
  initialSort: DateSort;
}) {
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(initialPage);
  const [pageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [sort, setSort] = useState<DateSort>(initialSort);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadPage() {
      setIsLoading(true);
      setError("");
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
        sort,
      });
      const response = await fetch(`/api/admin/history-logs?${params.toString()}`, { cache: "no-store" });
      const data = await response.json().catch(() => ({})) as HistoryResponse;
      if (cancelled) return;
      if (!response.ok) {
        setError(data.error || "No se pudo cargar el historial.");
      } else {
        setItems(data.logs ?? data.items ?? []);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
      setIsLoading(false);
    }
    void loadPage();
    return () => {
      cancelled = true;
    };
  }, [page, pageSize, sort]);

  return (
    <div className="table-card paginated-table-card">
      <div className="paginated-table-toolbar">
        <label className="trash-table-head__field">
          <span>Orden por fecha</span>
          <select value={sort} onChange={(event) => { setSort(event.target.value as DateSort); setPage(1); }}>
            <option value="newest">Más recientes primero</option>
            <option value="oldest">Más antiguos primero</option>
          </select>
        </label>
        <p className="paginated-table-summary">{total} movimientos</p>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      <div className={isLoading ? "paginated-table is-loading" : "paginated-table"}>
        <table className="admin-table">
          <thead><tr><th>Acción</th><th>Entidad</th><th>Título</th><th>Usuario</th><th>Fecha</th></tr></thead>
          <tbody>
            {items.map((l) => (
              <tr key={l.id}>
                <td><span className="entity-badge">{actionLabels[l.action] || l.action}</span></td>
                <td>{l.entity_type}</td>
                <td>{l.entity_title}</td>
                <td className="muted">{l.user_email}</td>
                <td>{formatAdminDateTime(l.created_at)}</td>
              </tr>
            ))}
            {!items.length ? (
              <tr><td colSpan={5} className="trash-table-empty">No hay movimientos para esta página.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} disabled={isLoading} />
    </div>
  );
}
