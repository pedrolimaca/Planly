import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { loadCatholicDay, type CatholicDay } from '../../services/publicContent';
import Card from './Card';
import Button from './Button';
export default function DailyCatholicContent({ date: requestedDate }: { date?: string }) {
  const [date, setDate] = useState(requestedDate || format(new Date(), 'yyyy-MM-dd'));
  const [data, setData] = useState<CatholicDay | null>(null);
  const [error, setError] = useState(''); const [busy, setBusy] = useState(true); const [revision, setRevision] = useState(0);
  const selectedDate = requestedDate || date;
  useEffect(()=>{
    let previous=format(new Date(),'yyyy-MM-dd');
    const timer=setInterval(()=>{const today=format(new Date(),'yyyy-MM-dd');if(today!==previous){const yesterday=previous;previous=today;setDate(value=>value===yesterday?today:value);}},60000);
    return()=>clearInterval(timer);
  },[]);
  useEffect(() => {
    const controller = new AbortController(); setBusy(true); setError('');
    loadCatholicDay(selectedDate, controller.signal, revision > 0).then(result => { if (!controller.signal.aborted) setData(result); }).catch(reason => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'Consulta indisponível.'); }).finally(() => { if (!controller.signal.aborted) setBusy(false); });
    return () => controller.abort();
  }, [selectedDate, revision]);
  const current = data?.date === selectedDate ? data : null;
  const [year, month, day] = selectedDate.split('-');
  const monthName = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'][Number(month)-1];
  const dateLabel = `${Number(day)} de ${monthName} de ${year}`;
  const searchUrl = (query:string) => `https://www.google.com/search?q=${encodeURIComponent(query)}`;

  return <div className="daily-catholic-content" style={{ display: 'grid', gap: 'var(--space-4)' }}>
    <Card title="Liturgia e santos do dia" subtitle="Consulta ao calendário e às leituras da Vatican News">
      <div className="smart-actions">{!requestedDate && <label>Data da liturgia <input type="date" value={date} required onChange={e => { if (e.target.value) setDate(e.target.value); }} /></label>}<Button disabled={busy} onClick={() => setRevision(v => v+1)}>{busy ? 'Consultando fonte…' : 'Atualizar leituras e santos'}</Button></div>
      <div className="notebook-sources" aria-label="Missa da data selecionada">
        <h3>Missa de {dateLabel}</h3>
        <p>Consulta automática à Paulus · edição mensal {month}/{year}</p>
        {busy&&!current?.paulus?<p>Localizando a missa e verificando a data na fonte…</p>:current?.paulus?.celebration?<>
          <h4>{current.paulus.celebration}</h4>
          <p>{current.paulus.rubric}</p>
          <p><strong>Prefácio:</strong> {current.paulus.preface || 'A página desta data não indica um prefácio.'}</p>
          <p><strong>Página no subsídio:</strong> {current.paulus.pageReference || 'Não publicada nesta página online.'}</p>
          <p><strong>Oração Eucarística:</strong> {current.paulus.eucharisticPrayer || 'A página desta data não indica uma opção. Confira com o celebrante.'}</p>
          <small>Data conferida na publicação · consulta em {new Date(current.paulus.fetchedAt!).toLocaleString('pt-BR')}</small>
          <p><a href={current.paulus.url} target="_blank" rel="noreferrer">Conferir a missa na Paulus ↗</a></p>
        </>:<p role="status">{current?.paulus?.error || 'Não foi possível confirmar as indicações da Paulus para esta data.'}</p>}
        <details><summary>Outras fontes e pesquisa complementar</summary><div className="smart-actions">
          <a href={`https://www.pocketterco.com.br/liturgia/${day}/${month}/${year}`} target="_blank" rel="noreferrer">Abrir orações e leituras da missa ↗</a>
          <a href={searchUrl(`site:paulus.com.br/portal/liturgia-diaria/ "${year}" "${Number(day)}" "${monthName}" missa`)} target="_blank" rel="noreferrer">Pesquisar a missa na Paulus pelo Google ↗</a>
        </div></details>
      </div>
      <p className="liturgy-query-status" role="status">{busy ? 'Buscando a data selecionada na fonte oficial…' : current?.fetchedAt ? `Data: ${selectedDate.split('-').reverse().join('/')} • Consulta: ${new Date(current.fetchedAt).toLocaleString('pt-BR')}` : ''}</p>
      {error && <p role="alert">{error}{current ? ' Os dados da última consulta foram mantidos.' : ''}</p>}
      {current?.brazilian && <div className="notebook-sources"><h3>Calendário litúrgico no Brasil</h3><p>{current.brazilian.celebration || current.brazilian.error}</p>{current.brazilian.color && <p>{current.brazilian.color}</p>}<a href={current.brazilian.url} target="_blank" rel="noreferrer">Conferir a data na Liturgia Diária da Canção Nova ↗</a></div>}
      {current?.celebration && <h3 className="liturgy-celebration-title">{current.celebration}</h3>}
      {current?.errors.map(message => <p role="alert" key={message}>{message}</p>)}
    </Card>
    {current && <>
      {current.saints.length > 0 && <Card title="Santos do dia" subtitle="Nomes publicados no calendário da fonte para a data escolhida">{current.saints.map(saint => <article key={saint.url} className="source-article"><h3>{saint.name}</h3>{saint.excerpt && <blockquote>{saint.excerpt}…</blockquote>}<a href={saint.url} target="_blank" rel="noreferrer">Ler a história completa na Vatican News</a></article>)}</Card>}
      {current.readings.length > 0 && <Card title="Leituras do dia" subtitle="Referências e breves trechos; o texto integral está na fonte oficial.">{current.readings.map((reading,i) => <article key={`${reading.reference}-${i}`} className="source-article"><h3>{reading.title}</h3><p><strong>{reading.reference}</strong></p>{reading.excerpt && <blockquote>{reading.excerpt}…</blockquote>}<a href={current.readingsUrl} target="_blank" rel="noreferrer">Ler o texto completo e a reflexão na Vatican News</a></article>)}</Card>}
      {!current.readings.length && current.readingsUrl && <a href={current.readingsUrl} target="_blank" rel="noreferrer">Abrir a página oficial das leituras desta data</a>}
      {!current.saints.length && current.saintsUrl && <a href={current.saintsUrl} target="_blank" rel="noreferrer">Abrir o calendário oficial de santos desta data</a>}
    </>}
  </div>;
}
