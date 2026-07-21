import { DeityForm } from "../deity-form";
import { createDeity } from "@/lib/actions/deities";

export default function NewDeityPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">New Deity</h1>
      <DeityForm action={createDeity} submitLabel="Create deity" />
    </div>
  );
}
