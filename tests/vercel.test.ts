import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/public';
import type {IncomingMessage,ServerResponse} from 'node:http';
test('Vercel adapter handles rewritten URLs and rejects invalid requests before network',async()=>{
 for(const [method,url,expected] of [['POST','/api/public?resource=news',405],['GET','/api/public?resource=unknown',404],['GET','/api/public?resource=catholic&date=invalid',400],['GET','/api/public/catholic?date=invalid',400]] as const){
  let body='';const response={statusCode:200,setHeader(){},end(value:string){body=value;}};
  await handler({method,url} as IncomingMessage,response as unknown as ServerResponse);
  assert.equal(response.statusCode,expected);assert.doesNotThrow(()=>JSON.parse(body));
 }
});
