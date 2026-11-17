> Atualização de 17/11/2026: este documento registra a auditoria inicial. Para o estado atual de sincronização, revisão responsiva e publicação na Vercel, consulte [DEPLOY_VERCEL.md](DEPLOY_VERCEL.md).

# Auditoria Planly — 11/11/2026

## Base inspecionada
React 18, TypeScript, Vite 5, React Router, date-fns, Zod e Supabase JS. Há 18 páginas, componentes compartilhados, CRUD em localStorage, migração PostgreSQL e uma Edge Function de IA. Não há sincronização remota do CRUD nem suíte de testes no estado inicial.

## Achados e prioridades
1. **Crítico — autenticidade:** notícias fixas anunciadas como recentes; santos e evangelhos escolhidos pelo dia da semana. Remover essas afirmações e apresentar indisponibilidade até obtenção de fonte datada.
2. **Crítico — segurança:** autenticação local compara senhas em texto simples. O perfil local não autentica uma sessão Supabase. A função de IA não verifica usuário no código, nem limita entrada/saída. Não publicar como serviço multiusuário sem autenticação real.
3. **Alto — consistência:** cada tela lê o armazenamento apenas ao montar. Callbacks de criação rápida/IA não estão conectados às páginas. Introduzir notificação central de alterações e assinaturas por tela.
4. **Alto — rotina:** horários e treinos fixos ignoram agenda, fichas e disponibilidade. Criar planejamento derivado das mesmas tarefas/eventos/treinos, respeitando intervalos e capacidade diária.
5. **Alto — IA:** ações remotas não são validadas em runtime, treino vira tarefa, hábito não consta no enum remoto, resposta HTTP da Responses API é lida como propriedade de SDK. Upload sem limite, sem confirmação; atalhos anexam documentos fictícios.
6. **Alto — persistência:** JSON inválido é silenciosamente interpretado como vazio, podendo ser sobrescrito; exportação usa lista fixa. Hidratação e várias conclusões existem apenas no estado; chaves de rotina não isolam usuário.
7. **Médio — experiência:** Meu Dia concentra conteúdo duplicado, componentes extensos, botões de ícones sem rótulos e grades com largura mínima rígida. Preservar identidade violeta e telas existentes.
8. **Médio — domínio:** metas financeiras não aparecem nas finanças; não há agenda de treinos, guia sequencial do rosário, fonte real de notícias, OAuth Calendar/Spotify ou análise DOCX validada.

## Sequência de correção
Notificações e proteção do armazenamento → planejamento compartilhado e agenda de treinos → fontes honestas e consulta externa → validação/segurança da IA e anexos → metas financeiras e autocuidado → testes e documentação das limitações.

## Restrições
Nenhuma alteração de produção ou migração remota autorizada. Dados locais serão preservados. Integrações dependentes de credenciais devem permanecer explicitamente indisponíveis, sem substituir falhas por dados inventados. Build não comprova autenticação, fontes externas ou persistência remota.

## Resultado do incremento implementado
- CRUD notifica alterações em mesma aba e entre abas; telas principais e relatórios assinam atualizações. Leituras corrompidas falham explicitamente em vez de sobrescrever registros.
- Plano diário compartilhado no dashboard/Meu Dia, prioridades, orçamento de tempo, compromissos fixos, conflitos, adiamento de excesso e ações de foco. Fichas de treino com dias/horários derivados no calendário.
- Removidas notícias estáticas e liturgia inferida; Radar com proxy RSS de duas fontes e indisponibilidade explícita. Rosário interativo, autocuidado persistido em hábitos, metas financeiras compartilhadas, biblioteca e projetos com tarefas.
- IA: validação Zod, revisão de propostas, anexos limitados, remoção de anexos simulados, correção da resposta HTTP, autenticação no servidor e migração de quota. Gravação após confirmação continua local. Login Supabase substitui comparação de senhas locais; dados legados preservados.
- Páginas carregadas sob demanda. O pacote principal continua acima de 500 kB, principalmente devido ao drawer global e serviços compartilhados; otimização adicional permanece necessária.

## Verificações executadas
- `npm test`: 12 testes passaram, incluindo persistência/isolamento, dados corrompidos, agenda, treino semanal, ações reais do agente local, propostas e confirmação, anexos, rosário, exportação e Edge Function com autenticação/quota/provedor simulados.
- `npm run lint`: zero erros; dois avisos de Fast Refresh nos contextos.
- `npm run build`: TypeScript e Vite passaram; aviso de chunk acima de 500 kB.
- Chrome headless em perfil descartável: 12 rotas renderizadas, zero `pageerror`; criação no armazenamento refletida no dashboard sem recarregar, treino no calendário e meta financeira no módulo Metas.
- Nove rotas em 390 × 844 px sem overflow horizontal. Resultado detalhado em `tests/results/browser.json`. Não é uma auditoria completa de acessibilidade.
- RSS Agência Brasil e Vatican News: HTTP 200, sem publicação de Edge Functions. Link de liturgia validado na fonte.
- Não executados: login real com usuário remoto, migração PostgreSQL, chamadas cobradas à OpenAI, upload real PDF/imagem pelo provedor, OAuth, sincronização remota ou teste de carga. Os testes simulados da função não comprovam esses fluxos.

