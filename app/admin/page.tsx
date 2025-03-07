import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSuperAdmin } from "@/lib/auth";

export default async function AdminDashboardPage() {
  try {
    // Proteção de rota - apenas superadmin
    const session = await requireSuperAdmin();
    
    // Versão extremamente simples da página
    return (
      <div className="flex flex-col gap-6">
        <AdminHeader title="Painel Administrativo" />
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Visão Geral</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">CatoMetrics</div>
              <p className="text-xs text-muted-foreground mt-2">
                Painel administrativo simplificado para evitar erros de execução.
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Status do Sistema</CardTitle>
              <CardDescription>Informações básicas sobre o sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-md">
                  <h3 className="font-medium">Usuário</h3>
                  <p className="text-sm mt-1">
                    Logado como: {session.user.name || session.user.email}
                  </p>
                  <p className="text-sm text-green-600 mt-2">
                    ✓ Acesso de superadmin verificado
                  </p>
                </div>
                
                <div className="p-4 border rounded-md">
                  <h3 className="font-medium">Ambiente</h3>
                  <p className="text-sm mt-1">
                    NODE_ENV: {process.env.NODE_ENV || 'development'}
                  </p>
                  <p className="text-sm mt-1">
                    Next.js: 14.0.3
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Erro na página admin:", error);
    // Retornar uma página extremamente simples em caso de erro
    return (
      <div className="p-8">
        <h1 className="text-xl font-bold mb-4">Painel Administrativo</h1>
        <p>Ocorreu um erro ao carregar o painel. Por favor, tente novamente mais tarde.</p>
      </div>
    );
  }
} 