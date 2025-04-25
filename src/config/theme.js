// src/config/theme.js

// Função assíncrona para carregar o chalk e retornar o tema
async function getTheme() {
  // Carrega o chalk dinamicamente
  const chalk = (await import('chalk')).default; // Acessa o export default

  const theme = {
    primary: chalk.hex('#FFCC00'), // Amarelo
    secondary: chalk.hex('#000000'), // Preto
    accent: chalk.hex('#FFFFFF'), // Branco (para o gato)
    success: chalk.green,
    error: chalk.red,
    info: chalk.cyan,
    dim: chalk.dim
  };

  return theme;
}

module.exports = getTheme; // Exporta a função assíncrona