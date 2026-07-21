/**
 * Outline only — not wired up. See atlas/README.md for the activation steps.
 *
 * Intended shape once a provider is chosen:
 *
 *   const segments = await Segment.find({ embedding: { $exists: false } });
 *   for (const batch of chunk(segments, 100)) {
 *     const inputs = batch.map(toEmbeddingText); // text.dev + text.en + meaning
 *     const vectors = await embedBatch(inputs); // e.g. OpenAI embeddings API
 *     await Promise.all(batch.map((seg, i) =>
 *       Segment.updateOne(
 *         { _id: seg._id },
 *         { embedding: vectors[i], embeddingText: inputs[i], embeddedAt: new Date() }
 *       )
 *     ));
 *   }
 *
 * toEmbeddingText(segment) should combine text.dev, text.en, and meaning into
 * one string per segment — that combined string is what gets embedded.
 */

export {};
