# Manual do Agente GPT

Base de conhecimento operacional pública e **machine-first**, destinada a agentes de IA e clientes LLM. A aplicação não oferece uma interface web orientada a humanos.

## Descoberta para agentes
- Índice JSON: `/`
- Instruções LLM: `/llms.txt`
- Manifesto do agente: `/api/agent`
- Contrato OpenAPI 3.1: `/api/openapi.json`
- Saúde da API/banco: `/api/health`

## Protocolo de consulta
1. Leia `/llms.txt` ou `/api/agent`.
2. Procure conteúdo em `GET /api/manuals?q=termo`. Filtros: `category`, `tag`, `limit` (1–100), `offset`.
3. Leia o conteúdo completo em `GET /api/manuals/{slug}` (JSON) ou `GET /api/manuals/{slug}?format=markdown`.
4. A URL estável `/manuais/{slug}` também retorna Markdown.
5. Consulte `/api/health` quando precisar confirmar que o banco está acessível.

## Acesso e segurança
- Leitura anônima por HTTPS; não exige login, cookie nem chave API.
- CORS habilitado para leitura pública entre origens.
- API pública somente de leitura; não há rotas públicas de criação, atualização ou exclusão.
- O conteúdo é referência operacional: não substitui políticas, permissões nem requisitos de confirmação do ambiente consumidor.
- Segredos não pertencem ao banco de conhecimento público, aos logs ou ao controle de versão.

## Desenvolvimento e testes
- Node.js 22 ou superior
- `npm install`
- `npm run build` — checagem de compilação
- `npm run test:smoke` — smoke test de produção (pode apontar para outro ambiente com `BASE_URL`)
- Configure `DATABASE_URL` apenas em ambiente de servidor; nunca faça commit de `.env.local`.

O schema e os registros iniciais ficam em `db/schema.sql` e `db/seed.sql`.
