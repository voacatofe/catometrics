import { redirect } from "next/navigation";
import { ClipboardList, Search, Filter, RefreshCcw } from "lucide-react";

import { requireSuperAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Interface para logs de auditoria
interface AuditLogWithUser {
  id: string;
  userId: string;
  user: {
    name: string | null;
    email: string | null;
  };
  action: string;
  entityType: string;
  entityId: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: Date;
}

// Função para formatar a ação em formato legível
function formatAction(action: string): string {
  // Map das ações para descrições legíveis em português
  const actionMap: Record<string, string> = {
    login: "Login",
    logout: "Logout",
    create_team: "Criação de Time",
    update_team: "Atualização de Time",
    delete_team: "Exclusão de Time",
    invite_user: "Convite de Usuário",
    accept_invitation: "Aceitação de Convite",
    reject_invitation: "Rejeição de Convite",
    add_dashboard: "Adição de Dashboard",
    update_dashboard: "Atualização de Dashboard",
    delete_dashboard: "Exclusão de Dashboard",
    user_role_change: "Alteração de Papel de Usuário",
  };

  return actionMap[action] || action;
}

// Componente de tabela simplificado
function DataTable({ columns, data, emptyMessage }: any) {
  if (data.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">{emptyMessage}</div>;
  }

  return (
    <div className="border rounded-md overflow-x-auto">
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

// Componente para filtros
function LogFilters() {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar nos logs..."
          className="w-full border rounded-md py-2 pl-9 pr-4 text-sm"
        />
      </div>
      <select className="border rounded-md py-2 px-3 text-sm">
        <option value="">Todas as ações</option>
        <option value="login">Login</option>
        <option value="create_team">Criação de Time</option>
        <option value="update_team">Atualização de Time</option>
        <option value="delete_team">Exclusão de Time</option>
        <option value="user_role_change">Alteração de Papel</option>
        {/* Outras ações */}
      </select>
      <Button size="sm" variant="outline" className="gap-1">
        <RefreshCcw className="h-4 w-4" /> Atualizar
      </Button>
    </div>
  );
}

export default async function AuditLogsPage() {
  // Proteção de rota - apenas superadmin
  const session = await requireSuperAdmin();

  // Buscar logs de auditoria
  const auditLogs = await db.auditLog.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100, // Limitar a quantidade para melhor desempenho
  });

  // Definir colunas da tabela
  const columns = [
    {
      accessorKey: "createdAt",
      header: "Data/Hora",
      cell: ({ row }: any) => {
        const date = new Date(row.original.createdAt);
        return (
          <div className="whitespace-nowrap">
            {date.toLocaleDateString('pt-BR')}
            <div className="text-xs text-muted-foreground">
              {date.toLocaleTimeString('pt-BR')}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "user",
      header: "Usuário",
      cell: ({ row }: any) => (
        <div>
          {row.original.user?.name || row.original.user?.email || "Usuário Desconhecido"}
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "Ação",
      cell: ({ row }: any) => (
        <Badge variant="outline" className="font-normal">
          {formatAction(row.original.action)}
        </Badge>
      ),
    },
    {
      accessorKey: "entityType",
      header: "Entidade",
      cell: ({ row }: any) => (
        <div className="capitalize">
          {row.original.entityType}
          {row.original.entityId && (
            <span className="text-xs text-muted-foreground block truncate max-w-[150px]">
              ID: {row.original.entityId}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "details",
      header: "Detalhes",
      cell: ({ row }: any) => {
        if (!row.original.details) return null;
        
        let details;
        try {
          details = JSON.parse(row.original.details);
        } catch (e) {
          details = row.original.details;
        }
        
        return (
          <div className="text-xs max-w-[200px] truncate">
            {typeof details === 'object' 
              ? JSON.stringify(details)
              : details}
          </div>
        );
      },
    },
    {
      accessorKey: "ipAddress",
      header: "IP",
      cell: ({ row }: any) => row.original.ipAddress || "—",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader title="Logs de Auditoria" />
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Registro de Atividades
          </CardTitle>
          <CardDescription>
            Visualize todas as ações realizadas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LogFilters />
          
          <DataTable
            columns={columns}
            data={auditLogs}
            emptyMessage="Nenhum log de auditoria encontrado."
          />
          
          {auditLogs.length === 100 && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Mostrando os 100 registros mais recentes. Use os filtros para buscar registros específicos.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 