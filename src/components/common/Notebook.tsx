import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDataRefresh } from '../../hooks/useDataRefresh';
import { createItem, getAllItems, updateItem, deleteItem } from '../../services/storage';
import type { Note } from '../../types';
import Card from './Card';
import Button from './Button';

function safeNoteLink(value: string) {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : null; } catch { return null; }
}
export default function Notebook({spiritual=false}:{spiritual?:boolean}) {
  const {user}=useAuth(); const [,refresh]=useState(0);
  useDataRefresh(()=>refresh(v=>v+1));
  const [editing,setEditing]=useState<string>(); const [title,setTitle]=useState(''); const [content,setContent]=useState('');
  const [links,setLinks]=useState(''); const [search,setSearch]=useState(''); const [message,setMessage]=useState('');
  if(!user)return null;
  const notes=getAllItems<Note>('notes',user.id).filter(n=>(!spiritual || n.category==='spiritual') && `${n.title} ${n.content}`.toLocaleLowerCase().includes(search.toLocaleLowerCase())).sort((a,b)=>Number(b.pinned)-Number(a.pinned)||b.updated_at.localeCompare(a.updated_at));
  const clear=()=>{setEditing(undefined);setTitle('');setContent('');setLinks('');};
  return <Card title={spiritual?'Minhas pregações e reflexões':'Meu caderno'} subtitle="Anotações e links de vídeos, PDFs, documentos ou pastas. Com sua conta conectada, acompanhe o envio para a nuvem no indicador de sincronização.">
    {spiritual && <div className="notebook-sources"><h4>Fontes católicas para acompanhar</h4><p><a href="https://padrepauloricardo.org/" target="_blank" rel="noreferrer">Padre Paulo Ricardo — homilias e formação ↗</a></p><p><a href="https://homilia.cancaonova.com/" target="_blank" rel="noreferrer">Canção Nova — homilia diária ↗</a></p><p>Abra a fonte e salve abaixo a pregação que desejar, com suas reflexões.</p></div>}
    <form className="notebook-form" onSubmit={e=>{
      e.preventDefault(); const entered=links.split('\n').map(l=>l.trim()).filter(Boolean); const urls=entered.map(safeNoteLink);
      if(urls.some(u=>!u)){setMessage('Use links completos começando com https:// ou http://, um por linha.');return;}
      try {
        const fields={title:title.trim(),content:content.trim(),links:[...new Set(urls as string[])]};
        if(!fields.title){setMessage('Informe um título.');return;}
        if(editing){if(!updateItem<Note>('notes',user.id,editing,fields))throw new Error('Anotação não encontrada.');}
        else createItem<Note>('notes',user.id,{...fields,user_id:user.id,pinned:false,category:spiritual?'spiritual':undefined});
        clear();setMessage('Anotação salva.');
      } catch {setMessage('Não foi possível salvar. Seu texto continua no formulário; verifique o espaço do navegador.');}
    }}>
      <label>Título da anotação<input value={title} onChange={e=>setTitle(e.target.value)} required maxLength={300}/></label>
      <label htmlFor="notebook-content">Anotação</label><textarea id="notebook-content" aria-label="Anotação" value={content} onChange={e=>setContent(e.target.value)} rows={5} maxLength={30000}/>
      <label>Links de vídeos e arquivos<textarea value={links} onChange={e=>setLinks(e.target.value)} rows={3} maxLength={12000} placeholder="https://www.youtube.com/watch?v=…&#10;https://drive.google.com/…"/></label>
      <small>Um endereço por linha. Os arquivos permanecem no serviço de origem; suas permissões de acesso continuam valendo.</small>
      <div className="smart-actions"><Button type="submit">{editing?'Salvar alterações':'Salvar anotação'}</Button>{editing&&<Button variant="outline" onClick={clear}>Cancelar edição</Button>}</div>
    </form><p role="status">{message}</p>
    <label className="notebook-search">Buscar anotações<input value={search} onChange={e=>setSearch(e.target.value)}/></label>
    <div className="notebook-list">{notes.map(note=><article key={note.id}><h3>{note.pinned?'Fixada · ':''}{note.title}</h3>{note.category==='spiritual'&&<small>Vida Espiritual</small>}<p className="notebook-content">{note.content}</p><ul>{note.links?.filter(url=>safeNoteLink(url)).map(url=><li key={url}><a href={url} target="_blank" rel="noreferrer">{url} ↗</a></li>)}</ul><div className="smart-actions"><Button size="sm" variant="outline" onClick={()=>{setEditing(note.id);setTitle(note.title);setContent(note.content);setLinks((note.links||[]).join('\n'));setMessage('Editando: '+note.title);}}>Editar</Button><Button size="sm" variant="outline" onClick={()=>updateItem<Note>('notes',user.id,note.id,{pinned:!note.pinned})}>{note.pinned?'Desafixar':'Fixar'}</Button><Button size="sm" variant="outline" onClick={()=>{if(window.confirm(`Excluir a anotação “${note.title}”?`)){deleteItem('notes',user.id,note.id);if(editing===note.id)clear();}}}>Excluir</Button></div></article>)}</div>{!notes.length&&<p>Nenhuma anotação encontrada.</p>}
  </Card>;
}
