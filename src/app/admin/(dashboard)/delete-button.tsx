"use client";

export function DeleteButton({
  action,
  label,
}: {
  action: () => Promise<void>;
  label: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(label)) e.preventDefault();
      }}
    >
      <button
        type="submit"
        className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-maroon hover:border-maroon"
      >
        Delete
      </button>
    </form>
  );
}
