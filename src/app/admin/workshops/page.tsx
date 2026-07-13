import OfferingsCategoryPage from "@/components/admin/OfferingsCategoryPage";

type AdminOfferingsSearchParams = { q?: string; sort?: string; page?: string };

export default async function WorkshopsPage({ searchParams }: { searchParams?: Promise<AdminOfferingsSearchParams> }) {
  const params = await searchParams;

  return (
    <OfferingsCategoryPage
      title="Workshops"
      subtitle="Administra únicamente workshops"
      type="workshop"
      basePath="/admin/workshops"
      typeLabel="Workshop"
      emptyIcon="school"
      emptyTitle="No hay workshops creados todavía."
      emptyDescription="Crea el primer workshop para empezar."
      createLabel="Crear nuevo workshop"
      searchParams={params}
    />
  );
}
