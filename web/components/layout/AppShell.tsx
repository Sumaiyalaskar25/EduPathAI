"use client";

import { usePathname } from "next/navigation";
import { TopBar } from "./TopBar";
import { Sidebar, type NavItem } from "./Sidebar";
import {
  MobileNav,
  STUDENT_MOBILE_NAV,
  HEI_MOBILE_NAV,
  GOV_MOBILE_NAV,
} from "./MobileNav";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  topBarRight?: React.ReactNode;
  nav?: NavItem[];
  reserveBottom?: boolean;
}

export function AppShell({
  children,
  title,
  subtitle,
  topBarRight,
  nav,
  reserveBottom = true,
}: AppShellProps) {
  const pathname = usePathname();

  // Auto-pick mobile nav based on the route segment
  const mobileNav = pathname?.startsWith("/hei")
    ? HEI_MOBILE_NAV
    : pathname?.startsWith("/gov")
    ? GOV_MOBILE_NAV
    : STUDENT_MOBILE_NAV;

  return (
    <div className="relative min-h-screen">
      <TopBar title={title} subtitle={subtitle} rightSlot={topBarRight} />
      <Sidebar nav={nav} />
      <MobileNav nav={mobileNav} />
      <main
        className={
          "pt-24 md:pl-32 " +
          (reserveBottom ? "pb-40 md:pb-32" : "pb-28 md:pb-8")
        }
      >
        {children}
      </main>
    </div>
  );
}