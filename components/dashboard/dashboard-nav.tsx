"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Users, Settings, ShieldAlert, UserCog, Database } from "lucide-react"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  adminOnly?: boolean
}

interface DashboardNavProps {
  isSuperAdmin?: boolean;
}

// Links de navegação padrão
const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <BarChart3 className="mr-2 h-4 w-4" />,
  },
  {
    title: "Times",
    href: "/teams",
    icon: <Users className="mr-2 h-4 w-4" />,
  },
  {
    title: "Configurações",
    href: "/settings",
    icon: <Settings className="mr-2 h-4 w-4" />,
  },
]

// Links de navegação para administradores
const adminNavItems: NavItem[] = [
  {
    title: "Painel Admin",
    href: "/admin",
    icon: <ShieldAlert className="mr-2 h-4 w-4" />,
    adminOnly: true,
  },
  {
    title: "Gerenciar Times",
    href: "/admin/teams",
    icon: <Users className="mr-2 h-4 w-4" />,
    adminOnly: true,
  },
  {
    title: "Gerenciar Usuários",
    href: "/admin/users",
    icon: <UserCog className="mr-2 h-4 w-4" />,
    adminOnly: true,
  },
  {
    title: "Gerenciar Dashboards",
    href: "/admin/dashboards",
    icon: <Database className="mr-2 h-4 w-4" />,
    adminOnly: true,
  },
]

export default function DashboardNav({ isSuperAdmin = false }: DashboardNavProps) {
  const pathname = usePathname()

  // Combinar itens de navegação, incluindo itens de admin se o usuário for superadmin
  const allNavItems = [...navItems, ...(isSuperAdmin ? adminNavItems : [])];
  
  // Logging para diagnóstico
  console.log("[DEBUG] DashboardNav - Status do usuário:", { 
    isSuperAdmin, 
    pathname,
    adminLinksShown: isSuperAdmin
  });

  return (
    <nav className="grid items-start gap-2 py-6">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            pathname === item.href ? "bg-accent text-accent-foreground" : "transparent"
          )}
        >
          {item.icon}
          <span>{item.title}</span>
        </Link>
      ))}
      
      {/* Exibir os links de admin mesmo que isSuperAdmin seja false durante o diagnóstico */}
      {(isSuperAdmin || process.env.NODE_ENV === "development") && (
        <>
          <Separator className="my-4" />
          <p className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
            Administração {!isSuperAdmin && process.env.NODE_ENV === "development" && "(Modo Diagnóstico)"}
          </p>
          
          {adminNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname === item.href ? "bg-accent text-accent-foreground" : "transparent",
                !isSuperAdmin && process.env.NODE_ENV === "development" && "text-orange-500"
              )}
            >
              {item.icon}
              <span>{item.title}</span>
            </Link>
          ))}
        </>
      )}
    </nav>
  )
} 