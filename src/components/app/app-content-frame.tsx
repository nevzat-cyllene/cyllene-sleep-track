"use client";

import type { ReactNode } from "react";

/** Stable frame — no remount/animation on route change (keeps desktop snappy). */
export function AppContentFrame({ children }: { children: ReactNode }) {
  return <div className="cyllene-route-frame">{children}</div>;
}
