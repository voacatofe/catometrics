"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash, UserX, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteUser, toggleUserStatus } from '../actions';

// Definir tipos para os usuários
interface User {
  id: string;
  name: string | null;
  email: string | null;
  isSuperAdmin: boolean;
  isActive: boolean;
  createdAt: string | null;
  lastLogin: string | null;
}

interface UserTableProps {
  initialUsers: User[];
}

export default function UserTable({ initialUsers }: UserTableProps) {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  
  // Formatar data para exibição
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (e) {
      return 'Data inválida';
    }
  };
  
  // Função para alternar status do usuário
  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    setIsLoading(prev => ({ ...prev, [userId]: true }));
    try {
      await toggleUserStatus(userId, !currentStatus);
      // Atualizar estado local
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, isActive: !currentStatus } 
          : user
      ));
      // Atualizar a UI
      router.refresh();
    } catch (error) {
      console.error('Erro ao alternar status:', error);
      alert('Erro ao alterar status do usuário');
    } finally {
      setIsLoading(prev => ({ ...prev, [userId]: false }));
    }
  };
  
  // Função para excluir usuário
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    
    setIsLoading(prev => ({ ...prev, [userId]: true }));
    try {
      await deleteUser(userId);
      // Atualizar estado local
      setUsers(users.filter(user => user.id !== userId));
      // Atualizar a UI
      router.refresh();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      alert('Erro ao excluir usuário');
    } finally {
      setIsLoading(prev => ({ ...prev, [userId]: false }));
    }
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Nome</th>
            <th className="text-left p-2">Email</th>
            <th className="text-left p-2">Status</th>
            <th className="text-left p-2">Perfil</th>
            <th className="text-left p-2">Criado em</th>
            <th className="text-left p-2">Último login</th>
            <th className="text-left p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-4 text-center text-gray-500">
                Nenhum usuário encontrado
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="p-2 font-medium">{user.name || 'Sem nome'}</td>
                <td className="p-2">{user.email || 'Sem email'}</td>
                <td className="p-2">
                  {user.isActive ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Ativo
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Inativo
                    </span>
                  )}
                </td>
                <td className="p-2">
                  {user.isSuperAdmin ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      SuperAdmin
                    </span>
                  ) : (
                    <span className="text-gray-500">Usuário comum</span>
                  )}
                </td>
                <td className="p-2">{formatDate(user.createdAt)}</td>
                <td className="p-2">{formatDate(user.lastLogin)}</td>
                <td className="p-2">
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      title="Editar"
                      onClick={() => router.push(`/admin/users/${user.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      title={user.isActive ? "Desativar" : "Ativar"}
                      disabled={isLoading[user.id]}
                      onClick={() => handleToggleStatus(user.id, user.isActive)}
                    >
                      {user.isActive 
                        ? <UserX className="h-4 w-4 text-red-500" /> 
                        : <UserCheck className="h-4 w-4 text-green-500" />
                      }
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      title="Excluir"
                      disabled={isLoading[user.id]}
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
} 