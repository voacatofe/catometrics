import Link from "next/link";
import { ChevronRight, Users, BarChart4, Settings, Home, UserCog, Shield, ClipboardList, Cog } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { use } from "react";

interface AdminHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: {
    href: string;
    label: string;
  }[];
  actions?: React.ReactNode;
}

// Componente que verifica se o usuário é superadmin
function SuperAdminLinks() {
  // Como estamos em um componente de servidor, vamos usar a prop isSuperAdmin
  // passada do lado do servidor
  return (
    <>
      <Link
        href="/admin/superadmins"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "text-sm justify-start"
        )}
      >
        <Shield className="mr-2 h-4 w-4" />
        Superadmins
      </Link>
      <Link
        href="/admin/audit-logs"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "text-sm justify-start"
        )}
      >
        <ClipboardList className="mr-2 h-4 w-4" />
        Logs de Auditoria
      </Link>
      <Link
        href="/admin/system-settings"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "text-sm justify-start"
        )}
      >
        <Cog className="mr-2 h-4 w-4" />
        Configurações do Sistema
      </Link>
    </>
  );
}

export function AdminHeader({
  title,
  description,
  breadcrumbs = [],
  actions,
}: AdminHeaderProps) {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <div>
          {breadcrumbs.length > 0 && (
            <div className="flex items-center mb-2 text-sm text-muted-foreground">
              <Link
                href="/admin"
                className="hover:text-foreground flex items-center"
              >
                <Home className="h-4 w-4 mr-1" />
                <span>Admin</span>
              </Link>
              {breadcrumbs.map((breadcrumb, index) => (
                <div
                  key={breadcrumb.href}
                  className="flex items-center"
                >
                  <ChevronRight className="h-4 w-4 mx-1" />
                  <Link
                    href={breadcrumb.href}
                    className={cn(
                      "hover:text-foreground",
                      index === breadcrumbs.length - 1 && "text-foreground"
                    )}
                  >
                    {breadcrumb.label}
                  </Link>
                </div>
              ))}
            </div>
          )}
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">{actions}</div>
        )}
      </div>
      <div className="flex border-b py-3 gap-4 overflow-x-auto">
        <Link
          href="/admin"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "text-sm justify-start"
          )}
        >
          <Home className="mr-2 h-4 w-4" />
          Dashboard
        </Link>
        <Link
          href="/admin/teams"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "text-sm justify-start"
          )}
        >
          <Users className="mr-2 h-4 w-4" />
          Times
        </Link>
        <Link
          href="/admin/users"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "text-sm justify-start"
          )}
        >
          <UserCog className="mr-2 h-4 w-4" />
          Usuários
        </Link>
        <Link
          href="/admin/dashboards"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "text-sm justify-start"
          )}
        >
          <BarChart4 className="mr-2 h-4 w-4" />
          Dashboards
        </Link>
        
        {/* Adicionando links de superadmin */}
        <SuperAdminLinks />
        
        <Link
          href="/admin/settings"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "text-sm justify-start"
          )}
        >
          <Settings className="mr-2 h-4 w-4" />
          Configurações
        </Link>
      </div>
    </div>
  );
} 