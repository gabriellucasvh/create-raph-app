
# Raph CLI 🐱

Gerador de projetos **Next.js 15 com App Router** feito com Node.js.

Site oficial: [https://raph1.vercel.app/](https://raph1.vercel.app/)

## ✨ Recursos principais

- Estrutura baseada em `src/app`
- Suporte a TypeScript ou JavaScript
- Tailwind CSS v4 (PostCSS adaptado)
- tRPC (adaptado para App Router)
- NextAuth para autenticação
- Prisma ORM com suporte a PostgreSQL e MySQL
- ESLint ou Biome
- Provider automático para tRPC e Auth
- Suporte a vários gerenciadores de pacotes (npm, yarn, pnpm, bun)

---

## 🚀 Instalação

```bash
npx create-raph-app@latest
```

> A CLI irá perguntar:
> - Nome do projeto
> - Linguagem (TypeScript/JavaScript)
> - Tailwind CSS
> - tRPC
> - Autenticação (NextAuth)
> - ORM (Prisma)
> - Banco de dados
> - Linter (ESLint/Biome)
> - Inicialização do Git
> - Gerenciador de pacotes

---

## 📁 Estrutura criada

```bash
project-name/
├── src/
│   ├── app/           # App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── _trpc/     # Provider tRPC
│   │   └── _auth/     # Provider Auth (se usar NextAuth)
│   ├── components/
│   ├── lib/
│   │   └── trpc.ts
│   └── server/        # Routers e contexto tRPC
│       ├── routers/
│       └── trpc.ts
├── prisma/            # (se usar Prisma)
├── public/
├── .env
├── README.md
```

---

## 📦 Dependências

Instaladas automaticamente com o gerenciador de pacotes escolhido.

---

## 🔧 Comandos

```bash
npm run dev     # ou yarn dev / pnpm dev / bun dev
npm run build
npm run lint
```

---

## 🧠 Observações

- **Tailwind v4**: usa `@tailwindcss/postcss` no lugar do `tailwind.config.js`
- **tRPC**: funciona via `fetchRequestHandler` com CORS e App Router
- **NextAuth**: já vem com route handler e provider de sessão
- **Prisma**: já inclui o schema com model exemplo e `.env`

---

## ✅ Requisitos

- Node.js 18+
- Git instalado (opcional para repositório)
- Internet ativa (modo offline disponível via `--offline`)

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Se você encontrou algum bug, deseja sugerir melhorias ou adicionar novos recursos à **Raph CLI**, siga os passos abaixo:

1. **Fork** este repositório
2. Crie uma branch: `git checkout -b minha-feature`
3. Faça suas alterações e dê commit: `git commit -m "feat: minha nova funcionalidade"`
4. Envie sua branch: `git push origin minha-feature`
5. Abra um **Pull Request**

> Certifique-se de seguir o estilo e a organização do projeto para manter a consistência.

--- 

## 🐾 Agradecimentos

Feito com carinho por [Gabriel Gonçalves](https://gabriellucasvh.vercel.app/) 💛
