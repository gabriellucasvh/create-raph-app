// src/utils/helpers.js
const fs = require('fs');
const path = require('path');

// Função para verificar se um módulo está instalado
function isModuleInstalled(moduleName) {
  try {
    // Tenta resolver a partir do diretório da CLI ou globalmente
    require.resolve(moduleName, { paths: [path.join(__dirname, '..', '..', 'node_modules'), process.cwd()] });
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

// Função para criar diretórios se não existirem
function createDirIfNotExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

module.exports = {
  isModuleInstalled,
  createDirIfNotExists
};