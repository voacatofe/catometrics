"use client"

import Link from "next/link"
import { Team, User } from "@prisma/client"
import { Users, BarChart } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TeamWithMembers extends Team {
  members: {
    user: Pick<User, "id" | "name" | "email" | "image">
  }[]
  _count: {
    members: number
  }
}

interface TeamCardProps {
  team: TeamWithMembers
  userId: string
}

export default function TeamCard({ team, userId }: TeamCardProps) {
  const isOwner = team.ownerId === userId

  return (
    <Card className={cn("overflow-hidden", isOwner && "border-primary/50")}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{team.name}</CardTitle>
          {isOwner && (
            <div className="rounded-sm bg-primary/10 px-2 py-1 text-xs text-primary">
              Proprietário
            </div>
          )}
        </div>
        <CardDescription className="line-clamp-2 h-10">
          {team.description || "Sem descrição"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3 space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="mr-1 h-4 w-4" />
          <span>{team._count.members} membros</span>
        </div>
        
        <div className="flex items-center text-sm">
          {team.dashboardUrl ? (
            <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
              <BarChart className="mr-1 h-3 w-3" />
              Dashboard configurado
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
              <BarChart className="mr-1 h-3 w-3" />
              Sem dashboard
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-3 border-t">
        <div className="w-full flex gap-2">
          <Link href={`/teams/${team.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              Ver Time
            </Button>
          </Link>
          {team.dashboardUrl && (
            <Link href={`/dashboard/${team.id}`} className="flex-1">
              <Button variant="default" className="w-full">
                Dashboard
              </Button>
            </Link>
          )}
        </div>
      </CardFooter>
    </Card>
  )
} 