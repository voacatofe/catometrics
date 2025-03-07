import { requireSuperAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Interface para tipar os dashboards
interface DashboardWithTeam {
  id: string;
  name: string;
  description: string | null;
  url: string;
  isActive: boolean;
  createdAt: Date;
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
      createdAt: "desc",
    },
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
            {dashboards.map((dashboard: DashboardWithTeam) => (
              <div key={dashboard.id} className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <h3 className="font-medium">{dashboard.name}</h3>
                  {dashboard.description && (
                    <p className="text-sm text-muted-foreground">
                      {dashboard.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Time: {dashboard.team.name}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  {!dashboard.isActive && (
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                      Inativo
                    </span>
                  )}
                  <a 
                    href={dashboard.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Visualizar
                  </a>
                </div>
              </div>
            ))}

            {dashboards.length === 0 && (
              <p className="text-muted-foreground">Nenhum dashboard cadastrado ainda.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 