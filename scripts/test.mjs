import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const dir = await mkdtemp(join(tmpdir(), 'planly-tests-'));
try {
  await build({ entryPoints: ['tests/core.test.ts'], outfile: join(dir, 'tests.cjs'), bundle: true, platform: 'node', format: 'cjs', define: { 'import.meta.env': '{}' } });
  const result = spawnSync(process.execPath, ['--test', join(dir, 'tests.cjs')], { stdio: 'inherit' });
  process.exitCode = result.status ?? 1;
} finally { await rm(dir, { recursive: true, force: true }); }
