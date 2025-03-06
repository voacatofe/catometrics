import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import * as z from "zod";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";

// Schema para validação de atualização do time
const updateTeamSchema = z.object({
  name: z.string().min(2, {
    message: "O nome do time deve ter pelo menos 2 caracteres.",
  }).optional(),
  description: z.string().optional().nullable(),
  dashboardUrl: z.string().url({
    message: "URL do dashboard inválida",
  }).optional().nullable(),
});

// GET - Obter um único time pelo ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Não autorizado" },
        { status: 401 }
      );
    }

    // Verificar se o usuário é membro ou proprietário do time
    const teamMember = await db.teamMember.findFirst({
      where: {
        teamId: params.id,
        userId: session.user.id,
      },
    });

    if (!teamMember) {
      return NextResponse.json(
        { message: "Você não tem permissão para acessar este time" },
        { status: 403 }
      );
    }

    // Obter o time com membros
    const team = await db.team.findUnique({
      where: { id: params.id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json(
        { message: "Time não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ team });
  } catch (error) {
    console.error("Erro ao obter time:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar um time
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Não autorizado" },
        { status: 401 }
      );
    }

    // Verificar se o usuário é proprietário do time
    const team = await db.team.findUnique({
      where: { id: params.id },
    });

    if (!team) {
      return NextResponse.json(
        { message: "Time não encontrado" },
        { status: 404 }
      );
    }

    if (team.ownerId !== session.user.id) {
      return NextResponse.json(
        { message: "Você não tem permissão para editar este time" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = updateTeamSchema.parse(body);

    // Atualizar o time
    const updatedTeam = await db.team.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json({
      team: updatedTeam,
      message: "Time atualizado com sucesso",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Erro ao atualizar time:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir um time
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Não autorizado" },
        { status: 401 }
      );
    }

    // Verificar se o usuário é proprietário do time
    const team = await db.team.findUnique({
      where: { id: params.id },
    });

    if (!team) {
      return NextResponse.json(
        { message: "Time não encontrado" },
        { status: 404 }
      );
    }

    if (team.ownerId !== session.user.id) {
      return NextResponse.json(
        { message: "Você não tem permissão para excluir este time" },
        { status: 403 }
      );
    }

    // Excluir o time
    await db.team.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: "Time excluído com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir time:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
} 