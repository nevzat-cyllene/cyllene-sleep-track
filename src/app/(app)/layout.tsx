import { AppSidebar } from "@/components/app/app-sidebar";
import { AppContentFrame } from "@/components/app/app-content-frame";
import { AppTopbar } from "@/components/app/app-topbar";
import { MobileBottomNav } from "@/components/app/mobile-bottom-nav";
import { RecordingUIProvider } from "@/components/app/recording-ui-context";
import { Container } from "@/components/shell/container";
import { SidebarInset, SidebarProvider, SidebarRail } from "@/components/ui/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen className="bg-[#050a16]">
      <AppSidebar />
      <SidebarRail className="hidden md:flex" />
      <SidebarInset className="relative overflow-x-hidden bg-transparent">
        <RecordingUIProvider>
          <AppTopbar />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-[-12rem] top-[-8rem] h-[32rem] w-[32rem] rounded-full bg-[#175fff]/8 blur-[120px]"
          />
          <Container className="relative pb-[calc(7.5rem+env(safe-area-inset-bottom))] pt-6 md:py-8">
            <AppContentFrame>{children}</AppContentFrame>
          </Container>
          <MobileBottomNav />
          {/* Catches any content that would otherwise peek under the floating tab bar */}
          <div
            aria-hidden
            className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-[calc(5.75rem+env(safe-area-inset-bottom))] bg-[#050a16] md:hidden"
          />
        </RecordingUIProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
