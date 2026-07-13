import { NewProductOfferingPage } from "@/components/admin/OfferingProductEditorPage";

export default function NewWorkshopPage() {
  return <NewProductOfferingPage type="workshop" typeLabel="Workshop" basePath="/admin/workshops" />;
}
