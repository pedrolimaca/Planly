// Do not let an IDE's NODE_ENV=development disable production-only safeguards.
process.env.NODE_ENV = 'production';
const { build } = await import('vite');
await build({ mode: 'production' });
