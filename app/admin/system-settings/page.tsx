import { redirect } from "next/navigation";
import { Settings, Save, Database, Shield, Mail, Cloud } from "lucide-react";

import { requireSuperAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Mock para configurações do sistema (substituir por configurações reais do banco de dados)
const mockSystemSettings = {
  // Configurações de segurança
  securitySettings: {
    enforceStrongPasswords: true,
    twoFactorAuthRequired: false,
    sessionTimeoutMinutes: 120,
    maxLoginAttempts: 5,
  },
  // Configurações de email
  emailSettings: {
    enableEmailNotifications: true,
    sendWelcomeEmail: true,
    dailyReportEnabled: false,
    weeklyReportEnabled: true,
  },
  // Configurações de integração
  integrationSettings: {
    enableLookerStudioIntegration: true,
    enableApiAccess: true,
    enableExternalAuth: false,
  },
  // Limites do sistema
  limits: {
    maxTeamsPerUser: 10,
    maxMembersPerTeam: 50,
    maxDashboardsPerTeam: 20,
  },
  // Configurações de manutenção
  maintenanceSettings: {
    maintenanceMode: false,
    scheduledMaintenanceDate: null,
    backupFrequency: "daily",
    retentionDays: 30,
  }
};

// Componente para renderizar um grupo de configurações
function SettingsGroup({ 
  title, 
  description, 
  icon, 
  children 
}: { 
  title: string, 
  description: string, 
  icon: React.ReactNode, 
  children: React.ReactNode 
}) {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-end">
        <Button size="sm" className="gap-1">
          <Save className="h-4 w-4" /> Salvar Alterações
        </Button>
      </CardFooter>
    </Card>
  );
}

// Componente para um item de configuração de alternância (switch)
function SwitchSetting({ 
  label, 
  description, 
  checked = false, 
  onChange 
}: { 
  label: string, 
  description: string, 
  checked?: boolean, 
  onChange?: (checked: boolean) => void 
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Label htmlFor={label.replace(/\s+/g, '_')} className="text-base font-medium">
          {label}
        </Label>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      <Switch 
        id={label.replace(/\s+/g, '_')} 
        checked={checked} 
        onCheckedChange={onChange}
      />
    </div>
  );
}

// Componente para um item de configuração numérica
function NumberSetting({ 
  label, 
  description, 
  value, 
  min, 
  max, 
  onChange 
}: { 
  label: string, 
  description: string, 
  value: number, 
  min?: number, 
  max?: number, 
  onChange?: (value: number) => void 
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Label htmlFor={label.replace(/\s+/g, '_')} className="text-base font-medium">
          {label}
        </Label>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          id={label.replace(/\s+/g, '_')}
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange?.(parseInt(e.target.value))}
          className="border rounded px-3 py-2 w-20 text-center"
        />
      </div>
    </div>
  );
}

