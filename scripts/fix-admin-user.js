// Script para corrigir o usuário administrador e garantir que ele tenha todas as propriedades necessárias
const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

// Carregando variáveis de ambiente manualmente
process.env.DATABASE_URL = "postgresql://postgres:4fffda1131930d7b80f9@147.93.15.121:5433/catometrics?schema=public";

const prisma = new PrismaClient();

// Dados do usuário administrador
const adminData = {
  email: 'admin@catometrics.com.br',
  password: 'CatoMetrics@2024', // Senha definida anteriormente
  name: 'Administrador',
  isSuperAdmin: true,
  isActive: true
};

async function fixAdminUser() {
  try {
    console.log('Iniciando correção do usuário administrador...');
    
    // Verificar se o usuário existe
    const existingUser = await prisma.$queryRaw`
      SELECT id, email, "isSuperAdmin" FROM users WHERE email = ${adminData.email}
    `;
    
    if (!existingUser || existingUser.length === 0) {
      console.error('Usuário administrador não encontrado!');
      
      // Criar o usuário
      console.log('Criando o usuário administrador...');
      
      // Gerar hash da senha
      const hashedPassword = await hash(adminData.password, 10);
      
      // Criar usuário com todas as propriedades necessárias
      const newAdmin = await prisma.user.create({
        data: {
          email: adminData.email,
          name: adminData.name,
          password: hashedPassword,
          isSuperAdmin: true,
          isActive: true
        }
      });
      
      console.log('Usuário administrador criado com sucesso:', newAdmin.email);
      return;
    }
    
    console.log('Usuário encontrado:', existingUser);
    
    // Atualizar o usuário para garantir que tenha todas as propriedades necessárias
    const userId = existingUser[0].id;
    
    // Gerar hash da senha
    const hashedPassword = await hash(adminData.password, 10);
    
    // Atualizar usuário
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: adminData.name,
        password: hashedPassword,
        isSuperAdmin: true,
        isActive: true,
        updatedAt: new Date()
      }
    });
    
    console.log('Usuário administrador atualizado com sucesso!');
    console.log('Email:', adminData.email);
    console.log('Senha:', adminData.password);
    console.log('isSuperAdmin:', true);
    
  } catch (error) {
    console.error('Erro ao corrigir usuário administrador:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Conexão com o banco de dados encerrada');
  }
}

// Executar a função
fixAdminUser(); 