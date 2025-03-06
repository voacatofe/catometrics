// Script para redefinir a senha de um usuário no banco de dados
const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

// O email do usuário que deseja redefinir a senha
const userEmail = 'darlan@catofe.com.br'; 
// Nova senha (deve ter pelo menos 6 caracteres)
const newPassword = 'senha123'; 

async function resetPassword() {
  try {
    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: {
        email: userEmail,
      },
    });

    if (!user) {
      console.error('Usuário não encontrado');
      return;
    }

    // Gerar o hash da nova senha
    const hashedPassword = await hash(newPassword, 10);

    // Atualizar a senha do usuário
    await prisma.user.update({
      where: {
        email: userEmail,
      },
      data: {
        password: hashedPassword,
      },
    });

    console.log('Senha redefinida com sucesso para o usuário:', userEmail);
  } catch (error) {
    console.error('Erro ao redefinir a senha:', error);
  } finally {
    // Encerrar a conexão com o Prisma
    await prisma.$disconnect();
  }
}

// Executar a função
resetPassword(); 