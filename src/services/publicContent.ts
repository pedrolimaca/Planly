import { z } from 'zod';
import { supabase } from './supabase';
const feedSchema = z.object({ source: z.string(), url: z.string().url(), xml: z.string().max(2_000_000).optional(), fetchedAt: z.string().optional(), error: z.string().optional() });
const newsSchema = z.object({ fetchedAt: z.string(), feeds: z.array(feedSchema).max(10) });
const brazilianSchema = z.object({date:z.string(),url:z.string().url().refine(value=>new URL(value).origin==='https://liturgia.cancaonova.com'),celebration:z.string().optional(),color:z.string().optional(),fetchedAt:z.string().optional(),error:z.string().optional()});
const paulusSchema=z.object({date:z.string(),url:z.string().url().refine(v=>new URL(v).origin==='https://www.paulus.com.br'),celebration:z.string().optional(),rubric:z.string().optional(),preface:z.string().nullable().optional(),eucharisticPrayer:z.string().nullable().optional(),pageReference:z.string().nullable().optional(),fetchedAt:z.string().optional(),error:z.string().optional()});
const catholicSchema = z.object({ paulus:paulusSchema.optional(), brazilian: brazilianSchema.optional(), date: z.string(), source: z.string(), sections: z.array(z.object({ kind: z.enum(['readings','saints']), url: z.string().url(), html: z.string().max(2_000_000).optional(), fetchedAt: z.string().optional(), error: z.string().optional() })).max(2) });
async function requestContent(kind: 'news' | 'catholic', date?: string, signal?: AbortSignal): Promise<unknown> {
  const path = kind === 'news' ? '/api/public/news' : `/api/public/catholic?date=${encodeURIComponent(date || '')}`;
  const controller = new AbortController();
  const abort = () => controller.abort(); signal?.addEventListener('abort', abort, { once: true });
  const timer = setTimeout(abort, kind === 'catholic' ? 45000 : 25000);
  try {
    const response = await fetch(path, { signal: controller.signal, headers: { Accept: 'application/json' } });
    if (response.ok && response.headers.get('content-type')?.includes('application/json')) return await response.json();
    if (response.status !== 404 && !response.ok) throw new Error(`O serviço de conteúdo retornou HTTP ${response.status}. Tente novamente.`);
    if (supabase) {
      const { data, error } = await supabase.functions.invoke('planly-content', { body: { kind, date }, signal: controller.signal });
      if (!error && data) return data;
    }
    throw new Error('Este endereço ainda não tem um serviço de conteúdo ativo. A configuração do servidor precisa ser atualizada.');
  } catch (error) {
    if (signal?.aborted) throw error;
    if (controller.signal.aborted) throw new Error('A consulta demorou mais que o esperado. Tente novamente.');
    throw error;
  } finally { clearTimeout(timer); signal?.removeEventListener('abort', abort); }
}
const clean = (value: string | null | undefined) => (value || '').replace(/\s+/g, ' ').trim();
function safeSourceLink(value: string, base: string): string | null {
  if (!value.trim()) return null;
  try {
    const url = new URL(value, base);
    return url.protocol === 'https:' && ['agenciabrasil.ebc.com.br','www.vaticannews.va'].includes(url.hostname) ? url.href : null;
  } catch { return null; }
}
export interface NewsItem { title: string; url: string; date: string; source: string; category: string; summary: string }
export function parseNewsPayload(payload: unknown, now = Date.now()) {
  const data = newsSchema.parse(payload); const items: NewsItem[] = []; const errors: string[] = [];
  for (const feed of data.feeds) {
    if (!feed.xml) { errors.push(`${feed.source}: ${feed.error || 'sem resposta'}`); continue; }
    const xml = new DOMParser().parseFromString(feed.xml, 'application/xml');
    if (xml.querySelector('parsererror')) { errors.push(`${feed.source}: formato RSS inválido.`); continue; }
    for (const item of Array.from(xml.querySelectorAll('item'))) {
      const title = clean(item.querySelector('title')?.textContent);
      const timestamp = Date.parse(item.querySelector('pubDate')?.textContent || '');
      const url = safeSourceLink(clean(item.querySelector('link')?.textContent), feed.url);
      if (!url || !title || !Number.isFinite(timestamp) || timestamp > now || now - timestamp > 86400000 || items.some(n => n.url === url)) continue;
      const description = item.querySelector('description')?.textContent || '';
      const summary = clean(new DOMParser().parseFromString(description.replace(/<(img|iframe|script)\b[^>]*>/gi, ''), 'text/html').body.textContent).split(' ').slice(0,35).join(' ');
      items.push({ title, url, date: new Date(timestamp).toISOString(), source: feed.source, category: clean(item.querySelector('category')?.textContent) || (feed.source === 'Vatican News' ? 'Igreja e mundo' : 'Geral'), summary });
    }
  }
  return { items: items.sort((a,b) => b.date.localeCompare(a.date)), errors, fetchedAt: data.fetchedAt };
}
export async function loadNews(signal?: AbortSignal) { return parseNewsPayload(await requestContent('news', undefined, signal)); }
export interface Reading { title: string; reference: string; excerpt: string }
export interface Saint { name: string; excerpt: string; url: string }
export interface CatholicDay { paulus?:z.infer<typeof paulusSchema>; brazilian?: z.infer<typeof brazilianSchema>; date: string; celebration: string; readings: Reading[]; saints: Saint[]; readingsUrl: string; saintsUrl: string; fetchedAt?: string; errors: string[] }
export function parseCatholicPayload(payload: unknown, date: string): CatholicDay {
  const data = catholicSchema.parse(payload);
  if (data.date !== date) throw new Error('A fonte retornou uma data diferente da solicitada.');
  const [year,month,day] = date.split('-');
  const result: CatholicDay = { paulus:data.paulus?.date===date?data.paulus:undefined, brazilian: data.brazilian?.date === date ? data.brazilian : undefined, date, celebration: '', readings: [], saints: [], readingsUrl: '', saintsUrl: '', errors: [] };
  for (const section of data.sections) {
    const url = safeSourceLink(section.url, 'https://www.vaticannews.va');
    if (!url || new URL(url).hostname !== 'www.vaticannews.va') { result.errors.push('Link da fonte inválido.'); continue; }
    if (section.kind === 'readings') result.readingsUrl = url; else result.saintsUrl = url;
    if (!section.html) { result.errors.push(`${section.kind === 'readings' ? 'Leituras' : 'Santos'}: ${section.error || 'fonte indisponível'}`); continue; }
    const doc = new DOMParser().parseFromString(section.html, 'text/html');
    const sourceDate = clean(doc.querySelector('#dataFilter-text')?.textContent);
    if (section.kind === 'readings') {
      if (sourceDate !== `${day}/${month}/${year}`) { result.errors.push('As leituras retornadas não correspondem à data escolhida.'); continue; }
      result.celebration = clean(doc.querySelector('.indicazioneLiturgica')?.textContent);
      for (const block of Array.from(doc.querySelectorAll('section.section--isStatic'))) {
        const title = clean(block.querySelector('h2')?.textContent);
        if (!/leitura|evangelho|salmo/i.test(title)) continue;
        const paragraphs = Array.from(block.querySelectorAll('.section__content p')).map(p => clean(p.textContent)).filter(Boolean);
        // Each reading reference follows its book heading, including Sunday collections.
        for (let i = 1; i < paragraphs.length; i++) {
          if (!/^\d+[\d\s,;.:()a-z–-]*$/i.test(paragraphs[i]) || !/[,:]/.test(paragraphs[i])) continue;
          result.readings.push({ title, reference: `${paragraphs[i-1]} — ${paragraphs[i]}`, excerpt: paragraphs.slice(i+1,i+3).join(' ').split(' ').slice(0,20).join(' ') });
        }
      }
      if (!result.readings.length) result.errors.push('A fonte respondeu, mas o formato das leituras mudou. Abra o texto original.');
    } else {
      const months = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
      if (sourceDate.toLowerCase() !== `${Number(day)} ${months[Number(month)-1]}`) { result.errors.push('O calendário de santos retornou outra data.'); continue; }
      for (const block of Array.from(doc.querySelectorAll('section.section--isStatic'))) {
        const name = clean(block.querySelector('h2')?.textContent);
        const link = safeSourceLink(block.querySelector('a.saintReadMore')?.getAttribute('href') || url, url);
        if (name && link) result.saints.push({ name, excerpt: clean(block.querySelector('.section__content p')?.textContent).split(' ').slice(0,24).join(' '), url: link });
      }
      if (!result.saints.length) result.errors.push('Nenhum santo foi identificado na página desta data.');
    }
    result.fetchedAt = section.fetchedAt;
  }
  return result;
}
const catholicCache=new Map<string,{expires:number;value:CatholicDay}>();
const catholicPending=new Map<string,Promise<CatholicDay>>();
export async function loadCatholicDay(date:string, signal?:AbortSignal, force=false) {
  if(signal?.aborted)throw new DOMException('Consulta cancelada','AbortError');
  const cached=catholicCache.get(date);if(!force&&cached&&cached.expires>Date.now())return cached.value;
  let request=catholicPending.get(date);
  if(!request){request=(async()=>{
    const result=parseCatholicPayload(await requestContent('catholic',date),date);
    if(catholicCache.size>=14)catholicCache.delete(catholicCache.keys().next().value!);
    catholicCache.set(date,{expires:Date.now()+300000,value:result});return result;
  })();catholicPending.set(date,request);void request.finally(()=>catholicPending.delete(date)).catch(()=>{});}
  const result=await request;if(signal?.aborted)throw new DOMException('Consulta cancelada','AbortError');return result;
}
