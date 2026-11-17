import { publicContentResponse } from '../_shared/publicContent.ts';
const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info', 'Content-Type': 'application/json; charset=utf-8' };
Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers });
  if (!['POST','GET'].includes(request.method)) return new Response('{}', { status: 405, headers });
  try {
    const input = request.method === 'POST' ? await request.json() : Object.fromEntries(new URL(request.url).searchParams);
    const path = input.kind === 'guitar-discovery' ? '/api/public/guitar-discovery' : input.kind === 'music' ? '/api/public/music' : input.kind === 'news' ? '/api/public/news' : input.kind === 'catholic' ? '/api/public/catholic' : '/unknown';
    const url = new URL(path, 'https://planly.local');
    if (typeof input.q === 'string') url.searchParams.set('q', input.q);
    if (typeof input.date === 'string') url.searchParams.set('date', input.date);
    const result = await publicContentResponse(url, {youtubeKey:Deno.env.get('YOUTUBE_API_KEY')});
    return new Response(JSON.stringify(result.body), { status: result.status, headers });
  } catch { return new Response(JSON.stringify({ error: 'Não foi possível consultar a fonte.' }), { status: 502, headers }); }
});
