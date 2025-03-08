import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { compare } from "bcryptjs";
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { db } from "@/lib/db";
import { recordUserLogin, logUserAction, AUDIT_ACTIONS } from "@/lib/auth";

// Configuração hardcoded para evitar problemas com variáveis de ambiente
const NEXTAUTH_SECRET = "umValorAleatorioMuitoSeguro123456";
const NEXTAUTH_URL = "https://catometrics.com.br";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  secret: NEXTAUTH_SECRET, // Usando o valor fixo
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  // Configuração de cookies importante para ambientes HTTPS
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        // Verificar se o usuário está ativo
        if (!user.isActive) {
          throw new Error("Conta desativada. Entre em contato com o administrador.");
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        // Registrar login bem-sucedido
        await recordUserLogin(user.id);
        
        // Registrar ação no audit log
        try {
          await logUserAction({
            userId: user.id,
            action: AUDIT_ACTIONS.LOGIN,
            entityType: 'user',
            entityId: user.id,
            details: { email: user.email }
          });
        } catch (error) {
          console.error("Erro ao registrar login no audit log:", error);
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          isSuperAdmin: user.isSuperAdmin
        };
      },
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string | null;
        session.user.email = token.email as string | null;
        session.user.isSuperAdmin = Boolean(token.isSuperAdmin);
      }

      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isSuperAdmin = user.isSuperAdmin || false;
        return token;
      }

      const dbUser = await db.user.findFirst({
        where: {
          email: token.email as string,
        },
      });

      if (!dbUser) {
        return token;
      }

      return {
        ...token,
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        isSuperAdmin: dbUser.isSuperAdmin
      };
    },
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 