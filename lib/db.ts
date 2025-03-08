import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { 
  prisma: PrismaClient | undefined 
};

// Use a conexão direta em vez da variável de ambiente
const DATABASE_URL = "postgresql://postgres:4fffda1131930d7b80f9@147.93.15.121:5433/catometrics?schema=public";

export const db = globalForPrisma.prisma ?? 
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
} 