import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Bell, Plus, Clock, CheckCircle2, Trash2, Edit3,
  Calendar, RotateCcw
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getAllItems, createItem, updateItem, deleteItem } from '../services/storage';
import type { Reminder, Priority, EventCategory, ReminderStatus } from '../types';

export default function RemindersPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [reminderToDelete, setReminderToDelete] = useState<Reminder | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<EventCategory>('personal');
  const [date, setDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState('09:00');
  const [priority, setPriority] = useState<Priority>('medium');

  const loadReminders = () => {
    if (!user) return;
    setReminders(getAllItems<Reminder>('reminders', user.id));
  };

  useEffect(() => {
    loadReminders();
  }, [user]);

  const openCreateModal = () => {
    setEditingReminder(null);
    setTitle('');
    setMessage('');
    setCategory('personal');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setTime('09:00');
    setPriority('medium');
    setIsModalOpen(true);
  };

  const openEditModal = (r: Reminder) => {
    setEditingReminder(r);
    setTitle(r.title);
    setMessage(r.message || '');
    setCategory(r.category);
    setDate(r.date);
    setTime(r.time);
    setPriority(r.priority);
    setIsModalOpen(true);
  };

  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) return;

    if (editingReminder) {
      updateItem<Reminder>('reminders', user.id, editingReminder.id, {
        title: title.trim(),
        message: message.trim() || undefined,
        category,
        date,
        time,
        priority,
      });
      addToast({ type: 'success', title: 'Lembrete atualizado!' });
    } else {
      createItem<Reminder>('reminders', user.id, {
        user_id: user.id,
        title: title.trim(),
        message: message.trim() || undefined,
        category,
        date,
        time,
        priority,
        status: 'active',
      });
      addToast({ type: 'success', title: 'Lembrete criado com sucesso!' });
    }

    setIsModalOpen(false);
    loadReminders();
  };

  const handleToggleComplete = (r: Reminder) => {
    if (!user) return;
    const newStatus: ReminderStatus = r.status === 'completed' ? 'active' : 'completed';
    updateItem<Reminder>('reminders', user.id, r.id, {
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined,
    });
    setReminders(prev => prev.map(rem => rem.id === r.id ? { ...rem, status: newStatus } : rem));
    addToast({
      type: newStatus === 'completed' ? 'success' : 'info',
      title: newStatus === 'completed' ? 'Lembrete concluído!' : 'Lembrete reativado',
    });
  };

  const handleDeleteReminder = () => {
    if (!reminderToDelete || !user) return;
    deleteItem<Reminder>('reminders', user.id, reminderToDelete.id);
    setReminders(prev => prev.filter(r => r.id !== reminderToDelete.id));
    setReminderToDelete(null);
    addToast({ type: 'success', title: 'Lembrete excluído!' });
  };

  const filteredReminders = reminders.filter(r => {
    if (filter === 'active') return r.status === 'active' || r.status === 'snoozed';
    if (filter === 'completed') return r.status === 'completed';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Lembretes & Notificações</h1>
          <p className="text-sm text-secondary" style={{ margin: '4px 0 0' }}>
            Nunca perca um compromisso, medicamento, conta ou tarefa essencial.
          </p>
        </div>

        <Button variant="primary" onClick={openCreateModal}>
          <Plus size={18} /> Novo Lembrete
        </Button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8 }}>
        {(['active', 'completed', 'all'] as const).map(tab => (
          <Button
            key={tab}
            variant={filter === tab ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter(tab)}
          >
            {tab === 'active' ? 'Ativos' : tab === 'completed' ? 'Concluídos' : 'Todos'}
          </Button>
        ))}
      </div>

      {/* Reminders List */}
      {filteredReminders.length === 0 ? (
        <EmptyState
          icon={<Bell size={28} />}
          title="Nenhum lembrete encontrado"
          description="Crie lembretes com data e horário para manter seu dia pontual."
          actionLabel="Criar Lembrete"
          onAction={openCreateModal}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredReminders.map(reminder => {
            const isCompleted = reminder.status === 'completed';

            return (
              <Card
                key={reminder.id}
                style={{
                  padding: '12px 16px',
                  backgroundColor: isCompleted ? 'var(--color-neutral-100)' : 'var(--surface-card)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                    <button
                      type="button"
                      onClick={() => handleToggleComplete(reminder)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: isCompleted ? '#16a34a' : 'var(--text-tertiary)' }}
                    >
                      {isCompleted ? <CheckCircle2 size={22} /> : <Clock size={22} />}
                    </button>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            textDecoration: isCompleted ? 'line-through' : 'none',
                            color: isCompleted ? 'var(--text-tertiary)' : 'var(--text-primary)',
                          }}
                        >
                          {reminder.title}
                        </span>
                        <Badge variant={reminder.priority === 'urgent' ? 'danger' : reminder.priority === 'high' ? 'warning' : 'primary'} size="sm">
                          {reminder.priority}
                        </Badge>
                        <Badge variant="secondary" size="sm">{reminder.category}</Badge>
                      </div>

                      {reminder.message && (
                        <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {reminder.message}
                        </p>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar size={12} /> {reminder.date} às {reminder.time}
                        </span>
                        {reminder.recurrence && (
                          <span className="flex items-center gap-1">
                            <RotateCcw size={12} /> Repete: {reminder.recurrence}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 4 }}>
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(reminder)} style={{ padding: 4 }}>
                      <Edit3 size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setReminderToDelete(reminder)} style={{ padding: 4 }}>
                      <Trash2 size={14} style={{ color: '#ef4444' }} />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Reminder Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingReminder ? 'Editar Lembrete' : 'Novo Lembrete'}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, width: '100%' }}>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleSaveReminder}>Salvar Lembrete</Button>
          </div>
        }
      >
        <form onSubmit={handleSaveReminder} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Título</label>
            <input
              type="text"
              className="input"
              placeholder="Ex: Tomar remédio, Pagar fatura..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Mensagem / Observação</label>
            <textarea
              className="input"
              rows={2}
              placeholder="Notas adicionais..."
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Data</label>
              <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Horário</label>
              <input type="time" className="input" value={time} onChange={e => setTime(e.target.value)} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Categoria</label>
              <select className="input" value={category} onChange={e => setCategory(e.target.value as any)}>
                <option value="personal">Pessoal</option>
                <option value="health">Saúde</option>
                <option value="finance">Finanças</option>
                <option value="work">Trabalho</option>
                <option value="spiritual">Espiritual</option>
                <option value="other">Outros</option>
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
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!reminderToDelete}
        onClose={() => setReminderToDelete(null)}
        onConfirm={handleDeleteReminder}
        title="Excluir Lembrete"
        message={`Deseja realmente excluir o lembrete "${reminderToDelete?.title}"?`}
      />
    </div>
  );
}
