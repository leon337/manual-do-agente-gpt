# Manual do Agente GPT

Aplicação pública de manuais operacionais com Next.js, TypeScript e PostgreSQL no Neon.

## Recursos
- Biblioteca pública e páginas de manuais com URLs permanentes
- Pesquisa por título, código, resumo, conteúdo e tags
- API pública: /api/manuals, /api/manuals?q=termo, /api/manuals/slug e /api/categories
- Health check: /api/health
- Guia para agentes: /llms.txt
- Sitemap e robots.txt
- Nenhuma autenticação para leitura; sem API pública de escrita

## Desenvolvimento
1. Node.js 22 ou superior
2. Copie .env.example para .env.local e configure DATABASE_URL
3. Execute npm install e npm run dev

A credencial DATABASE_URL fica apenas no ambiente do servidor. Nunca faça commit de .env.local.
