# Manual do Agente GPT

Base de conhecimento operacional pública e machine-first, destinada a agentes de IA e clientes LLM. Não há interface web orientada a humanos.

## Descoberta para agentes
- Índice JSON: /
- Instruções LLM: /llms.txt
- Manifesto do agente: /api/agent
- Contrato OpenAPI 3.1: /api/openapi.json
- Endpoint MCP remoto: https://manual-do-agente-gpt.vercel.app/mcp
- Saúde da API/banco: /api/health

## MCP (integração nativa de ferramentas)
Configure um cliente MCP remoto para usar a URL https://manual-do-agente-gpt.vercel.app/mcp via Streamable HTTP. Os clientes descobrem automaticamente as ferramentas disponíveis:
- get_usage_instructions
- search_manuals
- read_manual
- list_categories
- check_service_health

Todas as ferramentas são somente leitura. Não há ferramentas MCP para escrever, atualizar ou excluir conhecimento.

## Protocolo REST
1. Leia /llms.txt ou /api/agent.
2. Procure manuais com GET /api/manuals?q=termo. Filtros: category, tag, limit (1–100), offset.
3. Leia o conteúdo em GET /api/manuals/{slug} (JSON) ou GET /api/manuals/{slug}?format=markdown.
4. A URL estável /manuais/{slug} também retorna Markdown.

## Acesso e segurança
- Leitura anônima por HTTPS; não exige login, cookie nem chave API.
- CORS habilitado para a REST API pública.
- O conteúdo é referência operacional; não substitui políticas, permissões nem confirmações exigidas pelo ambiente consumidor.
- Segredos não pertencem ao banco público, aos logs ou ao controle de versão.

## Desenvolvimento e testes
- Node.js 22 ou superior para desenvolvimento e compatibilidade MCP.
- npm install
- npm run build — checagem de compilação
- npm run test:smoke — contratos básicos da API em produção
- npm run test:mcp — conformance smoke test usando o cliente MCP oficial

Configure DATABASE_URL apenas no ambiente do servidor; nunca faça commit de .env.local. Schema e seeds estão em db/schema.sql e db/seed.sql.
