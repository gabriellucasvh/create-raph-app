#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline'); // Adicionado para confirmação inicial

// Função para verificar se um módulo está instalado (usando caminhos relativos se possível)
function isModuleInstalled(moduleName) {
  try {
    // Tenta resolver a partir do diretório atual ou globalmente
    require.resolve(moduleName, { paths: [path.join(__dirname, 'node_modules'), process.cwd()] });
    return true;
  } catch (e) {
    try {
      // Fallback para resolução global padrão
      require.resolve(moduleName);
      return true;
    } catch (e2) {
      return false;
    }
  }
}

// Lista de dependências necessárias para a *própria CLI* funcionar
const requiredDependencies = ['inquirer', 'chalk', 'ora', 'figlet', 'gradient-string'];
const missingDependencies = requiredDependencies.filter(dep => !isModuleInstalled(dep));

async function initializeCli() {
  if (missingDependencies.length > 0) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('É necessário instalar os seguintes pacotes:');
    console.log('create-raph-app@1.0.0');

    const answer = await new Promise(resolve => {
      rl.question('Ok para prosseguir? (s/n) ', resolve);
    });

    rl.close();

    if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'y') {
      console.log('\nInstalando dependências necessárias para a Raph CLI...');
      try {
        execSync(`npm install ${missingDependencies.join(' ')} --legacy-peer-deps`, {
          stdio: 'inherit'
        });
        console.log('\nDependências da CLI instaladas com sucesso! Reiniciando...');
      } catch (error) {
        console.error('\n❌ Erro ao instalar dependências da CLI.');
        console.error('   Por favor, execute manualmente:');
        console.error(`   npm install ${missingDependencies.join(' ')}`);
        process.exit(1);
      }

      const { spawn } = require('child_process');
      const nodePath = `"${process.execPath}"`; // já vem com o path correto
      const subprocess = spawn(`${nodePath}`, [__filename, ...process.argv.slice(2)], {
        stdio: 'inherit',
        shell: true,
      });

      subprocess.on('exit', (code) => {
        process.exit(code);
      });

    } else {
      console.log('Instalação cancelada.');
      process.exit(0);
    }

  } else {
    // Se todas as dependências estão instaladas, continua com o script principal
    main();
  }
}


