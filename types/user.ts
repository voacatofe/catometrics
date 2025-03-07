// Enums da aplicação
export enum Role {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER'
}

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

export interface IUser {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  isSuperAdmin: boolean;
  lastLogin: Date | null;
  isActive: boolean;
}

export interface IUserWithTeams extends IUser {
  teamMembers: ITeamMember[];
  ownedTeams: ITeam[];
}

export interface ITeamMember {
  id: string;
  role: Role;
  userId: string;
  teamId: string;
  createdAt: Date;
  updatedAt: Date;
  user?: IUser;
  team?: ITeam;
}

export interface ITeam {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  billingStatus: string | null;
  billingCycle: string | null;
  nextBillingDate: Date | null;
  owner?: IUser;
  members?: ITeamMember[];
  dashboards?: IDashboard[];
}

export interface IDashboard {
  id: string;
  name: string;
  description: string | null;
  url: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  teamId: string;
  team?: ITeam;
}

export interface ITeamInvitation {
  id: string;
  email: string;
  role: Role;
  token: string;
  expires: Date;
  createdAt: Date;
  status: InvitationStatus;
  teamId: string;
  inviterId: string;
  team?: ITeam;
  inviter?: IUser;
}

export interface IAuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: Date;
  user?: IUser;
}

// Extensão do tipo de Session do NextAuth para incluir o ID e role do usuário
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
      isSuperAdmin: boolean;
    } & DefaultSession['user'];
  }
}

// Import DefaultSession from next-auth
import { DefaultSession } from 'next-auth';

// Tipos de função para ajudar na verificação de permissões
export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'MEMBER' | 'VIEWER';

// Funções de verificação de papel do usuário
export const isSuperAdmin = (user: IUser): boolean => {
  return user.isSuperAdmin;
};

export const isTeamAdmin = (user: IUser, teamId: string, teamMembers: ITeamMember[]): boolean => {
  const membership = teamMembers.find(tm => tm.userId === user.id && tm.teamId === teamId);
  return membership?.role === Role.ADMIN || user.isSuperAdmin;
};

export const isTeamMember = (user: IUser, teamId: string, teamMembers: ITeamMember[]): boolean => {
  return !!teamMembers.find(tm => tm.userId === user.id && tm.teamId === teamId);
}; 