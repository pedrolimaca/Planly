import { format, subDays, addDays } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import type {
  Task, CalendarEvent, Reminder, FinanceEntry, Budget,
  Habit, HabitLog, Workout, WorkoutLog, HealthRecord,
  Meal, SpiritualActivity, Project, Goal, Note, AppNotification
} from '../types';

export function initializeSeedDataIfEmpty(userId: string): void {
  const tasksKey = `lifeos_${userId}_tasks`;
  if (localStorage.getItem(tasksKey)) {
    return; // Already initialized
  }

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');
  const dayBeforeYesterdayStr = format(subDays(today, 2), 'yyyy-MM-dd');
  const tomorrowStr = format(addDays(today, 1), 'yyyy-MM-dd');
  const nextWeekStr = format(addDays(today, 7), 'yyyy-MM-dd');
  const currentMonthStr = format(today, 'yyyy-MM');

  // 1. Tasks & Subtasks
  const tasks: Task[] = [
    {
      id: uuidv4(),
      user_id: userId,
      title: 'Finalizar arquitetura do sistema Planly',
      description: 'Revisar fluxos de navegação, persistência e responsividade da interface.',
      category: 'work',
      priority: 'urgent',
      status: 'in_progress',
      due_date: todayStr,
      due_time: '18:00',
      estimated_minutes: 120,
      actual_minutes: 60,
      tags: ['Projeto', 'Arquitetura', 'Sprint'],
      order_index: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      subtasks: [
        { id: uuidv4(), task_id: '', title: 'Definir contratos de tipos e modelos de dados', completed: true, order_index: 0, created_at: new Date().toISOString() },
        { id: uuidv4(), task_id: '', title: 'Construir dashboard executivo e Meu Dia', completed: true, order_index: 1, created_at: new Date().toISOString() },
        { id: uuidv4(), task_id: '', title: 'Validação com storage local e feedback visual', completed: false, order_index: 2, created_at: new Date().toISOString() },
      ],
    },
    {
      id: uuidv4(),
      user_id: userId,
      title: 'Pagar fatura do cartão de crédito',
      description: 'Conferir lançamentos no extrato e agendar pagamento via PIX.',
      category: 'finance',
      priority: 'high',
      status: 'pending',
      due_date: todayStr,
      due_time: '20:00',
      estimated_minutes: 15,
      tags: ['Finanças', 'Urgente'],
      order_index: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      user_id: userId,
      title: 'Treino A: Peito, Ombros e Tríceps',
      description: 'Supino reto, inclinado com halteres, desenvolvimento militar e paralelas.',
      category: 'fitness',
      priority: 'medium',
      status: 'completed',
      due_date: todayStr,
      due_time: '07:00',
      estimated_minutes: 60,
      actual_minutes: 65,
      tags: ['Academia', 'Saúde'],
      order_index: 2,
      completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      user_id: userId,
      title: 'Estudar 1 capítulo do livro de Clean Architecture',
      description: 'Fazer anotações dos princípios de dependência e desacoplamento.',
      category: 'study',
      priority: 'medium',
      status: 'pending',
      due_date: tomorrowStr,
      due_time: '21:00',
      estimated_minutes: 45,
      tags: ['Livros', 'Carreira'],
      order_index: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      user_id: userId,
      title: 'Revisão orçamentária mensal',
      description: 'Comparar despesas reais com os limites estipulados por categoria.',
      category: 'finance',
      priority: 'low',
      status: 'pending',
      due_date: nextWeekStr,
      tags: ['Planejamento'],
      order_index: 4,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
  localStorage.setItem(tasksKey, JSON.stringify(tasks));

  // 2. Events (Calendar)
  const events: CalendarEvent[] = [
    {
      id: uuidv4(),
      user_id: userId,
      title: 'Reunião de Alinhamento Semanal',
      description: 'Status report e prioridades da semana com o time.',
      category: 'work',
      start_date: todayStr,
      start_time: '10:00',
      end_date: todayStr,
      end_time: '11:00',
      all_day: false,
      priority: 'high',
      color: '#7c3aed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      user_id: userId,
      title: 'Consulta Nutricionista (Acompanhamento)',
      description: 'Apresentar recordatório alimentar e conferir nova dieta.',
      category: 'health',
      start_date: tomorrowStr,
      start_time: '15:30',
      end_date: tomorrowStr,
      end_time: '16:30',
      location: 'Clínica Saúde & Vida - Sala 402',
      all_day: false,
      priority: 'medium',
      color: '#059669',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      user_id: userId,
      title: 'Missa Dominical',
      category: 'spiritual',
      start_date: addDays(today, 2).toISOString().split('T')[0],
      start_time: '10:00',
      end_date: addDays(today, 2).toISOString().split('T')[0],
      end_time: '11:30',
      location: 'Paróquia Nossa Senhora',
      all_day: false,
      priority: 'high',
      color: '#d97706',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      user_id: userId,
      title: 'Treino Funcional / Corrida',
      category: 'fitness',
      start_date: addDays(today, 3).toISOString().split('T')[0],
      start_time: '07:30',
      end_date: addDays(today, 3).toISOString().split('T')[0],
      end_time: '08:30',
      all_day: false,
      priority: 'medium',
      color: '#ea580c',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
  localStorage.setItem(`lifeos_${userId}_events`, JSON.stringify(events));

  // 3. Reminders
  const reminders: Reminder[] = [
    {
      id: uuidv4(),
      user_id: userId,
      title: 'Tomar Creatina e Multivitamínico',
      message: '5g de creatina com água após o almoço.',
      category: 'health',
      date: todayStr,
      time: '13:00',
      priority: 'medium',
      status: 'completed',
      advance_minutes: 0,
      recurrence: 'daily',
      completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      user_id: userId,
      title: 'Beber 500ml de Água',
      message: 'Manter a hidratação diária de 3 litros.',
      category: 'health',
      date: todayStr,
      time: '16:00',
      priority: 'low',
      status: 'active',
      advance_minutes: 0,
      recurrence: 'daily',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      user_id: userId,
      title: 'Oração das Laudes / Leitura Bíblica',
      message: 'Momento de reflexão e leitura do Evangelho do dia.',
      category: 'spiritual',
      date: tomorrowStr,
      time: '06:30',
      priority: 'high',
      status: 'active',
      advance_minutes: 10,
      recurrence: 'daily',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
  localStorage.setItem(`lifeos_${userId}_reminders`, JSON.stringify(reminders));

  // 4. Finance (Entries & Budgets)
  const finance: FinanceEntry[] = [
    {
      id: uuidv4(),
      user_id: userId,
      description: 'Salário Mensal',
      type: 'income',
      category: 'Salário e renda',
      amount: 8500.00,
      date: `${currentMonthStr}-05`,
      status: 'received',
      payment_method: 'Transferência',
      payment_date: `${currentMonthStr}-05`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      user_id: userId,
      description: 'Aluguel e Condomínio',
      type: 'expense',
      category: 'Moradia',
      amount: 2200.00,
      date: `${currentMonthStr}-10`,
      due_date: `${currentMonthStr}-10`,
      status: 'paid',
      payment_method: 'Boleto',
      payment_date: `${currentMonthStr}-10`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      user_id: userId,
      description: 'Supermercado Mensal',
      type: 'expense',
      category: 'Alimentação',
      amount: 1140.50,
      date: `${currentMonthStr}-12`,
      status: 'paid',
      payment_method: 'Cartão de crédito',
      payment_date: `${currentMonthStr}-12`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      user_id: userId,
      description: 'Mensalidade da Academia',
      type: 'expense',
      category: 'Academia',
      amount: 149.90,
      date: `${currentMonthStr}-15`,
      due_date: `${currentMonthStr}-15`,
      status: 'paid',
      payment_method: 'Cartão de crédito',
      payment_date: `${currentMonthStr}-15`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      user_id: userId,
      description: 'Fatura de Cartão - Internet & Serviços',
      type: 'expense',
      category: 'Assinaturas',
      amount: 280.00,
      date: todayStr,
      due_date: todayStr,
      status: 'pending',
      payment_method: 'PIX',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      user_id: userId,
      description: 'Projeto Freelance Frontend',
      type: 'income',
      category: 'Salário e renda',
      amount: 2500.00,
      date: nextWeekStr,
      due_date: nextWeekStr,
      status: 'pending',
      payment_method: 'PIX',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
  localStorage.setItem(`lifeos_${userId}_finance`, JSON.stringify(finance));

  const budgets: Budget[] = [
    { id: uuidv4(), user_id: userId, category: 'Moradia', month: currentMonthStr, amount: 2500, created_at: new Date().toISOString() },
    { id: uuidv4(), user_id: userId, category: 'Alimentação', month: currentMonthStr, amount: 1600, created_at: new Date().toISOString() },
    { id: uuidv4(), user_id: userId, category: 'Transporte', month: currentMonthStr, amount: 600, created_at: new Date().toISOString() },
    { id: uuidv4(), user_id: userId, category: 'Academia', month: currentMonthStr, amount: 200, created_at: new Date().toISOString() },
    { id: uuidv4(), user_id: userId, category: 'Lazer', month: currentMonthStr, amount: 500, created_at: new Date().toISOString() },
    { id: uuidv4(), user_id: userId, category: 'Assinaturas', month: currentMonthStr, amount: 350, created_at: new Date().toISOString() },
  ];
  localStorage.setItem(`lifeos_${userId}_budgets`, JSON.stringify(budgets));

  // 5. Habits & Habit Logs
  const habit1Id = uuidv4();
  const habit2Id = uuidv4();
  const habit3Id = uuidv4();
  const habit4Id = uuidv4();
  const habits: Habit[] = [
    {
      id: habit1Id,
      user_id: userId,
      name: 'Beber 2.5L de Água',
      description: 'Hidratação constante ao longo do dia com garrafa de 500ml.',
      category: 'health',
      frequency: 'daily',
      daily_goal: 5,
      start_date: dayBeforeYesterdayStr,
      color: '#3b82f6',
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: habit2Id,
      user_id: userId,
      name: 'Leitura Bíblica & Oração',
      description: 'Mínimo de 15 minutos de reflexão matinal.',
      category: 'spiritual',
      frequency: 'daily',
      start_date: dayBeforeYesterdayStr,
      color: '#8b5cf6',
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: habit3Id,
      user_id: userId,
      name: 'Treino de Força / Exercício',
      description: 'Musculação ou corrida com foco e intensidade.',
      category: 'fitness',
      frequency: 'daily',
      start_date: dayBeforeYesterdayStr,
      color: '#ea580c',
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: habit4Id,
      user_id: userId,
      name: 'Dormir antes das 23h',
      description: 'Desconectar das telas 30 minutos antes para higiene do sono.',
      category: 'health',
      frequency: 'daily',
      start_date: dayBeforeYesterdayStr,
      color: '#10b981',
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
  localStorage.setItem(`lifeos_${userId}_habits`, JSON.stringify(habits));

  const habitLogs: HabitLog[] = [
    // Yesterday
    { id: uuidv4(), habit_id: habit1Id, user_id: userId, date: yesterdayStr, completed: true, value: 5, created_at: new Date().toISOString() },
    { id: uuidv4(), habit_id: habit2Id, user_id: userId, date: yesterdayStr, completed: true, created_at: new Date().toISOString() },
    { id: uuidv4(), habit_id: habit3Id, user_id: userId, date: yesterdayStr, completed: true, created_at: new Date().toISOString() },
    { id: uuidv4(), habit_id: habit4Id, user_id: userId, date: yesterdayStr, completed: true, created_at: new Date().toISOString() },
    // Day before
    { id: uuidv4(), habit_id: habit1Id, user_id: userId, date: dayBeforeYesterdayStr, completed: true, value: 4, created_at: new Date().toISOString() },
    { id: uuidv4(), habit_id: habit2Id, user_id: userId, date: dayBeforeYesterdayStr, completed: true, created_at: new Date().toISOString() },
    { id: uuidv4(), habit_id: habit3Id, user_id: userId, date: dayBeforeYesterdayStr, completed: false, created_at: new Date().toISOString() },
    { id: uuidv4(), habit_id: habit4Id, user_id: userId, date: dayBeforeYesterdayStr, completed: true, created_at: new Date().toISOString() },
    // Today
    { id: uuidv4(), habit_id: habit1Id, user_id: userId, date: todayStr, completed: true, value: 3, created_at: new Date().toISOString() },
    { id: uuidv4(), habit_id: habit2Id, user_id: userId, date: todayStr, completed: true, created_at: new Date().toISOString() },
    { id: uuidv4(), habit_id: habit3Id, user_id: userId, date: todayStr, completed: true, created_at: new Date().toISOString() },
  ];
  localStorage.setItem(`lifeos_${userId}_habit_logs`, JSON.stringify(habitLogs));

  // 6. Workouts
  const workoutAId = uuidv4();
  const workoutBId = uuidv4();
  const workouts: Workout[] = [
    {
      id: workoutAId,
      user_id: userId,
      name: 'Treino A - Peito, Tríceps & Ombros',
      description: 'Foco em força e hipertrofia de empurrar.',
      muscle_groups: ['Peito', 'Tríceps', 'Ombro frontal e lateral'],
      duration_minutes: 60,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      exercises: [
        { id: uuidv4(), workout_id: workoutAId, name: 'Supino Reto com Barra', sets: 4, reps: '8-10', weight: 80, rest_seconds: 90, order_index: 0 },
        { id: uuidv4(), workout_id: workoutAId, name: 'Supino Inclinado com Halteres', sets: 3, reps: '10-12', weight: 26, rest_seconds: 60, order_index: 1 },
        { id: uuidv4(), workout_id: workoutAId, name: 'Crucifixo na Polia', sets: 3, reps: '12-15', weight: 15, rest_seconds: 45, order_index: 2 },
        { id: uuidv4(), workout_id: workoutAId, name: 'Desenvolvimento Militar com Halteres', sets: 3, reps: '10', weight: 18, rest_seconds: 60, order_index: 3 },
        { id: uuidv4(), workout_id: workoutAId, name: 'Tríceps Corda', sets: 4, reps: '12', weight: 25, rest_seconds: 45, order_index: 4 },
      ],
    },
    {
      id: workoutBId,
      user_id: userId,
      name: 'Treino B - Costas, Bíceps & Trapézio',
      description: 'Foco em puxadas, densidade dorsal e braços.',
      muscle_groups: ['Costas', 'Bíceps', 'Ombro posterior'],
      duration_minutes: 55,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      exercises: [
        { id: uuidv4(), workout_id: workoutBId, name: 'Puxada Frontal Aberta', sets: 4, reps: '10', weight: 65, rest_seconds: 75, order_index: 0 },
        { id: uuidv4(), workout_id: workoutBId, name: 'Remada Curvada com Barra', sets: 4, reps: '8-10', weight: 70, rest_seconds: 90, order_index: 1 },
        { id: uuidv4(), workout_id: workoutBId, name: 'Remada Baixa Triângulo', sets: 3, reps: '12', weight: 55, rest_seconds: 60, order_index: 2 },
        { id: uuidv4(), workout_id: workoutBId, name: 'Rosca Direta com Barra W', sets: 3, reps: '10', weight: 28, rest_seconds: 60, order_index: 3 },
        { id: uuidv4(), workout_id: workoutBId, name: 'Rosca Martelo com Halteres', sets: 3, reps: '12', weight: 14, rest_seconds: 45, order_index: 4 },
      ],
    },
  ];
  localStorage.setItem(`lifeos_${userId}_workouts`, JSON.stringify(workouts));

  const workoutLogs: WorkoutLog[] = [
    {
      id: uuidv4(),
      user_id: userId,
      workout_id: workoutAId,
      date: todayStr,
      duration_minutes: 62,
      notes: 'Sensação excelente de força no supino reto. Aumentei 2kg na última série.',
      exercises: [
        { exercise_name: 'Supino Reto com Barra', sets_completed: 4, reps_completed: '10, 10, 9, 8', weight_used: 80 },
        { exercise_name: 'Supino Inclinado com Halteres', sets_completed: 3, reps_completed: '12, 11, 10', weight_used: 26 },
        { exercise_name: 'Crucifixo na Polia', sets_completed: 3, reps_completed: '15, 14, 12', weight_used: 15 },
        { exercise_name: 'Desenvolvimento Militar', sets_completed: 3, reps_completed: '10, 10, 9', weight_used: 18 },
        { exercise_name: 'Tríceps Corda', sets_completed: 4, reps_completed: '12, 12, 11, 10', weight_used: 25 },
      ],
      created_at: new Date().toISOString(),
    },
  ];
  localStorage.setItem(`lifeos_${userId}_workout_logs`, JSON.stringify(workoutLogs));

  // 7. Nutrition
  const meals: Meal[] = [
    {
      id: uuidv4(),
      user_id: userId,
      type: 'breakfast',
      date: todayStr,
      time: '07:30',
      completed: true,
      foods: [
        { name: 'Ovos mexidos com azeite', quantity: '3 unidades', calories: 240, protein: 18, carbs: 2, fat: 17 },
        { name: 'Pão integral 100%', quantity: '2 fatias', calories: 130, protein: 6, carbs: 24, fat: 2 },
        { name: 'Café puro sem açúcar', quantity: '200ml', calories: 5, protein: 0, carbs: 1, fat: 0 },
        { name: 'Banana prata', quantity: '1 unidade', calories: 89, protein: 1, carbs: 23, fat: 0 },
      ],
      notes: 'Desjejum completo pós-treino.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      user_id: userId,
      type: 'lunch',
      date: todayStr,
      time: '12:30',
      completed: true,
      foods: [
        { name: 'Arroz branco cozido', quantity: '150g', calories: 195, protein: 4, carbs: 42, fat: 0.5 },
        { name: 'Feijão carioca', quantity: '100g', calories: 76, protein: 5, carbs: 14, fat: 0.5 },
        { name: 'Peito de frango grelhado', quantity: '180g', calories: 290, protein: 55, carbs: 0, fat: 6 },
        { name: 'Mix de folhas e tomate com azeite', quantity: '1 prato', calories: 60, protein: 2, carbs: 5, fat: 4 },
      ],
      notes: 'Almoço equilibrado e rico em proteínas.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      user_id: userId,
      type: 'afternoon_snack',
      date: todayStr,
      time: '16:30',
      completed: false,
      foods: [
        { name: 'Iogurte natural desnatado', quantity: '170g', calories: 95, protein: 8, carbs: 11, fat: 1 },
        { name: 'Whey Protein Isolado', quantity: '30g', calories: 120, protein: 25, carbs: 2, fat: 1 },
        { name: 'Castanhas do Pará', quantity: '15g (3 un)', calories: 98, protein: 2, carbs: 2, fat: 10 },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      user_id: userId,
      type: 'dinner',
      date: todayStr,
      time: '20:00',
      completed: false,
      foods: [
        { name: 'Patinho moído com legumes', quantity: '160g', calories: 260, protein: 42, carbs: 5, fat: 8 },
        { name: 'Batata doce assada', quantity: '120g', calories: 105, protein: 2, carbs: 24, fat: 0.2 },
        { name: 'Brócolis no vapor', quantity: '100g', calories: 35, protein: 3, carbs: 7, fat: 0.4 },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
  localStorage.setItem(`lifeos_${userId}_meals`, JSON.stringify(meals));

  // 8. Health
  const healthRecords: HealthRecord[] = [
    {
      id: uuidv4(),
      user_id: userId,
      type: 'appointment',
      title: 'Consulta Anual com Cardiologista',
      description: 'Checkup preventivo, eletrocardiograma e teste ergométrico.',
      doctor: 'Dr. Roberto Mendes',
      location: 'Hospital Samaritano',
      date: addDays(today, 14).toISOString().split('T')[0],
      time: '14:00',
      status: 'scheduled',
      notes: 'Levar exames de sangue do ano passado.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      user_id: userId,
      type: 'exam',
      title: 'Exames de Sangue e Perfil Lipídico',
      description: 'Hemograma completo, glicemia de jejum, colesterol total e frações, TSH, vitamina D.',
      doctor: 'Dra. Camila Santos',
      location: 'Laboratório Fleury',
      date: addDays(today, 10).toISOString().split('T')[0],
      time: '07:00',
      status: 'scheduled',
      notes: 'Jejum obrigatório de 10 a 12 horas.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      user_id: userId,
      type: 'medication',
      title: 'Suplementação: Vitamina D3 2000 UI',
      description: '1 cápsula ao dia pela manhã junto à refeição.',
      date: todayStr,
      time: '08:00',
      status: 'completed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
  localStorage.setItem(`lifeos_${userId}_health`, JSON.stringify(healthRecords));

  // 9. Studies & Projects
  const projects: Project[] = [
    {
      id: uuidv4(),
      user_id: userId,
      title: 'Plataforma Planly (Sistema Pessoal)',
      description: 'Desenvolvimento do sistema inteligente de organização pessoal com dashboard, rotinas e módulos integrados.',
      category: 'work',
      status: 'active',
      priority: 'urgent',
      start_date: dayBeforeYesterdayStr,
      due_date: addDays(today, 30).toISOString().split('T')[0],
      notes: 'Stack React, TypeScript, CSS custom tokens, Vite, Supabase / Storage.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      user_id: userId,
      title: 'Certificação AWS Solutions Architect',
      description: 'Curso intensivo de arquitetura em nuvem, práticas de alta disponibilidade e segurança.',
      category: 'study',
      status: 'active',
      priority: 'high',
      start_date: subDays(today, 15).toISOString().split('T')[0],
      due_date: addDays(today, 45).toISOString().split('T')[0],
      notes: 'Estudo de 1h por dia nos módulos de VPC, IAM e RDS.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
  localStorage.setItem(`lifeos_${userId}_projects`, JSON.stringify(projects));

  // 10. Spiritual Life
  const spiritual: SpiritualActivity[] = [
    {
      id: uuidv4(),
      user_id: userId,
      type: 'reading',
      title: 'Evangelho do Dia & Reflexão',
      description: 'Leitura meditada das escrituras com anotações no diário espiritual.',
      date: todayStr,
      time: '06:30',
      duration_minutes: 20,
      bible_reference: 'Mateus 6, 25-34',
      completed: true,
      private: false,
      notes: 'Mensagem sobre a Providência Divina e não se inquietar pelo dia de amanhã.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      user_id: userId,
      type: 'intention',
      title: 'Intenção Especial pela Família e Saúde',
      description: 'Oração diária pela harmonia familiar, proteção e paz interior.',
      date: todayStr,
      completed: true,
      private: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      user_id: userId,
      type: 'rosary',
      title: 'Santo Terço (Mistérios Luminosos)',
      date: todayStr,
      time: '21:30',
      duration_minutes: 25,
      completed: false,
      private: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
  localStorage.setItem(`lifeos_${userId}_spiritual`, JSON.stringify(spiritual));

  // 11. Goals & Milestones
  const goal1Id = uuidv4();
  const goal2Id = uuidv4();
  const goals: Goal[] = [
    {
      id: goal1Id,
      user_id: userId,
      title: 'Reserva de Emergência de 6 Meses',
      description: 'Alcançar R$ 30.000 aplicados em renda fixa de liquidez diária com rentabilidade 100% CDI.',
      area: 'Finanças',
      priority: 'high',
      status: 'in_progress',
      due_date: `${new Date().getFullYear()}-12-31`,
      motivation: 'Garantir estabilidade financeira e tranquilidade para tomar decisões de longo prazo.',
      progress: 65,
      progress_type: 'manual',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      milestones: [
        { id: uuidv4(), goal_id: goal1Id, title: 'R$ 10.000 acumulados', completed: true, completed_at: '2026-03-10', order_index: 0 },
        { id: uuidv4(), goal_id: goal1Id, title: 'R$ 20.000 acumulados', completed: true, completed_at: '2026-07-15', order_index: 1 },
        { id: uuidv4(), goal_id: goal1Id, title: 'R$ 30.000 acumulados (Meta Final)', completed: false, order_index: 2 },
      ],
    },
    {
      id: goal2Id,
      user_id: userId,
      title: 'Correr Meia Maratona (21km)',
      description: 'Treinar com planilha progressiva e completar a prova oficial em menos de 1h55min.',
      area: 'Saúde',
      priority: 'medium',
      status: 'in_progress',
      due_date: `${new Date().getFullYear()}-11-20`,
      motivation: 'Superação física e mental, longevidade e resistência cardiovascular.',
      progress: 50,
      progress_type: 'manual',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      milestones: [
        { id: uuidv4(), goal_id: goal2Id, title: 'Correr 5km sem pausas abaixo de 26min', completed: true, completed_at: '2026-05-12', order_index: 0 },
        { id: uuidv4(), goal_id: goal2Id, title: 'Completar 10km em ritmo estável', completed: true, completed_at: '2026-08-20', order_index: 1 },
        { id: uuidv4(), goal_id: goal2Id, title: 'Treino longo de 16km', completed: false, order_index: 2 },
        { id: uuidv4(), goal_id: goal2Id, title: 'Dia da Meia Maratona (21km)', completed: false, order_index: 3 },
      ],
    },
  ];
  localStorage.setItem(`lifeos_${userId}_goals`, JSON.stringify(goals));

  // 12. Notes
  const notes: Note[] = [
    {
      id: uuidv4(),
      user_id: userId,
      title: 'Ideias e Princípios de Vida',
      content: '1. Clareza antes de velocidade.\n2. Consistência vence intensidade esporádica.\n3. O que não é medido não pode ser gerenciado.\n4. Cuidar do corpo, da mente e do espírito em equilíbrio.',
      pinned: true,
      category: 'personal',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      user_id: userId,
      title: 'Lista de Livros Recomendados para o Ano',
      content: '- Clean Architecture (Robert C. Martin)\n- Hábitos Atômicos (James Clear)\n- Essencialismo (Greg McKeown)\n- Imitação de Cristo (Tomás de Kempis)',
      pinned: false,
      category: 'study',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
  localStorage.setItem(`lifeos_${userId}_notes`, JSON.stringify(notes));

  // 13. Notifications
  const notifications: AppNotification[] = [
    {
      id: uuidv4(),
      user_id: userId,
      title: 'Bem-vindo ao Planly!',
      message: 'Seu sistema operacional pessoal está configurado com dados de exemplo prontos para uso.',
      type: 'success',
      read: false,
      created_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      user_id: userId,
      title: 'Lembrete de Pagamento Hoje',
      message: 'Fatura de Cartão - Internet & Serviços vence hoje no valor de R$ 280,00.',
      type: 'warning',
      read: false,
      created_at: new Date().toISOString(),
    },
  ];
  localStorage.setItem(`lifeos_${userId}_notifications`, JSON.stringify(notifications));
}

export function resetToSeedData(userId: string): void {
  const collections = [
    'tasks', 'events', 'reminders', 'finance', 'budgets',
    'habits', 'habit_logs', 'workouts', 'workout_logs',
    'health', 'meals', 'spiritual', 'projects', 'goals', 'notes',
    'notifications'
  ];
  collections.forEach(col => {
    localStorage.removeItem(`lifeos_${userId}_${col}`);
  });
  initializeSeedDataIfEmpty(userId);
}
