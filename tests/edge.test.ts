import test from 'node:test';
import assert from 'node:assert/strict';
test('Edge agent enforces session and quota, then decodes HTTP output', async () => {
  let handler: (request: Request) => Promise<Response>;
  const originalFetch = globalThis.fetch;
  Object.assign(globalThis, { Deno: { env: { get: (key: string) => ({ SUPABASE_URL:'https://test.invalid', SUPABASE_ANON_KEY:'test', OPENAI_API_KEY:'test' }[key]) }, serve: (fn: typeof handler) => { handler = fn; } } });
  await import('../supabase/functions/planly-agent/index');
  try {
    let calls = 0;
    globalThis.fetch = async () => { calls++; return new Response('{}',{status:401}); };
    assert.equal((await handler(new Request('https://local',{method:'POST',body:'{}'}))).status,401); assert.equal(calls,0);
    const request = () => new Request('https://local',{method:'POST',headers:{Authorization:'Bearer test'},body:JSON.stringify({message:'Criar tarefa'})});
    assert.equal((await handler(request())).status,401);
    globalThis.fetch = async url => String(url).includes('/user') ? Response.json({id:'u'}) : Response.json(false);
    assert.equal((await handler(request())).status,429);
    globalThis.fetch = async url => {
      if (String(url).includes('/user')) return Response.json({id:'u'});
      if (String(url).includes('/rpc/')) return Response.json(true);
      return Response.json({status:'completed',model:'gpt-4o-mini',usage:{input_tokens:100,output_tokens:20,total_tokens:120},output:[{type:'message',content:[{type:'output_text',text:JSON.stringify({message:'Proposta',actions:[]})}]}]});
    };
    const response = await handler(request()); assert.equal(response.status,200); assert.deepEqual(await response.json(),{message:'Proposta',actions:[],usage:{input_tokens:100,output_tokens:20,total_tokens:120,model:'gpt-4o-mini'}});
  } finally { globalThis.fetch = originalFetch; }
});
