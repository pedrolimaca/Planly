import type { IncomingMessage, ServerResponse } from 'node:http';
import { publicContentResponse } from '../supabase/functions/_shared/publicContent';
export function publicContentMiddleware(req: IncomingMessage, res: ServerResponse, next: () => void) {
  const url = new URL(req.url || '/', 'http://localhost');
  if (!url.pathname.startsWith('/api/public/')) { next(); return; }
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') { res.statusCode = 405; res.end(JSON.stringify({ error: 'Use GET.' })); return; }
  void publicContentResponse(url, {youtubeKey:process.env.YOUTUBE_API_KEY}).then(result => {
    res.statusCode = result.status; res.end(JSON.stringify(result.body));
  }).catch(() => {
    res.statusCode = 502; res.end(JSON.stringify({ error: 'Serviço de conteúdo indisponível. Tente novamente.' }));
  });
}
