import { redirect } from "next/navigation";

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
      <AdminHeader title="Gerenciar Times" />
      <div className="bg-red-50 border border-red-200 p-4 rounded-md">
        <h2 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar times</h2>
        <p className="text-red-700">{message}</p>
        <p className="mt-2 text-gray-700">
          Por favor, tente novamente mais tarde ou contate o suporte técnico se o problema persistir.
        </p>
      </div>
    </div>
  );
}

export default async function AdminTeamsPage() {
  try {
    // Proteção de rota - apenas superadmin
    const session = await requireSuperAdmin();
    
    // Buscar todos os times com tratamento de erro
    let teams;
    try {
      teams = await db.team.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          _count: {
            select: {
              members: true,
              dashboards: true
            }
          },
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          name: "asc"
        }
      });
    } catch (dbError) {
      console.error("Erro ao buscar times:", dbError);
      return <ErrorDisplay message="Não foi possível buscar a lista de times do banco de dados." />;
    }
    
    // Verificar se os dados são válidos
    if (!Array.isArray(teams)) {
      console.error("Resposta inesperada da busca de times:", teams);
      return <ErrorDisplay message="Formato de dados inválido retornado pelo banco de dados." />;
    }
    
    // Preparar dados para renderização
    const safeTeams = teams.map(team => {
      try {
        const createdAtFormatted = team.createdAt 
          ? new Date(team.createdAt).toLocaleDateString('pt-BR') 
          : "N/A";
        
        return {
          id: team.id,
          name: team.name,
          description: team.description || "Sem descrição",
          memberCount: team._count.members,
          dashboardCount: team._count.dashboards,
          owner: {
            name: team.owner?.name || "Sem proprietário",
            email: team.owner?.email || ""
          },
          createdAt: createdAtFormatted
        };
      } catch (formatError) {
        console.error("Erro ao formatar dados do time:", formatError, team);
        return {
          id: team.id,
          name: team.name || "Nome não disponível",
          description: "Erro ao formatar dados",
          memberCount: 0,
          dashboardCount: 0,
          owner: {
            name: "Erro ao formatar dados",
            email: ""
          },
          createdAt: "Erro de formato"
        };
      }
    });
    
    return (
      <div className="flex flex-col gap-6">
        <AdminHeader title="Gerenciar Times" />
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Times</CardTitle>
              <CardDescription>Lista de todos os times no sistema.</CardDescription>
            </CardHeader>
            <CardContent>
              {safeTeams.length === 0 ? (
                <p className="text-muted-foreground">Nenhum time encontrado.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Nome</th>
                        <th className="text-left p-2">Descrição</th>
                        <th className="text-left p-2">Membros</th>
                        <th className="text-left p-2">Dashboards</th>
                        <th className="text-left p-2">Proprietário</th>
                        <th className="text-left p-2">Criado em</th>
                      </tr>
                    </thead>
                    <tbody>
                      {safeTeams.map((team) => (
                        <tr key={team.id} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium">{team.name}</td>
                          <td className="p-2">{team.description}</td>
                          <td className="p-2">{team.memberCount}</td>
                          <td className="p-2">{team.dashboardCount}</td>
                          <td className="p-2">{team.owner.name}</td>
                          <td className="p-2">{team.createdAt}</td>
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
    console.error("Erro não tratado na página de times:", error);
    return <ErrorDisplay message="Ocorreu um erro inesperado ao carregar a página." />;
  }
} 