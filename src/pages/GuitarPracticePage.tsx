import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import {
  CheckCircle2, ExternalLink, Music2, RotateCcw, Star,
  ChevronDown, ChevronUp, Play, Flame, Target, Clock,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';

/* ─── DATA ─────────────────────────────────────────────────────── */
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

const dailySongs = [
  { title: 'Tocando em Frente', artist: 'Almir Sater', style: 'Sertanejo', level: 'Intermediário', focus: 'Dedilhado P-I-M-A em 4/4', chords: 'D, A, Bm, G' },
  { title: 'Romaria', artist: 'Renato Teixeira', style: 'Sertanejo', level: 'Iniciante', focus: 'Trocas limpas de acorde', chords: 'G, C, D, Em' },
  { title: 'Evidências', artist: 'Chitãozinho & Xororó', style: 'Sertanejo', level: 'Intermediário', focus: 'Pestanas e ritmo', chords: 'A, E, F#m, D' },
  { title: 'Nossa Senhora', artist: 'Roberto Carlos', style: 'Pop Católico', level: 'Iniciante', focus: 'Canto e acompanhamento', chords: 'C, G, Am, F' },
  { title: 'Raridade', artist: 'Anderson Freire', style: 'Católico', level: 'Intermediário', focus: 'Arpejo e dinâmica', chords: 'G, D, Em, C' },
  { title: 'Ousado Amor', artist: 'Isaías Saad', style: 'Gospel', level: 'Intermediário', focus: 'Levadas contemporâneas', chords: 'D, A, Bm, G' },
  { title: 'Fio de Cabelo', artist: 'Chitãozinho & Xororó', style: 'Sertanejo', level: 'Intermediário', focus: 'Expressão e dedilhado', chords: 'C, G, Am, F' },
];

/* ─── Components ────────────────────────────────────────────── */
function DiffBadge({ level }: { level: string }) {
  const map: Record<string, string> = { Iniciante: '#22c55e', Intermediário: '#f59e0b', Avançado: '#ef4444' };
  const c = map[level] ?? '#6366f1';
  return (
    <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: '.74rem', fontWeight: 700, background: `${c}1A`, color: c, border: `1px solid ${c}44` }}>
      {level}
    </span>
  );
}

