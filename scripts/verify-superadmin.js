// Script para verificar o status de superadmin
// Execute com: node scripts/verify-superadmin.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifySuperAdmin() {
  console.log('Iniciando verificação de superadmin...');
  
  try {
    // Buscar o usuário admin
    const admin = await prisma.user.findUnique({
      where: {
        email: 'admin@catometrics.com.br'
      }
    });
    
    if (!admin) {
      console.error('❌ Usuário administrador não encontrado!');
      return;
    }
    
    console.log('Usuário administrador encontrado:');
    console.log(`- ID: ${admin.id}`);
    console.log(`- Nome: ${admin.name}`);
    console.log(`- Email: ${admin.email}`);
    console.log(`- Status: ${admin.isActive ? 'Ativo' : 'Inativo'}`);
    console.log(`- SuperAdmin: ${admin.isSuperAdmin ? 'Sim' : 'Não'}`);
    
    // Se não for superadmin, atualizar
    if (!admin.isSuperAdmin) {
      console.log('\nAtualizando status para SuperAdmin...');
      
      const updated = await prisma.user.update({
        where: { id: admin.id },
        data: { isSuperAdmin: true }
      });
      
      console.log(`✅ Status atualizado: SuperAdmin = ${updated.isSuperAdmin}`);
    } else {
      console.log('\n✅ O usuário já possui o status de SuperAdmin!');
    }
    
  } catch (error) {
    console.error('Erro durante a verificação:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nVerificação concluída.');
  }
}

verifySuperAdmin(); 