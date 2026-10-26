import { useState, useEffect } from 'react';
import {
  BookOpen, Globe, Headphones, Music, Star, ChevronDown, ChevronUp,
  ExternalLink, CheckCircle2, RefreshCw, Volume2, Lightbulb, Newspaper,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

/* ─── Data ─────────────────────────────────────────────── */
const songs = [
  {
    title: 'Perfect',
    artist: 'Ed Sheeran',
    level: 'Iniciante',
    genre: 'Pop',
    theme: 'Romance e amor verdadeiro',
    youtubeId: 'dQw4w9WgXcQ', // placeholder
    lyrics: [
      { en: "I found a love for me", pt: "Encontrei um amor para mim" },
      { en: "Darling, just dive right in and follow my lead", pt: "Querida, apenas mergulhe e siga minha direção" },
      { en: "Well, I found a girl, beautiful and sweet", pt: "Bem, encontrei uma garota, bonita e doce" },
      { en: "Oh, I never knew you were the someone waiting for me", pt: "Oh, eu nunca soube que você era a pessoa que esperava por mim" },
    ],
    vocab: [
      { word: 'darling', def: 'querida/o — termo carinhoso', example: '"Darling, you look beautiful tonight."' },
      { word: 'dive', def: 'mergulhar / se lançar', example: '"Just dive in and try."' },
      { word: 'sweet', def: 'doce / gentil', example: '"She has a sweet smile."' },
      { word: 'soul', def: 'alma / essência', example: '"Music touches the soul."' },
    ],
    tip: 'Foque na pronúncia de "darling" (DÁR-ling). Ouça 3× antes de ler as letras.',
  },
  {
    title: 'Someone Like You',
    artist: 'Adele',
    level: 'Intermediário',
    genre: 'Soul / Pop',
    theme: 'Superação e saudade',
    youtubeId: 'dQw4w9WgXcQ',
    lyrics: [
      { en: "I heard that you're settled down", pt: "Ouvi que você se estabeleceu" },
      { en: "That you found a girl and you're married now", pt: "Que você encontrou uma garota e está casado agora" },
      { en: "I heard that your dreams came true", pt: "Ouvi que seus sonhos se realizaram" },
      { en: "Guess she gave you things I didn't give to you", pt: "Acho que ela te deu coisas que eu não te dei" },
    ],
    vocab: [
      { word: 'settled', def: 'estabelecido / acomodado', example: '"He settled in London years ago."' },
      { word: 'bitterness', def: 'amargura / ressentimento', example: '"She held no bitterness."' },
      { word: 'regret', def: 'arrependimento', example: '"Live without regret."' },
      { word: 'remind', def: 'lembrar / recordar', example: '"This song reminds me of summer."' },
    ],
    tip: 'A Adele usa muitas contrações (you\'re, didn\'t). Treinar contrações melhora seu ouvido 50%.',
  },
  {
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    level: 'Intermediário',
    genre: 'Pop / Dance',
    theme: 'Atração e relacionamentos',
    youtubeId: 'dQw4w9WgXcQ',
    lyrics: [
      { en: "The club isn't the best place to find a lover", pt: "A balada não é o melhor lugar para encontrar um amor" },
      { en: "So the bar is where I go", pt: "Então o bar é onde eu vou" },
      { en: "Me and my friends at the table doing shots", pt: "Eu e meus amigos na mesa fazendo shots" },
      { en: "Drinking fast and then we talk slow", pt: "Bebendo rápido e depois falando devagar" },
    ],
    vocab: [
      { word: 'lover', def: 'amante / parceiro romântico', example: '"He was her secret lover."' },
      { word: 'attraction', def: 'atração / interesse', example: '"There was a strong attraction between them."' },
      { word: 'figure', def: 'figura / silhueta', example: '"I love your figure."' },
      { word: 'lust', def: 'desejo / atração física', example: '"Lust fades; love stays."' },
    ],
    tip: 'Preste atenção no ritmo falado — Ed raps partes desta música. Ótima para treinar velocidade de compreensão.',
  },
  {
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    level: 'Avançado',
    genre: 'Rock',
    theme: 'Drama, existencialismo e liberdade',
    youtubeId: 'dQw4w9WgXcQ',
    lyrics: [
      { en: "Is this the real life? Is this just fantasy?", pt: "Isso é a vida real? Isso é só fantasia?" },
      { en: "Caught in a landslide, no escape from reality", pt: "Preso em um deslizamento, sem escapar da realidade" },
      { en: "Open your eyes, look up to the skies and see", pt: "Abra seus olhos, olhe para o céu e veja" },
      { en: "I'm just a poor boy, I need no sympathy", pt: "Sou apenas um menino pobre, não preciso de simpatia" },
    ],
    vocab: [
      { word: 'fantasy', def: 'fantasia / devaneio', example: '"She lived in a world of fantasy."' },
      { word: 'landslide', def: 'deslizamento / avalanche', example: '"The landslide blocked the road."' },
      { word: 'sympathy', def: 'simpatia / compaixão', example: '"He showed no sympathy."' },
      { word: 'matter', def: 'importar / matéria', example: '"Does it really matter?"' },
    ],
    tip: 'Esta música tem 3 estilos musicais diferentes. Cada parte usa vocabulário e emoção distintos — ouça separadamente.',
  },
  {
    title: 'Let Her Go',
    artist: 'Passenger',
    level: 'Iniciante',
    genre: 'Folk / Pop',
    theme: 'Saudade e valorizar o que se tem',
    youtubeId: 'dQw4w9WgXcQ',
    lyrics: [
      { en: "Well you only need the light when it's burning low", pt: "Bem, você só precisa da luz quando ela está quase apagando" },
      { en: "Only miss the sun when it starts to snow", pt: "Só sente falta do sol quando começa a nevar" },
      { en: "Only know you love her when you let her go", pt: "Só sabe que a ama quando a deixa ir" },
      { en: "And you let her go", pt: "E você a deixa ir" },
    ],
    vocab: [
      { word: 'miss', def: 'sentir falta / errar / perder', example: '"I miss you so much."' },
      { word: 'stare', def: 'encarar / olhar fixamente', example: '"Don\'t stare at people."' },
      { word: 'stumble', def: 'tropeçar / vacilar', example: '"He stumbled on the stairs."' },
      { word: 'realize', def: 'perceber / realizar', example: '"I didn\'t realize how much I cared."' },
    ],
    tip: 'Vocabulário simples com metáforas profundas. Perfeito para praticar interpretação contextual.',
  },
];

const newsItems = [
  {
    category: 'Technology',
    headline: 'AI Chatbots Are Changing How Students Learn Languages',
    summary: 'New research shows that learners using AI conversation tools improve 40% faster than traditional methods.',
    keyWords: ['research', 'improve', 'traditional', 'learners'],
    date: 'Today',
    readTime: '3 min',
    difficulty: 'Intermediate',
    link: 'https://www.bbc.com/news/technology',
  },
  {
    category: 'Science',
    headline: 'Scientists Discover New Species in Amazon Rainforest',
    summary: 'Brazilian researchers identified over 200 previously unknown species in a remote region of the Amazon basin.',
    keyWords: ['discovered', 'species', 'researchers', 'remote'],
    date: 'Today',
    readTime: '4 min',
    difficulty: 'Beginner',
    link: 'https://www.nationalgeographic.com',
  },
  {
    category: 'Business',
    headline: 'Electric Vehicle Sales Hit Record Highs Globally',
    summary: 'Global EV adoption surged 35% this year, driven by falling battery costs and new government incentives.',
    keyWords: ['adoption', 'surged', 'driven', 'incentives'],
    date: 'Yesterday',
    readTime: '5 min',
    difficulty: 'Intermediate',
    link: 'https://www.reuters.com',
  },
  {
    category: 'Culture',
    headline: 'Brazilian Music Breaks Streaming Records in Europe',
    summary: 'Artists like Anitta and Criolo are leading a wave of Brazilian music that\'s captivating European audiences.',
    keyWords: ['streaming', 'captivating', 'audiences', 'wave'],
    date: 'Yesterday',
    readTime: '3 min',
    difficulty: 'Beginner',
    link: 'https://www.theguardian.com/music',
  },
  {
    category: 'Health',
    headline: 'Simple Habits That Boost Brain Health After 40',
    summary: 'Doctors now recommend 7-minute daily walks, quality sleep, and social interactions as top brain boosters.',
    keyWords: ['recommend', 'quality', 'interactions', 'boost'],
    date: '2 days ago',
    readTime: '4 min',
    difficulty: 'Beginner',
    link: 'https://www.healthline.com',
  },
];

const dailyPhrases = [
  { phrase: "What's up?", meaning: "Tudo bem? / O que há de novo?", level: "Gíria" },
  { phrase: "I'll be right back.", meaning: "Já volto.", level: "Cotidiano" },
  { phrase: "That makes sense.", meaning: "Faz sentido.", level: "Cotidiano" },
  { phrase: "Bear with me.", meaning: "Tenha paciência comigo.", level: "Intermediário" },
  { phrase: "You're welcome.", meaning: "De nada.", level: "Básico" },
  { phrase: "It's on me.", meaning: "É por minha conta.", level: "Cotidiano" },
  { phrase: "No worries.", meaning: "Sem problemas.", level: "Cotidiano" },
  { phrase: "Let me know.", meaning: "Me avise / Me informe.", level: "Cotidiano" },
];

/* ─── Sub-components ─────────────────────────────────────── */
function LevelBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    Iniciante: '#22c55e', Beginner: '#22c55e',
    Intermediário: '#f59e0b', Intermediate: '#f59e0b',
    Avançado: '#ef4444',
  };
  return (
    <span style={{
      padding: '2px 10px', borderRadius: 20, fontSize: '.75rem', fontWeight: 700,
      background: `${colors[level] ?? '#6366f1'}22`, color: colors[level] ?? '#6366f1',
      border: `1px solid ${colors[level] ?? '#6366f1'}44`,
    }}>{level}</span>
  );
}

