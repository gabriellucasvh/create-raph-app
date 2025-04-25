// src/server/trpc/context.ts
import { inferAsyncReturnType } from '@trpc/server';
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'; // Para App Router

// Contexto para App Router (baseado em Fetch API)
export async function createContext({ req, resHeaders }: FetchCreateContextFnOptions) {
  // Se precisar de informações da requisição (headers, etc.), elas estão em 'req'
  // Exemplo: pegar sessão do NextAuth (requer configuração adicional)
  // const session = await getServerSession(authOptions); // Importar authOptions e getServerSession
  console.log('Creating tRPC context...');
  return {
    // session,
    // db: prisma, // Se usar Prisma
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
