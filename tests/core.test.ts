import './vercel.test';
import './sync.test';
import { dailyTopic, suggestTracks, selectGuitarTrack, guitarStreak } from '../src/services/guitarPractice';
import { dailyGuitar } from '../src/services/dailyGuitar';
import './publicContent.test';
import './edge.test';
import test from 'node:test';
import assert from 'node:assert/strict';
import { planDay, workoutsOn } from '../src/services/dayPlanner';
import { createItem, updateItem, getAllItems, subscribeToData, exportAllData } from '../src/services/storage';
import { remoteResultSchema, validateAttachment } from '../src/services/agentValidation';
import { executeConfirmedActions, processAgentMessage } from '../src/services/aiAgentService';
import { getDailyCatholicContext } from '../src/services/transformationContent';
const memory = new Map<string,string>();
test('daily guitar stays stable on reload and rotates every day including month boundaries', () => {
  const days = Array.from({length:14},(_,i)=>dailyGuitar(new Date(Date.UTC(2026,10,25+i)).toISOString().slice(0,10)));
  assert.equal(new Set(days.map(d=>d.picking)).size,14);
  assert.equal(new Set(days.map(d=>d.solo)).size,14);
  for(let i=1;i<days.length;i++) assert.notEqual(days[i].song.path,days[i-1].song.path);
  assert.deepEqual(dailyGuitar('2026-11-16'),dailyGuitar('2026-11-16'));
  assert.equal(days[0].picking.split('\n').length,6);
});
Object.assign(globalThis, { window: new EventTarget(), localStorage: { get length() { return memory.size; }, key: (i: number) => [...memory.keys()][i] ?? null, getItem: (k: string) => memory.get(k) ?? null, setItem: (k: string,v: string) => memory.set(k,v), removeItem: (k: string) => memory.delete(k) } });
const task = { id: 't', title: 'Estudar', status: 'pending', priority: 'high', estimated_minutes: 30, due_date: '2026-11-09' };
const pref = { start: '08:00', end: '10:00', budget: 60 };
test('planner avoids fixed appointments and preserves original task', () => {
  const event = { id: 'e', title: 'Trabalho', start_date: '2026-11-09', start_time: '08:00', end_time: '09:00' };
  const plan = planDay('2026-11-09', [task], [event], [], pref);
  assert.equal(plan.blocks.find(b => b.kind === 'task')?.time, '09:00'); assert.equal(task.due_date, '2026-11-09');
});
test('planner respects budget, completed tasks and all-day events', () => {
  assert.equal(planDay('2026-11-09', [task], [], [], {...pref,budget: 20}).deferred.length, 1);
  assert.equal(planDay('2026-11-09', [{...task,status:'completed'}], [], [], pref).blocks.length, 0);
  assert.equal(planDay('2026-11-09', [task], [{id:'e',start_date:'2026-11-09',all_day:true}], [], pref).deferred.length, 1);
});
test('weekly workout is shared by planner and calendar selector', () => {
  const workout = { id:'w', name:'Treino A', active:true, days_of_week:[1], target_time:'08:00',duration_minutes:45 };
  assert.equal(workoutsOn([workout], '2026-11-09').length, 1);
  assert.equal(workoutsOn([workout], '2026-11-10').length, 0);
  assert.equal(planDay('2026-11-09', [task], [], [workout], pref).blocks.find(b => b.kind==='task')?.time,'08:45');
});
test('storage notifies, persists updates and isolates users', async () => {
  memory.clear(); let updates = 0; const unsubscribe = subscribeToData(() => updates++);
  const saved = createItem('tasks','alice',{title:'Persistida'}); updateItem('tasks','alice',saved.id,{title:'Editada'});
  assert.equal(getAllItems('tasks','alice')[0].title,'Editada'); assert.equal(getAllItems('tasks','bob').length,0); await Promise.resolve(); assert.equal(updates,2); unsubscribe();
});
test('corrupt storage is never silently overwritten', () => {
  memory.set('lifeos_bad_tasks','{'); assert.throws(() => createItem('tasks','bad',{title:'novo'})); assert.equal(memory.get('lifeos_bad_tasks'),'{');
});
test('local agent creates a real task', () => {
  const result = processAgentMessage('local-test','Criar tarefa: Estudar TypeScript');
  assert.ok(result.actionsExecuted?.length); assert.ok(getAllItems('tasks','local-test').some(t => t.title.includes('TypeScript')));
});
const action = { kind:'task',title:'Revisar documento',description:null,date:'2026-11-11',time:null,priority:'high',category:'study',amount:null,finance_type:null,finance_category:null,payment_method:null,finance_status:null,location:null,name:null,frequency:null,notes:null };
test('proposal validation has no writes; explicit execution persists', () => {
  const proposal = remoteResultSchema.parse({message:'Proposta',actions:[action]}); assert.equal(getAllItems('tasks','confirm').length,0);
  const result = executeConfirmedActions('confirm',proposal); assert.equal(result.actionsExecuted?.length,1); assert.equal(getAllItems('tasks','confirm').length,1);
});
test('invalid actions are rejected before writes', () => {
  assert.equal(remoteResultSchema.safeParse({message:'x',actions:[{...action,date:'2026-02-30'}]}).success,false);
  assert.throws(() => executeConfirmedActions('invalid',{message:'x',actions:[{...action,kind:'finance',amount:-20}]})); assert.equal(getAllItems('finance','invalid').length,0);
});
test('files reject unsupported formats and size; local analysis cannot write', () => {
  assert.throws(() => validateAttachment({name:'a.exe',type:'',size:10})); assert.throws(() => validateAttachment({name:'a.pdf',type:'application/pdf',size:6000000}));
  const response = processAgentMessage('files','analisar',{name:'nota.txt',type:'text/plain',size:30,content:'Total R$ 99,90'});
  assert.equal(response.error,true); assert.equal(getAllItems('finance','files').length,0);
});
test('rosary follows all seven traditional weekdays without invented liturgy', () => {
  const expected = ['Gloriosos','Gozosos','Dolorosos','Gloriosos','Luminosos','Dolorosos','Gozosos'];
  expected.forEach((name,i) => assert.ok(getDailyCatholicContext(new Date(2026,10,8+i)).rosary.mysteryName.includes(name)));
  assert.equal(getDailyCatholicContext().gospel.text,'');
});
test('new preferences and histories are exported', () => {
  createItem('self_care','export',{id:'care',skin:'seca'}); assert.equal(exportAllData('export').self_care.length,1); createItem('water_2026-11-11','export',{id:'water',glasses:2}); assert.equal(exportAllData('export').water_2026_11_11,undefined); assert.equal(exportAllData('export')['water_2026-11-11'].length,1);
});

