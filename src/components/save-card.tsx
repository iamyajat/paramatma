"use client";

import { WorkCard } from "@/components/work-card";
import { CollectionPicker } from "@/components/collection-picker";
import { removeSave, removeFromCollection, type Collection, type Save } from "@/lib/saves";
import { XIcon } from "@/components/save-icons";

export function SaveCard({
  save,
  collections,
  saves,
  collectionId,
}: {
  save: Save;
  collections: Collection[];
  saves: Save[];
  /** When set, this card is rendered inside that collection's detail view: no
   *  folder/add-to-collection control, and the remove button only detaches
   *  the save from this collection (it stays in All and any other collection). */
  collectionId?: string;
}) {
  return (
    <WorkCard
      work={save}
      actions={
        <div className="flex items-center gap-0.5 rounded-full border border-border bg-surface p-1 shadow-soft">
          {collectionId ? (
            <button
              type="button"
              onClick={() => removeFromCollection(save.id, collectionId)}
              aria-label={`Remove ${save.title.en} from this collection`}
              title="Remove from this collection"
              className="flex h-6 w-6 items-center justify-center rounded-full text-ink-muted transition-colors hover:text-maroon"
            >
              <XIcon />
            </button>
          ) : (
            <>
              <CollectionPicker save={save} collections={collections} saves={saves} />
              <span aria-hidden className="h-4 w-px bg-border" />
              <button
                type="button"
                onClick={() => removeSave(save.id)}
                aria-label={`Remove ${save.title.en} from your saves`}
                title="Remove from saves"
                className="flex h-6 w-6 items-center justify-center rounded-full text-ink-muted transition-colors hover:text-maroon"
              >
                <XIcon />
              </button>
            </>
          )}
        </div>
      }
    />
  );
}
