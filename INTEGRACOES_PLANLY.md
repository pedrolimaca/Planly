# Integrações e validação

## Dados e autenticação
Atualização de 17/11/2026: o CRUD usa cache local por conta e sincronização automática com PostgreSQL após instalar `supabase/migrations/20261117_sync_records.sql`. Veja [Publicação e sincronização](DEPLOY_VERCEL.md). O perfil de desenvolvimento sem login continua local. Não apague o armazenamento do navegador. Exporte nas Configurações antes de trocar de máquina ou perfil. O login agora usa Supabase Auth; senhas novas não são gravadas no localStorage. Dados legados e o antigo `lifeos_users` não foram apagados automaticamente; esse registro legado pode conter senhas antigas e não é mais utilizado.

Variáveis públicas do Vite: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. A chave anônima é pública por definição; nunca colocar service-role ou OpenAI em variáveis VITE. Habilite confirmação de e-mail e configure URLs permitidas no Supabase. Para levar registros do perfil local à conta remota, use a importação explícita em Configurações no navegador e endereço onde eles estão salvos.

## Agente
Código: `supabase/functions/planly-agent/index.ts`. Secrets no servidor: `OPENAI_API_KEY`, opcional `OPENAI_MODEL` (padrão preservado: gpt-4o-mini); `SUPABASE_URL` e `SUPABASE_ANON_KEY` do ambiente da função. Exige token de usuário validado em `/auth/v1/user`. A função extrai propostas estruturadas; após revisão, o cliente valida com Zod e grava no armazenamento local. **Não é persistência remota nem execução transacional no backend.**

Limites: mensagem 12.000 caracteres, arquivo 5 MB, até 20 ações, saída 4.000 tokens e timeout de 45 s. As ações confirmadas geram histórico em `agent_history`, incluído no backup. São suportados TXT/MD/CSV/JSON e, via provedor remoto, PDF e imagens. DOCX está explicitamente recusado. Conteúdo de arquivo é tratado como dado não confiável. Não há exclusão remota ou edição em lote por IA. O modo local identifica-se como regras, não como modelo. Não analisa documentos nem inventa resultados.

Migração aditiva `20261111_agent_rate_limit.sql`: reserva atômica de quota por usuário, 30 solicitações/hora e 200/dia; a função recusa chamada paga se a quota não puder ser verificada. A migração não foi aplicada nem testada contra PostgreSQL remoto.

Necessário antes de produção: aplicar/testar a migração de limite, orçamento no provedor, validação/execução transacional de ferramentas no backend, testes reais de autenticação e chamadas cobradas. Limites do payload não substituem rate limiting. Não foi efetuada chamada paga nesta execução.

Referência consultada: https://developers.openai.com/api/reference/resources/responses/methods/create — resposta HTTP usa `output[].content[]`, não o helper `output_text` dos SDKs.

## Notícias, leituras e santos — serviço real
O servidor consulta diretamente as fontes, sem chave de API, sessão ou IA. Funciona em `npm run dev`, `npm run preview` e no build com `npm start` (porta 4173; variáveis opcionais `PORT` e `HOST`). `npm run build` também compila o serviço em `dist-server/`. Para executar produção, manter `dist/`, `dist-server/` e `server/start.mjs`; o servidor compilado não depende do esbuild em runtime.

Rotas GET:
- `/api/public/news`: feeds de Agência Brasil e Vatican News, cache de cinco minutos e erros por fonte.
- `/api/public/catholic?date=AAAA-MM-DD`: páginas datadas da Vatican News para leituras e santos.

As origens são fixas; parâmetros não permitem URL arbitrária. Há timeout, limite de 2 MB por fonte e cache limitado a 50 entradas. O frontend valida o formato, confere a data da liturgia, filtra notícias futuras/antigas e renderiza apenas texto e links HTTPS das fontes permitidas. Conteúdo externo nunca é injetado como HTML na interface. Falhas parciais são mostradas sem apagar resultados ainda válidos.

Fontes:
- https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml
- https://www.vaticannews.va/pt.rss.xml
- https://www.vaticannews.va/pt/palavra-do-dia/2026/11/11.html (exemplo; data construída pela seleção)
- https://www.vaticannews.va/pt/santo-do-dia/11/11.html (exemplo; calendário por mês/dia)

