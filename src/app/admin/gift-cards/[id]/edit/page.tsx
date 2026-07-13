import { EditProductOfferingPage } from "@/components/admin/OfferingProductEditorPage";

export default async function EditGiftCardPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <EditProductOfferingPage
      id={(await params).id}
      expectedType="gift_card"
      typeLabel="Gift Card"
      basePath="/admin/gift-cards"
    />
  );
}
