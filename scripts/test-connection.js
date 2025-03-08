// Script para testar a conexão com o banco de dados
const { PrismaClient } = require('@prisma/client');

console.log('Iniciando teste de conexão com o banco de dados...');
console.log('URL do banco de dados:', process.env.DATABASE_URL);

const prisma = new PrismaClient();

async function testConnection() {
  try {
    // Testar conexão com o banco de dados
    console.log('Tentando conectar ao banco de dados...');
    
    // Tentar uma consulta simples para verificar a conexão
    const usersCount = await prisma.user.count();
    console.log('Conexão bem-sucedida!');
    console.log(`Total de usuários no banco de dados: ${usersCount}`);
    
    // Buscar detalhes do usuário específico
    console.log('Buscando detalhes do usuário admin@catometrics.com.br...');
    const user = await prisma.user.findUnique({
      where: {
        email: 'admin@catometrics.com.br',
      },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        isSuperAdmin: true,
        lastLogin: true,
        // Não selecionar a senha por segurança
      },
    });
    
    if (user) {
      console.log('Usuário encontrado:', JSON.stringify(user, null, 2));
    } else {
      console.error('Usuário não encontrado!');
    }
    
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
  } finally {
    // Encerrar a conexão com o Prisma
    await prisma.$disconnect();
  }
}

// Executar o teste
testConnection()
  .then(() => {
    console.log('Teste de conexão concluído.');
  })
  .catch((err) => {
    console.error('Erro geral na execução do teste:', err);
  }); 