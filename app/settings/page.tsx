import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
  // Proteção de rota - usuário autenticado
  const session = await requireAuth();

  // Obter detalhes do usuário atual
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      isSuperAdmin: true,
      lastLogin: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Configurações da Conta</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Detalhes da sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Nome:</h3>
              <p>{user.name}</p>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Email:</h3>
              <p>{user.email}</p>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Tipo de Conta:</h3>
              <p>{user.isSuperAdmin ? 'Superadministrador' : 'Usuário'}</p>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Último login:</h3>
              <p>{user.lastLogin ? new Date(user.lastLogin).toLocaleString('pt-BR') : 'N/A'}</p>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Conta criada em:</h3>
              <p>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-sm text-muted-foreground mt-4">
        <p>
          Precisa de ajuda? Entre em contato com o administrador do sistema.
        </p>
      </div>
    </div>
  );
} 