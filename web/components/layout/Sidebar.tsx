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
  BarChart3,
  Building2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

export const STUDENT_NAV: NavItem[] = [
  { href: "/student",          label: "Dashboard",      icon: LayoutDashboard, exact: true },
  { href: "/student/tree",     label: "Tree View",      icon: Trees },
  { href: "/student/pathways", label: "Pathway\nSolver",icon: Workflow },
  { href: "/student/gaps",     label: "Gap\nAnalysis",  icon: Search },
  { href: "/student/audit",    label: "Ledger",         icon: ScrollText },
  { href: "/student/profile",  label: "Profile",        icon: User },
];

export const HEI_NAV: NavItem[] = [
  { href: "/hei",              label: "Review\nQueue",   icon: Inbox, exact: true },
  { href: "/hei/approved",     label: "Approved",        icon: ClipboardCheck },
  { href: "/hei/institutions", label: "Institutions",    icon: Building2 },
];

export const GOV_NAV: NavItem[] = [
  { href: "/gov",              label: "Overview",        icon: LayoutDashboard, exact: true },
  { href: "/gov/mobility",     label: "Mobility",        icon: BarChart3 },
  { href: "/gov/policy",       label: "Policy",          icon: ScrollText },
];

export function Sidebar({ nav = STUDENT_NAV }: { nav?: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary navigation"
      className="glass-strong fixed left-3 top-24 z-30 hidden flex-col items-center gap-1 rounded-2xl p-2 md:left-5 md:flex"
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
              "group relative flex w-[86px] flex-col items-center gap-2 rounded-2xl px-2 py-3.5 text-[11px] font-medium leading-tight transition-all duration-200",
              active ? "text-white" : "text-text-secondary hover:text-text-primary"
            )}
          >
            {active && (
              <motion.span
                layoutId="sidebar-active"
                className="absolute inset-0 rounded-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgb(16 185 129) 0%, rgb(4 120 87) 100%)",
                  boxShadow:
                    "0 12px 28px -10px rgb(16 185 129 / 0.55), inset 0 1px 0 rgb(255 255 255 / 0.25)",
                }}
                transition={{ type: "spring", damping: 28, stiffness: 340 }}
              />
            )}
            {!active && (
              <span className="absolute inset-0 rounded-2xl bg-transparent transition-colors duration-200 group-hover:bg-white/50" />
            )}
            <Icon
              className={cn(
                "relative h-[22px] w-[22px] transition-transform duration-200 group-hover:scale-105",
                active ? "text-white" : "text-current"
              )}
              strokeWidth={1.9}
            />
            <span className="relative whitespace-pre text-center leading-tight">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}