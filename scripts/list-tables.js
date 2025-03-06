// Script para listar todas as tabelas no banco de dados
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listTables() {
  try {
    // Para PostgreSQL, podemos consultar as tabelas diretamente
    const query = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    // Executar a consulta raw
    const tables = await prisma.$queryRawUnsafe(query);
    
    console.log('Tabelas encontradas no banco de dados:');
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.table_name}`);
    });
    
    // Agora vamos contar registros em cada tabela para verificar se há dados
    console.log('\nContagem de registros em tabelas importantes:');
    
    try {
      const userCount = await prisma.user.count();
      console.log(`- Usuários (User): ${userCount}`);
    } catch (e) {
      console.log(`- Erro ao contar usuários:`, e.message);
    }
    
    try {
      const teamCount = await prisma.team.count();
      console.log(`- Times (Team): ${teamCount}`);
    } catch (e) {
      console.log(`- Erro ao contar times:`, e.message);
    }
    
    try {
      const teamMemberCount = await prisma.teamMember.count();
      console.log(`- Membros de times (TeamMember): ${teamMemberCount}`);
    } catch (e) {
      console.log(`- Erro ao contar membros de times:`, e.message);
    }
    
    // Verificar usuários existentes (só mostrar os 5 primeiros)
    try {
      console.log('\nUsuários cadastrados (primeiros 5):');
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
        },
        take: 5
      });
      
      if (users.length === 0) {
        console.log('Nenhum usuário cadastrado.');
      } else {
        users.forEach(user => {
          console.log(`- ${user.name} (${user.email})`);
        });
      }
    } catch (e) {
      console.log(`- Erro ao listar usuários:`, e.message);
    }
    
  } catch (error) {
    console.error('Erro ao listar tabelas:', error);
  } finally {
    // Encerrar a conexão com o Prisma
    await prisma.$disconnect();
  }
}

// Executar a função
listTables(); 