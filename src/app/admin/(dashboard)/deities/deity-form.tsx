"use client";

import { useActionState } from "react";
import type { DeityFormState } from "@/lib/actions/deities";

export interface DeityFormValues {
  slug?: string;
  name?: { dev: string; en: string };
  aka?: string[];
  description?: string;
  order?: number;
}

export function DeityForm({
  action,
  initial,
  submitLabel,
}: {
  action: (state: DeityFormState, formData: FormData) => Promise<DeityFormState>;
  initial?: DeityFormValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="mt-6 max-w-xl space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Devanagari name" name="nameDev" defaultValue={initial?.name?.dev} required lang="sa-Deva" />
        <Field label="English name" name="nameEn" defaultValue={initial?.name?.en} required />
      </div>
      <Field
        label="Slug"
        name="slug"
        defaultValue={initial?.slug}
        required
        hint="Lowercase letters, numbers, hyphens. Used in /deities/[slug]."
      />
      <Field
        label="Also known as"
        name="aka"
        defaultValue={initial?.aka?.join(", ")}
        hint="Comma-separated alternate names."
      />
      <div>
        <label className="block text-sm font-medium text-ink">Description</label>
        <textarea
          name="description"
          defaultValue={initial?.description}
          rows={3}
          className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-ink outline-none focus:border-gold"
        />
      </div>
      <Field
        label="Sort order"
        name="order"
        type="number"
        defaultValue={String(initial?.order ?? 0)}
      />

      {state?.error ? <p className="text-sm text-maroon">{state.error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-maroon px-6 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  hint,
  type = "text",
  lang,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  hint?: string;
  type?: string;
  lang?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        lang={lang}
        className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-ink outline-none focus:border-gold"
      />
      {hint ? <p className="mt-1 text-xs text-ink-muted">{hint}</p> : null}
    </div>
  );
}
