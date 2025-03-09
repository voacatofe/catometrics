"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Check, X, Info } from "lucide-react";

export default function AdminDebugPage() {
  const { data: session, status } = useSession();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Verificar status da autenticação
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/debug/auth-status');
        if (!response.ok) {
          throw new Error(`Erro ao verificar status: ${response.status}`);
        }
        
        const data = await response.json();
        setDebugInfo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };
    
    if (status !== 'loading') {
      checkAuthStatus();
    }
  }, [status]);
  
  if (status === 'loading' || loading) {
    return <div className="p-8">Carregando informações...</div>;
  }
  
  if (status === 'unauthenticated') {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Diagnóstico de Acesso Admin</h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h2 className="text-lg font-semibold text-red-700 mb-2">Não autenticado</h2>
          <p className="text-red-600 mb-4">É necessário estar logado para acessar esta página.</p>
          <Link 
            href="/login" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Ir para o login
          </Link>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Diagnóstico de Acesso Admin</h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h2 className="text-lg font-semibold text-red-700 mb-2">Erro ao verificar acesso</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }
  
  const isSuperAdminInSession = Boolean(session?.user?.isSuperAdmin);
  const isSuperAdminInDatabase = debugInfo?.databaseUser?.isSuperAdmin || false;
  const discrepancy = isSuperAdminInSession !== isSuperAdminInDatabase;
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Diagnóstico de Acesso Admin</h1>
      
      <div className="grid gap-6">
        <div className="p-4 bg-gray-50 border rounded-md">
          <h2 className="text-lg font-semibold mb-2">Status da Sessão</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="font-medium mr-2">Autenticado:</span>
              {session ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <X className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div>
              <span className="font-medium">Usuário:</span>{" "}
              <span>{session?.user?.name || session?.user?.email || 'N/A'}</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium mr-2">SuperAdmin na sessão:</span>
              {isSuperAdminInSession ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <X className="h-5 w-5 text-red-600" />
              )}
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 border rounded-md">
          <h2 className="text-lg font-semibold mb-2">Status no Banco de Dados</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="font-medium mr-2">Usuário encontrado:</span>
              {debugInfo?.databaseUser ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <X className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div>
              <span className="font-medium">ID:</span>{" "}
              <span>{debugInfo?.databaseUser?.id || 'N/A'}</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium mr-2">SuperAdmin no banco:</span>
              {isSuperAdminInDatabase ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <X className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div>
              <span className="font-medium">Último login:</span>{" "}
              <span>{debugInfo?.databaseUser?.lastLogin 
                ? new Date(debugInfo.databaseUser.lastLogin).toLocaleString() 
                : 'Nunca'}</span>
            </div>
          </div>
        </div>
        
        {discrepancy && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
            <h2 className="text-lg font-semibold text-amber-700 mb-2 flex items-center">
              <Info className="h-5 w-5 mr-2" />
              Discrepância Detectada
            </h2>
            <p className="text-amber-600 mb-2">
              Há uma diferença entre o status de SuperAdmin na sessão e no banco de dados.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <h3 className="font-medium mb-1">Na Sessão:</h3>
                <p>{isSuperAdminInSession ? 'É SuperAdmin' : 'Não é SuperAdmin'}</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">No Banco de Dados:</h3>
                <p>{isSuperAdminInDatabase ? 'É SuperAdmin' : 'Não é SuperAdmin'}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm">
                Isso pode causar problemas de acesso. Tente sair e entrar novamente para 
                atualizar a sessão com os dados corretos do banco de dados.
              </p>
            </div>
          </div>
        )}
        
        <div className="p-4 bg-gray-50 border rounded-md">
          <h2 className="text-lg font-semibold mb-2">Diagnóstico de Acesso</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="font-medium mr-2">Pode acessar páginas admin:</span>
              {debugInfo?.canAccessAdminPages ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <X className="h-5 w-5 text-red-600" />
              )}
            </div>
          </div>
          
          <div className="mt-6 space-y-4">
            <h3 className="font-medium">Links para Páginas Admin:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link 
                href="/admin" 
                className="px-4 py-2 border rounded-md hover:bg-gray-100 text-center"
              >
                Painel Admin
              </Link>
              <Link 
                href="/admin/teams" 
                className="px-4 py-2 border rounded-md hover:bg-gray-100 text-center"
              >
                Gerenciar Times
              </Link>
              <Link 
                href="/admin/users" 
                className="px-4 py-2 border rounded-md hover:bg-gray-100 text-center"
              >
                Gerenciar Usuários
              </Link>
              <Link 
                href="/admin/dashboards" 
                className="px-4 py-2 border rounded-md hover:bg-gray-100 text-center"
              >
                Gerenciar Dashboards
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-6 space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Atualizar Informações
          </button>
          
          <Link 
            href="/dashboard" 
            className="px-4 py-2 border rounded-md hover:bg-gray-100 inline-block ml-4"
          >
            Voltar para Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
} 