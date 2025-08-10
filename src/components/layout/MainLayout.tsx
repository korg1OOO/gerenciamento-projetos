import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Toaster } from "@/components/ui/toaster";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ProfileToggle } from "@/components/ui/profile-toggle";
import { useIsMobile, useIsTablet } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  return (
    <SidebarProvider
      defaultOpen={!isMobile}
    >
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border bg-card/50 backdrop-blur px-3 sm:px-4 sticky top-0 z-40 shadow-subtle">
            <div className="flex items-center gap-2 sm:gap-4">
              <SidebarTrigger className="shrink-0 md:hidden" />
              {!isMobile && (
                <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">
                  Sistema de Gestão Empresarial
                </h1>
              )}
              {isMobile && (
                <h1 className="text-sm font-semibold text-foreground truncate">
                  Gestão Pro
                </h1>
              )}
            </div>
            <div className="flex items-center gap-2">
              <ProfileToggle />
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 p-2 sm:p-4 lg:p-6 overflow-auto bg-background">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}