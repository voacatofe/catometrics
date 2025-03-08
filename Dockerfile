FROM node:18-slim

WORKDIR /app

# Instalando dependências necessárias para o Prisma
RUN apt-get update && apt-get install -y \
    openssl \
    libssl-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copiando arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalando dependências
RUN npm install

# Gerando o cliente Prisma
RUN npx prisma generate

# Copiando o restante dos arquivos
COPY . .

# Compilando aplicação
RUN npm run build

# Expondo a porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"] 