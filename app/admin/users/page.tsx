import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminUsersPage() {
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
  
  // Buscar apenas a contagem de usuários, sem datas
  const usersCount = await db.user.count();
  const superAdminsCount = await db.user.count({
    where: { isSuperAdmin: true }
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader title="Gerenciamento de Usuários" />
      
      <Card>
        <CardHeader>
          <CardTitle>Usuários Cadastrados</CardTitle>
          <CardDescription>Gerenciamento de todos os usuários da plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center">
            <p className="text-lg font-medium">Total de usuários: {usersCount}</p>
            <p className="text-md mt-2">Superadmins: {superAdminsCount}</p>
            <p className="text-sm text-muted-foreground mt-4">
              Esta página foi simplificada temporariamente para resolver problemas técnicos.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 