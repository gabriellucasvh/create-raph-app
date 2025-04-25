// src/core/project-setup.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { createDirIfNotExists } = require('../utils/helpers');
const { generatePackageJson, installDependencies } = require('./dependencies');
const { 
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
} = require('./file-generators');

async function createProject(flags, theme) {
  // Importações dinâmicas necessárias para esta função
  const { default: inquirer } = await import('inquirer');
  const { default: ora } = await import('ora');

  const spinner = ora({
    text: theme.primary('Carregando...'),
    spinner: 'dots',
    color: 'yellow'
  });

  try {
    console.log(theme.primary.bold('🚀 Bem-vindo ao gerador de projetos Raph!\n'));

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
        default: 'Typescript',
        when: !flags.template // Só pergunta se não houver template definido
      },
      {
        type: 'list',
        name: 'useTailwind',
        message: theme.primary('Usar Tailwind CSS (v4)?'),
        choices: ['Sim', 'Não'],
        default: 'Sim'
      },
      {
        type: 'list',
        name: 'useTRPC',
        message: theme.primary('Usar tRPC?'),
        choices: ['Sim', 'Não'],
        default: 'Sim'
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
        choices: ['Postgresql', 'Mysql'], // Adicionar mais se necessário
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

    // Se um template foi fornecido via flag, sobrescreve algumas respostas
    // (Lógica de template pode ser adicionada aqui se necessário)

    const { 
      projectName, language, useTailwind, useTRPC, 
      authProvider, orm, database = 'nenhum', linter, initGit, packageManager 
    } = answers;

    const projectDir = path.join(process.cwd(), projectName);
    const isTypescript = language.toLowerCase() === 'typescript';
    const tsJsExt = isTypescript ? 'ts' : 'js';
    const tsJsxExt = isTypescript ? 'tsx' : 'jsx';

    if (fs.existsSync(projectDir)) {
      console.log(`\n${theme.error('❌ O diretório')} ${theme.primary(projectName)} ${theme.error('já existe. Por favor, escolha outro nome.')}`);
      return;
    }

    spinner.start(theme.primary('Criando diretório do projeto...'));
    fs.mkdirSync(projectDir);
    spinner.succeed(theme.success(`📁 Diretório do projeto criado: ${projectName}`));

    // --- Configuração do package.json ---
    spinner.start(theme.primary('Configurando package.json...'));
    const packageJson = generatePackageJson(answers);
    fs.writeFileSync(
      path.join(projectDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    spinner.succeed(theme.success('📄 package.json configurado'));

    // --- Criação da Estrutura de Pastas e Arquivos --- 
    spinner.start(theme.primary('Criando estrutura de diretórios e arquivos...'));
    const srcDir = path.join(projectDir, 'src');
    const appDir = path.join(srcDir, 'app');
    const componentsDir = path.join(srcDir, 'components');
    const libDir = path.join(srcDir, 'lib'); // Para utils, trpc, etc.
    const serverDir = path.join(srcDir, 'server'); // Para backend (trpc, auth, prisma)

    createDirIfNotExists(srcDir);
    createDirIfNotExists(appDir);
    createDirIfNotExists(componentsDir);
    createDirIfNotExists(libDir);

    // Arquivos de Configuração na Raiz
    fs.writeFileSync(path.join(projectDir, 'next.config.js'), generateNextConfig());
    fs.writeFileSync(path.join(projectDir, '.gitignore'), generateGitignore());
    fs.writeFileSync(path.join(projectDir, 'README.md'), generateReadme(projectName));

    if (isTypescript) {
      fs.writeFileSync(path.join(projectDir, 'tsconfig.json'), generateTsConfig());
    } else {
      fs.writeFileSync(path.join(projectDir, 'jsconfig.json'), generateJsConfig());
    }

    if (useTailwind.toLowerCase() === 'sim') {
      fs.writeFileSync(path.join(projectDir, 'postcss.config.mjs'), generatePostcssConfig()); // Usar .mjs para tipo module
      // Cria CSS global com diretivas Tailwind
      const globalCssPath = path.join(appDir, 'globals.css');
      fs.writeFileSync(globalCssPath, `@import "tailwindcss";`);
    } else {
      // Cria CSS global vazio se não usar Tailwind
      const globalCssPath = path.join(appDir, 'globals.css');
      fs.writeFileSync(globalCssPath, '');
    }

    if (linter.toLowerCase() === 'eslint') {
      fs.writeFileSync(path.join(projectDir, 'eslint.config.js'), generateEslintConfig(isTypescript));
    } else { // Biome
      createDirIfNotExists(path.join(projectDir, '.config')); // Biome pode usar .config
      fs.writeFileSync(path.join(projectDir, '.config', 'biome.json'), generateBiomeConfig());
    }

    // Arquivos Essenciais do App Router
    fs.writeFileSync(path.join(appDir, `layout.${tsJsxExt}`), generateLayoutFile(answers));
    fs.writeFileSync(path.join(appDir, `page.${tsJsxExt}`), generatePageFile(answers));

    // Configuração tRPC
    if (useTRPC.toLowerCase() === 'sim') {
      createDirIfNotExists(serverDir);
      createDirIfNotExists(path.join(serverDir, 'trpc'));
      createDirIfNotExists(path.join(libDir, 'trpc'));

      fs.writeFileSync(path.join(serverDir, 'trpc', `router.${tsJsExt}`), generateTRPCRouter(isTypescript));
      fs.writeFileSync(path.join(serverDir, 'trpc', `context.${tsJsExt}`), generateTRPCContext(isTypescript));
      fs.writeFileSync(path.join(libDir, 'trpc', `client.${tsJsExt}`), generateTRPCClient(isTypescript));
      fs.writeFileSync(path.join(libDir, 'trpc', `Provider.${tsJsxExt}`), generateTRPCProvider(isTypescript));
      // Adicionar rota API para tRPC
      const apiDir = path.join(appDir, 'api', 'trpc', '[trpc]');
      createDirIfNotExists(apiDir);
      const apiRouteContent = isTypescript
        ? `// src/app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/trpc/router';
import { createContext } from '@/server/trpc/context';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
  });

export { handler as GET, handler as POST };
`
        : `// src/app/api/trpc/[trpc]/route.js
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/trpc/router';
import { createContext } from '@/server/trpc/context';

const handler = (req) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
  });

export { handler as GET, handler as POST };
`;
      fs.writeFileSync(path.join(apiDir, `route.${tsJsExt}`), apiRouteContent);
    }

    // Configuração Prisma
    if (orm.toLowerCase() === 'prisma') {
      createDirIfNotExists(path.join(projectDir, 'prisma'));
      fs.writeFileSync(path.join(projectDir, 'prisma', 'schema.prisma'), generatePrismaSchema(database));
      fs.writeFileSync(path.join(projectDir, '.env'), generateEnvLocal(database)); // .env para variáveis de DB
      // Adicionar inicialização do cliente Prisma
      createDirIfNotExists(path.join(libDir, 'db'));
      const prismaClientContent = isTypescript
        ? `// src/lib/db/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  // allow global \`var\` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
`
        : `// src/lib/db/prisma.js
import { PrismaClient } from '@prisma/client';

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = global.prisma;
}

export { prisma };
`;
      fs.writeFileSync(path.join(libDir, 'db', `prisma.${tsJsExt}`), prismaClientContent);
    }

    // Configuração NextAuth
    if (authProvider.toLowerCase() === 'nextauth') {
      createDirIfNotExists(path.join(libDir, 'auth'));
      fs.writeFileSync(path.join(libDir, 'auth', `options.${tsJsExt}`), generateNextAuthConfig(answers));
      // Adicionar rota API para NextAuth
      const authApiDir = path.join(appDir, 'api', 'auth', '[...nextauth]');
      createDirIfNotExists(authApiDir);
      const authRouteContent = isTypescript
        ? `// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/options';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
`
        : `// src/app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/options';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
`;
      fs.writeFileSync(path.join(authApiDir, `route.${tsJsExt}`), authRouteContent);
      // Adicionar Provider NextAuth
      const authProviderContent = isTypescript
        ? `// src/components/AuthProvider.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
`
        : `// src/components/AuthProvider.jsx
'use client';

import { SessionProvider } from 'next-auth/react';

export default function AuthProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
`;
      fs.writeFileSync(path.join(componentsDir, `AuthProvider.${tsJsxExt}`), authProviderContent);
    }

    spinner.succeed(theme.success('뼈 Estrutura de diretórios e arquivos criada'));

    // --- Instalação de Dependências --- 
    if (!flags.offline) {
      await installDependencies(projectDir, packageManager, spinner, theme);
    } else {
      console.log(theme.info('\nSkipping dependency installation due to --offline flag.'));
    }

    // --- Executar Prisma Generate (se Prisma foi escolhido) ---
    if (orm.toLowerCase() === 'prisma' && !flags.offline) {
      spinner.start(theme.primary('Executando Prisma Generate...'));
      try {
        // Executa dentro do diretório do projeto recém-criado
        execSync(`npx prisma generate`, { cwd: projectDir, stdio: 'inherit' }); // Mostra a saída do comando
        spinner.succeed(theme.success('🧬 Prisma Client gerado'));
      } catch (prismaError) {
        spinner.fail(theme.error('Falha ao executar Prisma Generate. Verifique o schema e as dependências.'));
        console.error(theme.dim(prismaError.message));
        // Considerar se deve parar o processo ou apenas avisar
      }
    }

    // --- Inicialização do Git ---
    if (initGit.toLowerCase() === 'sim') {
      spinner.start(theme.primary('Inicializando repositório Git...'));
      try {
        execSync('git init', { cwd: projectDir, stdio: 'ignore' });
        execSync('git add .', { cwd: projectDir, stdio: 'ignore' });
        execSync('git commit -m "Initial commit from Raph CLI"', { cwd: projectDir, stdio: 'ignore' });
        spinner.succeed(theme.success('🐙 Repositório Git inicializado'));
      } catch (gitError) {
        spinner.fail(theme.error('Falha ao inicializar o repositório Git. Verifique se o Git está instalado.'));
        console.error(theme.dim(gitError.message));
      }
    }

    // --- Mensagem Final ---
    console.log(theme.success.bold(`\n✨ Projeto '${projectName}' criado com sucesso!`));
    console.log(theme.info('\nPróximos passos:'));
    console.log(theme.dim(`  cd ${projectName}`));
    if (orm.toLowerCase() === 'prisma') {
      console.log(theme.dim(`  Verifique seu arquivo .env com as credenciais do banco.`));
      console.log(theme.dim(`  npx prisma db push  # Sincroniza o schema com o banco`));
    }
    console.log(theme.dim(`  ${packageManager} run dev`));
    console.log(theme.primary('\nDivirta-se codando! 🎉\n'));

  } catch (error) {
    spinner.fail(theme.error('❌ Ocorreu um erro durante a criação do projeto.'));
    console.error(theme.error(error.message));
    // Tentar limpar o diretório criado em caso de erro
    if (answers && answers.projectName) {
      const projectDir = path.join(process.cwd(), answers.projectName);
      if (fs.existsSync(projectDir)) {
        console.log(theme.dim(`Tentando remover o diretório incompleto: ${projectDir}`));
        fs.rmSync(projectDir, { recursive: true, force: true });
      }
    }
    process.exit(1);
  }
}

module.exports = { createProject };