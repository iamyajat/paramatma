import type { ComponentProps } from "react";

type IconProps = { className?: string };

function baseProps(className?: string): ComponentProps<"svg"> {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    className: className ?? "h-3.5 w-3.5",
  };
}

export function FolderIcon({ className }: IconProps) {
  return (
    <svg {...baseProps(className)}>
      <path d="M3 7a2 2 0 0 1 2-2h3.5l2 2H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    </svg>
  );
}

export function XIcon({ className }: IconProps) {
  return (
    <svg {...baseProps(className)} strokeWidth={2}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg {...baseProps(className)}>
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 .7 12.1A2 2 0 0 0 8.7 21h6.6a2 2 0 0 0 2-1.9L18 7" />
    </svg>
  );
}

export function PencilIcon({ className }: IconProps) {
  return (
    <svg {...baseProps(className)}>
      <path d="M4 20h4l10.5-10.5a1.5 1.5 0 0 0 0-2.1l-1.9-1.9a1.5 1.5 0 0 0-2.1 0L4 15.9V20Z" />
    </svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg {...baseProps(className)} strokeWidth={2}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg {...baseProps(className)} strokeWidth={2}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg {...baseProps(className)} strokeWidth={2}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function ShareIcon({ className }: IconProps) {
  return (
    <svg {...baseProps(className)}>
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="M8.2 10.8 15.8 6.2M8.2 13.2l7.6 4.6" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg {...baseProps(className)} strokeWidth={2}>
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}
