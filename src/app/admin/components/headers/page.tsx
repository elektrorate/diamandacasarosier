import Link from "@/components/admin/AdminLink";
import AdminShell from "@/components/admin/AdminShell";
import HeadersTable from "@/components/admin/HeadersTable";
import { getHeaders } from "@/lib/cms/headers";

export default async function HeadersPage() {
  const headers = await getHeaders();

  return (
    <AdminShell>
      <div className="mb-6 flex flex-col gap-5 lg:mb-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-[2.15rem] font-bold leading-none tracking-[-0.03em] text-[#0F2647]">Encabezados</h1>
          <p className="text-[1.05rem] font-medium text-[#5E6472]">Gestiona los headers dinámicos del sitio.</p>
        </div>
        <Link
          href="/admin/components/headers/new"
          className="inline-flex shrink-0 items-center justify-center gap-3 rounded-xl bg-[#A95106] px-6 py-3 text-sm font-semibold text-white shadow-[0_2px_4px_rgba(169,81,6,0.18)] transition-colors hover:bg-[#964905] lg:min-w-[254px]"
        >
          <span className="material-symbols-outlined text-[22px] leading-none">add</span>
          Crear nuevo encabezado
        </Link>
      </div>

      <HeadersTable headers={headers.filter((h) => h.status !== "deleted")} />
    </AdminShell>
  );
}
