import type { MarketingSearchConsoleQuery } from "@/lib/cms/types";
import EmptyMarketingState from "./EmptyMarketingState";

export default function SearchQueriesTable({ queries }: { queries: MarketingSearchConsoleQuery[] }) {
  if (!queries.length) {
    return (
      <EmptyMarketingState
        title="No hay consultas registradas"
        description="Las consultas aparecerán cuando se implemente la integración real con la API de Search Console."
        actionLabel="Ir a configuración"
        actionHref="/admin/marketing/settings"
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-outline-variant bg-white shadow-[0_12px_28px_rgba(11,28,48,0.05)]">
      <table className="w-full text-left text-body-sm">
        <thead className="bg-surface-container-high text-label-sm font-semibold text-on-surface-variant">
          <tr>
            <th className="px-4 py-3">Consulta</th>
            <th className="px-4 py-3">Página</th>
            <th className="px-4 py-3 text-right">Clics</th>
            <th className="px-4 py-3 text-right">Impresiones</th>
            <th className="px-4 py-3 text-right">CTR</th>
            <th className="px-4 py-3 text-right">Posición</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {queries.map((q) => (
            <tr key={q.id} className="bg-white transition-colors hover:bg-surface-container-low">
              <td className="px-4 py-3 font-medium text-on-surface">{q.query}</td>
              <td className="max-w-xs truncate px-4 py-3 text-on-surface-variant">{q.page}</td>
              <td className="px-4 py-3 text-right tabular-nums text-on-surface">{q.clicks}</td>
              <td className="px-4 py-3 text-right tabular-nums text-on-surface">{q.impressions}</td>
              <td className="px-4 py-3 text-right tabular-nums text-on-surface">{(q.ctr * 100).toFixed(1)}%</td>
              <td className="px-4 py-3 text-right tabular-nums text-on-surface">{q.position.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
