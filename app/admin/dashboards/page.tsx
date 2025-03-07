import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardsPage() {
  // Verificação de autenticação manual em vez de usar requireSuperAdmin
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }
  
  // Verificar manualmente se é superadmin
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { isSuperAdmin: true }
  });
  
  if (!user?.isSuperAdmin) {
    redirect("/dashboard");
  }

  // Buscar informações mais simples dos dashboards, sem incluir dates
  const dashboardsCount = await db.dashboard.count();

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader title="Gerenciamento de Dashboards" />
      
      <Card>
        <CardHeader>
          <CardTitle>Dashboards Cadastrados</CardTitle>
          <CardDescription>Gerenciamento de todos os dashboards da plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center">
            <p className="text-lg font-medium">Total de dashboards: {dashboardsCount}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Esta página foi simplificada temporariamente para resolver problemas técnicos.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 