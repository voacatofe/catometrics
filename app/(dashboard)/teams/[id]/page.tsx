"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { BarChart, Users, UserPlus, Pencil, Check, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

interface TeamMember {
  id: string
  role: string
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  }
}

interface Team {
  id: string
  name: string
  description: string | null
  dashboardUrl: string | null
  ownerId: string
  members: TeamMember[]
  _count: {
    members: number
  }
}

export default function TeamDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [team, setTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [editingDashboard, setEditingDashboard] = useState(false)
  const [dashboardUrl, setDashboardUrl] = useState("")

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch(`/api/teams/${params.id}`)
        if (!res.ok) {
          throw new Error('Falha ao carregar os dados do time')
        }
        const data = await res.json()
        setTeam(data.team)
        
        if (session?.user?.id && data.team.ownerId === session.user.id) {
          setIsOwner(true)
        }
        
        if (data.team.dashboardUrl) {
          setDashboardUrl(data.team.dashboardUrl)
        }
        
        setLoading(false)
      } catch (error) {
        console.error(error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do time.",
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    if (session) {
      fetchTeam()
    }
  }, [params.id, session, toast])

  const handleSaveDashboardUrl = async () => {
    if (!team) return
    
    try {
      const res = await fetch(`/api/teams/${team.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dashboardUrl,
        }),
      })
      
      if (!res.ok) {
        throw new Error('Falha ao atualizar a URL do dashboard')
      }
      
      // Atualiza o time no estado
      setTeam({
        ...team,
        dashboardUrl,
      })
      
      setEditingDashboard(false)
      
      toast({
        title: "URL do Dashboard atualizada",
        description: "A URL do dashboard foi atualizada com sucesso.",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a URL do dashboard.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p>Carregando...</p>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px]">
        <p className="text-muted-foreground">Time não encontrado ou você não tem permissão para acessá-lo.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/teams')}>
          Voltar para Times
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{team.name}</h1>
        
        {team.dashboardUrl && (
          <Link href={`/dashboard/${team.id}`}>
            <Button>
              <BarChart className="mr-2 h-4 w-4" />
              Ver Dashboard
            </Button>
          </Link>
        )}
      </div>
      
      {team.description && (
        <p className="text-muted-foreground">{team.description}</p>
      )}
      
      <div className="grid gap-4 md:grid-cols-2">
        {/* Card do Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Dashboard do Time
            </CardTitle>
            <CardDescription>
              Configure a URL do dashboard do Looker Studio para este time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!editingDashboard ? (
              <div className="space-y-2">
                {team.dashboardUrl ? (
                  <>
                    <div className="break-all border rounded-md p-3 bg-muted/30">
                      {team.dashboardUrl}
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                      Dashboard configurado
                    </Badge>
                  </>
                ) : (
                  <>
                    <div className="text-muted-foreground italic">
                      Nenhuma URL de dashboard configurada para este time.
                    </div>
                    <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                      Sem dashboard
                    </Badge>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="dashboardUrl">URL do Dashboard do Looker Studio</Label>
                <Input
                  id="dashboardUrl"
                  placeholder="https://lookerstudio.google.com/embed/..."
                  value={dashboardUrl}
                  onChange={(e) => setDashboardUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Cole a URL de incorporação (embed) do dashboard do Looker Studio.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            {!editingDashboard ? (
              isOwner && (
                <Button variant="outline" onClick={() => setEditingDashboard(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar URL do Dashboard
                </Button>
              )
            ) : (
              <div className="flex gap-2">
                <Button variant="default" onClick={handleSaveDashboardUrl}>
                  <Check className="mr-2 h-4 w-4" />
                  Salvar
                </Button>
                <Button variant="outline" onClick={() => {
                  setEditingDashboard(false)
                  if (team.dashboardUrl) {
                    setDashboardUrl(team.dashboardUrl)
                  } else {
                    setDashboardUrl("")
                  }
                }}>
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
        
        {/* Card dos Membros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Membros do Time
            </CardTitle>
            <CardDescription>
              Gerencie os membros deste time e suas permissões
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {team.members.length === 0 ? (
                <p className="text-muted-foreground">Nenhum membro ainda.</p>
              ) : (
                <ul className="space-y-2">
                  {team.members.map((member) => (
                    <li key={member.id} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          {member.user.name ? member.user.name[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="font-medium">{member.user.name}</div>
                          <div className="text-xs text-muted-foreground">{member.user.email}</div>
                        </div>
                      </div>
                      <Badge variant={member.role === "OWNER" ? "default" : "secondary"}>
                        {member.role}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
          <CardFooter>
            {isOwner && (
              <Button variant="outline">
                <UserPlus className="mr-2 h-4 w-4" />
                Convidar Membros
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 