/* ─── Page ─────────────────────────────────────────────── */
export default function EnglishLearningPage() {
  const [tab, setTab] = useState<'songs' | 'news' | 'vocab'>('songs');
  const [expandedSong, setExpandedSong] = useState<number | null>(null);
  const [learnedWords, setLearnedWords] = useState<string[]>([]);
  const [expandedNews, setExpandedNews] = useState<number | null>(null);
  const [todayPhrase, setTodayPhrase] = useState(0);


  useEffect(() => {
    const saved = localStorage.getItem('planly_english_learned');
    if (saved) setLearnedWords(JSON.parse(saved));
    // Pick phrase based on day of year
    const day = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setTodayPhrase(day % dailyPhrases.length);
  }, []);

  const toggleLearned = (word: string) => {
    setLearnedWords(prev => {
      const updated = prev.includes(word) ? prev.filter(w => w !== word) : [...prev, word];
      localStorage.setItem('planly_english_learned', JSON.stringify(updated));
      return updated;
    });
  };

  const tabs = [
    { id: 'songs', label: 'Músicas', icon: Music },
    { id: 'news', label: 'Notícias', icon: Newspaper },
    { id: 'vocab', label: 'Vocabulário', icon: BookOpen },
  ] as const;

  return (
    <div className="page-container" style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 style={{ margin: 0, fontSize: '1.65rem', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Aprender Inglês
          </h1>
          <p className="text-secondary" style={{ margin: '6px 0 0' }}>
            Músicas, notícias e frases do dia para dominar o inglês naturalmente.
          </p>
        </div>
        <Globe size={42} color="var(--color-primary-500)" />
      </div>

      {/* Daily phrase banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,.15), rgba(139,92,246,.1))',
        border: '1px solid rgba(99,102,241,.3)', borderRadius: 16, padding: '20px 24px',
        marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
      }}>
        <Lightbulb size={28} color="#6366f1" style={{ flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '.78rem', fontWeight: 700, color: '#6366f1', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
            Frase do Dia
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            "{dailyPhrases[todayPhrase].phrase}"
          </div>
          <div className="text-secondary" style={{ marginTop: 4 }}>
            {dailyPhrases[todayPhrase].meaning} — <span style={{ color: '#6366f1', fontWeight: 600 }}>{dailyPhrases[todayPhrase].level}</span>
          </div>
        </div>
        <button
          onClick={() => setTodayPhrase(p => (p + 1) % dailyPhrases.length)}
          style={{ background: 'none', border: '1px solid rgba(99,102,241,.4)', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', color: '#6366f1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={14} /> Próxima
        </button>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--border-color)', paddingBottom: 0 }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
              background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600,
              fontSize: '.95rem', borderBottom: tab === t.id ? '2px solid #6366f1' : '2px solid transparent',
              color: tab === t.id ? '#6366f1' : 'var(--text-secondary)',
              marginBottom: -1, transition: 'all .2s',
            }}
          >
            <t.icon size={17} />{t.label}
          </button>
        ))}
      </div>

      {/* ── SONGS TAB ── */}
      {tab === 'songs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {songs.map((song, i) => (
            <div key={song.title} style={{
              background: 'var(--surface-card)', borderRadius: 16,
              border: expandedSong === i ? '1px solid rgba(99,102,241,.5)' : '1px solid var(--border-color)',
              overflow: 'hidden', transition: 'border-color .2s',
            }}>
              <button
                onClick={() => setExpandedSong(expandedSong === i ? null : i)}
                style={{
                  width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                  padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left',
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Headphones size={22} color="#fff" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>{song.title}</div>
                  <div className="text-secondary" style={{ fontSize: '.87rem', marginTop: 2 }}>{song.artist} · {song.genre}</div>
                  <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <LevelBadge level={song.level} />
                    <span className="text-secondary" style={{ fontSize: '.78rem' }}>🎵 {song.theme}</span>
                  </div>
                </div>
                {expandedSong === i ? <ChevronUp size={20} color="var(--text-secondary)" /> : <ChevronDown size={20} color="var(--text-secondary)" />}
              </button>

              {expandedSong === i && (
                <div style={{ padding: '0 24px 24px', borderTop: '1px solid var(--border-color)' }}>
                  {/* Tip */}
                  <div style={{ margin: '16px 0', padding: 14, background: 'rgba(99,102,241,.08)', borderRadius: 10, border: '1px solid rgba(99,102,241,.2)', display: 'flex', gap: 10 }}>
                    <Lightbulb size={18} color="#6366f1" style={{ flexShrink: 0, marginTop: 2 }} />
                    <p style={{ margin: 0, fontSize: '.87rem', color: 'var(--text-primary)' }}>{song.tip}</p>
                  </div>

                  {/* Lyrics */}
                  <div style={{ marginBottom: 20 }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: '.95rem', color: 'var(--text-primary)' }}>🎶 Trecho com tradução</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {song.lyrics.map((line, li) => (
                        <div key={li} style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--surface-bg)', border: '1px solid var(--border-color)' }}>
                          <div style={{ fontWeight: 600, fontSize: '.92rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                            <Volume2 size={14} color="#6366f1" style={{ marginTop: 3, flexShrink: 0 }} />
                            {line.en}
                          </div>
                          <div className="text-secondary" style={{ fontSize: '.83rem', marginTop: 4, paddingLeft: 22 }}>{line.pt}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Vocab */}
                  <div>
                    <h4 style={{ margin: '0 0 12px', fontSize: '.95rem', color: 'var(--text-primary)' }}>📚 Vocabulário-chave</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                      {song.vocab.map(v => (
                        <div key={v.word} style={{
                          padding: '12px 14px', borderRadius: 10,
                          background: learnedWords.includes(v.word) ? 'rgba(34,197,94,.08)' : 'var(--surface-bg)',
                          border: learnedWords.includes(v.word) ? '1px solid rgba(34,197,94,.3)' : '1px solid var(--border-color)',
                          transition: 'all .2s',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <span style={{ fontWeight: 800, fontSize: '.95rem', color: '#6366f1' }}>{v.word}</span>
                            <button onClick={() => toggleLearned(v.word)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                              <CheckCircle2 size={18} color={learnedWords.includes(v.word) ? '#22c55e' : 'var(--text-tertiary)'} />
                            </button>
                          </div>
                          <div className="text-secondary" style={{ fontSize: '.8rem', marginBottom: 6 }}>{v.def}</div>
                          <div style={{ fontSize: '.78rem', color: 'var(--text-primary)', fontStyle: 'italic' }}>{v.example}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Search link */}
                  <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                    <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(song.title + ' ' + song.artist)}`} target="_blank" rel="noreferrer">
                      <Button variant="secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ExternalLink size={15} /> Ouvir no YouTube
                      </Button>
                    </a>
                    <a href={`https://www.letras.mus.br/busca/?q=${encodeURIComponent(song.title + ' ' + song.artist)}`} target="_blank" rel="noreferrer">
                      <Button variant="ghost" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ExternalLink size={15} /> Letra completa
                      </Button>
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── NEWS TAB ── */}
      {tab === 'news' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: '12px 18px', background: 'rgba(99,102,241,.07)', borderRadius: 12, border: '1px solid rgba(99,102,241,.2)', marginBottom: 4 }}>
            <p style={{ margin: 0, fontSize: '.9rem', color: 'var(--text-secondary)' }}>
              📰 Leia as notícias em inglês. Tente entender antes de ver a tradução. <strong>Dica:</strong> procure as palavras em negrito no dicionário!
            </p>
          </div>
          {newsItems.map((item, i) => (
            <div key={i} style={{
              background: 'var(--surface-card)', borderRadius: 16,
              border: expandedNews === i ? '1px solid rgba(99,102,241,.5)' : '1px solid var(--border-color)',
              overflow: 'hidden', transition: 'border-color .2s',
            }}>
              <button
                onClick={() => setExpandedNews(expandedNews === i ? null : i)}
                style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '18px 24px', display: 'flex', alignItems: 'flex-start', gap: 14, textAlign: 'left' }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '.72rem', fontWeight: 700, padding: '2px 9px', borderRadius: 20, background: 'rgba(99,102,241,.15)', color: '#6366f1' }}>{item.category}</span>
                    <LevelBadge level={item.difficulty} />
                    <span className="text-secondary" style={{ fontSize: '.75rem' }}>⏱ {item.readTime}</span>
                    <span className="text-secondary" style={{ fontSize: '.75rem' }}>📅 {item.date}</span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 8 }}>{item.headline}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {item.keyWords.map(kw => (
                      <span key={kw} style={{ fontSize: '.73rem', padding: '2px 8px', borderRadius: 6, background: 'var(--surface-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>{kw}</span>
                    ))}
                  </div>
                </div>
                {expandedNews === i ? <ChevronUp size={18} color="var(--text-secondary)" /> : <ChevronDown size={18} color="var(--text-secondary)" />}
              </button>

              {expandedNews === i && (
                <div style={{ padding: '0 24px 20px', borderTop: '1px solid var(--border-color)' }}>
                  <p style={{ margin: '14px 0 12px', color: 'var(--text-primary)', lineHeight: 1.7 }}>{item.summary}</p>
                  <div style={{ padding: 12, borderRadius: 10, background: 'var(--surface-bg)', marginBottom: 14 }}>
                    <div style={{ fontSize: '.8rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-secondary)' }}>🔑 PALAVRAS-CHAVE</div>
                    {item.keyWords.map(kw => (
                      <div key={kw} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <Star size={12} color="#6366f1" />
                        <a href={`https://www.wordreference.com/enpt/${kw}`} target="_blank" rel="noreferrer" style={{ fontWeight: 600, color: '#6366f1', textDecoration: 'none', fontSize: '.88rem' }}>{kw}</a>
                        <span className="text-secondary" style={{ fontSize: '.8rem' }}>→ clique para ver a definição</span>
                      </div>
                    ))}
                  </div>
                  <a href={item.link} target="_blank" rel="noreferrer">
                    <Button variant="secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <ExternalLink size={15} /> Leia a notícia completa
                    </Button>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── VOCAB TAB ── */}
      {tab === 'vocab' && (
        <div>
          <Card title="Meu Glossário" subtitle={`${learnedWords.length} palavras marcadas como aprendidas`}>
            {learnedWords.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <BookOpen size={40} color="var(--text-tertiary)" style={{ marginBottom: 12 }} />
                <p className="text-secondary">Nenhuma palavra marcada ainda. Explore as músicas e marque as palavras que aprendeu!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {learnedWords.map(w => (
                  <div key={w} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 20, background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.3)', color: '#22c55e', fontWeight: 700 }}>
                    <CheckCircle2 size={14} />
                    {w}
                    <button onClick={() => toggleLearned(w)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: '1.1rem', lineHeight: 1, padding: 0, marginLeft: 4 }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div style={{ marginTop: 20 }}>
            <Card title="Frases do Cotidiano" subtitle="Clique em 'Próxima' no banner acima para praticar">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                {dailyPhrases.map((p, i) => (
                  <div key={i} style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--surface-bg)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 4 }}>"{p.phrase}"</div>
                    <div className="text-secondary" style={{ fontSize: '.85rem', marginBottom: 6 }}>{p.meaning}</div>
                    <span style={{ fontSize: '.73rem', padding: '2px 9px', borderRadius: 20, background: 'rgba(99,102,241,.12)', color: '#6366f1', fontWeight: 700 }}>{p.level}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div style={{ marginTop: 20 }}>
            <Card title="Recursos para Estudar" subtitle="Sites e canais recomendados para aprender inglês">
              {[
                { name: 'BBC Learning English', desc: 'Notícias e podcasts com transcrição — nível B1 a C2', link: 'https://www.bbc.co.uk/learningenglish', icon: '📻' },
                { name: 'Duolingo', desc: 'Prática diária gamificada', link: 'https://www.duolingo.com', icon: '🦉' },
                { name: 'WordReference', desc: 'Melhor dicionário EN-PT online', link: 'https://www.wordreference.com/enpt', icon: '📖' },
                { name: 'English with Lucy (YouTube)', desc: 'Aulas naturais com sotaque britânico', link: 'https://www.youtube.com/@EnglishwithLucy', icon: '🎬' },
                { name: 'Anki', desc: 'Flashcards com repetição espaçada — ideal para vocabulário', link: 'https://apps.ankiweb.net', icon: '🃏' },
              ].map(r => (
                <a key={r.name} href={r.link} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--border-color)', textDecoration: 'none' }}>
                  <span style={{ fontSize: '1.5rem', width: 36, textAlign: 'center' }}>{r.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{r.name}</div>
                    <div className="text-secondary" style={{ fontSize: '.83rem' }}>{r.desc}</div>
                  </div>
                  <ExternalLink size={15} color="var(--text-tertiary)" />
                </a>
              ))}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
