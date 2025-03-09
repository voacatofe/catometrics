# Guia de Desenvolvimento do Catometrics

Este documento contém boas práticas e lições aprendidas durante o desenvolvimento do projeto Catometrics.

## Dependências e Ambiente

### Gerenciamento de Pacotes
- **Sempre use `npm install` após atualizar o package.json**: Isso garante que o package-lock.json seja atualizado junto com as dependências
- **Prefira `npm install` em vez de `npm ci` em ambientes Docker**: O `npm install` é mais flexível para resolver diferenças em versões de dependências
- **Ao adicionar dependências usadas no código**: Certifique-se de incluí-las explicitamente no package.json com `npm install --save nome-do-pacote`

### Docker e Deployment
- **Instale as dependências do sistema no Dockerfile**:
  ```dockerfile
  RUN apt-get update && apt-get install -y \
      openssl \
      libssl-dev \
      ca-certificates \
      && rm -rf /var/lib/apt/lists/*
  ```
- **Configure o Prisma para não exigir libssl**:
  ```json
  "prisma": {
    "schema": "prisma/schema.prisma",
    "engine": {
      "binary": {
        "requireLibSsl": false
      }
    }
  }
  ```
- **Adicione suporte a múltiplos binários no Prisma**:
  ```prisma
  generator client {
    provider      = "prisma-client-js"
    binaryTargets = ["native", "debian-openssl-1.1.x"]
  }
  ```

## Desenvolvimento com Next.js

### Client-side Hooks
- **Envolva o `useSearchParams` em Suspense**: No Next.js 14+, hooks como useSearchParams precisam estar dentro de um componente Suspense
  ```jsx
  import { Suspense } from "react"
  
  // Componente que usa useSearchParams
  function FormWithParams() {
    const searchParams = useSearchParams()
    // resto do código
  }
  
  // Componente principal
  export default function Page() {
    return (
      <Suspense fallback={<FallbackComponent />}>
        <FormWithParams />
      </Suspense>
    )
  }
  ```

- **Utilize fallbacks adequados**: Crie componentes de fallback que representem a estrutura do conteúdo carregado
  ```jsx
  function FallbackComponent() {
    return (
      <div className="animate-pulse">
        {/* Esqueleto da UI */}
      </div>
    )
  }
  ```

### Estrutura e Organização
- **Separe componentes por responsabilidade**: Extraia lógicas complexas para componentes menores e focados
- **Mantenha partes estáticas e dinâmicas separadas**: Facilita a otimização e o diagnóstico de problemas

## Banco de Dados e Autenticação

### Prisma
- **Garanta que o adaptador do Prisma para NextAuth esteja instalado**: `@next-auth/prisma-adapter`
- **Evite depender exclusivamente de variáveis de ambiente**: Para ambientes de produção, considere valores diretos no código ou configurações mais robustas
- **Implemente verificações regulares de conexão**: Crie scripts de diagnóstico para testar a conectividade do banco de dados

### NextAuth
- **Adicione logging detalhado**: Facilita o diagnóstico de problemas de autenticação
- **Padronize as mensagens de erro**: Torne as mensagens mais claras e úteis para os usuários
- **Garanta todas as dependências**: Verifique se pacotes como `bcryptjs` e outros utilizados pelo sistema de autenticação estão corretamente instalados

---

**Última atualização**: Março de 2025

*Este documento deve ser regularmente atualizado com novas descobertas e melhores práticas.* 