import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { createItem, getAllItems, updateItem } from '../../services/storage';
import type { MusicTrack } from '../../services/guitarPractice';
import Button from './Button';
const publicUrl = (hosts:string[])=>z.string().url().refine(value=>{const u=new URL(value);return u.protocol==='https:'&&hosts.includes(u.hostname);});
const trackSchema=z.object({id:z.string(),title:z.string(),artist:z.string(),genre:z.string(),album:z.string(),url:publicUrl(['music.apple.com','itunes.apple.com'])});
const videoSchema=z.object({id:z.string(),title:z.string(),channel:z.string(),publishedAt:z.string(),url:publicUrl(['www.youtube.com']),kind:z.enum(['solo','picking'])});
const schema=z.object({date:z.string(),artist:z.string(),tracks:z.array(trackSchema),videos:z.array(videoSchema),errors:z.array(z.string()),fetchedAt:z.string(),source:z.string()});
type Video=z.infer<typeof videoSchema>;
type Selection={id:string;user_id:string;date:string;track?:MusicTrack;solo?:Video;picking?:Video};
export default function OnlineGuitar({date,onChoose}:{date:string;onChoose:(track:MusicTrack)=>void}) {
  const {user}=useAuth();const [data,setData]=useState<z.infer<typeof schema>>();const [selected,setSelected]=useState<Selection>();const [busy,setBusy]=useState(true);const [error,setError]=useState('');const [revision,setRevision]=useState(0);
  useEffect(()=>{
    if(!user)return;
    const controller=new AbortController();let active=true;const timer=setTimeout(()=>controller.abort(),25000);
    setData(undefined);setSelected(undefined);setBusy(true);setError('');
    const history=getAllItems<Selection>('guitar_discovery',user.id);const saved=history.find(s=>s.date===date);setSelected(saved);
    const previous=history.filter(s=>s.date<date&&Date.parse(date)-Date.parse(s.date)<=30*86400000);
    (async()=>{try{
      const response=await fetch(`/api/public/guitar-discovery?date=${date}`,{signal:controller.signal});if(!response.ok)throw new Error();
      const result=schema.parse(await response.json());if(result.date!==date)throw new Error();if(!active)return;
      setData(result);setError(result.errors.join(' '));
      if(saved?.track && saved.solo && saved.picking)return;
      const candidates=result.tracks.filter(t=>!previous.some(p=>p.track?.id===t.id || (p.track?.title===t.title&&p.track?.artist===t.artist)));
      const index=Math.floor(Date.parse(date+'T12:00:00Z')/86400000);
      const pick=(kind:'solo'|'picking')=>{const items=result.videos.filter(v=>v.kind===kind&&!previous.some(p=>p[kind]?.id===v.id));return items.length?items[index%items.length]:undefined;};
      const value:Selection={id:date,user_id:user.id,date,track:saved?.track || (candidates.length?candidates[index%candidates.length]:undefined),solo:saved?.solo || pick('solo'),picking:saved?.picking || pick('picking')};
      // Do not freeze an empty selection after a source failure.
      if(value.track||value.solo||value.picking){if(saved)updateItem<Selection>('guitar_discovery',user.id,saved.id,value);else createItem<Selection>('guitar_discovery',user.id,value);setSelected(value);}
    }catch{if(active)setError('Não foi possível atualizar as fontes. As recomendações salvas para hoje continuam disponíveis.');}finally{clearTimeout(timer);if(active)setBusy(false);}})();
    return()=>{active=false;clearTimeout(timer);controller.abort();};
  },[date,user,revision]);
  const tutorial=(kind:'solo'|'picking')=>{const item=selected?.[kind];return <article className="guitar-study"><span className="guitar-eyebrow">{kind==='solo'?'02 / Melodia':'01 / Técnica'}</span><h3>{kind==='solo'?'Solo recomendado':'Dedilhado recomendado'}</h3>{item?<><h4>{item.title}</h4><p>{item.channel} · publicado em {new Date(item.publishedAt).toLocaleDateString('pt-BR')}</p><a href={item.url} target="_blank" rel="noreferrer">Abrir vídeo da fonte ↗</a><p className="guitar-study-note">Selecionado pelo título publicado. Pode incluir guitarra ou demonstração; confira instrumento, nível e conteúdo antes de praticar.</p></>:<p>{busy?'Consultando vídeos…':'Não há um vídeo desta técnica no feed consultado que você não tenha recebido nos últimos 30 dias.'}</p>}<p><a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`violão católico ${kind==='solo'?'solo introdução':'dedilhado'} aula ${selected?.track?.title||''}`)}`} target="_blank" rel="noreferrer">Pesquisar {kind==='solo'?'solo':'dedilhado'} católico no YouTube ↗</a></p></article>;};
  return <section className="daily-guitar" aria-label="Recomendações online de violão"><header className="guitar-session-heading"><div><span className="guitar-eyebrow">Repertório online / {date.split('-').reverse().join('.')}</span><h2>O estudo de hoje.</h2><p>Música católica e recomendações técnicas consultadas na internet.</p></div><Button variant="outline" disabled={busy} onClick={()=>setRevision(v=>v+1)}>{busy?'Consultando…':'Atualizar fontes'}</Button></header><div className="guitar-session-grid">{tutorial('picking')}{tutorial('solo')}<article className="guitar-study guitar-study-song"><span className="guitar-eyebrow">03 / Música católica</span>{selected?.track?<><h3>{selected.track.title}</h3><p>{selected.track.artist}</p><a href={selected.track.url} target="_blank" rel="noreferrer">Conferir gravação na Apple Music ↗</a><p><a href={`https://www.google.com/search?q=${encodeURIComponent('site:cifraclub.com.br '+selected.track.artist+' '+selected.track.title+' cifra')}`} target="_blank" rel="noreferrer">Procurar cifra completa ↗</a></p><Button variant="outline" onClick={()=>onChoose(selected.track!)}>Registrar música de hoje</Button></>:<p>{busy?'Consultando catálogo…':'Nenhuma música nova foi encontrada nesta consulta.'}</p>}<p className="guitar-study-note">A gravação vem do catálogo. A disponibilidade da cifra é conferida no site externo.</p></article></div><footer className="guitar-session-footer"><p role="status">{error || (data?`${data.source} · consulta em ${new Date(data.fetchedAt).toLocaleString('pt-BR')}`:'')}</p><p>A seleção fica salva durante o dia e evita repetir músicas e vídeos recebidos nos últimos 30 dias neste navegador. Atualizar consulta as fontes; as sugestões escolhidas hoje são mantidas. {data?.source.includes('Data API')?'A busca retorna vídeos pelo tema; as aulas não foram assistidas ou validadas pelo Planly.':'O feed não garante aulas católicas novas diariamente. A busca automática ampliada precisa da integração YouTube Data API configurada no servidor.'}</p></footer></section>;
}
