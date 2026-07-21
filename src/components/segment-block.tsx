import type { SegmentItem } from "@/lib/data";
import { VerseActions } from "@/components/verse-actions";

const DEV_SIZE = "calc(1.5rem * var(--reader-scale, 1))";
const PRONUNCIATION_SIZE = "calc(1rem * var(--reader-scale, 1))";

function buildCopyText(segment: SegmentItem): string {
  const parts = [segment.mantra?.dev ?? segment.text.dev];
  if (segment.text.en) parts.push(segment.text.en);
  if (segment.mantra?.en) parts.push(segment.mantra.en);
  return parts.join("\n");
}

export function SegmentBlock({ segment }: { segment: SegmentItem }) {
  const anchor = `v${segment.number ?? segment.order + 1}`;

  if (segment.kind === "section-heading") {
    return (
      <h3
        id={anchor}
        lang="sa-Deva"
        className="scroll-mt-36 pt-4 font-display text-lg font-semibold text-maroon"
      >
        {segment.text.dev}
      </h3>
    );
  }

  return (
    <div id={anchor} className="group/verse scroll-mt-36 py-4">
      <div className="flex items-start gap-3">
        {segment.number ? (
          <span className="mt-1 shrink-0 font-display text-sm text-gold">
            {segment.number}
          </span>
        ) : null}

        <div className="min-w-0 flex-1">
          <p
            lang="sa-Deva"
            className="whitespace-pre-line font-scripture leading-relaxed text-ink"
            style={{ fontSize: DEV_SIZE }}
          >
            {segment.text.dev}
          </p>
          {segment.text.en ? (
            <p
              lang="sa-Latn"
              className="pronunciation mt-1 whitespace-pre-line font-serif italic leading-relaxed text-ink-muted"
              style={{ fontSize: PRONUNCIATION_SIZE }}
            >
              {segment.text.en}
            </p>
          ) : null}

          {segment.mantra ? (
            <>
              <p
                lang="sa-Deva"
                className="mt-2 whitespace-pre-line font-scripture leading-relaxed text-maroon"
                style={{ fontSize: DEV_SIZE }}
              >
                {segment.mantra.dev}
              </p>
              {segment.mantra.en ? (
                <p
                  lang="sa-Latn"
                  className="pronunciation mt-1 whitespace-pre-line font-serif italic leading-relaxed text-ink-muted"
                  style={{ fontSize: PRONUNCIATION_SIZE }}
                >
                  {segment.mantra.en}
                </p>
              ) : null}
            </>
          ) : null}

          {segment.meaning ? (
            <details className="meaning mt-2">
              <summary className="cursor-pointer text-sm font-medium text-gold">
                <span className="inline-flex items-center gap-1">
                  <ChevronIcon />
                  Meaning
                </span>
              </summary>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                {segment.meaning}
              </p>
            </details>
          ) : null}
        </div>

        <VerseActions anchor={anchor} copyText={buildCopyText(segment)} />
      </div>
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3 w-3 transition-transform [details[open]_&]:rotate-90"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
