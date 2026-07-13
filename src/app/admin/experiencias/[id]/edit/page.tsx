import { EditProductOfferingPage } from "@/components/admin/OfferingProductEditorPage";

export default async function EditExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <EditProductOfferingPage
      id={(await params).id}
      expectedType="experience"
      typeLabel="Experiencia"
      basePath="/admin/experiencias"
    />
  );
}
