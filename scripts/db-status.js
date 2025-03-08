// Script para verificar o status da conexão com o banco de dados
const { PrismaClient } = require('@prisma/client');

console.log('=== DIAGNÓSTICO DE CONEXÃO COM BANCO DE DADOS ===');
console.log('Iniciando teste em:', new Date().toISOString());
console.log('DATABASE_URL:', process.env.DATABASE_URL || 'Não definido no ambiente atual');

const prisma = new PrismaClient({
  log: ['error', 'warn', 'query'],
});

async function checkDBStatus() {
  try {
    console.log('\n1. Testando conexão básica...');
    // Verificar conexão básica
    const result = await prisma.$queryRaw`SELECT 1 as status`;
    console.log('✅ Conexão básica com o banco de dados OK:', result);
    
    console.log('\n2. Verificando contagem de usuários...');
    // Verificar contagem de usuários
    const userCount = await prisma.user.count();
    console.log(`✅ Consulta bem-sucedida! Total de usuários: ${userCount}`);
    
    console.log('\n3. Verificando detalhes do usuário administrador...');
    // Verificar usuário admin
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
        // Não exibir a senha por segurança
      }
    });
    
    if (admin) {
      console.log('✅ Usuário admin encontrado:');
      console.log(JSON.stringify(admin, null, 2));
    } else {
      console.log('❌ Usuário admin não encontrado!');
    }
    
    console.log('\n4. Verificando tabelas e esquema...');
    // Verificar se as tabelas do esquema existem
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('✅ Tabelas encontradas:', tables.length);
    console.log(tables.map(t => t.table_name).join(', '));
    
    return true;
  } catch (error) {
    console.error('\n❌ ERRO DE CONEXÃO COM BANCO DE DADOS:');
    console.error(error);
    
    // Diagnóstico adicional
    console.log('\n=== INFORMAÇÕES DE DIAGNÓSTICO ===');
    console.log('Tipo de erro:', error.name);
    console.log('Código:', error.code);
    console.log('Cliente Prisma:', prisma ? 'Inicializado' : 'Não inicializado');
    
    if (error.message.includes('connect')) {
      console.log('\nDica: Este parece ser um problema de conexão com o servidor.');
      console.log('Verifique se o endereço IP e porta estão corretos e acessíveis.');
      console.log('Verifique também configurações de firewall e grupo de segurança.');
    }
    
    if (error.message.includes('authentication')) {
      console.log('\nDica: Este parece ser um problema de autenticação.');
      console.log('Verifique se as credenciais (usuário/senha) estão corretas.');
    }
    
    return false;
  } finally {
    console.log('\nFinalizando conexão...');
    await prisma.$disconnect().catch(console.error);
  }
}

console.log('Iniciando verificação de status do banco de dados...');
checkDBStatus()
  .then(isConnected => {
    console.log(`\n=== RESULTADO FINAL ===`);
    console.log(`Status: ${isConnected ? '✅ CONECTADO' : '❌ FALHA NA CONEXÃO'}`);
    console.log('Teste concluído em:', new Date().toISOString());
    process.exit(isConnected ? 0 : 1);
  })
  .catch(err => {
    console.error('Erro inesperado durante a execução do teste:', err);
    process.exit(1);
  }); 