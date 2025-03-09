import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from '@/lib/db';
import UserTable from './components/user-table';
import UserTableSkeleton from './components/user-table-skeleton';

// Manter as diretivas para garantir comportamento correto
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// Função para buscar usuários de forma segura no servidor
async function getUsers() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isSuperAdmin: true,
        isActive: true,
        createdAt: true,
        lastLogin: true,
      },
      orderBy: {
        name: 'asc',
      },
      take: 100,
    });

    // Transformar datas em strings para serialização segura
    return users.map(user => ({
      id: user.id,
      name: user.name || 'Sem nome',
      email: user.email || '',
      isSuperAdmin: Boolean(user.isSuperAdmin),
      isActive: Boolean(user.isActive),
      createdAt: user.createdAt ? user.createdAt.toISOString() : null,
      lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null,
    }));
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return [];
  }
}

export default async function AdminUsersPage() {
  // Verificar autenticação no servidor
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }
  
  // Verificar se é superadmin
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { isSuperAdmin: true }
  });
  
  if (!user?.isSuperAdmin) {
    redirect('/dashboard');
  }
  
  // Buscar dados iniciais (executado no servidor)
  const users = await getUsers();
  
  return (
    <div className="flex flex-col gap-6">
      <AdminHeader title="Gerenciar Usuários" />
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Usuários</CardTitle>
            <CardDescription>Lista de todos os usuários no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Usar Suspense para melhorar a experiência de carregamento */}
            <Suspense fallback={<UserTableSkeleton />}>
              {/* Passar os dados do servidor para um componente cliente interativo */}
              <UserTable initialUsers={users} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 