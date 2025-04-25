// src/core/dependencies.js
const { execSync } = require('child_process');

function generatePackageJson(answers) {
  const { 
    projectName, language, useTailwind, useTRPC, 
    authProvider, orm, linter, packageManager 
  } = answers;

  const isTypescript = language.toLowerCase() === 'typescript';

  const packageJson = {
    name: projectName,
    version: '0.1.0',
    private: true,
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      lint: linter.toLowerCase() === 'eslint' ? 'next lint' : 'biome check .'
    },
    dependencies: {
      'react': '^19.0.0', // Use React 19
      'react-dom': '^19.0.0',
      'next': '^15.3.0' // Use Next.js 15
    },
    devDependencies: {},
    framework: { name: 'next' } // Metadata for potential future use
  };

  // Adiciona dependências condicionais
  if (useTailwind.toLowerCase() === 'sim') {
    packageJson.devDependencies['tailwindcss'] = '^4'; // Tailwind v4
    packageJson.devDependencies['autoprefixer'] = '^10'; // Autoprefixer ainda é útil
    packageJson.devDependencies['@tailwindcss/postcss'] = '^4'; // Plugin PostCSS para Tailwind v4
  }

  if (useTRPC.toLowerCase() === 'sim') {
    Object.assign(packageJson.dependencies, {
      '@trpc/client': '^11.0.0',
      '@trpc/server': '^11.0.0',
      '@trpc/react-query': '^11.0.0',
      '@trpc/next': '^11.0.0',
      '@tanstack/react-query': '^5.69.0', // React Query v5
      'zod': '^3.24.2'
    });
  }

  if (authProvider.toLowerCase() === 'nextauth') {
    packageJson.dependencies['next-auth'] = '^4.24.11'; // NextAuth v4 (v5 é beta)
    // Se usar Prisma, pode precisar de @next-auth/prisma-adapter
    if (orm.toLowerCase() === 'prisma') {
        packageJson.dependencies['@next-auth/prisma-adapter'] = '^1.0.7';
    }
  }

  if (orm.toLowerCase() === 'prisma') {
    packageJson.devDependencies['prisma'] = '^6.6.0'; // Prisma CLI
    packageJson.dependencies['@prisma/client'] = '^6.6.0'; // Prisma Client <--- Adicionado aqui
  }

  if (linter.toLowerCase() === 'eslint') {
    Object.assign(packageJson.devDependencies, {
      'eslint': '^9.24.0', // ESLint v9
      'eslint-config-next': packageJson.dependencies.next // Usa a versão do Next.js
    });
    if (isTypescript) {
      // ESLint v9 usa config plana, @typescript-eslint/parser pode não ser sempre necessário diretamente
      // mas é bom ter para regras específicas de TS
      packageJson.devDependencies['@typescript-eslint/parser'] = '^8.29.1';
      packageJson.devDependencies['@typescript-eslint/eslint-plugin'] = '^8.29.1';
    }
  } else { // Biome
    packageJson.devDependencies['@biomejs/biome'] = '^1.3.3';
  }

  if (isTypescript) {
    Object.assign(packageJson.devDependencies, {
      'typescript': '^5', // TypeScript v5
      '@types/react': '^19.0.12', // Tipos para React 19
      '@types/node': '^20.17.28',
      '@types/react-dom': '^19' // Tipos para React DOM 19
    });
  }

  return packageJson;
}

async function installDependencies(projectDir, packageManager, spinner, theme) {
  spinner.start(theme.primary(`Instalando dependências com ${packageManager}...`));
  const installCommand = packageManager === 'yarn' ? 'yarn install' 
                       : packageManager === 'pnpm' ? 'pnpm install' 
                       : packageManager === 'bun' ? 'bun install' 
                       : 'npm install';
  try {
    execSync(installCommand, { cwd: projectDir, stdio: 'pipe' }); // Instala tudo do package.json
    spinner.succeed(theme.success(`📦 Dependências instaladas com ${packageManager}`));
  } catch (error) {
    spinner.fail(theme.error(`Falha ao instalar dependências com ${packageManager}.`));
    console.error(theme.dim(error.stderr ? error.stderr.toString() : error.message));
    console.log(theme.info(`Por favor, execute '${installCommand}' manualmente no diretório '${path.basename(projectDir)}'.`));
    // Não sair do processo, permitir que o usuário instale manualmente
  }
}

module.exports = {
  generatePackageJson,
  installDependencies
};