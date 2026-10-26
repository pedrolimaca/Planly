import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Heart, Plus, MapPin, User,
  CheckCircle2, Trash2, Edit3
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
import type { HealthRecord } from '../types';

export default function HealthPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [filterType, setFilterType] = useState<string>('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<HealthRecord | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<HealthRecord['type']>('appointment');
  const [date, setDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState('10:00');
  const [doctor, setDoctor] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const loadRecords = () => {
    if (!user) return;
    setRecords(getAllItems<HealthRecord>('health', user.id));
  };

  useEffect(() => {
    loadRecords();
  }, [user]);

  const openCreateModal = () => {
    setEditingRecord(null);
    setTitle('');
    setDescription('');
    setType('appointment');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setTime('10:00');
    setDoctor('');
    setLocation('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (r: HealthRecord) => {
    setEditingRecord(r);
    setTitle(r.title);
    setDescription(r.description || '');
    setType(r.type);
    setDate(r.date);
    setTime(r.time || '');
    setDoctor(r.doctor || '');
    setLocation(r.location || '');
    setNotes(r.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) return;

    if (editingRecord) {
      updateItem<HealthRecord>('health', user.id, editingRecord.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        date,
        time: time || undefined,
        doctor: doctor.trim() || undefined,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      addToast({ type: 'success', title: 'Registro de saúde atualizado!' });
    } else {
      createItem<HealthRecord>('health', user.id, {
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        date,
        time: time || undefined,
        doctor: doctor.trim() || undefined,
        location: location.trim() || undefined,
        status: 'scheduled',
        notes: notes.trim() || undefined,
      });
      addToast({ type: 'success', title: 'Novo registro de saúde salvo!' });
    }

    setIsModalOpen(false);
    loadRecords();
  };

  const handleToggleStatus = (r: HealthRecord) => {
    if (!user) return;
    const newStatus = r.status === 'completed' ? 'scheduled' : 'completed';
    updateItem<HealthRecord>('health', user.id, r.id, { status: newStatus });
    setRecords(prev => prev.map(rec => rec.id === r.id ? { ...rec, status: newStatus } : rec));
    addToast({
      type: 'info',
      title: newStatus === 'completed' ? 'Marcado como realizado!' : 'Marcado como agendado',
    });
  };

  const handleDeleteRecord = () => {
    if (!recordToDelete || !user) return;
    deleteItem<HealthRecord>('health', user.id, recordToDelete.id);
    setRecords(prev => prev.filter(r => r.id !== recordToDelete.id));
    setRecordToDelete(null);
    addToast({ type: 'success', title: 'Registro removido!' });
  };

  const filteredRecords = records.filter(r => {
    if (filterType !== 'all' && r.type !== filterType) return false;
    return true;
  });

  const typeLabels: Record<string, string> = {
    appointment: 'Consulta',
    exam: 'Exame',
    medication: 'Medicamento / Suplemento',
    vaccine: 'Vacina',
    sleep: 'Sono',
    water: 'Água',
    note: 'Anotação',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Saúde & Cuidados Pessoais</h1>
          <p className="text-sm text-secondary" style={{ margin: '4px 0 0' }}>
            Histórico de consultas, exames, vacinas, medicamentos e prescrições.
          </p>
        </div>

        <Button variant="primary" onClick={openCreateModal}>
          <Plus size={18} /> Novo Registro
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="tabs-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
        {[
          { key: 'all', label: 'Todos' },
          { key: 'appointment', label: 'Consultas' },
          { key: 'exam', label: 'Exames' },
          { key: 'medication', label: 'Medicamentos' },
        ].map(tab => (
          <Button
            key={tab.key}
            variant={filterType === tab.key ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterType(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        <EmptyState
          icon={<Heart size={28} />}
          title="Nenhum registro de saúde cadastrado"
          description="Mantenha suas consultas médicas, exames de rotina e remédios organizados."
          actionLabel="Adicionar Registro"
          onAction={openCreateModal}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
          {filteredRecords.map(record => {
            const isCompleted = record.status === 'completed';

            return (
              <Card
                key={record.id}
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(record)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: isCompleted ? '#16a34a' : 'var(--text-tertiary)' }}
                    >
                      <CheckCircle2 size={18} />
                    </button>
                    <span style={{ textDecoration: isCompleted ? 'line-through' : 'none' }}>
                      {record.title}
                    </span>
                  </div>
                }
                action={
                  <div style={{ display: 'flex', gap: 4 }}>
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(record)} style={{ padding: 4 }}>
                      <Edit3 size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setRecordToDelete(record)} style={{ padding: 4 }}>
                      <Trash2 size={14} style={{ color: '#ef4444' }} />
                    </Button>
                  </div>
                }
                footer={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Badge variant={record.type === 'appointment' ? 'primary' : record.type === 'exam' ? 'warning' : 'secondary'} size="sm">
                      {typeLabels[record.type] || record.type}
                    </Badge>
                    <span className="text-xs text-secondary font-mono">
                      {record.date} {record.time ? `às ${record.time}` : ''}
                    </span>
                  </div>
                }
              >
                {record.description && (
                  <p className="text-xs text-secondary mb-3" style={{ margin: '0 0 10px' }}>
                    {record.description}
                  </p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {record.doctor && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <User size={13} /> Profissional: <strong>{record.doctor}</strong>
                    </div>
                  )}
                  {record.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={13} /> Local: {record.location}
                    </div>
                  )}
                  {record.notes && (
                    <div style={{ marginTop: 6, padding: '6px 8px', borderRadius: 4, backgroundColor: 'var(--surface-bg)', fontStyle: 'italic', fontSize: '0.75rem' }}>
                      "{record.notes}"
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRecord ? 'Editar Registro' : 'Novo Registro de Saúde'}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, width: '100%' }}>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleSaveRecord}>Salvar</Button>
          </div>
        }
      >
        <form onSubmit={handleSaveRecord} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Tipo</label>
            <select className="input" value={type} onChange={e => setType(e.target.value as any)}>
              <option value="appointment">Consulta Médica</option>
              <option value="exam">Exame Laboratorial / Imagem</option>
              <option value="medication">Medicamento / Suplemento</option>
              <option value="vaccine">Vacina</option>
              <option value="note">Anotação Geral</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Título</label>
            <input
              type="text"
              className="input"
              placeholder="Ex: Consulta com Cardiologista, Hemograma, Creatina..."
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
              placeholder="Instruções, preparo para o exame ou dosagem..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Data</label>
              <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Horário</label>
              <input type="time" className="input" value={time} onChange={e => setTime(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Médico / Especialista</label>
              <input
                type="text"
                className="input"
                placeholder="Ex: Dr. Roberto Mendes"
                value={doctor}
                onChange={e => setDoctor(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Clínica / Local</label>
              <input
                type="text"
                className="input"
                placeholder="Ex: Hospital Samaritano"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Observações Adicionais</label>
            <input
              type="text"
              className="input"
              placeholder="Ex: Levar exames anteriores, jejum de 12h..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!recordToDelete}
        onClose={() => setRecordToDelete(null)}
        onConfirm={handleDeleteRecord}
        title="Excluir Registro de Saúde"
        message={`Deseja realmente remover o registro "${recordToDelete?.title}"?`}
      />
    </div>
  );
}
