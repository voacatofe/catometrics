// Script para criar um novo usuário administrador no banco de dados
const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

// Dados do novo usuário
const userData = {
  name: 'Administrador',
  email: 'admin@catometrics.com.br',
  password: 'admin123' // Deve ter pelo menos 6 caracteres
};

async function createUser() {
  try {
    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: {
        email: userData.email,
      },
    });

    if (existingUser) {
      console.log('Usuário já existe. Atualizando a senha...');
      
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
      
      console.log('Senha atualizada com sucesso');
      return;
    }

    // Gerar o hash da senha
    const hashedPassword = await hash(userData.password, 10);

    // Criar o usuário
    const newUser = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
      },
    });

    console.log('Usuário criado com sucesso:', newUser.email);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
  } finally {
    // Encerrar a conexão com o Prisma
    await prisma.$disconnect();
  }
}

// Executar a função
createUser(); 