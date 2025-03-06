"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Users, Settings } from "lucide-react"

import { cn } from "@/lib/utils"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
}

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

export default function DashboardNav() {
  const pathname = usePathname()

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
    </nav>
  )
} 