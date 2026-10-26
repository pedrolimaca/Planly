import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  DollarSign, Plus, ArrowUpRight, ArrowDownRight, Clock,
  Trash2, Edit3, Filter
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
import type { FinanceEntry, Budget, FinanceType, FinanceStatus } from '../types';
import { FINANCE_CATEGORIES, PAYMENT_METHODS } from '../types';

export default function FinancePage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | FinanceStatus>('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FinanceEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<FinanceEntry | null>(null);

  // Form State
  const [description, setDescription] = useState('');
  const [type, setType] = useState<FinanceType>('expense');
  const [category, setCategory] = useState<string>(FINANCE_CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<FinanceStatus>('paid');
  const [paymentMethod, setPaymentMethod] = useState<string>(PAYMENT_METHODS[0]);
  const [notes, setNotes] = useState('');

  const loadFinance = () => {
    if (!user) return;
    setEntries(getAllItems<FinanceEntry>('finance', user.id));
    setBudgets(getAllItems<Budget>('budgets', user.id));
  };

  useEffect(() => {
    loadFinance();
  }, [user]);

  // Calculations
  const currentMonthStr = format(new Date(), 'yyyy-MM');
  const monthEntries = entries.filter(e => e.date.startsWith(currentMonthStr));

  const totalIncome = monthEntries
    .filter(e => e.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = monthEntries
    .filter(e => e.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balance = totalIncome - totalExpense;

  const pendingBills = monthEntries
    .filter(e => e.type === 'expense' && e.status === 'pending')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const openCreateModal = () => {
    setEditingEntry(null);
    setDescription('');
    setType('expense');
    setCategory(FINANCE_CATEGORIES[0]);
    setAmount('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setDueDate(format(new Date(), 'yyyy-MM-dd'));
    setStatus('paid');
    setPaymentMethod('PIX');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (entry: FinanceEntry) => {
    setEditingEntry(entry);
    setDescription(entry.description);
    setType(entry.type);
    setCategory(entry.category);
    setAmount(String(entry.amount));
    setDate(entry.date);
    setDueDate(entry.due_date || '');
    setStatus(entry.status);
    setPaymentMethod(entry.payment_method || 'PIX');
    setNotes(entry.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !user) return;

    const val = parseFloat(amount.replace(',', '.'));
    if (isNaN(val) || val <= 0) {
      addToast({ type: 'error', title: 'Valor inválido', message: 'Informe um valor maior que zero.' });
      return;
    }

    if (editingEntry) {
      updateItem<FinanceEntry>('finance', user.id, editingEntry.id, {
        description: description.trim(),
        type,
        category,
        amount: val,
        date,
        due_date: dueDate || undefined,
        status,
        payment_method: paymentMethod,
        notes: notes.trim() || undefined,
      });
      addToast({ type: 'success', title: 'Lançamento atualizado!' });
    } else {
      createItem<FinanceEntry>('finance', user.id, {
        user_id: user.id,
        description: description.trim(),
        type,
        category,
        amount: val,
        date,
        due_date: dueDate || undefined,
        status,
        payment_method: paymentMethod,
        notes: notes.trim() || undefined,
      });
      addToast({ type: 'success', title: 'Lançamento registrado!' });
    }

    setIsModalOpen(false);
    loadFinance();
  };

  const handleDeleteEntry = () => {
    if (!entryToDelete || !user) return;
    deleteItem<FinanceEntry>('finance', user.id, entryToDelete.id);
    setEntries(prev => prev.filter(e => e.id !== entryToDelete.id));
    setEntryToDelete(null);
    addToast({ type: 'success', title: 'Lançamento excluído!' });
  };

  const handleToggleStatus = (entry: FinanceEntry) => {
    if (!user) return;
    const newStatus: FinanceStatus = entry.status === 'paid' ? 'pending' : 'paid';
    updateItem<FinanceEntry>('finance', user.id, entry.id, {
      status: newStatus,
      payment_date: newStatus === 'paid' ? format(new Date(), 'yyyy-MM-dd') : undefined,
    });
    setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, status: newStatus } : e));
    addToast({
      type: 'info',
      title: newStatus === 'paid' ? 'Marcado como pago' : 'Marcado como pendente',
    });
  };

  const filteredEntries = entries.filter(e => {
    if (typeFilter !== 'all' && e.type !== typeFilter) return false;
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Gestão Financeira</h1>
          <p className="text-sm text-secondary" style={{ margin: '4px 0 0' }}>
            Controle de receitas, despesas, contas a pagar e orçamentos mensais.
          </p>
        </div>

        <Button variant="primary" onClick={openCreateModal}>
          <Plus size={18} /> Novo Lançamento
        </Button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-xs font-semibold text-secondary uppercase">Saldo do Mês</span>
            <div style={{ width: 34, height: 34, borderRadius: '10px', backgroundColor: balance >= 0 ? 'var(--color-success-50)' : 'var(--color-danger-50)', color: balance >= 0 ? 'var(--color-success-text)' : 'var(--color-danger-text)', border: `1px solid ${balance >= 0 ? 'var(--color-success-border)' : 'var(--color-danger-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: balance >= 0 ? 'var(--color-success-text)' : 'var(--color-danger-text)' }}>
              R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-xs font-semibold text-secondary uppercase">Total Receitas</span>
            <div style={{ width: 34, height: 34, borderRadius: '10px', backgroundColor: 'var(--color-success-50)', color: 'var(--color-success-text)', border: '1px solid var(--color-success-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-success-text)' }}>
              R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-xs font-semibold text-secondary uppercase">Total Despesas</span>
            <div style={{ width: 34, height: 34, borderRadius: '10px', backgroundColor: 'var(--color-danger-50)', color: 'var(--color-danger-text)', border: '1px solid var(--color-danger-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowDownRight size={16} />
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-danger-text)' }}>
              R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-xs font-semibold text-secondary uppercase">A Pagar (Pendente)</span>
            <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={16} />
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#d97706' }}>
              R$ {pendingBills.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </Card>
      </div>

      {/* Budgets Section */}
      {budgets.length > 0 && (
        <Card title="Orçamentos & Limites por Categoria" subtitle="Acompanhe se está dentro do limite programado">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
            {budgets.map(b => {
              const spent = monthEntries
                .filter(e => e.type === 'expense' && e.category === b.category)
                .reduce((acc, curr) => acc + curr.amount, 0);
              const percent = Math.min(100, Math.round((spent / b.amount) * 100));
              const isOver = spent > b.amount;

              return (
                <div key={b.id} style={{ padding: 12, borderRadius: 'var(--border-radius-md)', backgroundColor: 'var(--surface-bg)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span className="font-semibold text-sm">{b.category}</span>
                    <span className={`text-xs font-bold ${isOver ? 'text-danger' : 'text-secondary'}`}>
                      R$ {spent.toFixed(0)} / R$ {b.amount.toFixed(0)}
                    </span>
                  </div>
                  <ProgressBar
                    value={percent}
                    color={isOver ? '#dc2626' : percent > 80 ? '#d97706' : 'var(--color-primary-600)'}
                    size="sm"
                  />
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Filter Bar */}
      <Card style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={16} className="text-secondary" />
            <span className="text-xs font-semibold text-secondary uppercase">Filtrar:</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['all', 'income', 'expense'] as const).map(t => (
                <Button
                  key={t}
                  variant={typeFilter === t ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setTypeFilter(t)}
                >
                  {t === 'all' ? 'Todos' : t === 'income' ? 'Receitas' : 'Despesas'}
                </Button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <select
              className="input"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              style={{ padding: '6px 12px', width: 'auto' }}
            >
              <option value="all">Todos os Status</option>
              <option value="paid">Pago</option>
              <option value="pending">Pendente</option>
              <option value="received">Recebido</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Transactions List */}
      {filteredEntries.length === 0 ? (
        <EmptyState
          icon={<DollarSign size={28} />}
          title="Nenhum lançamento financeiro"
          description="Registre suas receitas e despesas para manter as finanças sob controle."
          actionLabel="Novo Lançamento"
          onAction={openCreateModal}
        />
      ) : (
        <Card style={{ padding: 'var(--space-2)' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredEntries.map(entry => {
              const isIncome = entry.type === 'income';

              return (
                <div
                  key={entry.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-color)',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '10px',
                        backgroundColor: isIncome ? 'var(--color-success-50)' : 'var(--color-danger-50)',
                        color: isIncome ? 'var(--color-success-text)' : 'var(--color-danger-text)',
                        border: `1px solid ${isIncome ? 'var(--color-success-border)' : 'var(--color-danger-border)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isIncome ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                    </div>

                    <div>
                      <div className="font-semibold text-sm text-primary">{entry.description}</div>
                      <div className="text-xs text-secondary mt-1 flex items-center gap-2">
                        <span>{entry.category}</span>
                        <span>•</span>
                        <span>{entry.date}</span>
                        {entry.payment_method && (
                          <>
                            <span>•</span>
                            <span>{entry.payment_method}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: isIncome ? '#16a34a' : '#dc2626' }}>
                        {isIncome ? '+ ' : '- '}R$ {entry.amount.toFixed(2)}
                      </div>
                      <div style={{ marginTop: 2 }}>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(entry)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          <Badge variant={entry.status === 'paid' || entry.status === 'received' ? 'success' : 'warning'} size="sm">
                            {entry.status === 'paid' ? 'Pago' : entry.status === 'received' ? 'Recebido' : 'Pendente'}
                          </Badge>
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 4 }}>
                      <Button variant="ghost" size="sm" onClick={() => openEditModal(entry)} style={{ padding: 4 }}>
                        <Edit3 size={14} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setEntryToDelete(entry)} style={{ padding: 4 }}>
                        <Trash2 size={14} style={{ color: '#ef4444' }} />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEntry ? 'Editar Lançamento' : 'Novo Lançamento'}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, width: '100%' }}>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleSaveEntry}>Salvar</Button>
          </div>
        }
      >
        <form onSubmit={handleSaveEntry} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Tipo</label>
              <select className="input" value={type} onChange={e => setType(e.target.value as any)}>
                <option value="expense">Despesa (-)</option>
                <option value="income">Receita (+)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Valor (R$)</label>
              <input
                type="text"
                className="input"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Descrição</label>
            <input
              type="text"
              className="input"
              placeholder="Ex: Aluguel, Supermercado, Salário..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Categoria</label>
              <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
                {FINANCE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Forma de Pagamento</label>
              <select className="input" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Data de Registro</label>
              <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} required />
            </div>

            <div>
              <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Status</label>
              <select className="input" value={status} onChange={e => setStatus(e.target.value as any)}>
                <option value="paid">Pago / Efetuado</option>
                <option value="pending">Pendente / Agendado</option>
                <option value="received">Recebido</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!entryToDelete}
        onClose={() => setEntryToDelete(null)}
        onConfirm={handleDeleteEntry}
        title="Excluir Lançamento"
        message={`Tem certeza que deseja excluir o lançamento "${entryToDelete?.description}"?`}
      />
    </div>
  );
}
