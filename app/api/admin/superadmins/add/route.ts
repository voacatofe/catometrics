import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { logUserAction, AUDIT_ACTIONS } from "@/lib/auth";

export async function POST(req: NextRequest) {
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
  
  try {
    // Obter dados do formulário
    const formData = await req.formData();
    const userId = formData.get("userId") as string;
    
    if (!userId) {
      return NextResponse.json({ error: "ID de usuário não fornecido" }, { status: 400 });
    }
    
    // Verificar se o usuário existe
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, isSuperAdmin: true }
    });
    
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }
    
    if (user.isSuperAdmin) {
      return NextResponse.json({ error: "Usuário já é superadmin" }, { status: 400 });
    }
    
    // Atualizar o usuário para superadmin
    await db.user.update({
      where: { id: userId },
      data: { isSuperAdmin: true }
    });
    
    // Registrar a ação no audit log
    await logUserAction({
      userId: session.user.id,
      action: AUDIT_ACTIONS.USER_ROLE_CHANGE,
      entityType: "user",
      entityId: userId,
      details: { 
        changedTo: "SUPERADMIN",
        targetUser: user.email || user.name
      }
    });
    
    return NextResponse.redirect(new URL("/admin/superadmins", req.url));
  } catch (error) {
    console.error("Erro ao adicionar superadmin:", error);
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 });
  }
} 