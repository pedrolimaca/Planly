import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  Sparkles, Send, Paperclip, X, CheckCircle, ArrowRight, RefreshCw,
  Music2, Globe, DollarSign, CheckSquare, CalendarDays, Dumbbell,
  Heart, UtensilsCrossed, Church, Target, BookOpen, Bell, Timer,
  LayoutDashboard, Sun, Zap, Layers, Search
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { processAgentMessageWithAI, type AgentAttachment, type AgentAction } from '../../services/aiAgentService';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  attachment?: { name: string };
  actions?: AgentAction[];
  suggestions?: string[];
}

interface AIAgentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData?: () => void;
}

interface ModuleConfig {
  icon: LucideIcon;
  color: string;
  label: string;
  greeting: string;
  chips: { label: string; prompt: string }[];
  postActionSuggestions: string[];
}

const moduleConfigs: Record<string, ModuleConfig> = {
  '/': {
    icon: LayoutDashboard,
    color: '#8b5cf6',
    label: 'Visão Geral',
    greeting: 'Você está no **Dashboard**. Posso analisar todas as áreas da sua vida de uma vez ou criar rapidamente qualquer item.',
    chips: [
      { label: '📊 Analisar meu dia', prompt: 'Analise meu dia completo' },
      { label: '✅ Nova tarefa rápida', prompt: 'Criar tarefa: ' },
      { label: '💰 Registrar despesa', prompt: 'Gastei R$ ' },
      { label: '📅 Agendar compromisso', prompt: 'Agendar evento amanhã às 14:00: ' },
      { label: '🎯 Nova meta', prompt: 'Criar meta: ' },
      { label: '🌐 O que o site oferece?', prompt: 'O que o site oferece?' },
    ],
    postActionSuggestions: ['Analisar meu dia', 'Criar outra ação', 'Ver Finanças', 'Ver Tarefas'],
  },
  '/my-day': {
    icon: Sun,
    color: '#f59e0b',
    label: 'Meu Dia',
    greeting: 'Você está em **Meu Dia**. Posso criar tarefas de foco, registrar hábitos cumpridos e montar seu plano matinal.',
    chips: [
      { label: '☀️ Resumo do dia', prompt: 'Analisar meu dia completo' },
      { label: '✅ Tarefa de foco', prompt: 'Criar tarefa de foco para hoje: ' },
      { label: '💧 Registrar hidratação', prompt: 'Bebi água hoje' },
      { label: '🔥 Marcar hábito feito', prompt: 'Cumpri hábito hoje: ' },
      { label: '🎸 Violão hoje', prompt: 'O que devo praticar no violão hoje?' },
      { label: '🌍 Inglês hoje', prompt: 'Qual a palavra e música de inglês para hoje?' },
      { label: '🕊️ Registrar oração', prompt: 'Registrar oração de hoje' },
    ],
    postActionSuggestions: ['Analisar meu dia', 'Criar outra tarefa', 'Registrar hábito', 'Ver Calendário'],
  },
  '/tasks': {
    icon: CheckSquare,
    color: '#6366f1',
    label: 'Tarefas',
    greeting: 'Você está em **Tarefas**. Posso criar, organizar e priorizar suas tarefas por voz ou texto.',
    chips: [
      { label: '✅ Nova tarefa hoje', prompt: 'Criar tarefa para hoje: ' },
      { label: '🚨 Tarefa urgente', prompt: 'Criar tarefa urgente: ' },
      { label: '🎉 Concluir tarefa', prompt: 'Concluir tarefa: ' },
      { label: '📅 Tarefa para amanhã', prompt: 'Criar tarefa para amanhã: ' },
      { label: '🏢 Tarefa de trabalho', prompt: 'Criar tarefa de trabalho: ' },
      { label: '📋 Tarefas pendentes', prompt: 'Quantas tarefas pendentes tenho?' },
    ],
    postActionSuggestions: ['Criar outra tarefa', 'Ver tarefas urgentes', 'Analisar meu dia', 'Agendar compromisso'],
  },
  '/calendar': {
    icon: CalendarDays,
    color: '#06b6d4',
    label: 'Calendário',
    greeting: 'Você está no **Calendário**. Posso agendar reuniões, compromissos e eventos com data e hora específicas.',
    chips: [
      { label: '📅 Agendar para amanhã', prompt: 'Agendar compromisso amanhã às 14:00: ' },
      { label: '🏢 Reunião de trabalho', prompt: 'Agendar reunião de trabalho amanhã às 10:00: ' },
      { label: '🏋️ Treino na segunda', prompt: 'Adicionar treino na academia na segunda-feira às 07:00' },
      { label: '⛪ Missa no domingo', prompt: 'Agendar missa no domingo às 09:00' },
      { label: '🏥 Consulta médica', prompt: 'Agendar consulta médica: ' },
      { label: '🎸 Prática de violão', prompt: 'Agendar prática de violão toda terça às 19:00' },
    ],
    postActionSuggestions: ['Agendar outro evento', 'Ver Calendário', 'Criar lembrete', 'Analisar meu dia'],
  },
  '/habits': {
    icon: Timer,
    color: '#10b981',
    label: 'Rotinas e Hábitos',
    greeting: 'Você está em **Rotinas e Hábitos**. Posso criar novos hábitos e registrar que você completou os de hoje.',
    chips: [
      { label: '🔥 Criar hábito diário', prompt: 'Criar hábito diário: ' },
      { label: '💧 Bebi água (+250ml)', prompt: 'Bebi água hoje' },
      { label: '📖 Hábito de leitura', prompt: 'Criar hábito de ler 20 minutos por dia' },
      { label: '🎸 Hábito de violão', prompt: 'Criar hábito de praticar violão todos os dias' },
      { label: '🕊️ Hábito de oração', prompt: 'Criar hábito de orar todas as manhãs' },
      { label: '✅ Marcar hábito feito', prompt: 'Cumpri meu hábito de ' },
    ],
    postActionSuggestions: ['Criar outro hábito', 'Marcar hábito feito', 'Analisar consistência', 'Ver Meu Dia'],
  },
  '/reminders': {
    icon: Bell,
    color: '#f97316',
    label: 'Lembretes',
    greeting: 'Você está em **Lembretes**. Posso criar alertas para compromissos, medicamentos, tarefas importantes e muito mais.',
    chips: [
      { label: '⏰ Lembrete para amanhã', prompt: 'Me lembrar amanhã às 09:00: ' },
      { label: '💊 Lembrete de remédio', prompt: 'Me lembrar de tomar remédio às 08:00 todos os dias' },
      { label: '🎸 Lembrete de violão', prompt: 'Me lembrar de praticar violão às 19:00' },
      { label: '💰 Lembrete de conta', prompt: 'Me lembrar de pagar conta: ' },
      { label: '📚 Lembrete de estudo', prompt: 'Me lembrar de estudar às 20:00' },
      { label: '🏋️ Lembrete de treino', prompt: 'Me lembrar de ir à academia às 07:00' },
    ],
    postActionSuggestions: ['Criar outro lembrete', 'Ver Lembretes', 'Criar tarefa', 'Agendar evento'],
  },
  '/finance': {
    icon: DollarSign,
    color: '#22c55e',
    label: 'Finanças',
    greeting: 'Você está em **Finanças**. Posso registrar despesas, receitas e analisar seu orçamento instantaneamente.',
    chips: [
      { label: '🛒 Registrar compra', prompt: 'Gastei R$ ' },
      { label: '🍽️ Almoço/Lanche', prompt: 'Gastei R$ no almoço' },
      { label: '⛽ Transporte', prompt: 'Gastei R$ de gasolina/uber' },
      { label: '💵 Registrar receita', prompt: 'Recebi R$ ' },
      { label: '💳 Conta mensal', prompt: 'Registrar conta: R$ ' },
      { label: '📊 Analisar orçamento', prompt: 'Analisar minhas finanças' },
    ],
    postActionSuggestions: ['Registrar outra despesa', 'Ver Finanças', 'Analisar orçamento', 'Ver relatórios'],
  },
  '/fitness': {
    icon: Dumbbell,
    color: '#ef4444',
    label: 'Academia e Saúde',
    greeting: 'Você está em **Academia e Saúde**. Posso criar treinos, registrar sessões concluídas e planejar sua semana na academia.',
    chips: [
      { label: '💪 Treino de peito (seg)', prompt: 'Criar treino de peito para segunda-feira' },
      { label: '🦵 Treino de perna (qua)', prompt: 'Criar treino de pernas para quarta-feira' },
      { label: '🏋️ Treino de costas (ter)', prompt: 'Criar treino de costas para terça-feira' },
      { label: '✅ Treino concluído hoje', prompt: 'Registrar que treinei hoje com sucesso' },
      { label: '📅 Planejar semana de treino', prompt: 'Me ajude a planejar minha semana de treinos' },
      { label: '🔥 Registrar cardio', prompt: 'Registrar cardio feito hoje: ' },
    ],
    postActionSuggestions: ['Criar outro treino', 'Ver Academia', 'Registrar treino feito', 'Ver Saúde'],
  },
  '/health': {
    icon: Heart,
    color: '#ec4899',
    label: 'Saúde',
    greeting: 'Você está em **Saúde**. Posso agendar consultas, criar lembretes de medicamentos e registrar seus cuidados.',
    chips: [
      { label: '🏥 Agendar consulta', prompt: 'Agendar consulta médica: ' },
      { label: '💊 Lembrete de remédio', prompt: 'Criar lembrete de remédio: ' },
      { label: '😴 Registrar sono', prompt: 'Registrar que dormi bem hoje' },
      { label: '🦷 Consulta no dentista', prompt: 'Agendar consulta no dentista: ' },
      { label: '🩺 Exame de sangue', prompt: 'Agendar exame de sangue para: ' },
      { label: '🏃 Meta de saúde', prompt: 'Criar meta de saúde: ' },
    ],
    postActionSuggestions: ['Agendar outra consulta', 'Criar lembrete de remédio', 'Ver Saúde', 'Ver Finanças'],
  },
  '/nutrition': {
    icon: UtensilsCrossed,
    color: '#84cc16',
    label: 'Alimentação',
    greeting: 'Você está em **Alimentação**. Posso registrar refeições, criar lembretes de hidratação e planejar sua dieta.',
    chips: [
      { label: '🍽️ Registrar refeição', prompt: 'Registrar refeição de hoje: ' },
      { label: '💧 Lembrete de água a cada 2h', prompt: 'Criar lembrete de beber água a cada 2 horas' },
      { label: '🥗 Planejar alimentação', prompt: 'Me ajude a planejar minha alimentação para hoje' },
      { label: '🍎 Registrar lanche saudável', prompt: 'Registrar lanche saudável: ' },
      { label: '🎯 Meta de nutrição', prompt: 'Criar meta de alimentação saudável: ' },
    ],
    postActionSuggestions: ['Registrar outra refeição', 'Ver Alimentação', 'Lembrete de água', 'Ver Saúde'],
  },
  '/studies': {
    icon: BookOpen,
    color: '#8b5cf6',
    label: 'Estudos e Trabalho',
    greeting: 'Você está em **Estudos e Trabalho**. Posso criar planos de estudo, registrar progresso e organizar seus projetos.',
    chips: [
      { label: '📚 Criar tarefa de estudo', prompt: 'Criar tarefa de estudo para hoje: ' },
      { label: '📖 Iniciar novo livro', prompt: 'Criar registro de leitura do livro: ' },
      { label: '🎓 Criar projeto de estudo', prompt: 'Criar projeto de estudo de: ' },
      { label: '💼 Tarefa de trabalho urgente', prompt: 'Criar tarefa de trabalho urgente: ' },
      { label: '📅 Planejar semana de estudos', prompt: 'Me ajude a planejar uma semana de estudos de: ' },
      { label: '🌐 Inglês na próxima semana', prompt: 'Criar plano de estudos de inglês para esta semana' },
    ],
    postActionSuggestions: ['Criar outra tarefa', 'Ver Estudos', 'Criar lembrete de estudo', 'Aprender Inglês'],
  },
  '/spiritual': {
    icon: Church,
    color: '#a78bfa',
    label: 'Vida Espiritual',
    greeting: 'Você está em **Vida Espiritual**. Posso registrar orações, reflexões e momentos de fé do seu dia com espaço ampliado para meditação.',
    chips: [
      { label: '🕊️ Registrar oração de hoje', prompt: 'Registrar oração de hoje' },
      { label: '📖 Leitura bíblica', prompt: 'Registrar leitura bíblica de hoje: ' },
      { label: '📿 Terço rezado', prompt: 'Registrar que rezei o terço hoje' },
      { label: '✍️ Reflexão espiritual', prompt: 'Registrar reflexão espiritual: ' },
      { label: '⛪ Ida à missa', prompt: 'Registrar que fui à missa hoje' },
      { label: '🙏 Agradecimento do dia', prompt: 'Registrar agradecimento de hoje: ' },
    ],
    postActionSuggestions: ['Registrar outra reflexão', 'Ver Vida Espiritual', 'Analisar meu dia', 'Criar lembrete de oração'],
  },
  '/goals': {
    icon: Target,
    color: '#f59e0b',
    label: 'Metas e Sonhos',
    greeting: 'Você está em **Metas e Sonhos**. Posso criar novas metas, adicionar tarefas para alcançá-las e acompanhar seu progresso.',
    chips: [
      { label: '🎯 Criar nova meta', prompt: 'Criar meta: ' },
      { label: '💰 Meta financeira', prompt: 'Criar meta financeira: juntar R$ ' },
      { label: '📚 Meta de aprendizado', prompt: 'Criar meta de aprendizado: ' },
      { label: '💪 Meta de saúde', prompt: 'Criar meta de saúde: ' },
      { label: '✅ Tarefa para meta', prompt: 'Criar tarefa para avançar na meta de: ' },
      { label: '📊 Analisar progresso', prompt: 'Como estão minhas metas?' },
    ],
    postActionSuggestions: ['Criar outra meta', 'Ver Metas', 'Criar tarefa para meta', 'Analisar progresso'],
  },
  '/guitar': {
    icon: Music2,
    color: '#f59e0b',
    label: 'Prática de Violão',
    greeting: 'Você está em **Prática de Violão** 🎸. Posso recomendar solos, dedilhados (Travis Picking) e agendar suas sessões de treino.',
    chips: [
      { label: '🎸 O que praticar hoje?', prompt: 'O que devo praticar no violão hoje?' },
      { label: '📅 Agendar prática hoje às 19h', prompt: 'Agendar prática de violão hoje às 19:00' },
      { label: '🔥 Pratiquei 30 min hoje', prompt: 'Registrar que pratiquei violão hoje por 30 minutos' },
      { label: '🎵 Meta de aprender violão', prompt: 'Criar meta de aprender violão' },
      { label: '🖐️ Tarefa Travis Picking', prompt: 'Criar tarefa de aprender o dedilhado Travis Picking' },
      { label: '⏰ Lembrete diário às 19h', prompt: 'Me lembrar de praticar violão às 19:00 todos os dias' },
    ],
    postActionSuggestions: ['Agendar outra sessão', 'Criar lembrete', 'Ver Calendário', 'Ver Metas'],
  },
  '/english': {
    icon: Globe,
    color: '#6366f1',
    label: 'Aprender Inglês',
    greeting: 'Você está em **Aprender Inglês** 🌍. Posso te passar palavras do dia, músicas com letra comentada, notícias diárias e planos semanais.',
    chips: [
      { label: '📖 Palavra & Música de hoje', prompt: 'Qual a palavra e música de inglês para hoje?' },
      { label: '📅 Agendar sessão às 20h', prompt: 'Agendar sessão de inglês hoje às 20:00' },
      { label: '📚 Criar plano semanal', prompt: 'Criar plano de estudos de inglês para esta semana' },
      { label: '🎵 Tarefa de música em inglês', prompt: 'Criar tarefa de analisar a letra da música: ' },
      { label: '📰 Ler 1 notícia por dia', prompt: 'Criar tarefa de ler 1 notícia em inglês por dia' },
      { label: '🔥 Estudei 30 min hoje', prompt: 'Registrar que estudei inglês hoje por 30 minutos' },
    ],
    postActionSuggestions: ['Criar outra tarefa de inglês', 'Agendar sessão', 'Ver Estudos', 'Ver Metas'],
  },
};

