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

// Interface simples para garantir que todos os dados sejam serializáveis
interface SafeTeam {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  dashboardCount: number;
  ownerName: string;
  ownerEmail: string;
  createdAt: string;
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
    
    // Criar um array de objetos simples e serializáveis
    const safeTeams: SafeTeam[] = teams.map(team => {
      try {
        // Converter data para string
        let createdAtStr = "N/A";
        if (team.createdAt) {
          try {
            createdAtStr = new Date(team.createdAt).toLocaleDateString('pt-BR');
          } catch {
            createdAtStr = "Data inválida";
          }
        }
        
        // Retornar um objeto simples com tipos primitivos
        return {
          id: String(team.id || ""),
          name: String(team.name || "Nome não disponível"),
          description: String(team.description || "Sem descrição"),
          memberCount: Number(team._count?.members || 0),
          dashboardCount: Number(team._count?.dashboards || 0),
          ownerName: String(team.owner?.name || "Sem proprietário"),
          ownerEmail: String(team.owner?.email || ""),
          createdAt: createdAtStr
        };
      } catch (formatError) {
        console.error("Erro ao formatar dados do time:", formatError, team);
        // Retornar um objeto com valores padrão em caso de erro
        return {
          id: String(team.id || "erro-id"),
          name: "Erro ao formatar dados",
          description: "Erro ao formatar dados",
          memberCount: 0,
          dashboardCount: 0,
          ownerName: "Erro ao formatar dados",
          ownerEmail: "",
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
                          <td className="p-2">{team.ownerName}</td>
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