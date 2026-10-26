import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Sun, CheckCircle2, Circle, Plus, Droplets, Dumbbell,
  UtensilsCrossed, Church, ChevronLeft, ChevronRight,
  Flame, Music2, Globe, CalendarDays, DollarSign,
  ArrowRight, Sparkles, Check, BookOpen, ExternalLink,
  Shield, TrendingUp, Newspaper, Compass, HelpCircle,
  Target, ScrollText, Play, Clock, Moon, Zap
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import ProgressBar from '../components/common/ProgressBar';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getAllItems, updateItem, createItem } from '../services/storage';
import {
  getDailyCatholicContext,
  allRosaryMysteries,
  dailyHighImpactGoals,
  findExerciseGuide,
  curatedNews24h,
  transformationProtocols,
  businessIdeasCatalog,
  dailyScheduleRoutine,
  dailyGoldenTips,
  type ExerciseGuide,
  type DailyGoalChallenge,
} from '../services/transformationContent';
import type {
  Task, Habit, HabitLog, CalendarEvent, FinanceEntry
} from '../types';

export default function MyDayPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState(new Date());
  const dateStr = format(currentDate, 'yyyy-MM-dd');
  const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;

  // Active Tab: Routine, Modules, Catholic, Transformation, Business/News
  const [activeTab, setActiveTab] = useState<'routine' | 'modules' | 'catholic' | 'transformation' | 'business'>('routine');

  // Exercise Execution Modal State
  const [selectedExerciseGuide, setSelectedExerciseGuide] = useState<ExerciseGuide | null>(null);

  // Rosary Mysteries Selected View (Today or specific mysteries)
  const [selectedRosaryTab, setSelectedRosaryTab] = useState<string>('today');

  // Completed high-impact daily goals tracking
  const [completedGoals, setCompletedGoals] = useState<string[]>([]);

  // Completed routine blocks tracking (persisted by date)
  const [completedRoutineBlocks, setCompletedRoutineBlocks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`planly_routine_${dateStr}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [routinePeriodFilter, setRoutinePeriodFilter] = useState<'all' | 'manha' | 'tarde' | 'noite'>('all');

  const handleToggleRoutineBlock = (blockId: string) => {
    setCompletedRoutineBlocks(prev => {
      const next = prev.includes(blockId) ? prev.filter(id => id !== blockId) : [...prev, blockId];
      try {
        localStorage.setItem(`planly_routine_${dateStr}`, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      if (!prev.includes(blockId)) {
        addToast({ type: 'success', title: 'Etapa concluída! Excelente disciplina e foco!' });
      }
      return next;
    });
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`planly_routine_${dateStr}`);
      setCompletedRoutineBlocks(saved ? JSON.parse(saved) : []);
    } catch {
      setCompletedRoutineBlocks([]);
    }
  }, [dateStr]);

  // Data from active modules
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [finances, setFinances] = useState<FinanceEntry[]>([]);

  // Daily tracking states
  const [waterGlasses, setWaterGlasses] = useState(4); // 4 * 250ml = 1000ml
  const [guitarPracticed, setGuitarPracticed] = useState(false);
  const [englishCompleted, setEnglishCompleted] = useState(false);
  const [spiritualDone, setSpiritualDone] = useState(false);
  const [postureDone, setPostureDone] = useState(false);
  const [skincareDone, setSkincareDone] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const catholicData = getDailyCatholicContext(currentDate);

  const loadData = () => {
    if (!user) return;
    setTasks(getAllItems<Task>('tasks', user.id));
    setHabits(getAllItems<Habit>('habits', user.id));
    setHabitLogs(getAllItems<HabitLog>('habit_logs', user.id));
    setEvents(getAllItems<CalendarEvent>('events', user.id));
    setFinances(getAllItems<FinanceEntry>('finance', user.id));

    const allTasks = getAllItems<Task>('tasks', user.id);
    setGuitarPracticed(allTasks.some(t => t.due_date === dateStr && t.status === 'completed' && /violão|guitarra/i.test(t.title)));
    setEnglishCompleted(allTasks.some(t => t.due_date === dateStr && t.status === 'completed' && /inglês|ingles|english/i.test(t.title)));
    setSpiritualDone(allTasks.some(t => t.due_date === dateStr && t.status === 'completed' && /oração|espiritual|missa|terço/i.test(t.title)));
    setPostureDone(allTasks.some(t => t.due_date === dateStr && t.status === 'completed' && /postura|alongamento/i.test(t.title)));
    setSkincareDone(allTasks.some(t => t.due_date === dateStr && t.status === 'completed' && /skincare|pele/i.test(t.title)));

    const finishedGoalIds = allTasks
      .filter(t => t.due_date === dateStr && t.status === 'completed' && t.title.startsWith('[Meta do Dia]'))
      .map(t => {
        const match = dailyHighImpactGoals.find(g => t.title.includes(g.title));
        return match ? match.id : '';
      })
      .filter(Boolean);
    setCompletedGoals(finishedGoalIds);
  };

  useEffect(() => {
    loadData();
  }, [user, dateStr]);

  // Task actions
  const handleToggleTask = (task: Task) => {
    if (!user) return;
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const now = new Date().toISOString();
    updateItem<Task>('tasks', user.id, task.id, {
      status: newStatus,
      completed_at: newStatus === 'completed' ? now : undefined,
    });
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus, completed_at: newStatus === 'completed' ? now : undefined } : t));
    addToast({
      type: newStatus === 'completed' ? 'success' : 'info',
      title: newStatus === 'completed' ? 'Tarefa concluída!' : 'Tarefa reaberta',
    });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !user) return;

    const newTask = createItem<Task>('tasks', user.id, {
      user_id: user.id,
      title: newTaskTitle.trim(),
      category: 'personal',
      priority: 'medium',
      status: 'pending',
      due_date: dateStr,
      tags: ['meu-dia'],
      order_index: 0,
    });
    setTasks(prev => [newTask, ...prev]);
    setNewTaskTitle('');
    addToast({ type: 'success', title: 'Tarefa adicionada ao seu dia!' });
  };

  // Habit toggle
  const handleToggleHabit = (habitId: string) => {
    if (!user) return;
    const existingLog = habitLogs.find(l => l.habit_id === habitId && l.date === dateStr);
    if (existingLog) {
      const updated = updateItem<HabitLog>('habit_logs', user.id, existingLog.id, {
        completed: !existingLog.completed,
      });
      if (updated) {
        setHabitLogs(prev => prev.map(l => l.id === existingLog.id ? updated : l));
      }
    } else {
      const newLog = createItem<HabitLog>('habit_logs', user.id, {
        habit_id: habitId,
        user_id: user.id,
        date: dateStr,
        completed: true,
      });
      setHabitLogs(prev => [...prev, newLog]);
    }
  };

  // Quick toggles for transformation activities
  const handleToggleActivity = (type: 'guitar' | 'english' | 'spiritual' | 'posture' | 'skincare') => {
    if (!user) return;
    const titles: Record<string, string> = {
      guitar: 'Prática de Violão: Dust in the Wind & Travis Picking (30 min)',
      english: 'Estudo Diário de Inglês: Vocabulário & Letra de Música',
      spiritual: `Oração & Devoção: ${catholicData.name}`,
      posture: 'Protocolo de Correção Postural e Alinhamento Cervical (5 min)',
      skincare: 'Rotina de Skincare Facial (Limpeza + Hidratação + Protetor)',
    };
    const tags: Record<string, string[]> = {
      guitar: ['violão', 'música'],
      english: ['inglês', 'estudos'],
      spiritual: ['oração', 'catolicismo'],
      posture: ['postura', 'saúde'],
      skincare: ['skincare', 'autocuidado'],
    };

    createItem<Task>('tasks', user.id, {
      user_id: user.id,
      title: titles[type],
      category: 'personal',
      priority: 'medium',
      status: 'completed',
      due_date: dateStr,
      completed_at: new Date().toISOString(),
      tags: tags[type],
      order_index: 0,
    });

    if (type === 'guitar') setGuitarPracticed(true);
    if (type === 'english') setEnglishCompleted(true);
    if (type === 'spiritual') setSpiritualDone(true);
    if (type === 'posture') setPostureDone(true);
    if (type === 'skincare') setSkincareDone(true);

    addToast({ type: 'success', title: `${titles[type]} marcado como concluído!` });
  };

  const handleToggleDailyGoal = (goal: DailyGoalChallenge) => {
    if (!user) return;
    const isAlreadyDone = completedGoals.includes(goal.id);
    if (isAlreadyDone) {
      setCompletedGoals(prev => prev.filter(id => id !== goal.id));
      addToast({ type: 'info', title: 'Meta desmarcada.' });
      return;
    }

    setCompletedGoals(prev => [...prev, goal.id]);
    createItem<Task>('tasks', user.id, {
      user_id: user.id,
      title: `[Meta do Dia] ${goal.title}`,
      description: goal.description,
      category: 'personal',
      priority: 'high',
      status: 'completed',
      due_date: dateStr,
      completed_at: new Date().toISOString(),
      tags: ['meta-do-dia', goal.category],
      order_index: 0,
    });
    addToast({
      type: 'success',
      title: '🎯 Desafio Conquistado!',
      message: `Você ganhou +${goal.xpPoints} XP diários. Continue evoluindo!`,
    });
  };

  // Filter items for current date
  const dayTasks = tasks.filter(t => t.due_date === dateStr || (!t.due_date && isToday && t.status !== 'completed'));
  const completedDayTasks = dayTasks.filter(t => t.status === 'completed');

  const dayEvents = events.filter(e => e.start_date === dateStr);
  const dayFinances = finances.filter(f => f.date === dateStr);
  const totalDaySpent = dayFinances.filter(f => f.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);

  // Workout by day of week
  const dayOfWeek = currentDate.getDay();
  const workoutPlanByDay: Record<number, { title: string; focus: string; exercises: string[] }> = {
    0: { title: 'Descanso Ativo & Mobilidade', focus: 'Recuperação, alongamento e caminhada leve', exercises: ['Alongamento dinâmico (15 min)', 'Caminhada ao ar livre', 'Mobilidade de quadril'] },
    1: { title: 'Treino A: Peito & Tríceps', focus: 'Hipertrofia e força de empurrar', exercises: ['Supino Reto com Barra (4x10)', 'Supino Inclinado com Halteres (3x12)', 'Crucifixo na Polia (3x15)', 'Tríceps Corda (4x12)'] },
    2: { title: 'Treino B: Costas & Bíceps', focus: 'Largura dorsal e puxadas', exercises: ['Puxada Alta Frontal (4x10)', 'Remada Curvada com Barra (4x10)', 'Remada Baixa Triângulo (3x12)', 'Rosca Direta W (4x10)'] },
    3: { title: 'Treino C: Pernas & Panturrilhas', focus: 'Membros inferiores e força base', exercises: ['Agachamento Livre (4x8-10)', 'Leg Press 45° (4x12)', 'Cadeira Extensora (3x15)', 'Elevação de Panturrilha em Pé (4x20)'] },
    4: { title: 'Treino D: Ombros & Trapézio', focus: 'Deltóides completos e estabilidade', exercises: ['Desenvolvimento Militar com Halteres (4x10)', 'Elevação Lateral na Polia (4x15)', 'Crucifixo Invertido (3x12)', 'Encolhimento (4x15)'] },
    5: { title: 'Treino E: Braços & Abdômen', focus: 'Isolamento de bíceps, tríceps e core', exercises: ['Super-série Rosca Alternada + Tríceps Francês (4x12)', 'Rosca Martelo (3x12)', 'Tríceps Testa (3x12)', 'Prancha Abdominal (4x1 min)'] },
    6: { title: 'Cardio & Queima Intensa', focus: 'Condicionamento aeróbico e resistência', exercises: ['Corrida moderada (5km)', 'Bicicleta ergométrica (20 min)', 'Abdominal Supra e Infra (4x20)'] },
  };
  const todaysWorkout = workoutPlanByDay[dayOfWeek];

  const totalHabits = habits.length;
  const completedHabits = habits.filter(h => habitLogs.some(l => l.habit_id === h.id && l.date === dateStr && l.completed)).length;
  const overallScore = Math.min(100, Math.round(
    ((completedDayTasks.length + (guitarPracticed ? 1 : 0) + (englishCompleted ? 1 : 0) + (spiritualDone ? 1 : 0) + completedHabits) /
      Math.max(1, dayTasks.length + 3 + totalHabits)) * 100
  ));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', width: '100%', maxWidth: '100%' }}>
      {/* ── Date Navigation Strip ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          padding: '16px 20px',
          backgroundColor: 'var(--surface-card)',
          borderRadius: 'var(--border-radius-lg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 46, height: 46, borderRadius: '14px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
          }}>
            <Sun size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                {isToday ? 'Meu Dia — Central de Evolução' : 'Visão do Dia'}
              </h1>
              {isToday && <Badge variant="primary" size="sm">Hoje</Badge>}
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'capitalize' }}>
              {format(currentDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(subDays(currentDate, 1))}>
            <ChevronLeft size={16} /> Ontem
          </Button>
          {!isToday && (
            <Button variant="primary" size="sm" onClick={() => setCurrentDate(new Date())}>
              Voltar para Hoje
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(addDays(currentDate, 1))}>
            Amanhã <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {/* ── Summary Progress & Hydration Banners ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 'var(--space-4)' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>
              🎯 Conclusão Geral do Dia
            </span>
            <Badge variant="success" size="sm">{overallScore}%</Badge>
          </div>
          <ProgressBar value={overallScore} color="var(--color-primary-600)" />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            <span>{completedDayTasks.length}/{dayTasks.length} tarefas</span>
            <span>{completedHabits}/{totalHabits} hábitos</span>
            <span>{guitarPracticed ? '🎸 Feito' : '🎸 Pendente'}</span>
            <span>{englishCompleted ? '🌍 Feito' : '🌍 Pendente'}</span>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Droplets size={15} style={{ color: '#0284c7' }} /> Hidratação Diária
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {waterGlasses * 250}ml / 2500ml
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ProgressBar value={Math.min(100, Math.round(((waterGlasses * 250) / 2500) * 100))} color="#0284c7" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setWaterGlasses(prev => prev + 1);
                addToast({ type: 'success', title: `Hidratação registrada! (${(waterGlasses + 1) * 250}ml)` });
              }}
              style={{ whiteSpace: 'nowrap', padding: '5px 10px', fontSize: '0.75rem', fontWeight: 700 }}
            >
              +250ml
            </Button>
          </div>
        </Card>
      </div>

      {/* ── Mode Selection Tabs (Modules, Catholic Faith, Transformation Protocols, Business & News) ── */}
      <div style={{
        display: 'flex',
        gap: 8,
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: 8,
        overflowX: 'auto',
      }}>
        <button
          onClick={() => setActiveTab('routine')}
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.82rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: activeTab === 'routine' ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 'var(--surface-card)',
            color: activeTab === 'routine' ? '#ffffff' : 'var(--text-secondary)',
            whiteSpace: 'nowrap',
            transition: 'all 0.18s ease',
            boxShadow: activeTab === 'routine' ? '0 2px 8px rgba(59, 130, 246, 0.35)' : 'none',
          }}
        >
          <Clock size={16} /> ⏰ Rotina & Horários (O Que Fazer)
        </button>

        <button
          onClick={() => setActiveTab('modules')}
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.82rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: activeTab === 'modules' ? 'var(--color-primary-600)' : 'var(--surface-card)',
            color: activeTab === 'modules' ? '#ffffff' : 'var(--text-secondary)',
            whiteSpace: 'nowrap',
            transition: 'all 0.18s ease',
          }}
        >
          <Compass size={16} /> Síntese dos Módulos
        </button>

        <button
          onClick={() => setActiveTab('catholic')}
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.82rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: activeTab === 'catholic' ? 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)' : 'var(--surface-card)',
            color: activeTab === 'catholic' ? '#ffffff' : 'var(--text-secondary)',
            whiteSpace: 'nowrap',
            transition: 'all 0.18s ease',
          }}
        >
          <Church size={16} /> ✝️ Vida Católica & Pregações
        </button>

        <button
          onClick={() => setActiveTab('transformation')}
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.82rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: activeTab === 'transformation' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'var(--surface-card)',
            color: activeTab === 'transformation' ? '#ffffff' : 'var(--text-secondary)',
            whiteSpace: 'nowrap',
            transition: 'all 0.18s ease',
          }}
        >
          <Shield size={16} /> ⚡ Postura, Pele & Força
        </button>

        <button
          onClick={() => setActiveTab('business')}
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.82rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: activeTab === 'business' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'var(--surface-card)',
            color: activeTab === 'business' ? '#ffffff' : 'var(--text-secondary)',
            whiteSpace: 'nowrap',
            transition: 'all 0.18s ease',
          }}
        >
          <TrendingUp size={16} /> 🚀 Radar 24h & Negócios
        </button>
      </div>

      {/* ── TAB 0: DAILY SCHEDULE ROUTINE & ORDER OF PRIORITIES ── */}
      {activeTab === 'routine' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Hero Banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(37, 99, 235, 0.05) 100%)',
            borderRadius: 'var(--border-radius-lg)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: '14px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.35)'
                }}>
                  <Clock size={24} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                      Rotina Estruturada do Dia — O Que Fazer Primeiro
                    </h2>
                    <Badge variant="primary" size="sm">Cronograma Estratégico</Badge>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    Horários sugeridos, ordem de prioridades inegociáveis e rituais biológicos, espirituais e de foco para vencer o dia sem ansiedade.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, backgroundColor: 'var(--surface-card)', padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Progresso da Rotina
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {completedRoutineBlocks.length} de {dailyScheduleRoutine.length} Blocos
                  </div>
                </div>
                <div style={{ width: 100 }}>
                  <ProgressBar value={completedRoutineBlocks.length} max={dailyScheduleRoutine.length} />
                </div>
              </div>
            </div>

            {/* Filter buttons for morning / afternoon / evening */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: '1px solid var(--border-color)', paddingTop: 14 }}>
              <button
                onClick={() => setRoutinePeriodFilter('all')}
                style={{
                  padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontSize: '0.78rem', fontWeight: 700,
                  backgroundColor: routinePeriodFilter === 'all' ? 'var(--color-primary-600)' : 'var(--surface-card)',
                  color: routinePeriodFilter === 'all' ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease',
                }}
              >
                Todos os Blocos ({dailyScheduleRoutine.length})
              </button>
              <button
                onClick={() => setRoutinePeriodFilter('manha')}
                style={{
                  padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontSize: '0.78rem', fontWeight: 700,
                  backgroundColor: routinePeriodFilter === 'manha' ? '#f59e0b' : 'var(--surface-card)',
                  color: routinePeriodFilter === 'manha' ? '#ffffff' : 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.15s ease',
                }}
              >
                <Sun size={14} /> 🌅 Manhã: Foco & Vitória (06h - 12h)
              </button>
              <button
                onClick={() => setRoutinePeriodFilter('tarde')}
                style={{
                  padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontSize: '0.78rem', fontWeight: 700,
                  backgroundColor: routinePeriodFilter === 'tarde' ? '#3b82f6' : 'var(--surface-card)',
                  color: routinePeriodFilter === 'tarde' ? '#ffffff' : 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.15s ease',
                }}
              >
                <Zap size={14} /> ☀️ Tarde: Execução & Habilidades (12h - 18h)
              </button>
              <button
                onClick={() => setRoutinePeriodFilter('noite')}
                style={{
                  padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontSize: '0.78rem', fontWeight: 700,
                  backgroundColor: routinePeriodFilter === 'noite' ? '#a855f7' : 'var(--surface-card)',
                  color: routinePeriodFilter === 'noite' ? '#ffffff' : 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.15s ease',
                }}
              >
                <Moon size={14} /> 🌙 Noite: Desaceleração, Alma & Sono (18h - 22h30)
              </button>
            </div>
          </div>

          {/* Routine Blocks Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {dailyScheduleRoutine
              .filter(b => routinePeriodFilter === 'all' || b.period === routinePeriodFilter)
              .map(block => {
                const isCompleted = completedRoutineBlocks.includes(block.id);
                const priorityStyles: Record<string, { bg: string; text: string; border: string }> = {
                  'Prioridade 1': { bg: 'rgba(239, 68, 68, 0.12)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.35)' },
                  'Prioridade 2': { bg: 'rgba(245, 158, 11, 0.12)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.35)' },
                  'Prioridade 3': { bg: 'rgba(59, 130, 246, 0.12)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.35)' },
                  'Hábito Chave': { bg: 'rgba(168, 85, 247, 0.12)', text: '#a855f7', border: 'rgba(168, 85, 247, 0.35)' },
                  'Manutenção': { bg: 'rgba(16, 185, 129, 0.12)', text: '#10b981', border: 'rgba(16, 185, 129, 0.35)' },
                };
                const pStyle = priorityStyles[block.priorityBadge] || priorityStyles['Manutenção'];

                return (
                  <div
                    key={block.id}
                    style={{
                      backgroundColor: 'var(--surface-card)',
                      borderRadius: 'var(--border-radius-lg)',
                      border: `1px solid ${isCompleted ? 'var(--color-success-border)' : 'var(--border-color)'}`,
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 14,
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'all 0.2s ease',
                      opacity: isCompleted ? 0.88 : 1,
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: '8px',
                          backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-700)',
                          fontWeight: 800, fontSize: '0.82rem',
                          display: 'flex', alignItems: 'center', gap: 5,
                          border: '1px solid var(--color-primary-200)',
                        }}>
                          <Clock size={13} /> {block.timeRange}
                        </span>

                        <span style={{
                          padding: '3px 8px', borderRadius: '6px',
                          backgroundColor: pStyle.bg, color: pStyle.text,
                          fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase',
                          border: `1px solid ${pStyle.border}`,
                        }}>
                          {block.priorityBadge}
                        </span>

                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>
                          Passo {block.order} • {block.period === 'manha' ? '🌅 Manhã' : block.period === 'tarde' ? '☀️ Tarde' : '🌙 Noite'}
                        </span>
                      </div>

                      <Button
                        variant={isCompleted ? 'outline' : 'primary'}
                        size="sm"
                        onClick={() => handleToggleRoutineBlock(block.id)}
                        style={{ fontSize: '0.78rem' }}
                      >
                        {isCompleted ? <Check size={14} /> : <CheckCircle2 size={14} />}
                        {isCompleted ? 'Bloco Concluído' : 'Marcar Feito'}
                      </Button>
                    </div>

                    <div>
                      <h3 style={{
                        fontSize: '1.05rem', fontWeight: 800, margin: '0 0 4px',
                        color: isCompleted ? 'var(--text-secondary)' : 'var(--text-primary)',
                        textDecoration: isCompleted ? 'line-through' : 'none'
                      }}>
                        {block.order}. {block.title}
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {block.subtitle}
                      </p>
                    </div>

                    {/* Action Items Checklist */}
                    <div style={{
                      backgroundColor: 'var(--surface-bg)',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      border: '1px solid var(--border-color)',
                    }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 8 }}>
                        O que fazer neste bloco:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {block.actionItems.map((action, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                            <span style={{ color: '#22c55e', marginTop: 2 }}>✓</span>
                            <span>{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dica de Ouro & Por que importa */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
                      <div style={{
                        padding: '10px 14px', borderRadius: '8px',
                        backgroundColor: 'rgba(245, 158, 11, 0.08)',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45
                      }}>
                        <strong style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                          💡 Dica de Ouro:
                        </strong>
                        {block.goldenTip}
                      </div>

                      <div style={{
                        padding: '10px 14px', borderRadius: '8px',
                        backgroundColor: 'var(--surface-bg)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45
                      }}>
                        <strong style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                          ⚡ Por que importa:
                        </strong>
                        {block.whyItMatters}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Daily Golden Tips for Skin, Posture & High Energy */}
          <div style={{
            backgroundColor: 'var(--surface-card)', borderRadius: 'var(--border-radius-lg)',
            border: '1px solid var(--border-color)', padding: '24px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Dicas de Ouro para Melhorar o Dia, Postura & Pele
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Recomendações fundamentadas em ciência e rotina prática para você evoluir diariamente
                  </span>
                </div>
              </div>
              <Badge variant="primary" size="sm">Ciência & Prática</Badge>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
              {dailyGoldenTips.map(tip => {
                const catColors: Record<string, { bg: string; text: string; border: string }> = {
                  pele: { bg: 'rgba(236, 72, 153, 0.1)', text: '#ec4899', border: 'rgba(236, 72, 153, 0.3)' },
                  energia: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' },
                  postura: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' },
                  foco: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' },
                };
                const c = catColors[tip.category] || catColors.foco;

                return (
                  <div
                    key={tip.id}
                    style={{
                      padding: '16px', borderRadius: '12px',
                      backgroundColor: 'var(--surface-bg)',
                      border: '1px solid var(--border-color)',
                      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                      gap: 10,
                    }}
                  >
                    <div>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase',
                        padding: '2px 8px', borderRadius: '4px',
                        backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}`
                      }}>
                        {tip.category}
                      </span>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 800, margin: '8px 0 6px', color: 'var(--text-primary)' }}>
                        {tip.title}
                      </h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                        {tip.tip}
                      </p>
                    </div>

                    <div style={{
                      padding: '8px 12px', borderRadius: '8px',
                      backgroundColor: 'var(--surface-card)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.74rem', color: 'var(--text-primary)',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      <span style={{ color: '#f59e0b', fontWeight: 800 }}>⚡ Ação Imediata:</span>
                      <span>{tip.quickAction}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 1: ALL MODULES SYNTHESIS ── */}
      {activeTab === 'modules' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: 'var(--space-6)',
          }}>
          {/* GUITAR */}
          <div style={{
            backgroundColor: 'var(--surface-card)', borderRadius: 'var(--border-radius-lg)',
            border: '1px solid rgba(245, 158, 11, 0.3)', padding: '20px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #f59e0b, #d97706)' }} />
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Music2 size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Prática de Violão</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Música & Dedilhado de Hoje</span>
                  </div>
                </div>
                <Badge variant={guitarPracticed ? 'success' : 'warning'} size="sm">{guitarPracticed ? 'Praticado Hoje' : 'Praticar Hoje'}</Badge>
              </div>
              <div style={{ backgroundColor: 'var(--surface-bg)', borderRadius: 'var(--border-radius-md)', padding: '12px 14px', border: '1px solid var(--border-color)', marginBottom: 14 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>🎵 Música: *Dust in the Wind* — Kansas</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 6 }}>🖐️ **Técnica:** Dedilhado Travis Picking (C, Cmaj7, Cadd9, Am).</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>⚡ **Solo:** *Hotel California* (Eagles) — Bends em Si menor.</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Button variant={guitarPracticed ? 'outline' : 'primary'} size="sm" onClick={() => handleToggleActivity('guitar')} style={{ flex: 1, fontSize: '0.78rem' }}>
                {guitarPracticed ? <Check size={14} /> : <CheckCircle2 size={14} />} {guitarPracticed ? 'Concluído' : 'Marcar Praticado'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/guitar')} style={{ fontSize: '0.78rem', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.4)' }}>
                Acessar Módulo <ArrowRight size={14} />
              </Button>
            </div>
          </div>

          {/* ENGLISH */}
          <div style={{
            backgroundColor: 'var(--surface-card)', borderRadius: 'var(--border-radius-lg)',
            border: '1px solid rgba(99, 102, 241, 0.3)', padding: '20px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #6366f1, #4f46e5)' }} />
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Globe size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Aprender Inglês</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Palavra & Música do Dia</span>
                  </div>
                </div>
                <Badge variant={englishCompleted ? 'success' : 'primary'} size="sm">{englishCompleted ? 'Lição Concluída' : 'Estudar Hoje'}</Badge>
              </div>
              <div style={{ backgroundColor: 'var(--surface-bg)', borderRadius: 'var(--border-radius-md)', padding: '12px 14px', border: '1px solid var(--border-color)', marginBottom: 14 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>📖 Palavra: **Overwhelmed** /ˌōvərˈ(h)welmd/</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 6 }}>💬 *Significado:* Sobrecarregado — *"Take a deep breath when you feel overwhelmed."*</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>🎵 **Música:** *"Viva La Vida"* — Coldplay • Idiom: *"Break a leg"*</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Button variant={englishCompleted ? 'outline' : 'primary'} size="sm" onClick={() => handleToggleActivity('english')} style={{ flex: 1, fontSize: '0.78rem' }}>
                {englishCompleted ? <Check size={14} /> : <CheckCircle2 size={14} />} {englishCompleted ? 'Concluído' : 'Marcar Concluído'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/english')} style={{ fontSize: '0.78rem', color: '#6366f1', borderColor: 'rgba(99, 102, 241, 0.4)' }}>
                Acessar Módulo <ArrowRight size={14} />
              </Button>
            </div>
          </div>

          {/* WORKOUT */}
          <div style={{
            backgroundColor: 'var(--surface-card)', borderRadius: 'var(--border-radius-lg)',
            border: '1px solid rgba(239, 68, 68, 0.3)', padding: '20px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #ef4444, #b91c1c)' }} />
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Dumbbell size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Academia & Treino</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ficha programada para hoje</span>
                  </div>
                </div>
                <Badge variant="danger" size="sm">{todaysWorkout.title.split(':')[0]}</Badge>
              </div>
              <div style={{ backgroundColor: 'var(--surface-bg)', borderRadius: 'var(--border-radius-md)', padding: '12px 14px', border: '1px solid var(--border-color)', marginBottom: 14 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>💪 {todaysWorkout.title}</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: 10 }}>{todaysWorkout.focus}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {todaysWorkout.exercises.slice(0, 4).map((ex, i) => {
                    const guide = findExerciseGuide(ex);
                    return (
                      <div
                        key={i}
                        style={{
                          fontSize: '0.75rem', color: 'var(--text-primary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '4px 6px', borderRadius: '6px',
                          backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-color)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
                          <span style={{ color: '#ef4444' }}>•</span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedExerciseGuide(guide)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 4,
                            color: '#ef4444', fontWeight: 700, fontSize: '0.7rem',
                            padding: '2px 6px', borderRadius: '4px',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            flexShrink: 0
                          }}
                          title="Ver tutorial de execução correta e vídeo"
                        >
                          <HelpCircle size={12} /> Como Fazer
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Button variant="outline" size="sm" onClick={() => handleToggleActivity('posture')} style={{ flex: 1, fontSize: '0.78rem' }}>
                <CheckCircle2 size={14} /> Registrar Treino Feito
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/fitness')} style={{ fontSize: '0.78rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
                Ver Treinos <ArrowRight size={14} />
              </Button>
            </div>
          </div>

          {/* TASKS */}
          <div style={{
            backgroundColor: 'var(--surface-card)', borderRadius: 'var(--border-radius-lg)',
            border: '1px solid var(--border-color)', padding: '20px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Tarefas do Dia</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Foco para hoje</span>
                  </div>
                </div>
                <Badge variant="primary" size="sm">{completedDayTasks.length}/{dayTasks.length}</Badge>
              </div>

              <form onSubmit={handleAddTask} style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                <input
                  type="text" className="input" placeholder="Nova tarefa rápida para hoje..."
                  value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)}
                  style={{ height: 36, fontSize: '0.82rem' }}
                />
                <Button type="submit" variant="primary" size="sm" style={{ padding: '0 12px' }}>
                  <Plus size={16} />
                </Button>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: '180px', overflowY: 'auto' }}>
                {dayTasks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                    <CheckCircle2 size={28} style={{ color: '#16a34a', margin: '0 auto 6px' }} />
                    Nenhuma tarefa pendente para hoje!
                  </div>
                ) : (
                  dayTasks.slice(0, 4).map(task => {
                    const isDone = task.status === 'completed';
                    return (
                      <div
                        key={task.id} onClick={() => handleToggleTask(task)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '8px 10px', borderRadius: '8px',
                          backgroundColor: isDone ? 'var(--color-neutral-100)' : 'var(--surface-bg)',
                          border: '1px solid var(--border-color)', cursor: 'pointer',
                        }}
                      >
                        <div style={{ color: isDone ? '#16a34a' : 'var(--text-tertiary)' }}>
                          {isDone ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                        </div>
                        <span style={{
                          fontSize: '0.82rem', fontWeight: 600, flex: 1,
                          textDecoration: isDone ? 'line-through' : 'none',
                          color: isDone ? 'var(--text-tertiary)' : 'var(--text-primary)',
                        }}>
                          {task.title}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <Button variant="outline" size="sm" onClick={() => navigate('/tasks')} style={{ width: '100%', fontSize: '0.78rem' }}>
                Ver Todas as Tarefas <ArrowRight size={14} />
              </Button>
            </div>
          </div>

          {/* CALENDAR */}
          <div style={{
            backgroundColor: 'var(--surface-card)', borderRadius: 'var(--border-radius-lg)',
            border: '1px solid var(--border-color)', padding: '20px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CalendarDays size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Compromissos</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Agenda do dia</span>
                  </div>
                </div>
                <Badge variant="secondary" size="sm">{dayEvents.length} evento(s)</Badge>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: '180px', overflowY: 'auto' }}>
                {dayEvents.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                    <CalendarDays size={28} style={{ color: '#06b6d4', margin: '0 auto 6px' }} />
                    Sem reuniões agendadas hoje. Dia livre para foco profundo!
                  </div>
                ) : (
                  dayEvents.map(evt => (
                    <div key={evt.id} style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: 'var(--surface-bg)', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{evt.title}</span>
                        {evt.start_time && <span style={{ fontSize: '0.75rem', color: '#06b6d4', fontWeight: 600 }}>{evt.start_time}</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <Button variant="outline" size="sm" onClick={() => navigate('/calendar')} style={{ width: '100%', fontSize: '0.78rem' }}>
                Ver Calendário Completo <ArrowRight size={14} />
              </Button>
            </div>
          </div>

          {/* HABITS */}
          <div style={{
            backgroundColor: 'var(--surface-card)', borderRadius: 'var(--border-radius-lg)',
            border: '1px solid var(--border-color)', padding: '20px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Flame size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Hábitos & Rotinas</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Checklist de consistência</span>
                  </div>
                </div>
                <Badge variant="success" size="sm">{completedHabits}/{totalHabits}</Badge>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: '180px', overflowY: 'auto' }}>
                {habits.slice(0, 4).map(habit => {
                  const isLogged = habitLogs.some(l => l.habit_id === habit.id && l.date === dateStr && l.completed);
                  return (
                    <div
                      key={habit.id} onClick={() => handleToggleHabit(habit.id)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 10px', borderRadius: '8px',
                        backgroundColor: isLogged ? 'rgba(16, 185, 129, 0.08)' : 'var(--surface-bg)',
                        border: `1px solid ${isLogged ? 'rgba(16, 185, 129, 0.25)' : 'var(--border-color)'}`,
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ color: isLogged ? '#10b981' : 'var(--text-tertiary)' }}>
                          {isLogged ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                        </div>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{habit.name}</span>
                      </div>
                      <Flame size={14} style={{ color: isLogged ? '#f59e0b' : 'var(--text-tertiary)' }} />
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <Button variant="outline" size="sm" onClick={() => navigate('/habits')} style={{ width: '100%', fontSize: '0.78rem' }}>
                Gerenciar Hábitos <ArrowRight size={14} />
              </Button>
            </div>
          </div>

          {/* MEALS */}
          <div style={{
            backgroundColor: 'var(--surface-card)', borderRadius: 'var(--border-radius-lg)',
            border: '1px solid var(--border-color)', padding: '20px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'rgba(132, 204, 22, 0.15)', color: '#84cc16', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UtensilsCrossed size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Alimentação do Dia</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Refeições planejadas</span>
                  </div>
                </div>
                <Badge variant="secondary" size="sm">Nutrição</Badge>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: 'var(--surface-bg)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700 }}>
                    <span>Café da Manhã</span><span style={{ color: 'var(--text-secondary)' }}>08:00</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ovos mexidos, torrada integral e café preto</div>
                </div>
                <div style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: 'var(--surface-bg)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700 }}>
                    <span>Almoço Balanceado</span><span style={{ color: 'var(--text-secondary)' }}>12:30</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Peito de frango grelhado, arroz integral e salada</div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <Button variant="outline" size="sm" onClick={() => navigate('/nutrition')} style={{ width: '100%', fontSize: '0.78rem' }}>
                Ver Cardápio Completo <ArrowRight size={14} />
              </Button>
            </div>
          </div>

          {/* FINANCES */}
          <div style={{
            backgroundColor: 'var(--surface-card)', borderRadius: 'var(--border-radius-lg)',
            border: '1px solid var(--border-color)', padding: '20px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DollarSign size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Finanças do Dia</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Gastos registrados</span>
                  </div>
                </div>
                <Badge variant={totalDaySpent > 0 ? 'warning' : 'secondary'} size="sm">R$ {totalDaySpent.toFixed(2)}</Badge>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: '180px', overflowY: 'auto' }}>
                {dayFinances.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                    <DollarSign size={28} style={{ color: '#22c55e', margin: '0 auto 6px' }} />
                    Nenhum gasto registrado nesta data. Excelente controle!
                  </div>
                ) : (
                  dayFinances.map(f => (
                    <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: '8px', backgroundColor: 'var(--surface-bg)', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{f.description}</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: f.type === 'expense' ? '#ef4444' : '#22c55e' }}>
                        {f.type === 'expense' ? '-' : '+'} R$ {f.amount.toFixed(2)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <Button variant="outline" size="sm" onClick={() => navigate('/finance')} style={{ width: '100%', fontSize: '0.78rem' }}>
                Gerenciar Finanças <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        </div>

        {/* ── DAILY HIGH-IMPACT GOALS & GROWTH CHALLENGES ── */}
        <div style={{
          backgroundColor: 'var(--surface-card)', borderRadius: 'var(--border-radius-lg)',
          border: '1px solid var(--border-color)', padding: '24px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Metas de Alto Impacto para Alcançar no Dia
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Desafios práticos para você fazer coisas diferentes e evoluir física, mental, espiritual e financeiramente
                </span>
              </div>
            </div>
            <Badge variant="success" size="sm">
              {completedGoals.length}/{dailyHighImpactGoals.length} Metas Cumpridas
            </Badge>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            {dailyHighImpactGoals.map(goal => {
              const isDone = completedGoals.includes(goal.id);
              const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
                espiritual: { bg: 'rgba(168, 85, 247, 0.1)', text: '#a855f7', border: 'rgba(168, 85, 247, 0.3)' },
                foco: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' },
                postura: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' },
                posture: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' },
                pele: { bg: 'rgba(236, 72, 153, 0.12)', text: '#ec4899', border: 'rgba(236, 72, 153, 0.35)' },
                financeiro: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e', border: 'rgba(34, 197, 94, 0.3)' },
                habilidade: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' },
                energia: { bg: 'rgba(234, 88, 12, 0.1)', text: '#ea580c', border: 'rgba(234, 88, 12, 0.3)' },
              };
              const c = categoryColors[goal.category] || categoryColors.foco;

              return (
                <div
                  key={goal.id}
                  style={{
                    padding: '14px', borderRadius: '10px',
                    backgroundColor: isDone ? 'var(--color-neutral-100)' : 'var(--surface-bg)',
                    border: `1px solid ${isDone ? 'var(--color-success-border)' : 'var(--border-color)'}`,
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase',
                        padding: '2px 8px', borderRadius: '4px',
                        backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}`
                      }}>
                        {goal.category}
                      </span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f59e0b' }}>
                        +{goal.xpPoints} XP
                      </span>
                    </div>
                    <h4 style={{
                      fontSize: '0.88rem', fontWeight: 800, margin: '4px 0 6px',
                      color: isDone ? 'var(--text-tertiary)' : 'var(--text-primary)',
                      textDecoration: isDone ? 'line-through' : 'none'
                    }}>
                      {goal.title}
                    </h4>
                    <p style={{ fontSize: '0.77rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 10px' }}>
                      {goal.description}
                    </p>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontStyle: 'italic', marginBottom: 10 }}>
                      ⚡ <strong>Fruto:</strong> {goal.benefit}
                    </div>
                    <Button
                      variant={isDone ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => handleToggleDailyGoal(goal)}
                      style={{ width: '100%', fontSize: '0.76rem' }}
                    >
                      {isDone ? <Check size={14} /> : <CheckCircle2 size={14} />}
                      {isDone ? 'Meta Conquistada' : 'Marcar como Conquistada'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    )}

      {/* ── TAB 2: CATHOLIC FAITH & SERMONS ── */}
      {activeTab === 'catholic' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Saint of the day hero card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(124, 58, 237, 0.08) 100%)',
            borderRadius: 'var(--border-radius-lg)',
            border: '1px solid rgba(168, 85, 247, 0.35)',
            padding: '24px',
            position: 'relative',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <Badge variant="primary" size="sm" style={{ marginBottom: 8 }}>
                  ✝️ Liturgia Católica & Santoral
                </Badge>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '4px 0', color: 'var(--text-primary)' }}>
                  {catholicData.name}
                </h2>
                <span style={{ fontSize: '0.85rem', color: '#a855f7', fontWeight: 700 }}>
                  {catholicData.title} • Festa Litúrgica: {catholicData.feastDate}
                </span>
              </div>
              <Button
                variant={spiritualDone ? 'outline' : 'primary'}
                size="sm"
                onClick={() => handleToggleActivity('spiritual')}
              >
                {spiritualDone ? <Check size={16} /> : <Sparkles size={16} />}
                {spiritualDone ? 'Oração Registrada Hoje' : 'Rezar & Registrar Oração'}
              </Button>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 12 }}>
              {catholicData.history}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginTop: 16 }}>
              <div style={{ padding: '12px 14px', borderRadius: '10px', backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a855f7', textTransform: 'uppercase', marginBottom: 4 }}>
                  Virtude do Santo para Praticar Hoje
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {catholicData.virtue}
                </div>
              </div>

              <div style={{ padding: '12px 14px', borderRadius: '10px', backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#06b6d4', textTransform: 'uppercase', marginBottom: 4 }}>
                  📿 Mistério Recomendado para Hoje
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {catholicData.rosary.mysteryName} ({catholicData.rosary.days})
                </div>
              </div>
            </div>

            {/* Official Prayer Box */}
            <div style={{
              marginTop: 16, padding: '14px 16px', borderRadius: '10px',
              backgroundColor: 'var(--surface-card)', borderLeft: '4px solid #a855f7',
            }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                🙏 Oração ao Santo do Dia:
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0, lineHeight: 1.6 }}>
                "{catholicData.prayer}"
              </p>
            </div>
          </div>

          {/* ── EVANGELHO DO DIA POR COMPLETO ── */}
          <div style={{
            backgroundColor: 'var(--surface-card)',
            borderRadius: 'var(--border-radius-lg)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #8b5cf6, #6366f1)' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 42, height: 42, borderRadius: '12px', background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ScrollText size={22} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                      Evangelho do Dia por Completo
                    </h3>
                    <Badge variant="primary" size="sm">Lectio Divina</Badge>
                  </div>
                  <span style={{ fontSize: '0.82rem', color: '#8b5cf6', fontWeight: 700 }}>
                    📖 {catholicData.gospel.reference} — {catholicData.gospel.title}
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Liturgia da Igreja Católica Apostólica Romana
              </div>
            </div>

            {/* Verse Highlight Callout */}
            <div style={{
              padding: '12px 16px', borderRadius: '8px',
              backgroundColor: 'rgba(139, 92, 246, 0.08)', borderLeft: '4px solid #8b5cf6',
              marginBottom: 16, fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', fontStyle: 'italic'
            }}>
              "{catholicData.gospel.verseHighlight}"
            </div>

            {/* Complete Gospel Text */}
            <div style={{
              backgroundColor: 'var(--surface-bg)',
              borderRadius: 'var(--border-radius-md)',
              padding: '18px 20px',
              border: '1px solid var(--border-color)',
              marginBottom: 16,
            }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.5px' }}>
                Proclamação do Santo Evangelho de Jesus Cristo
              </div>
              <div style={{
                fontSize: '0.92rem',
                color: 'var(--text-primary)',
                lineHeight: 1.8,
                whiteSpace: 'pre-line',
                fontFamily: 'serif'
              }}>
                {catholicData.gospel.text}
              </div>
            </div>

            {/* Pastoral / Spiritual Reflection */}
            <div style={{
              padding: '14px 16px',
              borderRadius: '10px',
              backgroundColor: 'var(--surface-card)',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#8b5cf6', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} /> Meditação & Aplicação Prática para a sua Vida:
              </div>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {catholicData.gospel.reflection}
              </p>
            </div>
          </div>

          {/* ── OS 5 MISTÉRIOS DO SANTO TERÇO EM DETALHES COMPLETOS ── */}
          <div style={{
            backgroundColor: 'var(--surface-card)',
            borderRadius: 'var(--border-radius-lg)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #06b6d4, #3b82f6)' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 42, height: 42, borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Church size={22} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                      Os 5 Mistérios do Santo Terço em Detalhes
                    </h3>
                    <Badge variant="primary" size="sm">Contemplação das 5 Dezenas</Badge>
                  </div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Conheça exatamente o que meditar em cada Ave-Maria e qual fruto espiritual alcançar
                  </span>
                </div>
              </div>

              {/* Rosary Mystery Sets Switcher */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setSelectedRosaryTab('today')}
                  style={{
                    padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
                    cursor: 'pointer', border: '1px solid',
                    backgroundColor: selectedRosaryTab === 'today' ? '#06b6d4' : 'var(--surface-bg)',
                    color: selectedRosaryTab === 'today' ? '#ffffff' : 'var(--text-secondary)',
                    borderColor: selectedRosaryTab === 'today' ? '#06b6d4' : 'var(--border-color)',
                  }}
                >
                  Hoje: {catholicData.rosary.mysteryName.split(' ')[1]}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRosaryTab('joyful')}
                  style={{
                    padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
                    cursor: 'pointer', border: '1px solid',
                    backgroundColor: selectedRosaryTab === 'joyful' ? '#06b6d4' : 'var(--surface-bg)',
                    color: selectedRosaryTab === 'joyful' ? '#ffffff' : 'var(--text-secondary)',
                    borderColor: selectedRosaryTab === 'joyful' ? '#06b6d4' : 'var(--border-color)',
                  }}
                >
                  Gozosos
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRosaryTab('sorrowful')}
                  style={{
                    padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
                    cursor: 'pointer', border: '1px solid',
                    backgroundColor: selectedRosaryTab === 'sorrowful' ? '#06b6d4' : 'var(--surface-bg)',
                    color: selectedRosaryTab === 'sorrowful' ? '#ffffff' : 'var(--text-secondary)',
                    borderColor: selectedRosaryTab === 'sorrowful' ? '#06b6d4' : 'var(--border-color)',
                  }}
                >
                  Dolorosos
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRosaryTab('glorious')}
                  style={{
                    padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
                    cursor: 'pointer', border: '1px solid',
                    backgroundColor: selectedRosaryTab === 'glorious' ? '#06b6d4' : 'var(--surface-bg)',
                    color: selectedRosaryTab === 'glorious' ? '#ffffff' : 'var(--text-secondary)',
                    borderColor: selectedRosaryTab === 'glorious' ? '#06b6d4' : 'var(--border-color)',
                  }}
                >
                  Gloriosos
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRosaryTab('luminous')}
                  style={{
                    padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
                    cursor: 'pointer', border: '1px solid',
                    backgroundColor: selectedRosaryTab === 'luminous' ? '#06b6d4' : 'var(--surface-bg)',
                    color: selectedRosaryTab === 'luminous' ? '#ffffff' : 'var(--text-secondary)',
                    borderColor: selectedRosaryTab === 'luminous' ? '#06b6d4' : 'var(--border-color)',
                  }}
                >
                  Luminosos
                </button>
              </div>
            </div>

            {/* Active Mystery Header */}
            {(() => {
              const activeRosary = selectedRosaryTab === 'today'
                ? catholicData.rosary
                : allRosaryMysteries[selectedRosaryTab as keyof typeof allRosaryMysteries] || catholicData.rosary;

              return (
                <div>
                  <div style={{
                    padding: '12px 16px', borderRadius: '8px',
                    backgroundColor: 'rgba(6, 182, 212, 0.08)',
                    border: '1px solid rgba(6, 182, 212, 0.25)',
                    marginBottom: 16,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        📿 {activeRosary.mysteryName} — {activeRosary.days}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#06b6d4', fontWeight: 700 }}>
                        {activeRosary.mysteries.length} Mistérios Sagrados
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: 1.5 }}>
                      {activeRosary.intro}
                    </p>
                  </div>

                  {/* 5 Mysteries List Cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {activeRosary.mysteries.map(m => (
                      <div
                        key={m.number}
                        style={{
                          padding: '14px 16px',
                          borderRadius: '10px',
                          backgroundColor: 'var(--surface-bg)',
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                            {m.title}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#06b6d4', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(6, 182, 212, 0.1)' }}>
                            📖 {m.biblicalEvent}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>
                          <strong>O que contemplar na dezena:</strong> {m.contemplation}
                        </div>

                        <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span>🌿</span> Fruto Espiritual: {m.spiritualFruit}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Recommended Sermon & Daily Examination */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 'var(--space-6)' }}>
            {/* Sermon Card */}
            <Card title="Pregação Católica Recomendada" subtitle="Formação sólida para a sua caminhada">
              <div style={{ padding: '12px 14px', borderRadius: '10px', backgroundColor: 'var(--surface-bg)', border: '1px solid var(--border-color)', marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Badge variant="secondary" size="sm">{catholicData.sermonRecommendation.topic}</Badge>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    ⏱️ {catholicData.sermonRecommendation.duration}
                  </span>
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '4px 0 6px 0', color: 'var(--text-primary)' }}>
                  "{catholicData.sermonRecommendation.title}"
                </h4>
                <div style={{ fontSize: '0.8rem', color: '#a855f7', fontWeight: 700, marginBottom: 8 }}>
                  🎙️ {catholicData.sermonRecommendation.preacher}
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  {catholicData.sermonRecommendation.description}
                </p>
              </div>

              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(catholicData.sermonRecommendation.searchQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '10px 16px', borderRadius: '8px',
                  background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                  color: '#ffffff', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none',
                }}
              >
                Assistir Pregação no YouTube <ExternalLink size={14} />
              </a>
            </Card>

            {/* Daily Examen in 5 Steps */}
            <Card title="Exame de Consciência Diário" subtitle="5 passos para a sua oração noturna">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { step: '1. Gratidão', desc: 'Agradeça a Deus pelos dons e vitórias do dia.' },
                  { step: '2. Luz do Espírito', desc: 'Peça discernimento para ver seus pensamentos e atitudes com clareza.' },
                  { step: '3. Revisão do Dia', desc: 'Examine onde você amou a Deus e ao próximo, e onde caiu em pecado ou omissão.' },
                  { step: '4. Perdão e Contrição', desc: 'Peça perdão a Jesus de coração contrito com o Ato de Contrição.' },
                  { step: '5. Resolução para Amanhã', desc: 'Defina 1 ponto de melhoria concreta para vencer a fraqueza amanhã.' },
                ].map((item, idx) => (
                  <div key={idx} style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: 'var(--surface-bg)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a855f7' }}>{item.step}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── TAB 3: TRANSFORMATION PROTOCOLS (POSTURE, SKIN, STRENGTH) ── */}
      {activeTab === 'transformation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Daily Master Transformation Step-by-Step */}
          <div style={{
            backgroundColor: 'var(--surface-card)', borderRadius: 'var(--border-radius-lg)',
            border: '1px solid var(--border-color)', padding: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Plano de Evolução Diária Passo a Passo
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  A rotina que transforma sua postura, pele, força e mente dia após dia
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
              <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'var(--surface-bg)', border: '1px solid var(--border-color)' }}>
                <Badge variant="primary" size="sm" style={{ marginBottom: 6 }}>1. Manhã (Foco & Espírito)</Badge>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                  • 500ml de água com limão logo ao acordar.<br />
                  • Oração da manhã + alinhamento postural (Chin tuck 10x).<br />
                  • Skincare matinal (limpeza facial + protetor solar FPS 30+).
                </div>
              </div>

              <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'var(--surface-bg)', border: '1px solid var(--border-color)' }}>
                <Badge variant="danger" size="sm" style={{ marginBottom: 6 }}>2. Tarde (Construção & Força)</Badge>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                  • Blocos de trabalho focado sem distrações.<br />
                  • Treino de Força ({todaysWorkout.title}) com sobrecarga progressiva.<br />
                  • Ingestão de proteína (2g por kg de peso corporal).
                </div>
              </div>

              <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'var(--surface-bg)', border: '1px solid var(--border-color)' }}>
                <Badge variant="secondary" size="sm" style={{ marginBottom: 6 }}>3. Noite (Regeneração)</Badge>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                  • Skincare noturno (limpeza + hidratante reparador).<br />
                  • 15 minutos de leitura transformadora.<br />
                  • Exame de consciência católico + Santo Terço.
                </div>
              </div>
            </div>
          </div>

          {/* Protocols Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 'var(--space-6)' }}>
            {transformationProtocols.map(proto => (
              <Card
                key={proto.id}
                title={proto.title}
                subtitle={proto.subtitle}
                action={
                  <Badge variant={proto.category === 'posture' ? 'primary' : proto.category === 'skin' ? 'secondary' : 'danger'} size="sm">
                    {proto.category === 'posture' ? 'Postura' : proto.category === 'skin' ? 'Pele & Skincare' : 'Força & Músculos'}
                  </Badge>
                }
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                  {proto.instructions.map((inst, i) => (
                    <div key={i} style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.5, display: 'flex', gap: 8 }}>
                      <span style={{ color: 'var(--color-primary-600)', fontWeight: 800 }}>✓</span>
                      <span>{inst}</span>
                    </div>
                  ))}
                </div>

                <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: 'var(--surface-bg)', border: '1px solid var(--border-color)', marginBottom: 12 }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>BENEFÍCIO REAL:</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 600 }}>{proto.benefit}</div>
                </div>

                {(() => {
                  const isDone = proto.category === 'posture' ? postureDone : proto.category === 'skin' ? skincareDone : false;
                  return (
                    <Button
                      variant={isDone ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => handleToggleActivity(proto.category === 'posture' ? 'posture' : proto.category === 'skin' ? 'skincare' : 'posture')}
                      style={{ width: '100%', fontSize: '0.78rem' }}
                    >
                      {isDone ? <Check size={14} /> : <CheckCircle2 size={14} />}
                      {isDone ? 'Concluído Hoje' : 'Marcar como Feito Hoje'}
                    </Button>
                  );
                })()}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: 24H NEWS RADAR & BUSINESS OPPORTUNITIES ── */}
      {activeTab === 'business' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Breaking 24h News */}
          <div style={{
            backgroundColor: 'var(--surface-card)', borderRadius: 'var(--border-radius-lg)',
            border: '1px solid var(--border-color)', padding: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 38, height: 38, borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Newspaper size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Radar de Notícias & Tendências das Últimas 24h
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Fatos importantes resumidos para você tomar decisões inteligentes sem perder tempo
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
              {curatedNews24h.map(news => (
                <div key={news.id} style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'var(--surface-bg)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <Badge variant="success" size="sm">{news.category}</Badge>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>⏱️ {news.readTime}</span>
                    </div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, margin: '6px 0', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      {news.headline}
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 10px 0' }}>
                      {news.summary}
                    </p>
                  </div>
                  <div style={{ padding: '6px 10px', borderRadius: '6px', backgroundColor: 'var(--surface-card)', borderLeft: '3px solid #10b981', fontSize: '0.74rem', color: 'var(--text-primary)' }}>
                    💡 <strong>Impacto:</strong> {news.impact}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Business & Wealth Creation Opportunities */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 'var(--space-6)' }}>
            {businessIdeasCatalog.map(biz => (
              <Card
                key={biz.id}
                title={biz.title}
                subtitle={`Capital Inicial: ${biz.initialCapital}`}
                action={<Badge variant="success" size="sm">{biz.potentialROI.split(' ')[0]}</Badge>}
              >
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
                  {biz.description}
                </p>

                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Passos para Executar Ainda Este Ano:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
                  {biz.actionSteps.map((step, sIdx) => (
                    <div key={sIdx} style={{ fontSize: '0.76rem', color: 'var(--text-primary)', padding: '5px 8px', borderRadius: '6px', backgroundColor: 'var(--surface-bg)' }}>
                      {step}
                    </div>
                  ))}
                </div>

                {/* Recommended Book */}
                <div style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <BookOpen size={13} /> Leitura Recomendada
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
                    "{biz.recommendedBook.title}" — {biz.recommendedBook.author}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    {biz.recommendedBook.keyTakeaway}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── EXERCISE EXECUTION & VIDEO TUTORIAL MODAL ── */}
      {selectedExerciseGuide && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedExerciseGuide(null)}
          title={`Como Executar: ${selectedExerciseGuide.name}`}
          size="lg"
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: 8 }}>
              <Button variant="ghost" onClick={() => setSelectedExerciseGuide(null)}>
                Fechar Guia
              </Button>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedExerciseGuide.videoQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 16px', borderRadius: '8px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#ffffff', fontWeight: 700, fontSize: '0.82rem',
                  textDecoration: 'none', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                }}
              >
                <Play size={15} /> Assistir Vídeo Tutorial no YouTube <ExternalLink size={14} />
              </a>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Target muscle badge banner */}
            <div style={{
              padding: '12px 14px', borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase' }}>
                  🎯 MÚSCULOS ALVO PRINCIPAIS:
                </span>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {selectedExerciseGuide.targetMuscles}
                </div>
              </div>
              <Badge variant="danger" size="sm">
                {selectedExerciseGuide.defaultSetsReps}
              </Badge>
            </div>

            {/* Step-by-step form */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={16} style={{ color: '#16a34a' }} /> Passo a Passo da Postura e Execução Correta:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {selectedExerciseGuide.instructions.map((step, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '8px 12px', borderRadius: '6px',
                      backgroundColor: 'var(--surface-bg)', border: '1px solid var(--border-color)',
                      fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.5
                    }}
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>

            {/* Common dangerous mistakes */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Shield size={16} /> Erros Comuns e Perigosos a Evitar:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {selectedExerciseGuide.mistakesToAvoid.map((mistake, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '8px 12px', borderRadius: '6px',
                      backgroundColor: 'rgba(239, 68, 68, 0.05)', borderLeft: '3px solid #ef4444',
                      fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5
                    }}
                  >
                    ⚠️ {mistake}
                  </div>
                ))}
              </div>
            </div>

            {/* Breathing tip */}
            <div style={{
              padding: '10px 14px', borderRadius: '8px',
              backgroundColor: 'var(--surface-bg)', border: '1px solid var(--border-color)',
              fontSize: '0.8rem', color: 'var(--text-secondary)'
            }}>
              🌬️ <strong>Como respirar durante o movimento:</strong> {selectedExerciseGuide.breathingTip}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
