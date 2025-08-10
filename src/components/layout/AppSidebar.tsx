import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile, useIsTablet } from "@/hooks/use-mobile";
import {
  LayoutDashboard,
  Briefcase,
  DollarSign,
  Calendar,
  BarChart3,
  Users,
  Settings,
  Plus,
  ChevronRight,
  Building2,
  UserCog,
  Crown,
  Shield,
  User as UserIcon
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const mainNavItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Operações", url: "/operacoes", icon: Briefcase },
  { title: "Financeiro", url: "/financeiro", icon: DollarSign },
  { title: "Agenda", url: "/agenda", icon: Calendar },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Usuários", url: "/usuarios", icon: UserCog },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { open, openMobile } = useSidebar();
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isOpen = isMobile ? openMobile : open;
  const collapsed = !isOpen;

  const isActive = (path: string) => currentPath === path;

  // Filtrar itens do menu baseado nas permissões
  const getFilteredNavItems = () => {
    if (!currentUser) return mainNavItems;
    
    return mainNavItems.filter(item => {
      if (item.url === "/financeiro" && !currentUser.permissions.canViewFinance) {
        return false;
      }
      if (item.url === "/usuarios" && currentUser.role !== 'admin') {
        return false;
      }
      return true;
    });
  };

  const getRoleIcon = () => {
    if (!currentUser) return UserIcon;
    switch (currentUser.role) {
      case 'admin': return Crown;
      case 'gestor': return Shield;
      case 'colaborador': return UserIcon;
      default: return UserIcon;
    }
  };

  const getRoleColor = () => {
    if (!currentUser) return "text-muted-foreground";
    switch (currentUser.role) {
      case 'admin': return "text-red-500";
      case 'gestor': return "text-blue-500";
      case 'colaborador': return "text-green-500";
      default: return "text-muted-foreground";
    }
  };

  const filteredNavItems = getFilteredNavItems();
  const RoleIcon = getRoleIcon();

  // Determinar largura da sidebar baseada no dispositivo e estado
  const getSidebarWidth = () => {
    if (isMobile) return collapsed ? "w-0" : "w-72"; // Adjust for offcanvas (hidden when collapsed)
    if (isTablet) return collapsed ? "w-16" : "w-56";
    return collapsed ? "w-16" : "w-72";
  };

  // Conditional variant and collapsible for mobile responsiveness
  const sidebarVariant = isMobile ? "floating" : "sidebar";
  const sidebarCollapsible = isMobile ? "offcanvas" : "icon";

  return (
    <Sidebar 
      className={`${getSidebarWidth()} border-r border-border bg-background dark:bg-background shadow-subtle transition-all duration-300`}
      collapsible={sidebarCollapsible}
      variant={sidebarVariant}
    >
      <SidebarHeader className="border-b border-border p-4 bg-background dark:bg-background">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-sm">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Gestão Pro
              </h2>
              <p className="text-sm text-muted-foreground">
                Sistema Empresarial
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3 md:p-4 bg-background dark:bg-background overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-2">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {filteredNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild size="lg">
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-fast hover:bg-accent group ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-foreground hover:text-accent-foreground"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 shrink-0 text-foreground" /> {/* Explicit color for better visibility */}
                      {!collapsed && (
                        <>
                          <span className="flex-1 font-medium truncate">{item.title}</span>
                          <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-fast" />
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <>
            <Separator className="my-4 bg-border" />
            
            {/* Informações do Usuário */}
            {currentUser && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-2">
                  Usuário Atual
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg shadow-subtle">
                    <div className={`h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center`}>
                      <RoleIcon className={`h-4 w-4 ${getRoleColor()}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {currentUser.name}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {currentUser.role}
                      </p>
                    </div>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {!isMobile && (
              <>
                <Separator className="my-4 bg-border" />
                
                <SidebarGroup>
                  <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-2">
                    Ações Rápidas
                  </SidebarGroupLabel>
                  <SidebarGroupContent className="space-y-2">
                    {currentUser?.permissions.canEditOperations && (
                      <Button 
                        size="sm" 
                        className="w-full justify-start gap-2 bg-primary hover:bg-primary/90 shadow-sm rounded-lg text-xs"
                        onClick={() => navigate('/operacoes?action=new')}
                      >
                        <Plus className="h-4 w-4" />
                        Nova Operação
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start gap-2 rounded-lg text-xs"
                      onClick={() => navigate('/financeiro?action=new')}
                    >
                      <Plus className="h-4 w-4" />
                      Novo Gasto
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start gap-2 rounded-lg text-xs"
                      onClick={() => navigate('/agenda?action=new')}
                    >
                      <Plus className="h-4 w-4" />
                      Nova Tarefa
                    </Button>
                    {currentUser?.role === 'admin' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start gap-2 rounded-lg text-xs"
                        onClick={() => navigate('/usuarios?action=new')}
                      >
                        <Plus className="h-4 w-4" />
                        Novo Usuário
                      </Button>
                    )}
                  </SidebarGroupContent>
                </SidebarGroup>
              </>
            )}
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}