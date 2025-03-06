# Estágio de construção
FROM node:16-alpine AS builder
WORKDIR /app

# Instalar dependências necessárias
RUN apk add --no-cache libc6-compat python3 make g++

# Copiar arquivos de dependências
COPY package.json package-lock.json ./
# Instalação forçada com maior timeout e sem cache
RUN npm install --verbose --no-cache --force --legacy-peer-deps --network-timeout 100000

# Copiar o restante do código fonte
COPY . .

# Instalar Prisma globalmente e gerar cliente
RUN npm install -g prisma
RUN prisma generate

# Construir o aplicativo
RUN npm run build

# Estágio de produção
FROM node:16-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

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