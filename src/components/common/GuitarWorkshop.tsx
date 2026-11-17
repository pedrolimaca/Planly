import { catholicSongs, songUrl } from '../../services/dailyGuitar';
import { useState } from 'react';
import Card from './Card';
import Button from './Button';
const solos = [
  {
    title: 'Stairway to Heaven',
    artist: 'Led Zeppelin',
    difficulty: 'Avançado',
    style: 'Rock Clássico',
    bpm: 72,
    tips: [
      'A intro é dedilhada em Lá menor — pratique devagar até os dedos "memorizarem" as posições.',
      'Use a escala de Lá menor natural (A, B, C, D, E, F, G) para improvisar na seção do solo.',
      'Jimmy Page usa slides e hammer-ons frequentemente. Foque nessas técnicas primeiro.',
    ],
    tab: `e|------------------5-8-5-----------------|\nB|----------5-8-10-----------8-10----------|\nG|-----5-7----------------------7-5-------|\nD|--7-----------------------------------7--|\nA|----------------------------------------|\nE|----------------------------------------|`,
    spotifyQ: 'Stairway to Heaven Led Zeppelin',
    ytQ: 'Stairway to Heaven guitar solo tutorial',
    techniques: ['Dedilhado', 'Hammer-on', 'Pull-off', 'Slide', 'Bending'],
  },
  {
    title: 'Hotel California',
    artist: 'Eagles',
    difficulty: 'Avançado',
    style: 'Rock / Pop',
    bpm: 74,
    tips: [
      'O solo usa duas guitarras em harmonia. Aprenda a linha de cima primeiro.',
      'Baseado na escala de Si menor: B, C#, D, E, F#, G, A.',
      'Os bends e vibratos são a alma do solo — dedique 50% do tempo a eles.',
    ],
    tab: `e|--14b--14--12-------12-14-12-----------|\nB|--------------------14------14-12-14---|\nG|------------------------------------14-|\nD|---------------------------------------|\nA|---------------------------------------|\nE|---------------------------------------|`,
    spotifyQ: 'Hotel California Eagles',
    ytQ: 'Hotel California guitar solo lesson',
    techniques: ['Bending', 'Vibrato', 'Harmonia a duas vozes', 'Legato'],
  },
  {
    title: 'Nothing Else Matters (Intro)',
    artist: 'Metallica',
    difficulty: 'Intermediário',
    style: 'Metal / Balada',
    bpm: 70,
    tips: [
      'Toque com os dedos (fingerstyle), não com palheta.',
      'Acorde: Mi menor aberto — mantenha os dedos o tempo todo enquanto toca.',
      'O segredo é deixar cada nota soar e se misturar — controle o sustain.',
    ],
    tab: `e|--0---0---0---0---0---0---------------|\nB|--0---0---0---0---0---0---------------|\nG|--0---0---0---0---0---0---------------|\nD|--2---2---9---9---7---7---------------|\nA|--2---2---9---9---7---7---------------|\nE|--0---0---7---7---5---5---------------|`,
    spotifyQ: 'Nothing Else Matters Metallica',
    ytQ: 'Nothing Else Matters intro fingerstyle tutorial',
    techniques: ['Fingerstyle', 'Cordas abertas', 'Sustain'],
  },
  {
    title: 'Wonderwall (Oasis)',
    artist: 'Oasis',
    difficulty: 'Iniciante',
    style: 'Britpop / Rock',
    bpm: 87,
    tips: [
      'Use capotasto na 2ª casa.',
      'Os acordes principais são: Em7, G, Dsus4, A7sus4. Pratique as trocas lentas.',
      'O ritmo é: baixo↓ ↓ ↑ ↓ ↑ — um dos ritmos mais famosos do rock.',
    ],
    tab: `Em7  G   Dsus4  A7sus4\n 022033 320033 xx0233 x02033\n\nRitmo: D DU DU (colcheia)`,
    spotifyQ: 'Wonderwall Oasis',
    ytQ: 'Wonderwall guitar tutorial beginners',
    techniques: ['Acordes abertos', 'Levada rítmica', 'Capotasto'],
  },
  {
    title: 'Tears in Heaven',
    artist: 'Eric Clapton',
    difficulty: 'Intermediário',
    style: 'Blues / Balada',
    bpm: 80,
    tips: [
      'Mistura fingerstyle com palheta — tente fingerstyle primeiro.',
      'Prestea atenção nos ornamentos: hammer-ons rápidos no começo de cada frase.',
      'Tom: Lá maior. Use a escala pentatônica de Lá para improvisar entre os versos.',
    ],
    tab: `e|--2---3-2---0---2-3-2---0-----------|\nB|--3---------3-----------3-----------|\nG|--2---------2-----------2-----------|\nD|--0---------0-----------0-----------|\nA|----------------------------------------|\nE|----------------------------------------|`,
    spotifyQ: 'Tears in Heaven Eric Clapton',
    ytQ: 'Tears in Heaven guitar tutorial fingerstyle',
    techniques: ['Fingerstyle', 'Hammer-on', 'Pentatônica', 'Blues bends'],
  },
];

