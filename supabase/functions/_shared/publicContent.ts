// Fixed, public sources only. No credentials or user-provided upstream URLs.
const sources = [
  { source: 'Agência Brasil', url: 'https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml' },
  { source: 'Vatican News', url: 'https://www.vaticannews.va/pt.rss.xml' },
];
const cache = new Map<string, { expires: number; value: string; fetchedAt: string }>();
const pending = new Map<string, Promise<{ value: string; fetchedAt: string }>>();
async function fetchSource(url: string, ttl = 300000) {
  const previous = cache.get(url);
  if (previous && previous.expires > Date.now()) return previous;
  const ongoing = pending.get(url); if (ongoing) return ongoing;
  const request = (async () => {
    const response = await fetch(url, { signal: AbortSignal.timeout(18000), redirect: 'error', headers: { Accept: 'application/rss+xml, application/xml, text/html' } });
    if (!response.ok) throw new Error(`A fonte retornou HTTP ${response.status}.`);
    const reader = response.body?.getReader(); if (!reader) throw new Error('A fonte retornou uma resposta vazia.');
    const decoder = new TextDecoder(); let value = ''; let size = 0;
    try {
      while (true) {
        const { done, value: chunk } = await reader.read(); if (done) break;
        size += chunk.byteLength;
        if (size > 2_000_000) throw new Error('Resposta da fonte acima do limite.');
        value += decoder.decode(chunk, { stream: true });
      }
      value += decoder.decode();
    } finally { await reader.cancel().catch(() => {}); }
    const result = { value, fetchedAt: new Date().toISOString(), expires: Date.now() + ttl };
    if (cache.size >= 50) cache.delete(cache.keys().next().value!);
    cache.set(url, result); return result;
  })();
  pending.set(url, request);
  try { return await request; } finally { pending.delete(url); }
}
export function validDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
const reason = (error: unknown) => error instanceof Error && /HTTP|limite|vazia/.test(error.message) ? error.message : 'Não foi possível alcançar a fonte. Tente novamente em instantes.';
function mainContent(html: string) {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
  if (!main) throw new Error('Formato da fonte não reconhecido.');
  // Client parses inert text only; never send executable elements or resource tags.
  return main.replace(/<(script|style|iframe|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, '').replace(/<(img|audio|video|source|link|input)\b[^>]*>/gi, '');
}
export async function getPublicNews() {
  const feeds = await Promise.all(sources.map(async source => {
    try {
      const result = await fetchSource(source.url);
      if (!/<rss\b/i.test(result.value)) throw new Error('Formato RSS não reconhecido.');
      return { ...source, xml: result.value, fetchedAt: result.fetchedAt };
    } catch (error) { return { ...source, error: reason(error) }; }
  }));
  return { fetchedAt: new Date().toISOString(), feeds };
}
export async function getBrazilianLiturgy(date: string) {
  if (!validDate(date)) throw new Error('Data inválida.');
  const [year, month, day] = date.split('-');
  const base = 'https://liturgia.cancaonova.com/pb/';
  try {
    const calendar = await fetchSource(`${base}?sDia=${Number(day)}&sMes=${Number(month)}&sAno=${year}`);
    const links = [...calendar.value.matchAll(/href=["']([^"']+)["']/g)].map(m=>m[1].replace(/&amp;/g,'&'));
    const url = links.find(link=>{
      try {const u=new URL(link); return u.origin==='https://liturgia.cancaonova.com' && u.pathname.startsWith('/pb/liturgia/') && u.searchParams.get('sDia')===String(Number(day)) && u.searchParams.get('sMes')===String(Number(month)) && u.searchParams.get('sAno')===year;}catch{return false;}
    });
    if(!url) throw new Error('Data não encontrada no calendário da fonte.');
    const result = await fetchSource(url);
    const plain=(html:string)=>html.replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
    const sourceDay=result.value.match(/class=['"]dia['"][^>]*>(\d+)</)?.[1];
    const sourceYear=result.value.match(/class=['"]ano['"][^>]*>(\d+)</)?.[1];
    const sourceMonth=result.value.match(/class=['"]mes['"][^>]*>([^<]+)</)?.[1].trim().toLowerCase();
    if(Number(sourceDay)!==Number(day)||sourceYear!==year||sourceMonth!==['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'][Number(month)-1]) throw new Error('A fonte retornou outra data.');
    const celebration=plain(result.value.match(/<h1[^>]*class="entry-title"[^>]*>([\s\S]*?)<\/h1>/i)?.[1]||'');
    if(!celebration) throw new Error('Título litúrgico não encontrado.');
    return {date, url, celebration, color:plain(result.value.match(/class="cor-liturgica"[^>]*>([^<]*)</)?.[1]||''), fetchedAt:result.fetchedAt};
  } catch { return {date,url:base,error:'Não foi possível confirmar a liturgia brasileira desta data na Canção Nova.'}; }
}
export function parsePaulusDay(html:string,date:string,url:string) {
  const origin='https://www.paulus.com.br';
  const page=new URL(url);
  if(page.origin!==origin||!page.pathname.startsWith('/portal/liturgia-diaria/'))throw new Error('Fonte inválida.');
  let verified=false;
  for(const match of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const data=JSON.parse(match[1]);
      const nodes=Array.isArray(data)?data:data['@graph']||[data];
      verified ||= nodes.some((node:{url?:string;datePublished?:string})=>node.url===url&&node.datePublished?.slice(0,10)===date);
    }catch{ /* Ignore unrelated malformed metadata. */ }
  }
  if(!verified)throw new Error('Data da página não confirmada.');
  const plain=(value:string)=>value.replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
  const block=html.match(/<div\s+id=["']texto["'][^>]*>([\s\S]*?)(?:<div\s+class=["']subtitulo-liturgia|<!--)/i)?.[1]||'';
  const paragraphs=[...block.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map(m=>plain(m[1]));
  const rubric=paragraphs.slice(0,2).join(' ').match(/\([^)]*\)/)?.[0]||'';
  const celebration=(paragraphs[0]||'').replace(rubric,'').trim();
  const preface=rubric.match(/pref(?:ácio|\.)\s*([^–—;)]+)/i)?.[1]?.trim();
  // Only explicit rubric references, never infer a Eucharistic prayer from readings.
  const eucharisticPrayer=rubric.match(/ora[çc][ãa]o eucar[íi]stica\s+([IVX]+(?:\s+ou\s+[IVX]+)?)/i)?.[0];
  const pageReference=rubric.match(/(?:p[áa]g(?:ina)?\.?|p\.)\s*(\d+(?:\s*[-–]\s*\d+)?)/i)?.[0];
  if(!celebration)throw new Error('Formato da página não reconhecido.');
  return {date,url,celebration,rubric,preface:preface||null,eucharisticPrayer:eucharisticPrayer||null,pageReference:pageReference||null};
}
export async function getPaulusDay(date:string) {
  if(!validDate(date))throw new Error('Data inválida.');
  const base='https://www.paulus.com.br/portal/liturgia-diaria/';
  const weekday=['domingo','segunda-feira','terca-feira','quarta-feira','quinta-feira','sexta-feira','sabado'][new Date(date+'T12:00:00Z').getUTCDay()];
  const day=Number(date.slice(8,10));
  try {
    const search=`https://www.paulus.com.br/portal/?s=${encodeURIComponent(day+' '+weekday)}`;
    const pages=await Promise.all([base,search].map(url=>fetchSource(url).catch(()=>null)));
    const candidates=new Set<string>();
    for(const result of pages)if(result)for(const match of result.value.matchAll(/href=["']([^"']+)["']/g)) {
      try {const u=new URL(match[1].replace(/&amp;/g,'&'),base);if(u.origin==='https://www.paulus.com.br'&&new RegExp(`^/portal/liturgia-diaria/(?:dia-)?${day}-${weekday}(?:-\\d+)?/$`).test(u.pathname))candidates.add(u.origin+u.pathname);}catch{ /* Skip invalid links. */ }
    }
    const results=await Promise.all([...candidates].slice(0,8).map(async url=>{
      try {const result=await fetchSource(url);return {...parsePaulusDay(result.value,date,url),fetchedAt:result.fetchedAt};}catch{return null;}
    }));
    const result=results.find(Boolean);if(result)return result;
    return {date,url:base,error:'A consulta automática não encontrou uma página da Paulus com esta data confirmada.'};
  }catch{return {date,url:base,error:'Não foi possível consultar a Paulus agora.'};}
}
export async function getCatholicDay(date: string) {
  if (!validDate(date)) throw new Error('Data inválida. Use AAAA-MM-DD.');
  const [year, month, day] = date.split('-');
  const targets = [
    { kind: 'readings', url: `https://www.vaticannews.va/pt/palavra-do-dia/${year}/${month}/${day}.html` },
    { kind: 'saints', url: `https://www.vaticannews.va/pt/santo-do-dia/${month}/${day}.html` },
  ];
  const brazilianPromise = getBrazilianLiturgy(date);
  const paulusPromise = getPaulusDay(date);
  const sections = await Promise.all(targets.map(async source => {
    try {
      const result = await fetchSource(source.url);
      return { ...source, html: mainContent(result.value), fetchedAt: result.fetchedAt };
    } catch (error) { return { ...source, error: reason(error) }; }
  }));
  return { date, source: 'Vatican News', sections, brazilian: await brazilianPromise, paulus: await paulusPromise };
}
export async function searchMusic(query: string) {
  const url = new URL('https://itunes.apple.com/search');
  url.search = new URLSearchParams({term: query, entity:'song', media:'music', country:'BR', limit:'60'}).toString();
  const result = await fetchSource(url.href);
  const payload = JSON.parse(result.value);
  if (!Array.isArray(payload.results)) throw new Error('Catálogo retornou formato inválido.');
  const tracks = payload.results.flatMap((item: Record<string, unknown>) => {
    if (typeof item.trackName !== 'string' || typeof item.artistName !== 'string' || typeof item.trackId !== 'number' || typeof item.trackViewUrl !== 'string') return [];
    try { const link = new URL(item.trackViewUrl); if (link.protocol !== 'https:' || !['music.apple.com','itunes.apple.com'].includes(link.hostname)) return []; } catch { return []; }
    return [{id:String(item.trackId),title:item.trackName,artist:item.artistName,album:typeof item.collectionName === 'string' ? item.collectionName : '',genre:typeof item.primaryGenreName === 'string' ? item.primaryGenreName : '',url:item.trackViewUrl}];
  });
  return {source:'Apple iTunes Search',fetchedAt:result.fetchedAt,tracks};
}
export async function getGuitarDiscovery(date: string, youtubeKey = '') {
  if(!validDate(date)) throw new Error('Data inválida.');
  const artists=['Padre Zezinho','Padre Marcelo Rossi','Adriana Arydes','Rosa de Saron','Anjos de Resgate','Frei Gilson','Comunidade Shalom','Missionário Shalom'];
  const day=Math.floor(Date.parse(date+'T12:00:00Z')/86400000);
  const artist=artists[((day%artists.length)+artists.length)%artists.length];
  const errors:string[]=[];
  const songsPromise=searchMusic(artist).catch(()=>{errors.push('Catálogo de músicas indisponível.');return {tracks:[]};});
  const feedPromise=(async()=>{
    try {
      if(youtubeKey) {
        const lists=await Promise.all((['picking','solo'] as const).map(async kind=>{
          const query=kind==='solo'?`violão católico solo introdução aula ${artist}`:`violão católico dedilhado aula ${artist}`;
          const url=new URL('https://www.googleapis.com/youtube/v3/search');
          url.search=new URLSearchParams({key:youtubeKey,part:'snippet',type:'video',maxResults:'25',relevanceLanguage:'pt',regionCode:'BR',safeSearch:'strict',q:query}).toString();
          const raw=JSON.parse((await fetchSource(url.href,86400000)).value);
          if(!Array.isArray(raw.items))throw new Error('Resposta inválida.');
          return raw.items.flatMap((item:{id?:{videoId?:string};snippet?:{title?:string;channelTitle?:string;publishedAt?:string}})=>{
            const id=item.id?.videoId;const detail=item.snippet;
            return id&&/^[\w-]{11}$/.test(id)&&detail?.title?[{id,title:detail.title,channel:detail.channelTitle||'YouTube',publishedAt:detail.publishedAt||'',url:`https://www.youtube.com/watch?v=${id}`,kind}]:[];
          });
        }));
        return lists.flat();
      }
      const result=await fetchSource('https://www.youtube.com/feeds/videos.xml?channel_id=UCpypU2XLYmOsf36xgcgrW3w');
      const clean=(v:string)=>v.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
      return [...result.value.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].flatMap(match=>{
        const xml=match[1];const id=xml.match(/<yt:videoId>([^<]+)</)?.[1]; const title=clean(xml.match(/<title>([\s\S]*?)<\/title>/)?.[1]||'');
        if(!id || !/^[\w-]{11}$/.test(id) || !title)return [];
        return [{id,title,channel:'Cifra Club',publishedAt:xml.match(/<published>([^<]+)</)?.[1]||'',url:`https://www.youtube.com/watch?v=${id}`,kind:/dedilhad|fingerstyle|fingerpick|arpejo/i.test(title)?'picking':/solo|introdu[çc][ãa]o|lick/i.test(title)?'solo':'other'}];
      }).filter(v=>v.kind!=='other');
    }catch{errors.push('Feed de aulas indisponível.');return [];}
  })();
  const [catalog,videos]=await Promise.all([songsPromise,feedPromise]);
  return {date,artist,tracks:catalog.tracks,videos,errors,fetchedAt:new Date().toISOString(),source:youtubeKey?'Apple iTunes Search e YouTube Data API':'Apple iTunes Search e feed público do Cifra Club'};
}
export async function publicContentResponse(url: URL, options: {youtubeKey?:string} = {}): Promise<{ status: number; body: unknown }> {
  if (url.pathname === '/api/public/guitar-discovery') {
    const date=url.searchParams.get('date')||'';
    if(!validDate(date))return {status:400,body:{error:'Data inválida.'}};
    return {status:200,body:await getGuitarDiscovery(date, options.youtubeKey)};
  }
  if (url.pathname === '/api/public/music') {
    const query = (url.searchParams.get('q') || '').trim();
    if (query.length < 2 || query.length > 120) return {status:400,body:{error:'Informe de 2 a 120 caracteres para pesquisar.'}};
    return {status:200,body:await searchMusic(query)};
  }
  if (url.pathname === '/api/public/news') return { status: 200, body: await getPublicNews() };
  if (url.pathname === '/api/public/catholic') {
    const date = url.searchParams.get('date') || '';
    if (!validDate(date)) return { status: 400, body: { error: 'Informe uma data válida no formato AAAA-MM-DD.' } };
    return { status: 200, body: await getCatholicDay(date) };
  }
  return { status: 404, body: { error: 'Consulta não encontrada.' } };
}