/* ─── Page ─────────────────────────────────────────────────── */
export default function GuitarPracticePage() {
  const { user } = useAuth();
  const date = format(new Date(), 'yyyy-MM-dd');
  const storageKey = user ? `planly_guitar_${user.id}_${date}` : `planly_guitar_anon_${date}`;

  const suggestions = useMemo(() => {
    const start = Number(date.replace(/-/g, '')) % dailySongs.length;
    return [0, 1, 2].map(offset => dailySongs[(start + offset) % dailySongs.length]);
  }, [date]);

  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [tab, setTab] = useState<'daily' | 'solos' | 'fingerpicking'>('daily');
  const [expandedSolo, setExpandedSolo] = useState<number | null>(null);
  const [expandedPattern, setExpandedPattern] = useState<number | null>(null);
  const [minutes, setMinutes] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!storageKey) return;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const v = JSON.parse(saved) as { selected: number; done: boolean; minutes?: number };
      setSelected(v.selected);
      setDone(v.done);
      setMinutes(v.minutes ?? 0);
    }
    // Streak
    const streakKey = user ? `planly_guitar_streak_${user.id}` : 'planly_guitar_streak_anon';
    const savedStreak = localStorage.getItem(streakKey);
    if (savedStreak) setStreak(JSON.parse(savedStreak).count ?? 0);
  }, [storageKey, user]);

  const choose = (index: number) => {
    setSelected(index); setDone(false);
    localStorage.setItem(storageKey, JSON.stringify({ selected: index, done: false, minutes }));
  };

  const completePractice = () => {
    const newDone = !done;
    setDone(newDone);
    localStorage.setItem(storageKey, JSON.stringify({ selected, done: newDone, minutes }));
    if (newDone) {
      const streakKey = user ? `planly_guitar_streak_${user.id}` : 'planly_guitar_streak_anon';
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem(streakKey, JSON.stringify({ count: newStreak, lastDate: date }));
    }
  };

  const practice = selected === null ? null : suggestions[selected];

  const tabs = [
    { id: 'daily', label: 'Prática do Dia', icon: Target },
    { id: 'solos', label: 'Solos Famosos', icon: Star },
    { id: 'fingerpicking', label: 'Dedilhados', icon: Music2 },
  ] as const;

  return (
    <div className="page-container" style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 style={{ margin: 0, fontSize: '1.65rem', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Prática de Violão
          </h1>
          <p className="text-secondary" style={{ margin: '6px 0 0' }}>
            Solos, dedilhados e músicas para evoluir a cada dia.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {streak > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 20, background: 'rgba(245,158,11,.15)', border: '1px solid rgba(245,158,11,.3)', color: '#f59e0b', fontWeight: 700 }}>
              <Flame size={18} /> {streak} dias seguidos
            </div>
          )}
          <Music2 size={40} color="var(--color-primary-500)" />
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--border-color)' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
            background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600,
            fontSize: '.95rem', borderBottom: tab === t.id ? '2px solid #f59e0b' : '2px solid transparent',
            color: tab === t.id ? '#f59e0b' : 'var(--text-secondary)',
            marginBottom: -1, transition: 'all .2s',
          }}>
            <t.icon size={17} />{t.label}
          </button>
        ))}
      </div>

      {/* ── DAILY PRACTICE ── */}
      {tab === 'daily' && (
        <>
          <Card title="Sugestões de hoje" subtitle="Escolha uma música e pratique pelo menos 20 minutos.">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              {suggestions.map((song, index) => (
                <button key={song.title} onClick={() => choose(index)} style={{
                  textAlign: 'left', padding: 18, cursor: 'pointer', borderRadius: 14,
                  border: selected === index ? '2px solid #f59e0b' : '1px solid var(--border-color)',
                  background: selected === index ? 'rgba(245,158,11,.08)' : 'var(--surface-bg)',
                  color: 'var(--text-primary)', transition: 'all .2s',
                }}>
                  <Music2 size={22} color="#f59e0b" />
                  <div style={{ fontWeight: 800, marginTop: 10, fontSize: '1rem' }}>{song.title}</div>
                  <div className="text-secondary" style={{ fontSize: '.86rem', marginTop: 2 }}>{song.artist}</div>
                  <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <DiffBadge level={song.level} />
                    <span style={{ fontSize: '.73rem', color: 'var(--text-tertiary)' }}>{song.style}</span>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {practice && (
            <Card title={`Plano de Prática: ${practice.title}`} subtitle={`${practice.artist} · ${practice.style}`} style={{ marginTop: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
                {[
                  { label: 'Foco técnico', value: practice.focus },
                  { label: 'Acordes-base', value: practice.chords },
                  { label: 'Nível', value: practice.level },
                  { label: 'BPM inicial', value: '55 – 65 BPM' },
                ].map(item => (
                  <div key={item.label} style={{ padding: 14, borderRadius: 10, background: 'var(--surface-bg)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: .5 }}>{item.label}</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Fingerpicking diagram */}
              <div style={{ padding: 18, marginBottom: 16, borderRadius: 12, background: 'var(--surface-bg)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 700, marginBottom: 10 }}>🎸 Exercício de Dedilhado Original</div>
                <p className="text-secondary" style={{ margin: '0 0 12px', fontSize: '.87rem' }}>
                  Use polegar (P) nas cordas graves, indicador (I), médio (M) e anelar (A) nas agudas. Toque um ciclo por acorde, devagar.
                </p>
                <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '.88rem', lineHeight: 1.7, overflowX: 'auto', color: 'var(--text-primary)' }}>{`   P   I   M   A
e|--------0-------|
B|------1---1-----|
G|----0-------0---|
D|--2-----------2-|
A|3---------------|
E|----------------|`}</pre>
                <p className="text-secondary" style={{ margin: '12px 0 0', fontSize: '.82rem' }}>
                  Comece em 55 BPM — 5 repetições limpas no primeiro acorde, depois nos demais. Para improvisar: use a escala maior do tom e termine cada frase na nota do acorde.
                </p>
              </div>

              {/* Timer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 12, background: 'rgba(245,158,11,.07)', border: '1px solid rgba(245,158,11,.25)', marginBottom: 16 }}>
                <Clock size={20} color="#f59e0b" />
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Tempo praticado hoje:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => setMinutes(m => Math.max(0, m - 5))} style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--surface-bg)', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 700 }}>−</button>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', minWidth: 52, textAlign: 'center', color: '#f59e0b' }}>{minutes} min</span>
                  <button onClick={() => setMinutes(m => m + 5)} style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--surface-bg)', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 700 }}>+</button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <a href={`https://www.google.com/search?q=${encodeURIComponent(practice.title + ' ' + practice.artist + ' cifra')}`} target="_blank" rel="noreferrer">
                  <Button variant="secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><ExternalLink size={15} /> Buscar cifra</Button>
                </a>
                <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(practice.title + ' ' + practice.artist + ' tutorial violão')}`} target="_blank" rel="noreferrer">
                  <Button variant="secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Play size={15} /> Tutorial YouTube</Button>
                </a>
                <Button onClick={completePractice} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: done ? 'rgba(34,197,94,.15)' : undefined, color: done ? '#22c55e' : undefined }}>
                  <CheckCircle2 size={16} />{done ? '✓ Treino concluído!' : 'Concluir treino'}
                </Button>
                <Button variant="ghost" onClick={() => { setSelected(null); setDone(false); localStorage.removeItem(storageKey); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <RotateCcw size={15} /> Trocar música
                </Button>
              </div>
            </Card>
          )}
        </>
      )}

      {/* ── SOLOS TAB ── */}
      {tab === 'solos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: '12px 18px', background: 'rgba(239,68,68,.07)', borderRadius: 12, border: '1px solid rgba(239,68,68,.2)', marginBottom: 4 }}>
            <p style={{ margin: 0, fontSize: '.9rem', color: 'var(--text-secondary)' }}>
              🎸 Solos lendários com tablatura simplificada. Aprenda devagar — a velocidade vem com a memória muscular.
            </p>
          </div>
          {solos.map((solo, i) => (
            <div key={solo.title} style={{
              background: 'var(--surface-card)', borderRadius: 16,
              border: expandedSolo === i ? '1px solid rgba(239,68,68,.4)' : '1px solid var(--border-color)',
              overflow: 'hidden', transition: 'border-color .2s',
            }}>
              <button onClick={() => setExpandedSolo(expandedSolo === i ? null : i)} style={{
                width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left',
              }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0, background: 'linear-gradient(135deg, #f59e0b, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Star size={22} color="#fff" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>{solo.title}</div>
                  <div className="text-secondary" style={{ fontSize: '.87rem', marginTop: 2 }}>{solo.artist} · {solo.style}</div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <DiffBadge level={solo.difficulty} />
                    <span className="text-secondary" style={{ fontSize: '.78rem' }}>🎵 {solo.bpm} BPM</span>
                    {solo.techniques.slice(0, 3).map(t => (
                      <span key={t} style={{ fontSize: '.72rem', padding: '2px 8px', borderRadius: 6, background: 'var(--surface-bg)', border: '1px solid var(--border-color)', color: 'var(--text-tertiary)' }}>{t}</span>
                    ))}
                  </div>
                </div>
                {expandedSolo === i ? <ChevronUp size={20} color="var(--text-secondary)" /> : <ChevronDown size={20} color="var(--text-secondary)" />}
              </button>

              {expandedSolo === i && (
                <div style={{ padding: '0 24px 24px', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ marginTop: 18, marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, marginBottom: 10 }}>💡 Dicas de Prática</div>
                    {solo.tips.map((tip, ti) => (
                      <div key={ti} style={{ display: 'flex', gap: 10, marginBottom: 8, padding: '10px 14px', borderRadius: 10, background: 'var(--surface-bg)', border: '1px solid var(--border-color)' }}>
                        <span style={{ fontWeight: 800, color: '#f59e0b', flexShrink: 0 }}>{ti + 1}.</span>
                        <span style={{ fontSize: '.9rem', color: 'var(--text-secondary)' }}>{tip}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontWeight: 700, marginBottom: 10 }}>🎸 Tablatura Simplificada</div>
                    <pre style={{
                      padding: '16px 18px', borderRadius: 12, fontFamily: 'monospace', fontSize: '.87rem', lineHeight: 1.7,
                      background: '#0d1117', color: '#7ee787', border: '1px solid #30363d',
                      overflowX: 'auto', margin: 0, whiteSpace: 'pre-wrap',
                    }}>{solo.tab}</pre>
                    <p className="text-secondary" style={{ fontSize: '.78rem', marginTop: 8 }}>
                      ⚠️ Tablatura simplificada para fins educacionais. Direitos reservados aos respectivos compositores.
                    </p>
                  </div>

                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>🔧 Técnicas utilizadas</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {solo.techniques.map(t => (
                        <span key={t} style={{ padding: '4px 12px', borderRadius: 20, background: 'rgba(245,158,11,.12)', border: '1px solid rgba(245,158,11,.3)', color: '#f59e0b', fontWeight: 600, fontSize: '.82rem' }}>{t}</span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(solo.ytQ)}`} target="_blank" rel="noreferrer">
                      <Button variant="secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Play size={15} /> Tutorial YouTube</Button>
                    </a>
                    <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(solo.spotifyQ)}`} target="_blank" rel="noreferrer">
                      <Button variant="ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><ExternalLink size={15} /> Ouvir música</Button>
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── FINGERPICKING TAB ── */}
      {tab === 'fingerpicking' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: '12px 18px', background: 'rgba(99,102,241,.07)', borderRadius: 12, border: '1px solid rgba(99,102,241,.2)', marginBottom: 4 }}>
            <p style={{ margin: 0, fontSize: '.9rem', color: 'var(--text-secondary)' }}>
              🖐 Padrões de dedilhado do básico ao avançado. Pratique cada um por pelo menos 1 semana antes de avançar.
            </p>
          </div>
          {fingerpickingPatterns.map((pattern, i) => (
            <div key={pattern.name} style={{
              background: 'var(--surface-card)', borderRadius: 16,
              border: expandedPattern === i ? '1px solid rgba(99,102,241,.4)' : '1px solid var(--border-color)',
              overflow: 'hidden', transition: 'border-color .2s',
            }}>
              <button onClick={() => setExpandedPattern(expandedPattern === i ? null : i)} style={{
                width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left',
              }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                  🖐
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>{pattern.name}</div>
                  <div className="text-secondary" style={{ fontSize: '.87rem', marginTop: 4, lineHeight: 1.5 }}>{pattern.description}</div>
                  <div style={{ marginTop: 8, fontSize: '.78rem', color: 'var(--text-tertiary)' }}>
                    🎵 Usado em: {pattern.usedIn.join(' · ')}
                  </div>
                </div>
                {expandedPattern === i ? <ChevronUp size={20} color="var(--text-secondary)" /> : <ChevronDown size={20} color="var(--text-secondary)" />}
              </button>

              {expandedPattern === i && (
                <div style={{ padding: '0 24px 24px', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ marginTop: 18, padding: '14px 18px', borderRadius: 12, background: 'rgba(99,102,241,.08)', border: '1px solid rgba(99,102,241,.2)', marginBottom: 16, display: 'flex', gap: 10 }}>
                    <span style={{ fontSize: '1.2rem' }}>💡</span>
                    <p style={{ margin: 0, fontSize: '.9rem', color: 'var(--text-primary)' }}><strong>Dica:</strong> {pattern.tip}</p>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, marginBottom: 10 }}>🎸 Notação / Tab</div>
                    <pre style={{
                      padding: '16px 18px', borderRadius: 12, fontFamily: 'monospace', fontSize: '.87rem', lineHeight: 1.8,
                      background: '#0d1117', color: '#7ee787', border: '1px solid #30363d',
                      overflowX: 'auto', margin: 0, whiteSpace: 'pre-wrap',
                    }}>{pattern.notation}</pre>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 10, background: 'var(--surface-bg)', border: '1px solid var(--border-color)' }}>
                    <Clock size={16} color="#6366f1" />
                    <span style={{ fontWeight: 600, fontSize: '.9rem' }}>BPM inicial recomendado:</span>
                    <span style={{ fontWeight: 800, color: '#6366f1' }}>{pattern.bpm} BPM</span>
                    <a href={`https://www.google.com/search?q=metronome+${pattern.bpm}+bpm`} target="_blank" rel="noreferrer" style={{ marginLeft: 'auto' }}>
                      <Button variant="ghost" style={{ fontSize: '.82rem', padding: '4px 12px' }}>Abrir metrônomo</Button>
                    </a>
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>🎵 Músicas que usam esse padrão</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {pattern.usedIn.map(song => (
                        <a key={song} href={`https://www.youtube.com/results?search_query=${encodeURIComponent(song + ' guitar tutorial')}`} target="_blank" rel="noreferrer"
                          style={{ padding: '6px 14px', borderRadius: 20, background: 'var(--surface-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '.83rem', display: 'flex', alignItems: 'center', gap: 5, transition: 'border-color .2s' }}>
                          <Play size={12} />{song}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
