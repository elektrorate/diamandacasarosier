import OfferingsCategoryPage from "@/components/admin/OfferingsCategoryPage";

type AdminOfferingsSearchParams = { q?: string; sort?: string; page?: string };

export default async function ClasesPage({ searchParams }: { searchParams?: Promise<AdminOfferingsSearchParams> }) {
  const params = await searchParams;

  return (
    <OfferingsCategoryPage
      title="Clases"
      subtitle="Administra únicamente clases"
      type="class"
      basePath="/admin/clases"
      typeLabel="Clase"
      emptyIcon="school"
      emptyTitle="No hay clases creadas todavía."
      emptyDescription="Crea la primera clase para empezar."
      createLabel="Crear nueva clase"
      searchParams={params}
    />
  );
}
