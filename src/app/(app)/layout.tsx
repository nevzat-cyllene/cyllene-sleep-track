import { AppSidebar } from "@/components/app/app-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";
import { MobileBottomNav } from "@/components/app/mobile-bottom-nav";
import { RecordingUIProvider } from "@/components/app/recording-ui-context";
import { Container } from "@/components/shell/container";
import { SidebarInset, SidebarProvider, SidebarRail } from "@/components/ui/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarRail className="hidden md:flex" />
      <SidebarInset className="bg-transparent">
        <RecordingUIProvider>
          <AppTopbar />
          <Container className="pb-24 pt-6 md:pb-8 md:py-8">{children}</Container>
          <MobileBottomNav />
        </RecordingUIProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
