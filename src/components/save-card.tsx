"use client";

import { WorkCard } from "@/components/work-card";
import { CollectionPicker } from "@/components/collection-picker";
import { removeSave, removeFromCollection, type Collection, type Save } from "@/lib/saves";
import { XIcon } from "@/components/save-icons";

export function SaveCard({
  save,
  saves,
  collections,
  collectionId,
}: {
  save: Save;
  saves: Save[];
  collections: Collection[];
  /** When set, this card is rendered inside that collection's detail view: no
   *  folder/add-to-collection control, and the remove button only detaches
   *  the save from this collection (it stays in All and any other collection). */
  collectionId?: string;
}) {
  return (
    <WorkCard
      work={save}
      actions={
        <div className="flex items-center gap-1.5">
          {collectionId ? (
            <button
              type="button"
              onClick={() => removeFromCollection(save.id, collectionId)}
              aria-label={`Remove ${save.title.en} from this collection`}
              title="Remove from this collection"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-ink-muted shadow-soft transition-colors hover:border-maroon hover:text-maroon"
            >
              <XIcon className="h-3.5 w-3.5" />
            </button>
          ) : (
            <>
              <CollectionPicker save={save} saves={saves} collections={collections} />
              <button
                type="button"
                onClick={() => removeSave(save.id)}
                aria-label={`Remove ${save.title.en} from your saves`}
                title="Remove from saves"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-ink-muted shadow-soft transition-colors hover:border-maroon hover:text-maroon"
              >
                <XIcon className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      }
    />
  );
}
