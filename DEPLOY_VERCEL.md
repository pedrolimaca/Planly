# Publicar Planly e usar a mesma conta no PC e no celular

## Situação da revisão de 17/11/2026

O aplicativo passou a ter cache local por conta e sincronização com Supabase. Isso requer a migração abaixo; apenas informar as chaves não instala o banco. O teste de conexão ao endereço configurado neste ambiente falhou por resolução DNS. A migração foi validada em PostgreSQL de teste, mas não foi aplicada nem confirmada no projeto remoto.

## Configuração necessária

1. No Supabase, confirme que seu projeto está ativo e copie a URL e a chave pública do projeto correto.
2. Execute `supabase/migrations/20261117_sync_records.sql` no SQL Editor desse projeto. Ela cria `planly_records`, políticas de acesso por conta e a função `planly_write_record`. Não apaga as tabelas anteriores. Precisa do serviço Supabase Auth (schema `auth`). Os registros locais serão enviados quando a conta entrar; dados que só estejam em tabelas antigas do Supabase não são importados automaticamente.
3. Na Vercel, importe este repositório com framework **Vite**, comando `npm run build` e diretório `dist`. Use Node.js 22. O `vercel.json` inclui a API serverless de conteúdo e as rotas da aplicação. Não publique somente a pasta `dist` sem a API.
4. Defina `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` nas variáveis da Vercel. São valores públicos do cliente; nunca use `service_role` nem uma chave secreta nesses campos. Após alterar variáveis `VITE_`, faça novo deploy.
5. Opcionalmente, configure `YOUTUBE_API_KEY` **sem** prefixo `VITE_` para a pesquisa de tutoriais pelo YouTube no servidor.
6. Em Supabase Authentication → URL Configuration, configure Site URL e Redirect URLs com o domínio HTTPS publicado. Ative o provedor de e-mail e confira a entrega das confirmações de cadastro.
7. Abra o domínio publicado, crie/confirme sua conta e entre com **o mesmo e-mail nos dois dispositivos**. A versão de produção exige login; o perfil local continua disponível no desenvolvimento.

## Levar os dados que já estavam no computador

No navegador e endereço onde você já usava o Planly, exporte o backup em Configurações. Entre na conta e, em **Conta e privacidade → Trazer dados do perfil local deste navegador**, use **Importar dados locais para minha conta**. Isso inclui exemplos que você tenha mantido, preserva os dados originais e evita duplicar identificadores já existentes. Aguarde **Dados sincronizados com sua conta** antes de fechar.

O armazenamento de `localhost` e o do domínio Vercel são separados pelo navegador: o site publicado não consegue ler o cache de `localhost`. Faça a importação enquanto estiver logado na mesma conta no servidor local; a nuvem levará os dados ao domínio publicado. Não há upload/importação de arquivo JSON nesta tela.

## Conferência após publicar

- Abra `/notes` diretamente e atualize a página: deve carregar a aplicação.
- Crie uma anotação no PC, espere o indicador de sincronização e abra-a no celular. A busca ocorre a cada 15 segundos, ao voltar à aba ou ao clicar em **Sincronizar agora**.
- Edite no celular e confira no PC; exclua e confira nos dois. Use outra conta e verifique que ela não vê seus dados.
- Desconecte a internet com a página já aberta, edite, reconecte e espere o envio. Não limpe os dados do navegador enquanto houver alterações pendentes. Não é um PWA com garantia de abrir offline.
- Se os dois aparelhos alterarem o mesmo registro antes de sincronizar, resolva a escolha de versão em Configurações. A aplicação não sobrescreve silenciosamente o conflito.
- Confira `/api/public/news` e a aba Vida Espiritual. As fontes externas podem ficar indisponíveis; o aplicativo informa isso sem inventar conteúdo. A busca da liturgia é iniciada ao abrir o aplicativo, sem necessidade de pesquisar manualmente.

## IA e limites