Uma hospedagem somente estática não executa essas rotas. Nesse caso, encaminhe `/api/public/*` ao servidor Node ou publique, com autorização, `supabase/functions/planly-content/index.ts`. O cliente usa essa função apenas quando o serviço de mesma origem não está disponível. A função legada `planly-radar` deixou de ser exigida pelo frontend. Nenhum deploy remoto foi realizado.

Validação real em 11/11/2026: as duas rotas locais retornaram conteúdo das fontes; Chrome exibiu 31 notícias, dois santos e duas leituras. Atualização manual e troca para 10/11 foram verificadas, sem mocks nesses caminhos. A suíte automatizada também simula falhas de fontes separadamente.

## Espiritualidade e saúde
Leituras oficiais: https://www.vaticannews.va/pt/palavra-do-dia.html (link validado). Leituras e santos agora aparecem dentro do app com a data validada, referências e breves trechos. Nenhum evangelho ou santo é inferido pelo dia da semana. Texto integral e história completa abrem na fonte oficial, pois não há autorização de reprodução integral cadastrada. Salmos e demais leituras só aparecem quando disponibilizados na página consultada. Rosário local usa os mistérios tradicionais e permite escolha manual; registro de conclusão é persistido no diário espiritual.

Autocuidado geral baseado em https://www.aad.org/public/everyday-care/skin-care-basics/care/skin-care-budget. Não há diagnóstico nem prescrição. Vídeos antigos de exercícios são buscas externas, não vídeos previamente verificados.

## Integrações ainda não implementadas
Google Calendar e Spotify precisam de projetos OAuth, escopos, redirect URLs e armazenamento seguro de tokens no backend. Não há botões alegando conexão. YouTube existente usa links de pesquisa, sem API nem verificação de vídeo. Não há biblioteca externa de exercícios ou livros conectada. Biblioteca pessoal aceita links HTTPS informados pelo usuário e permite transformá-los em tarefas. Essas integrações não foram declaradas funcionais.

## Como executar
`npm install`, `npm run dev`, `npm test`, `npm run lint`, `npm run build`.
O teste usa o esbuild já presente na árvore do Vite, sem framework extra. Recomenda-se Node 22 ou superior: a versão atual do Supabase JS avisa que Node 20 deixará de ser suportado.

## Roteiro manual
1. Configurações: exportar dados. Ajustar nome e tema. Login remoto é opcional e troca o conjunto local visível.
2. Criar tarefa com prazo hoje; conferir Meu Dia e dashboard. Concluir no planejador e verificar Tarefas.
3. No planejador, definir início, fim e minutos disponíveis; cadastrar trabalho na agenda; conferir que sugestões não ocupam esse intervalo. Testar o botão de 30 minutos e amanhã.
4. Academia: criar ficha, escolher dia atual e horário; conferir Calendário e Meu Dia. Alterar o nome/horário da ficha e conferir novamente.
5. Finanças: criar meta, informar valor reservado; conferir o percentual em Metas e Sonhos.
6. Saúde: salvar rotinas da manhã/noite; concluir em Hábitos e verificar o dashboard.
7. Espiritualidade: trocar mistérios e avançar contas; concluir e conferir o diário.
8. Estudos: criar projeto empreendedor; conferir projeto e tarefas. Salvar conteúdo HTTPS e transformá-lo em tarefa.
9. Radar: aguardar carga automática e clicar Atualizar notícias; conferir fonte, data e links. Vida Espiritual: conferir santos e referências, trocar data e atualizar. Essas consultas funcionam localmente sem publicar Supabase.
10. IA: sem sessão remota deve explicar a limitação. Com função configurada, pedir tarefa, revisar proposta e confirmar; conferir persistência. Anexo inválido deve ser recusado e cancelar proposta não deve alterar registros.

## Repetir a validação de navegador
O teste ao vivo é separado da suíte unitária porque consulta a internet. Instale Playwright em um diretório temporário e informe os caminhos; o projeto não adiciona essa dependência ao produto:

