// Script para decodificar um token JWT
const jwt = require('jsonwebtoken');

// O segredo usado para assinar o token (deve ser o mesmo do NEXTAUTH_SECRET)
const secret = '9c934064ba2b9fbf6f89c2b46ea4db02';

// Função para decodificar um token JWT
function decodeJWT(token) {
  try {
    // Decodificar cabeçalho e payload sem verificar a assinatura
    const decoded = jwt.decode(token, { complete: true });
    console.log('\n=== Header (Cabeçalho) ===');
    console.log(JSON.stringify(decoded.header, null, 2));
    
    console.log('\n=== Payload ===');
    console.log(JSON.stringify(decoded.payload, null, 2));
    
    console.log('\n=== Verificação de Assinatura ===');
    try {
      // Verificar se o token é válido usando o segredo
      const verified = jwt.verify(token, secret);
      console.log('✅ Assinatura válida!');
      
      // Verificar expiração
      const now = Math.floor(Date.now() / 1000);
      if (decoded.payload.exp && decoded.payload.exp < now) {
        console.log('❌ Token expirado!');
        console.log(`Expirou em: ${new Date(decoded.payload.exp * 1000).toISOString()}`);
        console.log(`Agora: ${new Date().toISOString()}`);
      } else if (decoded.payload.exp) {
        console.log('✅ Token ainda válido');
        console.log(`Expira em: ${new Date(decoded.payload.exp * 1000).toISOString()}`);
      }
    } catch (verifyError) {
      console.log('❌ Assinatura inválida ou token expirado!');
      console.error(verifyError.message);
    }
    
    return decoded;
  } catch (error) {
    console.error('Erro ao decodificar o token:', error.message);
    return null;
  }
}

// Token JWT a ser decodificado (cole seu token aqui)
const token = process.argv[2] || '';

if (!token) {
  console.log('Por favor, forneça um token JWT como argumento.');
  console.log('Exemplo: node decode-jwt.js SEU_TOKEN_JWT');
  process.exit(1);
}

console.log('Decodificando token JWT...');
decodeJWT(token); 