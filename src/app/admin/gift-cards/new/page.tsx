import { NewProductOfferingPage } from "@/components/admin/OfferingProductEditorPage";

export default function NewGiftCardPage() {
  return <NewProductOfferingPage type="gift_card" typeLabel="Gift Card" basePath="/admin/gift-cards" />;
}