// Função principal da CLI (já era async)
async function main() {
  const cliArgs = process.argv.slice(2);

  const flags = {
    offline: cliArgs.includes('--offline'),
    template: null,
    projectName: null
  };

  cliArgs.forEach((arg, i) => {
    if (!arg.startsWith('--') && !flags.projectName) {
      flags.projectName = arg;
    }
    if (arg === '--template') {
      flags.template = cliArgs[i + 1];
    }
  });

  // Importações dinâmicas (como já estavam corretas)
  const { default: chalk } = await import('chalk');
  const { default: inquirer } = await import('inquirer');
  const { default: ora } = await import('ora');
  const { default: figlet } = await import('figlet');
  const { default: gradient } = await import('gradient-string');

  // Tema (como estava)
  const theme = {
    primary: chalk.hex('#FFCC00'), // Amarelo
    secondary: chalk.hex('#000000'), // Preto
    accent: chalk.hex('#FFFFFF'), // Branco (para o gato)
    success: chalk.green,
    error: chalk.red,
    info: chalk.cyan,
    dim: chalk.dim
  };

  // Logo (como estava)
  console.log('\n');
  console.log(gradient('#FFCC00', '#FFA500')(figlet.textSync('Raph CLI', { font: 'Standard' })));
  console.log('\n' + theme.accent('                 /\\_/\\'));
  console.log(theme.accent('                ( o.o )'));
  console.log(theme.accent('                 > ^ <'));
  console.log('\n' + theme.primary('Seu gerador de projetos Next.js com App Router!') + '\n');

  // Função para criar diretórios (como estava)
  function createDirIfNotExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  // Função para criar a estrutura básica do projeto
  async function createProject() {
    const spinner = ora({ // Inicializa o spinner aqui para usar antes do prompt se necessário
      text: theme.primary('Carregando...'),
      spinner: 'dots',
      color: 'yellow'
    });

    try {
      console.log(theme.primary.bold('🚀 Bem-vindo ao gerador de projetos Raph!\n'));

      // Perguntas (como estavam, exceto Tailwind que agora é v4 por padrão se 'sim')
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: theme.primary('Nome do projeto:'),
          default: flags.projectName || undefined,
          when: !flags.projectName,
          validate: input => input ? true : 'Por favor, informe um nome para o projeto.'
        },
        {
          type: 'list',
          name: 'language',
          message: theme.primary('Qual linguagem deseja usar?'),
          choices: ['Typescript', 'Javascript'],
          default: flags.template?.toLowerCase() === 'typescript' ? 'Typescript' : 'Javascript',
          when: !flags.template
        },        
        {
          type: 'list',
          name: 'useTailwind',
          message: theme.primary('Usar Tailwind CSS (v4)?'), // Mensagem atualizada
          choices: ['Sim', 'Não'],
          default: 'Sim'
        },
        {
          type: 'list',
          name: 'useTRPC',
          message: theme.primary('Usar tRPC?'),
          choices: ['Sim', 'Não'],
          default: 'Não'
        },
        {
          type: 'list',
          name: 'authProvider',
          message: theme.primary('Usar provider de autenticação?'),
          choices: ['Nenhum', 'NextAuth'],
          default: 'Nenhum'
        },
        {
          type: 'list',
          name: 'orm',
          message: theme.primary('Usar ORM de database?'),
          choices: ['Nenhum', 'Prisma'],
          default: 'Nenhum'
        },
        {
          type: 'list',
          name: 'database',
          message: theme.primary('Qual banco de dados (se usar Prisma)?'),
          choices: ['Postgresql', 'Mysql'],
          default: 'Postgresql',
          when: (answers) => answers.orm === 'Prisma'
        },
        {
          type: 'list',
          name: 'linter',
          message: theme.primary('Usar ESLint ou Biome?'),
          choices: ['Eslint', 'Biome'],
          default: 'Eslint'
        },
        {
          type: 'list',
          name: 'initGit',
          message: theme.primary('Inicializar repositório Git?'),
          choices: ['Sim', 'Não'],
          default: 'Sim'
        },
        {
          type: 'list',
          name: 'packageManager',
          message: theme.primary('Qual gerenciador de pacotes deseja usar?'),
          choices: ['npm', 'yarn', 'pnpm', 'bun'],
          default: 'npm'
        }

      ]);

      const {
        projectName, language, useTailwind, useTRPC,
        authProvider, orm, database = 'nenhum', linter, initGit, packageManager
      } = answers;

      const projectDir = path.join(process.cwd(), projectName);

      if (fs.existsSync(projectDir)) {
        console.log(`\n${theme.error('❌ O diretório')} ${theme.primary(projectName)} ${theme.error('já existe. Por favor, escolha outro nome.')}`);
        return;
      }

      spinner.start(theme.primary('Criando diretório do projeto...'));
      fs.mkdirSync(projectDir);
      spinner.succeed(theme.success(`📁 Diretório do projeto criado: ${projectName}`));

      // --- Configuração do package.json ---
      spinner.start(theme.primary('Configurando package.json...'));

      const isTypescript = language.toLowerCase() === 'typescript';
      const tsJsExt = isTypescript ? 'ts' : 'js';
      const packageJson = {
        name: projectName,
        version: '0.1.0',
        private: true,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          lint: linter.toLowerCase() === 'eslint' ? 'eslint .' : 'biome check .'
        },
        dependencies: { // Adiciona dependências base aqui
          'react': '^18',
          'react-dom': '^18',
          'next': '^14' // Ou a versão desejada do Next.js
        },
        devDependencies: {} // Adiciona devDependencies base aqui
      };

      // Adiciona dependências condicionais
      if (useTailwind.toLowerCase() === 'sim') {
        packageJson.devDependencies['tailwindcss'] = '^4'; // Ou @next se ainda for preview
        packageJson.devDependencies['postcss'] = '^8';
        packageJson.devDependencies['autoprefixer'] = '^10'; // Autoprefixer ainda pode ser útil
        packageJson.devDependencies['@tailwindcss/postcss'] = 'next'; // Plugin postcss para v4
      }

      if (useTRPC.toLowerCase() === 'sim') {
        Object.assign(packageJson.dependencies, {
          '@trpc/client': '^10', // Use versões compatíveis
          '@trpc/server': '^10',
          '@trpc/react-query': '^10',
          '@trpc/next': '^10',
          '@tanstack/react-query': '^5', // Ou versão compatível
          'zod': '^3'
        });
      }

      if (authProvider.toLowerCase() === 'nextauth') {
        packageJson.dependencies['next-auth'] = '^4'; // Verificar compatibilidade com App Router se usar v5 beta
      }

      if (orm.toLowerCase() === 'prisma') {
        packageJson.devDependencies['prisma'] = '^5'; // Ou versão mais recente
        packageJson.dependencies['@prisma/client'] = '^5';
      }

      if (linter.toLowerCase() === 'eslint') {
        Object.assign(packageJson.devDependencies, {
          'eslint': '^8',
          'eslint-config-next': packageJson.dependencies.next // Garante compatibilidade
        });
        if (isTypescript) {
          packageJson.devDependencies['@typescript-eslint/eslint-plugin'] = '^6'; // Exemplo
          packageJson.devDependencies['@typescript-eslint/parser'] = '^6'; // Exemplo
        }
      } else { // Biome
        packageJson.devDependencies['@biomejs/biome'] = '^1'; // Ou versão mais recente
      }

      if (isTypescript) {
        Object.assign(packageJson.devDependencies, {
          'typescript': '^5',
          '@types/react': '^18',
          '@types/node': '^20',
          '@types/react-dom': '^18'
        });
      }

      fs.writeFileSync(
        path.join(projectDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      spinner.succeed(theme.success('📄 package.json configurado'));

      // --- Criação da Estrutura de Pastas (App Router) ---
      spinner.start(theme.primary('Criando estrutura de diretórios (App Router)...'));
      const srcDir = path.join(projectDir, 'src');
      const appDir = path.join(srcDir, 'app');
      const componentsDir = path.join(srcDir, 'components'); // Mantém components
      const publicDir = path.join(projectDir, 'public'); // Mantém public
      const libDir = path.join(srcDir, 'lib'); // Pasta comum para utils, etc. (Boa prática)

      createDirIfNotExists(srcDir);
      createDirIfNotExists(appDir);
      createDirIfNotExists(componentsDir);
      createDirIfNotExists(publicDir);
      createDirIfNotExists(libDir); // Cria src/lib

      spinner.succeed(theme.success('📂 Estrutura básica de pastas criada (src/app)'));

      // --- Criação de Arquivos Iniciais (App Router) ---
      spinner.start(theme.primary('Criando arquivos iniciais (layout, page)...'));

      const extension = isTypescript ? 'tsx' : 'jsx';
      const langAttr = 'pt-BR'; // Ou ajuste conforme necessário

      // Criando src/app/layout.tsx ou jsx
      const layoutContent = `${isTypescript ? "import type { Metadata } from 'next';" : ''}
import './globals.css';

${isTypescript ? `
export const metadata: Metadata = {
  title: '${projectName}',
  description: 'Generated by Raph CLI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {` : `
export const metadata = {
  title: '${projectName}',
  description: 'Generated by Raph CLI',
};

export default function RootLayout({ children }) {`}
  return (
    <html lang="${langAttr}">
      <body>{children}</body>
    </html>
  );
}
`;
      fs.writeFileSync(path.join(appDir, `layout.${extension}`), layoutContent);

      // Criando src/app/page.tsx ou jsx
      const pageContent = `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">
        Bem-vindo ao ${theme.primary(projectName)}!
      </h1>
      <p className="mt-4 text-lg text-center">
        Comece editando ${theme.secondary('src/app/page.' + extension)}
      </p>
    </main>
  );
}
`;
      fs.writeFileSync(path.join(appDir, `page.${extension}`), pageContent);

      // Criando src/app/globals.css (se usar Tailwind)
      if (useTailwind.toLowerCase() === 'sim') {
        const globalCss = `@import "tailwindcss";

body {
  /* Exemplo: */
  /* font-family: sans-serif; */
}
`;
        fs.writeFileSync(path.join(appDir, 'globals.css'), globalCss); // CSS global vai direto em app/
      } else {
        // Cria um globals.css vazio ou com estilos mínimos se não usar Tailwind
        fs.writeFileSync(path.join(appDir, 'globals.css'), `/* Adicione seus estilos globais aqui */\nbody {\n margin: 0;\n padding: 0;\n box-sizing: border-box;\n}`);
      }


      spinner.succeed(theme.success('📄 Arquivos iniciais criados (layout, page, globals.css)'));


      // --- Configuração do Tailwind v4 ---
      if (useTailwind.toLowerCase() === 'sim') {
        spinner.start(theme.primary('Configurando PostCSS para Tailwind CSS v4...'));

        // postcss.config.mjs ou .js (v4 usa @tailwindcss/postcss)
        // Usar .mjs se o projeto for ESM por padrão, ou .js se for CJS
        // Vamos assumir .js por enquanto, mas idealmente package.json deveria ter "type": "module"
        const postcssConfig = `
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
    'autoprefixer': {},
  }
};

export default config;
`;
        // Nota: Se o Next.js não suportar postcss.config.mjs diretamente,
        // pode ser necessário manter como CJS:
        // const postcssConfigCJS = `module.exports = { plugins: { '@tailwindcss/postcss': {}, autoprefixer: {} } };`;
        // fs.writeFileSync(path.join(projectDir, 'postcss.config.js'), postcssConfigCJS);

        fs.writeFileSync(path.join(projectDir, 'postcss.config.js'), postcssConfig); // Tenta com ESM por padrão

        // Não cria tailwind.config.js para v4

        spinner.succeed(theme.success('🎨 Configuração do PostCSS para Tailwind CSS v4 criada'));
      }

      // --- Configuração do tRPC (Adaptado para App Router) ---
      if (useTRPC.toLowerCase() === 'sim') {
        spinner.start(theme.primary('Configurando tRPC para App Router...'));

        const serverDir = path.join(srcDir, 'server'); // Ex: src/server/trpc.ts, src/server/routers/root.ts
        const trpcApiDir = path.join(appDir, 'api', 'trpc', '[trpc]'); // API route: src/app/api/trpc/[trpc]/route.ts
        const trpcLibFile = path.join(libDir, `trpc.${isTypescript ? 'ts' : 'js'}`); // Cliente tRPC: src/lib/trpc.ts

        createDirIfNotExists(serverDir);
        createDirIfNotExists(path.join(serverDir, 'routers'));
        createDirIfNotExists(trpcApiDir);

        const tsJsExt = isTypescript ? 'ts' : 'js';

        // Contexto tRPC (src/server/trpc.ts) - Exemplo básico
        const trpcContextContent = `import { initTRPC } from '@trpc/server';
${isTypescript ? "import type { CreateNextContextOptions } from '@trpc/server/adapters/next';" : ""}

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<typeof createTRPCContext>().create(); // Use context se precisar

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Creates context for incoming requests
 * @link https://trpc.io/docs/v10/context
 */
export async function createTRPCContext(opts${isTypescript ? "?: CreateNextContextOptions" : ""}) {
  // Adicione aqui o que você precisa no contexto (ex: session, db connection)
  console.log("Creating tRPC context for", opts?.req.url ?? "unknown request");
  return {};
}

${isTypescript ? "export type Context = Awaited<ReturnType<typeof createTRPCContext>>;" : ""}
`;
        fs.writeFileSync(path.join(serverDir, `trpc.${tsJsExt}`), trpcContextContent);


        // Router Raiz (src/server/routers/_app.ts ou root.ts)
        const rootRouterContent = `import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const appRouter = router({
  hello: publicProcedure
    .input(z.object({ name: z.string().nullish() }).nullish())
    .query(({ input }) => {
      return {
        greeting: \`Hello \${input?.name ?? 'world'} from App Router!\`,
      };
    }),
});

${isTypescript ? 'export type AppRouter = typeof appRouter;' : ''}
`;
        fs.writeFileSync(path.join(serverDir, 'routers', `root.${tsJsExt}`), rootRouterContent); // Nome do arquivo pode ser _app ou root

        // API Handler (src/app/api/trpc/[trpc]/route.ts)
        const trpcApiHandlerContent = `import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { type NextRequest } from 'next/server';

import { appRouter } from '@/server/routers/root';
import { createTRPCContext } from '@/server/trpc';

/**
 * Configure basic CORS headers
 * You should extend this to match your needs
 */
function setCorsHeaders(res: Response) {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Request-Method', '*');
  res.headers.set('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
  res.headers.set('Access-Control-Allow-Headers', '*');
}

export function OPTIONS() {
  const response = new Response(null, {
    status: 204,
  });
  setCorsHeaders(response);
  return response;
}

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createTRPCContext(), // Passa a função de contexto
     onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(
              \`❌ tRPC failed on \${path ?? '<no-path>'}: \${error.message}\`,
            );
          }
        : undefined,
  });

export { handler as GET, handler as POST };
`;
        fs.writeFileSync(path.join(trpcApiDir, `route.${tsJsExt}`), trpcApiHandlerContent); // Nome do arquivo é route.ts/js

        // Cliente tRPC (src/lib/trpc.ts) - para uso no frontend
        const trpcClientContent = `import { createTRPCReact } from '@trpc/react-query';
${isTypescript ? 'import type { AppRouter } from "@/server/routers/root";' : ''} // Ajuste o path

export const trpc = createTRPCReact<AppRouter>(); // Tipado com AppRouter
`;
        fs.writeFileSync(trpcLibFile, trpcClientContent);


        // ----- Provider tRPC (precisa envolver o layout ou página) -----
        // Criar um arquivo de provider (ex: src/app/_trpc/Provider.tsx)
        const trpcProviderDir = path.join(appDir, '_trpc'); // Pasta para organização
        createDirIfNotExists(trpcProviderDir);
        const trpcProviderContent = `"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import React, { useState } from "react";

import { trpc } from "@/lib/trpc"; // Importa o cliente criado

function getBaseUrl() {
  if (typeof window !== "undefined")
    return "";
  if (process.env.VERCEL_URL)
    return \`https://\${process.env.VERCEL_URL}\`;
  return \`http://localhost:\${process.env.PORT ?? 3000}\`;
}

export default function TRPCProvider({ children }${isTypescript ? ": { children: React.ReactNode }" : ""}) {
  const [queryClient] = useState(() => new QueryClient({}));
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: \`\${getBaseUrl()}/api/trpc\`,
        }),
      ],
    })
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
`;
        fs.writeFileSync(path.join(trpcProviderDir, `Provider.${extension}`), trpcProviderContent);

        // Instruir para adicionar o Provider no layout.tsx
        console.log(theme.info('\n   ℹ️ Para usar tRPC: Importe e envolva o conteúdo do <body> em src/app/layout.tsx com <TRPCProvider> de "@/app/_trpc/Provider".'));

        spinner.succeed(theme.success('🔄 Configuração do tRPC adaptada para App Router'));
      }


      // --- Configuração do Prisma ---
      if (orm.toLowerCase() === 'prisma') {
        spinner.start(theme.primary('Configurando Prisma...'));
        createDirIfNotExists(path.join(projectDir, 'prisma'));

        const prismaSchema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "${database.toLowerCase() === 'postgresql' ? 'postgresql' : 'mysql'}"
  url      = env("DATABASE_URL")
}

model Example {
  id        String   @id @default(cuid())
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`;
        fs.writeFileSync(path.join(projectDir, 'prisma', 'schema.prisma'), prismaSchema);

        const envContent = `\n# Prisma\nDATABASE_URL="${database.toLowerCase() === 'postgresql'
          ? 'postgresql://user:password@host:port/database?schema=public'
          : 'mysql://user:password@host:port/database'}"\n`;
        // Adiciona ao .env se já existir, ou cria um novo
        if (fs.existsSync(path.join(projectDir, '.env'))) {
          fs.appendFileSync(path.join(projectDir, '.env'), envContent);
        } else {
          fs.writeFileSync(path.join(projectDir, '.env'), envContent);
        }
        spinner.succeed(theme.success('🗃️ Configuração do Prisma criada'));
      }


      // --- Configuração do NextAuth (Adaptado para App Router) ---
      if (authProvider.toLowerCase() === 'nextauth') {
        spinner.start(theme.primary('Configurando NextAuth para App Router...'));

        const nextAuthApiDir = path.join(appDir, 'api', 'auth', '[...nextauth]');
        createDirIfNotExists(nextAuthApiDir);

        const tsJsExt = isTypescript ? 'ts' : 'js';

        // API Handler (src/app/api/auth/[...nextauth]/route.ts)
        const nextAuthConfigContent = `import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const authOptions${isTypescript ? ": import('next-auth').AuthOptions" : ""} = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@exemplo.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        // Lógica de autorização aqui

        if (credentials?.email === "teste@teste.com" && credentials?.password === "123") {
           return { id: "1", name: "Usuário Teste", email: "teste@teste.com" };
        }
        return null;
      }
    }),
    // Exemplo Google Provider:
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // }),
  ],
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
`;
        fs.writeFileSync(path.join(nextAuthApiDir, `route.${tsJsExt}`), nextAuthConfigContent);

        // Adicionar NEXTAUTH_URL e NEXTAUTH_SECRET ao .env
        const envNextAuthContent = `\n# NextAuth\nNEXTAUTH_URL=http://localhost:3000\nNEXTAUTH_SECRET=gere_uma_secret_forte_aqui\n`; // Gere uma secret!
        if (fs.existsSync(path.join(projectDir, '.env'))) {
          fs.appendFileSync(path.join(projectDir, '.env'), envNextAuthContent);
        } else {
          fs.writeFileSync(path.join(projectDir, '.env'), envNextAuthContent);
        }
        console.log(theme.accent('\n   ⚠️ Lembre-se de gerar uma NEXTAUTH_SECRET segura no .env! (ex: openssl rand -base64 32)'));

        // Adicionar Provider de Sessão no layout.tsx
        // Criar um arquivo de provider (ex: src/app/_auth/Provider.tsx)
        const authProviderDir = path.join(appDir, '_auth');
        createDirIfNotExists(authProviderDir);
        const sessionProviderContent = `"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";

export default function AuthProvider({ children }${isTypescript ? ": { children: React.ReactNode }" : ""}) {
  // Você pode passar a sessão inicial aqui se fizer SSR/SSG com getSession
  return <SessionProvider>{children}</SessionProvider>;
}
`;
        fs.writeFileSync(path.join(authProviderDir, `Provider.${extension}`), sessionProviderContent);
        console.log(theme.info('   ℹ️ Para usar NextAuth: Importe e envolva o conteúdo do <body> em src/app/layout.tsx com <AuthProvider> de "@/app/_auth/Provider".'));


        spinner.succeed(theme.success('🔐 Configuração do NextAuth adaptada para App Router'));
      }


      // --- Configuração de linter ---
      spinner.start(theme.primary(`Configurando ${linter}...`));
      if (linter.toLowerCase() === 'eslint') {
        const eslintConfig = `{
  "extends": "next/core-web-vitals"
}`;
        fs.writeFileSync(path.join(projectDir, '.eslintrc.json'), eslintConfig);
      } else { // Biome
        const biomeConfig = `{
  "$schema": "https://biomejs.dev/schemas/1.7.0/schema.json",
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
        "quoteStyle": "double",
        "trailingComma": "all"
     }
   }
}`;
        fs.writeFileSync(path.join(projectDir, 'biome.json'), biomeConfig);
      }
      spinner.succeed(theme.success(`🧹 Configuração do ${linter} criada`));


      // --- Configuração do TypeScript ---
      if (isTypescript) {
        spinner.start(theme.primary('Configurando TypeScript...'));
        const tsConfig = `{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`;
        fs.writeFileSync(path.join(projectDir, 'tsconfig.json'), tsConfig);

        // Criação do next-env.d.ts
        const nextEnvContent = `/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: Este arquivo não deve ser editado
// Consulte https://nextjs.org/docs/basic-features/typescript para mais informações.
`;
        fs.writeFileSync(path.join(projectDir, 'next-env.d.ts'), nextEnvContent);


        spinner.succeed(theme.success('🔧 Configuração do TypeScript criada'));
      }


      // --- README básico ---
      spinner.start(theme.primary('Criando documentação README...'));
      const readmeContent = `# ${projectName}

Projeto Next.js com App Router criado com Raph CLI 🐱

## 🚀 Configuração do Projeto

- **Linguagem:** ${language}
- **Estrutura:** Next.js App Router (\`src/app\`)
- **Tailwind CSS:** ${useTailwind} ${useTailwind.toLowerCase() === 'sim' ? '(v4)' : ''}
- **tRPC:** ${useTRPC} ${useTRPC.toLowerCase() === 'sim' ? '(Adaptado para App Router)' : ''}
- **Autenticação:** ${authProvider} ${authProvider.toLowerCase() !== 'nenhum' ? '(Adaptado para App Router)' : ''}
- **ORM:** ${orm} ${orm.toLowerCase() === 'prisma' ? `(${database})` : ''}
- **Linter:** ${linter}

## 🛠️ Como Iniciar

As dependências principais já foram instaladas pela CLI.

${orm.toLowerCase() === 'prisma' ?
          `**Importante (Prisma):**
1. Configure sua string de conexão no arquivo \`.env\`.
2. Execute \`npx prisma db push\` (para sincronizar schema) ou \`npx prisma migrate dev\` (para criar migrations).
` : ''}
${authProvider.toLowerCase() === 'nextauth' ?
          `**Importante (NextAuth):**
1. Gere uma \`NEXTAUTH_SECRET\` segura no arquivo \`.env\`. (Use: \`openssl rand -base64 32\`)
2. Configure os Providers (Google, GitHub, etc.) e a lógica de \`authorize\` se necessário em \`src/app/api/auth/[...nextauth]/route.${tsJsExt}\`.
` : ''}

**Para executar o servidor de desenvolvimento:**

\`\`\`bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
\`\`\`

Abra [http://localhost:3000](http://localhost:3000) com seu navegador para ver o resultado.

`;
      fs.writeFileSync(path.join(projectDir, 'README.md'), readmeContent);
      spinner.succeed(theme.success('📄 README.md criado'));


      // --- Inicializar Git ---
      if (initGit.toLowerCase() === 'sim') {
        spinner.start(theme.primary('Inicializando repositório Git...'));

        const gitignoreContent = `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# Dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Next.js
/.next/
/out/

# Production
/build

# Vercel
.vercel

# Env variables
.env*.local
.env # Ignora o .env principal por padrão (recomendado)
# !.env.example # Descomente se tiver um .env.example para commitar

# Prisma (se usado)
${orm.toLowerCase() === 'prisma' ? '/prisma/migrations\n/prisma/generated' : '# Prisma (não usado)'}

# Biome (se usado)
${linter.toLowerCase() === 'biome' ? '/.biome/' : '# Biome (não usado)'}

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
`;
        fs.writeFileSync(path.join(projectDir, '.gitignore'), gitignoreContent);

        try {
          execSync('git init && git add . && git commit -m "Initial commit from Raph CLI 🚀"', { cwd: projectDir, stdio: 'ignore' }); // Silencia a saída do git
          spinner.succeed(theme.success('🔄 Repositório Git inicializado e commit inicial feito'));
        } catch (error) {
          try {
            // Tenta apenas init se o commit falhar (ex: git não configurado)
            execSync('git init', { cwd: projectDir, stdio: 'ignore' });
            spinner.warn(theme.error('⚠️ Repositório Git inicializado, mas falha ao criar commit inicial. Configure seu git (user.name/user.email).'));
          } catch (gitError) {
            spinner.fail(theme.error('⚠️ Não foi possível inicializar o Git. Certifique-se de que o Git está instalado.'));
          }
        }
      }

      // --- Instalar Dependências do Projeto ---
      spinner.start(theme.primary(`Instalando dependências do projeto (${packageManager} install)... Isso pode levar alguns minutos...`));
      try {
        execSync(`${packageManager} install${flags.offline ? ' --offline' : ''}`, { cwd: projectDir, stdio: 'inherit' });
        spinner.succeed(theme.success('📦 Dependências do projeto instaladas!'));
      } catch (error) {
        spinner.fail(theme.error(`❌ Falha ao instalar dependências com ${packageManager}. Execute manualmente:`));
        console.error(`   cd ${projectName} && ${packageManager} install`);
      }

      // --- Resumo Final ---
      console.log('\n' + gradient('#FFCC00', '#FFA500').multiline('░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░'));
      console.log(theme.primary.bold(`✨ Projeto "${projectName}" criado com sucesso! ✨`));
      console.log(gradient('#FFCC00', '#FFA500').multiline('░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░\n'));

      console.log(theme.primary.bold('📋 Resumo do projeto:'));
      // ... (logs de resumo como estavam, mas talvez remover o passo de 'npm install') ...
      console.log(theme.info(`  • Nome: ${theme.primary(projectName)}`));
      console.log(theme.info(`  • Linguagem: ${theme.primary(language)}`));
      console.log(theme.info(`  • Tailwind: ${theme.primary(useTailwind)} (v4)`));
      console.log(theme.info(`  • tRPC: ${theme.primary(useTRPC)}`));
      console.log(theme.info(`  • Autenticação: ${theme.primary(authProvider)}`));
      console.log(theme.info(`  • ORM: ${theme.primary(orm)}${orm.toLowerCase() === 'prisma' ? ` (${theme.primary(database)})` : ''}`));
      console.log(theme.info(`  • Linter: ${theme.primary(linter)}`));
      console.log(theme.info(`  • Git: ${theme.primary(initGit)}`));

      console.log('\n' + theme.primary.bold('🚀 Próximos passos:'));
      console.log(theme.info(`  1. ${theme.primary(`cd ${projectName}`)}`));
      if (orm.toLowerCase() === 'prisma') {
        console.log(theme.accent(`  2. Configure DATABASE_URL em ${theme.secondary('.env')}`));
        console.log(theme.info(`  3. Rode ${theme.primary('npx prisma db push')} ou ${theme.primary('npx prisma migrate dev')}`));
        console.log(theme.info(`  4. Rode ${theme.primary('npm run dev')}`));
      } else {
        console.log(theme.info(`  2. Rode ${theme.primary('npm run dev')}`));
      }
      if (authProvider.toLowerCase() === 'nextauth') {
        console.log(theme.accent(`  * Lembre-se de gerar uma ${theme.secondary('NEXTAUTH_SECRET')} segura em ${theme.secondary('.env')}!`));
      }

      console.log('\n' + theme.accent('                 /\\_/\\'));
      console.log(theme.accent('                ( ^.^ )'));
      console.log(theme.accent('                 > ^ <'));
      console.log('\n' + theme.primary('Obrigado por usar o Raph CLI! Bom desenvolvimento! 🐈🎉\n'));

    } catch (error) {
      spinner.fail(theme.error('❌ Erro fatal ao criar o projeto:'));
      console.error(error); // Log do erro completo para depuração
      process.exit(1);
    }
  }

  // Iniciar o processo de criação do projeto
  createProject();
}

// Inicializa a verificação de dependências e a CLI
initializeCli();