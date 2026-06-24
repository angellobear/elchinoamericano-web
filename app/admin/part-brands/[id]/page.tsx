import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getPartBrands, updatePartBrand } from "@/lib/db/part-brands";
import { handleImageReplace } from "@/lib/cloudinary";
import { logger } from "@/lib/logger";
import Link from "next/link";
import { SubmitButton } from "@/app/admin/_components/SubmitButton";
import { routes } from "@/lib/routes";
import { AdminPageHeader } from "@/modules/admin/shared/components/AdminPageHeader";
import { FormActions, FormCard } from "@/modules/admin/shared/components/AdminFormControls";
import { getZodErrorMessage } from "@/modules/admin/shared/server/zod";
import { parsePartBrandFormData } from "@/modules/admin/part-brands/form-schema";
import { PartBrandFormFields } from "@/modules/admin/part-brands/components/PartBrandFormFields";

async function save(id: number, formData: FormData) {
  "use server";
  try {
    const parsed = parsePartBrandFormData(formData, { isActive: true });
    if (!parsed.success) {
      redirect(
        `${routes.admin.partBrands.edit(id)}?error=${encodeURIComponent(getZodErrorMessage(parsed.error))}`,
      );
    }

    const { name, originCountry, isActive } = parsed.data;
    const file = formData.get("logo") as File | null;
    const currentUrl = formData.get("logo_current_url") as string;
    const currentPublicId = formData.get("logo_public_id") as string;
    const removed = formData.get("logo_removed") === "1";

    const { url: logoUrl, publicId: logoPublicId } = await handleImageReplace(
      file && file.size > 0 ? file : null,
      removed,
      currentPublicId || null,
      currentUrl || null,
    );

    await updatePartBrand(id, {
      name,
      originCountry,
      isActive,
      logoUrl: logoUrl ?? undefined,
      logoPublicId: logoPublicId ?? undefined,
    });
    logger.info({ id, name }, "Part brand updated");
    revalidatePath(routes.admin.partBrands.index);
  } catch (err) {
    logger.error({ err }, "Error updating part brand");
    redirect(`${routes.admin.partBrands.index}?error=` + encodeURIComponent("Error al guardar marca"));
  }
  redirect(`${routes.admin.partBrands.index}?success=` + encodeURIComponent("Marca guardada"));
}

export default async function EditPartBrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const all = await getPartBrands(true);
  const brand = all.find((b) => b.id === Number(id));
  if (!brand) notFound();

  const saveWithId = save.bind(null, brand.id);

  return (
    <div className="p-8">
      <AdminPageHeader
        backHref={routes.admin.partBrands.index}
        backLabel="Volver a marcas de repuestos"
        title="Editar marca"
        description={brand.name}
      />

      <FormCard>
        <form action={saveWithId} className="space-y-4">
          <PartBrandFormFields
            defaults={{
              name: brand.name,
              originCountry: brand.originCountry ?? undefined,
              isActive: brand.isActive ?? true,
              logoUrl: brand.logoUrl,
              logoPublicId: (brand as { logoPublicId?: string | null }).logoPublicId,
            }}
            includeIsActive
          />
          <FormActions>
            <SubmitButton className="px-5 py-2 bg-navy text-white text-sm rounded-lg hover:bg-navy-dark transition-colors font-medium disabled:opacity-60">
              Guardar cambios
            </SubmitButton>
            <Link
              href={routes.admin.partBrands.index}
              className="px-5 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
          </FormActions>
        </form>
      </FormCard>
    </div>
  );
}
