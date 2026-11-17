import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDataRefresh } from '../../hooks/useDataRefresh';
import { getAllItems, createItem, updateItem } from '../../services/storage';
import type { Goal } from '../../types';
import Card from './Card';
import Button from './Button';
type SavingGoal = Goal & { target_amount?: number; saved_amount?: number };
export default function FinancialGoals() {
  const { user } = useAuth(); const [, refresh] = useState(0); const [notice, setNotice] = useState('');
  useDataRefresh(() => refresh(v => v+1));
  if (!user) return null;
  const goals = getAllItems<SavingGoal>('goals', user.id).filter(g => g.area === 'Finanças');
  return <Card title="Minha Evolução Financeira" subtitle="Metas compartilhadas com Metas e Sonhos. Valores reservados são informados manualmente.">
    <form className="smart-actions" onSubmit={e => {
      e.preventDefault(); const form = e.currentTarget; const data = new FormData(form); const target = Number(data.get('target')); const title = String(data.get('title')).trim();
      if (!title || !Number.isFinite(target) || target <= 0) return;
      createItem<SavingGoal>('goals', user.id, { user_id: user.id, title, area: 'Finanças', priority: 'high', status: 'not_started', progress: 0, progress_type: 'manual', milestones: [], due_date: String(data.get('date')) || undefined, target_amount: target, saved_amount: 0 }); form.reset(); setNotice('Meta criada e disponível no módulo de metas.');
    }}><label>Meta <input name="title" required maxLength={300} placeholder="Reserva financeira" /></label><label>Objetivo R$ <input name="target" type="number" min="0.01" step="0.01" required /></label><label>Prazo <input name="date" type="date" /></label><Button type="submit">Criar meta financeira</Button></form>
    {goals.map(g => <div key={g.id}><h3><Link to="/goals">{g.title}</Link> — {g.progress}%</h3>{g.target_amount && <form className="smart-actions" onSubmit={e => {
      e.preventDefault(); const saved = Number(new FormData(e.currentTarget).get('saved')); if (!Number.isFinite(saved) || saved < 0) return;
      const progress = Math.min(100, Math.round(saved / g.target_amount! * 100));
      updateItem<SavingGoal>('goals', user.id, g.id, { saved_amount: saved, progress, status: progress === 100 ? 'completed' : 'in_progress' }); setNotice('Progresso atualizado em todos os módulos.');
    }}><label>Reservado R$ <input name="saved" type="number" min="0" step="0.01" defaultValue={g.saved_amount || 0} required /></label><span>de R$ {g.target_amount.toFixed(2)}</span><Button type="submit" size="sm">Atualizar progresso</Button></form>}</div>)}<p role="status">{notice}</p>
  </Card>;
}
