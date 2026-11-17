import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep, join } from 'node:path';
import { publicContentMiddleware } from '../dist-server/publicContentMiddleware.mjs';
const root = resolve('dist');
await stat(join(root,'index.html')).catch(() => { throw new Error('Execute npm run build antes de npm start.'); });
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon','.woff2':'font/woff2'};
const server = createServer((req,res) => publicContentMiddleware(req,res,() => {
  void (async () => {
    if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
    const url = new URL(req.url,'http://localhost');
    let path = resolve(root, '.' + decodeURIComponent(url.pathname));
    if (path !== root && !path.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    if (!extname(path)) path = join(root,'index.html');
    const data = await readFile(path);
    res.setHeader('Content-Type',types[extname(path)] || 'application/octet-stream');
    res.setHeader('X-Content-Type-Options','nosniff');res.end(req.method === 'HEAD' ? undefined : data);
  })().catch(() => { res.writeHead(404).end('Não encontrado'); });
}));
server.listen(Number(process.env.PORT || 4173),process.env.HOST || '127.0.0.1',() => console.log(`Planly: http://${process.env.HOST || '127.0.0.1'}:${process.env.PORT || 4173}`));
