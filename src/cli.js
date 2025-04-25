#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { isModuleInstalled } = require('./utils/helpers');
const { createProject } = require('./core/project-setup');
const getTheme = require('./config/theme'); // Importa a função assíncrona

// Lista de dependências necessárias para a *própria CLI* funcionar
const requiredDependencies = ['inquirer', 'chalk', 'ora', 'figlet', 'gradient-string'];
const missingDependencies = requiredDependencies.filter(dep => !isModuleInstalled(dep));

async function initializeCli() {
  // Carrega o tema ANTES de qualquer outra coisa que possa precisar dele
  const theme = await getTheme();

  if (missingDependencies.length > 0) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('É necessário instalar os seguintes pacotes para a CLI funcionar:');
    missingDependencies.forEach(dep => console.log(`- ${dep}`));

    const answer = await new Promise(resolve => {
      rl.question('Ok para prosseguir com a instalação? (s/n) ', resolve);
    });

    rl.close();

    if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'y') {
      console.log('\nInstalando dependências necessárias para a Raph CLI...');
      try {
        // Instalar no diretório global ou local da CLI, dependendo de como foi instalada
        // Idealmente, a CLI seria um pacote npm global ou local, gerenciando suas deps.
        // Para este exemplo, vamos assumir uma instalação local ou via npx.
        execSync(`npm install ${missingDependencies.join(' ')} --legacy-peer-deps`, {
          stdio: 'inherit'
        });
        console.log('\nDependências da CLI instaladas com sucesso! Reiniciando...');

        // Reinicia o script após a instalação
        const { spawn } = require('child_process');
        const nodePath = `"${process.execPath}"`;
        const cliScriptPath = path.resolve(__dirname, 'cli.js'); // Usar o caminho absoluto do novo arquivo
        const subprocess = spawn(`${nodePath}`, [cliScriptPath, ...process.argv.slice(2)], {
          stdio: 'inherit',
          shell: true,
        });

        subprocess.on('exit', (code) => {
          process.exit(code);
        });
        return; // Impede a execução do main() antes do reinício

      } catch (error) {
        console.error('\n❌ Erro ao instalar dependências da CLI.');
        console.error('   Por favor, execute manualmente:');
        console.error(`   npm install ${missingDependencies.join(' ')}`);
        process.exit(1);
      }
    } else {
      console.log('Instalação cancelada.');
      process.exit(0);
    }
  } else {
    // Se todas as dependências estão instaladas, continua com o script principal,
    // passando o tema já carregado.
    main(theme); // Passa o tema para main
  }
}

// Função principal da CLI - agora recebe 'theme' como argumento
async function main(theme) { // Adiciona 'theme' como parâmetro
  // Importações dinâmicas movidas para dentro de main ou onde são usadas
  // Não precisa mais carregar chalk/theme aqui, pois já foi passado
  const { default: figlet } = await import('figlet');
  const { default: gradient } = await import('gradient-string');

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

  // Logo - agora usa o 'theme' passado como argumento
  console.log('\n');
  console.log(gradient('#FFCC00', '#FFA500')(figlet.textSync('Raph CLI', { font: 'Standard' })));
  console.log('\n' + theme.accent('                 /\\_/\\'));
  console.log(theme.accent('                ( o.o )'));
  console.log(theme.accent('                 > ^ <'));
  console.log('\n' + theme.primary('Seu gerador de projetos Next.js com App Router!') + '\n');

  // Chama a função principal de criação do projeto, passando flags e o tema
  await createProject(flags, theme);
}

// Inicia a verificação de dependências e a execução
initializeCli().catch(async (error) => { // O catch pode permanecer como está
    // Tenta carregar o chalk diretamente para o erro, caso getTheme falhe
    let chalkErrorColor = (text) => text; // Fallback se chalk falhar
    try {
      const chalk = (await import('chalk')).default;
      chalkErrorColor = chalk.red;
    } catch (chalkError) {
      console.error('Falha ao carregar chalk para mensagem de erro:', chalkError);
    }
    console.error(`\n${chalkErrorColor('❌ Ocorreu um erro inesperado na inicialização:')}`, error);
    process.exit(1);
});