import { useState, useEffect } from 'react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Timer, Plus, Flame, CheckCircle2, Trash2, Edit3, Award
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ProgressBar from '../components/common/ProgressBar';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getAllItems, createItem, updateItem, deleteItem } from '../services/storage';
import type { Habit, HabitLog, EventCategory } from '../types';

export default function HabitsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventCategory>('health');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [dailyGoal, setDailyGoal] = useState('1');
  const [color, setColor] = useState('#7c3aed');

  const today = new Date();
  const past7Days = eachDayOfInterval({
    start: subDays(today, 6),
    end: today,
  });

  const loadHabits = () => {
    if (!user) return;
    setHabits(getAllItems<Habit>('habits', user.id));
    setHabitLogs(getAllItems<HabitLog>('habit_logs', user.id));
  };

  useEffect(() => {
    loadHabits();
  }, [user]);

  const handleToggleHabitDay = (habitId: string, day: Date) => {
    if (!user) return;
    const dayStr = format(day, 'yyyy-MM-dd');
    const existingLog = habitLogs.find(l => l.habit_id === habitId && l.date === dayStr);

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
        date: dayStr,
        completed: true,
      });
      setHabitLogs(prev => [...prev, newLog]);
    }
  };

  const calculateStreak = (habitId: string) => {
    let streak = 0;
    let checkDate = new Date();
    // Check up to 30 days back
    for (let i = 0; i < 30; i++) {
      const dStr = format(checkDate, 'yyyy-MM-dd');
      const log = habitLogs.find(l => l.habit_id === habitId && l.date === dStr && l.completed);
      if (log) {
        streak++;
      } else if (i > 0) {
        // If not completed today, streak might still be intact from yesterday
        break;
      }
      checkDate = subDays(checkDate, 1);
    }
    return streak;
  };

  const openCreateModal = () => {
    setEditingHabit(null);
    setName('');
    setDescription('');
    setCategory('health');
    setFrequency('daily');
    setDailyGoal('1');
    setColor('#7c3aed');
    setIsModalOpen(true);
  };

  const openEditModal = (h: Habit) => {
    setEditingHabit(h);
    setName(h.name);
    setDescription(h.description || '');
    setCategory(h.category);
    setFrequency(h.frequency as any);
    setDailyGoal(String(h.daily_goal || 1));
    setColor(h.color || '#7c3aed');
    setIsModalOpen(true);
  };

  const handleSaveHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user) return;

    if (editingHabit) {
      updateItem<Habit>('habits', user.id, editingHabit.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        frequency,
        daily_goal: parseInt(dailyGoal) || 1,
        color,
      });
      addToast({ type: 'success', title: 'Hábito atualizado!' });
    } else {
      createItem<Habit>('habits', user.id, {
        user_id: user.id,
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        frequency,
        daily_goal: parseInt(dailyGoal) || 1,
        start_date: format(new Date(), 'yyyy-MM-dd'),
        active: true,
        color,
      });
      addToast({ type: 'success', title: 'Novo hábito adicionado!' });
    }

    setIsModalOpen(false);
    loadHabits();
  };

  const handleDeleteHabit = () => {
    if (!habitToDelete || !user) return;
    deleteItem<Habit>('habits', user.id, habitToDelete.id);
    setHabits(prev => prev.filter(h => h.id !== habitToDelete.id));
    setHabitToDelete(null);
    addToast({ type: 'success', title: 'Hábito removido!' });
  };

  const todayStr = format(today, 'yyyy-MM-dd');
  const todayDone = habits.filter(h => habitLogs.some(l => l.habit_id === h.id && l.date === todayStr && l.completed));
  const rateToday = habits.length > 0 ? Math.round((todayDone.length / habits.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Rotinas & Hábitos</h1>
          <p className="text-sm text-secondary" style={{ margin: '4px 0 0' }}>
            Construa disciplina diária com acompanhamento visual de constância.
          </p>
        </div>

        <Button variant="primary" onClick={openCreateModal}>
          <Plus size={18} /> Novo Hábito
        </Button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-xs font-semibold text-secondary uppercase">Hoje</span>
            <div style={{ width: 34, height: 34, borderRadius: '10px', backgroundColor: 'var(--color-success-50)', color: 'var(--color-success-text)', border: '1px solid var(--color-success-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 700 }}>{todayDone.length}/{habits.length}</span>
            <span className="text-xs text-secondary font-medium">{rateToday}% hoje</span>
          </div>
          <div style={{ marginTop: 8 }}>
            <ProgressBar value={rateToday} color="#16a34a" size="sm" showPercent={false} />
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-xs font-semibold text-secondary uppercase">Maior Sequência</span>
            <div style={{ width: 34, height: 34, borderRadius: '10px', backgroundColor: 'var(--color-accent-50)', color: 'var(--color-accent-text)', border: '1px solid var(--color-accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flame size={16} />
            </div>
          </div>
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 700 }}>
              {Math.max(0, ...habits.map(h => calculateStreak(h.id)))} dias
            </span>
            <span className="text-xs text-secondary">em chamas! 🔥</span>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-xs font-semibold text-secondary uppercase">Total Ativos</span>
            <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={16} />
            </div>
          </div>
          <div style={{ marginTop: 6 }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 700 }}>{habits.length} hábitos</span>
          </div>
        </Card>
      </div>

      {/* Habits Grid with 7-Day Tracker */}
      {habits.length === 0 ? (
        <EmptyState
          icon={<Timer size={28} />}
          title="Nenhum hábito cadastrado"
          description="Comece adicionando pequenos hábitos que você gostaria de praticar todos os dias."
          actionLabel="Criar Hábito"
          onAction={openCreateModal}
        />
      ) : (
        <Card style={{ overflowX: 'auto', padding: 'var(--space-4)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  HÁBITO
                </th>
                <th style={{ textAlign: 'center', padding: '10px 12px', fontSize: '0.8rem', color: 'var(--text-secondary)', width: 100 }}>
                  SEQUÊNCIA
                </th>
                {past7Days.map(day => (
                  <th key={day.toISOString()} style={{ textAlign: 'center', padding: '10px 8px', fontSize: '0.75rem', color: 'var(--text-secondary)', width: 44 }}>
                    <div>{format(day, 'EEE', { locale: ptBR }).toUpperCase()}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{format(day, 'd')}</div>
                  </th>
                ))}
                <th style={{ textAlign: 'right', padding: '10px 12px', width: 80 }} />
              </tr>
            </thead>
            <tbody>
              {habits.map(habit => {
                const streak = calculateStreak(habit.id);

                return (
                  <tr key={habit.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.15s ease' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            backgroundColor: habit.color || 'var(--color-primary-600)',
                          }}
                        />
                        <div>
                          <div className="font-semibold text-sm text-primary">{habit.name}</div>
                          {habit.description && <div className="text-xs text-secondary">{habit.description}</div>}
                        </div>
                      </div>
                    </td>

                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, backgroundColor: 'var(--color-accent-50)', color: 'var(--color-accent-text)', border: '1px solid var(--color-accent-border)', padding: '4px 8px', borderRadius: 'var(--border-radius-full)', fontSize: '0.75rem', fontWeight: 700 }}>
                        <Flame size={13} /> {streak}d
                      </div>
                    </td>

                    {/* 7 Days check buttons */}
                    {past7Days.map(day => {
                      const dayStr = format(day, 'yyyy-MM-dd');
                      const isDone = habitLogs.some(l => l.habit_id === habit.id && l.date === dayStr && l.completed);

                      return (
                        <td key={dayStr} style={{ textAlign: 'center', padding: '8px' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleHabitDay(habit.id, day)}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              border: `2px solid ${isDone ? (habit.color || 'var(--color-primary-600)') : 'var(--color-neutral-300)'}`,
                              backgroundColor: isDone ? (habit.color || 'var(--color-primary-600)') : 'transparent',
                              color: isDone ? '#ffffff' : 'transparent',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              outline: 'none',
                            }}
                          >
                            <CheckCircle2 size={16} style={{ strokeWidth: 3 }} />
                          </button>
                        </td>
                      );
                    })}

                    <td style={{ textAlign: 'right', padding: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(habit)} style={{ padding: 4 }}>
                          <Edit3 size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setHabitToDelete(habit)} style={{ padding: 4 }}>
                          <Trash2 size={14} style={{ color: '#ef4444' }} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {/* Habit Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingHabit ? 'Editar Hábito' : 'Novo Hábito'}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, width: '100%' }}>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleSaveHabit}>Salvar Hábito</Button>
          </div>
        }
      >
        <form onSubmit={handleSaveHabit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Nome do Hábito</label>
            <input
              type="text"
              className="input"
              placeholder="Ex: Meditação, Leitura, Treino, Tomar 2L de água..."
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Descrição / Motivação</label>
            <textarea
              className="input"
              rows={2}
              placeholder="Por que este hábito é importante para você?"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Categoria</label>
              <select className="input" value={category} onChange={e => setCategory(e.target.value as any)}>
                <option value="health">Saúde</option>
                <option value="fitness">Academia</option>
                <option value="spiritual">Espiritual</option>
                <option value="study">Estudos</option>
                <option value="personal">Pessoal</option>
                <option value="finance">Finanças</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Cor de Destaque</label>
              <input
                type="color"
                className="input"
                value={color}
                onChange={e => setColor(e.target.value)}
                style={{ height: 38, padding: 2, cursor: 'pointer' }}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!habitToDelete}
        onClose={() => setHabitToDelete(null)}
        onConfirm={handleDeleteHabit}
        title="Excluir Hábito"
        message={`Tem certeza que deseja excluir o hábito "${habitToDelete?.name}"? Os registros históricos associados serão perdidos.`}
      />
    </div>
  );
}