test('guitar daily focus varies and recently completed tracks are excluded', () => {
  assert.notEqual(dailyTopic('2026-11-11').title,dailyTopic('2026-11-12').title);
  const tracks=[{id:'a',title:'A'},{id:'b',title:'B'}];
  const result=suggestTracks(tracks,'2026-11-11',[{status:'completed',due_date:'2026-11-10',guitar_track:{id:'a'}}]);
  assert.deepEqual(result.map(t=>t.id),['b']);
});
test('guitar uses a single persisted task per date and cannot inflate streak', () => {
  const track={id:'a',title:'Música',artist:'Artista',album:'Álbum',genre:'Folk',url:'https://music.apple.com/br/album/example'};
  selectGuitarTrack('guitar-test','2026-11-11',track,'Pulso',20);
  selectGuitarTrack('guitar-test','2026-11-11',{...track,id:'b'},'Ritmo',30);
  const list=getAllItems('tasks','guitar-test');assert.equal(list.length,1);assert.equal(list[0].estimated_minutes,30);
  updateItem('tasks','guitar-test',list[0].id,{status:'completed'});
  const completed=getAllItems('tasks','guitar-test');assert.equal(guitarStreak([...completed,...completed],'2026-11-11'),1);
  assert.equal(guitarStreak(completed,'2026-11-14'),0);
});


test('imported workouts preserve exercises and schedule one-off versus weekly without duplicate events', () => {
  const detail = {muscle_groups:['Costas'],days_of_week:[],duration_minutes:45,exercises:[{name:'Remada baixa',sets:3,reps:'10–12',weight:25,rest_seconds:90,notes:'Pegada neutra'}]};
  const one = {...action,kind:'workout',title:'Treino importado',date:'2026-11-17',time:'08:00',workout:detail};
  const proposal = remoteResultSchema.parse({message:'Ficha',actions:[one]});
  executeConfirmedActions('workout-import',proposal);
  const stored=getAllItems<import('../src/types').Workout>('workouts','workout-import');
  assert.equal(stored[0].exercises[0].name,'Remada baixa');
  assert.equal(stored[0].exercises[0].sets,3); assert.equal(stored[0].exercises[0].rest_seconds,90);
  assert.equal(stored[0].exercises[0].workout_id,stored[0].id);
  assert.equal(workoutsOn(stored,'2026-11-17').length,1); assert.equal(workoutsOn(stored,'2026-11-24').length,0);
  assert.equal(getAllItems('events','workout-import').length,0);
  executeConfirmedActions('workout-weekly',remoteResultSchema.parse({message:'Ficha',actions:[{...one,workout:{...detail,days_of_week:[2,4]}}]}));
  const weekly=getAllItems<import('../src/types').Workout>('workouts','workout-weekly');
  assert.equal(workoutsOn(weekly,'2026-11-10').length,0); assert.equal(workoutsOn(weekly,'2026-11-24').length,1);
  assert.equal(workoutsOn(weekly,'2026-11-19').length,1);
  assert.equal(remoteResultSchema.safeParse({message:'Inválido',actions:[{...one,workout:{...detail,days_of_week:[8]}}]}).success,false);
});
