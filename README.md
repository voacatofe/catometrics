# CatoMetrics

CatoMetrics é uma plataforma SaaS que oferece dashboards de métricas de mídia e vendas através de embeds do Looker Studio, com funcionalidades de autenticação, gerenciamento de usuários e times.

## Tecnologias Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript
- **Estilização**: TailwindCSS, Shadcn/UI (baseado em Radix UI)
- **Autenticação**: NextAuth.js
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Hospedagem**: Preparado para Easypanel

## Funcionalidades

- Autenticação completa (login, registro, recuperação de senha)
- Dashboard de métricas via embed do Looker Studio
- Gerenciamento de times (criar, editar, convidar membros)
- Controle de permissões baseado em papéis (admin, owner, member, viewer)
- Interface responsiva e moderna

## Configuração do Ambiente

### Pré-requisitos

- Node.js 18+
- PostgreSQL
- Conta no Looker Studio (para o embed)

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
# Next Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=seu_secret_muito_seguro_aqui

# Database
DATABASE_URL="postgresql://postgres:4ffffa13f9d37b8f09@147.139.1.63:5432/catometrics_db-catometrics?schema=public"

# Email
EMAIL_SERVER_USER=usuario@email.com
EMAIL_SERVER_PASSWORD=senha_email_aqui
EMAIL_SERVER_HOST=smtp.example.com
EMAIL_SERVER_PORT=587
EMAIL_FROM=noreply@catometrics.com

# Looker Studio Embed URL
LOOKER_STUDIO_URL=https://lookerstudio.google.com/embed/seu_dashboard_id
```

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/catometrics.git
   cd catometrics
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Execute as migrações do banco de dados:
   ```bash
   npx prisma migrate dev
   ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

5. Acesse a aplicação em `http://localhost:3000`

## Estrutura do Projeto

```
catometrics/
├── app/                    # Rotas e páginas (Next.js App Router)
│   ├── (auth)/             # Rotas de autenticação
│   ├── (dashboard)/        # Rotas protegidas do dashboard
│   └── api/                # Rotas da API
├── components/             # Componentes React
│   ├── ui/                 # Componentes de UI reutilizáveis
│   ├── dashboard/          # Componentes específicos do dashboard
│   └── teams/              # Componentes relacionados a times
├── lib/                    # Utilitários e configurações
├── prisma/                 # Schema e migrações do Prisma
└── types/                  # Definições de tipos TypeScript
```

## Deploy no Easypanel

1. Crie um novo serviço no Easypanel
2. Configure as variáveis de ambiente conforme listado acima
3. Conecte ao repositório GitHub
4. Configure o build command: `npm run build`
5. Configure o start command: `npm start`

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para mais detalhes. 