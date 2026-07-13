import OfferingsCategoryPage from "@/components/admin/OfferingsCategoryPage";

type AdminOfferingsSearchParams = { q?: string; sort?: string; page?: string };

export default async function GiftCardsPage({ searchParams }: { searchParams?: Promise<AdminOfferingsSearchParams> }) {
  const params = await searchParams;

  return (
    <OfferingsCategoryPage
      title="Gift Cards"
      subtitle="Administra únicamente gift cards"
      type="gift_card"
      basePath="/admin/gift-cards"
      typeLabel="Gift Card"
      emptyIcon="card_giftcard"
      emptyTitle="No hay gift cards creadas todavía."
      emptyDescription="Crea la primera gift card para empezar."
      createLabel="Crear nueva gift card"
      searchParams={params}
    />
  );
}
