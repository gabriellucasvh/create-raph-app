// src/core/file-generators.js

// --- Geradores de Arquivos de Configuração --- 

function generateNextConfig() {
    return `/** @type {import('next').NextConfig} */
const nextConfig = {
  // Adicione configurações do Next.js aqui, se necessário
};

module.exports = nextConfig;
`;
}

function generateTsConfig() {
    // Configuração tsconfig.json padrão do Next.js com App Router
    return `{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler", // ou "node"
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
`;
}

function generateJsConfig() {
    // Configuração jsconfig.json para projetos Javascript
    return `{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "jsx": "preserve"
  },
  "include": ["next-env.d.ts", "**/*.js", "**/*.jsx"],
  "exclude": ["node_modules"]
}
`;
}

function generatePostcssConfig() {
    // Configuração PostCSS para Tailwind v4
    return `// postcss.config.mjs
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    'autoprefixer': {},
  },
};
`;
}

function generateEslintConfig(isTypescript) {
    // Configuração ESLint v9 (eslint.config.js)
    // Nota: Esta é uma configuração básica. Pode precisar de ajustes.
    const tsPlugin = isTypescript ? `
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');` : '';
    const tsConfig = isTypescript ? `
      {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
          parser: tsParser,
          parserOptions: {
            project: './tsconfig.json',
          },
        },
        plugins: {
          '@typescript-eslint': tseslint,
        },
        rules: {
          ...tseslint.configs['eslint-recommended'].rules,
          ...tseslint.configs['recommended'].rules,
          // Suas regras TS aqui
        },
      },` : '';

    return `// eslint.config.js
const globals = require('globals');
const nextPlugin = require('@next/eslint-plugin-next');${tsPlugin}
const reactRecommended = require('eslint-plugin-react/configs/recommended');
const reactJsxRuntime = require('eslint-plugin-react/configs/jsx-runtime');

module.exports = [
  {
    ignores: [
      'node_modules/',
      '.next/',
      'out/',
      // Adicione outros diretórios/arquivos a ignorar
    ],
  },
  {
    files: ['**/*.js', '**/*.jsx'${isTypescript ? `, '**/*.ts', '**/*.tsx'` : ''}],
    plugins: {
      '@next/next': nextPlugin,
      'react': require('eslint-plugin-react'),
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        React: 'readonly', // Para React 17+ JSX Transform
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      ...reactRecommended.rules,
      ...reactJsxRuntime.rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      // Suas regras gerais aqui
      'react/prop-types': 'off', // Desabilitado pois TS cuida disso
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },${tsConfig}
];
`;
}

function generateBiomeConfig() {
    // Configuração básica do Biome
    return `{
	"$schema": "https://biomejs.dev/schemas/1.3.3/schema.json",
	"organizeImports": {
		"enabled": true
	},
	"linter": {
		"enabled": true,
		"rules": {
			"recommended": true
		}
	},
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingComma": "all"
    }
  }
}
`;
}

function generateGitignore() {
    return `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Environment Variables
.env*.local
.env

# Prisma
# /prisma/generated -> Se você gerar o cliente em outro lugar

# Editor directories and files
.vscode
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
`;
}

function generateReadme(projectName) {
    return `# ${projectName}

Este é um projeto Next.js inicializado com [Raph CLI](https://github.com/gabriellucasvh/create-raph-app).

## Começando

Primeiro, rode o servidor de desenvolvimento:

npm run dev
# ou
yarn dev
# ou
pnpm dev
# ou
bun dev

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

## Aprenda Mais

Para aprender mais sobre Next.js, dê uma olhada nos seguintes recursos:

- [Documentação Next.js](https://nextjs.org/docs) - aprenda sobre funcionalidades e API do Next.js.
- [Learn Next.js](https://nextjs.org/learn) - um tutorial interativo de Next.js.

Você pode checar o [repositório Next.js no GitHub](https://github.com/vercel/next.js/) - seus feedbacks e contribuições são bem-vindos!

## Deploy com Vercel

A forma mais fácil de fazer deploy da sua aplicação Next.js é usando a [Plataforma Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) dos criadores do Next.js.

Confira nossa [documentação de deploy do Next.js](https://nextjs.org/docs/deployment) para mais detalhes.
`;
}

// --- Geradores de Arquivos de Código (App Router) ---

