import AdminShell from "@/components/admin/AdminShell";
import MediaGrid from "@/components/admin/MediaGrid";
import SectionEmptyState from "@/components/admin/SectionEmptyState";
import { getMediaAssets } from "@/lib/cms/media";

export default async function MediaPage() {
  const assets = await getMediaAssets();
  const activeAssets = assets.filter((a) => a.status === "active");

  return (
    <AdminShell>
      <div className="section-head">
        <div>
          <p className="auth-kicker">CMS</p>
          <h2>Biblioteca multimedia</h2>
          <p className="muted">Consulta todas las imágenes y videos del proyecto y del Storage de Supabase.</p>
        </div>
      </div>

      {activeAssets.length ? (
        <MediaGrid assets={activeAssets} />
      ) : (
        <SectionEmptyState
          title="No se encontraron archivos multimedia"
          description="Cuando existan imágenes o videos en el proyecto o en Supabase, aparecerán aquí con su URL pública."
        />
      )}
    </AdminShell>
  );
}
