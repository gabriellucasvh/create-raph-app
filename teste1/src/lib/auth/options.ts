// src/lib/auth/options.ts
import { type NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/db/prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Configure um ou mais providers de autenticação
  ],
  session: {
    strategy: 'jwt', // ou 'database' se usar adapter
  },
  pages: {},
  callbacks: {},
secret: process.env.NEXTAUTH_SECRET, // Necessário em produção
};
