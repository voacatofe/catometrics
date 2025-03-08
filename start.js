// Script de inicialização que define variáveis de ambiente antes de iniciar o servidor Next.js
const { spawn } = require('child_process');

// Definir variáveis de ambiente críticas diretamente no código
process.env.DATABASE_URL = "postgresql://postgres:4fffda1131930d7b80f9@147.93.15.121:5433/catometrics?schema=public";
process.env.NEXTAUTH_URL = "https://catometrics.com.br";
process.env.NEXTAUTH_SECRET = "umValorAleatorioMuitoSeguro123456";

console.log('Variáveis de ambiente configuradas:');
console.log('DATABASE_URL definida');
console.log('NEXTAUTH_URL definida');
console.log('NEXTAUTH_SECRET definida');

// Inicia o servidor Next.js
console.log('Iniciando o servidor Next.js...');
const nextStart = spawn('node', ['node_modules/next/dist/bin/next', 'start']);

// Encaminha logs do Next.js para o console
nextStart.stdout.on('data', (data) => {
  console.log(`${data}`);
});

nextStart.stderr.on('data', (data) => {
  console.error(`${data}`);
});

nextStart.on('close', (code) => {
  console.log(`Processo Next.js encerrado com código ${code}`);
});

// Lidar com sinais de encerramento
process.on('SIGINT', () => {
  console.log('Recebido SIGINT, encerrando...');
  nextStart.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Recebido SIGTERM, encerrando...');
  nextStart.kill();
  process.exit(0);
}); 