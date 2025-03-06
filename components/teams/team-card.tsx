"use client"

import Link from "next/link"
import { Team, User } from "@prisma/client"
import { Users } from "lucide-react"

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
      <CardContent className="pb-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="mr-1 h-4 w-4" />
          <span>{team._count.members} membros</span>
        </div>
      </CardContent>
      <CardFooter className="pt-3 border-t">
        <Link href={`/teams/${team.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            Ver Time
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
} 