const fingerpickingPatterns = [
  {
    name: 'Travis Picking (Clássico)',
    description: 'O padrão mais usado no país e folk americano. Polegar alterna nos baixos (6ª e 5ª corda) enquanto os dedos tocam as agudas.',
    notation: `   P   I   M   I   P   I   M   I\ne|----0-----------0---------------|\nB|------1---1-------1---1---------|\nG|--------0-----------0-----------|\nD|--2--------------2--------------|\nA|--0---------------------------0-|\nE|--------------------------------|`,
    tip: 'Comece muito devagar (50 BPM). O polegar NUNCA para — ele é o "metrônomo".',
    bpm: 60,
    usedIn: ['Dust in the Wind (Kansas)', 'The Boxer (Simon & Garfunkel)', 'Blackbird (Beatles)'],
  },
  {
    name: 'Dedilhado P-I-M-A (Clássico/MPB)',
    description: 'Polegar no baixo, depois indicador, médio e anelar em sequência. Muito usado no violão clássico e MPB.',
    notation: `   P   I   M   A   P   I   M   A\ne|-----------3-----------3-------|\nB|-------1-----------1-----------|\nG|-----0-----------0--------------|\nD|---2-----------2----------------|\nA|-3-----------3------------------|\nE|--------------------------------|`,
    tip: 'Deixe cada nota soar até o próximo dedo tocar. Não abafe as cordas.',
    bpm: 55,
    usedIn: ['Garota de Ipanema (João Gilberto)', 'Romaria (Renato Teixeira)', 'Tocando em Frente'],
  },
  {
    name: 'Arpejo em Sextina',
    description: '6 notas por compasso. Muito expressivo e comum em baladas e canções românticas.',
    notation: `   P  I  M  A  M  I   P  I  M  A  M  I\ne|--------0-----------|--------0----------|\nB|------1---1---------|------1---1--------|\nG|----0-------0-------|----0-------0------|\nD|--2-----------2-----|--2-----------2----|\nA|0-----------------0-|0-----------------0|\nE|---------------------|-------------------|`,
    tip: 'Toque com os pulpas dos dedos, não com as unhas, para um tom mais suave.',
    bpm: 50,
    usedIn: ['Malaguena (Clássico)', 'Ousado Amor', 'Fio de Cabelo'],
  },
  {
    name: 'Batida Rasgueado (Flamenco)',
    description: 'Técnica flamenca de "rasgar" as cordas com os dedos dobrados, da anelar ao indicador rapidamente.',
    notation: `Mão direita: A-M-I-P (rasgueado descendente)\nRepita em cada tempo:\n\n↓  ↑  ↓  ↑  ↓  ↑\nD1 U1 D2 U2 D3 U3`,
    tip: 'Comece pela corda E e vá até a corda e com um único movimento de pulso. Rapidez vem com tempo.',
    bpm: 90,
    usedIn: ['Rumba flamenca', 'Bamboleo (Gipsy Kings)', 'Entre dos Aguas (Paco de Lucía)'],
  },
];


export default function GuitarWorkshop() {
 const [tab,setTab]=useState('dedilhados');
 const chords=[['C','x32010'],['D','xx0232'],['E','022100'],['G','320003'],['A','x02220'],['Am','x02210'],['Em','022000'],['Dm','xx0231']];
 return <Card title="Oficina de violão" subtitle="Dedilhados, acordes e estudo de solos, junto da sua biblioteca.">
 <div className="guitar-workshop-tabs" role="group" aria-label="Conteúdos de violão">{[['dedilhados','Dedilhados'],['cifras','Cifras e acordes'],['solos','Solos famosos']].map(([id,label])=><Button key={id} aria-pressed={tab===id} variant={tab===id?'primary':'outline'} onClick={()=>setTab(id)}>{label}</Button>)}</div>
 {tab==='dedilhados'&&fingerpickingPatterns.map(pattern=><details className="guitar-lesson" key={pattern.name}><summary>{pattern.name}</summary><p>{pattern.description}</p><p><strong>Como praticar:</strong> comece lentamente, sem tensão, e priorize regularidade antes da velocidade.</p><pre>{pattern.notation}</pre><p>Exemplo de exercício técnico; não é a transcrição de uma música.</p><a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(pattern.name+' aula violão')}`} target="_blank" rel="noreferrer">Pesquisar demonstração da técnica</a></details>)}
 {tab==='cifras'&&<><p>Formas básicas em afinação padrão, da 6ª para a 1ª corda. 0 = corda solta; x = não tocar.</p><div className="guitar-chords">{chords.map(([name,shape])=><div key={name}><strong>{name}</strong><code>{shape}</code></div>)}</div><p>Exercício: alterne Am → C → G → D, mantendo quatro tempos por acorde. As cifras de cada música podem variar conforme o arranjo; use a pesquisa de cifras na prática escolhida.</p></>}
 {tab==='solos'&&<div><h3>Repertório católico — solos e introduções</h3>{catholicSongs.map(song=><article className="guitar-lesson" key={song.path}><h4>{song.title} — {song.artist}</h4><div className="guitar-workshop-tabs"><a href={songUrl(song)} target="_blank" rel="noreferrer">Cifra completa</a>{song.soloPath&&<a href={`https://www.cifraclub.com.br/${song.soloPath}`} target="_blank" rel="noreferrer">Tablatura de solo / introdução</a>}<a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(song.title+' '+song.artist+' solo introdução violão aula')}`} target="_blank" rel="noreferrer">Pesquisar aula no YouTube</a></div></article>)}</div>}
 {tab==='solos'&&solos.map(solo=><details className="guitar-lesson" key={solo.title}><summary>{solo.title} — {solo.artist}</summary><p>Técnicas para estudar: {solo.techniques.join(', ')}.</p><ol><li>Escolha uma aula ou tablatura de referência.</li><li>Separe uma frase curta e pratique em andamento confortável.</li><li>Una as frases após conseguir repetições limpas.</li></ol><div className="guitar-workshop-tabs"><a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(solo.ytQ)}`} target="_blank" rel="noreferrer">Pesquisar aula do solo</a><a href={`https://www.google.com/search?q=${encodeURIComponent(solo.title+' '+solo.artist+' tablatura')}`} target="_blank" rel="noreferrer">Pesquisar tablatura</a></div><p>Links de pesquisa; a transcrição original não foi verificada pelo Planly.</p></details>)}
 </Card>;
}