```bash
npm install --prefix /tmp/planly-browser playwright --no-audit --no-fund
npm run build
npm start
# Em outro terminal, com Chrome instalado no caminho abaixo:
PLANLY_TEST_URL=http://127.0.0.1:4173 PLANLY_PLAYWRIGHT_PATH=/tmp/planly-browser/node_modules/playwright PLANLY_CHROME_PATH=/opt/google/chrome/chrome node tests/public-content.browser.cjs
```

Resultado final da versão compilada em 11/11/2026: 30 notícias na consulta, atualização e mudança de data aprovadas, erro de rede tratado sem apagar notícias válidas e zero erros de JavaScript. O número de notícias varia com as publicações e a janela de 24 horas.

## Biblioteca de violão e consumo de IA — 11/11/2026
`GET /api/public/music?q=...` pesquisa o catálogo público Apple iTunes Search, com até 60 gravações por consulta, cache de cinco minutos, limite de tamanho e timeout compartilhados. Não usa OpenAI. Metadados e links vêm da fonte; o aplicativo não reproduz previews, capas, letras ou tablaturas do catálogo. Fonte/documentação: https://performance-partners.apple.com/search-api . A função opcional `planly-content` também aceita `kind: music` e `q`.

A página de violão substitui a seleção fixa de sete músicas por pesquisa, favoritos, preferências de estudo, sugestões variadas pela data e exclusão de práticas concluídas nos sete dias anteriores. Exercícios são orientações locais de técnica; não representam arranjos das músicas nem avaliação automática de habilidade. Pesquisa de cifras e aulas abre mecanismos externos e não implica vídeo validado.

A escolha cria/atualiza uma única tarefa `guitar:AAAA-MM-DD`, exibida no Meu Dia e dashboard. Tempo e conclusão ficam nas tarefas, e a sequência usa dias únicos realmente concluídos. Dados anteriores em chaves `planly_guitar_*` foram preservados; não foram automaticamente migrados. O material antigo com tablaturas aproximadas sem fonte foi substituído por links de pesquisa claramente identificados.

Teste ao vivo da versão compilada: consulta Almir Sater retornou 60 gravações; favorito, escolha, registro de 25 minutos, conclusão, recarregamento e exibição em Meu Dia passaram. Sem erros de JavaScript e sem overflow em 390 px. Evidência: `tests/results/guitar-browser.json`; script: `tests/guitar.browser.cjs` (mesmas variáveis do teste anterior).

### Quem paga a IA
- Consultas públicas (notícias, liturgia, música) e regras locais não usam a OpenAI.
- O agente remoto chama a Responses API com `OPENAI_API_KEY`, armazenada nos secrets do Supabase, usando `gpt-4o-mini` por padrão ou `OPENAI_MODEL`.
- Tokens medem entrada e saída do modelo. A conta/projeto associado à chave é responsável pela cobrança ou consumo de créditos. A chave pública do Supabase não fornece tokens OpenAI.
- Gerar a proposta já pode consumir tokens, mesmo cancelando as ações. Confirmar somente persiste dados; não desfaz a chamada já realizada.
- Não foi consultado o painel remoto de cobrança nem identificado o titular da chave. Não é possível afirmar saldo, valor gasto ou ausência de cobrança a partir deste repositório.
- Esta atualização devolve `usage` do provedor e registra respostas recebidas em `ai_usage`, visíveis em Configurações. É necessário publicar a função atualizada para receber esses dados. O registro é local, parcial e começa nesta versão; não substitui a fatura nem registra chamadas que falharam antes de retornar ao cliente.
- Os testes da função usam respostas simuladas. Não foi feita chamada paga à OpenAI nesta implementação e nenhuma função remota foi publicada.

Documentação oficial: https://developers.openai.com/api/docs/pricing e https://developers.openai.com/api/docs/guides/production-best-practices . Histórico completo deve ser consultado pelo titular em https://platform.openai.com/usage .


