"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Trees,
  Workflow,
  Search,
  ScrollText,
  User,
  Inbox,
  ClipboardCheck,
  Building2,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface MobileNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

export const STUDENT_MOBILE_NAV: MobileNavItem[] = [
  { href: "/student",          label: "Home",     icon: LayoutDashboard, exact: true },
  { href: "/student/tree",     label: "Tree",     icon: Trees },
  { href: "/student/pathways", label: "Paths",    icon: Workflow },
  { href: "/student/gaps",     label: "Gaps",     icon: Search },
  { href: "/student/audit",    label: "Ledger",   icon: ScrollText },
  { href: "/student/profile",  label: "Me",       icon: User },
];

export const HEI_MOBILE_NAV: MobileNavItem[] = [
  { href: "/hei",              label: "Queue",        icon: Inbox, exact: true },
  { href: "/hei/approved",     label: "Approved",     icon: ClipboardCheck },
  { href: "/hei/institutions", label: "Institutions", icon: Building2 },
];

export const GOV_MOBILE_NAV: MobileNavItem[] = [
  { href: "/gov",          label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/gov/mobility", label: "Mobility", icon: BarChart3 },
  { href: "/gov/policy",   label: "Policy",   icon: ScrollText },
];

export function MobileNav({ nav = STUDENT_MOBILE_NAV }: { nav?: MobileNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-2 bottom-2 z-40 flex items-center justify-around gap-1 rounded-3xl border border-border-subtle bg-surface/95 px-1.5 py-2 shadow-lg backdrop-blur-xl md:hidden"
    >
      {nav.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-medium transition-colors",
              active ? "text-white" : "text-text-secondary"
            )}
          >
            {active && (
              <motion.span
                layoutId="mobile-nav-active"
                className="absolute inset-0 rounded-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgb(16 185 129) 0%, rgb(4 120 87) 100%)",
                  boxShadow:
                    "0 8px 24px -8px rgb(16 185 129 / 0.55), inset 0 1px 0 rgb(255 255 255 / 0.25)",
                }}
                transition={{ type: "spring", damping: 28, stiffness: 340 }}
              />
            )}
            <Icon
              className={cn(
                "relative h-[20px] w-[20px] transition-transform",
                active && "scale-105"
              )}
              strokeWidth={1.9}
            />
            <span className="relative whitespace-nowrap">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}