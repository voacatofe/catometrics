import { requireSuperAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Diretiva para forçar renderização no servidor
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// Componente para lidar com erros
function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="flex flex-col gap-6">
      <AdminHeader title="Gerenciar Usuários" />
      <div className="bg-red-50 border border-red-200 p-4 rounded-md">
        <h2 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar usuários</h2>
        <p className="text-red-700">{message}</p>
        <p className="mt-2 text-gray-700">
          Por favor, tente novamente mais tarde ou contate o suporte técnico se o problema persistir.
        </p>
      </div>
    </div>
  );
}

// Interface simplificada ao extremo
interface SafeUser {
  id: string;
  name: string;
  email: string;
  isSuperAdmin: boolean;
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
}

export default async function AdminUsersPage() {
  try {
    // Proteção de rota - apenas superadmin
    await requireSuperAdmin();
    
    // Implementação segura e simplificada
    try {
      // Apenas dados mínimos necessários
      const rawUsers = await db.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          isSuperAdmin: true,
          isActive: true,
          createdAt: true,
          lastLogin: true,
        },
        take: 100, // Limite de resultados para evitar problemas
        orderBy: {
          name: "asc",
        },
      });
      
      // Converter através de JSON para garantir que apenas valores primitivos são mantidos
      const jsonSafe = JSON.stringify(rawUsers);
      const parsedUsers = JSON.parse(jsonSafe);
      
      // Transformar em objetos simples e planos
      const safeUsers: SafeUser[] = parsedUsers.map((user: any) => {
        const createdAtStr = user.createdAt 
          ? new Date(user.createdAt).toLocaleDateString('pt-BR')
          : "Nunca";
          
        const lastLoginStr = user.lastLogin
          ? new Date(user.lastLogin).toLocaleDateString('pt-BR')
          : "Nunca";
          
        return {
          id: String(user.id || "ID não disponível"),
          name: String(user.name || "Sem nome"),
          email: String(user.email || ""),
          isSuperAdmin: Boolean(user.isSuperAdmin),
          isActive: Boolean(user.isActive),
          createdAt: createdAtStr,
          lastLogin: lastLoginStr,
        };
      });

      // Renderizar interface básica
      return (
        <div className="flex flex-col gap-6">
          <AdminHeader title="Gerenciar Usuários" />
          
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Usuários</CardTitle>
                <CardDescription>Lista de todos os usuários no sistema.</CardDescription>
              </CardHeader>
              <CardContent>
                {safeUsers.length === 0 ? (
                  <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Nome</th>
                          <th className="text-left p-2">Email</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">SuperAdmin</th>
                          <th className="text-left p-2">Criado em</th>
                          <th className="text-left p-2">Último login</th>
                        </tr>
                      </thead>
                      <tbody>
                        {safeUsers.map((user) => (
                          <tr key={user.id} className="border-b hover:bg-gray-50">
                            <td className="p-2">{user.name}</td>
                            <td className="p-2">{user.email}</td>
                            <td className="p-2">
                              {user.isActive ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Ativo
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Inativo
                                </span>
                              )}
                            </td>
                            <td className="p-2">
                              {user.isSuperAdmin ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  Sim
                                </span>
                              ) : (
                                <span className="text-gray-500">Não</span>
                              )}
                            </td>
                            <td className="p-2">{user.createdAt}</td>
                            <td className="p-2">{user.lastLogin}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      );
    } catch (dbError: any) {
      console.error("[ERRO CRÍTICO] Falha ao processar usuários:", dbError);
      return <ErrorDisplay message={`Erro ao processar os dados: ${dbError.message || 'Erro desconhecido'}`} />;
    }
  } catch (error: any) {
    console.error("[ERRO GLOBAL] Falha de autorização:", error);
    return <ErrorDisplay message={`Erro de acesso: ${error.message || 'Acesso não autorizado'}`} />;
  }
} 