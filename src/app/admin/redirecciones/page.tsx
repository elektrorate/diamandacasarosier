import AdminShell from "@/components/admin/AdminShell";
import RedirectsForm from "@/components/admin/RedirectsForm";
import { getRedirects } from "@/lib/cms/redirects";

export default async function RedireccionesPage() {
  const items = await getRedirects();

  return (
    <AdminShell>
      <RedirectsForm items={items} />
    </AdminShell>
  );
}
