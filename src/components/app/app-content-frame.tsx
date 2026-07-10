"use client";

import { usePathname } from "next/navigation";

export function AppContentFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="cyllene-route-frame">
      {children}
    </div>
  );
}
