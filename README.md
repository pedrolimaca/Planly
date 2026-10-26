# Planly — Sistema Inteligente de Organização Pessoal

Um verdadeiro **sistema operacional da sua vida pessoal**, moderno, responsivo e completo, desenvolvido em React 18, TypeScript, CSS Custom Tokens (Design System) e Vite.

O sistema centraliza todas as dimensões da rotina diária: tarefas, agenda, hábitos, saúde, finanças, treinos de musculação, alimentação, estudos e vida espiritual com persistência de dados e feedback em tempo real.

---

## 🚀 Funcionalidades Principais

### 1. 🌟 Painel Executivo (Visão Geral)
- Saudação dinâmica com citação inspiradora matinal.
- Indicadores-chave: tarefas pendentes, taxa de hábitos cumpridos no dia, saldo financeiro mensal e próximo evento agendado.
- Prioridades do dia com check rápido de conclusão.
- Atalhos diretos para todas as áreas da vida.

### 2. ☀️ Meu Dia (Comando Diário)
- Centro de foco diário com navegação temporal (Ontem, Hoje, Amanhã).
- Adição rápida de tarefas inline para a rotina diária.
- Rastreador visual de ingestão de água (+250ml até a meta de 2.500ml).
- Checklist de hábitos do dia com um clique.
- Exibição do treino do dia, refeições programadas e leitura bíblica.

### 3. ✅ Gestão de Tarefas
- Modos de visualização dupla: **Lista** e **Quadro Kanban** (A Fazer, Em Progresso, Concluído).
- Subtarefas / Checklist dinâmico para decomposição de tarefas complexas.
- Filtros por status, prioridade (Baixa, Média, Alta, Urgente) e categoria.
- Prazos com data e horário, tags e notas adicionais.

### 4. 📅 Calendário & Agenda
- Visualização mensal em grade com dias do mês anterior e seguinte.
- Indicadores visuais de eventos diretamente nos dias do calendário.
- Painel de agenda detalhado para o dia selecionado com horários e localização.
- Criação, edição e exclusão de compromissos com cores personalizáveis.

### 5. ⏳ Rotinas & Hábitos
- Matriz de constância visual dos **últimos 7 dias** para cada hábito.
- Cálculo automático de sequências ativas (dias consecutivos) e maior sequência.
- Porcentagem de conclusão diária e metas personalizadas.

### 6. 💰 Gestão Financeira
- Resumo mensal de receitas, despesas, saldo líquido e contas a pagar.
- Orçamentos e tetos de gastos por categoria com barras de progresso e alertas de estouro.
- Histórico completo de transações com métodos de pagamento (PIX, Cartão, Boleto, etc.).
- Alternância rápida entre status pago/pendente.

### 7. 🏋️ Academia & Treinos
- Fichas de treino divididas (ex: Treino A - Peito e Tríceps, Treino B - Costas e Bíceps).
- Lista de exercícios com séries, repetições, carga (kg) e tempo estimado.
- Registro de sessões de treino com histórico e notas de rendimento.

### 8. 🥗 Alimentação & Nutrição
- Planejamento de refeições diárias (Café da Manhã, Almoço, Lanche, Jantar).
- Acompanhamento de metas de macronutrientes: Calorias, Proteínas, Carboidratos e Gorduras.
- Alimentos, porções e valores nutricionais por refeição.

### 9. 🩺 Saúde & Cuidados Pessoais
- Histórico de consultas médicas, exames laboratoriais, medicamentos e vacinas.
- Anotações de preparo de exames, médicos responsáveis e clínicas.

### 10. 📚 Estudos & Trabalho
- Gerenciamento de projetos, cursos, livros e certificações.
- **Cronômetro Pomodoro Integrado**: ciclo de 25 minutos de foco e 5 minutos de pausa com controle de play, pause e reset.

### 11. ⛪ Vida Espiritual & Fé
- Leitura bíblica do dia com referência e reflexão espiritual.
- Registro de intenções de oração, Santo Terço e diário espiritual.

### 12. 🎯 Metas & Sonhos de Vida
- Definição de metas divididas por áreas (Carreira, Finanças, Saúde, Espiritualidade, etc.).
- Decomposição em **Marcos / Submetas** com cálculo automático de progresso.

### 13. 📊 Relatórios & Inteligência
- Métricas consolidadas de produtividade, taxa de poupança e constância de hábitos.
- Exportação de backup completo da sua vida em formato **JSON**.

### 14. ⚙️ Configurações & Personalização
- Alternância entre **Tema Claro** e **Tema Escuro** (Dark Mode).
- Restauração de dados de demonstração ou limpeza da base com 1 clique.
- Suporte a armazenamento local (offline-first) e migrações prontas para Supabase.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18, TypeScript, Vite.
- **Roteamento**: React Router v6.
- **Design Tokens & Estilização**: CSS Custom Properties moderno (paleta violeta/púrpura refinada com tons quentes inspirada nos mockups de referência).
- **Ícones**: Lucide React.
- **Manipulação de Datas**: `date-fns` com localização pt-BR.
- **Banco de Dados**: Suporte dual — `localStorage` completo (persistência garantida e imediata) + scripts de migração PostgreSQL com RLS para Supabase em `supabase/migrations/`.

---

## 🏃 Como Rodar o Projeto

1. Instalar as dependências:
```bash
npm install
```

2. Executar o servidor de desenvolvimento:
```bash
npm run dev
```

3. Acessar a aplicação no navegador em:
```
http://localhost:5173
```

4. Compilar para produção:
```bash
npm run build
```
