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
      <AdminHeader title="Gerenciar Dashboards" />
      <div className="bg-red-50 border border-red-200 p-4 rounded-md">
        <h2 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar dashboards</h2>
        <p className="text-red-700">{message}</p>
        <p className="mt-2 text-gray-700">
          Por favor, tente novamente mais tarde ou contate o suporte técnico se o problema persistir.
        </p>
      </div>
    </div>
  );
}

// Interface simples para garantir que todos os dados sejam serializáveis
interface SafeDashboard {
  id: string;
  name: string;
  description: string;
  url: string;
  isActive: boolean;
  createdAt: string;
  teamName: string;
}

export default async function AdminDashboardsPage() {
  try {
    // Proteção de rota - apenas superadmin
    const session = await requireSuperAdmin();

    // Buscar todos os dashboards com tratamento de erro
    let dashboards;
    try {
      dashboards = await db.dashboard.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          url: true,
          isActive: true,
          createdAt: true,
          team: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });
    } catch (dbError) {
      console.error("Erro ao buscar dashboards:", dbError);
      return <ErrorDisplay message="Não foi possível buscar a lista de dashboards do banco de dados." />;
    }

    // Verificar se os dados são válidos
    if (!Array.isArray(dashboards)) {
      console.error("Resposta inesperada da busca de dashboards:", dashboards);
      return <ErrorDisplay message="Formato de dados inválido retornado pelo banco de dados." />;
    }

    // Criar um array de objetos simples e serializáveis
    const safeDashboards: SafeDashboard[] = dashboards.map(dashboard => {
      try {
        // Converter data para string de forma segura
        let formattedDate = "N/A";
        if (dashboard.createdAt) {
          try {
            formattedDate = new Date(dashboard.createdAt).toLocaleDateString('pt-BR');
          } catch {
            formattedDate = "Data inválida";
          }
        }
        
        // Certificar que todos os valores são primitivos e serializáveis
        return {
          id: String(dashboard.id || ""),
          name: String(dashboard.name || "Sem nome"),
          description: String(dashboard.description || "Sem descrição"),
          url: String(dashboard.url || ""),
          isActive: Boolean(dashboard.isActive),
          createdAt: formattedDate,
          teamName: String(dashboard.team?.name || "Sem time")
        };
      } catch (formatError) {
        console.error("Erro ao formatar dados do dashboard:", formatError, dashboard);
        return {
          id: String(dashboard.id || "erro-id"),
          name: "Erro ao formatar dados",
          description: "Erro ao formatar dados",
          url: "",
          isActive: false,
          createdAt: "Erro de formato",
          teamName: "Erro ao formatar dados"
        };
      }
    });

    return (
      <div className="flex flex-col gap-6">
        <AdminHeader title="Gerenciar Dashboards" />
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Dashboards</CardTitle>
              <CardDescription>Lista de todos os dashboards no sistema.</CardDescription>
            </CardHeader>
            <CardContent>
              {safeDashboards.length === 0 ? (
                <p className="text-muted-foreground">Nenhum dashboard encontrado.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Nome</th>
                        <th className="text-left p-2">Time</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">URL</th>
                        <th className="text-left p-2">Criado em</th>
                      </tr>
                    </thead>
                    <tbody>
                      {safeDashboards.map((dashboard) => (
                        <tr key={dashboard.id} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium">{dashboard.name}</td>
                          <td className="p-2">{dashboard.teamName}</td>
                          <td className="p-2">
                            {dashboard.isActive ? (
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
                            {dashboard.url ? (
                              <a 
                                href={dashboard.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {dashboard.url.length > 30 ? dashboard.url.substring(0, 30) + '...' : dashboard.url}
                              </a>
                            ) : (
                              <span className="text-gray-500">Sem URL</span>
                            )}
                          </td>
                          <td className="p-2">{dashboard.createdAt}</td>
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
    console.error("Erro não tratado na página de dashboards:", error);
    return <ErrorDisplay message="Ocorreu um erro inesperado ao carregar a página." />;
  }
} 