FROM node:16

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json ./

# Instalar dependências com Yarn
RUN yarn install

# Copiar o resto do código
COPY . .

# Gerar o cliente Prisma
RUN npx prisma generate

# Construir o aplicativo
RUN yarn build

# Expor a porta 3000
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["yarn", "start"] 