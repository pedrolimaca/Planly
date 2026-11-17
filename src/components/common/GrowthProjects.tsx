import { useState } from 'react';
import { format, addDays } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { createItem, getAllItems, updateItem } from '../../services/storage';
import { useDataRefresh } from '../../hooks/useDataRefresh';
import type { Project, Task } from '../../types';
import Card from './Card';
import Button from './Button';
interface Content { id: string; user_id: string; title: string; url: string; reason: string; done: boolean; task_id?: string }
const ideas = [
  { title: 'Vídeos para imóveis de temporada', difficulty: 'Intermediária', tools: 'Editor de vídeo e câmera ou material autorizado do cliente', skills: 'Roteiro, edição e proposta comercial', audience: 'Anfitriões e gestores de imóveis', first: 'Criar um roteiro demonstrativo com imagens próprias ou autorizadas.' },
  { title: 'Sites para negócios locais', difficulty: 'Intermediária', tools: 'Editor de código, hospedagem e domínio', skills: 'HTML, CSS, acessibilidade e atendimento', audience: 'Comércios e profissionais locais', first: 'Escolher um segmento e construir uma página demonstrativa.' },
  { title: 'Automações com inteligência artificial', difficulty: 'Intermediária a avançada', tools: 'APIs oficiais e ferramenta de automação', skills: 'Integrações, segurança de dados e avaliação', audience: 'Pequenas empresas com tarefas repetitivas', first: 'Entrevistar um potencial cliente sobre uma tarefa repetitiva.' },
];
export default function GrowthProjects() {
  const { user } = useAuth(); const [notice, setNotice] = useState(''); const [,refresh] = useState(0);
  useDataRefresh(() => refresh(v => v+1)); if (!user) return null;
  const library = getAllItems<Content>('content_library', user.id);
  const task = (title: string, due: string, tags: string[], description = '') => createItem<Task>('tasks', user.id, { user_id: user.id, title, description, due_date: due, category: 'work', priority: 'medium', status: 'pending', tags, order_index: 0 });
  return <><Card title="Projetos para empreender" subtitle="Hipóteses para validar com clientes; não há promessa de receita.">{ideas.map(idea => <details key={idea.title}><summary>{idea.title}</summary><p>Dificuldade: {idea.difficulty}. Investimento: estimativa de R$ 0–500 para um piloto usando equipamentos existentes; valide preços e custos de serviços antes de contratar.</p><p>Ferramentas: {idea.tools}. Habilidades: {idea.skills}. Público: {idea.audience}.</p><p>Primeiro passo: {idea.first}</p><p>7 dias: validar a necessidade, preparar uma amostra e contatar cinco potenciais clientes. 30 dias: testar uma proposta, entregar um piloto autorizado, coletar feedback e revisar custos.</p><Button size="sm" onClick={() => {
    const existing = getAllItems<Project>('projects', user.id).find(p => p.title === idea.title && p.status === 'active');
    if (existing) { setNotice('Já existe um projeto ativo com esse nome. Confira Estudos e Trabalho.'); return; }
    const project = createItem<Project>('projects', user.id, { user_id: user.id, title: idea.title, description: idea.first, category: 'work', status: 'active', priority: 'medium', start_date: format(new Date(),'yyyy-MM-dd'), due_date: format(addDays(new Date(),30),'yyyy-MM-dd') });
    [[0,idea.first],[3,'Criar amostra e validar custos'],[7,'Contatar cinco potenciais clientes com proposta personalizada'],[14,'Negociar escopo de um piloto autorizado'],[30,'Revisar feedback, custos e próximos passos']].forEach(([day,title]) => task(`${idea.title}: ${title}`,format(addDays(new Date(),Number(day)),'yyyy-MM-dd'),['empreender',project.id]));
    setNotice('Projeto e cinco tarefas criados. Acompanhe em Estudos, Tarefas e Meu Dia.');
  }}>Criar projeto e plano de 30 dias</Button></details>)}</Card>
  <Card title="Minha biblioteca de conteúdos" subtitle="Salve conteúdos reais e o motivo de estudá-los; transforme-os em ações."><form className="smart-actions" onSubmit={e => {
    e.preventDefault(); const form = e.currentTarget; const data = new FormData(form); const url = String(data.get('url'));
    try { if (new URL(url).protocol !== 'https:') throw new Error(); } catch { setNotice('Informe um endereço HTTPS válido.'); return; }
    createItem<Content>('content_library', user.id, { user_id: user.id, title: String(data.get('title')).trim(), url, reason: String(data.get('reason')), done: false }); form.reset(); setNotice('Conteúdo salvo. A disponibilidade do endereço deve ser conferida na origem.');
  }}><label>Título <input name="title" required maxLength={300} /></label><label>Link <input name="url" type="url" required /></label><label>Relação com seu objetivo <input name="reason" required maxLength={1000} /></label><Button type="submit">Salvar conteúdo</Button></form>
  {library.map(c => <div key={c.id} className="smart-actions"><a href={c.url} target="_blank" rel="noreferrer">{c.title}</a><span>{c.reason}</span><Button variant="outline" size="sm" onClick={() => updateItem<Content>('content_library',user.id,c.id,{done:!c.done})}>{c.done ? 'Concluído — reabrir' : 'Marcar concluído'}</Button><Button size="sm" disabled={!!c.task_id} onClick={() => { const saved = task(`Estudar: ${c.title}`,format(new Date(),'yyyy-MM-dd'),['conteúdo'],`${c.reason}\n${c.url}`); updateItem<Content>('content_library',user.id,c.id,{task_id:saved.id}); }}>{c.task_id ? 'Tarefa criada' : 'Transformar em tarefa'}</Button></div>)}<p role="status">{notice}</p></Card></>;
}
