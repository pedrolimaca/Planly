import { build } from 'esbuild';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
// Vite/esbuild bundles can hide missing file extensions in native Node ESM.
const dir = await mkdtemp(join(tmpdir(), 'planly-vercel-runtime-'));
try {
  await writeFile(join(dir, 'package.json'), '{"type":"module"}');
  await build({ entryPoints: ['api/public.ts', 'supabase/functions/_shared/publicContent.ts'], outdir: dir, outbase: '.', bundle: false, format: 'esm', platform: 'node' });
  const { default: handler } = await import(pathToFileURL(join(dir, 'api/public.js')).href);
  let body;
  const response = { statusCode: 200, setHeader() {}, end(value) { body = JSON.parse(value); } };
  await handler({ method: 'GET', url: '/api/public?resource=catholic&date=invalid' }, response);
  assert.equal(response.statusCode, 400);
  assert.ok(body.error);
  console.log('Native Node ESM: handler loads and responds without bundling.');
} finally { await rm(dir, { recursive: true, force: true }); }
