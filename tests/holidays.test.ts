import test from 'node:test';
import assert from 'node:assert/strict';
import {holidaysForYear} from '../src/services/holidays';
test('official 2026 holidays preserve local scopes, movable dates and avoid duplicates',()=>{
 const all=holidaysForYear(2026);
 assert.equal(all.find(h=>h.name==='São Benedito')?.date,'2026-04-06');
 assert.equal(all.find(h=>h.name==='Corpus Christi')?.date,'2026-06-04');
 assert.equal(all.find(h=>h.name==='Sexta-feira da Paixão')?.date,'2026-04-03');
 assert.equal(all.filter(h=>h.date==='2026-11-20').length,1);
 assert.ok(all.find(h=>h.date==='2026-02-05'&&h.scope==='Taubaté'));
 assert.ok(!all.find(h=>h.date==='2026-12-05'));
 assert.ok(!all.some(h=>h.name.includes('Carnaval')));
 assert.ok(holidaysForYear(2026,'sjc').find(h=>h.date==='2026-07-27'));
 assert.ok(!holidaysForYear(2026,'sjc').some(h=>h.scope==='Taubaté'));
 assert.equal(holidaysForYear(2026,'national').length,10);
 assert.equal(holidaysForYear(2027).find(h=>h.name==='Sexta-feira da Paixão')?.date,'2027-03-26');
});
