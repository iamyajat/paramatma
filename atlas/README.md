# Vector search (future)

`vector-index.segments.json` defines an Atlas Vector Search index on the
`segments` collection's `embedding` field, plus filter fields (`workType`,
`deitySlug`, `kind`) for scoped semantic search.

Not wired up yet — `embedding` is unset on all documents. To enable later:

1. Pick an embedding model and set `numDimensions` in this file to match
   (1536 is a placeholder for OpenAI `text-embedding-3-small`).
2. Create the index in Atlas: **Database → Search → Create Search Index →
   JSON Editor**, paste this file's `definition`, target the `segments`
   collection.
3. Run `scripts/embed.ts` (outline only today) to populate `embedding` /
   `embeddingText` / `embeddedAt` on each segment.
4. Query with `$vectorSearch` in an aggregation pipeline, optionally combined
   with `$match` on `workType` / `deitySlug` for scoped search.

Each segment is already its own document (not nested in an array), which is
required for Atlas Vector Search to index it at all.
