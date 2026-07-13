import { EditProductOfferingPage } from "@/components/admin/OfferingProductEditorPage";

export default async function EditWorkshopPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <EditProductOfferingPage
      id={(await params).id}
      expectedType="workshop"
      typeLabel="Workshop"
      basePath="/admin/workshops"
    />
  );
}