function generateLayoutFile(answers) {
    const { language, useTailwind, useTRPC, authProvider } = answers;
    const isTypescript = language.toLowerCase() === 'typescript';
    const tsJsxExt = isTypescript ? 'tsx' : 'jsx';
    const globalCssImport = useTailwind.toLowerCase() === 'sim' ? "import './globals.css'" : "import './globals.css'"; // Importa mesmo se vazio
    const trpcProviderImport = useTRPC.toLowerCase() === 'sim' ? `import TRPCProvider from '@/lib/trpc/Provider';` : '';
    const authProviderImport = authProvider.toLowerCase() === 'nextauth' ? `import AuthProvider from '@/components/AuthProvider';` : '';
    const providersStart = (useTRPC.toLowerCase() === 'sim' || authProvider.toLowerCase() === 'nextauth') ? '<Providers>' : '';
    const providersEnd = (useTRPC.toLowerCase() === 'sim' || authProvider.toLowerCase() === 'nextauth') ? '</Providers>' : '';

    // Cria um componente Providers se necessário
    let providersComponent = '';
    if (useTRPC.toLowerCase() === 'sim' || authProvider.toLowerCase() === 'nextauth') {
        const trpcWrapperStart = useTRPC.toLowerCase() === 'sim' ? '<TRPCProvider>' : '';
        const trpcWrapperEnd = useTRPC.toLowerCase() === 'sim' ? '</TRPCProvider>' : '';
        const authWrapperStart = authProvider.toLowerCase() === 'nextauth' ? '<AuthProvider>' : '';
        const authWrapperEnd = authProvider.toLowerCase() === 'nextauth' ? '</AuthProvider>' : '';
        providersComponent = `
${trpcProviderImport}
${authProviderImport}

${isTypescript ? 'interface ProvidersProps { children: React.ReactNode }' : ''}
function Providers({ children }${isTypescript ? ': ProvidersProps' : ''}) {
  return (
    ${authWrapperStart}
      ${trpcWrapperStart}
        {children}
      ${trpcWrapperEnd}
    ${authWrapperEnd}
  );
}
`;
    }

    const metadata = isTypescript ? `import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Raph App',
  description: 'Generated by create raph app',
};` : `// Add metadata here if needed
export const metadata = {
  title: 'Create Raph App',
  description: 'Generated by create raph app',
};`;

    return `// src/app/layout.${tsJsxExt}
${isTypescript ? "import React from 'react';" : ''}
${metadata}
${globalCssImport}
${providersComponent}

export default function RootLayout({ children }${isTypescript ? ': { children: React.ReactNode }' : ''}) {
  return (
    <html lang="pt-BR">
      <body>
        ${providersStart}
          {children}
        ${providersEnd}
      </body>
    </html>
  );
}
`;
}

function generatePageFile(answers) {
    const { language } = answers;
    const isTypescript = language.toLowerCase() === 'typescript';
    const tsJsxExt = isTypescript ? 'tsx' : 'jsx' ? `
` : '';

    return `// src/app/page.${tsJsxExt}
${isTypescript ? "import React from 'react';" : ''}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Bem-vindo ao Raph App!</h1>
      <p className="mt-4 text-lg">Para começar, edite <code>src/app/page.${tsJsxExt}</code></p>
    </main>
  );
}
`;
}

// --- Geradores de Arquivos tRPC --- 

function generateTRPCRouter(isTypescript) {
    const typeAnnotation = isTypescript ? ': string' : '';
    const inputType = isTypescript ? 'z.object({ text: z.string() })' : '{ parse: (input) => ({ text: String(input?.text) }) }'; // Simulação Zod p/ JS
    const zodImport = isTypescript ? "import { z } from 'zod';\n" : '';

    return `// src/server/trpc/router.${isTypescript ? 'ts' : 'js'}
${zodImport}import { initTRPC } from '@trpc/server';
import { Context } from './context'; // Importa o contexto

const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  hello: t.procedure
    .input(${inputType}) // Exemplo com Zod para TS
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
${isTypescript ? 'export type AppRouter = typeof appRouter;' : ''}
`;
}

function generateTRPCContext(isTypescript) {
    // Contexto simples, pode ser expandido para incluir sessão, db, etc.
    return `// src/server/trpc/context.${isTypescript ? 'ts' : 'js'}
import { inferAsyncReturnType } from '@trpc/server';
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'; // Para App Router

// Contexto para App Router (baseado em Fetch API)
export async function createContext({ req, resHeaders }${isTypescript ? ': FetchCreateContextFnOptions' : ''}) {
  // Se precisar de informações da requisição (headers, etc.), elas estão em 'req'
  // Exemplo: pegar sessão do NextAuth (requer configuração adicional)
  // const session = await getServerSession(authOptions); // Importar authOptions e getServerSession
  console.log('Creating tRPC context...');
  return {
    // session,
    // db: prisma, // Se usar Prisma
  };
}

${isTypescript ? 'export type Context = inferAsyncReturnType<typeof createContext>;' : ''}
`;
}

