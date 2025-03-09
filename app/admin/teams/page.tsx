import { redirect } from "next/navigation";

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

// Interface simplificada ao extremo
interface SafeTeam {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  dashboardCount: number;
  ownerName: string;
  createdAt: string;
}

export default async function AdminTeamsPage() {
  try {
    // Proteção de rota - apenas superadmin
    await requireSuperAdmin();
    
    // Implementação segura e simplificada
    try {
      // Apenas dados mínimos necessários
      const rawTeams = await db.team.findMany({
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
              name: true
            }
          }
        },
        take: 20, // Limite de resultados para evitar problemas
        orderBy: {
          name: "asc"
        }
      });
      
      // Converter através de JSON para garantir que apenas valores primitivos são mantidos
      // Esta é uma técnica extrema, mas eficaz para eliminar qualquer objeto não serializável
      const jsonSafe = JSON.stringify(rawTeams);
      const parsedTeams = JSON.parse(jsonSafe);
      
      // Transformar em objetos simples e planos
      const safeTeams: SafeTeam[] = parsedTeams.map((team: any) => {
        return {
          id: String(team.id || ""),
          name: String(team.name || "Sem nome"),
          description: String(team.description || "Sem descrição"),
          memberCount: Number(team._count?.members || 0),
          dashboardCount: Number(team._count?.dashboards || 0),
          ownerName: String(team.owner?.name || "Sem proprietário"),
          createdAt: team.createdAt ? new Date(team.createdAt).toLocaleDateString('pt-BR') : "Data indisponível"
        };
      });
      
      // Renderizar interface básica
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
    } catch (dbError: any) {
      console.error("[ERRO CRÍTICO] Falha ao processar times:", dbError);
      return <ErrorDisplay message={`Erro ao processar os dados: ${dbError.message || 'Erro desconhecido'}`} />;
    }
  } catch (error: any) {
    console.error("[ERRO GLOBAL] Falha de autorização:", error);
    return <ErrorDisplay message={`Erro de acesso: ${error.message || 'Acesso não autorizado'}`} />;
  }
} 