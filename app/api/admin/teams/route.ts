import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { logUserAction, AUDIT_ACTIONS } from "@/lib/auth";

export async function GET() {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se é superadmin
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { isSuperAdmin: true }
    });

    if (!user?.isSuperAdmin) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // Buscar todos os times com contagem de membros
    const teams = await db.team.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: { members: true, dashboards: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Registrar ação
    await logUserAction({
      userId: session.user.id,
      action: AUDIT_ACTIONS.LOGIN,
      entityType: 'team',
      details: { action: 'list_all_teams' }
    });

    return NextResponse.json({ teams });
  } catch (error) {
    console.error("Erro ao listar times:", error);
    return NextResponse.json(
      { error: "Erro ao processar requisição" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se é superadmin
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { isSuperAdmin: true }
    });

    if (!user?.isSuperAdmin) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // Obter dados do corpo da requisição
    const body = await req.json();
    const { name, description, adminEmail } = body;

    if (!name || !adminEmail) {
      return NextResponse.json(
        { error: "Nome do time e email do administrador são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o email do admin já existe como usuário
    let teamAdmin = await db.user.findUnique({
      where: { email: adminEmail }
    });

    // Criar o time
    const team = await db.team.create({
      data: {
        name,
        description,
        owner: {
          connect: { id: session.user.id }
        }
      }
    });

    // Se o admin já existir, adicioná-lo como membro do time
    if (teamAdmin) {
      await db.teamMember.create({
        data: {
          role: 'ADMIN',
          team: {
            connect: { id: team.id }
          },
          user: {
            connect: { id: teamAdmin.id }
          }
        }
      });
    } else {
      // Se não existir, criar um convite
      const expiresDate = new Date();
      expiresDate.setDate(expiresDate.getDate() + 7); // Expira em 7 dias

      await db.teamInvitation.create({
        data: {
          email: adminEmail,
          role: 'ADMIN',
          expires: expiresDate,
          token: `${team.id}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          team: {
            connect: { id: team.id }
          },
          inviter: {
            connect: { id: session.user.id }
          }
        }
      });

      // TODO: Enviar e-mail de convite
    }

    // Registrar ação
    await logUserAction({
      userId: session.user.id,
      action: AUDIT_ACTIONS.CREATE_TEAM,
      entityType: 'team',
      entityId: team.id,
      details: { name, description, adminEmail }
    });

    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar time:", error);
    return NextResponse.json(
      { error: "Erro ao processar requisição" },
      { status: 500 }
    );
  }
} 