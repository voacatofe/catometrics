// Script para redefinir a senha do usuário administrador
const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

// Dados do usuário administrador
const userData = {
  email: 'admin@catometrics.com.br',
  password: 'CatoMetrics@2024' // Nova senha segura
};

async function resetAdminPassword() {
  try {
    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: {
        email: userData.email,
      },
    });

    if (!existingUser) {
      console.error('Usuário administrador não encontrado!');
      return;
    }

    console.log('Usuário encontrado. Atualizando a senha...');
    
    // Gerar o hash da nova senha
    const hashedPassword = await hash(userData.password, 10);
    
    // Atualizar a senha
    await prisma.user.update({
      where: {
        email: userData.email,
      },
      data: {
        password: hashedPassword,
      },
    });
    
    console.log('Senha do administrador atualizada com sucesso!');
  } catch (error) {
    console.error('Erro ao atualizar senha do administrador:', error);
  } finally {
    // Encerrar a conexão com o Prisma
    await prisma.$disconnect();
  }
}

// Executar a função
resetAdminPassword(); 