// Script para criar um usuário administrador diretamente no banco de dados
// usando consultas SQL nativas para garantir compatibilidade
const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');
const { randomUUID } = require('crypto');

const prisma = new PrismaClient();

// Dados do novo usuário
const userData = {
  name: 'Administrador',
  email: 'admin@catometrics.com.br',
  password: 'admin123' // Deve ter pelo menos 6 caracteres
};

async function createUser() {
  try {
    console.log('Verificando se o usuário já existe...');
    
    // Verificar se o usuário já existe usando consulta SQL nativa
    const existingUserResult = await prisma.$queryRaw`
      SELECT * FROM users WHERE email = ${userData.email}
    `;
    
    if (existingUserResult && existingUserResult.length > 0) {
      console.log('Usuário já existe. Atualizando a senha...');
      
      // Gerar o hash da nova senha
      const hashedPassword = await hash(userData.password, 10);
      
      // Atualizar a senha
      await prisma.$executeRaw`
        UPDATE users 
        SET password = ${hashedPassword} 
        WHERE email = ${userData.email}
      `;
      
      console.log('Senha atualizada com sucesso');
      return;
    }

    console.log('Criando novo usuário...');
    
    // Gerar o hash da senha
    const hashedPassword = await hash(userData.password, 10);
    
    // Gerar um ID único
    const userId = randomUUID();
    
    // Data atual
    const now = new Date();
    
    // Criar o usuário usando consulta SQL nativa
    await prisma.$executeRaw`
      INSERT INTO users (
        id, 
        name, 
        email, 
        password, 
        "createdAt", 
        "updatedAt"
      ) VALUES (
        ${userId}, 
        ${userData.name}, 
        ${userData.email}, 
        ${hashedPassword}, 
        ${now}, 
        ${now}
      )
    `;

    console.log('Usuário criado com sucesso:', userData.email);
    console.log('ID do usuário:', userId);
    
  } catch (error) {
    console.error('Erro ao manipular usuário:', error);
  } finally {
    // Encerrar a conexão com o Prisma
    await prisma.$disconnect();
  }
}

// Executar a função
createUser(); 