function generateTRPCClient(isTypescript) {
    const appRouterImport = isTypescript ? "import type { AppRouter } from '@/server/trpc/router';" : "// Import AppRouter type if using JS with JSDoc";

    return `// src/lib/trpc/client.${isTypescript ? 'ts' : 'js'}
import { createTRPCReact } from '@trpc/react-query';
${appRouterImport}

export const trpc = createTRPCReact<${isTypescript ? 'AppRouter' : 'any'}>({});
`;
}

function generateTRPCProvider(isTypescript) {
    const tsxExt = isTypescript ? 'tsx' : 'jsx';
    const reactNode = isTypescript ? 'React.ReactNode' : 'any';
    const useState = isTypescript ? "import React, { useState } from 'react';" : "import { useState } from 'react';";

    return `// src/lib/trpc/Provider.${tsxExt}
'use client';

${useState}
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from './client';

${isTypescript ? 'interface TRPCProviderProps { children: React.ReactNode }' : ''}

export default function TRPCProvider({ children }${isTypescript ? ': TRPCProviderProps' : ''}) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc', // URL da sua API tRPC
          // Você pode passar headers aqui se necessário, ex: authorization tokens.
          // async headers() {
          //   return {
          //     authorization: getAuthCookie(),
          //   };
          // },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
`;
}

// --- Geradores de Arquivos de Banco de Dados e Auth --- 

function generateEnvLocal(database) {
    const dbUrlVar = database.toLowerCase() === 'mysql' ? 'mysql://USER:PASSWORD@HOST:PORT/DATABASE'
        : 'postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public'; // Default para Postgres
    return `# .env
# Variáveis de ambiente para desenvolvimento local

DATABASE_URL="${dbUrlVar}"

# NextAuth (se usado)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=chave_gerada_aqui # Gere uma senha forte: openssl rand -base64 32

# Adicione outras variáveis aqui (ex: chaves de API)
`;
}

function generatePrismaSchema(database) {
    const provider = database.toLowerCase() === 'mysql' ? 'mysql' : 'postgresql';
    return `// prisma/schema.prisma
datasource db {
  provider = "${provider}"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma/client"
}

model User {
  id    String  @id @default(cuid())
  name  String?
  email String? @unique
  emailVerified DateTime?
  image String?
  accounts Account[]
  sessions Session[]
}

model Account {
  id                 String  @id @default(cuid())
  userId             String
  type               String
  provider           String
  providerAccountId  String
  refresh_token      String?  ${provider === 'mysql' ? '@db.Text' : ''}
  access_token       String?  ${provider === 'mysql' ? '@db.Text' : ''}
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String?  ${provider === 'mysql' ? '@db.Text' : ''}
  session_state      String?
  user               User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}

// Adicione seus modelos aqui
`;
}

function generateNextAuthConfig(answers) {
    const { language, orm } = answers;
    const isTypescript = language.toLowerCase() === 'typescript';
    const prismaAdapterImport = orm.toLowerCase() === 'prisma' ? "import { PrismaAdapter } from '@next-auth/prisma-adapter';\nimport { prisma } from '@/lib/db/prisma';" : '';
    const adapterConfig = orm.toLowerCase() === 'prisma' ? 'adapter: PrismaAdapter(prisma),' : '// adapter: SeuAdapter(db),';
    const providers = `// Configure um ou mais providers de autenticação`;

    return `// src/lib/auth/options.${isTypescript ? 'ts' : 'js'}
import { type NextAuthOptions } from 'next-auth';
${prismaAdapterImport}

export const authOptions${isTypescript ? ': NextAuthOptions' : ''} = {
  ${adapterConfig}
  providers: [
    ${providers}
  ],
  session: {
    strategy: 'jwt', // ou 'database' se usar adapter
  },
  pages: {},
  callbacks: {},
secret: process.env.NEXTAUTH_SECRET, // Necessário em produção
};
`;
}


module.exports = {
    generateNextConfig,
    generateTsConfig,
    generateJsConfig,
    generatePostcssConfig,
    generateEslintConfig,
    generateBiomeConfig,
    generateGitignore,
    generateReadme,
    generateLayoutFile,
    generatePageFile,
    generateTRPCRouter,
    generateTRPCContext,
    generateTRPCClient,
    generateTRPCProvider,
    generateEnvLocal,
    generatePrismaSchema,
    generateNextAuthConfig
};