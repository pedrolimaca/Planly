import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Dumbbell, Plus, Clock, Trash2, Edit3, CheckCircle2,
  Flame, Award, ExternalLink, Play, HelpCircle, Shield
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
import {
  findExerciseGuide,
  exerciseExecutionGuides,
  type ExerciseGuide
} from '../services/transformationContent';
import type { Workout, WorkoutLog, WorkoutExercise } from '../types';
import { v4 as uuidv4 } from 'uuid';

export default function FitnessPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);

  // Exercise Execution Modal
  const [selectedGuide, setSelectedGuide] = useState<ExerciseGuide | null>(null);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [workoutToDelete, setWorkoutToDelete] = useState<Workout | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [muscleGroupsInput, setMuscleGroupsInput] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [exercisesList, setExercisesList] = useState<WorkoutExercise[]>([]);

  // Exercise Sub-Form
  const [exName, setExName] = useState('');
  const [exSets, setExSets] = useState('4');
  const [exReps, setExReps] = useState('10');
  const [exWeight, setExWeight] = useState('');

  const loadData = () => {
    if (!user) return;
    setWorkouts(getAllItems<Workout>('workouts', user.id));
    setWorkoutLogs(getAllItems<WorkoutLog>('workout_logs', user.id));
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const openCreateModal = () => {
    setEditingWorkout(null);
    setName('');
    setDescription('');
    setMuscleGroupsInput('Peito, Tríceps, Ombros');
    setDurationMinutes('60');
    setExercisesList([]);
    setIsModalOpen(true);
  };

  const openEditModal = (w: Workout) => {
    setEditingWorkout(w);
    setName(w.name);
    setDescription(w.description || '');
    setMuscleGroupsInput(w.muscle_groups.join(', '));
    setDurationMinutes(String(w.duration_minutes || 60));
    setExercisesList(w.exercises || []);
    setIsModalOpen(true);
  };

  const addExerciseToForm = () => {
    if (!exName.trim()) return;
    const newEx: WorkoutExercise = {
      id: uuidv4(),
      workout_id: editingWorkout ? editingWorkout.id : '',
      name: exName.trim(),
      sets: parseInt(exSets) || 3,
      reps: exReps.trim() || '10',
      weight: exWeight ? parseFloat(exWeight) : undefined,
      order_index: exercisesList.length,
    };
    setExercisesList(prev => [...prev, newEx]);
    setExName('');
    setExWeight('');
  };

  const removeExerciseFromForm = (id: string) => {
    setExercisesList(prev => prev.filter(e => e.id !== id));
  };

  const handleSaveWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user) return;

    const muscleGroups = muscleGroupsInput
      .split(',')
      .map(m => m.trim())
      .filter(Boolean);

    if (editingWorkout) {
      updateItem<Workout>('workouts', user.id, editingWorkout.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        muscle_groups: muscleGroups,
        duration_minutes: parseInt(durationMinutes) || 60,
        exercises: exercisesList,
      });
      addToast({ type: 'success', title: 'Ficha de treino atualizada!' });
    } else {
      createItem<Workout>('workouts', user.id, {
        user_id: user.id,
        name: name.trim(),
        description: description.trim() || undefined,
        muscle_groups: muscleGroups,
        duration_minutes: parseInt(durationMinutes) || 60,
        active: true,
        exercises: exercisesList,
      });
      addToast({ type: 'success', title: 'Novo treino cadastrado!' });
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleDeleteWorkout = () => {
    if (!workoutToDelete || !user) return;
    deleteItem<Workout>('workouts', user.id, workoutToDelete.id);
    setWorkouts(prev => prev.filter(w => w.id !== workoutToDelete.id));
    setWorkoutToDelete(null);
    addToast({ type: 'success', title: 'Treino removido!' });
  };

  const handleQuickLog = (workout: Workout) => {
    if (!user) return;
    createItem<WorkoutLog>('workout_logs', user.id, {
      user_id: user.id,
      workout_id: workout.id,
      date: format(new Date(), 'yyyy-MM-dd'),
      duration_minutes: workout.duration_minutes || 60,
      notes: `Treino "${workout.name}" realizado com sucesso!`,
      exercises: workout.exercises.map(e => ({
        exercise_name: e.name,
        sets_completed: e.sets,
        reps_completed: e.reps,
        weight_used: e.weight,
      })),
    });
    addToast({ type: 'success', title: 'Treino registrado no histórico!', message: 'Ótimo trabalho! Mantenha a constância.' });
    loadData();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Academia & Treinos</h1>
          <p className="text-sm text-secondary" style={{ margin: '4px 0 0' }}>
            Planejamento de rotinas, controle de cargas e histórico de treinos.
          </p>
        </div>

        <Button variant="primary" onClick={openCreateModal}>
          <Plus size={18} /> Nova Ficha de Treino
        </Button>
      </div>

      {/* Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-xs font-semibold text-secondary uppercase">Treinos Realizados</span>
            <div style={{ width: 34, height: 34, borderRadius: '10px', backgroundColor: 'var(--color-accent-50)', color: 'var(--color-accent-text)', border: '1px solid var(--color-accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flame size={16} />
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800 }}>{workoutLogs.length} sessões</span>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-xs font-semibold text-secondary uppercase">Fichas Ativas</span>
            <div style={{ width: 34, height: 34, borderRadius: '10px', backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-600)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Dumbbell size={16} />
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800 }}>{workouts.length} fichas</span>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-xs font-semibold text-secondary uppercase">Último Treino</span>
            <div style={{ width: 34, height: 34, borderRadius: '10px', backgroundColor: 'var(--color-success-50)', color: 'var(--color-success-text)', border: '1px solid var(--color-success-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={16} />
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>
              {workoutLogs.length > 0 ? workoutLogs[workoutLogs.length - 1].date : 'Nenhum ainda'}
            </span>
          </div>
        </Card>
      </div>

      {/* Quick Anatomical Movement Library */}
      <div style={{
        backgroundColor: 'var(--surface-card)',
        borderRadius: 'var(--border-radius-lg)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1.1rem' }}>📖</span>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Guias de Execução Correta & Tutoriais em Vídeo
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Aprenda a postura anatômica perfeita dos grandes movimentos para evitar lesões e crescer rápido
              </span>
            </div>
          </div>
          <Badge variant="danger" size="sm">Prevenção de Lesões</Badge>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
          {exerciseExecutionGuides.map(guide => (
            <button
              key={guide.id}
              type="button"
              onClick={() => setSelectedGuide(guide)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: '6px',
                backgroundColor: 'var(--surface-bg)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)', fontSize: '0.78rem', fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#ef4444';
                e.currentTarget.style.color = '#ef4444';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
            >
              <HelpCircle size={13} style={{ color: '#ef4444' }} /> {guide.name.split(' ')[0]} {guide.name.split(' ')[1] || ''}
            </button>
          ))}
        </div>
      </div>

      {/* Workouts Grid */}
      {workouts.length === 0 ? (
        <EmptyState
          icon={<Dumbbell size={28} />}
          title="Nenhuma ficha de treino cadastrada"
          description="Crie suas divisões de treino (ex: Treino A - Peito, Treino B - Costas) com séries e cargas."
          actionLabel="Criar Ficha"
          onAction={openCreateModal}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
          {workouts.map(workout => (
            <Card
              key={workout.id}
              title={workout.name}
              subtitle={workout.description}
              action={
                <div style={{ display: 'flex', gap: 4 }}>
                  <Button variant="ghost" size="sm" onClick={() => openEditModal(workout)} style={{ padding: 4 }}>
                    <Edit3 size={14} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setWorkoutToDelete(workout)} style={{ padding: 4 }}>
                    <Trash2 size={14} style={{ color: '#ef4444' }} />
                  </Button>
                </div>
              }
              footer={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="text-xs text-secondary flex items-center gap-1">
                    <Clock size={13} /> {workout.duration_minutes || 60} minutos
                  </span>
                  <Button variant="primary" size="sm" onClick={() => handleQuickLog(workout)}>
                    <CheckCircle2 size={14} /> Concluir Treino
                  </Button>
                </div>
              }
            >
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {workout.muscle_groups.map(m => (
                  <Badge key={m} variant="secondary" size="sm">{m}</Badge>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {workout.exercises.map((ex, i) => {
                  const guide = findExerciseGuide(ex.name);
                  return (
                    <div
                      key={ex.id || i}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 10px',
                        borderRadius: 'var(--border-radius-sm)',
                        backgroundColor: 'var(--surface-bg)',
                        fontSize: '0.85rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                        <span className="font-medium text-primary" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ex.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedGuide(guide)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 4,
                            color: '#ef4444', fontWeight: 700, fontSize: '0.7rem',
                            padding: '2px 6px', borderRadius: '4px',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            flexShrink: 0
                          }}
                          title="Como fazer este exercício corretamente"
                        >
                          <HelpCircle size={11} /> Guia
                        </button>
                      </div>
                      <span className="text-xs text-secondary font-semibold" style={{ flexShrink: 0, marginLeft: 8 }}>
                        {ex.sets}x {ex.reps} {ex.weight ? `• ${ex.weight}kg` : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Workout Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWorkout ? 'Editar Ficha' : 'Nova Ficha de Treino'}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, width: '100%' }}>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleSaveWorkout}>Salvar Ficha</Button>
          </div>
        }
      >
        <form onSubmit={handleSaveWorkout} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Nome do Treino</label>
            <input
              type="text"
              className="input"
              placeholder="Ex: Treino A - Peito e Tríceps"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Descrição / Foco</label>
            <input
              type="text"
              className="input"
              placeholder="Ex: Hipertrofia e força em empurrar"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Grupos Musculares</label>
              <input
                type="text"
                className="input"
                placeholder="Ex: Peito, Tríceps, Ombros"
                value={muscleGroupsInput}
                onChange={e => setMuscleGroupsInput(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Duração Estimada (min)</label>
              <input
                type="number"
                className="input"
                value={durationMinutes}
                onChange={e => setDurationMinutes(e.target.value)}
              />
            </div>
          </div>

          {/* Exercises in form */}
          <div>
            <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Exercícios da Ficha</label>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <input
                type="text"
                className="input"
                placeholder="Nome (ex: Supino)"
                value={exName}
                onChange={e => setExName(e.target.value)}
              />
              <input
                type="number"
                className="input"
                placeholder="Séries"
                value={exSets}
                onChange={e => setExSets(e.target.value)}
              />
              <input
                type="text"
                className="input"
                placeholder="Reps"
                value={exReps}
                onChange={e => setExReps(e.target.value)}
              />
              <input
                type="number"
                className="input"
                placeholder="Carga (kg)"
                value={exWeight}
                onChange={e => setExWeight(e.target.value)}
              />
              <Button type="button" variant="outline" size="sm" onClick={addExerciseToForm}>
                +
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 180, overflowY: 'auto' }}>
              {exercisesList.map(ex => (
                <div
                  key={ex.id}
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
                  <span className="font-medium">{ex.name} ({ex.sets}x {ex.reps} {ex.weight ? `• ${ex.weight}kg` : ''})</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeExerciseFromForm(ex.id)} style={{ padding: 2 }}>
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
        isOpen={!!workoutToDelete}
        onClose={() => setWorkoutToDelete(null)}
        onConfirm={handleDeleteWorkout}
        title="Excluir Ficha de Treino"
        message={`Tem certeza que deseja excluir o treino "${workoutToDelete?.name}"?`}
      />

      {/* Exercise Execution Modal */}
      {selectedGuide && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedGuide(null)}
          title={`Como Executar: ${selectedGuide.name}`}
          size="lg"
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: 8 }}>
              <Button variant="ghost" onClick={() => setSelectedGuide(null)}>
                Fechar Guia
              </Button>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedGuide.videoQuery)}`}
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
            <div style={{
              padding: '12px 14px', borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase' }}>
                  🎯 MÚSCULOS ALVO:
                </span>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {selectedGuide.targetMuscles}
                </div>
              </div>
              <Badge variant="danger" size="sm">
                {selectedGuide.defaultSetsReps}
              </Badge>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={16} style={{ color: '#16a34a' }} /> Instruções de Postura & Execução:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {selectedGuide.instructions.map((step, idx) => (
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

            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Shield size={16} /> Erros Críticos a Evitar:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {selectedGuide.mistakesToAvoid.map((mistake, idx) => (
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

            <div style={{
              padding: '10px 14px', borderRadius: '8px',
              backgroundColor: 'var(--surface-bg)', border: '1px solid var(--border-color)',
              fontSize: '0.8rem', color: 'var(--text-secondary)'
            }}>
              🌬️ <strong>Respiração Anatômica:</strong> {selectedGuide.breathingTip}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
