// Script para gerar e aplicar migrações do Prisma para alinhar o schema com o banco de dados existente
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Iniciando processo de atualização do schema...');

try {
  console.log('Gerando arquivo de migração...');
  
  // Criar migração com nome descritivo
  execSync('npx prisma migrate dev --name ajuste_mapeamento_tabelas --create-only', { 
    stdio: 'inherit' 
  });
  
  console.log('Migração gerada com sucesso!');
  
  // Determinando o caminho para a pasta de migrações
  const migrationsDir = path.join(__dirname, '..', 'prisma', 'migrations');
  const directories = fs.readdirSync(migrationsDir);
  
  // Encontrando a pasta da migração mais recente (começa com data)
  const latestMigration = directories
    .filter(dir => /^\d{14}_ajuste_mapeamento_tabelas$/.test(dir))
    .sort()
    .pop();
    
  if (!latestMigration) {
    throw new Error('Não foi possível encontrar o arquivo de migração gerado');
  }
  
  const migrationFilePath = path.join(migrationsDir, latestMigration, 'migration.sql');
  
  console.log(`Editando o arquivo de migração: ${migrationFilePath}`);
  
  // Substituir o conteúdo do arquivo de migração para evitar alterações no banco
  // Uma vez que as tabelas já existem, queremos apenas mapeá-las
  fs.writeFileSync(migrationFilePath, `
-- Este é um arquivo de migração modificado manualmente
-- As tabelas já existem no banco de dados, esta migração apenas atualiza o mapeamento no Prisma

-- Sinalizar para o Prisma que esta migração foi aplicada sem efetuar mudanças no banco
-- Isso apenas sincroniza os modelos Prisma com as tabelas existentes
  `);
  
  console.log('Arquivo de migração modificado com sucesso');
  
  // Aplicando a migração
  console.log('Aplicando a migração...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  
  // Gerando o cliente Prisma atualizado
  console.log('Gerando cliente Prisma...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('\nProcesso concluído com sucesso!');
  console.log('O schema do Prisma está agora mapeado corretamente para as tabelas existentes no banco de dados.');
  console.log('Reinicie o aplicativo para que as alterações tenham efeito.');
  
} catch (error) {
  console.error('Erro durante o processo de atualização:', error);
  process.exit(1);
} 