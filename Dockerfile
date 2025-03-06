FROM node:16 as base

WORKDIR /app

# Instalar o Yarn globalmente
RUN npm install -g yarn

# Copiar arquivos de dependências
COPY package.json yarn.lock* ./

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