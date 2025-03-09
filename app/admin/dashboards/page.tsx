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

// Interface simplificada ao extremo
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
    await requireSuperAdmin();

    // Implementação segura e simplificada
    try {
      // Apenas dados mínimos necessários
      const rawDashboards = await db.dashboard.findMany({
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
        take: 100, // Limite de resultados para evitar problemas
        orderBy: {
          name: "asc",
        },
      });
      
      // Converter através de JSON para garantir que apenas valores primitivos são mantidos
      const jsonSafe = JSON.stringify(rawDashboards);
      const parsedDashboards = JSON.parse(jsonSafe);
      
      // Transformar em objetos simples e planos
      const safeDashboards: SafeDashboard[] = parsedDashboards.map((dashboard: any) => {
        const formattedDate = dashboard.createdAt 
          ? new Date(dashboard.createdAt).toLocaleDateString('pt-BR')
          : "N/A";
          
        return {
          id: String(dashboard.id || ""),
          name: String(dashboard.name || "Sem nome"),
          description: String(dashboard.description || "Sem descrição"),
          url: String(dashboard.url || ""),
          isActive: Boolean(dashboard.isActive),
          createdAt: formattedDate,
          teamName: String(dashboard.team?.name || "Sem time")
        };
      });

      // Renderizar interface básica
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
    } catch (dbError: any) {
      console.error("[ERRO CRÍTICO] Falha ao processar dashboards:", dbError);
      return <ErrorDisplay message={`Erro ao processar os dados: ${dbError.message || 'Erro desconhecido'}`} />;
    }
  } catch (error: any) {
    console.error("[ERRO GLOBAL] Falha de autorização:", error);
    return <ErrorDisplay message={`Erro de acesso: ${error.message || 'Acesso não autorizado'}`} />;
  }
} 