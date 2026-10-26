import { useState, useEffect } from 'react';
import {
  Target, Plus, CheckCircle2, Circle, Trash2, Edit3,
  Calendar
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ProgressBar from '../components/common/ProgressBar';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getAllItems, createItem, updateItem, deleteItem } from '../services/storage';
import type { Goal, GoalMilestone, Priority } from '../types';
import { GOAL_AREAS } from '../types';
import { v4 as uuidv4 } from 'uuid';

export default function GoalsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [area, setArea] = useState<string>(GOAL_AREAS[0]);
  const [priority, setPriority] = useState<Priority>('high');
  const [dueDate, setDueDate] = useState('');
  const [motivation, setMotivation] = useState('');
  const [progressVal, setProgressVal] = useState('50');
  const [milestonesList, setMilestonesList] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');

  const loadGoals = () => {
    if (!user) return;
    setGoals(getAllItems<Goal>('goals', user.id));
  };

  useEffect(() => {
    loadGoals();
  }, [user]);

  const openCreateModal = () => {
    setEditingGoal(null);
    setTitle('');
    setDescription('');
    setArea(GOAL_AREAS[0]);
    setPriority('high');
    setDueDate('');
    setMotivation('');
    setProgressVal('0');
    setMilestonesList([]);
    setIsModalOpen(true);
  };

  const openEditModal = (g: Goal) => {
    setEditingGoal(g);
    setTitle(g.title);
    setDescription(g.description || '');
    setArea(g.area);
    setPriority(g.priority);
    setDueDate(g.due_date || '');
    setMotivation(g.motivation || '');
    setProgressVal(String(g.progress));
    setMilestonesList(g.milestones ? g.milestones.map(m => ({ id: m.id, title: m.title, completed: m.completed })) : []);
    setIsModalOpen(true);
  };

  const addMilestoneToForm = () => {
    if (!newMilestoneTitle.trim()) return;
    setMilestonesList(prev => [...prev, { id: uuidv4(), title: newMilestoneTitle.trim(), completed: false }]);
    setNewMilestoneTitle('');
  };

  const removeMilestoneFromForm = (id: string) => {
    setMilestonesList(prev => prev.filter(m => m.id !== id));
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) return;

    const formattedMilestones: GoalMilestone[] = milestonesList.map((m, index) => ({
      id: m.id,
      goal_id: editingGoal ? editingGoal.id : '',
      title: m.title,
      completed: m.completed,
      order_index: index,
    }));

    // Auto calculate progress if milestones exist
    let calcProgress = parseInt(progressVal) || 0;
    if (formattedMilestones.length > 0) {
      const completedCount = formattedMilestones.filter(m => m.completed).length;
      calcProgress = Math.round((completedCount / formattedMilestones.length) * 100);
    }

    if (editingGoal) {
      updateItem<Goal>('goals', user.id, editingGoal.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        area,
        priority,
        due_date: dueDate || undefined,
        motivation: motivation.trim() || undefined,
        progress: calcProgress,
        milestones: formattedMilestones,
        status: calcProgress === 100 ? 'completed' : 'in_progress',
      });
      addToast({ type: 'success', title: 'Meta atualizada!' });
    } else {
      createItem<Goal>('goals', user.id, {
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || undefined,
        area,
        priority,
        status: 'in_progress',
        due_date: dueDate || undefined,
        motivation: motivation.trim() || undefined,
        progress: calcProgress,
        progress_type: 'manual',
        milestones: formattedMilestones,
      });
      addToast({ type: 'success', title: 'Nova meta cadastrada!' });
    }

    setIsModalOpen(false);
    loadGoals();
  };

  const handleToggleMilestone = (goal: Goal, milestoneId: string) => {
    if (!user || !goal.milestones) return;
    const updatedMilestones = goal.milestones.map(m => m.id === milestoneId ? { ...m, completed: !m.completed } : m);
    const completedCount = updatedMilestones.filter(m => m.completed).length;
    const newProgress = Math.round((completedCount / updatedMilestones.length) * 100);

    updateItem<Goal>('goals', user.id, goal.id, {
      milestones: updatedMilestones,
      progress: newProgress,
      status: newProgress === 100 ? 'completed' : 'in_progress',
    });

    setGoals(prev => prev.map(g => g.id === goal.id ? {
      ...g,
      milestones: updatedMilestones,
      progress: newProgress,
      status: newProgress === 100 ? 'completed' : 'in_progress',
    } : g));
  };

  const handleDeleteGoal = () => {
    if (!goalToDelete || !user) return;
    deleteItem<Goal>('goals', user.id, goalToDelete.id);
    setGoals(prev => prev.filter(g => g.id !== goalToDelete.id));
    setGoalToDelete(null);
    addToast({ type: 'success', title: 'Meta excluída!' });
  };

  const filteredGoals = goals.filter(g => {
    if (selectedArea !== 'all' && g.area !== selectedArea) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Metas & Sonhos de Vida</h1>
          <p className="text-sm text-secondary" style={{ margin: '4px 0 0' }}>
            Transforme aspirações em objetivos tangíveis divididos em marcos claros.
          </p>
        </div>

        <Button variant="primary" onClick={openCreateModal}>
          <Plus size={18} /> Nova Meta
        </Button>
      </div>

      {/* Area Filter Tags */}
      <div className="tabs-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
        <Button
          variant={selectedArea === 'all' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setSelectedArea('all')}
        >
          Todas as Áreas
        </Button>
        {GOAL_AREAS.map(a => (
          <Button
            key={a}
            variant={selectedArea === a ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedArea(a)}
          >
            {a}
          </Button>
        ))}
      </div>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <EmptyState
          icon={<Target size={28} />}
          title="Nenhuma meta cadastrada nesta área"
          description="Defina suas metas para o ano e quebre-as em pequenos passos realizáveis."
          actionLabel="Cadastrar Meta"
          onAction={openCreateModal}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-6)' }}>
          {filteredGoals.map(goal => (
            <Card
              key={goal.id}
              title={goal.title}
              subtitle={goal.description}
              action={
                <div style={{ display: 'flex', gap: 4 }}>
                  <Button variant="ghost" size="sm" onClick={() => openEditModal(goal)} style={{ padding: 4 }}>
                    <Edit3 size={14} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setGoalToDelete(goal)} style={{ padding: 4 }}>
                    <Trash2 size={14} style={{ color: '#ef4444' }} />
                  </Button>
                </div>
              }
              footer={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Badge variant="primary" size="sm">{goal.area}</Badge>
                  {goal.due_date && (
                    <span className="text-xs text-secondary font-mono flex items-center gap-1">
                      <Calendar size={12} /> Prazo: {goal.due_date}
                    </span>
                  )}
                </div>
              }
            >
              {/* Progress bar */}
              <div style={{ marginBottom: 14 }}>
                <ProgressBar value={goal.progress} color={goal.progress === 100 ? '#16a34a' : 'var(--color-primary-600)'} />
              </div>

              {goal.motivation && (
                <div style={{ padding: '8px 10px', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'var(--surface-bg)', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                  <strong>Por que importa:</strong> {goal.motivation}
                </div>
              )}

              {/* Milestones Checklist */}
              {goal.milestones && goal.milestones.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-secondary uppercase tracking-wider block mb-2">
                    Marcos & Etapas ({goal.milestones.filter(m => m.completed).length}/{goal.milestones.length})
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {goal.milestones.map(m => (
                      <div
                        key={m.id}
                        onClick={() => handleToggleMilestone(goal, m.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '6px 8px',
                          borderRadius: 'var(--border-radius-sm)',
                          backgroundColor: m.completed ? 'var(--color-neutral-100)' : 'var(--surface-bg)',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                        }}
                      >
                        <div style={{ color: m.completed ? '#16a34a' : 'var(--text-tertiary)' }}>
                          {m.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                        </div>
                        <span style={{ textDecoration: m.completed ? 'line-through' : 'none', color: m.completed ? 'var(--text-tertiary)' : 'var(--text-primary)' }}>
                          {m.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Goal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGoal ? 'Editar Meta' : 'Nova Meta de Vida'}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, width: '100%' }}>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleSaveGoal}>Salvar Meta</Button>
          </div>
        }
      >
        <form onSubmit={handleSaveGoal} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Título da Meta</label>
            <input
              type="text"
              className="input"
              placeholder="Ex: Reserva de emergência, Aprender Francês, Correr 10km..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Descrição / Detalhes</label>
            <textarea
              className="input"
              rows={2}
              placeholder="Descreva em detalhes o que significa alcançar esta meta..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Área da Vida</label>
              <select className="input" value={area} onChange={e => setArea(e.target.value)}>
                {GOAL_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Prioridade</label>
              <select className="input" value={priority} onChange={e => setPriority(e.target.value as any)}>
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Data Alvo</label>
              <input type="date" className="input" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Progresso Inicial (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="input"
                value={progressVal}
                onChange={e => setProgressVal(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Sua Motivação (Por que essa meta importa?)</label>
            <input
              type="text"
              className="input"
              placeholder="Ex: Trazer segurança para a família e liberdade de escolha..."
              value={motivation}
              onChange={e => setMotivation(e.target.value)}
            />
          </div>

          {/* Milestones Builder */}
          <div>
            <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Marcos / Submetas</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                type="text"
                className="input"
                placeholder="Adicionar etapa para conclusão..."
                value={newMilestoneTitle}
                onChange={e => setNewMilestoneTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addMilestoneToForm();
                  }
                }}
              />
              <Button type="button" variant="outline" size="sm" onClick={addMilestoneToForm}>
                Adicionar
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {milestonesList.map(m => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: 'var(--border-radius-sm)',
                    backgroundColor: 'var(--color-neutral-100)',
                    fontSize: '0.85rem',
                  }}
                >
                  <span>{m.title}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeMilestoneFromForm(m.id)} style={{ padding: 2 }}>
                    <Trash2 size={13} style={{ color: '#ef4444' }} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!goalToDelete}
        onClose={() => setGoalToDelete(null)}
        onConfirm={handleDeleteGoal}
        title="Excluir Meta"
        message={`Deseja realmente remover a meta "${goalToDelete?.title}"?`}
      />
    </div>
  );
}
