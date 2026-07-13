import AdminShell from "@/components/admin/AdminShell";
import HeaderForm from "@/components/admin/HeaderForm";
import { getMenus } from "@/lib/cms/menus";

export default async function NewHeaderPage() {
  const menus = await getMenus();

  return (
    <AdminShell>
      <HeaderForm mode="create" menus={menus.map((m) => ({ id: m.id, name: m.name }))} />
    </AdminShell>
  );
}
