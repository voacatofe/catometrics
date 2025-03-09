import { redirect } from "next/navigation";
import { Users, PieChart, Settings, ShieldAlert } from "lucide-react";

import { requireSuperAdmin } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminHeader } from "@/components/admin/AdminHeader";

// Diretiva para forçar renderização no servidor
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// Componente para lidar com erros
function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="flex flex-col gap-6">
      <AdminHeader title="Painel Administrativo" />
      <div className="bg-red-50 border border-red-200 p-4 rounded-md">
        <h2 className="text-lg font-semibold text-red-800 mb-2">Erro ao acessar painel administrativo</h2>
        <p className="text-red-700">{message}</p>
        <p className="mt-2 text-gray-700">
          Por favor, tente novamente mais tarde ou contate o suporte técnico se o problema persistir.
        </p>
      </div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  try {
    // Proteção de rota - apenas superadmin
    await requireSuperAdmin();
    
    // Versão extremamente simples da página
    return (
      <div className="flex flex-col gap-6">
        <AdminHeader title="Painel Administrativo" />
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Gerenciar Usuários</div>
              <p className="text-xs text-muted-foreground mt-2">
                Administração de contas de usuários.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Times</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Gerenciar Times</div>
              <p className="text-xs text-muted-foreground mt-2">
                Administração de times e grupos.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dashboards</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Gerenciar Dashboards</div>
              <p className="text-xs text-muted-foreground mt-2">
                Administração de painéis analíticos.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Configurações</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Configurações do Sistema</div>
              <p className="text-xs text-muted-foreground mt-2">
                Configurações gerais da plataforma.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error: any) {
    console.error("[ERRO GLOBAL] Falha de autorização:", error);
    return <ErrorDisplay message={`Erro de acesso: ${error.message || 'Acesso não autorizado'}`} />;
  }
} 