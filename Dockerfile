FROM node:18

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json ./
# Copiar diretório prisma para que o schema esteja disponível durante a instalação
COPY prisma ./prisma/

# Instalar dependências com npm em vez de yarn
RUN npm ci

# Instalar explicitamente critters para evitar problemas de build
RUN npm install critters --save-dev

# Copiar o resto do código
COPY . .

# Gerar o cliente Prisma
RUN npx prisma generate

# Construir o aplicativo
RUN npm run build

# Preparar para produção - abordagem mais direta para evitar problemas
WORKDIR /app

# Copiar o script de inicialização
COPY start.js .

# Garantir que NODE_ENV esteja configurado como production
ENV NODE_ENV production
ENV PORT 3000
ENV HOSTNAME 0.0.0.0

# Expor a porta 3000
EXPOSE 3000

# Comando para iniciar usando nosso script personalizado
CMD ["node", "start.js"] 