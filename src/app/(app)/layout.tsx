import { AppSidebar } from "@/components/app/app-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";
import { Container } from "@/components/shell/container";
import { SidebarInset, SidebarProvider, SidebarRail } from "@/components/ui/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarRail />
      <SidebarInset className="bg-transparent">
        <AppTopbar />
        <Container className="py-8">{children}</Container>
      </SidebarInset>
    </SidebarProvider>
  );
}
