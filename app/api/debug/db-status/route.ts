import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// ATENÇÃO: Este é um endpoint temporário de diagnóstico.
// REMOVA após solucionar os problemas de banco de dados!

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    databaseUrl: process.env.DATABASE_URL?.replace(/:[^:]+@/, ':****@'), // Esconde a senha
    steps: {},
    errors: [],
  };

  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });

  try {
    // Passo 1: Testar conexão básica
    try {
      results.steps.basicConnection = "Iniciando...";
      const result = await prisma.$queryRaw`SELECT 1 as status`;
      results.steps.basicConnection = "Sucesso";
    } catch (error: any) {
      results.steps.basicConnection = "Falha";
      results.errors.push({
        step: "basicConnection",
        message: error.message,
        code: error.code
      });
    }

    // Passo 2: Verificar contagem de usuários
    if (!results.errors.length) {
      try {
        results.steps.userCount = "Iniciando...";
        const userCount = await prisma.user.count();
        results.steps.userCount = `Sucesso: ${userCount} usuários encontrados`;
      } catch (error: any) {
        results.steps.userCount = "Falha";
        results.errors.push({
          step: "userCount",
          message: error.message,
          code: error.code
        });
      }
    }

    // Passo 3: Verificar usuário admin
    if (!results.errors.length) {
      try {
        results.steps.adminCheck = "Iniciando...";
        const admin = await prisma.user.findUnique({
          where: {
            email: 'admin@catometrics.com.br',
          },
          select: {
            id: true,
            email: true,
            name: true,
            isActive: true,
            isSuperAdmin: true,
          }
        });
        
        if (admin) {
          results.steps.adminCheck = "Sucesso: Usuário admin encontrado";
          results.admin = admin;
        } else {
          results.steps.adminCheck = "Aviso: Usuário admin não encontrado";
        }
      } catch (error: any) {
        results.steps.adminCheck = "Falha";
        results.errors.push({
          step: "adminCheck",
          message: error.message,
          code: error.code
        });
      }
    }

    // Passo 4: Verificar tabelas
    if (!results.errors.length) {
      try {
        results.steps.tableCheck = "Iniciando...";
        const tables = await prisma.$queryRaw`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
        `;
        results.steps.tableCheck = `Sucesso: ${(tables as any[]).length} tabelas encontradas`;
        results.tables = (tables as any[]).map((t: any) => t.table_name);
      } catch (error: any) {
        results.steps.tableCheck = "Falha";
        results.errors.push({
          step: "tableCheck",
          message: error.message,
          code: error.code
        });
      }
    }

    results.success = results.errors.length === 0;
    results.message = results.success 
      ? "Diagnóstico concluído com sucesso" 
      : `Diagnóstico falhou em: ${results.errors.map((e: any) => e.step).join(', ')}`;

  } catch (error: any) {
    results.success = false;
    results.message = "Erro geral no diagnóstico";
    results.mainError = {
      message: error.message,
      name: error.name,
      code: error.code
    };
  } finally {
    await prisma.$disconnect().catch(console.error);
  }

  return NextResponse.json(results);
} 