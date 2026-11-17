import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { useDataRefresh } from '../../hooks/useDataRefresh';
import { getAllItems, createItem, updateItem } from '../../services/storage';
import { planDay, type DayPreferences } from '../../services/dayPlanner';
import type { Task, CalendarEvent, Workout } from '../../types';
import Card from './Card';
import Button from './Button';
export default function SmartDay() {
  const { user } = useAuth();
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [version, refresh] = useState(0);
  const [notice, setNotice] = useState('');
  const [notBefore, setNotBefore] = useState<string>();
  const [budgetOverride, setBudgetOverride] = useState<number>();
  const [editing, setEditing] = useState(false);
  useDataRefresh(() => refresh(v => v + 1));
  if (!user) return null;
  void version;
  const pref = getAllItems<DayPreferences>('day_preferences', user.id)[0] || { id: 'daily', user_id: user.id, start: '08:00', end: '21:00', budget: 120 };
  const tasks = getAllItems<Task>('tasks', user.id);
  const result = planDay(date, tasks, getAllItems<CalendarEvent>('events', user.id), getAllItems<Workout>('workouts', user.id), { ...pref, budget: budgetOverride ?? pref.budget }, notBefore);
  const savePreferences = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const start = String(form.get('start')), end = String(form.get('end')), budget = Number(form.get('budget'));
    if (start >= end || budget < 5 || budget > 720) { setNotice('Informe um intervalo válido e de 5 a 720 minutos disponíveis.'); return; }
    const value = { ...pref, start, end, budget };
    if (!updateItem<DayPreferences>('day_preferences', user.id, pref.id, value)) createItem<DayPreferences>('day_preferences', user.id, value);
    setBudgetOverride(undefined); setEditing(false); setNotice('Preferências salvas. Cadastre trabalho, deslocamento e descanso como compromissos na agenda.');
  };
  const next = () => {
    const now = format(new Date(), 'HH:mm');
    const block = result.blocks.find(b => date !== format(new Date(), 'yyyy-MM-dd') || b.time >= now);
    setNotice(block ? `Primeiro passo: abra ${block.title}. Separe o material e dedique os primeiros 5 minutos. Horário sugerido: ${block.time}.` : 'Nenhuma atividade restante cabe neste planejamento. Reserve tempo para descansar ou ajuste sua disponibilidade.');
  };
  return <Card className="smart-day-panel" title="Meu Dia Inteligente" subtitle="Sugestão local baseada nos seus dados; compromissos fixos são preservados.">
    <div className="smart-day-toolbar">
      <label>Data <input aria-label="Data do plano" type="date" value={date} onChange={e => { setDate(e.target.value); setNotBefore(undefined); }} /></label>
      <Button onClick={next}>O que devo fazer agora?</Button>
      <Button variant="outline" onClick={() => { setDate(format(new Date(), 'yyyy-MM-dd')); setNotBefore(format(new Date(), 'HH:mm')); setNotice('Dia iniciado a partir do horário atual.'); }}>Começar meu dia</Button>
      <details className="smart-day-more"><summary>Mais opções para o dia</summary><div className="smart-day-options">
      <Button variant="outline" onClick={() => { setNotBefore(date === format(new Date(), 'yyyy-MM-dd') ? format(new Date(), 'HH:mm') : undefined); setNotice('Sugestões reorganizadas; os prazos originais das tarefas foram preservados.'); }}>Reorganizar minha rotina</Button>
      <Button variant="outline" onClick={() => { setBudgetOverride(30); setNotice('Plano limitado a 30 minutos de tarefas, além dos compromissos fixos.'); }}>Tenho apenas 30 minutos</Button>
      <Button variant="outline" onClick={() => setNotice('Escolha uma prioridade abaixo e comece por apenas 5 minutos. Você pode ajustar o plano ao seu ritmo.')}>Estou sem motivação</Button>
      <Button variant="outline" onClick={() => { setDate(format(addDays(new Date(), 1), 'yyyy-MM-dd')); setNotBefore(undefined); setBudgetOverride(undefined); }}>Planejar meu amanhã</Button>
      </div></details>
      <Button variant="ghost" onClick={() => setEditing(!editing)}>Ajustar horários</Button>
    </div>
    {editing && <form onSubmit={savePreferences} className="smart-actions">
      <label>Início <input name="start" type="time" defaultValue={pref.start} required /></label>
      <label>Fim <input name="end" type="time" defaultValue={pref.end} required /></label>
      <label>Minutos para tarefas <input name="budget" type="number" min="5" max="720" defaultValue={pref.budget} required /></label>
      <Button type="submit">Salvar preferências</Button><Link to="/calendar">Cadastrar compromissos fixos</Link>
    </form>}
    {notice && <p className="smart-day-notice" role="status">{notice}</p>}
    <div className="smart-day-summary"><span>Janela do dia <strong>{pref.start}–{pref.end}</strong></span><span>Tempo para tarefas <strong>{budgetOverride ?? pref.budget} min</strong></span></div>
    <h3>Prioridades para revisar</h3>
    {result.priorities.length ? <ol className="smart-day-priorities">{result.priorities.map(t => <li key={t.id}><Link to="/tasks">{t.title}</Link>{t.due_date && t.due_date < date && <span className="smart-day-overdue">Prazo: {t.due_date.split('-').reverse().join('/')}</span>}</li>)}</ol> : <p>Sem tarefas pendentes. <Link to="/tasks">Criar tarefa</Link></p>}
    {result.conflicts.length > 0 && <p role="alert">Há compromissos ou treinos sobrepostos. Revise os horários na agenda e na academia.</p>}
    <h3 className="smart-day-agenda-title">Horários sugeridos</h3>
    {!result.blocks.length && <p>Sem atividades que caibam nesta janela. Ajuste os horários ou revise suas tarefas.</p>}
    <ul className="smart-timeline">{result.blocks.map(b => <li key={`${b.kind}-${b.id}`}><strong>{b.time}</strong> <Link to={b.link}>{b.title}</Link> <small>{b.minutes} min</small>{b.kind === 'task' && <Button size="sm" variant="ghost" onClick={() => updateItem<Task>('tasks', user.id, b.id, { status: 'completed', completed_at: new Date().toISOString() })}>Concluir</Button>}</li>)}</ul>
    {result.deferred.length > 0 && <p className="smart-day-deferred">{result.deferred.length} tarefa(s) não cabem no tempo disponível. <Link to="/tasks">Editar, mover ou remover tarefas</Link>.</p>}
  </Card>;
}
