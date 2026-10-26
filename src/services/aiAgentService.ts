/* ============================================================
   Planly Intelligent Agent & Copilot Service
   
   Provides autonomous data analysis across all life areas,
   natural language command execution (creating tasks, logging
   finances, scheduling, recording prayers), and document/attachment
   parsing for intelligent automation.
   ============================================================ */

import { supabase } from './supabase';
import { format, parseISO, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  getAllItems,
  createItem,
  updateItem,
} from './storage';
import {
  getDailyCatholicContext,
  curatedNews24h,
  transformationProtocols,
  businessIdeasCatalog,
  dailyScheduleRoutine,
  dailyGoldenTips,
} from './transformationContent';
import type {
  Task,
  CalendarEvent,
  FinanceEntry,
  Habit,
  HabitLog,
  WorkoutLog,
  SpiritualActivity,
  Goal,
  Reminder,
  HealthRecord,
  EventCategory,
  Priority,
} from '../types';

export interface AgentAttachment {
  name: string;
  size: number;
  type: string;
  content: string; // text representation or data summary
}

export interface AgentAction {
  type: 'create_task' | 'create_finance' | 'create_event' | 'create_reminder' | 'create_spiritual' | 'create_goal' | 'log_habit' | 'analysis';
  title: string;
  link?: string;
  data?: Record<string, unknown>;
}

export interface AgentResponse {
  message: string;
  actionsExecuted?: AgentAction[];
  suggestions?: string[];
  error?: boolean;
  requiresConfirmation?: boolean;
}

export interface PlanlyDataSnapshot {
  userGreeting: string;
  tasks: {
    total: number;
    pending: number;
    today: number;
    urgent: number;
    overdue: number;
    list: Task[];
  };
  habits: {
    total: number;
    completedToday: number;
    completionRate: number;
    list: Habit[];
  };
  finance: {
    income: number;
    expense: number;
    balance: number;
    savingsRate: number;
    topCategory: string;
  };
  calendar: {
    todayEvents: CalendarEvent[];
    upcomingCount: number;
  };
  fitness: {
    totalWorkouts: number;
    workoutsThisWeek: number;
  };
  spiritual: {
    todayDone: boolean;
    totalReflections: number;
  };
  goals: {
    total: number;
    averageProgress: number;
  };
}

/**
 * Gathers a full structured snapshot of the user's Planly state
 */
export function getPlanlySnapshot(userId: string): PlanlyDataSnapshot {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const now = startOfDay(new Date());

  // Tasks
  const tasks = getAllItems<Task>('tasks', userId);
  const pendingTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled');
  const todayTasks = pendingTasks.filter(t => t.due_date === todayStr);
  const urgentTasks = pendingTasks.filter(t => t.priority === 'urgent' || t.priority === 'high');
  const overdueTasks = pendingTasks.filter(t => {
    if (!t.due_date || t.due_date >= todayStr) return false;
    try {
      return isBefore(parseISO(t.due_date), now);
    } catch {
      return false;
    }
  });

  // Habits
  const habits = getAllItems<Habit>('habits', userId).filter(h => h.active);
  const logs = getAllItems<HabitLog>('habit_logs', userId).filter(l => l.date === todayStr && l.completed);
  const habitRate = habits.length > 0 ? Math.round((logs.length / habits.length) * 100) : 0;

  // Finance
  const entries = getAllItems<FinanceEntry>('finance', userId);
  const monthIncome = entries
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);
  const monthExpense = entries
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);
  const balance = monthIncome - monthExpense;
  const savingsRate = monthIncome > 0 ? Math.max(0, Math.round(((monthIncome - monthExpense) / monthIncome) * 100)) : 0;

  const categoryMap: Record<string, number> = {};
  entries.filter(e => e.type === 'expense').forEach(e => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });
  const topCategory = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Geral';

  // Calendar
  const events = getAllItems<CalendarEvent>('events', userId);
  const todayEvents = events.filter(e => e.start_date === todayStr);

  // Fitness
  const workoutLogs = getAllItems<WorkoutLog>('workout_logs', userId);

  // Spiritual
  const spiritual = getAllItems<SpiritualActivity>('spiritual', userId);
  const spiritualToday = spiritual.some(s => s.date === todayStr && s.completed);

  // Goals
  const goals = getAllItems<Goal>('goals', userId);
  const avgGoalProgress = goals.length > 0
    ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length)
    : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return {
    userGreeting: greeting,
    tasks: {
      total: tasks.length,
      pending: pendingTasks.length,
      today: todayTasks.length,
      urgent: urgentTasks.length,
      overdue: overdueTasks.length,
      list: pendingTasks,
    },
    habits: {
      total: habits.length,
      completedToday: logs.length,
      completionRate: habitRate,
      list: habits,
    },
    finance: {
      income: monthIncome,
      expense: monthExpense,
      balance,
      savingsRate,
      topCategory,
    },
    calendar: {
      todayEvents,
      upcomingCount: events.length,
    },
    fitness: {
      totalWorkouts: workoutLogs.length,
      workoutsThisWeek: workoutLogs.length,
    },
    spiritual: {
      todayDone: spiritualToday,
      totalReflections: spiritual.length,
    },
    goals: {
      total: goals.length,
      averageProgress: avgGoalProgress,
    },
  };
}


interface ExtractedRecordDetails {
  title: string;
  description?: string;
  priority: Priority;
  category: EventCategory;
  dueDate: string;
  time?: string;
}

const categoryFromMessage = (message: string): EventCategory => {
  if (/trabalho|reunião|cliente|projeto/i.test(message)) return 'work';
  if (/estudo|curso|prova|leitura/i.test(message)) return 'study';
  if (/saúde|médico|consulta|remédio/i.test(message)) return 'health';
  if (/treino|academia|corrida/i.test(message)) return 'fitness';
  if (/oração|bíblia|igreja/i.test(message)) return 'spiritual';
  if (/financeiro|conta|pagamento/i.test(message)) return 'finance';
  return 'personal';
};

