INSERT INTO categories(slug,name,description) VALUES
('desenvolvimento','Desenvolvimento','Construção, manutenção e validação de software.'),
('deploy-infraestrutura','Deploy e infraestrutura','Publicação, hospedagem e bancos de dados.'),
('agentes-ia','Agentes de IA','Procedimentos de consulta e execução por agentes.')
ON CONFLICT(slug) DO NOTHING;

INSERT INTO manuals(slug,code,title,summary,content_md,category_id,tags,status,version)
SELECT
  'executar-tarefa-com-manual',
  'AGT-001',
  'Executar uma tarefa consultando o manual',
  'Procedimento padrão para um agente localizar instruções, planejar, executar e verificar uma tarefa.',
  $manual$
# Objetivo
Executar uma tarefa usando este manual como referência, mantendo transparência sobre o que foi realmente concluído.

## Procedimento
1. Entenda o objetivo. Identifique o resultado final solicitado e as restrições do usuário.
2. Pesquise a biblioteca. Consulte /api/manuals?q=termo ou o índice geral em /api/manuals.
3. Leia o manual completo. Abra a URL individual ou consulte /api/manuals/slug.
4. Confira pré-requisitos. Verifique ferramentas, permissões, dados de entrada e dependências.
5. Monte um plano curto. Divida o trabalho em etapas observáveis.
6. Execute com segurança. Não exponha segredos, não ultrapasse permissões e peça confirmação antes de ações irreversíveis ou externas de alto impacto.
7. Valide cada etapa. Execute testes e verifique respostas, logs ou estado final sempre que possível.
8. Relate evidências. Informe o que foi feito, testes executados, links e pendências. Não declare sucesso sem verificação.

## Critérios de conclusão
- O resultado foi produzido ou a limitação foi identificada.
- Os testes relevantes foram executados e seus resultados registrados.
- Segredos e dados privados foram preservados.
- A resposta diferencia fatos verificados, suposições e próximos passos.

## Limites
O manual é uma referência operacional. Ele não substitui as políticas do ambiente, não concede permissões e não autoriza ações que o usuário não solicitou.
$manual$,
  (SELECT id FROM categories WHERE slug='agentes-ia'),
  ARRAY['agentes','planejamento','verificação','execução'],
  'published',
  1
WHERE NOT EXISTS (SELECT 1 FROM manuals WHERE slug='executar-tarefa-com-manual');

INSERT INTO manuals(slug,code,title,summary,content_md,category_id,tags,status,version)
SELECT
  'configurar-variaveis-ambiente-vercel-neon',
  'DEP-001',
  'Configurar variáveis de ambiente no Vercel com Neon',
  'Procedimento verificado para ligar uma aplicação Vercel a um banco Neon, redeployar e validar o serviço sem expor credenciais.',
  $manual$
# Objetivo
Configurar uma variável de ambiente sensível no projeto Vercel correto, conectá-la ao banco Neon correto e provar que o novo deployment consegue consultar o banco.

## Regra principal
Não basta adicionar uma variável ao projeto. Deployments já existentes não recebem automaticamente alterações posteriores de ambiente. Depois de adicionar ou alterar a variável, é necessário criar um novo deployment do ambiente-alvo e testar a aplicação publicada.

## 1. Identifique os recursos exatos
Antes de alterar qualquer configuração, determine e registre internamente:
- ID e equipe/escopo do projeto Vercel.
- ID do projeto Neon, branch, nome do banco e role.
- Nome exato da variável e ambientes em que a aplicação precisa dela.
- Deployment de produção atual, seu estado, repositório/commit e alias de produção.

Use IDs estáveis quando disponíveis. Um erro 404 ao consultar um recurso com escopo de equipe pode ser uma questão de escopo/permissão da ferramenta; não crie outro projeto nem outro banco como tentativa.

## 2. Tente primeiro a integração oficial
Quando está disponível e autorizada, prefira a integração Neon-Managed para Vercel:
1. No Neon Console, abra a integração com Vercel.
2. Instale a integração oficial pelo Marketplace da Vercel.
3. Escolha vincular uma conta Neon existente; não crie uma nova base por acidente.
4. Selecione a equipe Vercel, o projeto Vercel, o projeto Neon, o banco e a role corretos.
5. Mantenha a cobrança no Neon quando esse for o modelo pretendido; não aceite uma troca de faturamento não solicitada.
6. Termine o OAuth e confirme que o vínculo aparece como conectado e que DATABASE_URL foi criada para os ambientes necessários.

Se o fluxo parar em login, autorização, erro de escopo ou limite da automação, não repita cliques indefinidamente e não declare sucesso. Use o caminho direto abaixo somente se as conexões de ferramenta já autorizadas oferecerem as permissões necessárias.

