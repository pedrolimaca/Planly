import { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { createItem } from '../../services/storage';
import type {
  QuickCreateType, Priority, EventCategory, FinanceType,
  Task, CalendarEvent, Reminder, FinanceEntry, Habit, Goal, Note
} from '../../types';
import { FINANCE_CATEGORIES, GOAL_AREAS } from '../../types';

interface QuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: QuickCreateType;
  onItemCreated?: () => void;
}

export default function QuickCreateModal({
  isOpen,
  onClose,
  initialType = 'task',
  onItemCreated,
}: QuickCreateModalProps) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [activeType, setActiveType] = useState<QuickCreateType>(initialType);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<EventCategory>('personal');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const [amount, setAmount] = useState('');
  const [financeType, setFinanceType] = useState<FinanceType>('expense');
  const [financeCategory, setFinanceCategory] = useState<string>(FINANCE_CATEGORIES[0]);
  const [goalArea, setGoalArea] = useState<string>(GOAL_AREAS[0]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setCategory('personal');
    setAmount('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && activeType !== 'note') {
      addToast({ type: 'warning', title: 'Título obrigatório', message: 'Preencha o título para salvar.' });
      return;
    }
    if (!user) return;

    try {
      if (activeType === 'task') {
        createItem<Task>('tasks', user.id, {
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          priority,
          status: 'pending',
          due_date: date,
          due_time: time,
          tags: [],
          order_index: 0,
        });
        addToast({ type: 'success', title: 'Tarefa criada com sucesso!' });
      } else if (activeType === 'event') {
        createItem<CalendarEvent>('events', user.id, {
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          start_date: date,
          start_time: time,
          end_date: date,
          all_day: false,
          priority,
        });
        addToast({ type: 'success', title: 'Evento agendado com sucesso!' });
      } else if (activeType === 'reminder') {
        createItem<Reminder>('reminders', user.id, {
          user_id: user.id,
          title: title.trim(),
          message: description.trim() || undefined,
          category,
          date,
          time,
          priority,
          status: 'active',
        });
        addToast({ type: 'success', title: 'Lembrete criado com sucesso!' });
      } else if (activeType === 'finance') {
        const val = parseFloat(amount.replace(',', '.'));
        if (isNaN(val) || val <= 0) {
          addToast({ type: 'error', title: 'Valor inválido', message: 'Informe um valor numérico válido.' });
          return;
        }
        createItem<FinanceEntry>('finance', user.id, {
          user_id: user.id,
          description: title.trim(),
          type: financeType,
          category: financeCategory,
          amount: val,
          date,
          due_date: date,
          status: financeType === 'income' ? 'received' : 'pending',
          payment_method: 'PIX',
        });
        addToast({ type: 'success', title: 'Lançamento financeiro registrado!' });
      } else if (activeType === 'habit') {
        createItem<Habit>('habits', user.id, {
          user_id: user.id,
          name: title.trim(),
          description: description.trim() || undefined,
          category,
          frequency: 'daily',
          start_date: date,
          active: true,
          color: '#7c3aed',
        });
        addToast({ type: 'success', title: 'Novo hábito adicionado!' });
      } else if (activeType === 'goal') {
        createItem<Goal>('goals', user.id, {
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || undefined,
          area: goalArea,
          priority,
          status: 'in_progress',
          due_date: date,
          progress: 0,
          progress_type: 'manual',
          milestones: [],
        });
        addToast({ type: 'success', title: 'Nova meta cadastrada!' });
      } else if (activeType === 'note') {
        createItem<Note>('notes', user.id, {
          user_id: user.id,
          title: title.trim() || 'Anotação sem título',
          content: description.trim(),
          category,
          pinned: false,
        });
        addToast({ type: 'success', title: 'Anotação salva!' });
      }

      resetForm();
      onItemCreated?.();
      onClose();
    } catch {
      addToast({ type: 'error', title: 'Erro ao salvar', message: 'Não foi possível salvar o registro.' });
    }
  };

  const typeLabels: Record<QuickCreateType, string> = {
    task: 'Tarefa',
    event: 'Evento',
    reminder: 'Lembrete',
    finance: 'Finanças',
    habit: 'Hábito',
    goal: 'Meta',
    note: 'Nota',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Criação Rápida"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, width: '100%' }}>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit}>Salvar {typeLabels[activeType]}</Button>
        </div>
      }
    >
      {/* Type selector tabs */}
      <div className="tabs-scroll" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 12, marginBottom: 16, borderBottom: '1px solid var(--border-color)' }}>
        {(['task', 'event', 'reminder', 'finance', 'habit', 'goal', 'note'] as QuickCreateType[]).map(t => (
          <button
            key={t}
            type="button"
            className={`btn btn-sm ${activeType === t ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveType(t)}
            style={{ borderRadius: 'var(--border-radius-full)', whiteSpace: 'nowrap' }}
          >
            {typeLabels[t]}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1 block">
            {activeType === 'habit' ? 'Nome do Hábito' : activeType === 'note' ? 'Título da Nota' : 'Título'}
          </label>
          <input
            type="text"
            className="input"
            placeholder={`Ex: ${activeType === 'task' ? 'Comprar passagem' : activeType === 'finance' ? 'Supermercado semanal' : 'Estudar inglês'}`}
            value={title}
            onChange={e => setTitle(e.target.value)}
            required={activeType !== 'note'}
            autoFocus
          />
        </div>

        {activeType === 'finance' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1 block">Tipo</label>
              <select className="input" value={financeType} onChange={e => setFinanceType(e.target.value as FinanceType)}>
                <option value="expense">Despesa (-)</option>
                <option value="income">Receita (+)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1 block">Valor (R$)</label>
              <input
                type="text"
                className="input"
                placeholder="0,00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
              />
            </div>
          </div>
        )}

        {activeType === 'finance' && (
          <div>
            <label className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1 block">Categoria Financeira</label>
            <select className="input" value={financeCategory} onChange={e => setFinanceCategory(e.target.value)}>
              {FINANCE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}

        {activeType === 'goal' && (
          <div>
            <label className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1 block">Área da Vida</label>
            <select className="input" value={goalArea} onChange={e => setGoalArea(e.target.value)}>
              {GOAL_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        )}

        {activeType !== 'finance' && activeType !== 'goal' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1 block">Categoria</label>
              <select className="input" value={category} onChange={e => setCategory(e.target.value as EventCategory)}>
                <option value="personal">Pessoal</option>
                <option value="work">Trabalho</option>
                <option value="study">Estudo</option>
                <option value="health">Saúde</option>
                <option value="fitness">Academia</option>
                <option value="spiritual">Espiritual</option>
                <option value="finance">Finanças</option>
                <option value="other">Outros</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1 block">Prioridade</label>
              <select className="input" value={priority} onChange={e => setPriority(e.target.value as Priority)}>
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>
        )}

        {activeType !== 'note' && (
          <div style={{ display: 'grid', gridTemplateColumns: activeType === 'habit' || activeType === 'goal' ? '1fr' : '1fr 1fr', gap: 12 }}>
            <div>
              <label className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1 block">
                {activeType === 'goal' ? 'Data Alvo' : activeType === 'habit' ? 'Data Início' : 'Data'}
              </label>
              <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            {activeType !== 'habit' && activeType !== 'goal' && (
              <div>
                <label className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1 block">Horário</label>
                <input type="time" className="input" value={time} onChange={e => setTime(e.target.value)} />
              </div>
            )}
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1 block">
            {activeType === 'note' ? 'Conteúdo da Nota' : 'Descrição / Detalhes (opcional)'}
          </label>
          <textarea
            className="input"
            rows={3}
            placeholder="Adicione notas, links ou detalhes adicionais..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
}
