import { redirect } from "next/navigation";

import { requireSuperAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Interface para tipar os times
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

export default async function AdminTeamsPage() {
  // Proteção de rota - apenas superadmin
  const session = await requireSuperAdmin();

  // Buscar todos os times
  const teams = await db.team.findMany({
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
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader title="Gerenciamento de Times" />
      
      <Card>
        <CardHeader>
          <CardTitle>Times Cadastrados</CardTitle>
          <CardDescription>Gerenciamento de todos os times da plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teams.map((team: TeamWithDetails) => (
              <div key={team.id} className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <h3 className="font-medium">{team.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Criado por {team.owner.name || team.owner.email}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span>{team._count.members} membros</span>
                  <span>{team._count.dashboards} dashboards</span>
                </div>
              </div>
            ))}

            {teams.length === 0 && (
              <p className="text-muted-foreground">Nenhum time cadastrado ainda.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 