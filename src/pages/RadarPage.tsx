import { useEffect, useState } from 'react';
import { loadNews, type NewsItem } from '../services/publicContent';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
export default function RadarPage() {
  const [news, setNews] = useState<NewsItem[]>([]); const [status, setStatus] = useState(''); const [error, setError] = useState('');
  const [busy, setBusy] = useState(true); const [category, setCategory] = useState('Todas'); const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController(); setBusy(true); setError('');
    loadNews(controller.signal).then(data => {
      if (controller.signal.aborted) return;
      if (!data.items.length && data.errors.length) { setError(data.errors.join(' ')); return; }
      setNews(data.items); setStatus(`Consulta: ${new Date(data.fetchedAt).toLocaleString('pt-BR')}. ${data.items.length} notícias publicadas nas últimas 24 horas.`);
      setError(data.errors.join(' '));
    }).catch(reason => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'Não foi possível consultar as notícias.'); }).finally(() => { if (!controller.signal.aborted) setBusy(false); });
    return () => controller.abort();
  }, [revision]);
  useEffect(() => {
    let lastRefresh = Date.now();
    const refresh = () => {
      if (document.visibilityState === 'hidden' || Date.now() - lastRefresh < 60000) return;
      lastRefresh = Date.now();
      setRevision(value => value + 1);
    };
    const interval = window.setInterval(refresh, 15 * 60000);
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('online', refresh);
    return () => { window.clearInterval(interval); document.removeEventListener('visibilitychange', refresh); window.removeEventListener('online', refresh); };
  }, []);
  const recent = news.filter(item => Date.now() - Date.parse(item.date) <= 86400000);
  const filtered = recent.filter(n => category === 'Todas' || n.category === category);
  return <div style={{ display: 'grid', gap: 20 }}><Card title="Radar do Dia" subtitle="Notícias das últimas 24 horas. Atualização automática a cada 15 minutos e ao voltar à aba.">
    <div className="smart-actions"><Button disabled={busy} onClick={() => setRevision(v => v+1)}>{busy ? 'Consultando…' : 'Atualizar notícias'}</Button><label>Categoria <select value={category} onChange={e => setCategory(e.target.value)}>{['Todas', ...new Set(recent.map(n => n.category))].map(c => <option key={c}>{c}</option>)}</select></label></div>
    <p role="status">{busy ? 'Consultando Agência Brasil e Vatican News…' : status}</p>{error && <p role="alert">{error}{recent.length > 0 ? ' As notícias da última consulta ainda dentro de 24 horas foram mantidas.' : ''}</p>}
  </Card><Card title="O que preciso saber hoje?" subtitle="Seleção das três publicações mais recentes.">{filtered.slice(0,3).map(n => <p key={n.url}><a href={n.url} target="_blank" rel="noreferrer">{n.title}</a></p>)}{!busy && !filtered.length && <p>{error ? 'Tente atualizar novamente após a conexão ser restabelecida.' : 'Nenhuma publicação nas últimas 24 horas para este filtro.'}</p>}</Card>
  {filtered.map(n => <Card key={n.url} title={n.title} subtitle={`${n.source} • ${new Date(n.date).toLocaleString('pt-BR')} • ${n.category}`}>{n.summary && <p>{n.summary}…</p>}<a href={n.url} target="_blank" rel="noreferrer">Ler notícia original</a></Card>)}</div>;
}
