import { requireSuperAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Interface para tipar os usuários
interface UserWithDetails {
  id: string;
  name: string | null;
  email: string | null;
  isSuperAdmin: boolean;
  isActive: boolean;
  createdAt: Date;
  lastLogin: Date | null;
}

export default async function AdminUsersPage() {
  // Proteção de rota - apenas superadmin
  const session = await requireSuperAdmin();

  // Buscar todos os usuários
  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      isSuperAdmin: true,
      isActive: true,
      createdAt: true,
      lastLogin: true,
    },
    orderBy: {
      createdAt: "desc",
    },
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
          <div className="space-y-4">
            {users.map((user: UserWithDetails) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <h3 className="font-medium">{user.name || user.email}</h3>
                  <p className="text-sm text-muted-foreground">
                    {user.email}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  {user.isSuperAdmin && (
                    <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">
                      Superadmin
                    </span>
                  )}
                  {!user.isActive && (
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                      Inativo
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    Criado em: {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}

            {users.length === 0 && (
              <p className="text-muted-foreground">Nenhum usuário cadastrado ainda.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 