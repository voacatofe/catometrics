import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { Role } from "@/types/user";

// Configuração de variáveis de ambiente em falback
// Se não estiver configurado no ambiente, usa valores padrão
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = "umValorAleatorioMuitoSeguro123456";
  console.log("AVISO: Usando valor padrão para NEXTAUTH_SECRET");
}

if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = "https://catometrics.com.br";
  console.log("AVISO: Usando valor padrão para NEXTAUTH_URL");
}

// Função para obter a sessão atual do usuário
export async function getAuthSession() {
  return await getServerSession(authOptions);
}

// Função para verificar se o usuário está autenticado
export async function requireAuth() {
  const session = await getAuthSession();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

// Função para verificar se o usuário é superadmin
export async function requireSuperAdmin() {
  const session = await requireAuth();
  
  console.log("[DEBUG] Verificando permissão de SuperAdmin para usuário:", {
    userId: session.user.id,
    email: session.user.email,
    isSuperAdminFromSession: session.user.isSuperAdmin
  });
  
  // Verificar se é superadmin
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { isSuperAdmin: true, email: true, name: true }
  });
  
  console.log("[DEBUG] Resultado da verificação no banco de dados:", {
    email: user?.email,
    isSuperAdminFromDB: user?.isSuperAdmin
  });
  
  if (!user?.isSuperAdmin) {
    console.log("[DEBUG] Acesso negado: usuário não é SuperAdmin");
    redirect("/dashboard");
  }
  
  console.log("[DEBUG] Acesso permitido: usuário é SuperAdmin");
  return session;
}

// Função para verificar se o usuário é admin de um time
export async function requireTeamAdmin(teamId: string) {
  const session = await requireAuth();
  
  // Verificar se é superadmin
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { isSuperAdmin: true }
  });
  
  if (user?.isSuperAdmin) {
    return session;
  }
  
  // Verificar se é admin do time
  const teamMember = await db.teamMember.findFirst({
    where: {
      userId: session.user.id,
      teamId: teamId,
      role: Role.ADMIN
    }
  });
  
  if (!teamMember) {
    redirect("/dashboard");
  }
  
  return session;
}

// Função para verificar se o usuário é membro de um time
export async function requireTeamMember(teamId: string) {
  const session = await requireAuth();
  
  // Verificar se é superadmin
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { isSuperAdmin: true }
  });
  
  if (user?.isSuperAdmin) {
    return session;
  }
  
  // Verificar se é membro do time
  const teamMember = await db.teamMember.findFirst({
    where: {
      userId: session.user.id,
      teamId: teamId
    }
  });
  
  if (!teamMember) {
    redirect("/dashboard");
  }
  
  return session;
}

// Função para registrar login do usuário
export async function recordUserLogin(userId: string) {
  await db.user.update({
    where: { id: userId },
    data: { lastLogin: new Date() }
  });
}

// Função para registrar ações do usuário (audit log)
export async function logUserAction({
  userId,
  action,
  entityType,
  entityId = null,
  details = null,
  ipAddress = null
}: {
  userId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: any;
  ipAddress?: string | null;
}) {
  // Temporariamente apenas logando no console
  console.log('[Audit Log]', {
    userId,
    action,
    entityType,
    entityId,
    details: details ? JSON.stringify(details) : null,
    ipAddress,
    timestamp: new Date().toISOString()
  });
  
  // Retornando um objeto simulado
  return {
    id: 'temp-' + Date.now(),
    userId,
    action,
    entityType,
    entityId,
    details: details ? JSON.stringify(details) : null,
    ipAddress,
    createdAt: new Date()
  };
}

// Constantes para ações do audit log
export const AUDIT_ACTIONS = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  CREATE_TEAM: 'create_team',
  UPDATE_TEAM: 'update_team',
  DELETE_TEAM: 'delete_team',
  INVITE_USER: 'invite_user',
  ACCEPT_INVITATION: 'accept_invitation',
  REJECT_INVITATION: 'reject_invitation',
  ADD_DASHBOARD: 'add_dashboard',
  UPDATE_DASHBOARD: 'update_dashboard',
  DELETE_DASHBOARD: 'delete_dashboard',
  USER_ROLE_CHANGE: 'user_role_change',
}; 