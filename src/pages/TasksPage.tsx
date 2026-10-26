import { useState, useEffect } from 'react';
import {
  CheckSquare, Plus, Search, Filter, Kanban, List as ListIcon,
  Trash2, Edit3, CheckCircle2, Circle, Clock, Tag
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
import type { Task, Priority, EventCategory, TaskStatus, Subtask } from '../types';
import { v4 as uuidv4 } from 'uuid';

export default function TasksPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | EventCategory>('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventCategory>('work');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>('pending');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [subtasksList, setSubtasksList] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const loadTasks = () => {
    if (!user) return;
    setTasks(getAllItems<Task>('tasks', user.id));
  };

  useEffect(() => {
    loadTasks();
  }, [user]);

  const openCreateModal = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setCategory('work');
    setPriority('medium');
    setStatus('pending');
    setDueDate(new Date().toISOString().split('T')[0]);
    setDueTime('12:00');
    setTagsInput('');
    setSubtasksList([]);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setCategory(task.category);
    setPriority(task.priority);
    setStatus(task.status);
    setDueDate(task.due_date || '');
    setDueTime(task.due_time || '');
    setTagsInput(task.tags ? task.tags.join(', ') : '');
    setSubtasksList(task.subtasks ? task.subtasks.map(s => ({ id: s.id, title: s.title, completed: s.completed })) : []);
    setIsModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) return;

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const formattedSubtasks: Subtask[] = subtasksList.map((s, index) => ({
      id: s.id,
      task_id: editingTask ? editingTask.id : '',
      title: s.title,
      completed: s.completed,
      order_index: index,
      created_at: new Date().toISOString(),
    }));

    if (editingTask) {
      updateItem<Task>('tasks', user.id, editingTask.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        priority,
        status,
        due_date: dueDate || undefined,
        due_time: dueTime || undefined,
        tags,
        subtasks: formattedSubtasks,
        completed_at: status === 'completed' ? (editingTask.completed_at || new Date().toISOString()) : undefined,
      });
      addToast({ type: 'success', title: 'Tarefa atualizada!' });
    } else {
      createItem<Task>('tasks', user.id, {
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        priority,
        status,
        due_date: dueDate || undefined,
        due_time: dueTime || undefined,
        tags,
        subtasks: formattedSubtasks,
        order_index: tasks.length,
      });
      addToast({ type: 'success', title: 'Tarefa criada com sucesso!' });
    }

    setIsModalOpen(false);
    loadTasks();
  };

  const handleToggleStatus = (task: Task) => {
    if (!user) return;
    const newStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';
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

  const handleToggleSubtask = (task: Task, subtaskId: string) => {
    if (!user || !task.subtasks) return;
    const updatedSubtasks = task.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s);
    updateItem<Task>('tasks', user.id, task.id, { subtasks: updatedSubtasks });
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, subtasks: updatedSubtasks } : t));
  };

  const handleDeleteTask = () => {
    if (!taskToDelete || !user) return;
    deleteItem<Task>('tasks', user.id, taskToDelete.id);
    setTasks(prev => prev.filter(t => t.id !== taskToDelete.id));
    setTaskToDelete(null);
    addToast({ type: 'success', title: 'Tarefa excluída!' });
  };

  const addSubtaskToForm = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasksList(prev => [...prev, { id: uuidv4(), title: newSubtaskTitle.trim(), completed: false }]);
    setNewSubtaskTitle('');
  };

  const removeSubtaskFromForm = (id: string) => {
    setSubtasksList(prev => prev.filter(s => s.id !== id));
  };

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.description?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    return true;
  });

  const priorityBadgeVariant = (p: Priority) => {
    switch (p) {
      case 'urgent': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'primary';
      default: return 'secondary';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header with Title, Mode Switcher & Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Gerenciador de Tarefas</h1>
          <p className="text-sm text-secondary" style={{ margin: '4px 0 0' }}>
            Organize, priorize e acompanhe suas atividades em tempo real.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', backgroundColor: 'var(--color-neutral-200)', borderRadius: 'var(--border-radius-md)', padding: 3 }}>
            <button
              className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('list')}
              style={{ padding: '6px 12px' }}
            >
              <ListIcon size={16} /> Lista
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'kanban' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('kanban')}
              style={{ padding: '6px 12px' }}
            >
              <Kanban size={16} /> Kanban
            </button>
          </div>

          <Button variant="primary" onClick={openCreateModal}>
            <Plus size={18} /> Nova Tarefa
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Search size={16} className="text-secondary" />
            <input
              type="text"
              className="input"
              placeholder="Buscar tarefas..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: '6px 12px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Filter size={16} className="text-secondary" />
            <select
              className="input"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              style={{ width: 'auto', padding: '6px 12px' }}
            >
              <option value="all">Todos os Status</option>
              <option value="pending">Pendentes</option>
              <option value="in_progress">Em Andamento</option>
              <option value="completed">Concluídas</option>
            </select>

            <select
              className="input"
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value as any)}
              style={{ width: 'auto', padding: '6px 12px' }}
            >
              <option value="all">Todas Prioridades</option>
              <option value="urgent">Urgente</option>
              <option value="high">Alta</option>
              <option value="medium">Média</option>
              <option value="low">Baixa</option>
            </select>

            <select
              className="input"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value as any)}
              style={{ width: 'auto', padding: '6px 12px' }}
            >
              <option value="all">Todas Categorias</option>
              <option value="work">Trabalho</option>
              <option value="personal">Pessoal</option>
              <option value="study">Estudos</option>
              <option value="health">Saúde</option>
              <option value="finance">Finanças</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Content Rendering: List or Kanban */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare size={28} />}
          title="Nenhuma tarefa encontrada"
          description="Crie uma nova tarefa ou ajuste os filtros de pesquisa."
          actionLabel="Criar Tarefa"
          onAction={openCreateModal}
        />
      ) : viewMode === 'list' ? (
        /* List View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredTasks.map(task => {
            const isCompleted = task.status === 'completed';
            return (
              <Card
                key={task.id}
                style={{
                  padding: '12px 16px',
                  backgroundColor: isCompleted ? 'var(--color-neutral-100)' : 'var(--surface-card)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1 }}>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(task)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 2, color: isCompleted ? '#16a34a' : 'var(--text-tertiary)' }}
                    >
                      {isCompleted ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                    </button>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <h4
                          style={{
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            margin: 0,
                            textDecoration: isCompleted ? 'line-through' : 'none',
                            color: isCompleted ? 'var(--text-tertiary)' : 'var(--text-primary)',
                          }}
                        >
                          {task.title}
                        </h4>
                        <Badge variant={priorityBadgeVariant(task.priority)} size="sm">
                          {task.priority.toUpperCase()}
                        </Badge>
                        <Badge variant="secondary" size="sm">
                          {task.category}
                        </Badge>
                      </div>

                      {task.description && (
                        <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {task.description}
                        </p>
                      )}

                      {/* Subtasks */}
                      {task.subtasks && task.subtasks.length > 0 && (
                        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 8, borderLeft: '2px solid var(--border-color)' }}>
                          {task.subtasks.map(s => (
                            <div
                              key={s.id}
                              onClick={() => handleToggleSubtask(task, s.id)}
                              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', cursor: 'pointer', color: s.completed ? 'var(--text-tertiary)' : 'var(--text-primary)' }}
                            >
                              {s.completed ? <CheckCircle2 size={14} style={{ color: '#16a34a' }} /> : <Circle size={14} />}
                              <span style={{ textDecoration: s.completed ? 'line-through' : 'none' }}>{s.title}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Meta Tags & Dates */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10, flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {task.due_date && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={12} /> Prazo: {task.due_date} {task.due_time ? `às ${task.due_time}` : ''}
                          </div>
                        )}
                        {task.tags && task.tags.length > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Tag size={12} />
                            {task.tags.map(t => <span key={t} style={{ backgroundColor: 'var(--color-neutral-200)', padding: '2px 6px', borderRadius: 4 }}>#{t}</span>)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(task)} aria-label="Editar">
                      <Edit3 size={15} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setTaskToDelete(task)} aria-label="Excluir">
                      <Trash2 size={15} style={{ color: '#ef4444' }} />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Kanban View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
          {(['pending', 'in_progress', 'completed'] as TaskStatus[]).map(colStatus => {
            const colTasks = filteredTasks.filter(t => t.status === colStatus);
            const colTitles: Record<TaskStatus, string> = {
              pending: 'A Fazer',
              in_progress: 'Em Progresso',
              completed: 'Concluído',
              cancelled: 'Cancelado',
            };

            return (
              <div
                key={colStatus}
                style={{
                  backgroundColor: 'var(--surface-card)',
                  borderRadius: 'var(--border-radius-lg)',
                  border: '1px solid var(--border-color)',
                  padding: 'var(--space-4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: '1px solid var(--border-color)' }}>
                  <span className="font-semibold text-sm">{colTitles[colStatus]}</span>
                  <Badge variant={colStatus === 'completed' ? 'success' : colStatus === 'in_progress' ? 'primary' : 'secondary'} size="sm">
                    {colTasks.length}
                  </Badge>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 150 }}>
                  {colTasks.map(task => (
                    <div
                      key={task.id}
                      style={{
                        padding: 12,
                        borderRadius: 'var(--border-radius-md)',
                        backgroundColor: 'var(--surface-bg)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span className="font-semibold text-sm text-primary">{task.title}</span>
                        <Badge variant={priorityBadgeVariant(task.priority)} size="sm">
                          {task.priority}
                        </Badge>
                      </div>

                      {task.description && (
                        <p className="text-xs text-secondary line-clamp-2" style={{ margin: 0 }}>
                          {task.description}
                        </p>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                        <span className="text-xs text-secondary">{task.due_date || 'Sem data'}</span>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <Button variant="ghost" size="sm" onClick={() => openEditModal(task)} style={{ padding: 4 }}>
                            <Edit3 size={13} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setTaskToDelete(task)} style={{ padding: 4 }}>
                            <Trash2 size={13} style={{ color: '#ef4444' }} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, width: '100%' }}>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleSaveTask}>Salvar Tarefa</Button>
          </div>
        }
      >
        <form onSubmit={handleSaveTask} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Título</label>
            <input
              type="text"
              className="input"
              placeholder="O que precisa ser feito?"
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
              rows={3}
              placeholder="Instruções, links ou notas..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Categoria</label>
              <select className="input" value={category} onChange={e => setCategory(e.target.value as any)}>
                <option value="work">Trabalho</option>
                <option value="personal">Pessoal</option>
                <option value="study">Estudos</option>
                <option value="health">Saúde</option>
                <option value="fitness">Academia</option>
                <option value="finance">Finanças</option>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Data de Vencimento</label>
              <input type="date" className="input" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Horário</label>
              <input type="time" className="input" value={dueTime} onChange={e => setDueTime(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Tags (separadas por vírgula)</label>
            <input
              type="text"
              className="input"
              placeholder="ex: Projeto, Urgente, Cliente"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
            />
          </div>

          {/* Subtasks Section */}
          <div>
            <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Subtarefas / Checklist</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                type="text"
                className="input"
                placeholder="Adicionar etapa..."
                value={newSubtaskTitle}
                onChange={e => setNewSubtaskTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSubtaskToForm();
                  }
                }}
              />
              <Button type="button" variant="outline" size="sm" onClick={addSubtaskToForm}>
                Adicionar
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {subtasksList.map(s => (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    borderRadius: 'var(--border-radius-sm)',
                    backgroundColor: 'var(--color-neutral-100)',
                    fontSize: '0.85rem',
                  }}
                >
                  <span>{s.title}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeSubtaskFromForm(s.id)} style={{ padding: 2 }}>
                    <Trash2 size={13} style={{ color: '#ef4444' }} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleDeleteTask}
        title="Excluir Tarefa"
        message={`Tem certeza que deseja excluir a tarefa "${taskToDelete?.title}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}
