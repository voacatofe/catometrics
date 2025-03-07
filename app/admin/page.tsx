import { redirect } from "next/navigation";
import { BarChart4, Users, Database, ActivityIcon } from "lucide-react";

import { requireSuperAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default async function AdminDashboardPage() {
  // Proteção de rota - apenas superadmin
  const session = await requireSuperAdmin();

  // Buscar estatísticas
  const [teamsCount, usersCount, dashboardsCount] = await Promise.all([
    db.team.count(),
    db.user.count(),
    db.dashboard.count(),
  ]);
  
  // Valor temporário enquanto configuramos os logs de atividade
  const activityLogsCount = 0;
  
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
  
  // Dados simulados para atividades recentes
  const recentActivities = [
    {
      id: "1",
      action: "login",
      createdAt: new Date(),
      user: { name: "Admin", email: "admin@catometrics.com.br" }
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader title="Painel Administrativo" />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Atividades Registradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{activityLogsCount}</div>
              <ActivityIcon className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Times Recentes</CardTitle>
            <CardDescription>Os últimos times criados na plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTeams.map((team) => (
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
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>Últimas ações registradas no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-medium capitalize">{activity.action.replace('_', ' ')}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.user?.name || activity.user?.email || 'Usuário deletado'}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(activity.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 