## Pendências de escopo
O pedido completo ainda não está concluído: CRUD remoto transacional com RLS, ferramentas de editar/reagendar por IA, contexto completo entre todos os módulos, liturgia datada licenciada, demonstrações verificadas de exercícios, DOCX, Google Calendar/Spotify/YouTube OAuth, recomendações externas personalizadas, análise de tendências e resumos de notícias ainda precisam de implementação/validação. Detalhes de configuração e roteiro manual em `INTEGRACOES_PLANLY.md`. Não foi realizado deploy nem alteração de dados de produção.

## Arquivos alterados ou adicionados
- `AUDITORIA_PLANLY.md`
- `INTEGRACOES_PLANLY.md`
- `README.md`
- `package.json`
- `scripts/test.mjs`
- `src/App.tsx`
- `src/components/ai/AIAgentDrawer.tsx`
- `src/components/common/AccountAccess.tsx`
- `src/components/common/FinancialGoals.tsx`
- `src/components/common/GrowthProjects.tsx`
- `src/components/common/RosaryGuide.tsx`
- `src/components/common/SelfCare.tsx`
- `src/components/common/SmartDay.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/contexts/AuthContext.tsx`
- `src/hooks/useDataRefresh.ts`
- `src/index.css`
- `src/pages/CalendarPage.tsx`
- `src/pages/DashboardPage.tsx`
- `src/pages/FinancePage.tsx`
- `src/pages/FitnessPage.tsx`
- `src/pages/GoalsPage.tsx`
- `src/pages/HabitsPage.tsx`
- `src/pages/HealthPage.tsx`
- `src/pages/MyDayPage.tsx`
- `src/pages/NutritionPage.tsx`
- `src/pages/RadarPage.tsx`
- `src/pages/RemindersPage.tsx`
- `src/pages/ReportsPage.tsx`
- `src/pages/SettingsPage.tsx`
- `src/pages/SpiritualPage.tsx`
- `src/pages/StudiesPage.tsx`
- `src/pages/TasksPage.tsx`
- `src/services/agentValidation.ts`
- `src/services/aiAgentService.ts`
- `src/services/dayPlanner.ts`
- `src/services/storage.ts`
- `src/services/transformationContent.ts`
- `src/types/index.ts`
- `supabase/functions/planly-agent/index.ts`
- `supabase/functions/planly-radar/index.ts`
- `supabase/migrations/20261111_agent_rate_limit.sql`
- `tests/core.test.ts`
- `tests/edge.test.ts`
- `tests/results/browser.json`

## Correção validada após relato de conteúdo vazio — 11/11/2026
A causa do Radar vazio era a dependência de uma Edge Function não publicada. Leituras e santos ainda eram avisos de indisponibilidade, sem consulta implementada. Essas áreas foram substituídas por serviço real de mesma origem (`/api/public/news` e `/api/public/catholic`), integrado a Vite, preview e servidor Node da versão compilada. Fontes fixas: Agência Brasil e Vatican News. Datas são verificadas antes de exibir as leituras; os santos vêm da página do mês/dia correspondente. Textos integrais permanecem nos links oficiais, sem alegação de licença de reprodução.

Verificação final no Chrome contra a versão compilada: 30 notícias reais, atualização manual funcionando, dois santos e referências de Tito 3,1–7 e Lucas 17,11–19 para 11/11/2026. A troca para 10/11 exibiu outras referências. Uma resposta HTTP 502 simulada mostrou erro e preservou as notícias válidas. Zero erros de JavaScript e sem overflow horizontal em 390 px. Evidência em `tests/results/public-content-browser.json`; teste repetível em `tests/public-content.browser.cjs`.

`npm test`: 15 testes passaram. `npm run lint`: zero erros e dois avisos de Fast Refresh. `npm run build`: passou, inclusive a compilação do serviço Node. Permanece o aviso de bundle principal grande. Não foi realizado deploy remoto. Hospedagem exclusivamente estática precisa encaminhar as rotas ao serviço ou usar a função opcional `planly-content`.

## Violão e transparência de consumo
Implementado catálogo musical real, biblioteca de favoritos e uma prática por dia compartilhada com Tarefas/Meu Dia. Removido o cartão fixo de Dust in the Wind. Sugestões variam por data e histórico recente; técnicas são regras locais identificadas, sem transcrições musicais inventadas. Corrigida a contagem de sequência que antes aumentava a cada clique. Acrescentados aviso de consumo no Copilot, explicação em Configurações e metadados de tokens retornados pela função (depende de publicação remota autorizada).

Validação: 17 testes automatizados passaram, lint sem erros (dois avisos existentes) e build passou. Chrome consultou 60 músicas reais, confirmou persistência de favorito/prática/25 minutos, integração com Meu Dia e layout móvel. Nenhuma chamada paga foi feita nem painel de cobrança acessado. Detalhes em `INTEGRACOES_PLANLY.md`.
