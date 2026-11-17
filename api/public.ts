import type { IncomingMessage, ServerResponse } from 'node:http';
import { publicContentResponse } from '../supabase/functions/_shared/publicContent';
export const config={maxDuration:60};
export default async function handler(req:IncomingMessage,res:ServerResponse){
 res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method!=='GET'){res.statusCode=405;res.end(JSON.stringify({error:'Use GET.'}));return;}
 const input=new URL(req.url||'/', 'https://planly.local');
 const route=input.searchParams.get('resource') || input.pathname.split('/').pop() || '';
 if(!['news','catholic','music','guitar-discovery'].includes(route)){res.statusCode=404;res.end('{}');return;}
 const url=new URL('/api/public/'+route,'https://planly.local');for(const key of ['date','q']){const value=input.searchParams.get(key);if(value)url.searchParams.set(key,value);}
 try{const result=await publicContentResponse(url,{youtubeKey:process.env.YOUTUBE_API_KEY});res.statusCode=result.status;res.end(JSON.stringify(result.body));}
 catch{res.statusCode=502;res.end(JSON.stringify({error:'Fonte indisponível. Tente novamente.'}));}
}
