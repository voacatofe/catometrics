FROM node:18

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json ./
# Copiar diretório prisma para que o schema esteja disponível durante a instalação
COPY prisma ./prisma/

# Instalar dependências com npm em vez de yarn
RUN npm ci

# Copiar o resto do código
COPY . .

# Gerar o cliente Prisma
RUN npx prisma generate

# Construir o aplicativo
RUN npm run build

# Expor a porta 3000
EXPOSE 3000

# Comando para iniciar a aplicação - formato array mais confiável
CMD ["npm", "start"] 