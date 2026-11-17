import { format, subDays } from 'date-fns';
import { createItem, getAllItems, updateItem } from './storage';
import type { Task } from '../types';
export interface MusicTrack { id: string; title: string; artist: string; album: string; genre: string; url: string }
export interface GuitarTask extends Task { guitar_track?: MusicTrack; practice_focus?: string }
export interface GuitarPreferences { id: string; user_id: string; query: string; level: string; minutes: number }
export const practiceTopics = [
  ['Trocas de acordes', 'Escolha dois acordes que você já conhece. Alterne lentamente e conte as trocas limpas em um minuto.'],
  ['Pulso constante', 'Marque quatro tempos com o pé e toque apenas no primeiro. Mantenha a duração dos compassos igual.'],
  ['Dedilhado', 'Em um acorde confortável, alterne polegar, indicador e médio. Priorize volume equilibrado, sem tensão.'],
  ['Escuta e estrutura', 'Ouça uma gravação na fonte. Identifique introdução, versos e refrão antes de estudar um trecho curto.'],
  ['Ritmo e pausas', 'Abafe as cordas e pratique quatro ataques seguidos de quatro tempos em silêncio, mantendo o pulso.'],
  ['Memória', 'Revise um pequeno trecho já estudado sem olhar a referência. Anote exatamente onde precisou consultar.'],
  ['Dinâmica', 'Toque uma sequência conhecida suave e depois um pouco mais forte, mantendo o mesmo andamento.'],
  ['Precisão', 'Escolha o trecho mais difícil e reduza a velocidade até conseguir três repetições limpas.'],
  ['Coordenação', 'Pratique uma frase curta, separando primeiro os movimentos de cada mão e depois juntando-os.'],
  ['Repertório', 'Junte dois trechos que você já estudou e pratique a passagem entre eles sem parar.'],
  ['Gravação e revisão', 'Grave um minuto da própria execução. Ouça, escolha um ponto a melhorar e grave novamente.'],
  ['Revisão semanal', 'Revise as anotações das últimas práticas. Repita o exercício que mais precisa de atenção.'],
];
export function dailyTopic(date: string, level = 'Iniciante') {
  const day = Math.floor(Date.parse(date + 'T12:00:00Z') / 86400000);
  const [title, instruction] = practiceTopics[(day + (level === 'Avançado' ? 4 : level === 'Intermediário' ? 2 : 0)) % practiceTopics.length];
  return { title, instruction };
}
export function suggestTracks(tracks: MusicTrack[], date: string, history: GuitarTask[]) {
  const cutoff = format(subDays(new Date(date + 'T12:00:00'),7),'yyyy-MM-dd');
  const recent = new Set(history.filter(t => t.status === 'completed' && t.due_date && t.due_date >= cutoff && t.due_date < date).map(t=>t.guitar_track?.id));
  const hash = (value: string) => [...value].reduce((n,c) => (Math.imul(n,31)+c.charCodeAt(0)) >>> 0, 0);
  return tracks.filter(t=>!recent.has(t.id)).sort((a,b)=>hash(date+a.id)-hash(date+b.id)).slice(0,4);
}
export function selectGuitarTrack(userId: string, date: string, track: MusicTrack, focus: string, duration: number) {
  const id = `guitar:${date}`;
  const data = { user_id:userId, title:`Prática de Violão: ${track.title} — ${track.artist}`, description:`Foco: ${focus}\nFonte: ${track.url}`, category:'study' as const, priority:'medium' as const, status:'pending' as const, due_date:date, tags:['violão','guitar-practice'], order_index:0, estimated_minutes:duration, guitar_track:track, practice_focus:focus, completed_at:undefined, actual_minutes:0 };
  return updateItem<GuitarTask>('tasks',userId,id,data) || createItem<GuitarTask>('tasks',userId,{...data,id});
}
export function guitarStreak(tasks: GuitarTask[], date: string) {
  const completed = new Set(tasks.filter(t=>t.tags?.includes('guitar-practice') && t.status === 'completed').map(t=>t.due_date));
  let cursor = new Date(date+'T12:00:00'); let count=0;
  if (!completed.has(date)) cursor=subDays(cursor,1);
  while(completed.has(format(cursor,'yyyy-MM-dd'))) { count++; cursor=subDays(cursor,1); }
  return count;
}
export function getGuitarTask(userId: string, date: string) { return getAllItems<GuitarTask>('tasks',userId).find(t=>t.id===`guitar:${date}`); }
