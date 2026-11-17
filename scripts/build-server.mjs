import { build } from 'esbuild';
await build({ entryPoints: ['server/publicContentMiddleware.ts'], outfile: 'dist-server/publicContentMiddleware.mjs', bundle: true, format: 'esm', platform: 'node', target: 'node20' });
