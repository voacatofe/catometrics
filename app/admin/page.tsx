"use client";

import { Users, PieChart, Settings, ShieldAlert } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);

  // Simular carregamento
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <AdminHeader title="Painel Administrativo" />
        <div className="p-4 text-center">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader title="Painel Administrativo" />
      
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
        <h3 className="text-blue-800 font-semibold mb-2">Modo Cliente</h3>
        <p className="text-blue-700">
          Este painel agora é renderizado inteiramente no cliente para evitar problemas de serialização.
          Todas as páginas administrativas foram simplificadas.
        </p>
      </div>
      
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
} 