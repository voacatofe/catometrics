import { redirect } from "next/navigation";
import { UserCog, Check, X, Shield } from "lucide-react";

import { requireSuperAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Tipagem para usuários com superadmin
interface UserWithSuperAdmin {
  id: string;
  name: string | null;
  email: string | null;
  isSuperAdmin: boolean;
  lastLogin: Date | null;
  isActive: boolean;
  createdAt: Date;
}

// Componente de tabela simplificado para evitar dependências extras
function DataTable({ columns, data, emptyMessage }: any) {
  if (data.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">{emptyMessage}</div>;
  }

  return (
    <div className="border rounded-md">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            {columns.map((column: any) => (
              <th key={column.accessorKey || column.id} className="px-4 py-3 text-left text-sm font-medium">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row: any, index: number) => (
            <tr key={row.id} className={index !== data.length - 1 ? "border-b" : ""}>
              {columns.map((column: any) => (
                <td key={column.accessorKey || column.id} className="px-4 py-3 text-sm">
                  {column.cell ? column.cell({ row: { original: row } }) : row[column.accessorKey]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Componente de diálogo para adicionar superadmin
function AddSuperAdminDialog({ regularUsers }: { regularUsers: { id: string, name: string | null, email: string | null }[] }) {
  return (
    <form action="/api/admin/superadmins/add" method="POST" className="flex items-center gap-2">
      <select name="userId" className="border rounded px-3 py-2 text-sm">
        <option value="">Selecione um usuário</option>
        {regularUsers.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name || user.email}
          </option>
        ))}
      </select>
      <Button type="submit" size="sm">
        Adicionar Superadmin
      </Button>
    </form>
  );
}

export default async function SuperAdminManagementPage() {
  // Proteção de rota - apenas superadmin pode acessar
  const session = await requireSuperAdmin();

  // Buscar todos os usuários com privilégios de superadmin
  const superAdmins = await db.user.findMany({
    where: {
      isSuperAdmin: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      isSuperAdmin: true,
      lastLogin: true,
      isActive: true,
      createdAt: true,
    },
  });

  // Buscar usuários que não são superadmins para permitir promoção
  const regularUsers = await db.user.findMany({
    where: {
      isSuperAdmin: false,
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    take: 100, // Limitar a quantidade para não sobrecarregar
  });

  // Definir as colunas da tabela
  const columns = [
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }: any) => (
        <div>
          {row.original.name || 'Sem nome'}
          <div className="text-xs text-muted-foreground">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }: any) => (
        <div className="flex items-center">
          {row.original.isActive ? (
            <Badge className="flex items-center gap-1 bg-green-500">
              <Check className="h-3 w-3" /> Ativo
            </Badge>
          ) : (
            <Badge variant="destructive" className="flex items-center gap-1">
              <X className="h-3 w-3" /> Inativo
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "lastLogin",
      header: "Último Login",
      cell: ({ row }: any) => (
        <div>
          {row.original.lastLogin 
            ? new Date(row.original.lastLogin).toLocaleDateString('pt-BR')
            : 'Nunca'}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Data de Criação",
      cell: ({ row }: any) => (
        <div>
          {new Date(row.original.createdAt).toLocaleDateString('pt-BR')}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <form action={`/api/admin/superadmins/${row.original.id}/revoke`} method="POST">
            <Button 
              variant="destructive" 
              size="sm"
              type="submit"
              disabled={row.original.id === session.user.id} // Não permitir revogar a si mesmo
              title={row.original.id === session.user.id ? "Você não pode revogar seu próprio acesso" : "Revogar acesso de superadmin"}
            >
              Revogar
            </Button>
          </form>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader title="Gerenciar Superadmins" />
      
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium">Superadministradores</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie usuários com privilégios de superadmin no sistema
          </p>
        </div>
        
        <AddSuperAdminDialog regularUsers={regularUsers} />
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Superadministradores ({superAdmins.length})
          </CardTitle>
          <CardDescription>
            Usuários com acesso total ao sistema e todas as funcionalidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={superAdmins} 
            emptyMessage="Nenhum superadministrador encontrado."
          />
        </CardContent>
      </Card>
    </div>
  );
} 