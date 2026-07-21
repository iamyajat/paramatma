import { notFound } from "next/navigation";
import { getDeityByIdAdmin } from "@/lib/admin-data";
import { DeityForm } from "../../deity-form";
import { updateDeity } from "@/lib/actions/deities";

export default async function EditDeityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const deity = await getDeityByIdAdmin(id);
  if (!deity) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">
        Edit {deity.name.en}
      </h1>
      <DeityForm
        action={updateDeity.bind(null, id)}
        initial={deity}
        submitLabel="Save changes"
      />
    </div>
  );
}
