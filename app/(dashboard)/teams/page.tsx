import Link from "next/link"
import { getServerSession } from "next-auth"
import { Plus } from "lucide-react"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import TeamCard from "@/components/teams/team-card"

export default async function TeamsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return null
  }

  // Buscar times que o usuário é membro
  const teams = await db.team.findMany({
    where: {
      OR: [
        { ownerId: session.user.id },
        {
          members: {
            some: {
              userId: session.user.id,
            },
          },
        },
      ],
    },
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
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Times</h1>
        <Link href="/teams/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Time
          </Button>
        </Link>
      </div>

      {teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <h2 className="text-lg font-medium">Você não tem times</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Crie um novo time para começar a colaborar com sua equipe.
          </p>
          <Link href="/teams/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Criar Time
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} userId={session.user.id} />
          ))}
        </div>
      )}
    </div>
  )
} 