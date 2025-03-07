import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  // Verificar se o usuário está autenticado como superadmin
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  // Verificar se é superadmin
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { isSuperAdmin: true }
  });
  
  if (!user?.isSuperAdmin) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  try {
    // Buscar alguns dashboards para verificar
    const dashboards = await db.dashboard.findMany({
      take: 5,
      include: {
        team: {
          select: {
            name: true,
          },
        },
      },
    });

    // Buscar alguns usuários para verificar
    const users = await db.user.findMany({
      take: 5,
    });

    // Informações detalhadas sobre os objetos
    const dashboardInfo = dashboards.map(dashboard => ({
      id: dashboard.id,
      name: dashboard.name,
      createdAt: dashboard.createdAt,
      createdAtType: typeof dashboard.createdAt,
      createdAtIsDate: dashboard.createdAt instanceof Date,
      createdAtJSON: JSON.stringify(dashboard.createdAt),
      teamName: dashboard.team.name,
    }));

    const userInfo = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      isSuperAdmin: user.isSuperAdmin,
      createdAt: user.createdAt,
      createdAtType: typeof user.createdAt,
      createdAtIsDate: user.createdAt instanceof Date,
      createdAtJSON: JSON.stringify(user.createdAt),
      lastLogin: user.lastLogin,
      lastLoginType: user.lastLogin ? typeof user.lastLogin : null,
      lastLoginIsDate: user.lastLogin ? user.lastLogin instanceof Date : null,
      lastLoginJSON: user.lastLogin ? JSON.stringify(user.lastLogin) : null,
    }));

    return NextResponse.json({
      dashboards: dashboardInfo,
      users: userInfo,
      nodeVersion: process.version,
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error("Erro ao verificar o banco de dados:", error);
    return NextResponse.json({ error: "Erro ao verificar o banco de dados", details: String(error) }, { status: 500 });
  }
} 