export default async function SystemSettingsPage() {
  // Proteção de rota - apenas superadmin
  const session = await requireSuperAdmin();

  // Na implementação real, buscar as configurações atuais do banco de dados
  const settings = mockSystemSettings; // Usando mock por enquanto

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader title="Configurações do Sistema" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Configurações de Segurança */}
          <SettingsGroup 
            title="Segurança" 
            description="Configurações relacionadas à segurança do sistema" 
            icon={<Shield className="h-5 w-5 text-primary" />}
          >
            <SwitchSetting
              label="Senhas Fortes"
              description="Exigir senhas fortes (mínimo 8 caracteres, letras maiúsculas e minúsculas, números e símbolos)"
              checked={settings.securitySettings.enforceStrongPasswords}
            />
            <SwitchSetting
              label="Autenticação de Dois Fatores"
              description="Exigir autenticação de dois fatores para todos os usuários"
              checked={settings.securitySettings.twoFactorAuthRequired}
            />
            <NumberSetting
              label="Tempo de Sessão"
              description="Duração da sessão de usuário em minutos"
              value={settings.securitySettings.sessionTimeoutMinutes}
              min={10}
              max={1440}
            />
            <NumberSetting
              label="Tentativas de Login"
              description="Número máximo de tentativas de login antes do bloqueio"
              value={settings.securitySettings.maxLoginAttempts}
              min={1}
              max={10}
            />
          </SettingsGroup>

          {/* Configurações de Email */}
          <SettingsGroup 
            title="Notificações de Email" 
            description="Configurações para emails e notificações do sistema" 
            icon={<Mail className="h-5 w-5 text-primary" />}
          >
            <SwitchSetting
              label="Ativar Notificações"
              description="Ativar notificações por email para usuários"
              checked={settings.emailSettings.enableEmailNotifications}
            />
            <SwitchSetting
              label="Email de Boas-vindas"
              description="Enviar email de boas-vindas para novos usuários"
              checked={settings.emailSettings.sendWelcomeEmail}
            />
            <SwitchSetting
              label="Relatório Diário"
              description="Enviar relatório diário de atividades para administradores"
              checked={settings.emailSettings.dailyReportEnabled}
            />
            <SwitchSetting
              label="Relatório Semanal"
              description="Enviar relatório semanal de atividades para administradores"
              checked={settings.emailSettings.weeklyReportEnabled}
            />
          </SettingsGroup>
          
          {/* Configurações de Integração */}
          <SettingsGroup 
            title="Integrações" 
            description="Configurações de integrações e APIs" 
            icon={<Cloud className="h-5 w-5 text-primary" />}
          >
            <SwitchSetting
              label="Integração Looker Studio"
              description="Permitir integração com o Looker Studio"
              checked={settings.integrationSettings.enableLookerStudioIntegration}
            />
            <SwitchSetting
              label="Acesso API"
              description="Permitir acesso via API para integrações externas"
              checked={settings.integrationSettings.enableApiAccess}
            />
            <SwitchSetting
              label="Autenticação Externa"
              description="Permitir autenticação através de serviços externos (Google, GitHub, etc.)"
              checked={settings.integrationSettings.enableExternalAuth}
            />
          </SettingsGroup>
        </div>
        
        <div className="space-y-6">
          {/* Configurações de Limites */}
          <SettingsGroup 
            title="Limites do Sistema" 
            description="Limites e restrições do sistema" 
            icon={<Database className="h-5 w-5 text-primary" />}
          >
            <NumberSetting
              label="Times por Usuário"
              description="Número máximo de times que um usuário pode criar"
              value={settings.limits.maxTeamsPerUser}
              min={1}
              max={50}
            />
            <NumberSetting
              label="Membros por Time"
              description="Número máximo de membros por time"
              value={settings.limits.maxMembersPerTeam}
              min={1}
              max={500}
            />
            <NumberSetting
              label="Dashboards por Time"
              description="Número máximo de dashboards por time"
              value={settings.limits.maxDashboardsPerTeam}
              min={1}
              max={100}
            />
          </SettingsGroup>
          
          {/* Configurações de Manutenção */}
          <SettingsGroup 
            title="Manutenção" 
            description="Configurações de manutenção do sistema" 
            icon={<Settings className="h-5 w-5 text-primary" />}
          >
            <SwitchSetting
              label="Modo de Manutenção"
              description="Ativar modo de manutenção (apenas superadmins terão acesso)"
              checked={settings.maintenanceSettings.maintenanceMode}
            />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="backupFrequency" className="text-base font-medium">
                  Frequência de Backup
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Frequência com que os backups são realizados
                </p>
              </div>
              <select 
                id="backupFrequency" 
                className="border rounded px-3 py-2"
                value={settings.maintenanceSettings.backupFrequency}
              >
                <option value="hourly">A cada hora</option>
                <option value="daily">Diário</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
              </select>
            </div>
            <NumberSetting
              label="Retenção de Dados"
              description="Número de dias para retenção de logs e backups"
              value={settings.maintenanceSettings.retentionDays}
              min={1}
              max={365}
            />
          </SettingsGroup>
          
          {/* Botão para resetar todas as configurações */}
          <div className="mt-6">
            <Button variant="outline" className="w-full">Restaurar Configurações Padrão</Button>
          </div>
        </div>
      </div>
    </div>
  );
} 