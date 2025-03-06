// Script para ajustar o Prisma Client ao banco de dados existente sem migrações
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Iniciando processo de ajuste do schema...');

try {
  // Caminho para o arquivo schema.prisma
  const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
  
  // Conteúdo do schema atualizado
  const schemaContent = `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Modelo para armazenar contas de autenticação (OAuth)
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

// Modelo para sessões de usuário
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("sessions")
}

// Modelo de Usuário
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  password      String?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts    Account[]
  sessions    Session[]
  teamMembers TeamMember[]
  ownedTeams  Team[]      @relation("TeamOwner")
  
  @@map("users")
}

// Modelo para reset de senha
model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

// Modelo de Time
model Team {
  id           String    @id @default(cuid())
  name         String
  description  String?
  dashboardUrl String?   // URL do dashboard do Looker Studio específico para este time
  createdBy    String?   // Adicionado para ser compatível com o banco existente
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  
  ownerId     String
  owner       User      @relation("TeamOwner", fields: [ownerId], references: [id])
  members     TeamMember[]
  invitations TeamInvitation[]
  
  @@map("teams")
}

// Modelo de relacionamento usuário-time com role
model TeamMember {
  id          String    @id @default(cuid())
  role        String?   // Alterado para String para ser compatível com o banco existente
  invitedBy   String?   // Adicionado para ser compatível com o banco existente
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  userId      String
  teamId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  team        Team      @relation(fields: [teamId], references: [id], onDelete: Cascade)
  
  @@unique([userId, teamId])
  @@map("team_members")
}

// Modelo para convites de time
model TeamInvitation {
  id        String    @id @default(cuid())
  email     String
  role      Role      @default(MEMBER)
  token     String    @unique
  expires   DateTime
  createdAt DateTime  @default(now())
  
  teamId    String
  team      Team      @relation(fields: [teamId], references: [id], onDelete: Cascade)
  
  @@index([email, teamId])
  @@map("team_invitations")
}

// Adicionando modelos para as outras tabelas encontradas no banco
model Dashboard {
  id          String    @id @default(cuid())
  name        String
  url         String
  createdBy   String?   // Compatibilidade com o banco existente
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  permissions DashboardPermission[]
  
  @@map("dashboards")
}

model DashboardPermission {
  id          String    @id @default(cuid())
  userId      String?
  teamId      String?
  dashboardId String
  permission  String
  createdAt   DateTime  @default(now())
  
  dashboard   Dashboard @relation(fields: [dashboardId], references: [id], onDelete: Cascade)
  
  @@map("dashboard_permissions")
}

model ActivityLog {
  id        String    @id @default(cuid())
  userId    String?
  action    String
  details   String?
  createdAt DateTime  @default(now())
  
  @@map("activity_logs")
}

// Enumeração de permissões
enum Role {
  ADMIN
  OWNER
  MEMBER
  VIEWER
}`;

  // Escrevendo o arquivo schema.prisma
  console.log('Atualizando o arquivo schema.prisma...');
  fs.writeFileSync(schemaPath, schemaContent);
  console.log('Arquivo schema.prisma atualizado com sucesso');
  
  // Gerando o cliente Prisma com base no schema atualizado
  console.log('\nGerando o cliente Prisma...');
  console.log('Este processo pode levar alguns minutos. Por favor, aguarde...');
  
  // Gerar o prisma client usando o flag --skip-generate-prisma
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('\nProcesso concluído com sucesso!');
  console.log('O Prisma Client foi gerado com base no schema atualizado.');
  console.log('A aplicação deve agora reconhecer corretamente as tabelas do banco de dados.');
  console.log('\nReinicie o aplicativo para que as alterações tenham efeito.');
  
} catch (error) {
  console.error('Erro durante o processo de atualização:', error);
  process.exit(1);
} 