"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Check, MoreHorizontal, Plus, Shield, User, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Role } from "@/types/user";

interface TeamMember {
  id: string;
  role: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  expires: string;
  status: string;
  createdAt: string;
}

export default function TeamMembersPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [team, setTeam] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar time
        const teamRes = await fetch(`/api/teams/${params.id}`);
        if (!teamRes.ok) throw new Error("Falha ao carregar dados do time");
        const teamData = await teamRes.json();
        setTeam(teamData.team);

        // Buscar membros
        const membersRes = await fetch(`/api/teams/${params.id}/members`);
        if (!membersRes.ok) throw new Error("Falha ao carregar membros");
        const membersData = await membersRes.json();
        setMembers(membersData.members);

        // Verificar se o usuário atual é admin ou superadmin
        const isUserAdmin = membersData.members.some(
          (member: TeamMember) =>
            member.user.id === session?.user.id && member.role === "ADMIN"
        );
        setIsAdmin(isUserAdmin);
        setIsSuperAdmin(session?.user.isSuperAdmin || false);

        // Se for admin ou superadmin, buscar convites
        if (isUserAdmin || session?.user.isSuperAdmin) {
          const invitationsRes = await fetch(`/api/teams/${params.id}/invitations`);
          if (invitationsRes.ok) {
            const invitationsData = await invitationsRes.json();
            setInvitations(invitationsData.invitations);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do time.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [params.id, session, toast]);

  const handleInviteMember = async () => {
    if (!inviteEmail) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe o email do usuário a ser convidado.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/teams/${params.id}/invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setInvitations([...invitations, data.invitation]);
        setInviteDialogOpen(false);
        setInviteEmail("");
        setInviteRole("MEMBER");
        toast({
          title: "Convite enviado",
          description: `Um convite foi enviado para ${inviteEmail}.`,
        });
      } else {
        const error = await res.json();
        toast({
          title: "Erro ao enviar convite",
          description: error.message || "Ocorreu um erro ao enviar o convite.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao enviar convite:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar o convite. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const res = await fetch(`/api/teams/${params.id}/invitations/${invitationId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setInvitations(
          invitations.filter((invitation) => invitation.id !== invitationId)
        );
        toast({
          title: "Convite cancelado",
          description: "O convite foi cancelado com sucesso.",
        });
      } else {
        const error = await res.json();
        toast({
          title: "Erro ao cancelar convite",
          description: error.message || "Ocorreu um erro ao cancelar o convite.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao cancelar convite:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao cancelar o convite. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/teams/${params.id}/members/${memberId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: newRole,
        }),
      });

      if (res.ok) {
        setMembers(
          members.map((member) =>
            member.id === memberId ? { ...member, role: newRole } : member
          )
        );
        toast({
          title: "Função atualizada",
          description: "A função do membro foi atualizada com sucesso.",
        });
      } else {
        const error = await res.json();
        toast({
          title: "Erro ao atualizar função",
          description: error.message || "Ocorreu um erro ao atualizar a função.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar função:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar a função. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const res = await fetch(`/api/teams/${params.id}/members/${memberId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMembers(members.filter((member) => member.id !== memberId));
        toast({
          title: "Membro removido",
          description: "O membro foi removido do time com sucesso.",
        });
      } else {
        const error = await res.json();
        toast({
          title: "Erro ao remover membro",
          description: error.message || "Ocorreu um erro ao remover o membro.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao remover membro:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao remover o membro. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex flex-col items-center justify-center h-32">
        <p className="text-muted-foreground">Time não encontrado.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/teams")}
        >
          Voltar para Times
        </Button>
      </div>
    );
  }

  // Funções auxiliares para o componente
  const getUserInitials = (user: TeamMember["user"]) => {
    if (user.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }
    return user.email ? user.email[0].toUpperCase() : "U";
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
            <Shield className="h-3 w-3 mr-1" /> Admin
          </Badge>
        );
      case "MEMBER":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <User className="h-3 w-3 mr-1" /> Membro
          </Badge>
        );
      case "VIEWER":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            Visualizador
          </Badge>
        );
      default:
        return <Badge>{role}</Badge>;
    }
  };

  const getInvitationStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Pendente
          </Badge>
        );
      case "ACCEPTED":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <Check className="h-3 w-3 mr-1" /> Aceito
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <X className="h-3 w-3 mr-1" /> Rejeitado
          </Badge>
        );
      case "EXPIRED":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            Expirado
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Membros do Time</h1>
        {(isAdmin || isSuperAdmin) && (
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Convidar Membro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Convidar Novo Membro</DialogTitle>
                <DialogDescription>
                  Envie um convite por email para adicionar um novo membro ao time {team.name}.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nome@empresa.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Função</Label>
                  <Select
                    value={inviteRole}
                    onValueChange={setInviteRole}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Selecione uma função" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="MEMBER">Membro</SelectItem>
                      <SelectItem value="VIEWER">Visualizador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleInviteMember} disabled={isSubmitting}>
                  {isSubmitting ? "Enviando..." : "Enviar Convite"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Lista de Membros */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Membros do Time</CardTitle>
            <CardDescription>
              {members.length} {members.length === 1 ? "membro" : "membros"} neste time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.user.image || ""} />
                      <AvatarFallback>{getUserInitials(member.user)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {member.user.name || member.user.email}
                      </p>
                      {member.user.email && member.user.name && (
                        <p className="text-sm text-muted-foreground">
                          {member.user.email}
                        </p>
                      )}
                      <div className="mt-1">{getRoleBadge(member.role)}</div>
                    </div>
                  </div>
                  {(isAdmin || isSuperAdmin) && member.user.id !== session?.user.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Ações</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleUpdateMemberRole(member.id, "ADMIN")}
                          disabled={member.role === "ADMIN"}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Tornar Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUpdateMemberRole(member.id, "MEMBER")}
                          disabled={member.role === "MEMBER"}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Tornar Membro
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUpdateMemberRole(member.id, "VIEWER")}
                          disabled={member.role === "VIEWER"}
                        >
                          Tornar Visualizador
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-red-600"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remover do Time
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}

              {members.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">
                    Nenhum membro encontrado.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lista de Convites */}
        {(isAdmin || isSuperAdmin) && (
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Convites Pendentes</CardTitle>
              <CardDescription>
                Convites enviados para novos membros
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invitations
                  .filter((inv) => inv.status === "PENDING")
                  .map((invitation) => (
                    <div
                      key={invitation.id}
                      className="flex items-center justify-between py-2"
                    >
                      <div>
                        <p className="font-medium">{invitation.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getRoleBadge(invitation.role)}
                          {getInvitationStatusBadge(invitation.status)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Expira em{" "}
                          {new Date(invitation.expires).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelInvitation(invitation.id)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  ))}

                {invitations.filter((inv) => inv.status === "PENDING").length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">
                      Nenhum convite pendente.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 