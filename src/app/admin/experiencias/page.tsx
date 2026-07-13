import OfferingsCategoryPage from "@/components/admin/OfferingsCategoryPage";

type AdminOfferingsSearchParams = { q?: string; sort?: string; page?: string };

export default async function ExperienciasPage({ searchParams }: { searchParams?: Promise<AdminOfferingsSearchParams> }) {
  const params = await searchParams;

  return (
    <OfferingsCategoryPage
      title="Experiencias"
      subtitle="Administra únicamente experiencias"
      type="experience"
      basePath="/admin/experiencias"
      typeLabel="Experiencia"
      emptyIcon="local_activity"
      emptyTitle="No hay experiencias creadas todavía."
      emptyDescription="Crea la primera experiencia para empezar."
      createLabel="Crear nueva experiencia"
      searchParams={params}
    />
  );
}
