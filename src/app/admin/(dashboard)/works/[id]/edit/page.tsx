import { notFound } from "next/navigation";
import { getAllDeities } from "@/lib/data";
import { getWorkByIdAdmin } from "@/lib/admin-data";
import { getSegmentsForWork } from "@/lib/data";
import { segmentsToBulkText } from "@/lib/segment-parsing";
import { WorkForm } from "../../work-form";
import { updateWork } from "@/lib/actions/works";

export default async function EditWorkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [work, deities] = await Promise.all([getWorkByIdAdmin(id), getAllDeities()]);
  if (!work) notFound();

  const segments = await getSegmentsForWork(work.id);
  const content = segmentsToBulkText(work.type, segments);

  const deity = deities.find((d) => d.slug === work.deitySlug);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">
        Edit {work.title.en}
      </h1>
      <WorkForm
        type={work.type}
        deities={deities}
        action={updateWork.bind(null, id)}
        submitLabel="Save changes"
        initial={{
          slug: work.slug,
          titleDev: work.title.dev,
          titleEn: work.title.en,
          deityId: deity?.id,
          description: work.description,
          status: work.status,
          tags: work.tags.join(", "),
          occasions: work.occasions.join(", "),
          audioUrl: work.audioUrl,
          content,
          sources: work.sources,
        }}
      />
    </div>
  );
}
