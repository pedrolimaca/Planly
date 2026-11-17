const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info', 'Content-Type': 'application/json' };
const sources = [
  { name: 'Agência Brasil', url: 'https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml' },
  { name: 'Vatican News', url: 'https://www.vaticannews.va/pt.rss.xml' },
];
let cached: { at: number; data: unknown } | undefined;
Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers });
  if (!['GET','POST'].includes(request.method)) return new Response('Método não permitido', { status: 405, headers });
  if (cached && Date.now() - cached.at < 300000) return new Response(JSON.stringify(cached.data), { headers });
  const feeds = await Promise.all(sources.map(async source => {
    try {
      const response = await fetch(source.url, { signal: AbortSignal.timeout(12000), redirect: 'error' });
      if (!response.ok) throw new Error('Fonte indisponível');
      const xml = await response.text();
      if (xml.length > 2000000 || !/<(rss|feed)\b/i.test(xml)) throw new Error('Feed inválido');
      return { source: source.name, xml };
    } catch { return { source: source.name, error: 'Atualização indisponível' }; }
  }));
  const data = { fetchedAt: new Date().toISOString(), feeds };
  if (feeds.some(f => f.xml)) cached = { at: Date.now(), data };
  return new Response(JSON.stringify(data), { headers });
});
