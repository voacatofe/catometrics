import { requireSuperAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Adicionar diretiva de renderização dinâmica
export const dynamic = 'force-dynamic';

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

export default async function AdminUsersPage() {
  try {
    // Proteção de rota - apenas superadmin
    const session = await requireSuperAdmin();
    
    // Buscar todos os usuários com tratamento de erro
    let users;
    try {
      users = await db.user.findMany({
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
    } catch (dbError) {
      console.error("Erro ao buscar usuários:", dbError);
      return <ErrorDisplay message="Não foi possível buscar a lista de usuários do banco de dados." />;
    }

    // Verificar se os dados são válidos antes de processá-los
    if (!Array.isArray(users)) {
      console.error("Resposta inesperada da busca de usuários:", users);
      return <ErrorDisplay message="Formato de dados inválido retornado pelo banco de dados." />;
    }

    // Preparar dados seguros para renderização, garantindo que todos os valores sejam serializáveis
    const safeUsers = users.map(user => {
      try {
        const createdAtFormatted = user.createdAt 
          ? new Date(user.createdAt).toLocaleDateString('pt-BR') 
          : "Nunca";
        
        const lastLoginFormatted = user.lastLogin 
          ? new Date(user.lastLogin).toLocaleDateString('pt-BR') 
          : "Nunca";
        
        return {
          id: user.id || "ID não disponível",
          name: user.name || "Sem nome",
          email: user.email || "",
          isSuperAdmin: Boolean(user.isSuperAdmin),
          isActive: Boolean(user.isActive),
          createdAt: createdAtFormatted,
          lastLogin: lastLoginFormatted,
        };
      } catch (formatError) {
        console.error("Erro ao formatar dados do usuário:", formatError, user);
        // Retornar versão simplificada do usuário em caso de erro
        return {
          id: user.id || "ID não disponível",
          name: user.name || "Sem nome",
          email: user.email || "",
          isSuperAdmin: Boolean(user.isSuperAdmin),
          isActive: Boolean(user.isActive),
          createdAt: "Erro de formato",
          lastLogin: "Erro de formato",
        };
      }
    });

    // Renderizar a interface
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
  } catch (error) {
    console.error("Erro não tratado na página de usuários:", error);
    return <ErrorDisplay message="Ocorreu um erro inesperado ao carregar a página." />;
  }
} 