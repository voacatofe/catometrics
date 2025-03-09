import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        status: "unauthenticated",
        message: "Usuário não autenticado",
        session: null
      }, { status: 401 });
    }
    
    // Verificar dados do usuário no banco
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        isSuperAdmin: true,
        lastLogin: true
      }
    });
    
    if (!user) {
      return NextResponse.json({
        status: "error",
        message: "Usuário autenticado, mas não encontrado no banco de dados",
        session: {
          ...session,
          user: {
            ...session.user,
            // Remover dados sensíveis
            password: undefined
          }
        },
        databaseUser: null
      }, { status: 404 });
    }
    
    // Comparar dados da sessão com dados do banco
    const sessionDiscrepancies = {
      isSuperAdmin: {
        session: Boolean(session.user.isSuperAdmin),
        database: Boolean(user.isSuperAdmin),
        match: Boolean(session.user.isSuperAdmin) === Boolean(user.isSuperAdmin)
      }
    };
    
    return NextResponse.json({
      status: "authenticated",
      message: "Informações do usuário autenticado",
      session: {
        ...session,
        user: {
          ...session.user,
          // Remover dados sensíveis
          password: undefined
        }
      },
      databaseUser: {
        ...user,
        // Formatar datas para exibição
        lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null
      },
      discrepancies: sessionDiscrepancies,
      canAccessAdminPages: Boolean(user.isSuperAdmin)
    });
    
  } catch (error) {
    console.error("Erro ao obter status de autenticação:", error);
    
    return NextResponse.json({
      status: "error",
      message: "Erro ao obter status de autenticação",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 