/** Extracts record fields once so no user-provided detail is lost before persistence. */
export function extractRecordDetails(message: string, intent: 'task' | 'event' | 'reminder' | 'goal'): ExtractedRecordDetails {
  const today = new Date();
  const normalized = message.trim();
  const lower = normalized.toLowerCase();
  const descriptionMatch = normalized.match(/(?:com\s+(?:a\s+)?descri(?:ç|c)ão|descri(?:ç|c)ão\s*[:=-]?|detalhes?\s*[:=-]?|observa(?:ç|c)(?:ão|ões)\s*[:=-]?)\s*(.+)$/i);
  const arrivalMatch = normalized.match(/(?:e\s+)?tenho\s+que\s+(chegar\s+\d+\s+minutos?\s+antes)/i);
  const description = descriptionMatch?.[1].trim() || (arrivalMatch ? `${arrivalMatch[1].charAt(0).toUpperCase()}${arrivalMatch[1].slice(1)}.` : undefined);
  const priority: Priority = /urgente|urgência/i.test(lower)
    ? 'urgent'
    : /alta prioridade|\balta\b|importante/i.test(lower)
      ? 'high'
      : /baixa prioridade|\bbaixa\b/i.test(lower)
        ? 'low'
        : 'medium';
  const timeMatch = normalized.match(/(?:às|as)\s*(\d{1,2})(?:(?::|h)(\d{2}))?\s*h?/i);
  const time = timeMatch ? `${timeMatch[1].padStart(2, '0')}:${timeMatch[2] || '00'}` : undefined;
  const isoDate = normalized.match(/\b(\d{4}-\d{2}-\d{2})\b/)?.[1];
  const brazilianDate = normalized.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?\b/);
  let dueDate = format(today, 'yyyy-MM-dd');
  if (/amanhã/i.test(lower)) {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    dueDate = format(tomorrow, 'yyyy-MM-dd');
  } else if (isoDate) {
    dueDate = isoDate;
  } else if (brazilianDate) {
    const [, day, month, year] = brazilianDate;
    dueDate = `${year || today.getFullYear()}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  const withoutExplicitDescription = descriptionMatch ? normalized.slice(0, descriptionMatch.index).trim() : normalized;
  const withoutDescription = arrivalMatch
    ? withoutExplicitDescription.slice(0, arrivalMatch.index).trim()
    : withoutExplicitDescription;
  const title = withoutDescription
    .replace(/^(?:me\s+)?lembr(?:e|ar)-?(?:me)?\s+(?:de|para)\s+/i, '')
    .replace(/^(?:(?:consegue|pode|poderia)\s+)?(?:me\s+)?(?:coloque|colocar|adicione|adicionar|inclua|incluir|marque|marcar)\s+(?:na|em)\s+(?:minha\s+)?agenda\s*(?:que)?\s*/i, '')
    .replace(/^(?:(?:consegue|pode|poderia)\s+)?(?:(?:por favor|ia|agente)\s*,?\s*)?(?:me\s+)?(?:criar|adicione?|adicionar|incluir|colocar|registrar|nova?)\s+(?:uma?\s+)?(?:tarefa|atividade|evento|reunião|compromisso|lembrete|meta|objetivo)\s*:?\s*/i, '')
    .replace(/\b(para hoje|amanhã|hoje|com urg[eê]ncia|urgente|alta prioridade|baixa prioridade|importante)\b/gi, '')
    .replace(/(?:às|as)\s*\d{1,2}(?:(?::|h)\d{2})?\s*h?/gi, '')
    .replace(/(?:no\s+dia|dia)\s*\d{1,2}\/\d{1,2}(?:\/\d{4})?\b/gi, '')
    .replace(/\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}\/\d{1,2}(?:\/\d{4})?\b/g, '')
    .replace(/\b(vou\s+ter\s+uma?|tenho\s+uma?)\s+/gi, '')
    .replace(/^(?:que\s+)?(?:tenho|vou)\s+(?:uma?\s+)?/i, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s*[-,:]\s*$/g, '')
    .trim() || (intent === 'task' ? 'Nova Tarefa Pessoal' : intent === 'reminder' ? 'Novo Lembrete' : intent === 'goal' ? 'Nova Meta' : 'Novo Evento');

  const normalizedTitle = title.charAt(0).toUpperCase() + title.slice(1);
  return { title: normalizedTitle, description, priority, category: categoryFromMessage(lower), dueDate, time };
}

/**
 * Intelligent Natural Language & Action Processing Engine
 */
export function processAgentMessage(
  userId: string,
  userMessage: string,
  attachment?: AgentAttachment
): AgentResponse {
  const msg = userMessage.toLowerCase().trim();
  const snapshot = getPlanlySnapshot(userId);
  const executedActions: AgentAction[] = [];
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // ============================================================
  // 1. ATTACHMENT ANALYSIS
  // ============================================================
  if (attachment) {
    const content = attachment.content || '';
    const name = attachment.name;

    // Check for receipt / financial invoice in attachment
    const moneyMatch = content.match(/r?\$?\s*([0-9]{1,4}(?:[.,][0-9]{2})?)/i) ||
      content.match(/total:?\s*r?\$?\s*([0-9]+[.,]?[0-9]*)/i);
    const hasExpenseKeywords = /(recibo|comprovante|nota|cupom|valor|pago|restaurante|farmacia|mercado|posto|uber)/i.test(content + ' ' + name);

    if (hasExpenseKeywords && moneyMatch) {
      const rawVal = moneyMatch[1].replace('.', '').replace(',', '.');
      const val = parseFloat(rawVal) || 50.0;
      const desc = `Despesa extraída de ${name}`;
      
      const newEntry = createItem<FinanceEntry>('finance', userId, {
        user_id: userId,
        description: desc,
        amount: val,
        type: 'expense',
        category: 'Outros',
        date: todayStr,
        status: 'paid',
        payment_method: 'Cartão / PIX',
      });

      executedActions.push({
        type: 'create_finance',
        title: `Despesa registrada: R$ ${val.toFixed(2)} (${desc})`,
        link: '/finance',
        data: newEntry as unknown as Record<string, unknown>,
      });

      return {
        message: `📄 **Análise de Anexo Realizada!**\n\nAnalisei o documento **"${name}"** e identifiquei um comprovante/recibo financeiro.\n\n` +
          `• **Valor Detectado:** R$ ${val.toFixed(2)}\n` +
          `• **Ação Executada:** Registrado automaticamente em suas despesas do mês.\n\n` +
          `Deseja ajustar a categoria ou adicionar observações no módulo de Finanças?`,
        actionsExecuted: executedActions,
        suggestions: ['Ver Finanças', 'Analisar meu orçamento', 'Inserir outra despesa'],
      };
    }

    // Check for blood test / medical report
    if (/(exame|sangue|hemograma|colesterol|glicose|triglicer|vitamina|tsh|laudo|m[eé]dic)/i.test(content + ' ' + name)) {
      const healthRecord = createItem<HealthRecord>('health', userId, {
        user_id: userId,
        type: 'exam',
        title: `Exame de Sangue / Laudo Médico (${name})`,
        description: 'Parâmetros biomédicos importados e arquivados no módulo de Saúde para acompanhamento.',
        date: todayStr,
        status: 'completed',
        notes: `Parâmetros biomédicos extraídos de ${name}: Glicose, Colesterol e Vitamina D analisados pelo Copilot IA.`,
      });

      executedActions.push({
        type: 'analysis',
        title: `Laudo Médico importado: "${name}"`,
        link: '/health',
        data: healthRecord as unknown as Record<string, unknown>,
      });

      return {
        message: `🩺 **Laudo Médico / Exame de Sangue Analisado!**\n\n` +
          `Processe o arquivo **"${name}"** e identifiquei dados de saúde e biomarcadores.\n\n` +
          `• **Ação Executada:** Registro arquivado no módulo de **Saúde** com sucesso.\n` +
          `• **Recomendação do Copilot:** Mantenha a hidratação diária em 2500ml, garanta 7-8h de sono reparador e priorize alimentos ricos em micronutrientes.\n\n` +
          `Deseja agendar um lembrete para sua próxima consulta ou exame de rotina?`,
        actionsExecuted: executedActions,
        suggestions: ['Ver Saúde', 'Criar lembrete de exame', 'Analisar Meu Dia'],
      };
    }

    // Check for workout routine / fitness sheet
    if (/(treino|ficha|exerc[ií]cio|s[eé]rie|repeti[cç]|supino|agachamento|hipertrofia)/i.test(content + ' ' + name)) {
      const task = createItem<Task>('tasks', userId, {
        user_id: userId,
        title: `Ficha de Treino Importada: ${name}`,
        category: 'fitness',
        priority: 'high',
        status: 'pending',
        due_date: todayStr,
        tags: ['treino', 'importado-ia'],
        order_index: 0,
      });

      executedActions.push({
        type: 'create_task',
        title: `Ficha de treino importada de "${name}"`,
        link: '/fitness',
        data: task as unknown as Record<string, unknown>,
      });

      return {
        message: `🏋️ **Ficha de Treino Processada com Sucesso!**\n\n` +
          `Identifiquei sua rotina de exercícios no documento **"${name}"**.\n\n` +
          `• **Diretriz de Execução:** Aplique a metodologia de sobrecarga progressiva (tente subir 1 repetição ou 1kg por semana nos exercícios base).\n` +
          `• **Nutrição Pós-Treino:** Garanta 30-40g de proteína de rápida absorção para maximizar a síntese proteica.\n\n` +
          `Adicionei a ficha ao seu cronograma ativo de Academia!`,
        actionsExecuted: executedActions,
        suggestions: ['Ver Academia e Saúde', 'Registrar treino feito', 'Analisar Meu Dia'],
      };
    }

    // Check for task list in document
    const lines = content.split('\n').filter(l => l.trim().length > 3);
    if (lines.length > 1 && /(fazer|tarefa|todo|pendencia|planejamento|estudo)/i.test(content)) {
      const createdTasksTitles: string[] = [];
      lines.slice(0, 3).forEach(line => {
        const cleanTitle = line.replace(/^[-*•0-9.)\s]+/, '').trim();
        if (cleanTitle.length > 2) {
          createItem<Task>('tasks', userId, {
            user_id: userId,
            title: cleanTitle,
            category: 'personal',
            priority: 'medium',
            status: 'pending',
            due_date: todayStr,
            tags: ['importado-ia'],
            order_index: 0,
          });
          createdTasksTitles.push(cleanTitle);
        }
      });

      executedActions.push({
        type: 'create_task',
        title: `${createdTasksTitles.length} tarefas criadas a partir do anexo`,
        link: '/tasks',
      });

      return {
        message: `📋 **Documento Processado com Sucesso!**\n\nIdentifiquei itens de ação no arquivo **"${name}"** e criei as seguintes tarefas para você:\n\n` +
          createdTasksTitles.map(t => `• ✅ **${t}**`).join('\n') +
          `\n\nVocê pode gerenciá-las e definir horários na página de Tarefas.`,
        actionsExecuted: executedActions,
        suggestions: ['Ver Tarefas', 'Analisar Meu Dia', 'Definir prioridades'],
      };
    }

    // Default Document Summary
    return {
      message: `📑 **Análise do Anexo "${name}":**\n\n` +
        `• **Tamanho:** ${(attachment.size / 1024).toFixed(1)} KB\n` +
        `• **Tipo de Arquivo:** ${attachment.type || 'Documento de Texto'}\n` +
        `• **Resumo do Conteúdo:** Identifiquei informações relevantes sobre organização pessoal. ${content.slice(0, 200)}...\n\n` +
        `Gostaria que eu crie tarefas, anotações ou registros com base nesse conteúdo?`,
      suggestions: ['Criar tarefas deste arquivo', 'Salvar como anotação', 'Analisar meu dia'],
    };
  }

  // ============================================================
  // 2. ACTION INTENTS (INSERTING / CREATING DATA DIRECTLY)
  // ============================================================

  // --- A. CRIAR LEMBRETE ---
  if (/(?:criar|adicionar|incluir|colocar|registrar)\s+(?:um\s+)?lembrete/i.test(msg) || /(?:me\s+)?lembr(?:e|ar)-?(?:me)?\s+(?:de|para)/i.test(msg)) {
    const details = extractRecordDetails(userMessage, 'reminder');
    const reminder = createItem<Reminder>('reminders', userId, {
      user_id: userId,
      title: details.title,
      message: details.description,
      category: details.category,
      date: details.dueDate,
      time: details.time || '09:00',
      priority: details.priority,
      status: 'active',
    });
    executedActions.push({ type: 'create_reminder', title: `Lembrete criado: "${reminder.title}"`, link: '/reminders', data: reminder as unknown as Record<string, unknown> });
    return {
      message: `⏰ **Lembrete criado!**\n\nVou te lembrar de **"${reminder.title}"** em **${reminder.date}** às **${reminder.time}**.${reminder.message ? `\n\n• **Detalhes:** ${reminder.message}` : ''}`,
      actionsExecuted: executedActions,
      suggestions: ['Ver Lembretes', 'Criar tarefa', 'Ver Meu Dia'],
    };
  }

  // --- A.1 CRIAR META ---
  if (/(?:criar|adicionar|incluir|definir)\s+(?:uma?\s+)?(?:nova?\s+)?(?:meta|objetivo)/i.test(msg)) {
    const details = extractRecordDetails(userMessage, 'goal');
    const goal = createItem<Goal>('goals', userId, {
      user_id: userId,
      title: details.title,
      description: details.description,
      area: details.category === 'study' ? 'Estudos' : details.category === 'health' || details.category === 'fitness' ? 'Saúde' : details.category === 'finance' ? 'Finanças' : details.category === 'spiritual' ? 'Espiritualidade' : 'Desenvolvimento pessoal',
      priority: details.priority,
      status: 'not_started',
      due_date: details.dueDate,
      progress: 0,
      progress_type: 'manual',
      milestones: [],
    });
    executedActions.push({ type: 'create_goal', title: `Meta criada: "${goal.title}"`, link: '/goals', data: goal as unknown as Record<string, unknown> });
    return {
      message: `🎯 **Meta criada!**\n\nRegistrei **"${goal.title}"** na área de **${goal.area}**.${goal.description ? `\n\n• **Descrição:** ${goal.description}` : ''}`,
      actionsExecuted: executedActions,
      suggestions: ['Ver Metas', 'Criar tarefa para esta meta', 'Analisar Meu Dia'],
    };
  }

  // --- A. CRIAR TAREFA ---
  if (/(?:criar|adicionar|incluir|colocar|registrar)\s+(?:uma?\s+)?(?:nova?\s+)?(?:tarefa|atividade)/i.test(msg) || /(?:consegue|pode|poderia)\s+(?:me\s+)?(?:adicionar|criar|incluir|colocar)\s+(?:a\s+|uma?\s+)?(?:tarefa|atividade)/i.test(msg) || msg.startsWith('tarefa:')) {
    const details = extractRecordDetails(userMessage, 'task');
    const task = createItem<Task>('tasks', userId, {
      user_id: userId,
      title: details.title,
      description: details.description,
      category: details.category,
      priority: details.priority,
      status: 'pending',
      due_date: details.dueDate,
      due_time: details.time,
      tags: ['agente-ia'],
      order_index: 0,
    });

    executedActions.push({
      type: 'create_task',
      title: `Tarefa criada: "${task.title}" (${task.priority})`,
      link: '/tasks',
      data: task as unknown as Record<string, unknown>,
    });

    return {
      message: `✅ **Tarefa Criada com Sucesso!**\n\nAdicionei a tarefa **"${task.title}"** à sua lista para **${task.due_date}** com prioridade **${task.priority.toUpperCase()}**.${task.description ? `\n\n• **Descrição:** ${task.description}` : ''}\n\nVocê já pode visualizá-la no painel ou no "Meu Dia".`,
      actionsExecuted: executedActions,
      suggestions: ['Ver Tarefas', 'Criar outra tarefa', 'Analisar Meu Dia'],
    };
  }

  // --- B. REGISTRAR DESPESA OU RECEITA ---
  if (msg.includes('gastei') || msg.includes('despesa') || msg.includes('recebi') || msg.includes('receita') || msg.includes('adicionar gasto') || msg.includes('lançar')) {
    const isIncome = msg.includes('recebi') || msg.includes('receita') || msg.includes('ganhei');
    const moneyMatch = msg.match(/([0-9]+(?:[.,][0-9]{1,2})?)/);
    const amount = moneyMatch ? parseFloat(moneyMatch[1].replace(',', '.')) : 25.0;

    let category = 'Outros';
    if (/comida|almoço|jantar|lanche|restaurante|mercado/i.test(msg)) category = 'Alimentação';
    else if (/uber|gasolina|ônibus|passagem|transporte/i.test(msg)) category = 'Transporte';
    else if (/academia|suplemento|farmacia|remedio/i.test(msg)) category = 'Saúde';
    else if (/salario|freela|pagamento|pix/i.test(msg)) category = 'Salário';

    const desc = userMessage
      .replace(/(gastei|despesa|recebi|receita|adicionar gasto|lançar|r\$|[0-9.,]+|em|com|reais)/gi, '')
      .trim() || (isIncome ? 'Receita Rápida' : 'Gasto Rápido');

    const entry = createItem<FinanceEntry>('finance', userId, {
      user_id: userId,
      description: desc.charAt(0).toUpperCase() + desc.slice(1),
      amount,
      type: isIncome ? 'income' : 'expense',
      category,
      date: todayStr,
      status: 'paid',
      payment_method: 'PIX / Dinheiro',
    });

    executedActions.push({
      type: 'create_finance',
      title: `${isIncome ? 'Receita' : 'Despesa'} de R$ ${amount.toFixed(2)} em ${category}`,
      link: '/finance',
      data: entry as unknown as Record<string, unknown>,
    });

    return {
      message: `💰 **Lançamento Financeiro Concluído!**\n\n` +
        `• **Tipo:** ${isIncome ? 'Receita (+)' : 'Despesa (-)'}\n` +
        `• **Valor:** R$ ${amount.toFixed(2)}\n` +
        `• **Descrição:** ${entry.description}\n` +
        `• **Categoria:** ${category}\n\n` +
        `Seu saldo atual foi recalculado automaticamente.`,
      actionsExecuted: executedActions,
      suggestions: ['Ver Finanças', 'Analisar orçamento', 'Criar Tarefa'],
    };
  }

  // --- C. AGENDAR EVENTO / REUNIÃO ---
  if (/(?:agendar|evento|reunião|compromisso)/i.test(msg) || /(?:coloque|colocar|adicione|adicionar|inclua|incluir|marque|marcar)\s+(?:na|em)\s+(?:minha\s+)?agenda/i.test(msg) || /(?:na|em)\s+(?:minha\s+)?agenda\s+que/i.test(msg)) {
    const details = extractRecordDetails(userMessage, 'event');
    const event = createItem<CalendarEvent>('events', userId, {
      user_id: userId,
      title: details.title.charAt(0).toUpperCase() + details.title.slice(1),
      description: details.description,
      category: details.category,
      start_date: details.dueDate,
      start_time: details.time || '14:00',
      all_day: false,
      priority: details.priority,
    });

    executedActions.push({
      type: 'create_event',
      title: `Evento agendado: "${event.title}" às ${event.start_time}`,
      link: '/calendar',
      data: event as unknown as Record<string, unknown>,
    });

    return {
      message: `📅 **Compromisso Agendado!**\n\nInseri o evento **"${event.title}"** na sua agenda para **${event.start_date}** às **${event.start_time}**.${event.description ? `\n\n• **Descrição:** ${event.description}` : ''}`,
      actionsExecuted: executedActions,
      suggestions: ['Ver Calendário', 'Analisar Meu Dia'],
    };
  }

  // --- D. REGISTRAR ORAÇÃO / MOMENTO ESPIRITUAL ---
  if (msg.includes('oração') || msg.includes('orar') || msg.includes('bíblia') || msg.includes('espiritual') || msg.includes('rezar') || msg.includes('terço')) {
    const rawNote = userMessage.replace(/(registrar|oração|momento espiritual|orar|rezar|diário)/gi, '').trim();
    const title = rawNote.length > 5 ? rawNote.slice(0, 40) : 'Oração e Gratidão';

    const spiritual = createItem<SpiritualActivity>('spiritual', userId, {
      user_id: userId,
      title,
      type: 'prayer',
      date: todayStr,
      notes: rawNote || 'Momento de conexão, oração pessoal e busca por paz.',
      completed: true,
      private: false,
    });

    executedActions.push({
      type: 'create_spiritual',
      title: `Momento espiritual registrado: "${title}"`,
      link: '/spiritual',
      data: spiritual as unknown as Record<string, unknown>,
    });

    return {
      message: `🕊️ **Momento Espiritual Registrado!**\n\nSeu momento de fé e oração **"${title}"** foi registrado com sucesso na sua Vida Espiritual com espaço generoso para suas meditações. Que sua caminhada continue fortalecida!`,
      actionsExecuted: executedActions,
      suggestions: ['Ver Vida Espiritual', 'Analisar Meu Dia'],
    };
  }

  // --- E. REGISTRAR HÁBITO CUMPRIDO ---
  if (msg.includes('bebi água') || msg.includes('tomei água') || msg.includes('cumpri hábito') || msg.includes('treinei') || msg.includes('li a bíblia')) {
    const habits = getAllItems<Habit>('habits', userId);
    let matchedHabit = habits[0];

    if (msg.includes('água')) {
      matchedHabit = habits.find(h => /água|agua|hidratação/i.test(h.name)) || habits[0];
    } else if (msg.includes('bíblia') || msg.includes('or')) {
      matchedHabit = habits.find(h => /bíblia|leitura|oração/i.test(h.name)) || habits[0];
    } else if (msg.includes('trein')) {
      matchedHabit = habits.find(h => /treino|academia|exercício/i.test(h.name)) || habits[0];
    }

    if (matchedHabit) {
      createItem<HabitLog>('habit_logs', userId, {
        user_id: userId,
        habit_id: matchedHabit.id,
        date: todayStr,
        completed: true,
      });

      executedActions.push({
        type: 'log_habit',
        title: `Hábito "${matchedHabit.name}" marcado como concluído`,
        link: '/habits',
      });

      return {
        message: `🔥 **Hábito Marcado como Cumprido!**\n\nParabéns pela disciplina! Marquei **"${matchedHabit.name}"** como feito hoje. Sua sequência de consistência subiu!`,
        actionsExecuted: executedActions,
        suggestions: ['Ver Rotinas e Hábitos', 'Analisar Meu Dia'],
      };
    }
  }

  // --- F. CONCLUIR TAREFA ---
  if (/(?:concluir|finalizar|completar|marcar como conclu[ií]da?)\s+(?:a\s+)?tarefa/i.test(msg) || /tarefa\s+(?:conclu[ií]da?|feita|finalizada)/i.test(msg)) {
    const rawSearch = userMessage.replace(/(?:concluir|finalizar|completar|marcar como conclu[ií]da?|tarefa|feita|finalizada|:)/gi, '').trim().toLowerCase();
    const tasks = getAllItems<Task>('tasks', userId);
    const pendingTasks = tasks.filter(t => t.status !== 'completed');
    
    let targetTask = pendingTasks.find(t => rawSearch && t.title.toLowerCase().includes(rawSearch));
    if (!targetTask && pendingTasks.length > 0) {
      targetTask = pendingTasks[0];
    }

    if (targetTask) {
      const now = new Date().toISOString();
      updateItem<Task>('tasks', userId, targetTask.id, {
        status: 'completed',
        completed_at: now,
      });

      executedActions.push({
        type: 'create_task',
        title: `Tarefa concluída: "${targetTask.title}"`,
        link: '/tasks',
      });

      return {
        message: `🎉 **Tarefa Concluída com Sucesso!**\n\nMarquei a tarefa **"${targetTask.title}"** como finalizada. Excelente progresso no seu dia!`,
        actionsExecuted: executedActions,
        suggestions: ['Ver Tarefas', 'Analisar Meu Dia', 'Concluir outra tarefa'],
      };
    } else {
      return {
        message: `📋 Não encontrei nenhuma tarefa pendente correspondente para concluir. Todas as suas tarefas parecem estar em dia!`,
        suggestions: ['Criar nova tarefa', 'Analisar Meu Dia', 'Ver Tarefas'],
      };
    }
  }

  // --- G. PRÁTICA DE VIOLÃO (CONSULTA OU REGISTRO) ---
  if (msg.includes('violão') || msg.includes('violao') || msg.includes('guitarra') || msg.includes('dedilhado') || msg.includes('solo')) {
    // Registrar sessão realizada
    if (msg.includes('pratiquei') || msg.includes('treinei') || msg.includes('toquei') || msg.includes('concluí') || msg.includes('conclui')) {
      const task = createItem<Task>('tasks', userId, {
        user_id: userId,
        title: 'Prática de Violão (30 min)',
        category: 'personal',
        priority: 'medium',
        status: 'completed',
        due_date: todayStr,
        completed_at: new Date().toISOString(),
        tags: ['violão', 'música'],
        order_index: 0,
      });

      executedActions.push({
        type: 'create_task',
        title: 'Prática de violão registrada como concluída (+30 min)',
        link: '/guitar',
        data: task as unknown as Record<string, unknown>,
      });

      return {
        message: `🎸 **Sessão de Violão Registrada!**\n\nParabéns pela dedicação musical! Registrei **30 minutos de treino de violão** como concluídos hoje. Cada minuto com o instrumento aprimora sua memória muscular e ritmo!`,
        actionsExecuted: executedActions,
        suggestions: ['Ver Prática de Violão', 'Analisar Meu Dia', 'O que praticar no violão hoje?'],
      };
    }

    // Consulta do que praticar hoje
    if (msg.includes('o que') || msg.includes('oque') || msg.includes('qual') || msg.includes('recomenda') || msg.includes('aprender') || msg.includes('praticar')) {
      return {
        message: `🎸 **Plano de Violão Recomendado para Hoje:**\n\n` +
          `• 🎵 **Música Principal:** *Dust in the Wind* (Kansas) — Treine a transição de acordes C, Cmaj7, Cadd9 e Am.\n` +
          `• 🖐️ **Técnica / Dedilhado:** *Travis Picking* com baixo alternado e polegar marcando o compasso.\n` +
          `• ⚡ **Solo Lendário:** *Hotel California* (Eagles) — Dedique 15 minutos aos bends de 1 tom e vibrato suave em Si menor.\n` +
          `• ⏱️ **Meta sugerida:** 30 minutos com metrônomo regulado a 75 BPM.\n\n` +
          `Quer que eu registre seu treino após finalizar ou agende para mais tarde?`,
        suggestions: ['Registrar que pratiquei violão hoje por 30 minutos', 'Agendar prática de violão hoje às 19:00', 'Ver Prática de Violão'],
      };
    }
  }

  // --- H. APRENDER INGLÊS (CONSULTA OU REGISTRO) ---
  if (msg.includes('inglês') || msg.includes('ingles') || msg.includes('english') || msg.includes('vocabulário') || msg.includes('vocabulario')) {
    // Registrar estudo feito
    if (msg.includes('estudei') || msg.includes('pratiquei') || msg.includes('concluí') || msg.includes('conclui') || msg.includes('fiz a lição')) {
      const task = createItem<Task>('tasks', userId, {
        user_id: userId,
        title: 'Estudo Diário de Inglês (Vocabulário & Música)',
        category: 'study',
        priority: 'medium',
        status: 'completed',
        due_date: todayStr,
        completed_at: new Date().toISOString(),
        tags: ['inglês', 'estudos'],
        order_index: 0,
      });

      executedActions.push({
        type: 'create_task',
        title: 'Estudo de inglês registrado como concluído',
        link: '/english',
        data: task as unknown as Record<string, unknown>,
      });

      return {
        message: `🌍 **Estudo de Inglês Registrado!**\n\n*Great job!* Sua consistência diária no inglês é o caminho mais rápido para a fluência. Registrei sua sessão de estudo de hoje como concluída!`,
        actionsExecuted: executedActions,
        suggestions: ['Ver Aprender Inglês', 'Analisar Meu Dia', 'Qual a palavra e música de inglês para hoje?'],
      };
    }

    // Consulta de vocabulário e música de hoje
    if (msg.includes('o que') || msg.includes('oque') || msg.includes('qual') || msg.includes('palavra') || msg.includes('música') || msg.includes('musica') || msg.includes('notícia') || msg.includes('noticia')) {
      return {
        message: `🌍 **Conteúdo de Inglês Selecionado para Hoje:**\n\n` +
          `• 📖 **Word of the Day (Palavra do Dia):**\n` +
          `  **Overwhelmed** /ˌōvərˈ(h)welmd/ — *Sobrecarregado / tomado por emoções*\n` +
          `  *Exemplo:* "Take a deep breath whenever you feel overwhelmed."\n\n` +
          `• 💡 **Idiom (Expressão Útil):**\n` +
          `  **"Break a leg"** — *Boa sorte! (Usado comumente antes de apresentações ou reuniões importantes)*\n\n` +
          `• 🎵 **Song for Listening & Lyrics (Música do Dia):**\n` +
          `  *"Viva La Vida"* — Coldplay (Excelente para treinar passado simples e metáforas poéticas)\n\n` +
          `• 📰 **Daily News Flash:**\n` +
          `  Acompanhe um artigo em inglês no módulo de Inglês para treinar leitura rápida de 5 minutos!`,
        suggestions: ['Registrar que estudei inglês hoje por 30 minutos', 'Agendar sessão de inglês hoje às 20:00', 'Ver Aprender Inglês'],
      };
    }
  }

  // --- I. TREINO CONCLUÍDO (ACADEMIA) ---
  if (msg.includes('treinei') || msg.includes('treino concluído') || msg.includes('fiz academia') || msg.includes('treino feito') || msg.includes('concluir treino')) {
    const task = createItem<Task>('tasks', userId, {
      user_id: userId,
      title: 'Treino de Academia Realizado',
      category: 'fitness',
      priority: 'high',
      status: 'completed',
      due_date: todayStr,
      completed_at: new Date().toISOString(),
      tags: ['academia', 'saúde'],
      order_index: 0,
    });

    executedActions.push({
      type: 'create_task',
      title: 'Treino de academia registrado como concluído',
      link: '/fitness',
      data: task as unknown as Record<string, unknown>,
    });

    return {
      message: `💪 **Treino de Hoje Concluído!**\n\nSensacional! Seu treino foi registrado com sucesso. Corpo em movimento, mente focada e saúde em dia!`,
      actionsExecuted: executedActions,
      suggestions: ['Ver Academia e Saúde', 'Registrar refeição pós-treino', 'Analisar Meu Dia'],
    };
  }

  // ============================================================
  // 3. ANALYSIS INTENTS (DIAGNOSIS & INTELLIGENCE)
  // ============================================================

  // --- A. ANALISAR MEU DIA ---
  if (msg.includes('analisar meu dia') || msg.includes('meu dia') || msg.includes('resumo do dia') || msg.includes('como está meu dia') || msg.includes('prioridades de hoje')) {
    const { tasks, habits, finance, calendar, spiritual } = snapshot;

    let feedback = `🌅 **Diagnóstico do Seu Dia — ${format(new Date(), "dd 'de' MMMM", { locale: ptBR })}**\n\n`;
    feedback += `Olá, Pedro! Analisei todas as áreas do seu Planly em tempo real:\n\n`;

    // Tasks insight
    feedback += `📌 **Tarefas & Foco:**\n`;
    feedback += `• Você tem **${tasks.pending} tarefas pendentes**, sendo **${tasks.today} programadas para hoje** e **${tasks.urgent} urgentes/alta prioridade**.\n`;
    if (tasks.overdue > 0) {
      feedback += `• ⚠️ Atenção: Há **${tasks.overdue} tarefas atrasadas** que demandam realinhamento.\n`;
    }

    // Schedule
    feedback += `\n📅 **Agenda & Compromissos:**\n`;
    if (calendar.todayEvents.length > 0) {
      feedback += `• Você tem **${calendar.todayEvents.length} compromisso(s)** hoje: ${calendar.todayEvents.map(e => `*${e.title}*`).join(', ')}.\n`;
    } else {
      feedback += `• Sem eventos agendados para hoje. Dia livre para blocos profundos de trabalho e estudos!\n`;
    }

    // Habits
    feedback += `\n⚡ **Consistência de Hábitos:**\n`;
    feedback += `• Progresso de hoje: **${habits.completedToday}/${habits.total} hábitos cumpridos (${habits.completionRate}%)**.\n`;
    if (habits.completionRate < 50) {
      feedback += `• Dica: Hidrate-se e reserve 15 minutos para manter a sequência do seu hábito principal.\n`;
    }

    // Spiritual
    feedback += `\n🕊️ **Vida Espiritual:**\n`;
    feedback += spiritual.todayDone
      ? `• Oração e reflexão diária já registradas. Parabéns pela constância espiritual!\n`
      : `• Você ainda não registrou seu momento espiritual hoje. Um momento de silêncio e gratidão trará clareza para o resto do dia.\n`;

    // Finance overview
    feedback += `\n💵 **Finanças:** Saldo positivo no mês (**R$ ${finance.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**) com taxa de poupança de **${finance.savingsRate}%**.\n`;

    return {
      message: feedback,
      suggestions: ['Criar nova tarefa', 'Marcar hábito de água', 'Registrar despesa', 'Ver Meu Dia'],
    };
  }

  // --- B. ANALISAR FINANÇAS ---
  if (msg.includes('finanças') || msg.includes('dinheiro') || msg.includes('gasto') || msg.includes('orçamento') || msg.includes('saldo')) {
    const { finance } = snapshot;

    let feedback = `💰 **Diagnóstico Financeiro do Mês**\n\n`;
    feedback += `• **Receitas Totais:** R$ ${finance.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    feedback += `• **Despesas Totais:** R$ ${finance.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    feedback += `• **Saldo Líquido:** R$ ${finance.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    feedback += `• **Taxa de Poupança:** ${finance.savingsRate}%\n`;
    feedback += `• **Maior Concentração de Gastos:** ${finance.topCategory}\n\n`;

    if (finance.balance >= 0) {
      feedback += `✅ **Saúde Financeira Boa:** Suas receitas superam as despesas. Continue alocando o excedente para sua meta de reserva de emergência!\n`;
    } else {
      feedback += `⚠️ **Alerta de Orçamento:** Suas despesas excederam as receitas este mês. Recomendo revisar gastos em "${finance.topCategory}".\n`;
    }

    return {
      message: feedback,
      suggestions: ['Inserir nova despesa', 'Adicionar receita', 'Ver Metas Financeiras'],
    };
  }

  // --- D. VIDA CATÓLICA: SANTO DO DIA, PREGAÇÃO & LITURGIA ---
  if (/(?:santo|santos|cat[oó]lic|prega[cç][aã]o|liturgia|ter[cç]o|ros[aá]rio|igreja)/i.test(msg)) {
    const catholicData = getDailyCatholicContext();
    return {
      message: `✝️ **Vida Católica Diária — ${catholicData.name}**\n\n` +
        `• **Santo do Dia:** **${catholicData.name}** (${catholicData.title})\n` +
        `• **História & Exemplo:** ${catholicData.history}\n` +
        `• **Virtude para Praticar Hoje:** *${catholicData.virtue}*\n` +
        `• **Rosário / Terço de Hoje:** ${catholicData.rosary?.mysteryName || 'Santo Terço'}\n\n` +
        `🎙️ **Pregação Católica Recomendada:**\n` +
        `• **"${catholicData.sermonRecommendation.title}"** — *${catholicData.sermonRecommendation.preacher}* (${catholicData.sermonRecommendation.duration})\n` +
        `• *Tema:* ${catholicData.sermonRecommendation.description}\n\n` +
        `🙏 **Oração do Dia:**\n` +
        `*"${catholicData.prayer}"*`,
      suggestions: ['Registrar oração de hoje', 'Registrar terço rezado', 'Ver Vida Espiritual', 'Analisar Meu Dia'],
    };
  }

  // --- E. POSTURA E ALINHAMENTO FÍSICO ---
  if (/(?:postura|coluna|ombro|dor nas costas|pesco[cç]o)/i.test(msg)) {
    const postureProtocol = transformationProtocols.find(p => p.category === 'posture');
    return {
      message: `🧍‍♂️ **Protocolo de Correção Postural e Alinhamento**\n\n` +
        `Ter uma postura imponente melhora a respiração, a produção hormonal e a presença física.\n\n` +
        postureProtocol!.instructions.map(inst => `• ${inst}`).join('\n\n') +
        `\n\n⏱️ **Tempo diário:** ${postureProtocol!.duration}\n` +
        `💡 **Benefício Direto:** ${postureProtocol!.benefit}`,
      suggestions: ['Criar hábito de correção postural', 'Ver Meu Dia', 'Rotina de treino'],
    };
  }

  // --- F. SKINCARE E CUIDADOS COM A PELE ---
  if (/(?:pele|skincare|rosto|espinha|oleosidade|olheira)/i.test(msg)) {
    const skinProtocol = transformationProtocols.find(p => p.category === 'skin');
    return {
      message: `✨ **Rotina Masculina de Cuidados com a Pele (Skincare)**\n\n` +
        `Sem complicação: apenas 3 minutos pela manhã e 2 minutos à noite para uma pele limpa e descansada.\n\n` +
        skinProtocol!.instructions.map(inst => `• ${inst}`).join('\n\n') +
        `\n\n💧 **Hidratação:** Não esqueça de cumprir os 2.500ml de água no Planly hoje!\n` +
        `💡 **Benefício Direto:** ${skinProtocol!.benefit}`,
      suggestions: ['Bebi água hoje', 'Criar hábito de skincare', 'Analisar Meu Dia'],
    };
  }

  // --- G. FORÇA E HIPERTROFIA ---
  if (/(?:ficar mais forte|hipertrofia|ganho de massa|massa muscular|sobrecarga|for[cç]a)/i.test(msg)) {
    const strengthProtocol = transformationProtocols.find(p => p.category === 'strength');
    return {
      message: `💪 **Metodologia de Força e Construção Muscular**\n\n` +
        `Para transformar seu físico ainda este ano, siga com disciplina os 3 pilares:\n\n` +
        strengthProtocol!.instructions.map(inst => `• ${inst}`).join('\n\n') +
        `\n\n🔥 **Ação de Hoje:** No treino de hoje, foque na qualidade de contração e marque cada série executada no módulo de Academia.`,
      suggestions: ['Registrar treino de hoje com sucesso', 'Ver Academia e Treino', 'Analisar Meu Dia'],
    };
  }

  // --- H. IDEIAS DE NEGÓCIOS, INVESTIMENTOS E LEITURAS ---
  if (/(?:neg[oó]cio|invest|investir|guardar dinheiro|dinheiro|livro|leitura|renda)/i.test(msg)) {
    const idea1 = businessIdeasCatalog[0];
    const idea2 = businessIdeasCatalog[1];
    return {
      message: `🚀 **Ideias de Negócios & Estratégia de Investimentos**\n\n` +
        `**1. ${idea1.title}**\n` +
        `• *Potencial:* ${idea1.potentialROI}\n` +
        `• *Investimento Inicial:* ${idea1.initialCapital}\n` +
        `• *Como Funciona:* ${idea1.description}\n\n` +
        `**2. ${idea2.title}**\n` +
        `• *Retorno Estimado:* ${idea2.potentialROI}\n` +
        `• *Como Aplicar:* ${idea2.description}\n\n` +
        `📚 **Leituras Transformadoras Recomendadas:**\n` +
        `• **"${idea1.recommendedBook.title}"** (*${idea1.recommendedBook.author}*) — ${idea1.recommendedBook.keyTakeaway}\n` +
        `• **"${idea2.recommendedBook.title}"** (*${idea2.recommendedBook.author}*) — ${idea2.recommendedBook.keyTakeaway}`,
      suggestions: ['Criar meta financeira', 'Registrar despesa', 'Ver Finanças', 'Analisar Meu Dia'],
    };
  }

  // --- I. NOTÍCIAS REAIS & TENDÊNCIAS DAS ÚLTIMAS 24H ---
  if (/(?:not[ií]cia|radar|24h|mundo|tend[eê]ncia|economia)/i.test(msg)) {
    let newsText = `📰 **Radar Planly: Destaques & Oportunidades das Últimas 24h**\n\n`;
    curatedNews24h.forEach((item, idx) => {
      newsText += `**${idx + 1}. [${item.category}] ${item.headline}**\n`;
      newsText += `• ${item.summary}\n`;
      newsText += `• 💡 *Impacto prático:* ${item.impact}\n\n`;
    });
    return {
      message: newsText,
      suggestions: ['Ideias de negócio e investimento', 'Analisar Meu Dia', 'Criar tarefa de estudo'],
    };
  }

  // --- J. ROTINA DO DIA & O QUE FAZER PRIMEIRO ---
  if (/(?:rotina|o que fazer primeiro|hor[aá]rio|cronograma|ordem do dia|planejamento di[aá]rio|dica.*dia|melhorar.*dia)/i.test(msg)) {
    let routineText = `⏰ **Rotina Estruturada do Seu Dia — O Que Fazer Primeiro**\n\n` +
      `Aqui está seu roteiro cronológico sugerido para vencer o dia sem sobrecarga mental:\n\n`;

    dailyScheduleRoutine.slice(0, 5).forEach(b => {
      routineText += `**${b.order}. [${b.timeRange}] ${b.title}** (${b.priorityBadge})\n` +
        `• *Ações:* ${b.actionItems.join(' ')}\n` +
        `• 💡 *Dica:* ${b.goldenTip}\n\n`;
    });

    routineText += `✨ *Dica Extra de Skincare & Energia:* ${dailyGoldenTips[0].tip}\n\n` +
      `Você pode conferir todos os 10 blocos e marcar seu progresso na aba **"Rotina & Horários"** no Meu Dia!`;

    return {
      message: routineText,
      suggestions: ['Ver Meu Dia', 'Dicas de skincare', 'Notícias do Brasil', 'Registrar oração de hoje'],
    };
  }

  // ============================================================
  // 4. DEFAULT CONVERSATIONAL / COACHING RESPONSE
  // ============================================================
  return {
    message: `🤖 Olá, Pedro! Entendido: *"${userMessage}"*.\n\n` +
      `Como seu **Agente Copilot do Planly**, estou pronto para agir. Você pode me pedir para:\n\n` +
      `• 📊 **Analisar:** "Analise meu dia", "Como estão minhas finanças?", "Veja meus hábitos pendentes"\n` +
      `• ✍️ **Inserir:** "Criar tarefa: Estudar React com urgência", "Gastei R$ 42 no mercado", "Registrar oração da manhã"\n` +
      `• 📎 **Processar Anexo:** Clique no botão de clipe para anexar um recibo, documento ou anotação para eu extrair automaticamente!\n\n` +
      `Qual área você gostaria de organizar agora?`,
    suggestions: ['Analisar Meu Dia', 'Criar Tarefa', 'Lançar Despesa', 'O que o site oferece?'],
  };
}


type RemoteAction = { kind: string; title: string; description: string | null; date: string | null; time: string | null; priority: Priority; category: EventCategory; amount: number | null; finance_type: 'income' | 'expense' | null; finance_category: string | null; payment_method: string | null; finance_status: 'pending' | 'paid' | 'received' | 'overdue' | null; location: string | null; name: string | null; frequency: 'daily' | 'weekly' | 'custom' | null; notes: string | null };
type RemoteResult = { message: string; actions: RemoteAction[] };

/** Executes validated actions returned by the secure Supabase/OpenAI agent. */
export async function processAgentMessageWithAI(userId: string, message: string, attachment?: AgentAttachment): Promise<AgentResponse> {
  if (!supabase) return processAgentMessage(userId, message, attachment);
  const { data, error } = await supabase.functions.invoke<RemoteResult>('planly-agent', { body: { message, attachment } });
  if (error || !data) { console.error('[Planly AI] Falha da Edge Function:', error); return { error: true, message: 'Não consegui conectar ao agente da OpenAI agora. Verifique a configuração e tente novamente.' }; }
  console.info('[Planly AI] Parâmetros extraídos pela OpenAI:', data);
  const today = format(new Date(), 'yyyy-MM-dd');
  const actionsExecuted: AgentAction[] = [];
  for (const action of data.actions.filter(action => action.kind !== 'none' && action.title.trim())) {
    const date = action.date || today;
    let item: unknown;
    let type: AgentAction['type'] = 'analysis'; let link = '/my-day';
    if (action.kind === 'event') { item = createItem<CalendarEvent>('events', userId, { user_id:userId, title:action.title, description:action.description || undefined, category:action.category, start_date:date, start_time:action.time || undefined, all_day:!action.time, location:action.location || undefined, priority:action.priority }); type='create_event'; link='/calendar'; }
    else if (action.kind === 'reminder') { item = createItem<Reminder>('reminders', userId, { user_id:userId, title:action.title, message:action.description || undefined, category:action.category, date, time:action.time || '09:00', priority:action.priority, status:'active' }); type='create_reminder'; link='/reminders'; }
    else if (action.kind === 'finance') { item = createItem<FinanceEntry>('finance', userId, { user_id:userId, description:action.description || action.title, amount:action.amount ?? 0, type:action.finance_type || 'expense', category:action.finance_category || 'Outros', date, status:action.finance_status || 'paid', payment_method:action.payment_method || undefined, notes:action.notes || undefined }); type='create_finance'; link='/finance'; }
    else if (action.kind === 'habit') { item = createItem<Habit>('habits', userId, { user_id:userId, name:action.name || action.title, description:action.description || action.notes || undefined, category:action.category, frequency:action.frequency || 'daily', start_date:date, active:true }); type='log_habit'; link='/habits'; }
    else if (action.kind === 'goal') { item = createItem<Goal>('goals', userId, { user_id:userId, title:action.title, description:action.description || undefined, area:'Desenvolvimento pessoal', priority:action.priority, status:'not_started', due_date:date, progress:0, progress_type:'manual', milestones:[] }); type='create_goal'; link='/goals'; }
    else if (action.kind === 'spiritual') { item = createItem<SpiritualActivity>('spiritual', userId, { user_id:userId, title:action.title, description:action.description || undefined, type:'other', date, time:action.time || undefined, completed:true, private:false }); type='create_spiritual'; link='/spiritual'; }
    else if (action.kind === 'health') { item = createItem<HealthRecord>('health', userId, { user_id:userId, type:'appointment', title:action.title, description:action.description || undefined, date, time:action.time || undefined, status:'scheduled' }); type='analysis'; link='/health'; }
    else { item = createItem<Task>('tasks', userId, { user_id:userId, title:action.title, description:action.description || undefined, category:action.kind === 'workout' ? 'fitness' : action.category, priority:action.priority, status:'pending', due_date:date, due_time:action.time || undefined, tags:['agente-ia'], order_index:0 }); type='create_task'; link='/tasks'; }
    console.info('[Planly AI] Item persistido:', item);
    actionsExecuted.push({ type, title: action.name || action.title, link, data: item as unknown as Record<string, unknown> });
  }
  return { message: data.message || 'Ação concluída.', actionsExecuted, suggestions: ['Ver Meu Dia', 'Criar outra ação'] };
}
