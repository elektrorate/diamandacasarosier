import { notFound } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import HeaderForm from "@/components/admin/HeaderForm";
import { getHeaderById } from "@/lib/cms/headers";
import { getMenus } from "@/lib/cms/menus";

export default async function EditHeaderPage({ params }: { params: Promise<{ id: string }> }) {
  const header = await getHeaderById((await params).id);
  if (!header) notFound();

  const menus = await getMenus();

  return (
    <AdminShell>
      <HeaderForm mode="edit" header={header} menus={menus.map((m) => ({ id: m.id, name: m.name }))} />
    </AdminShell>
  );
}
