import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Church, Plus, CheckCircle2, Circle,
  Trash2, Edit3, Sparkles, ScrollText, ExternalLink
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
  getDailyCatholicContext,
  allRosaryMysteries
} from '../services/transformationContent';
import type { SpiritualActivity } from '../types';

export default function SpiritualPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'liturgia' | 'terco' | 'oracoes'>('liturgia');
  const [selectedRosaryTab, setSelectedRosaryTab] = useState<string>('today');

  const catholicData = getDailyCatholicContext(new Date());

  const [activities, setActivities] = useState<SpiritualActivity[]>([]);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<SpiritualActivity | null>(null);
  const [activityToDelete, setActivityToDelete] = useState<SpiritualActivity | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<SpiritualActivity['type']>('prayer');
  const [bibleReference, setBibleReference] = useState('');
  const [notes, setNotes] = useState('');

  const loadActivities = () => {
    if (!user) return;
    setActivities(getAllItems<SpiritualActivity>('spiritual', user.id));
  };

  useEffect(() => {
    loadActivities();
  }, [user]);

  const openCreateModal = () => {
    setEditingActivity(null);
    setTitle('');
    setDescription('');
    setType('prayer');
    setBibleReference('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (a: SpiritualActivity) => {
    setEditingActivity(a);
    setTitle(a.title);
    setDescription(a.description || '');
    setType(a.type);
    setBibleReference(a.bible_reference || '');
    setNotes(a.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) return;

    if (editingActivity) {
      updateItem<SpiritualActivity>('spiritual', user.id, editingActivity.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        bible_reference: bibleReference.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      addToast({ type: 'success', title: 'Registro espiritual atualizado!' });
    } else {
      createItem<SpiritualActivity>('spiritual', user.id, {
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        date: format(new Date(), 'yyyy-MM-dd'),
        bible_reference: bibleReference.trim() || undefined,
        completed: false,
        private: false,
        notes: notes.trim() || undefined,
      });
      addToast({ type: 'success', title: 'Momento espiritual registrado!' });
    }

    setIsModalOpen(false);
    loadActivities();
  };

  const handleToggleComplete = (a: SpiritualActivity) => {
    if (!user) return;
    updateItem<SpiritualActivity>('spiritual', user.id, a.id, {
      completed: !a.completed,
    });
    setActivities(prev => prev.map(act => act.id === a.id ? { ...act, completed: !act.completed } : act));
    addToast({
      type: 'info',
      title: !a.completed ? 'Oração/Prática concluída com fé!' : 'Marcada como pendente',
    });
  };

  const handleDeleteActivity = () => {
    if (!activityToDelete || !user) return;
    deleteItem<SpiritualActivity>('spiritual', user.id, activityToDelete.id);
    setActivities(prev => prev.filter(a => a.id !== activityToDelete.id));
    setActivityToDelete(null);
    addToast({ type: 'success', title: 'Registro removido!' });
  };

  const typeLabels: Record<string, string> = {
    prayer: 'Oração',
    reading: 'Leitura Bíblica',
    rosary: 'Santo Terço',
    adoration: 'Adoração',
    meditation: 'Meditação',
    mass: 'Santa Missa',
    confession: 'Confissão',
    journal: 'Diário Espiritual',
    intention: 'Intenção de Oração',
    other: 'Outro',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Vida Espiritual & Fé Católica</h1>
          <p className="text-sm text-secondary" style={{ margin: '4px 0 0' }}>
            Liturgia diária, Evangelho completo, Santo Terço meditado e suas orações diárias.
          </p>
        </div>

        <Button variant="primary" onClick={openCreateModal}>
          <Plus size={18} /> Novo Momento Espiritual
        </Button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 8, padding: 6,
        backgroundColor: 'var(--surface-card)', borderRadius: 'var(--border-radius-lg)',
        border: '1px solid var(--border-color)', width: 'fit-content', flexWrap: 'wrap'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('liturgia')}
          style={{
            padding: '8px 16px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700,
            cursor: 'pointer', border: 'none',
            backgroundColor: activeTab === 'liturgia' ? '#8b5cf6' : 'transparent',
            color: activeTab === 'liturgia' ? '#ffffff' : 'var(--text-secondary)',
          }}
        >
          ✝️ Evangelho do Dia & Santo
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('terco')}
          style={{
            padding: '8px 16px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700,
            cursor: 'pointer', border: 'none',
            backgroundColor: activeTab === 'terco' ? '#06b6d4' : 'transparent',
            color: activeTab === 'terco' ? '#ffffff' : 'var(--text-secondary)',
          }}
        >
          📿 Mistérios do Santo Terço
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('oracoes')}
          style={{
            padding: '8px 16px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700,
            cursor: 'pointer', border: 'none',
            backgroundColor: activeTab === 'oracoes' ? 'var(--color-primary-600)' : 'transparent',
            color: activeTab === 'oracoes' ? '#ffffff' : 'var(--text-secondary)',
          }}
        >
          🙏 Minhas Orações ({activities.length})
        </button>
      </div>

      {/* ── TAB 1: LITURGIA & EVANGELHO ── */}
      {activeTab === 'liturgia' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Saint of the Day */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(124, 58, 237, 0.08) 100%)',
            borderRadius: 'var(--border-radius-lg)',
            border: '1px solid rgba(168, 85, 247, 0.35)',
            padding: '24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <Badge variant="primary" size="sm" style={{ marginBottom: 8 }}>
                  ✝️ Santo do Dia & Santoral Católico
                </Badge>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '4px 0', color: 'var(--text-primary)' }}>
                  {catholicData.name}
                </h2>
                <span style={{ fontSize: '0.85rem', color: '#a855f7', fontWeight: 700 }}>
                  {catholicData.title} • Festa Litúrgica: {catholicData.feastDate}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 12 }}>
              {catholicData.history}
            </p>

            <div style={{ padding: '12px 14px', borderRadius: '10px', backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-color)', marginTop: 14 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a855f7', textTransform: 'uppercase', marginBottom: 4 }}>
                Virtude a Cultivar Hoje:
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {catholicData.virtue}
              </div>
            </div>

            <div style={{
              marginTop: 14, padding: '14px 16px', borderRadius: '10px',
              backgroundColor: 'var(--surface-card)', borderLeft: '4px solid #a855f7',
            }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                🙏 Oração Oficial ao Santo do Dia:
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0, lineHeight: 1.6 }}>
                "{catholicData.prayer}"
              </p>
            </div>
          </div>

          {/* Full Gospel */}
          <div style={{
            backgroundColor: 'var(--surface-card)',
            borderRadius: 'var(--border-radius-lg)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            padding: '24px',
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
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Evangelho do Dia por Completo
                  </h3>
                  <span style={{ fontSize: '0.82rem', color: '#8b5cf6', fontWeight: 700 }}>
                    📖 {catholicData.gospel.reference} — {catholicData.gospel.title}
                  </span>
                </div>
              </div>
              <Badge variant="primary" size="sm">Lectio Divina</Badge>
            </div>

            <div style={{
              padding: '12px 16px', borderRadius: '8px',
              backgroundColor: 'rgba(139, 92, 246, 0.08)', borderLeft: '4px solid #8b5cf6',
              marginBottom: 16, fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', fontStyle: 'italic'
            }}>
              "{catholicData.gospel.verseHighlight}"
            </div>

            <div style={{
              backgroundColor: 'var(--surface-bg)',
              borderRadius: 'var(--border-radius-md)',
              padding: '18px 20px',
              border: '1px solid var(--border-color)',
              marginBottom: 16,
            }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 10 }}>
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

            <div style={{
              padding: '14px 16px',
              borderRadius: '10px',
              backgroundColor: 'var(--surface-bg)',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#8b5cf6', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} /> Meditação da Igreja & Aplicação para a sua Vida:
              </div>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {catholicData.gospel.reflection}
              </p>
            </div>
          </div>

          {/* Pregação Católica */}
          <Card title="Pregação Católica Recomendada" subtitle="Formação sólida para a sua vida de oração">
            <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'var(--surface-bg)', border: '1px solid var(--border-color)', marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Badge variant="secondary" size="sm">{catholicData.sermonRecommendation.topic}</Badge>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  ⏱️ {catholicData.sermonRecommendation.duration}
                </span>
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '4px 0 6px', color: 'var(--text-primary)' }}>
                "{catholicData.sermonRecommendation.title}"
              </h4>
              <div style={{ fontSize: '0.8rem', color: '#a855f7', fontWeight: 700, marginBottom: 8 }}>
                🎙️ {catholicData.sermonRecommendation.preacher}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
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
        </div>
      )}

      {/* ── TAB 2: OS 5 MISTÉRIOS DO TERÇO ── */}
      {activeTab === 'terco' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div style={{
            backgroundColor: 'var(--surface-card)',
            borderRadius: 'var(--border-radius-lg)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #06b6d4, #3b82f6)' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Contemplação dos Mistérios do Santo Terço
                </h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Meditação bíblica completa das 5 dezenas com o fruto espiritual de cada mistério
                </span>
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                  { key: 'today', label: `Hoje: ${catholicData.rosary.mysteryName.split(' ')[1]}` },
                  { key: 'joyful', label: 'Gozosos' },
                  { key: 'sorrowful', label: 'Dolorosos' },
                  { key: 'glorious', label: 'Gloriosos' },
                  { key: 'luminous', label: 'Luminosos' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setSelectedRosaryTab(tab.key)}
                    style={{
                      padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
                      cursor: 'pointer', border: '1px solid',
                      backgroundColor: selectedRosaryTab === tab.key ? '#06b6d4' : 'var(--surface-bg)',
                      color: selectedRosaryTab === tab.key ? '#ffffff' : 'var(--text-secondary)',
                      borderColor: selectedRosaryTab === tab.key ? '#06b6d4' : 'var(--border-color)',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        📿 {activeRosary.mysteryName} — {activeRosary.days}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#06b6d4', fontWeight: 700 }}>
                        5 Dezenas
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: 1.5 }}>
                      {activeRosary.intro}
                    </p>
                  </div>

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
        </div>
      )}

      {/* ── TAB 3: MINHAS ORAÇÕES & DIÁRIO ── */}
      {activeTab === 'oracoes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Inspirational Quote Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
              color: '#ffffff',
              padding: 'var(--space-6)',
              borderRadius: 'var(--border-radius-xl)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.9, fontSize: '0.85rem', marginBottom: 8 }}>
              <Sparkles size={16} />
              <span>Reflexão do Dia</span>
            </div>
            <p style={{ margin: 0, fontSize: '1.15rem', fontStyle: 'italic', fontWeight: 500, lineHeight: 1.5 }}>
              "Não vos inquieteis pelo dia de amanhã, pois o dia de amanhã cuidará de si mesmo. Basta a cada dia o seu próprio mal."
            </p>
            <span style={{ display: 'block', marginTop: 8, opacity: 0.85, fontSize: '0.85rem', fontWeight: 600 }}>
              Mateus 6, 34
            </span>
          </div>

          {/* Activities Grid */}
          {activities.length === 0 ? (
            <EmptyState
              icon={<Church size={28} />}
              title="Nenhum registro espiritual"
              description="Dedique momentos do seu dia para reflexão, gratidão e oração."
              actionLabel="Registrar Oração"
              onAction={openCreateModal}
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
              {activities.map(activity => {
                const isDone = activity.completed;

                return (
                  <Card
                    key={activity.id}
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => handleToggleComplete(activity)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: isDone ? '#16a34a' : 'var(--text-tertiary)' }}
                        >
                          {isDone ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                        </button>
                        <span style={{ textDecoration: isDone ? 'line-through' : 'none' }}>
                          {activity.title}
                        </span>
                      </div>
                    }
                    action={
                      <div style={{ display: 'flex', gap: 4 }}>
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(activity)} style={{ padding: 4 }}>
                          <Edit3 size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setActivityToDelete(activity)} style={{ padding: 4 }}>
                          <Trash2 size={14} style={{ color: '#ef4444' }} />
                        </Button>
                      </div>
                    }
                    footer={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Badge variant="primary" size="sm">
                          {typeLabels[activity.type] || activity.type}
                        </Badge>
                        {activity.bible_reference && (
                          <span className="text-xs text-secondary font-semibold">
                            {activity.bible_reference}
                          </span>
                        )}
                      </div>
                    }
                  >
                    {activity.description && (
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {activity.description}
                      </p>
                    )}
                    {activity.notes && (
                      <p className="text-xs text-secondary mt-2 italic" style={{ borderLeft: '2px solid var(--color-primary-500)', paddingLeft: 8 }}>
                        "{activity.notes}"
                      </p>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingActivity ? 'Editar Registro' : 'Novo Momento Espiritual'}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, width: '100%' }}>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleSaveActivity}>Salvar</Button>
          </div>
        }
      >
        <form onSubmit={handleSaveActivity} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Tipo</label>
            <select className="input" value={type} onChange={e => setType(e.target.value as any)}>
              <option value="prayer">Oração</option>
              <option value="reading">Leitura Bíblica</option>
              <option value="rosary">Santo Terço</option>
              <option value="intention">Intenção de Oração</option>
              <option value="journal">Diário Espiritual</option>
              <option value="mass">Santa Missa</option>
              <option value="adoration">Adoração</option>
              <option value="other">Outro</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Título</label>
            <input
              type="text"
              className="input"
              placeholder="Ex: Oração da manhã, Evangelho do dia, Intenção pela família..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Referência Bíblica (opcional)</label>
            <input
              type="text"
              className="input"
              placeholder="Ex: Salmo 23, Mateus 6, 25-34"
              value={bibleReference}
              onChange={e => setBibleReference(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Reflexão / Anotações & Oração</label>
            <textarea
              className="input"
              rows={7}
              style={{ minHeight: '170px', lineHeight: 1.6, width: '100%' }}
              placeholder="Escreva seus pensamentos, intenção de oração, gratidão a Deus, reflexão bíblica ou anotações espirituais..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!activityToDelete}
        onClose={() => setActivityToDelete(null)}
        onConfirm={handleDeleteActivity}
        title="Excluir Registro"
        message={`Deseja realmente remover o registro "${activityToDelete?.title}"?`}
      />
    </div>
  );
}
