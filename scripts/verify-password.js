// Script para verificar a senha de um usuário
const { PrismaClient } = require('@prisma/client');
const { compare } = require('bcryptjs');

console.log('Iniciando verificação de senha...');

const prisma = new PrismaClient();
const userEmail = 'admin@catometrics.com.br';
const passwordToTest = 'senha123';

async function verifyPassword() {
  try {
    // Buscar usuário
    console.log(`Buscando usuário: ${userEmail}`);
    const user = await prisma.user.findUnique({
      where: {
        email: userEmail,
      },
      select: {
        id: true,
        email: true,
        password: true, // Precisamos da senha para comparação
        isActive: true,
      },
    });
    
    if (!user) {
      console.error('Usuário não encontrado!');
      return;
    }
    
    console.log(`Usuário ${userEmail} encontrado (ID: ${user.id})`);
    console.log(`Status da conta: ${user.isActive ? 'Ativa' : 'Inativa'}`);
    
    // Verificar se a senha está presente
    if (!user.password) {
      console.error('O usuário não tem senha definida!');
      return;
    }
    
    // Verificar se a senha coincide
    console.log(`Testando senha: "${passwordToTest}"`);
    const isPasswordValid = await compare(passwordToTest, user.password);
    
    if (isPasswordValid) {
      console.log('✅ SENHA CORRETA! A senha fornecida é válida.');
    } else {
      console.error('❌ SENHA INCORRETA! A senha fornecida não coincide.');
      console.log('Dica: Verifique se há espaços extras ou erros de digitação.');
    }
    
  } catch (error) {
    console.error('Erro durante a verificação:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar a verificação
verifyPassword()
  .then(() => {
    console.log('Verificação de senha concluída.');
  })
  .catch((err) => {
    console.error('Erro geral na execução do script:', err);
  }); 