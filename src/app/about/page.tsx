import type { Metadata } from "next";
import { OmMark } from "@/components/icons/om-mark";
import { BackLink } from "@/components/back-link";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Paramatma — a quiet, readable home for Hindu scriptures, and how sources are credited.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <BackLink href="/" label="Home" />
      <div className="mt-6 text-center">
        <OmMark className="text-4xl text-gold" />
        <h1 className="mt-3 font-display text-3xl font-semibold text-ink">
          About{" "}
          <span lang="sa-Deva" className="font-scripture">
            परमात्मा
          </span>
        </h1>
      </div>

      <div className="mt-10 space-y-8 leading-relaxed text-ink">
        <section>
          <h2 className="font-display text-lg font-semibold text-ink">
            What this is
          </h2>
          <p className="mt-2 text-ink-muted">
            <span lang="sa-Deva" className="font-scripture text-ink">
              परमात्मा
            </span>{" "}
            is a quiet, readable home for the names, hymns, and prayers of the
            Hindu tradition — ashtottara shatanamavalis (108 names), aartis,
            bhajans, stotras, and sahasranamas — presented in Devanagari with
            pronunciation and meaning, for reading, recitation, and
            remembrance.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">
            On sources and accuracy
          </h2>
          <p className="mt-2 text-ink-muted">
            The scriptures themselves belong to a shared tradition passed down
            over centuries. Where a specific page draws on a particular
            website&rsquo;s translation, transliteration, or commentary, that
            source is credited at the bottom of the page. If you notice an
            error in a name, verse, or meaning, we&rsquo;d rather correct it
            than leave it standing — every effort has been made toward
            accuracy, but this is curated by hand and not infallible.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">
            Reading the site
          </h2>
          <p className="mt-2 text-ink-muted">
            Each page offers a few small comforts: adjustable text size, a
            toggle to show or hide pronunciation, meanings tucked behind a
            tap, and a link to jump straight to any verse. Everything renders
            on the server, so pages load fast and share cleanly to social
            media.
          </p>
        </section>
      </div>
    </div>
  );
}
