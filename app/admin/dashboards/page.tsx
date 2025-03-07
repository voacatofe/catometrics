import { requireSuperAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Adicionar diretiva de renderização dinâmica
export const dynamic = 'force-dynamic';

// Interface para tipar os dashboards
interface DashboardWithTeam {
  id: string;
  name: string;
  description: string | null;
  url: string;
  isActive: boolean;
  createdAt: Date | string | null;
  team: {
    name: string;
  };
}

export default async function AdminDashboardsPage() {
  // Proteção de rota - apenas superadmin
  const session = await requireSuperAdmin();

  // Buscar todos os dashboards
  const dashboards = await db.dashboard.findMany({
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

  // Preparar dados seguros para renderização, garantindo que todas as propriedades sejam serializáveis
  const safeDashboards = dashboards.map(dashboard => {
    // Converter a data para string se ela existir, ou usar "N/A" se não existir
    const formattedDate = dashboard.createdAt 
      ? new Date(dashboard.createdAt).toLocaleDateString('pt-BR') 
      : "N/A";
    
    // Certificar que todos os valores são serializáveis
    return {
      id: dashboard.id,
      name: dashboard.name || "",
      description: dashboard.description || null,
      url: dashboard.url || "",
      isActive: Boolean(dashboard.isActive),
      createdAt: formattedDate,
      team: {
        name: dashboard.team?.name || "Sem time"
      }
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader title="Gerenciamento de Dashboards" />
      
      <Card>
        <CardHeader>
          <CardTitle>Dashboards Cadastrados</CardTitle>
          <CardDescription>Gerenciamento de todos os dashboards da plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {safeDashboards.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data de Criação
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {safeDashboards.map((dashboard) => (
                      <tr key={dashboard.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{dashboard.name}</div>
                          {dashboard.description && (
                            <div className="text-sm text-gray-500">{dashboard.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{dashboard.team.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {dashboard.isActive ? (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              Ativo
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                              Inativo
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {dashboard.createdAt}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <a 
                            href={dashboard.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Visualizar
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-4 text-gray-500">Nenhum dashboard cadastrado ainda.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 