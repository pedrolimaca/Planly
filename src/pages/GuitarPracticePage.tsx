import OnlineGuitar from '../components/common/OnlineGuitar';
import DailyGuitar from '../components/common/DailyGuitar';
import { songUrl } from '../services/dailyGuitar';
import GuitarWorkshop from '../components/common/GuitarWorkshop';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';
import { useDataRefresh } from '../hooks/useDataRefresh';
import { createItem, getAllItems, updateItem, deleteItem } from '../services/storage';
import { dailyTopic, suggestTracks, selectGuitarTrack, guitarStreak, type GuitarTask, type MusicTrack, type GuitarPreferences } from '../services/guitarPractice';
import { supabase } from '../services/supabase';
import { z } from 'zod';
const catalogSchema = z.object({source:z.string(),fetchedAt:z.string(),tracks:z.array(z.object({id:z.string(),title:z.string(),artist:z.string(),album:z.string(),genre:z.string(),url:z.string().url().refine(value=>{const u=new URL(value);return u.protocol==='https:' && ['music.apple.com','itunes.apple.com'].includes(u.hostname);})}))});
type SavedTrack = MusicTrack & { user_id:string };
export default function GuitarPracticePage() {
  const { user } = useAuth(); const [,refresh]=useState(0); const [date,setDate]=useState(format(new Date(),'yyyy-MM-dd'));
  useDataRefresh(()=>refresh(v=>v+1));
  const preferences = user ? getAllItems<GuitarPreferences>('guitar_preferences',user.id)[0] : undefined;
  const [query,setQuery]=useState(preferences?.query || 'violão acústico');const [search,setSearch]=useState(query);const [revision,setRevision]=useState(0);
  const [level,setLevel]=useState(preferences?.level || 'Iniciante');const [duration,setDuration]=useState(preferences?.minutes || 20);
  const [tracks,setTracks]=useState<MusicTrack[]>([]);const [busy,setBusy]=useState(true);const [message,setMessage]=useState('');const [source,setSource]=useState('');
  useEffect(()=>{
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),25000);let active=true;
    setBusy(true);setMessage('');setTracks([]);
    (async()=>{
      try {
        const response=await fetch(`/api/public/music?q=${encodeURIComponent(search)}`,{signal:controller.signal});let payload;
        if(response.ok && response.headers.get('content-type')?.includes('application/json')) payload=await response.json();
        else if((response.status===404 || response.ok) && supabase) {const {data,error}=await supabase.functions.invoke('planly-content',{body:{kind:'music',q:search},signal:controller.signal});if(error)throw error;payload=data;}
        else throw new Error('Catálogo indisponível. Verifique se o servidor do Planly está ativo.');
        const data=catalogSchema.parse(payload);if(!active)return;setTracks(data.tracks);setSource(`${data.source} • consultado em ${new Date(data.fetchedAt).toLocaleString('pt-BR')}`);
      }catch {if(active)setMessage('Não foi possível consultar o catálogo agora. Tente outra pesquisa ou use sua biblioteca salva.');}
      finally {clearTimeout(timer);if(active)setBusy(false);}
    })();return()=>{active=false;clearTimeout(timer);controller.abort();};
  },[search,revision,date]);
  // Date changes also refresh the daily practice if the tab stays open overnight.
  useEffect(()=>{const interval=setInterval(()=>setDate(format(new Date(),'yyyy-MM-dd')),60000);return()=>clearInterval(interval);},[]);
  if(!user)return null;
  const tasks=getAllItems<GuitarTask>('tasks',user.id).filter(t=>t.tags?.includes('guitar-practice'));
  const today=tasks.find(t=>t.id===`guitar:${date}`);const saved=getAllItems<SavedTrack>('guitar_library',user.id);
  const topic=dailyTopic(date,level);const suggestions=suggestTracks(tracks,date,tasks);
  const choose=(track:MusicTrack)=>{
    if(today?.guitar_track?.id===track.id){setMessage('Esta música já é a prática de hoje.');return;}
    if(today && !window.confirm('Substituir a prática de hoje por esta música?'))return;
    selectGuitarTrack(user.id,date,track,topic.title,duration);setMessage('Prática salva em Tarefas, Meu Dia e dashboard.');
  };
  const renderTrack=(track:MusicTrack)=> <article key={track.id} className="source-article"><h3>{track.title}</h3><p>{track.artist} • {track.genre} • {track.album}</p><div className="smart-actions"><a href={track.url} target="_blank" rel="noreferrer">{track.id.startsWith('cifra:')?'Abrir cifra no Cifra Club':'Ver gravação na Apple Music'}</a><Button size="sm" onClick={()=>choose(track)}>Praticar esta música</Button><Button size="sm" variant="outline" onClick={()=>{if(saved.some(s=>s.id===track.id))deleteItem('guitar_library',user.id,track.id);else createItem<SavedTrack>('guitar_library',user.id,{...track,user_id:user.id});}}>{saved.some(s=>s.id===track.id)?'Remover dos favoritos':'Salvar na biblioteca'}</Button></div></article>;
  return <div className="guitar-page"><h1>Violão — repertório e prática diária</h1><OnlineGuitar date={date} onChoose={choose}/><details className="guitar-workshop-library"><summary>Exercícios locais e repertório de apoio</summary><DailyGuitar date={date} onChoose={song=>choose({id:`cifra:${song.path}`,title:song.title,artist:song.artist,genre:song.genre,album:'Repertório com cifra',url:songUrl(song)})} /></details><details className="guitar-workshop-library"><summary>Oficina: consultar dedilhados, acordes e solos famosos</summary><GuitarWorkshop /></details>
    <Card title="Seu plano de estudo" subtitle="Ajuste seu tempo, acompanhe sua constância e registre o que aprendeu.">
      <form className="smart-actions" onSubmit={e=>{e.preventDefault();const value={id:'preferences',user_id:user.id,query,level,minutes:duration};if(!updateItem<GuitarPreferences>('guitar_preferences',user.id,'preferences',value))createItem<GuitarPreferences>('guitar_preferences',user.id,value);setMessage('Preferências salvas.');}}><label>Nível <select value={level} onChange={e=>setLevel(e.target.value)}>{['Iniciante','Intermediário','Avançado'].map(l=><option key={l}>{l}</option>)}</select></label><label>Minutos disponíveis <input type="number" min="5" max="180" value={duration} onChange={e=>setDuration(Number(e.target.value))} required /></label><Button type="submit">Salvar preferências</Button></form>
      <h3>{topic.title}</h3><p>{topic.instruction}</p><p>Reserve alguns minutos para preparação, pratique um trecho curto e anote o resultado. Esse exercício não é uma transcrição da música escolhida.</p><p>Constância: {guitarStreak(tasks,date)} dias. Data: {date.split('-').reverse().join('/')}.</p>
    </Card>
    {today && <Card title="Prática de hoje" subtitle={today.title}><p>Foco registrado: {today.practice_focus}</p><form className="smart-actions" onSubmit={e=>{e.preventDefault();const form=new FormData(e.currentTarget);updateItem<GuitarTask>('tasks',user.id,today.id,{actual_minutes:Number(form.get('minutes')),notes:String(form.get('notes'))});setMessage('Tempo e anotações salvos.');}}><label>Tempo praticado <input key={today.id+today.guitar_track?.id} name="minutes" type="number" min="0" max="600" defaultValue={today.actual_minutes || 0} required /></label><label>Anotações <input name="notes" defaultValue={today.notes || ''} maxLength={2000} /></label><Button type="submit">Salvar progresso</Button></form><div className="smart-actions"><Button onClick={()=>updateItem<GuitarTask>('tasks',user.id,today.id,{status:today.status==='completed'?'pending':'completed',completed_at:today.status==='completed'?undefined:new Date().toISOString()})}>{today.status==='completed'?'Reabrir prática':'Concluir prática'}</Button><a href={`https://www.youtube.com/results?search_query=${encodeURIComponent((today.guitar_track?.title || '')+' '+(today.guitar_track?.artist || '')+' aula violão')}`} target="_blank" rel="noreferrer">Pesquisar aulas no YouTube</a><a href={`https://www.google.com/search?q=${encodeURIComponent((today.guitar_track?.title || '')+' '+(today.guitar_track?.artist || '')+' cifra')}`} target="_blank" rel="noreferrer">Pesquisar cifras</a></div><p>Aulas e cifras são pesquisas externas; não há transcrição ou vídeo verificado automaticamente.</p></Card>}
    <Card title="Biblioteca de músicas" subtitle="Pesquise artistas, títulos ou estilos no catálogo público da Apple. Até 60 gravações por consulta, sem limite de sete músicas."><form className="smart-actions" onSubmit={e=>{e.preventDefault();if(query.trim().length>=2){setSearch(query.trim());setRevision(v=>v+1);}}}><label>Artista, música ou estilo <input value={query} onChange={e=>setQuery(e.target.value)} minLength={2} maxLength={120} required /></label><Button disabled={busy} type="submit">{busy?'Buscando…':'Pesquisar músicas'}</Button></form><p role="status">{message}</p><p>{busy?'Consultando a fonte…':source}</p><details open><summary>Sugestões de hoje — variam pela data e evitam práticas concluídas nos últimos sete dias</summary>{suggestions.map(renderTrack)}{!busy&&!suggestions.length&&<p>Sem sugestões novas nesta busca. Pesquise outro artista ou escolha uma música da biblioteca.</p>}</details><details><summary>Todos os resultados ({tracks.length})</summary>{tracks.map(renderTrack)}</details></Card>
    <Card title={`Minha biblioteca (${saved.length})`}>{saved.map(renderTrack)}{!saved.length&&<p>Salve músicas do catálogo para acessá-las mesmo sem conexão.</p>}</Card>
    <Card title="Histórico de práticas">{[...tasks].sort((a,b)=>(b.due_date||'').localeCompare(a.due_date||'')).slice(0,30).map(t=><p key={t.id}>{t.due_date} • {t.title} • {t.actual_minutes||0} min • {t.status==='completed'?'Concluída':'Pendente'}</p>)}</Card>
  </div>;
}
