import { useState } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { getAllItems, createItem, updateItem } from '../../services/storage';
import type { Habit } from '../../types';
import Card from './Card';
import Button from './Button';
interface Care { id: string; user_id: string; skin: string; products: string; restrictions: string; morning: string; evening: string; objectives: string }
export default function SelfCare() {
  const { user } = useAuth(); const [message, setMessage] = useState('');
  if (!user) return null;
  const care = getAllItems<Care>('self_care', user.id)[0];
  return <Card title="Autocuidado" subtitle="Preferências pessoais e hábitos compartilhados com Meu Dia.">
    <p>Cuidados gerais: limpeza suave, hidratação e proteção solar. Adapte à tolerância da pele e procure avaliação em caso de irritação persistente. <a href="https://www.aad.org/public/everyday-care/skin-care-basics/care/skin-care-budget" target="_blank" rel="noreferrer">Fonte: Academia Americana de Dermatologia</a>.</p>
    <form onSubmit={e => {
      e.preventDefault(); const data = new FormData(e.currentTarget); const fields = Object.fromEntries(data) as unknown as Omit<Care,'id'|'user_id'>;
      const value = { ...fields, id: 'care', user_id: user.id };
      if (!updateItem<Care>('self_care', user.id, 'care', value)) createItem<Care>('self_care', user.id, value);
      for (const [period, time, description] of [['manhã','07:00',fields.morning],['noite','21:00',fields.evening]]) {
        const id = `self-care-${period}`;
        const habit = { user_id: user.id, name: `Autocuidado da ${period}`, description, category: 'health' as const, frequency: 'daily' as const, target_time: time, start_date: format(new Date(), 'yyyy-MM-dd'), active: !!description.trim() };
        if (!updateItem<Habit>('habits', user.id, id, habit)) createItem<Habit>('habits', user.id, { ...habit, id });
      }
      setMessage('Preferências salvas e hábitos atualizados. Acompanhe a consistência em Rotinas e Hábitos.');
    }}>
      <div className="smart-actions">{[['skin','Tipo de pele'],['objectives','Objetivos'],['products','Produtos utilizados'],['restrictions','Sensibilidades e restrições'],['morning','Rotina da manhã'],['evening','Rotina da noite']].map(([key,label]) => <label key={key}>{label}<input name={key} defaultValue={care?.[key as keyof Care] || ''} maxLength={2000} /></label>)}</div>
      <Button type="submit">Salvar e atualizar hábitos</Button>
    </form><p role="status">{message}</p>
  </Card>;
}