Documentação oficial da integração:
https://neon.com/docs/guides/neon-managed-vercel-integration

## 3. Caminho direto pela API quando a integração não termina
Use a API de configuração Vercel suportada pela ferramenta/conector autorizado e a conexão emitida pelo Neon:
1. Consulte as variáveis atuais do projeto Vercel usando filter_project_envs (ou API equivalente), identificando apenas key, target, type e ID.
2. Confirme se DATABASE_URL já existe. Se não existir, crie-a. Não altere outras variáveis e não use upsert para sobrescrever um segredo já existente sem confirmar que uma rotação/substituição é necessária.
3. Obtenha a URI de conexão do projeto, branch, banco e role Neon exatos por ferramenta autorizada.
4. Passe a URI diretamente, em memória, para a criação da variável DATABASE_URL como encrypted, selecionando somente os ambientes necessários: production, preview e development.
5. Nunca imprima a URI, a resposta integral de uma chamada que possa conter valor de variável, a senha, nem um objeto de configuração completo. Reduza a saída a campos permitidos antes de exibir: nome da chave, alvos, tipo e ID.
6. Não salve a URI em arquivos do repositório, logs, relatórios, comentários, histórico de terminal ou mensagens para o usuário.

Importante: algumas respostas da API Vercel podem incluir um campo value codificado mesmo com decrypt=false. Trate a resposta bruta como secreta e faça allowlist dos campos antes de qualquer impressão. Não conclua que o valor está seguro só porque está codificado.

## 4. Crie um novo deployment
Depois que a variável estiver configurada:
1. Selecione o deployment de produção existente do projeto correto.
2. Use a operação de redeploy da Vercel com o ID desse deployment e destino production; isso cria um novo ID/URL e herda configurações do projeto.
3. Aguarde o estado final READY. Se o build falhar, consulte os logs e resolva o erro antes de testar o alias principal.
4. Confirme que o deployment novo recebeu o alias de produção esperado. Não promova um preview para produção por engano.

Documentação oficial de variáveis de ambiente:
https://vercel.com/docs/environment-variables

## 5. Smoke tests obrigatórios
Teste tanto o alias de produção quanto a conexão com o banco. Não imprima a variável.

Exemplo de comandos (substitua o domínio pelo alias confirmado):
curl -sS --max-time 12 -w '\nHTTP_STATUS=%{http_code}\n' https://SEU-DOMINIO/api/health
curl -sS --max-time 12 -w '\nHTTP_STATUS=%{http_code}\n' https://SEU-DOMINIO/api/manuals

Critérios de aceite:
- DATABASE_URL existe no projeto e nos ambientes pretendidos (verificar metadados, nunca o valor).
- O deployment novo está READY e aponta para o projeto/commit esperado.
- /api/health responde HTTP 200 e indica database: connected.
- Endpoints dependentes do banco retornam HTTP 200 e dados válidos.
- Nenhuma saída, log ou resposta pública contém a URI, senha ou token.
- Um endpoint público que não exige autenticação continua acessível sem cookies ou sessão.

## 6. Diagnóstico rápido
- DATABASE_URL ausente: corrija no ID do projeto Vercel verificado.
- Variável presente, mas saúde 503: confirme que houve redeploy; depois confira branch, banco, role, TLS e logs de runtime.
- Deployment está BUILDING: consulte o estado novamente; teste somente depois de READY.
- Deployment específico dá 302/403 por proteção Vercel: teste o alias público oficial e não remova proteção global para mascarar o problema.
- Integração Marketplace presa em autenticação: use uma sessão de navegador autorizada ou o caminho direto via API autorizado; nunca peça ao usuário para colar senha/token no chat.
- Resposta de API inclui valores de segredos: interrompa a impressão e filtre os campos; rotacione a credencial se ela tiver sido exposta.

## Limites de segurança
- Não crie banco, role, equipe ou projeto duplicado para contornar falhas de acesso.
- Não altere faturamento nem outras configurações fora do escopo.
- Não desative autenticação globalmente para fazer smoke tests.
- Não exponha ou compartilhe credenciais.
- Manuais orientam a execução, mas não concedem permissão para operações externas ou irreversíveis.
$manual$,
  (SELECT id FROM categories WHERE slug='deploy-infraestrutura'),
  ARRAY['vercel','neon','deploy','variaveis-de-ambiente','segredos','postgresql','conexao-de-banco'],
  'published',
  1
WHERE NOT EXISTS (SELECT 1 FROM manuals WHERE slug='configurar-variaveis-ambiente-vercel-neon');
