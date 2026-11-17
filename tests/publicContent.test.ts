import test from 'node:test';
import assert from 'node:assert/strict';
import { validDate, parsePaulusDay, getBrazilianLiturgy, getGuitarDiscovery, getCatholicDay, getPublicNews, publicContentResponse } from '../supabase/functions/_shared/publicContent';
test('public content rejects invalid dates and unknown routes before fetching', async () => {
  assert.equal(validDate('2026-02-30'),false);assert.equal(validDate('2024-02-29'),true);assert.equal(validDate('https://localhost'),false);
  assert.equal((await publicContentResponse(new URL('https://local/api/public/catholic?date=2026-02-30'))).status,400);
  assert.equal((await publicContentResponse(new URL('https://local/api/public/anything'))).status,404);
});
test('Catholic source failures remain explicit and independent', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => new Response('Unavailable',{status:503});
  try {
    const result = await getCatholicDay('2026-01-05');
    assert.equal(result.sections.length,2);assert.ok(result.sections.every(s=>s.error?.includes('503') && !s.html));
  } finally {globalThis.fetch=original;}
});
test('public feeds cache real source responses and cannot accept arbitrary upstream URLs', async () => {
  const original = globalThis.fetch;const requested: string[]=[];
  globalThis.fetch = async url => { requested.push(String(url));return new Response('<rss><channel></channel></rss>'); };
  try {
    const first = await getPublicNews();const second=await getPublicNews();
    assert.equal(first.feeds.length,2);assert.equal(second.feeds.length,2);assert.equal(requested.length,2);
    assert.ok(requested.every(url=>url.startsWith('https://agenciabrasil.ebc.com.br/') || url.startsWith('https://www.vaticannews.va/')));
  } finally {globalThis.fetch=original;}
});


test('Brazilian calendar follows the exact date link and rejects a different article date', async () => {
  const original = globalThis.fetch;
  const article='https://liturgia.cancaonova.com/pb/liturgia/teste/?sDia=4&sMes=3&sAno=2026';
  try {
    globalThis.fetch=async url=>new Response(String(url)===article ? `<span class='dia'>4</span><span class='mes'>Mar</span><span class='ano'>2026</span><h1 class="entry-title">2ª Semana da Quaresma</h1><span class="cor-liturgica">Roxo</span>` : `<a href="${article}">4</a>`);
    const result=await getBrazilianLiturgy('2026-03-04');assert.equal(result.celebration,'2ª Semana da Quaresma');assert.equal(result.url,article);
    const wrong='https://liturgia.cancaonova.com/pb/liturgia/outro/?sDia=5&sMes=3&sAno=2026';
    globalThis.fetch=async url=>new Response(String(url)===wrong ? `<span class='dia'>6</span><span class='mes'>Mar</span><span class='ano'>2026</span><h1 class="entry-title">Outro dia</h1>` : `<a href="${wrong}">5</a>`);
    const invalid=await getBrazilianLiturgy('2026-03-05');assert.ok(invalid.error);assert.equal(invalid.celebration,undefined);
  } finally {globalThis.fetch=original;}
});


test('online guitar reads real-shaped feed metadata and rejects invalid video links', async()=>{
 const original=globalThis.fetch;
 try {
  globalThis.fetch=async url=>String(url).includes('itunes.apple.com')?Response.json({results:[{trackId:7,trackName:'Canção',artistName:'Artista católico',trackViewUrl:'https://music.apple.com/br/album/test/7'}]}):new Response('<feed><entry><yt:videoId>abcdefghijk</yt:videoId><title>Dedilhado no violão</title><published>2026-11-10T12:00:00Z</published></entry><entry><yt:videoId>javascript:evil</yt:videoId><title>Solo</title></entry></feed>');
  const result=await getGuitarDiscovery('2026-11-20');assert.equal(result.tracks.length,1);assert.equal(result.videos.length,1);assert.equal(result.videos[0].kind,'picking');assert.equal(result.videos[0].url,'https://www.youtube.com/watch?v=abcdefghijk');
 }finally {globalThis.fetch=original;}
});


test('Paulus rubrics require exact publication date and preserve explicit references',()=>{
 const url='https://www.paulus.com.br/portal/liturgia-diaria/17-terca-feira-11/';
 const html=`<script type="application/ld+json">${JSON.stringify({'@graph':[{url,datePublished:'2026-11-17T00:05:00-03:00'}]})}</script><div id="texto"><p>SANTA ISABEL</p><p>(branco, pref. comum ou dos santos – ofício da memória)</p><div class="subtitulo-liturgia">Leituras</div>`;
 const result=parsePaulusDay(html,'2026-11-17',url);assert.equal(result.preface,'comum ou dos santos');assert.equal(parsePaulusDay(html.replace('</p><p>(','<br/>('),'2026-11-17',url).preface,'comum ou dos santos');assert.equal(result.pageReference,null);assert.equal(result.eucharisticPrayer,null);
 assert.throws(()=>parsePaulusDay(html,'2025-11-17',url));
 const explicit=html.replace('comum ou dos santos – ofício da memória','dos santos, p. 42 – Oração Eucarística II');
 assert.equal(parsePaulusDay(explicit,'2026-11-17',url).pageReference,'p. 42');assert.equal(parsePaulusDay(explicit,'2026-11-17',url).eucharisticPrayer,'Oração Eucarística II');
});
