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
  createdAt: Date | string | null;
  lastLogin: Date | string | null;
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
      name: "asc",
    },
  });

  // Função simples para formatar data
  const formatDate = (date: Date | null): string => {
    if (!date) return "Nunca";
    
    try {
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return "Data inválida";
    }
  };

  // Preparar dados seguros para renderização
  const safeUsers = users.map(user => ({
    ...user,
    createdAt: formatDate(user.createdAt),
    lastLogin: formatDate(user.lastLogin)
  }));

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
            {safeUsers.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuário
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Último Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data de Criação
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {safeUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.name || 'Sem nome'}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.isActive ? (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              Ativo
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                              Inativo
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.isSuperAdmin ? (
                            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                              Super Admin
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              Usuário
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.lastLogin}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.createdAt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-4 text-gray-500">Nenhum usuário cadastrado ainda.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 