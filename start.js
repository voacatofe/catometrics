// Script de inicialização personalizado para o ambiente de produção

// Verifica se estamos em produção
const isProd = process.env.NODE_ENV === 'production';

// Configurações padrão
const port = process.env.PORT || 3000;
const hostname = process.env.HOSTNAME || '0.0.0.0';

// Se estamos em produção, tenta carregar o servidor do modo standalone
if (isProd) {
  try {
    console.log('Iniciando servidor em modo standalone...');
    console.log(`Endereço: ${hostname}:${port}`);
    
    // Tenta carregar e iniciar o servidor
    const nextServerPath = require.resolve('./.next/standalone/server.js');
    console.log(`Carregando servidor de: ${nextServerPath}`);
    
    // Seta a variável de ambiente PORT para garantir que o servidor inicie na porta correta
    process.env.PORT = port;
    
    // Carrega o servidor
    require(nextServerPath);
  } catch (error) {
    console.error('Erro ao iniciar o servidor em modo standalone:');
    console.error(error);
    
    // Tenta iniciar usando o método padrão como fallback
    console.log('Tentando iniciar usando o método padrão...');
    try {
      const { default: startServer } = require('next/dist/server/production-server');
      startServer({
        dir: '.',
        port,
        hostname,
      });
    } catch (fallbackError) {
      console.error('Erro ao tentar método de fallback:');
      console.error(fallbackError);
      process.exit(1);
    }
  }
} else {
  // Em desenvolvimento, simplesmente inicia o servidor Next.js
  console.log('Ambiente de desenvolvimento detectado. Use "npm run dev" para desenvolvimento.');
  process.exit(0);
} 