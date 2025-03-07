import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { logUserAction, AUDIT_ACTIONS } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verificar autenticação
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  
  // Verificar se o usuário atual é superadmin
  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { isSuperAdmin: true }
  });
  
  if (!currentUser?.isSuperAdmin) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }
  
  const userId = params.id;
  
  // Não permitir revogar o próprio acesso
  if (userId === session.user.id) {
    return NextResponse.json(
      { error: "Você não pode revogar seu próprio acesso de superadmin" }, 
      { status: 400 }
    );
  }
  
  try {
    // Verificar se o usuário existe
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, isSuperAdmin: true }
    });
    
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }
    
    if (!user.isSuperAdmin) {
      return NextResponse.json({ error: "Usuário não é superadmin" }, { status: 400 });
    }
    
    // Atualizar o usuário para remover privilégios de superadmin
    await db.user.update({
      where: { id: userId },
      data: { isSuperAdmin: false }
    });
    
    // Registrar a ação no audit log
    await logUserAction({
      userId: session.user.id,
      action: AUDIT_ACTIONS.USER_ROLE_CHANGE,
      entityType: "user",
      entityId: userId,
      details: { 
        changedFrom: "SUPERADMIN",
        changedTo: "REGULAR",
        targetUser: user.email || user.name
      }
    });
    
    // Em vez de redirecionar diretamente, enviamos uma resposta para o cliente fazer o redirecionamento
    return NextResponse.json({ 
      success: true, 
      redirectTo: "/admin/superadmins" 
    });
  } catch (error) {
    console.error("Erro ao revogar superadmin:", error);
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 });
  }
} 