'use server';

import { getServerSession } from 'next-auth/next';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';

// Verificar autorização para todas as ações
async function validateSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error('Usuário não autenticado');
  }
  
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { isSuperAdmin: true }
  });
  
  if (!user?.isSuperAdmin) {
    throw new Error('Acesso negado - Apenas superadmins podem realizar esta ação');
  }
  
  return session.user;
}

// Alternar status (ativo/inativo) de um usuário
export async function toggleUserStatus(userId: string, newStatus: boolean) {
  await validateSuperAdmin();
  
  try {
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { isActive: newStatus }
    });
    
    // Registrar ação e revalidar paths
    console.log(`Status do usuário ${userId} alterado para ${newStatus ? 'ativo' : 'inativo'}`);
    revalidatePath('/admin/users');
    
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('Erro ao alternar status do usuário:', error);
    throw new Error('Falha ao atualizar o status do usuário');
  }
}

// Excluir um usuário
export async function deleteUser(userId: string) {
  await validateSuperAdmin();
  
  try {
    // Verificar se não está excluindo o próprio usuário
    const session = await getServerSession(authOptions);
    if (userId === session?.user.id) {
      throw new Error('Você não pode excluir seu próprio usuário');
    }
    
    await db.user.delete({
      where: { id: userId }
    });
    
    // Registrar ação e revalidar paths
    console.log(`Usuário ${userId} excluído`);
    revalidatePath('/admin/users');
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    throw new Error('Falha ao excluir o usuário');
  }
}

// Atualizar um usuário
export async function updateUser(userId: string, data: {
  name?: string;
  email?: string;
  isSuperAdmin?: boolean;
  isActive?: boolean;
}) {
  await validateSuperAdmin();
  
  try {
    const updatedUser = await db.user.update({
      where: { id: userId },
      data
    });
    
    // Registrar ação e revalidar paths
    console.log(`Usuário ${userId} atualizado`, data);
    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${userId}`);
    
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw new Error('Falha ao atualizar o usuário');
  }
} 