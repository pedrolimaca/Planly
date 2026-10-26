import { useState, useEffect, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  CheckSquare, Calendar, Flame, DollarSign, ArrowUpRight,
  ArrowDownRight, CheckCircle2, Clock, Sparkles,
  TrendingUp, Dumbbell, BookOpen, Church, ChevronRight
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import ProgressBar from '../components/common/ProgressBar';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getAllItems, updateItem } from '../services/storage';
import { getGreeting, getRandomMessage } from '../config/app';
import type { Task, CalendarEvent, Habit, HabitLog, FinanceEntry, Goal } from '../types';

export default function DashboardPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [, startTransition] = useTransition();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [finance, setFinance] = useState<FinanceEntry[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [quote] = useState(() => getRandomMessage());

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const greeting = getGreeting(new Date().getHours());

  const loadData = () => {
    if (!user) return;
    setTasks(getAllItems<Task>('tasks', user.id));
    setEvents(getAllItems<CalendarEvent>('events', user.id));
    setHabits(getAllItems<Habit>('habits', user.id));
    setHabitLogs(getAllItems<HabitLog>('habit_logs', user.id));
    setFinance(getAllItems<FinanceEntry>('finance', user.id));
    setGoals(getAllItems<Goal>('goals', user.id));
  };

  useEffect(() => {
    loadData();
  }, [user]);

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

  // Calculations
  const pendingTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled');
  const todayTasks = tasks.filter(t => t.due_date === todayStr || t.status === 'in_progress');
  const completedTodayTasks = tasks.filter(t => t.status === 'completed' && t.completed_at?.startsWith(todayStr));

  const todayLogs = habitLogs.filter(l => l.date === todayStr && l.completed);
  const activeHabits = habits.filter(h => h.active);
  const habitCompletionRate = activeHabits.length > 0 ? Math.round((todayLogs.length / activeHabits.length) * 100) : 0;

  const currentMonth = format(new Date(), 'yyyy-MM');
  const monthEntries = finance.filter(f => f.date.startsWith(currentMonth));
  const monthIncome = monthEntries.filter(f => f.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const monthExpense = monthEntries.filter(f => f.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const monthBalance = monthIncome - monthExpense;

  const upcomingEvents = events
    .filter(e => e.start_date >= todayStr)
    .sort((a, b) => a.start_date.localeCompare(b.start_date))
    .slice(0, 3);

  return (
    <div className="dashboard-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Welcome Banner 3D */}
      <div className="welcome-card-3d">
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.9, fontSize: '0.9rem', marginBottom: 6 }}>
            <Sparkles size={16} />
            <span>{format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
            {greeting}, {user?.display_name?.split(' ')[0] || 'Pedro'}! 👋
          </h1>
          <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: '0.95rem', maxWidth: 600 }}>
            {quote}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, position: 'relative', zIndex: 2, flexWrap: 'wrap' }}>
          <Button
            className="btn-3d-glass"
            onClick={() => navigate('/my-day')}
          >
            Ver Meu Dia
          </Button>
          <Button
            className="btn-3d-white"
            onClick={() => navigate('/tasks')}
          >
            Gerenciar Tarefas
          </Button>
        </div>
      </div>

      {/* Metrics Row 3D */}
      <div className="dashboard-metrics-grid">
        <div className="metric-card-3d" onClick={() => navigate('/tasks')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Tarefas Pendentes</span>
            <div
              className="metric-icon-sphere"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(124, 58, 237, 0.1) 100%)',
                color: 'var(--color-primary-500)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
              }}
            >
              <CheckSquare size={18} />
            </div>
          </div>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>{pendingTasks.length}</span>
            <span className="text-xs text-secondary font-medium">
              {completedTodayTasks.length > 0 ? `(${completedTodayTasks.length} feitas hoje)` : 'foco total'}
            </span>
          </div>
          <div style={{ marginTop: 12 }}>
            <ProgressBar value={completedTodayTasks.length} max={Math.max(1, completedTodayTasks.length + todayTasks.length)} size="sm" showPercent={false} />
          </div>
        </div>

        <div className="metric-card-3d" onClick={() => navigate('/habits')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Hábitos de Hoje</span>
            <div
              className="metric-icon-sphere"
              style={{
                background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.25) 0%, rgba(234, 88, 12, 0.1) 100%)',
                color: '#ea580c',
                border: '1px solid rgba(249, 115, 22, 0.3)',
              }}
            >
              <Flame size={18} />
            </div>
          </div>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>{todayLogs.length}/{activeHabits.length}</span>
            <span className="text-xs text-secondary font-medium">{habitCompletionRate}% cumpridos</span>
          </div>
          <div style={{ marginTop: 12 }}>
            <ProgressBar value={habitCompletionRate} color="#ea580c" size="sm" showPercent={false} />
          </div>
        </div>

        <div className="metric-card-3d" onClick={() => navigate('/finance')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Saldo do Mês</span>
            <div
              className="metric-icon-sphere"
              style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.25) 0%, rgba(22, 163, 74, 0.1) 100%)',
                color: '#16a34a',
                border: '1px solid rgba(34, 197, 94, 0.3)',
              }}
            >
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: '1.7rem', fontWeight: 800, color: monthBalance >= 0 ? 'var(--color-success-text)' : 'var(--color-danger-text)' }}>
              R$ {monthBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 12, fontSize: '0.8rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 2, color: 'var(--color-success-text)', fontWeight: 600 }}>
              <ArrowUpRight size={13} /> R$ {monthIncome.toFixed(0)}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 2, color: 'var(--color-danger-text)', fontWeight: 600 }}>
              <ArrowDownRight size={13} /> R$ {monthExpense.toFixed(0)}
            </span>
          </div>
        </div>

        <div className="metric-card-3d" onClick={() => navigate('/calendar')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Próximo Evento</span>
            <div
              className="metric-icon-sphere"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(37, 99, 235, 0.1) 100%)',
                color: '#3b82f6',
                border: '1px solid rgba(59, 130, 246, 0.3)',
              }}
            >
              <Calendar size={18} />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            {upcomingEvents.length > 0 ? (
              <>
                <div className="font-semibold text-sm line-clamp-1" style={{ color: 'var(--text-primary)' }}>{upcomingEvents[0].title}</div>
                <div className="text-xs text-secondary mt-1 flex items-center gap-1 font-medium">
                  <Clock size={12} />
                  <span>
                    {upcomingEvents[0].start_date === todayStr ? 'Hoje' : upcomingEvents[0].start_date}
                    {upcomingEvents[0].start_time ? ` às ${upcomingEvents[0].start_time}` : ''}
                  </span>
                </div>
              </>
            ) : (
              <span className="text-sm text-secondary">Sem eventos agendados</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Tasks & Schedule vs Quick Insights */}
      <div className="dashboard-main-grid">
        {/* Left Column: Today's Tasks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <Card
            title="Prioridades de Hoje"
            subtitle={`${todayTasks.length} tarefas agendadas para o seu dia`}
            action={
              <Button size="sm" variant="outline" onClick={() => navigate('/tasks')}>
                Ver Todas <ChevronRight size={14} />
              </Button>
            }
          >
            {todayTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={32} style={{ color: '#16a34a', margin: '0 auto 8px' }} />
                <p className="text-sm font-medium">Nenhuma tarefa pendente para hoje!</p>
                <p className="text-xs text-secondary">Aproveite para focar em estudos ou relaxar.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {todayTasks.slice(0, 5).map(task => {
                  const isCompleted = task.status === 'completed';
                  return (
                    <div
                      key={task.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                        padding: '10px 12px',
                        borderRadius: 'var(--border-radius-md)',
                        backgroundColor: isCompleted ? 'var(--color-neutral-100)' : 'var(--surface-bg)',
                        border: '1px solid var(--border-color)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => handleToggleTask(task)}
                        style={{ marginTop: 3, width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--color-primary-600)' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontSize: '0.9rem',
                              fontWeight: 600,
                              textDecoration: isCompleted ? 'line-through' : 'none',
                              color: isCompleted ? 'var(--text-tertiary)' : 'var(--text-primary)',
                            }}
                          >
                            {task.title}
                          </span>
                          {task.priority === 'urgent' && <Badge variant="danger" size="sm">Urgente</Badge>}
                          {task.priority === 'high' && <Badge variant="warning" size="sm">Alta</Badge>}
                        </div>
                        {task.description && (
                          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {task.description}
                          </p>
                        )}
                        {task.subtasks && task.subtasks.length > 0 && (
                          <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="text-xs text-secondary font-medium">
                              Subtarefas: {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                            </span>
                          </div>
                        )}
                      </div>
                      {task.due_time && (
                        <span className="text-xs text-secondary font-mono" style={{ whiteSpace: 'nowrap' }}>
                          {task.due_time}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Quick Life OS Shortcuts */}
          <Card title="Acesso Rápido às Áreas">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
              {[
                { label: 'Academia', icon: Dumbbell, path: '/fitness', color: '#ea580c' },
                { label: 'Finanças', icon: DollarSign, path: '/finance', color: '#16a34a' },
                { label: 'Estudos', icon: BookOpen, path: '/studies', color: '#2563eb' },
                { label: 'Espiritual', icon: Church, path: '/spiritual', color: '#8b5cf6' },
                { label: 'Metas', icon: TrendingUp, path: '/goals', color: '#d97706' },
              ].map(item => (
                <button
                  key={item.label}
                  className="area-quick-btn"
                  onClick={() => startTransition(() => navigate(item.path))}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: '12px',
                      backgroundColor: `${item.color}18`,
                      color: item.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${item.color}30`,
                      boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2)',
                    }}
                  >
                    <item.icon size={20} />
                  </div>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{item.label}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Habits & Goals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Habits Widget */}
          <Card
            title="Consistência Diária"
            subtitle="Hábitos mantêm você na direção certa"
            action={
              <Button size="sm" variant="outline" onClick={() => navigate('/habits')}>
                Hábitos <ChevronRight size={14} />
              </Button>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {activeHabits.slice(0, 4).map(habit => {
                const isLogged = habitLogs.some(l => l.habit_id === habit.id && l.date === todayStr && l.completed);
                return (
                  <div
                    key={habit.id}
                    className={`habit-check-item ${isLogged ? 'is-completed' : ''}`}
                    onClick={() => navigate('/habits')}
                  >
                    <div>
                      <div className="habit-title">{habit.name}</div>
                      <div className="text-xs text-secondary">{habit.description || 'Hábito diário'}</div>
                    </div>
                    <Badge variant={isLogged ? 'success' : 'secondary'} size="sm">
                      {isLogged ? 'Concluído' : 'Pendente'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Goals Progress */}
          <Card
            title="Metas e Sonhos"
            subtitle="Acompanhe a evolução dos seus grandes objetivos"
            action={
              <Button size="sm" variant="outline" onClick={() => navigate('/goals')}>
                Ver Metas <ChevronRight size={14} />
              </Button>
            }
          >
            {goals.length === 0 ? (
              <p className="text-xs text-secondary">Nenhuma meta cadastrada.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {goals.slice(0, 3).map(goal => (
                  <div key={goal.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span className="font-semibold text-sm text-primary">{goal.title}</span>
                      <Badge variant="primary" size="sm">{goal.area}</Badge>
                    </div>
                    <ProgressBar value={goal.progress} color="var(--color-primary-600)" size="sm" />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
