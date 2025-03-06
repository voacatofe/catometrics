import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"

export default async function TeamDashboardPage({ params }: { params: { teamId: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/login")
  }
  
  // Verificar se o usuário é membro do time
  const teamMember = await db.teamMember.findFirst({
    where: {
      teamId: params.teamId,
      userId: session.user.id
    },
    include: {
      team: true
    }
  })
  
  if (!teamMember) {
    redirect("/teams")
  }
  
  const { dashboardUrl } = teamMember.team
  
  if (!dashboardUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h1 className="text-2xl font-bold mb-4">Dashboard não configurado</h1>
        <p className="text-muted-foreground max-w-md mb-8">
          Este time ainda não possui um dashboard configurado. Entre em contato com o administrador do time para adicionar uma URL de dashboard.
        </p>
        <Link href={`/teams/${params.teamId}`}>
          <Button variant="outline">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar para Detalhes do Time
          </Button>
        </Link>
      </div>
    )
  }
  
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard: {teamMember.team.name}</h1>
        <Link href={`/teams/${params.teamId}`}>
          <Button variant="outline">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar para Time
          </Button>
        </Link>
      </div>
      
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="aspect-[16/9] w-full h-[75vh]">
          <iframe
            src={dashboardUrl}
            className="w-full h-full border-0"
            allowFullScreen
            title={`Dashboard do time ${teamMember.team.name}`}
          ></iframe>
        </div>
      </div>
    </div>
  )
} 