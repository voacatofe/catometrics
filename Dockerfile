FROM node:18 AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm ci

# Copiar o resto do código
COPY . .

# Gerar o cliente Prisma
RUN npx prisma generate

# Construir a aplicação
RUN npm run build

# Segunda etapa - copiar apenas o necessário para produção
FROM node:18-slim AS runner

WORKDIR /app

ENV NODE_ENV production
ENV PORT 3000

# Copiar arquivos necessários do estágio anterior
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Copiar o diretório .next gerado
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expor a porta
EXPOSE 3000

# Iniciar aplicação
CMD ["node", "server.js"] 