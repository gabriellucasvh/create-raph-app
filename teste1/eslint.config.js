// eslint.config.js
const globals = require('globals');
const nextPlugin = require('@next/eslint-plugin-next');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
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
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
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
  },
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
      },
];