const defaultConfig: ModuleConfig = {
  icon: Sparkles,
  color: '#8b5cf6',
  label: 'Planly',
  greeting: 'Olá! Sou o **Planly Copilot**. Posso analisar seu dia, criar tarefas, registrar despesas e muito mais.',
  chips: [
    { label: '📊 Analisar meu dia', prompt: 'Analise meu dia completo' },
    { label: '✅ Nova tarefa', prompt: 'Criar tarefa: ' },
    { label: '💰 Registrar despesa', prompt: 'Gastei R$ ' },
    { label: '📅 Agendar evento', prompt: 'Agendar evento: ' },
    { label: '🎸 Violão hoje', prompt: 'O que devo praticar no violão hoje?' },
    { label: '🌍 Inglês hoje', prompt: 'Qual a palavra e música de inglês para hoje?' },
  ],
  postActionSuggestions: ['Analisar meu dia', 'Criar outra ação', 'Ver Finanças'],
};

/* ─── Categorized Directory of All Modules for Global Management ─── */
interface ActionCategory {
  category: string;
  icon: LucideIcon;
  color: string;
  items: { label: string; prompt: string }[];
}

const allActionsDirectory: ActionCategory[] = [
  {
    category: 'Tarefas',
    icon: CheckSquare,
    color: '#6366f1',
    items: [
      { label: '✅ Nova tarefa hoje: ', prompt: 'Criar tarefa para hoje: ' },
      { label: '🚨 Tarefa urgente: ', prompt: 'Criar tarefa urgente: ' },
      { label: '🎉 Concluir tarefa: ', prompt: 'Concluir tarefa: ' },
      { label: '📋 Tarefas pendentes', prompt: 'Quantas tarefas pendentes tenho?' },
      { label: '🏢 Tarefa de trabalho: ', prompt: 'Criar tarefa de trabalho: ' },
      { label: '📚 Tarefa de estudos: ', prompt: 'Criar tarefa de estudos: ' },
    ]
  },
  {
    category: 'Calendário & Agenda',
    icon: CalendarDays,
    color: '#06b6d4',
    items: [
      { label: '📅 Agendar para amanhã', prompt: 'Agendar compromisso amanhã às 14:00: ' },
      { label: '🏢 Reunião de trabalho', prompt: 'Agendar reunião de trabalho amanhã às 10:00: ' },
      { label: '🏋️ Treino na segunda às 07h', prompt: 'Adicionar treino na academia na segunda-feira às 07:00' },
      { label: '⛪ Missa no domingo às 09h', prompt: 'Agendar missa no domingo às 09:00' },
      { label: '🏥 Consulta médica: ', prompt: 'Agendar consulta médica: ' },
      { label: '📅 Eventos de hoje', prompt: 'Quais meus eventos de hoje?' },
    ]
  },
  {
    category: 'Finanças',
    icon: DollarSign,
    color: '#22c55e',
    items: [
      { label: '🛒 Gastei R$ ', prompt: 'Gastei R$ ' },
      { label: '🍽️ Almoço/Lanche: R$ ', prompt: 'Gastei R$ no almoço' },
      { label: '⛽ Gasolina/Uber: R$ ', prompt: 'Gastei R$ de gasolina/uber' },
      { label: '💵 Recebi R$ ', prompt: 'Recebi R$ ' },
      { label: '💳 Conta a pagar: R$ ', prompt: 'Registrar conta: R$ ' },
      { label: '📊 Analisar orçamento', prompt: 'Analisar minhas finanças' },
    ]
  },
  {
    category: 'Prática de Violão',
    icon: Music2,
    color: '#f59e0b',
    items: [
      { label: '🎸 O que praticar hoje?', prompt: 'O que devo praticar no violão hoje?' },
      { label: '🔥 Pratiquei 30 min hoje', prompt: 'Registrar que pratiquei violão hoje por 30 minutos' },
      { label: '📅 Agendar prática hoje às 19h', prompt: 'Agendar prática de violão hoje às 19:00' },
      { label: '🖐️ Dedilhado Travis Picking', prompt: 'Criar tarefa de aprender dedilhado Travis Picking' },
      { label: '🎵 Meta de violão', prompt: 'Criar meta de aprender violão' },
      { label: '⏰ Lembrete diário às 19h', prompt: 'Me lembrar de praticar violão às 19:00' },
    ]
  },
  {
    category: 'Aprender Inglês',
    icon: Globe,
    color: '#6366f1',
    items: [
      { label: '📖 Palavra & Música de hoje', prompt: 'Qual a palavra e música de inglês para hoje?' },
      { label: '🔥 Estudei 30 min hoje', prompt: 'Registrar que estudei inglês hoje por 30 minutos' },
      { label: '📅 Agendar sessão às 20h', prompt: 'Agendar sessão de inglês hoje às 20:00' },
      { label: '🎵 Analisar letra de música: ', prompt: 'Criar tarefa de analisar a letra da música: ' },
      { label: '📰 Ler 1 notícia por dia', prompt: 'Criar tarefa de ler 1 notícia em inglês por dia' },
      { label: '🎯 Meta de fluência', prompt: 'Criar meta de aprender inglês: ficar fluente em 1 ano' },
    ]
  },
  {
    category: 'Academia & Treino',
    icon: Dumbbell,
    color: '#ef4444',
    items: [
      { label: '💪 Treino peito (segunda)', prompt: 'Criar treino de peito para segunda-feira' },
      { label: '🦵 Treino perna (quarta)', prompt: 'Criar treino de pernas para quarta-feira' },
      { label: '🏋️ Treino costas (terça)', prompt: 'Criar treino de costas para terça-feira' },
      { label: '🔥 Treino concluído hoje', prompt: 'Registrar que treinei hoje com sucesso' },
      { label: '📅 Planejar semana de treino', prompt: 'Me ajude a planejar minha semana de treinos' },
      { label: '⏰ Lembrete de treino às 07h', prompt: 'Me lembrar de ir à academia às 07:00' },
    ]
  },
  {
    category: 'Vida Espiritual',
    icon: Church,
    color: '#a78bfa',
    items: [
      { label: '🕊️ Registrar oração de hoje', prompt: 'Registrar oração de hoje' },
      { label: '📖 Leitura bíblica: ', prompt: 'Registrar leitura bíblica de hoje: ' },
      { label: '📿 Rezei o terço hoje', prompt: 'Registrar que rezei o terço hoje' },
      { label: '✍️ Reflexão espiritual: ', prompt: 'Registrar reflexão espiritual: ' },
      { label: '⛪ Fui à missa hoje', prompt: 'Registrar que fui à missa hoje' },
      { label: '🙏 Agradecimento do dia: ', prompt: 'Registrar agradecimento de hoje: ' },
    ]
  },
  {
    category: 'Rotinas & Hábitos',
    icon: Timer,
    color: '#10b981',
    items: [
      { label: '💧 Bebi água (+250ml)', prompt: 'Bebi água hoje' },
      { label: '🔥 Criar hábito diário: ', prompt: 'Criar hábito diário: ' },
      { label: '✅ Cumpri meu hábito de: ', prompt: 'Cumpri meu hábito de ' },
      { label: '📖 Hábito de leitura diária', prompt: 'Criar hábito de ler 20 minutos por dia' },
      { label: '⚡ Consistência de hábitos', prompt: 'Como está minha consistência de hábitos?' },
    ]
  },
  {
    category: 'Alimentação & Nutrição',
    icon: UtensilsCrossed,
    color: '#84cc16',
    items: [
      { label: '🍽️ Registrar refeição: ', prompt: 'Registrar refeição de hoje: ' },
      { label: '💧 Lembrete de água a cada 2h', prompt: 'Criar lembrete de beber água a cada 2 horas' },
      { label: '🥗 Planejar alimentação de hoje', prompt: 'Me ajude a planejar minha alimentação para hoje' },
      { label: '🍎 Registrar lanche saudável: ', prompt: 'Registrar lanche saudável: ' },
      { label: '🎯 Meta de dieta saudável', prompt: 'Criar meta de alimentação saudável: ' },
    ]
  },
  {
    category: 'Metas & Sonhos',
    icon: Target,
    color: '#f59e0b',
    items: [
      { label: '🎯 Criar nova meta: ', prompt: 'Criar meta: ' },
      { label: '💰 Meta financeira: R$ ', prompt: 'Criar meta financeira: juntar R$ ' },
      { label: '📚 Meta de aprendizado: ', prompt: 'Criar meta de aprendizado: ' },
      { label: '✅ Avançar progresso na meta: ', prompt: 'Avançar progresso na meta de: ' },
      { label: '📊 Como estão minhas metas?', prompt: 'Como estão minhas metas?' },
    ]
  },
  {
    category: 'Vida Católica & Fé',
    icon: Church,
    color: '#a855f7',
    items: [
      { label: '✝️ Santo do dia & pregação', prompt: 'Santo do dia de hoje e pregação católica' },
      { label: '🎙️ Pregação Padre Paulo Ricardo', prompt: 'Pregação recomendada do Padre Paulo Ricardo' },
      { label: '📿 Mistério do Terço de hoje', prompt: 'Qual o mistério do rosário/terço de hoje?' },
      { label: '🕊️ Registrar oração de hoje', prompt: 'Registrar oração de hoje' },
      { label: '📖 Leitura bíblica: ', prompt: 'Registrar leitura bíblica de hoje: ' },
      { label: '⛪ Fui à missa hoje', prompt: 'Registrar que fui à missa hoje' },
    ]
  },
  {
    category: 'Transformação & Postura',
    icon: Dumbbell,
    color: '#3b82f6',
    items: [
      { label: '🧍‍♂️ Corrigir postura hoje', prompt: 'Como melhorar minha postura hoje?' },
      { label: '✨ Rotina de skincare (pele)', prompt: 'Rotina de skincare para hoje' },
      { label: '💪 Ficar mais forte (hipertrofia)', prompt: 'Como ficar mais forte e ganhar massa muscular?' },
      { label: '💧 Registrar hidratação (+250ml)', prompt: 'Bebi água hoje' },
      { label: '🔥 Registrar treino concluído', prompt: 'Registrar que treinei hoje com sucesso' },
    ]
  },
  {
    category: 'Negócios, Investimentos & 24h',
    icon: DollarSign,
    color: '#10b981',
    items: [
      { label: '🚀 Ideia de negócio para este ano', prompt: 'Ideia de negócio para começar este ano' },
      { label: '💰 Estratégia de investimentos', prompt: 'Como investir e guardar dinheiro com a regra dos 3 baldes?' },
      { label: '📚 Livros recomendados', prompt: 'Livros transformadores recomendados para negócios e mentalidade' },
      { label: '📰 Notícias das últimas 24h', prompt: 'Notícias importantes das últimas 24h' },
    ]
  },
  {
    category: 'Lembretes',
    icon: Bell,
    color: '#f97316',
    items: [
      { label: '⏰ Lembrete amanhã às 09h: ', prompt: 'Me lembrar amanhã às 09:00: ' },
      { label: '💊 Lembrete de remédio às 08h', prompt: 'Me lembrar de tomar remédio às 08:00 todos os dias' },
      { label: '💰 Lembrete de conta: ', prompt: 'Me lembrar de pagar conta: ' },
      { label: '📚 Lembrete de estudo às 20h', prompt: 'Me lembrar de estudar às 20:00' },
    ]
  },
];

