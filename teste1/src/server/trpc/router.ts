// src/server/trpc/router.ts
import { z } from 'zod';
import { initTRPC } from '@trpc/server';
import { Context } from './context'; // Importa o contexto

const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  hello: t.procedure
    .input(z.object({ text: z.string() })) // Exemplo com Zod para TS
    .query(({ input, ctx }) => {
      // ctx contém informações do contexto (ex: usuário logado)
      console.log('Context:', ctx);
      return {
        greeting: input.text
      };
    }),
  // Adicione mais rotas aqui
});

// Exporta o tipo do router (apenas para TypeScript)
export type AppRouter = typeof appRouter;
