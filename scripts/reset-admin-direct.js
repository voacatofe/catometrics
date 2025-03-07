// Script para redefinir a senha do administrador usando SQL direto
const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

// Carregando variáveis de ambiente manualmente
process.env.DATABASE_URL = "postgresql://postgres:4fffda1131930d7b80f9@147.93.15.121:5433/catometrics?schema=public";

const prisma = new PrismaClient();

// Dados do usuário administrador
const userData = {
  email: 'admin@catometrics.com.br',
  password: 'CatoMetrics@2024' // Nova senha segura
};

async function resetAdminPassword() {
  try {
    console.log('Iniciando script de redefinição de senha...');
    console.log('Usando conexão:', process.env.DATABASE_URL);
    
    // Gerar o hash da nova senha
    const hashedPassword = await hash(userData.password, 10);
    console.log('Hash da senha gerado com sucesso');
    
    // Verificar se o usuário existe e atualizar a senha usando consulta SQL nativa
    console.log('Verificando usuário e atualizando senha...');
    
    try {
      const result = await prisma.$executeRaw`
        UPDATE users 
        SET password = ${hashedPassword},
            "updatedAt" = NOW()
        WHERE email = ${userData.email}
      `;
      
      console.log('Resultado da atualização:', result);
      
      if (result > 0) {
        console.log('Senha do administrador atualizada com sucesso!');
        console.log('Email:', userData.email);
        console.log('Nova senha:', userData.password);
      } else {
        console.error('Usuário administrador não encontrado ou não foi atualizado!');
      }
    } catch (sqlError) {
      console.error('Erro na execução do SQL:', sqlError);
    }
  } catch (error) {
    console.error('Erro ao atualizar senha do administrador:', error);
  } finally {
    // Encerrar a conexão com o Prisma
    await prisma.$disconnect();
    console.log('Conexão com o banco de dados encerrada');
  }
}

// Executar a função
resetAdminPassword(); 