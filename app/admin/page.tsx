import { redirect } from "next/navigation";
import { BarChart4, Users, Database, ActivityIcon } from "lucide-react";

import { requireSuperAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminHeader } from "@/components/admin/AdminHeader";

// Definindo a interface para o tipo Team retornado pela consulta
interface TeamWithDetails {
  id: string;
  name: string;
  owner: {
    name: string | null;
    email: string | null;
  };
  _count: {
    members: number;
    dashboards: number;
  };
}

export default async function AdminDashboardPage() {
  // Proteção de rota - apenas superadmin
  const session = await requireSuperAdmin();

  // Buscar estatísticas
  const [teamsCount, usersCount, dashboardsCount] = await Promise.all([
    db.team.count(),
    db.user.count(),
    db.dashboard.count(),
  ]);
  
  // Buscar times recentes
  const recentTeams = await db.team.findMany({
    include: {
      owner: {
        select: {
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          members: true,
          dashboards: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader title="Painel Administrativo" />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Times</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{teamsCount}</div>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{usersCount}</div>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Dashboards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{dashboardsCount}</div>
              <BarChart4 className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Times Recentes</CardTitle>
            <CardDescription>Os últimos times criados na plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTeams.map((team: TeamWithDetails) => (
                <div key={team.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">{team.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Criado por {team.owner.name || team.owner.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Users className="mr-1 h-4 w-4" />
                      {team._count.members}
                    </div>
                    <div className="flex items-center">
                      <BarChart4 className="mr-1 h-4 w-4" />
                      {team._count.dashboards}
                    </div>
                  </div>
                </div>
              ))}
              
              {recentTeams.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum time criado ainda.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 