export default function AIAgentDrawer({ isOpen, onClose, onRefreshData }: AIAgentDrawerProps) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const config = moduleConfigs[location.pathname] ?? defaultConfig;

  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState<AgentAttachment | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'all'>('current');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('Todos');
  const [actionSearch, setActionSearch] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const welcomeMessage: ChatMessage = {
    id: 'welcome',
    sender: 'assistant',
    text: `${config.greeting}\n\n**Toque em uma ação rápida abaixo ou escreva qualquer comando:**`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);

  useEffect(() => {
    setMessages([{
      ...welcomeMessage,
      id: `welcome-${location.pathname}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text && !attachment) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: text || `[Arquivo anexado: ${attachment?.name}]`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachment: attachment ? { name: attachment.name } : undefined,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    const currentAttachment = attachment;
    setAttachment(null);

    setTimeout(async () => {
      if (!user) {
        setIsProcessing(false);
        return;
      }

      const response = await processAgentMessageWithAI(user.id, text, currentAttachment || undefined);

      const assistantMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: response.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: response.actionsExecuted,
        suggestions: response.suggestions || config.postActionSuggestions,
      };

      setMessages(prev => [...prev, assistantMsg]);
      setIsProcessing(false);

      if (response.actionsExecuted && response.actionsExecuted.length > 0) {
        onRefreshData?.();
        addToast({
          type: 'success',
          title: 'Ação executada pelo Copilot IA!',
          message: response.actionsExecuted[0].title,
        });
      }
    }, 450);
  };

  const handleChip = (chip: { label: string; prompt: string }) => {
    if (chip.prompt.endsWith(': ') || chip.prompt.endsWith('R$ ') || chip.prompt.endsWith('de: ')) {
      setInput(chip.prompt);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.setSelectionRange(chip.prompt.length, chip.prompt.length);
      }, 50);
    } else {
      handleSendMessage(chip.prompt);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || '');
      setAttachment({
        name: file.name,
        size: file.size,
        type: file.type || 'text/plain',
        content,
      });
      addToast({
        type: 'info',
        title: 'Arquivo anexado!',
        message: `"${file.name}" pronto para análise pelo Agente IA.`,
      });
    };

    if (file.type.startsWith('text') || file.name.endsWith('.txt') || file.name.endsWith('.csv') || file.name.endsWith('.json') || file.name.endsWith('.md')) {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSimulateAttachment = (type: 'receipt' | 'exam' | 'workout') => {
    if (type === 'receipt') {
      setAttachment({
        name: 'Cupom_Fiscal_Restaurante.pdf',
        size: 45200,
        type: 'application/pdf',
        content: 'Comprovante Fiscal - Restaurante Sabor & Vida Ltda - Total Pago: R$ 68,50 - Data: 23/10/2026 - Almoço Executivo + Suco Natural',
      });
      addToast({ type: 'info', title: 'Recibo anexado!', message: 'Toque em Enviar para extrair o valor e lançar nas Finanças.' });
    } else if (type === 'exam') {
      setAttachment({
        name: 'Laudo_Exame_Sangue_Outubro.pdf',
        size: 112000,
        type: 'application/pdf',
        content: 'Laboratório Central - Laudo de Exame de Sangue e Hemograma - Glicose em Jejum: 88 mg/dL - Colesterol Total: 172 mg/dL - Vitamina D: 42 ng/mL',
      });
      addToast({ type: 'info', title: 'Exame de sangue anexado!', message: 'Toque em Enviar para analisar seus biomarcadores.' });
    } else if (type === 'workout') {
      setAttachment({
        name: 'Ficha_Hipertrofia_2026.txt',
        size: 24000,
        type: 'text/plain',
        content: 'Ficha de Treino - Hipertrofia e Força - Supino Reto: 4x10 - Supino Inclinado com Halteres: 3x12 - Crucifixo na Polia: 3x15 - Tríceps Corda: 4x12',
      });
      addToast({ type: 'info', title: 'Ficha de treino anexada!', message: 'Toque em Enviar para importar seus exercícios.' });
    }
  };

  if (!isOpen) return null;

  const ModuleIcon = config.icon;

  // Filtered list of global actions
  const filteredCategories = allActionsDirectory.filter(cat => {
    if (selectedFilterCategory !== 'Todos' && cat.category !== selectedFilterCategory) return false;
    if (!actionSearch.trim()) return true;
    const term = actionSearch.toLowerCase();
    return cat.category.toLowerCase().includes(term) ||
      cat.items.some(item => item.label.toLowerCase().includes(term) || item.prompt.toLowerCase().includes(term));
  });

  return (
    <div className="ai-agent-backdrop" onClick={onClose} style={{
      position: 'fixed', inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      zIndex: 999,
      display: 'flex',
      justifyContent: 'flex-end',
      transition: 'opacity 0.25s ease',
    }}>
      <div
        className="ai-agent-drawer"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '540px',
          height: '100vh',
          backgroundColor: 'var(--surface-card)',
          borderLeft: `1px solid ${config.color}44`,
          boxShadow: `-10px 0 40px rgba(0, 0, 0, 0.7), inset 1px 0 0 rgba(255, 255, 255, 0.05)`,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* ── Header ── */}
        <div style={{
          padding: '16px 20px',
          background: `linear-gradient(135deg, ${config.color}22 0%, ${config.color}0d 100%)`,
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: '12px',
              background: `linear-gradient(135deg, ${config.color} 0%, ${config.color}cc 100%)`,
              color: '#ffffff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 14px ${config.color}55, inset 0 1px 1px rgba(255, 255, 255, 0.3)`,
            }}>
              <Sparkles size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Planly Copilot IA
                </h2>
                <span style={{
                  fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase',
                  padding: '2px 8px', borderRadius: '9999px',
                  background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                }}>Ativo</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
                <ModuleIcon size={12} color={config.color} />
                <span style={{ fontSize: '0.75rem', color: config.color, fontWeight: 600 }}>{config.label}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>· gerencie por voz ou texto</span>
              </div>
            </div>
          </div>

          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: '8px',
            border: '1px solid var(--border-color)',
            background: 'var(--surface-bg)',
            color: 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <X size={18} />
          </button>
        </div>

        {/* ── Quick Actions Mode Switcher Tabs ── */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--surface-card)',
          padding: '4px 16px',
          gap: 8,
        }}>
          <button
            onClick={() => setActiveTab('current')}
            style={{
              flex: 1,
              padding: '8px 12px',
              fontSize: '0.78rem',
              fontWeight: 700,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              background: activeTab === 'current' ? `${config.color}20` : 'transparent',
              color: activeTab === 'current' ? config.color : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            <Zap size={14} /> Deste Módulo ({config.label})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            style={{
              flex: 1,
              padding: '8px 12px',
              fontSize: '0.78rem',
              fontWeight: 700,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              background: activeTab === 'all' ? 'var(--color-primary-100)' : 'transparent',
              color: activeTab === 'all' ? 'var(--color-primary-600)' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            <Layers size={14} /> Todos os Módulos (Catálogo Geral)
          </button>
        </div>

        {/* ── Quick Actions Section Content ── */}
        {activeTab === 'current' ? (
          /* View 1: Current Module Chips */
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--surface-bg)',
          }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={11} color={config.color} /> Ações Rápidas — {config.label}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {config.chips.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => handleChip(chip)}
                  style={{
                    padding: '5px 11px',
                    borderRadius: '9999px',
                    background: 'var(--surface-card)',
                    border: `1px solid ${config.color}33`,
                    color: 'var(--text-primary)',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.borderColor = config.color;
                    e.currentTarget.style.background = `${config.color}15`;
                    e.currentTarget.style.color = config.color;
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.borderColor = `${config.color}33`;
                    e.currentTarget.style.background = 'var(--surface-card)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* View 2: Global Management Directory */
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--surface-bg)',
            maxHeight: '230px',
            overflowY: 'auto',
          }}>
            {/* Search and Category Filter */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-tertiary)' }} />
                <input
                  type="text"
                  placeholder="Pesquisar ação rápida (tarefa, treino, violão, finança...)"
                  value={actionSearch}
                  onChange={e => setActionSearch(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: 30,
                    paddingRight: 10,
                    height: 32,
                    fontSize: '0.78rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--surface-card)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>

            {/* Category selection pills */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6, marginBottom: 8 }}>
              {['Todos', 'Tarefas', 'Calendário & Agenda', 'Finanças', 'Prática de Violão', 'Aprender Inglês', 'Academia & Treino', 'Vida Espiritual', 'Rotinas & Hábitos', 'Metas & Sonhos'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedFilterCategory(cat)}
                  style={{
                    padding: '3px 9px',
                    borderRadius: '9999px',
                    border: '1px solid var(--border-color)',
                    background: selectedFilterCategory === cat ? 'var(--color-primary-600)' : 'var(--surface-card)',
                    color: selectedFilterCategory === cat ? '#ffffff' : 'var(--text-secondary)',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Action Chips grouped by category */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredCategories.map(cat => (
                <div key={cat.category}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: cat.color, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <cat.icon size={13} color={cat.color} /> {cat.category}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {cat.items.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleChip(item)}
                        style={{
                          padding: '4px 9px',
                          borderRadius: '8px',
                          background: 'var(--surface-card)',
                          border: `1px solid ${cat.color}33`,
                          color: 'var(--text-primary)',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          whiteSpace: 'nowrap',
                        }}
                        onMouseOver={e => {
                          e.currentTarget.style.borderColor = cat.color;
                          e.currentTarget.style.background = `${cat.color}15`;
                          e.currentTarget.style.color = cat.color;
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.borderColor = `${cat.color}33`;
                          e.currentTarget.style.background = 'var(--surface-card)';
                          e.currentTarget.style.color = 'var(--text-primary)';
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Messages Body ── */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '16px 16px 10px',
          display: 'flex', flexDirection: 'column', gap: '14px',
        }}>
          {messages.map(msg => (
            <div key={msg.id} style={{
              display: 'flex', flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              gap: 6,
            }}>
              <div style={{
                maxWidth: '90%',
                padding: '11px 15px',
                borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: msg.sender === 'user'
                  ? `linear-gradient(135deg, ${config.color} 0%, ${config.color}cc 100%)`
                  : 'var(--surface-bg)',
                color: msg.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                boxShadow: msg.sender === 'user'
                  ? `0 4px 14px ${config.color}44`
                  : '0 2px 8px rgba(0, 0, 0, 0.1)',
                fontSize: '0.86rem',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                {msg.text}

                {msg.attachment && (
                  <div style={{
                    marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '4px 10px', borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)', fontSize: '0.78rem',
                  }}>
                    <Paperclip size={14} />
                    <span>{msg.attachment.name}</span>
                  </div>
                )}
              </div>

              {/* Action cards executed by AI */}
              {msg.actions && msg.actions.map((act, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  padding: '10px 14px', borderRadius: '10px',
                  background: 'rgba(34, 197, 94, 0.08)',
                  border: '1px solid rgba(34, 197, 94, 0.25)', maxWidth: '90%',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: '#22c55e', fontWeight: 600 }}>
                    <CheckCircle size={16} />
                    <span>{act.title}</span>
                  </div>
                  {act.link && (
                    <button onClick={() => { navigate(act.link!); onClose(); }} style={{
                      display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
                      borderRadius: '6px', background: 'var(--surface-card)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      color: 'var(--text-primary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                    }}>
                      Ver <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              ))}

              {/* Post-Action Suggestions */}
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 2, maxWidth: '92%' }}>
                  {msg.suggestions.map((sug, i) => (
                    <button key={i} onClick={() => handleSendMessage(sug)} style={{
                      padding: '5px 11px', borderRadius: '9999px',
                      background: 'var(--surface-bg)',
                      border: `1px solid ${config.color}33`,
                      color: config.color, fontSize: '0.76rem', fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.15s ease',
                    }}
                      onMouseOver={e => { e.currentTarget.style.borderColor = config.color; e.currentTarget.style.background = `${config.color}12`; }}
                      onMouseOut={e => { e.currentTarget.style.borderColor = `${config.color}33`; e.currentTarget.style.background = 'var(--surface-bg)'; }}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}

              <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>{msg.timestamp}</span>
            </div>
          ))}

          {isProcessing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', fontSize: '0.84rem', padding: '8px 0' }}>
              <RefreshCw size={16} color={config.color} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Analisando e processando pelo Copilot IA...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Attachment preview ── */}
        {attachment && (
          <div style={{
            padding: '8px 16px', backgroundColor: 'var(--surface-bg)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: config.color }}>
              <Paperclip size={16} />
              <span style={{ fontWeight: 600 }}>{attachment.name}</span>
              <span style={{ color: 'var(--text-tertiary)' }}>({(attachment.size / 1024).toFixed(1)} KB)</span>
            </div>
            <button onClick={() => setAttachment(null)} style={{ color: 'var(--text-tertiary)', cursor: 'pointer', background: 'none', border: 'none' }}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* ── Demo File Analysis Shortcuts Strip ── */}
        {!attachment && (
          <div style={{
            padding: '6px 16px',
            backgroundColor: 'var(--surface-bg)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            overflowX: 'auto',
          }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
              📎 Testar Análise IA:
            </span>
            <button
              onClick={() => handleSimulateAttachment('receipt')}
              style={{
                padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600,
                background: 'var(--surface-card)', border: '1px solid var(--border-color)',
                color: 'var(--text-primary)', cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              🧾 Recibo Fiscal
            </button>
            <button
              onClick={() => handleSimulateAttachment('exam')}
              style={{
                padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600,
                background: 'var(--surface-card)', border: '1px solid var(--border-color)',
                color: 'var(--text-primary)', cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              🩺 Exame Sangue
            </button>
            <button
              onClick={() => handleSimulateAttachment('workout')}
              style={{
                padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600,
                background: 'var(--surface-card)', border: '1px solid var(--border-color)',
                color: 'var(--text-primary)', cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              🏋️ Ficha Treino
            </button>
          </div>
        )}

        {/* ── Input Bar ── */}
        <div style={{
          padding: '14px 16px',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--surface-card)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />

          <button
            title="Anexar arquivo para análise inteligente"
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: 40, height: 40, borderRadius: '10px',
              border: `1px solid ${attachment ? config.color : 'var(--border-color)'}`,
              background: attachment ? `${config.color}15` : 'var(--surface-bg)',
              color: attachment ? config.color : 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s ease',
            }}
          >
            <Paperclip size={18} />
          </button>

          <input
            ref={inputRef}
            type="text"
            className="input"
            placeholder={`Peça qualquer ação ou análise...`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(); }}
            style={{ flex: 1, height: 42, borderRadius: '12px', fontSize: '0.88rem' }}
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() && !attachment}
            style={{
              width: 42, height: 42, borderRadius: '12px',
              background: input.trim() || attachment
                ? `linear-gradient(135deg, ${config.color} 0%, ${config.color}cc 100%)`
                : 'var(--surface-bg)',
              color: input.trim() || attachment ? '#ffffff' : 'var(--text-tertiary)',
              border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: input.trim() || attachment ? 'pointer' : 'not-allowed',
              boxShadow: input.trim() || attachment ? `0 4px 14px ${config.color}44` : 'none',
              flexShrink: 0, transition: 'all 0.2s ease',
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
