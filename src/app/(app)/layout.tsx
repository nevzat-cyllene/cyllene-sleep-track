import { AppHeader } from "@/components/app-header";
import { InstallPWA } from "@/components/install-pwa";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <div className="mx-auto flex max-w-6xl justify-end px-4 pt-4 sm:px-6">
        <InstallPWA />
      </div>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
