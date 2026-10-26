import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  CheckSquare, Flame, DollarSign, Download, Award
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ProgressBar from '../components/common/ProgressBar';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getAllItems, exportAllData } from '../services/storage';
import type { Task, Habit, HabitLog, FinanceEntry, Goal, WorkoutLog } from '../types';

export default function ReportsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [finance, setFinance] = useState<FinanceEntry[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);

  useEffect(() => {
    if (!user) return;
    setTasks(getAllItems<Task>('tasks', user.id));
    setHabits(getAllItems<Habit>('habits', user.id));
    setHabitLogs(getAllItems<HabitLog>('habit_logs', user.id));
    setFinance(getAllItems<FinanceEntry>('finance', user.id));
    setGoals(getAllItems<Goal>('goals', user.id));
    setWorkoutLogs(getAllItems<WorkoutLog>('workout_logs', user.id));
  }, [user]);

  // Analytics computations
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  const totalLogs = habitLogs.filter(l => l.completed).length;

  const currentMonth = format(new Date(), 'yyyy-MM');
  const monthFinance = finance.filter(f => f.date.startsWith(currentMonth));
  const income = monthFinance.filter(f => f.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const expense = monthFinance.filter(f => f.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const savingsRate = income > 0 ? Math.max(0, Math.round(((income - expense) / income) * 100)) : 0;


  const handleExportJSON = () => {
    if (!user) return;
    const data = exportAllData(user.id);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `planly_backup_${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({ type: 'success', title: 'Exportação concluída!', message: 'Arquivo JSON baixado com sucesso.' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Relatórios & Inteligência</h1>
          <p className="text-sm text-secondary" style={{ margin: '4px 0 0' }}>
            Visão analítica da sua produtividade, finanças, constância e equilíbrio pessoal.
          </p>
        </div>

        <Button variant="outline" onClick={handleExportJSON}>
          <Download size={18} /> Exportar Backup (JSON)
        </Button>
      </div>

      {/* High-level KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-xs font-semibold text-secondary uppercase">Taxa de Conclusão</span>
            <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckSquare size={16} />
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{taskCompletionRate}%</span>
          </div>
          <p className="text-xs text-secondary mt-1">{completedTasks.length} de {tasks.length} tarefas feitas</p>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-xs font-semibold text-secondary uppercase">Taxa de Poupança</span>
            <div style={{ width: 34, height: 34, borderRadius: '10px', backgroundColor: 'var(--color-success-50)', color: 'var(--color-success-text)', border: '1px solid var(--color-success-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-success-text)' }}>{savingsRate}%</span>
          </div>
          <p className="text-xs text-secondary mt-1">Economia sobre receita do mês</p>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-xs font-semibold text-secondary uppercase">Sessões de Treino</span>
            <div style={{ width: 34, height: 34, borderRadius: '10px', backgroundColor: 'var(--color-accent-50)', color: 'var(--color-accent-text)', border: '1px solid var(--color-accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flame size={16} />
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{workoutLogs.length}</span>
          </div>
          <p className="text-xs text-secondary mt-1">Treinos registrados no histórico</p>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-xs font-semibold text-secondary uppercase">Hábitos Cumpridos</span>
            <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={16} />
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{totalLogs} checks</span>
          </div>
          <p className="text-xs text-secondary mt-1">{habits.length} hábitos e {goals.length} metas ativas</p>
        </Card>
      </div>

      {/* Detailed Analysis Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
        {/* Productivity by Category */}
        <Card title="Distribuição de Tarefas por Categoria">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['work', 'personal', 'study', 'health', 'fitness', 'finance'].map(cat => {
              const catTasks = tasks.filter(t => t.category === cat);
              const doneInCat = catTasks.filter(t => t.status === 'completed').length;
              const pct = catTasks.length > 0 ? Math.round((doneInCat / catTasks.length) * 100) : 0;

              return (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                    <span className="capitalize font-medium">{cat}</span>
                    <span className="text-secondary font-semibold">{doneInCat}/{catTasks.length} ({pct}%)</span>
                  </div>
                  <ProgressBar value={pct} color="var(--color-primary-600)" size="sm" showPercent={false} />
                </div>
              );
            })}
          </div>
        </Card>

        {/* Financial Flow summary */}
        <Card title="Balanço Financeiro Mensal">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ padding: 14, borderRadius: 'var(--border-radius-md)', backgroundColor: 'var(--surface-bg)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span className="text-sm font-semibold">Total de Entradas</span>
                <span className="text-sm font-bold text-success" style={{ color: '#16a34a' }}>+ R$ {income.toFixed(2)}</span>
              </div>
              <ProgressBar value={100} color="#16a34a" size="sm" showPercent={false} />
            </div>

            <div style={{ padding: 14, borderRadius: 'var(--border-radius-md)', backgroundColor: 'var(--surface-bg)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span className="text-sm font-semibold">Total de Saídas</span>
                <span className="text-sm font-bold text-danger" style={{ color: '#dc2626' }}>- R$ {expense.toFixed(2)}</span>
              </div>
              <ProgressBar value={income > 0 ? Math.min(100, Math.round((expense / income) * 100)) : 100} color="#dc2626" size="sm" showPercent={false} />
            </div>

            <div style={{ padding: 14, borderRadius: 'var(--border-radius-md)', backgroundColor: 'var(--color-primary-50)', border: '1px solid var(--color-primary-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="font-semibold text-primary">Saldo Líquido Acumulado</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: (income - expense) >= 0 ? '#16a34a' : '#dc2626' }}>
                R$ {(income - expense).toFixed(2)}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
