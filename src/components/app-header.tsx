import Link from "next/link";
import { Moon } from "lucide-react";
import { AppNav } from "./app-nav";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
            <Moon className="h-4 w-4 text-primary" />
          </div>
          <span className="text-gradient">CySleep</span>
        </Link>
        <AppNav />
      </div>
    </header>
  );
}
