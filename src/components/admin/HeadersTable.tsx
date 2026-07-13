"use client";

import Link from "@/components/admin/AdminLink";
import { useRouter } from "next/navigation";
import type { Header } from "@/lib/cms/types";

const pageLabels: Record<string, string> = {
  home: "Home Page",
  blog: "Blog",
  internal: "Página Interior",
  landing: "Landing Page",
  offering: "Offering",
  shop: "Tienda",
  studio: "Estudio",
  custom: "Personalizada",
};

const statusConfig: Record<string, { label: string; badgeClass: string; textClass: string }> = {
  published: {
    label: "Publicado",
    badgeClass: "bg-[#D9FBE6]",
    textClass: "text-[#2B9C59]",
  },
  draft: {
    label: "Borrador",
    badgeClass: "bg-[#E6E9EF]",
    textClass: "text-[#6E7684]",
  },
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (days > 0) return `Modificado hace ${days} día${days === 1 ? "" : "s"}`;
  if (hours > 0) return `Modificado hace ${hours} hora${hours === 1 ? "" : "s"}`;
  if (minutes > 0) return `Modificado hace ${minutes} minuto${minutes === 1 ? "" : "s"}`;
  return "Modificado hace unos segundos";
}

export default function HeadersTable({ headers }: { headers: Header[] }) {
  const router = useRouter();

  async function handleTrash(id: string) {
    if (!window.confirm("¿Mover este encabezado a la papelera?")) return;
    const res = await fetch(`/api/admin/headers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "trash" }),
    });
    if (res.ok) router.refresh();
  }

  if (!headers.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-[#D9E0EF] bg-white px-6 py-16 text-center shadow-[0_10px_30px_rgba(26,42,74,0.04)]">
        <span className="material-symbols-outlined mb-3 text-4xl text-on-surface-variant/40">web_header</span>
        <p className="text-body-md text-on-surface-variant">No hay encabezados creados todavía.</p>
        <Link
          href="/admin/components/headers/new"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#A95106] px-5 py-2.5 text-label-md font-semibold text-white transition-colors hover:bg-[#964905]"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Crear nuevo encabezado
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {headers.map((header) => {
        const status = statusConfig[header.status] || statusConfig.draft;
        const label = pageLabels[header.type] || header.type;

        return (
          <div
            key={header.id}
            className="rounded-[1.15rem] border border-[#E3E8F4] bg-white px-4 py-5 shadow-[0_8px_28px_rgba(20,36,69,0.04)] sm:px-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-[1.15rem] font-semibold leading-tight tracking-[-0.02em] text-[#1A2942] sm:text-[1.2rem]">
                  {header.name}
                </h3>
                <span className="mt-2 inline-flex rounded-lg bg-[#DCE7FF] px-2.5 py-0.5 text-sm font-medium leading-none text-[#4E67A2]">
                  {label}
                </span>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium leading-none ${status.badgeClass} ${status.textClass}`}
              >
                {status.label}
              </span>
            </div>

            <div className="my-5 h-px w-full bg-[#E4C2A3]" />

            <div className="flex items-center justify-between gap-4">
              <span className="text-base font-medium text-[#6F7482]">{timeAgo(header.updated_at)}</span>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/components/headers/${header.id}/edit`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#646B78] transition-colors hover:bg-[#F2F5FB] hover:text-[#1A2942]"
                  aria-label={`Editar ${header.name}`}
                >
                  <span className="material-symbols-outlined text-[22px] leading-none">edit</span>
                </Link>
                <button
                  type="button"
                  onClick={() => handleTrash(header.id)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#646B78] transition-colors hover:bg-[#FDF2F2] hover:text-[#C13D32]"
                  aria-label={`Eliminar ${header.name}`}
                >
                  <span className="material-symbols-outlined text-[22px] leading-none">delete</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
