# Estágio de construção
FROM node:18-alpine AS builder
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json ./
RUN npm ci

# Copiar o restante do código fonte
COPY . .

# Gerar Prisma Client
RUN npx prisma generate

# Construir o aplicativo
RUN npm run build

# Estágio de produção
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Copiar conteúdo necessário do estágio de construção
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expor a porta usada pelo Next.js
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["npm", "start"] 