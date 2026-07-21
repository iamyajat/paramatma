import { notFound } from "next/navigation";
import { getAllDeities } from "@/lib/data";
import { isContentType } from "@/lib/content-types";
import { WorkForm } from "../../work-form";
import { createWork } from "@/lib/actions/works";

export default async function NewWorkPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  if (!isContentType(type)) notFound();

  const deities = await getAllDeities();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">New Work</h1>
      {deities.length === 0 ? (
        <p className="mt-4 text-sm text-ink-muted">
          Add a deity first before creating a work.
        </p>
      ) : (
        <WorkForm
          type={type}
          deities={deities}
          action={createWork}
          submitLabel="Create work"
        />
      )}
    </div>
  );
}
