// Script para verificar o banco de dados PostgreSQL
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('Verificando conexão com o banco de dados...');
  
  try {
    // Verificar conexão
    await prisma.$connect();
    console.log('Conexão com o banco de dados estabelecida com sucesso!\n');
    
    // Verificar dashboards
    console.log('=== VERIFICANDO DASHBOARDS ===');
    const dashboards = await prisma.dashboard.findMany({
      include: {
        team: {
          select: {
            name: true,
          },
        },
      },
    });
    
    console.log(`Total de dashboards: ${dashboards.length}`);
    
    if (dashboards.length > 0) {
      console.log('\nPrimeiro dashboard:');
      const dashboard = dashboards[0];
      console.log('ID:', dashboard.id);
      console.log('Nome:', dashboard.name);
      console.log('URL:', dashboard.url);
      console.log('Time:', dashboard.team.name);
      console.log('Ativo:', dashboard.isActive);
      console.log('Data de Criação:', dashboard.createdAt);
      console.log('Tipo da Data de Criação:', typeof dashboard.createdAt);
      console.log('É instância de Date?', dashboard.createdAt instanceof Date);
      console.log('Valor bruto:', JSON.stringify(dashboard.createdAt));
    }
    
    // Verificar usuários
    console.log('\n=== VERIFICANDO USUÁRIOS ===');
    const users = await prisma.user.findMany();
    
    console.log(`Total de usuários: ${users.length}`);
    
    if (users.length > 0) {
      console.log('\nPrimeiro usuário:');
      const user = users[0];
      console.log('ID:', user.id);
      console.log('Nome:', user.name);
      console.log('Email:', user.email);
      console.log('Super Admin:', user.isSuperAdmin);
      console.log('Ativo:', user.isActive);
      console.log('Data de Criação:', user.createdAt);
      console.log('Tipo da Data de Criação:', typeof user.createdAt);
      console.log('É instância de Date?', user.createdAt instanceof Date);
      console.log('Valor bruto:', JSON.stringify(user.createdAt));
      console.log('Último Login:', user.lastLogin);
      if (user.lastLogin) {
        console.log('Tipo do Último Login:', typeof user.lastLogin);
        console.log('É instância de Date?', user.lastLogin instanceof Date);
        console.log('Valor bruto:', JSON.stringify(user.lastLogin));
      }
    }
    
    console.log('\nVerificação concluída com sucesso!');
  } catch (error) {
    console.error('Erro ao verificar o banco de dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase(); 