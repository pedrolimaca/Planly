import type { Task, CalendarEvent, Workout } from '../types';
export interface DayPreferences { id: string; user_id: string; start: string; end: string; budget: number }
export interface PlanBlock { id: string; title: string; time: string; minutes: number; kind: 'task' | 'event' | 'workout'; link: string }
export const minutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
const clock = (value: number) => `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
export function workoutsOn(workouts: Workout[], date: string) {
  const weekday = new Date(`${date}T12:00:00`).getDay();
  return workouts.filter(w => w.active && (!w.start_date || date >= w.start_date) && (w.scheduled_date ? w.scheduled_date === date : w.days_of_week?.includes(weekday)));
}
export function planDay(date: string, tasks: Task[], events: CalendarEvent[], workouts: Workout[], preferences: Pick<DayPreferences, 'start' | 'end' | 'budget'>, notBefore?: string) {
  const start = Math.max(minutes(preferences.start), notBefore ? minutes(notBefore) : 0);
  const end = minutes(preferences.end);
  const blocks: PlanBlock[] = [];
  const busy: [number, number][] = [];
  events.filter(e => e.start_date <= date && (e.end_date || e.start_date) >= date).forEach(e => {
    const a = e.all_day || e.start_date < date ? start : minutes(e.start_time || preferences.start);
    const b = e.all_day || (e.end_date || e.start_date) > date ? end : e.end_time ? minutes(e.end_time) : a + 60;
    busy.push([a, Math.max(a + 1, b)]);
    blocks.push({ id: e.id, title: e.title, time: clock(a), minutes: b - a, kind: 'event', link: '/calendar' });
  });
  workoutsOn(workouts, date).forEach(w => {
    const a = minutes(w.target_time || '07:00'); const duration = w.duration_minutes || 45;
    busy.push([a, a + duration]);
    blocks.push({ id: w.id, title: w.name, time: clock(a), minutes: duration, kind: 'workout', link: '/fitness' });
  });
  const priorities = { urgent: 0, high: 1, medium: 2, low: 3 };
  const pending = tasks.filter(t => !['completed', 'cancelled'].includes(t.status) && (!t.due_date || t.due_date <= date))
    .sort((a, b) => priorities[a.priority] - priorities[b.priority] || (a.due_date || date).localeCompare(b.due_date || date));
  const deferred: Task[] = []; let used = 0;
  for (const task of pending) {
    const duration = Math.max(5, task.estimated_minutes || 25);
    let at = Math.max(start, task.due_time ? minutes(task.due_time) : start);
    while (at + duration <= end && busy.some(([a,b]) => at < b && at + duration > a)) at += 5;
    if (at + duration > end || used + duration > preferences.budget) { deferred.push(task); continue; }
    blocks.push({ id: task.id, title: task.title, time: clock(at), minutes: duration, kind: 'task', link: '/tasks' });
    busy.push([at, at + duration + 5]); used += duration;
  }
  const conflicts = blocks.filter((b, i) => b.kind !== 'task' && blocks.some((other, j) => i !== j && other.kind !== 'task' && minutes(b.time) < minutes(other.time) + other.minutes && minutes(b.time) + b.minutes > minutes(other.time)));
  return { blocks: blocks.sort((a,b) => a.time.localeCompare(b.time)), priorities: pending.slice(0,3), deferred, conflicts };
}
