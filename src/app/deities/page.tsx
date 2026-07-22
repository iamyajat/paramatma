import type { Metadata } from "next";
import { getAllDeities } from "@/lib/data";
import { DeityCard } from "@/components/deity-card";

export const metadata: Metadata = {
  title: "Deities",
  description:
    "Browse Hindu scriptures by deity — names, aartis, bhajans, stotras, and sahasranamas.",
};

export default async function DeitiesPage() {
  const deities = await getAllDeities();

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-semibold text-ink">
          Browse by Deity
        </h1>
        <p className="mt-2 text-ink-muted">
          Choose a deity to see their names, hymns, and prayers.
        </p>
      </div>

      {deities.length === 0 ? (
        <p className="mt-12 text-center text-ink-muted">
          No deities have been added yet.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {deities.map((deity) => (
            <DeityCard key={deity.id} deity={deity} />
          ))}
        </div>
      )}
    </div>
  );
}