Publicar o frontend e a API pública não publica a IA. O agente depende da Edge Function `planly-agent`, das migrações pertinentes (incluindo `20261111_agent_rate_limit.sql`) e de `OPENAI_API_KEY` configurada apenas nos secrets do servidor Supabase. Os custos são da conta proprietária dessa chave. Não há confirmação de publicação/configuração desse agente nesta revisão.

Os dados dos módulos que usam o serviço de armazenamento, o progresso diário e o perfil usam a sincronização. Estado transitório da interface, formulários ainda não salvos e caches de fontes externas não são dados compartilhados. Arquivos anexados por link continuam no serviço de origem. Uma alteração sem conexão só chega ao outro dispositivo após o envio.

## Verificação local reproduzível

- `npm test`: testes de lógica, conteúdo e sincronização simulada.
- `npm run lint` e `npm run build`: análise estática e produção.
- `tests/database-sync.cjs`: aplica SQL em PGlite (PostgreSQL) e testa permissões, idempotência e conflitos. Defina `PLANLY_PGLITE_PATH` para uma instalação de `@electric-sql/pglite`.
- `tests/responsive.browser.cjs`: 19 rotas em 375, 768 e 1440 px; APIs externas simuladas indisponíveis para isolar layout.
- `tests/cloud-sync.browser.cjs`: dois contextos Chrome com autenticação e API Supabase simuladas; criação, edição, recarga e exclusão pela interface. Não substitui o teste no Supabase real.
- Scripts de navegador precisam de Playwright/Chrome. Defina `PLANLY_PLAYWRIGHT_PATH`, `PLANLY_CHROME_PATH` e mantenha `npm run dev -- --host 127.0.0.1 --port 4186 --strictPort` ativo.

## Resultados observados nesta revisão

- 25 testes automatizados passaram, incluindo adaptador da Vercel, fila offline, conflitos e exclusões entre dispositivos simulados.
- Migração SQL passou em PostgreSQL de teste: acesso autenticado, idempotência, conflito de revisão, isolamento entre contas e bloqueio anônimo.
- Dois contextos de Chrome passaram pelo fluxo de anotação criada no PC, editada no celular, recarregada e excluída, com Supabase simulado.
- Build de produção concluído; ESLint sem erros, com dois avisos de Fast Refresh nos contextos React. O bundle principal ainda gera aviso de tamanho; há oportunidade de otimização para conexões móveis lentas.
- Notícias reais e liturgia de 17/11/2026 retornaram conteúdo. A Paulus informou “pref. comum ou dos santos”, sem página ou oração eucarística explícitas. Não foram preenchidas por suposição.
- 57 verificações de layout (19 rotas em 375, 768 e 1440 px): sem controles cortados e sem erros de JavaScript; tabelas e abas com rolagem interna foram tratadas como intencionais.
- Conferência visual em 375 px nos temas claro/escuro e formulário de tarefas: corrigidos campo de horário cortado e sobreposição do botão flutuante da IA. Os testes de layout não cobrem todas as combinações possíveis de dados, formulários e aparelhos.
- **Pendente antes do uso real:** endereço Supabase resolvendo, migração aplicada, cadastro/login real, teste de sincronização após o deploy e configuração/publicação separada do agente de IA. Não houve publicação na Vercel nem alteração do banco remoto nesta revisão.
- O teste de dois navegadores também passou contra o pacote compilado servido em `http://127.0.0.1:4187`, mantendo a API Supabase simulada. O desenvolvimento continua em `http://localhost:4186`.
- Endereço público configurado que falhou no DNS: `hdsrxduguvevbyymmxaf.supabase.co`. Verifique o estado do projeto no painel antes de reutilizar esse endereço na Vercel.
- Corrigido o comando de build para fixar `NODE_ENV=production`: o ambiente da IDE estava definindo `development` e isso removia a exigência de login do pacote. `scripts/build-client.mjs` agora fixa o modo de produção antes de invocar o Vite. Use sempre `npm run build`.
- Após corrigir o modo de compilação, `tests/production-auth.browser.cjs` passou: rota de anotações exige login, nenhum formulário privado aparece sem sessão e a entrada cabe em 375 px. O teste de sincronização em dois navegadores passou novamente nesse pacote final.