### Prática diária e atualização automática (16/11/2026)
- Novo caderno de prática: 14 padrões originais de dedilhado em Am e 14 frases originais de solo pentatônico, em rodízio pela data local. Não são solos transcritos de gravações.
- Oito músicas gospel/sertanejas com links externos de cifras; o catálogo Apple permanece disponível para outras buscas. Cifras completas não são armazenadas pelo Planly. Os links dependem do provedor; Cifra Club bloqueou consultas automatizadas diretas com HTTP 403 nesta verificação, embora páginas e repertórios apareçam na busca web.
- Registro da música diária utiliza a tarefa canônica guitar:DATA, compartilhada com Meu Dia.
- Radar consulta as fontes a cada 15 minutos enquanto visível e ao retornar à aba/conexão (intervalo mínimo de um minuto). O servidor mantém cache de cinco minutos.
- Teste de navegador tests/daily-guitar.browser.cjs usa respostas controladas para verificar virada de data, persistência, largura móvel e renovação periódica.


### Importação de fichas de academia
- A função planly-agent retorna workout com exercícios estruturados (séries, repetições, kg, descanso e observações), preservados após revisão. PDF, imagens, TXT, CSV, MD e JSON até 5 MB; texto até 60 mil caracteres, sem truncamento silencioso.
- Dias semanais geram recorrência; data sem dias semanais gera sessão única. A aba Calendário deriva os mesmos registros, sem duplicação de eventos. Sem data/dias, permanece somente na biblioteca.
- Cada exercício tem uma pesquisa externa no YouTube pelo nome. Não há análise de vídeo, seleção automática de vídeo verificado nem navegação web geral pela IA.
- Requer publicar a função planly-agent atualizada, sessão Supabase, OPENAI_API_KEY e migração da quota. Alterações locais não publicam a função. Testes usam provedor simulado; nenhuma chamada paga foi feita.


### Repertório católico e calendário brasileiro
- Três músicas católicas incluídas no rodízio (11 músicas ao todo), com cifras externas e solos/introduções no módulo Oficina.
- A consulta católica também localiza a página exata da Canção Nova pelo calendário e valida dia, mês e ano antes de mostrar celebração e cor.
- Usuário informou usar a Liturgia Diária da Paulus. A versão pública consultada não fornece a página do prefácio ou a opção de Oração Eucarística do subsídio. Esses campos permanecem explicitamente não confirmados; não há integração com a edição impressa/assinada nem escolha automática da Oração Eucarística.
- Verificado ao vivo para 16/11/2026: 33ª Semana do Tempo Comum, segunda-feira, verde. Vinte testes passaram, inclusive rejeição de artigo com data divergente.


### Recomendações online de violão
- /api/public/guitar-discovery?date=AAAA-MM-DD consulta iTunes para um artista católico selecionado pela data e vídeos públicos do Cifra Club via RSS. Artistas variam entre oito consultas; as faixas vêm da internet, não do repertório fixo.
- Histórico guitar_discovery por usuário mantém a seleção diária, exclui títulos/artistas e IDs recebidos nos últimos 30 dias e preserva sugestões salvas quando a rede falha. Quando o feed se esgota, informa a ausência e oferece pesquisa externa, sem inventar aulas.
- Busca automática específica de solos e dedilhados católicos: configurar YOUTUBE_API_KEY somente no servidor (Vite lê .env.local; npm start recebe variável de ambiente; Edge usa secret). Nunca usar VITE_YOUTUBE_API_KEY. A integração usa search.list com cache de 24 horas e quota do projeto Google. Sem chave, o feed público continua funcionando, mas não garante aulas católicas.
- Os vídeos são selecionados por metadados; não foram assistidos nem certificados. Cifras das músicas descobertas são links de pesquisa, não transcrições verificadas.
- A capa enviada identifica Paulus, Liturgia Diária nº 416, agosto/2026. Não contém as rubricas internas: faltam PDF/fotos das páginas das missas ou acesso autorizado ao conteúdo para extrair prefácio, página e oração proposta. Não existe importação automática da revista implementada.


### Consulta automática Paulus (17/11/2026)
O app inicia a consulta litúrgica ao abrir e quando muda a data local. O servidor descobre páginas na home/busca interna da Paulus, aceita apenas links do domínio e rota de liturgia e exige datePublished exato no JSON-LD da própria página. Extrai somente rubricas explícitas, incluindo “pref.”; não infere oração eucarística nem página de revista. Resultados aparecem no painel; Google fica como consulta complementar manual. Cache em memória de 5 minutos e coalescência de consultas evitam repetir buscas entre dashboard e Vida Espiritual. Não há serviço rodando com o aplicativo fechado.
