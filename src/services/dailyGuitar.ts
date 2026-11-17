// Original technique exercises. Song transcriptions stay with their publishers.
export const pickingPatterns = [
  [5,3,2,1,2,3,2,3], [5,2,3,1,5,2,3,1], [5,3,1,2,5,3,1,2],
  [5,1,2,3,5,1,2,3], [5,3,2,3,4,3,1,3], [5,2,1,2,4,2,1,2],
  [5,3,2,1,4,3,2,1], [5,1,3,2,4,1,3,2], [5,2,3,2,4,1,2,1],
  [5,3,1,3,4,2,1,2], [5,1,2,1,4,3,2,3], [5,2,1,3,4,2,1,3],
  [5,3,2,1,5,1,2,3], [5,2,3,1,4,1,3,2],
];
export const catholicSongs = [
  { title:'Um Certo Galileu', artist:'Padre Zezinho', genre:'Católica', path:'padre-zezinho/um-certo-galileu/', soloPath:'padre-zezinho/um-certo-galileu/solo.html' },
  { title:'Oração Pela Família', artist:'Padre Zezinho', genre:'Católica', path:'padre-zezinho/oracao-pela-familia/', soloPath:'padre-zezinho/oracao-pela-familia/' },
  { title:'Noites Traiçoeiras', artist:'Pe. Marcelo Rossi', genre:'Católica', path:'pe-marcelo-rossi/noites-traicoeiras/', soloPath:'' },
];
export const dailySongs = [
  ...catholicSongs,
  { title:'Bondade de Deus', artist:'Isaías Saad', genre:'Gospel', path:'isaias-saad/bondade-de-deus/' },
  { title:'Evidências', artist:'Chitãozinho & Xororó', genre:'Sertanejo', path:'chitaozinho-e-xororo/evidencias/simplificada.html' },
  { title:'Ousado Amor', artist:'Isaías Saad', genre:'Gospel', path:'isaias-saad/ousado-amor/' },
  { title:'Fio de Cabelo', artist:'Chitãozinho & Xororó', genre:'Sertanejo', path:'chitaozinho-e-xororo/fio-de-cabelo/' },
  { title:'Enche-me', artist:'Isaías Saad', genre:'Gospel', path:'isaias-saad/enche-me/' },
  { title:'Página de Amigos', artist:'Chitãozinho & Xororó', genre:'Sertanejo', path:'chitaozinho-e-xororo/pagina-de-amigos/' },
  { title:'Eu Também (100 Bilhões X)', artist:'Isaías Saad', genre:'Gospel', path:'isaias-saad/eu-tambem-100-bilhoes-x/' },
  { title:'Sinônimos', artist:'Chitãozinho & Xororó', genre:'Sertanejo', path:'chitaozinho-e-xororo/sinonimos/' },
];
export type DailySong = typeof dailySongs[number];
export function songUrl(song:DailySong) { return `https://www.cifraclub.com.br/${song.path}`; }
export function guitarTab(notes: {string:number; fret:number}[]) {
  return ['e','B','G','D','A','E'].map((label,i)=>`${label}|${notes.map(n=>n.string===i+1?String(n.fret).padEnd(4,'-'):'----').join('')}|`).join('\n');
}
export function dailyGuitar(date:string) {
  const day=Math.floor(Date.parse(`${date}T12:00:00Z`)/86400000);
  if(!Number.isFinite(day)) throw new Error('Data inválida');
  const index=((day%14)+14)%14;
  const strings=pickingPatterns[index];
  const frets=[0,1,2,2,0,0]; // Am, from first string to sixth.
  const scale=[{string:3,fret:5},{string:3,fret:7},{string:2,fret:5},{string:2,fret:8},{string:1,fret:5},{string:1,fret:8}];
  const phrases=[[0,1,2,3,4,3,2,0],[4,5,4,3,2,3,1,0],[0,2,1,3,2,4,3,0],[5,3,4,2,3,1,2,0],[0,1,0,2,3,2,4,0],[2,3,4,5,4,2,1,0],[0,2,4,3,1,2,1,0]];
  const phrase=phrases[index%7];
  const notes=(index<7?phrase:[...phrase].reverse()).map(i=>scale[i]);
  return {index, picking:guitarTab(strings.map(string=>({string,fret:frets[string-1]}))),
    fingers:strings.map(s=>s>=4?'P':s===3?'I':s===2?'M':'A').join(' · '),
    solo:guitarTab(notes), song:dailySongs[((day%dailySongs.length)+dailySongs.length)%dailySongs.length]};
}
