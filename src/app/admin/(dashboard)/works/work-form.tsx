"use client";

import { useActionState, useState } from "react";
import type { WorkFormState } from "@/lib/actions/works";
import { CONTENT_TYPE_META, type ContentType } from "@/lib/content-types";

const CONTENT_HELP: Record<ContentType, { hint: string; placeholder: string }> = {
  ashtottara: {
    hint:
      "One name per block, separated by a blank line. Within each block: name (Devanagari), then the mantra e.g. ॐ ... नमः (Devanagari), then pronunciation (optional), then meaning (optional).",
    placeholder: `गजानन
ॐ गजाननाय नमः
Om Gajananaya Namaha
One with the face of an elephant.

गणाध्यक्ष
ॐ गणाध्यक्षाय नमः
Om Ganadhyakshaya Namaha
Lord of the ganas.`,
  },
  aarti: {
    hint: "Paste the full text. Separate stanzas with a blank line.",
    placeholder: `जय गणेश जय गणेश जय गणेश देवा।
माता जाकी पार्वती पिता महादेवा॥

एक दंत दयावंत चार भुजा धारी।
माथे पर तिलक सोहे मूसे की सवारी॥`,
  },
  bhajan: {
    hint: "Paste the full text. Separate stanzas with a blank line.",
    placeholder: "Paste the bhajan text here, stanzas separated by a blank line.",
  },
  stotra: {
    hint:
      "One verse per block, separated by a blank line. Within a block, put the Devanagari shloka lines first, then pronunciation lines (optional).",
    placeholder: `वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।
निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥
Vakratunda Mahakaya Suryakoti Samaprabha,
Nirvighnam Kuru Me Deva Sarva-kaaryeshu Sarvada`,
  },
  sahasranama: {
    hint:
      "One verse per block, separated by a blank line. Within a block, put the Devanagari shloka lines first, then pronunciation lines (optional).",
    placeholder: `शान्ताकारं भुजगशयनं पद्मनाभं सुरेशं...
Shantakaram Bhujagashayanam Padmanabham Suresham...`,
  },
};

export interface WorkFormInitial {
  slug?: string;
  titleDev?: string;
  titleEn?: string;
  deityId?: string;
  description?: string;
  status?: "draft" | "published";
  tags?: string;
  occasions?: string;
  audioUrl?: string;
  content?: string;
  sources?: { title: string; url: string; siteName?: string }[];
}

export function WorkForm({
  type,
  deities,
  action,
  initial,
  submitLabel,
}: {
  type: ContentType;
  deities: { id: string; name: { dev: string; en: string } }[];
  action: (state: WorkFormState, formData: FormData) => Promise<WorkFormState>;
  initial?: WorkFormInitial;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [sources, setSources] = useState(
    initial?.sources && initial.sources.length > 0
      ? initial.sources
      : [{ title: "", url: "", siteName: "" }]
  );
  const help = CONTENT_HELP[type];

  return (
    <form action={formAction} className="mt-6 max-w-2xl space-y-5">
      <input type="hidden" name="type" value={type} />

      <div className="rounded-full bg-gold-soft px-3 py-1 text-xs font-medium text-gold w-fit">
        {CONTENT_TYPE_META[type].label}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Devanagari title" name="titleDev" defaultValue={initial?.titleDev} required lang="sa-Deva" />
        <Field label="English title" name="titleEn" defaultValue={initial?.titleEn} required />
      </div>

      <Field
        label="Slug"
        name="slug"
        defaultValue={initial?.slug}
        required
        hint={`Lowercase letters, numbers, hyphens. Used in /${type}/[slug].`}
      />

      <div>
        <label htmlFor="deityId" className="block text-sm font-medium text-ink">
          Deity
        </label>
        <select
          id="deityId"
          name="deityId"
          required
          defaultValue={initial?.deityId}
          className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-ink outline-none focus:border-gold"
        >
          <option value="" disabled>
            Choose a deity
          </option>
          {deities.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name.en} ({d.name.dev})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-ink">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={initial?.description}
          rows={2}
          className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-ink outline-none focus:border-gold"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-ink">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={initial?.status ?? "draft"}
            className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-ink outline-none focus:border-gold"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <Field label="Audio URL (optional)" name="audioUrl" defaultValue={initial?.audioUrl} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Tags"
          name="tags"
          defaultValue={initial?.tags}
          hint="Comma-separated."
        />
        <Field
          label="Occasions"
          name="occasions"
          defaultValue={initial?.occasions}
          hint="Comma-separated, e.g. ganesh-chaturthi."
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-ink">
          Content
        </label>
        <p className="mt-1 text-xs text-ink-muted">{help.hint}</p>
        <textarea
          id="content"
          name="content"
          defaultValue={initial?.content}
          placeholder={help.placeholder}
          required
          rows={16}
          lang="sa-Deva"
          className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 font-scripture text-ink outline-none focus:border-gold"
        />
      </div>

      <div>
        <p className="block text-sm font-medium text-ink">Sources</p>
        <p className="mt-1 text-xs text-ink-muted">
          If this content was sourced from another website, credit it here.
        </p>
        <div className="mt-2 space-y-2">
          {sources.map((source, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
              <input
                name="sourceTitle[]"
                defaultValue={source.title}
                placeholder="Title"
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-gold"
              />
              <input
                name="sourceUrl[]"
                defaultValue={source.url}
                placeholder="https://…"
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-gold"
              />
              <input
                name="sourceSiteName[]"
                defaultValue={source.siteName}
                placeholder="Site name"
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-gold"
              />
              <button
                type="button"
                onClick={() => setSources(sources.filter((_, idx) => idx !== i))}
                className="rounded-lg border border-border px-2 text-xs text-ink-muted hover:border-maroon hover:text-maroon"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setSources([...sources, { title: "", url: "", siteName: "" }])}
          className="mt-2 text-sm text-maroon hover:underline"
        >
          + Add source
        </button>
      </div>

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
  lang,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  hint?: string;
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
        defaultValue={defaultValue}
        required={required}
        lang={lang}
        className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-ink outline-none focus:border-gold"
      />
      {hint ? <p className="mt-1 text-xs text-ink-muted">{hint}</p> : null}
    </div>
  );
}
