"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Check, ChevronsUpDown, Plus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ITeam } from "@/types/user";

export function SuperAdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<ITeam | null>(null);
  
  // Verificar se o usuário é superadmin
  const isSuperAdmin = session?.user?.isSuperAdmin;
  
  // Se não for superadmin, não renderizar o componente
  if (!isSuperAdmin) return null;
  
  // Carregar os times disponíveis
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch('/api/admin/teams');
        if (res.ok) {
          const data = await res.json();
          setTeams(data.teams);
          
          // Verificar se há um time na URL atual
          const teamIdMatch = pathname.match(/\/teams\/([^\/]+)/);
          if (teamIdMatch && teamIdMatch[1]) {
            const currentTeamId = teamIdMatch[1];
            const currentTeam = data.teams.find((team: ITeam) => team.id === currentTeamId);
            if (currentTeam) {
              setSelectedTeam(currentTeam);
            }
          }
        }
      } catch (error) {
        console.error("Erro ao carregar times:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeams();
  }, [pathname]);
  
  const handleSelectTeam = (team: ITeam) => {
    setSelectedTeam(team);
    setOpen(false);
    router.push(`/teams/${team.id}`);
  };
  
  if (loading) return null;
  
  return (
    <div className="flex items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Selecionar time"
            className="flex items-center justify-between w-64 text-sm font-normal"
          >
            {selectedTeam ? (
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                <span>{selectedTeam.name}</span>
              </div>
            ) : (
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                <span>Selecionar Time</span>
              </div>
            )}
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0">
          <Command>
            <CommandInput placeholder="Buscar time..." />
            <CommandList>
              <CommandEmpty>Nenhum time encontrado.</CommandEmpty>
              <CommandGroup heading="Times">
                {teams.map((team) => (
                  <CommandItem
                    key={team.id}
                    onSelect={() => handleSelectTeam(team)}
                    className="flex items-center"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    <span>{team.name}</span>
                    {selectedTeam?.id === team.id && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <Link href="/admin/teams/new">
                  <CommandItem className="flex items-center">
                    <Plus className="mr-2 h-4 w-4" />
                    <span>Novo Time</span>
                  </CommandItem>
                </Link>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Separator orientation="vertical" className="mx-4 h-6" />
    </div>
  );
} 