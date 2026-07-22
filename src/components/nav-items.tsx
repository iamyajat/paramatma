import type { ComponentProps } from "react";

type IconProps = ComponentProps<"svg">;

function baseProps(className?: string): IconProps {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    className: className ?? "h-5 w-5",
  };
}

export function HomeIcon({ className }: { className?: string }) {
  return (
    <svg {...baseProps(className)}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20h5v-6h4v6h5V9.5" />
    </svg>
  );
}

export function DeityIcon({ className }: { className?: string }) {
  // A lotus — a gentle, unambiguous stand-in for "deities".
  return (
    <svg {...baseProps(className)}>
      <path d="M12 4c1.6 1.7 2.4 3.6 2.4 5.7 0 1-.2 2-.6 2.9-.5-.9-1.1-1.8-1.8-2.6-.7.8-1.3 1.7-1.8 2.6-.4-.9-.6-1.9-.6-2.9C9.6 7.6 10.4 5.7 12 4Z" />
      <path d="M4 11c2.3.2 4.2 1 5.7 2.4C8.2 14.9 6 15.6 3.6 15.4 3.4 13.8 3.5 12.3 4 11Z" />
      <path d="M20 11c-2.3.2-4.2 1-5.7 2.4 1.5 1.5 3.7 2.2 6.1 2 .2-1.6.1-3.1-.4-4.4Z" />
      <path d="M4.5 15.5C6.7 17 9.3 17.8 12 17.8s5.3-.8 7.5-2.3" />
    </svg>
  );
}

export function SearchIcon({ className }: { className?: string }) {
  return (
    <svg {...baseProps(className)} strokeWidth={2}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function SaveIcon({ className }: { className?: string }) {
  return (
    <svg {...baseProps(className)}>
      <path d="M6 4h12v16l-6-4-6 4V4Z" />
    </svg>
  );
}

export type NavItem = {
  href: string;
  label: string;
  Icon: (props: { className?: string }) => React.ReactElement;
};

/** Primary destinations, shared by the desktop header and the mobile bottom bar. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/deities", label: "Deities", Icon: DeityIcon },
  { href: "/search", label: "Search", Icon: SearchIcon },
  { href: "/saved", label: "Saved", Icon: SaveIcon },
];

/** Whether `pathname` should mark `href` as the active nav item. */
export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
