"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { MarketingEventType } from "@/lib/cms/types";
import Select from "@/components/ui/Select";
import EmptyMarketingState from "./EmptyMarketingState";
import MarketingSwitch from "./MarketingSwitch";

export default function EventsTable({ events }: { events: MarketingEventType[] }) {
  const router = useRouter();
  const [category, setCategory] = useState<string>("");
  const [eventOverrides, setEventOverrides] = useState<Record<string, MarketingEventType>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const categoryOptions = [
    { value: "conversion", label: "Conversiones" },
    { value: "engagement", label: "Engagement" },
    { value: "navigation", label: "Navegación" },
    { value: "commerce", label: "Commerce" },
    { value: "content", label: "Contenido" },
  ];

  const visibleEvents = useMemo(() => events.map((event) => eventOverrides[event.id] || event), [eventOverrides, events]);
  const filteredEvents = useMemo(() => {
    const list = category ? visibleEvents.filter((event) => event.category === category) : visibleEvents;
    return [...list].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  }, [category, visibleEvents]);
  const activeCount = visibleEvents.filter((event) => event.is_active).length;

  async function toggleEvent(id: string, isActive: boolean) {
    setError("");
    const currentEvent = visibleEvents.find((event) => event.id === id);
    if (!currentEvent) return;
    setUpdatingId(id);
    const previousOverride = eventOverrides[id];
    setEventOverrides((current) => ({
      ...current,
      [id]: { ...currentEvent, is_active: isActive, updated_at: new Date().toISOString() },
    }));

    const res = await fetch("/api/admin/marketing/events", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active: isActive }),
    });

    if (res.ok) {
      const updated = await res.json();
      setEventOverrides((current) => ({ ...current, [id]: updated }));
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setEventOverrides((current) => {
        const next = { ...current };
        if (previousOverride) next[id] = previousOverride;
        else delete next[id];
        return next;
      });
      setError(data?.error || "No se pudo actualizar el evento.");
    }
    setUpdatingId(null);
  }

  if (!visibleEvents.length) {
    return (
      <EmptyMarketingState
        title="No hay eventos personalizados"
        description="Cuando configures eventos de conversión o engagement, podrás activarlos y revisar su actividad desde esta tabla."
      />
    );
  }

  const categoryColors: Record<string, string> = {
    conversion: "bg-purple-100 text-purple-700",
    engagement: "bg-blue-100 text-blue-700",
    navigation: "bg-orange-100 text-orange-700",
    commerce: "bg-green-100 text-green-700",
    content: "bg-cyan-100 text-cyan-700",
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-outline-variant bg-white p-5 shadow-[0_12px_28px_rgba(11,28,48,0.05)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-label-caps uppercase text-secondary">Lógica de negocio</p>
            <h2 className="mt-1 text-headline-sm text-on-surface">{activeCount} de {visibleEvents.length} eventos activos</h2>
            <p className="mt-1 max-w-2xl text-body-sm text-on-surface-variant">
              Un evento activo se guarda cuando el sitio lo envía. Si lo desactivas, el endpoint de tracking lo descarta y no contamina tus reportes.
            </p>
            {error ? <p className="mt-2 text-label-sm font-semibold text-error">{error}</p> : null}
          </div>
          <div className="w-full max-w-xs">
            <Select
              label="Filtrar por categoría"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              options={categoryOptions}
              placeholder="Todas"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-outline-variant bg-white shadow-[0_12px_28px_rgba(11,28,48,0.05)]">
        <table className="w-full text-left text-body-sm">
          <thead className="bg-surface-container-high text-label-sm font-semibold text-on-surface-variant">
            <tr>
              <th className="px-4 py-3">Evento</th>
              <th className="px-4 py-3">Etiqueta</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Descripción</th>
              <th className="px-4 py-3">Activo</th>
              <th className="px-4 py-3">Última actividad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {filteredEvents.map((e) => (
              <tr key={e.id} className="bg-white transition-colors hover:bg-surface-container-low">
                <td className="px-4 py-3 font-mono text-label-sm text-on-surface">{e.name}</td>
                <td className="px-4 py-3 text-on-surface">{e.label}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${categoryColors[e.category] || "bg-gray-100 text-gray-500"}`}>
                    {e.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-on-surface-variant max-w-xs truncate">{e.description || "—"}</td>
                <td className="px-4 py-3 min-w-[190px]">
                  <MarketingSwitch
                    checked={e.is_active}
                    onCheckedChange={(checked) => toggleEvent(e.id, checked)}
                    label={e.is_active ? "Activo" : "Inactivo"}
                    compact
                    statusText={false}
                    disabled={updatingId === e.id}
                    aria-label={`${e.is_active ? "Desactivar" : "Activar"} evento ${e.label}`}
                  />
                </td>
                <td className="px-4 py-3 text-on-surface-variant">{e.last_triggered_at ? new Date(e.last_triggered_at).toLocaleString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredEvents.length === 0 ? (
          <div className="border-t border-outline-variant px-4 py-10 text-center text-body-sm text-on-surface-variant">
            No hay eventos para este filtro.
          </div>
        ) : null}
      </div>
    </div>
  );
}
