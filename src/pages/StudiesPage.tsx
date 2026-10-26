import { useState, useEffect } from 'react';
import {
  BookOpen, Plus, Play, Pause, RotateCcw, Clock,
  CheckCircle2, Trash2, Edit3, Briefcase, GraduationCap
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
import type { Project, Priority } from '../types';

export default function StudiesPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);

  // Pomodoro Focus Timer State
  const [timerMode, setTimerMode] = useState<'focus' | 'break'>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 min in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'study' | 'work' | 'personal'>('study');
  const [priority, setPriority] = useState<Priority>('high');
  const [dueDate, setDueDate] = useState('');

  const loadProjects = () => {
    if (!user) return;
    setProjects(getAllItems<Project>('projects', user.id));
  };

  useEffect(() => {
    loadProjects();
  }, [user]);

  // Pomodoro timer tick
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      addToast({
        type: 'success',
        title: timerMode === 'focus' ? 'Bloco de foco concluído!' : 'Descanso encerrado!',
        message: timerMode === 'focus' ? 'Parabéns pela dedicação. Faça uma pausa de 5 minutos.' : 'Pronto para o próximo bloco de foco?',
      });
      // Switch mode
      if (timerMode === 'focus') {
        setTimerMode('break');
        setTimeLeft(5 * 60);
      } else {
        setTimerMode('focus');
        setTimeLeft(25 * 60);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeLeft, timerMode, addToast]);

  const toggleTimer = () => setIsTimerRunning(prev => !prev);

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(timerMode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const switchMode = (mode: 'focus' | 'break') => {
    setIsTimerRunning(false);
    setTimerMode(mode);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const openCreateModal = () => {
    setEditingProject(null);
    setTitle('');
    setDescription('');
    setCategory('study');
    setPriority('high');
    setDueDate('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Project) => {
    setEditingProject(p);
    setTitle(p.title);
    setDescription(p.description || '');
    setCategory(p.category);
    setPriority(p.priority);
    setDueDate(p.due_date || '');
    setIsModalOpen(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) return;

    if (editingProject) {
      updateItem<Project>('projects', user.id, editingProject.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        priority,
        due_date: dueDate || undefined,
      });
      addToast({ type: 'success', title: 'Projeto atualizado!' });
    } else {
      createItem<Project>('projects', user.id, {
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        priority,
        status: 'active',
        due_date: dueDate || undefined,
      });
      addToast({ type: 'success', title: 'Projeto criado com sucesso!' });
    }

    setIsModalOpen(false);
    loadProjects();
  };

  const handleToggleStatus = (p: Project) => {
    if (!user) return;
    const newStatus = p.status === 'completed' ? 'active' : 'completed';
    updateItem<Project>('projects', user.id, p.id, {
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined,
    });
    setProjects(prev => prev.map(proj => proj.id === p.id ? { ...proj, status: newStatus } : proj));
    addToast({
      type: 'info',
      title: newStatus === 'completed' ? 'Projeto marcado como concluído!' : 'Projeto reaberto',
    });
  };

  const handleDeleteProject = () => {
    if (!projectToDelete || !user) return;
    deleteItem<Project>('projects', user.id, projectToDelete.id);
    setProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
    setProjectToDelete(null);
    addToast({ type: 'success', title: 'Projeto excluído!' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Estudos & Trabalho</h1>
          <p className="text-sm text-secondary" style={{ margin: '4px 0 0' }}>
            Gerenciamento de projetos, cursos, sprints e cronômetro de foco produtivo.
          </p>
        </div>

        <Button variant="primary" onClick={openCreateModal}>
          <Plus size={18} /> Novo Projeto
        </Button>
      </div>

      {/* Grid: Pomodoro Timer & Projects */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) 1fr', gap: 'var(--space-6)', alignItems: 'flex-start' }}>
        {/* Pomodoro Focus Timer Card */}
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} className="text-primary" />
              <span>Cronômetro Pomodoro</span>
            </div>
          }
          subtitle="Técnica de foco profundo e pausas regulares"
        >
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
            <Button
              variant={timerMode === 'focus' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => switchMode('focus')}
            >
              Foco (25 min)
            </Button>
            <Button
              variant={timerMode === 'break' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => switchMode('break')}
            >
              Pausa (5 min)
            </Button>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px 0',
            }}
          >
            <span
              style={{
                fontSize: '3.6rem',
                fontWeight: 800,
                fontFamily: 'monospace',
                letterSpacing: 2,
                color: timerMode === 'focus' ? 'var(--color-primary-600)' : '#16a34a',
              }}
            >
              {timeFormatted}
            </span>
            <span className="text-xs text-secondary mt-1 font-semibold uppercase">
              {timerMode === 'focus' ? 'Sessão de Foco' : 'Tempo de Descanso'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <Button
              variant={isTimerRunning ? 'outline' : 'primary'}
              onClick={toggleTimer}
              style={{ minWidth: 110 }}
            >
              {isTimerRunning ? (
                <>
                  <Pause size={16} /> Pausar
                </>
              ) : (
                <>
                  <Play size={16} /> Iniciar
                </>
              )}
            </Button>
            <Button variant="ghost" onClick={resetTimer} aria-label="Reiniciar">
              <RotateCcw size={16} />
            </Button>
          </div>
        </Card>

        {/* Projects List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <h3 className="text-base font-semibold text-primary" style={{ margin: 0 }}>Projetos em Andamento</h3>

          {projects.length === 0 ? (
            <EmptyState
              icon={<BookOpen size={28} />}
              title="Nenhum projeto cadastrado"
              description="Cadastre seus estudos, livros, cursos e projetos profissionais para acompanhar entregas."
              actionLabel="Criar Projeto"
              onAction={openCreateModal}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {projects.map(project => {
                const isCompleted = project.status === 'completed';

                return (
                  <Card
                    key={project.id}
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(project)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: isCompleted ? '#16a34a' : 'var(--text-tertiary)' }}
                        >
                          <CheckCircle2 size={20} />
                        </button>
                        <span style={{ textDecoration: isCompleted ? 'line-through' : 'none' }}>
                          {project.title}
                        </span>
                      </div>
                    }
                    action={
                      <div style={{ display: 'flex', gap: 4 }}>
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(project)} style={{ padding: 4 }}>
                          <Edit3 size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setProjectToDelete(project)} style={{ padding: 4 }}>
                          <Trash2 size={14} style={{ color: '#ef4444' }} />
                        </Button>
                      </div>
                    }
                    footer={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <Badge variant={project.category === 'study' ? 'primary' : 'secondary'} size="sm">
                            {project.category === 'study' ? <><GraduationCap size={12} className="inline mr-1" /> Estudo</> : <><Briefcase size={12} className="inline mr-1" /> Trabalho</>}
                          </Badge>
                          <Badge variant={project.priority === 'urgent' ? 'danger' : project.priority === 'high' ? 'warning' : 'primary'} size="sm">
                            {project.priority}
                          </Badge>
                        </div>
                        {project.due_date && (
                          <span className="text-xs text-secondary font-mono">
                            Prazo: {project.due_date}
                          </span>
                        )}
                      </div>
                    }
                  >
                    {project.description && (
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {project.description}
                      </p>
                    )}
                    {project.notes && (
                      <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, backgroundColor: 'var(--surface-bg)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {project.notes}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Editar Projeto' : 'Novo Projeto'}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, width: '100%' }}>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleSaveProject}>Salvar Projeto</Button>
          </div>
        }
      >
        <form onSubmit={handleSaveProject} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Título do Projeto</label>
            <input
              type="text"
              className="input"
              placeholder="Ex: Certificação AWS, TCC, Curso de TypeScript..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Descrição / Escopo</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Objetivos e principais entregas deste projeto..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Categoria</label>
              <select className="input" value={category} onChange={e => setCategory(e.target.value as any)}>
                <option value="study">Estudo</option>
                <option value="work">Trabalho</option>
                <option value="personal">Pessoal</option>
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

          <div>
            <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Prazo Final (opcional)</label>
            <input type="date" className="input" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDeleteProject}
        title="Excluir Projeto"
        message={`Deseja realmente excluir o projeto "${projectToDelete?.title}"?`}
      />
    </div>
  );
}
