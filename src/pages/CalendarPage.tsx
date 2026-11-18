import { holidaysForYear, holidaySources, type HolidayRegion } from '../services/holidays';
import { workoutsOn } from '../services/dayPlanner';
import { useNavigate } from 'react-router-dom';
import { useDataRefresh } from '../hooks/useDataRefresh';
import { useState } from 'react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus,
  Clock, MapPin, Trash2, Edit3
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getAllItems, createItem, updateItem, deleteItem } from '../services/storage';
import type { CalendarEvent, EventCategory, Priority, Workout } from '../types';

export default function CalendarPage() {
  const navigate = useNavigate();
  const [holidayRegion, setHolidayRegion] = useState<HolidayRegion>('all');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const { user } = useAuth();
  const { addToast } = useToast();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventCategory>('work');
  const [startDate, setStartDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('10:00');
  const [endDate, setEndDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [endTime, setEndTime] = useState('11:00');
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [color, setColor] = useState('#7c3aed');

  const loadEvents = () => {
    if (!user) return;
    const pref=getAllItems<{id:string;region:HolidayRegion}>('calendar_preferences',user.id).find(p=>p.id==='holidays');
    setHolidayRegion(pref?.region || 'all');
    setEvents(getAllItems<CalendarEvent>('events', user.id));
    setWorkouts(getAllItems<Workout>('workouts', user.id));
  };

  useDataRefresh(loadEvents);

  // Calendar dates generation
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDateGrid = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDateGrid = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: startDateGrid, end: endDateGrid });

  const weekDayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const eventsOn = (date: string): CalendarEvent[] => [...events.filter(e => e.start_date <= date && (e.end_date || e.start_date) >= date), ...workoutsOn(workouts, date).map(w => ({ id: `workout:${w.id}`, user_id: w.user_id, title: w.name, description: 'Treino — edite na Academia', category: 'fitness' as const, start_date: date, start_time: w.target_time, all_day: !w.target_time, priority: 'medium' as const, created_at: w.created_at, updated_at: w.updated_at }))];
  const selectedDateEvents = eventsOn(selectedDateStr);
  const holidayList = [...new Set(days.map(day=>day.getFullYear()).concat(selectedDate.getFullYear()))].flatMap(year=>holidaysForYear(year,holidayRegion));
  const holidaysOn = (date:string)=>holidayList.filter(h=>h.date===date);
  const monthHolidays=holidayList.filter(h=>h.date.startsWith(format(currentMonth,'yyyy-MM')));
  const changeHolidayRegion=(region:HolidayRegion)=>{
    setHolidayRegion(region);
    if(user && !updateItem<{id:string;region:HolidayRegion}>('calendar_preferences',user.id,'holidays',{region}))createItem<{id:string;region:HolidayRegion}>('calendar_preferences',user.id,{id:'holidays',region});
  };

  const openCreateModal = (targetDate?: Date) => {
    const d = targetDate || selectedDate;
    const formatted = format(d, 'yyyy-MM-dd');
    setEventToEdit(null);
    setTitle('');
    setDescription('');
    setCategory('work');
    setStartDate(formatted);
    setEndDate(formatted);
    setStartTime('10:00');
    setEndTime('11:00');
    setAllDay(false);
    setLocation('');
    setPriority('medium');
    setColor('#7c3aed');
    setIsModalOpen(true);
  };

  const openEditModal = (event: CalendarEvent) => {
    if (event.id.startsWith('workout:')) { navigate('/fitness'); return; }
    setEventToEdit(event);
    setTitle(event.title);
    setDescription(event.description || '');
    setCategory(event.category);
    setStartDate(event.start_date);
    setEndDate(event.end_date || event.start_date);
    setStartTime(event.start_time || '10:00');
    setEndTime(event.end_time || '11:00');
    setAllDay(event.all_day);
    setLocation(event.location || '');
    setPriority(event.priority);
    setColor(event.color || '#7c3aed');
    setIsModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) return;

    if (eventToEdit) {
      updateItem<CalendarEvent>('events', user.id, eventToEdit.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        start_date: startDate,
        start_time: allDay ? undefined : startTime,
        end_date: endDate,
        end_time: allDay ? undefined : endTime,
        all_day: allDay,
        location: location.trim() || undefined,
        priority,
        color,
      });
      addToast({ type: 'success', title: 'Evento atualizado!' });
    } else {
      createItem<CalendarEvent>('events', user.id, {
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        start_date: startDate,
        start_time: allDay ? undefined : startTime,
        end_date: endDate,
        end_time: allDay ? undefined : endTime,
        all_day: allDay,
        location: location.trim() || undefined,
        priority,
        color,
      });
      addToast({ type: 'success', title: 'Evento criado com sucesso!' });
    }

    setIsModalOpen(false);
    loadEvents();
  };

  const handleDeleteEvent = () => {
    if (!eventToDelete || !user) return;
    deleteItem<CalendarEvent>('events', user.id, eventToDelete.id);
    setEvents(prev => prev.filter(e => e.id !== eventToDelete.id));
    setEventToDelete(null);
    addToast({ type: 'success', title: 'Evento removido!' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header with Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Calendário & Agenda</h1>
          <p className="text-sm text-secondary" style={{ margin: '4px 0 0' }}>
            Planeje seus compromissos, reuniões e eventos importantes.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: 'var(--surface-card)', borderRadius: 'var(--border-radius-md)', padding: '4px 8px', border: '1px solid var(--border-color)' }}>
            <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft size={16} />
            </Button>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', minWidth: 140, textAlign: 'center', textTransform: 'capitalize' }}>
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </span>
            <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight size={16} />
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={() => { setCurrentMonth(new Date()); setSelectedDate(new Date()); }}>
            Hoje
          </Button>

          <Button variant="primary" onClick={() => openCreateModal()}>
            <Plus size={18} /> Novo Evento
          </Button>
        </div>
      </div>

      <details className="calendar-holiday-reference"><summary>Feriados de {format(currentMonth,'MMMM yyyy',{locale:ptBR})} ({monthHolidays.length})</summary><ul>{monthHolidays.map(h=><li key={h.date+h.name}><button type="button" onClick={()=>setSelectedDate(new Date(h.date+'T12:00:00'))}><strong>{h.date.slice(8)}/{h.date.slice(5,7)}</strong> {h.name} <small>· {h.scope}</small></button></li>)}</ul>{!monthHolidays.length&&<p>Sem feriados neste mês para o filtro selecionado.</p>}<p>Regras verificadas nos calendários oficiais de 2026. {currentMonth.getFullYear()!==2026&&'Para este ano, as datas são calculadas pelas mesmas regras; confirme alterações nas fontes oficiais.'} Pontos facultativos não estão incluídos.</p><div><a href={holidaySources.national} target="_blank" rel="noreferrer">Brasil ↗</a> · <a href={holidaySources.sjc} target="_blank" rel="noreferrer">São José dos Campos ↗</a> · <a href={holidaySources.taubate} target="_blank" rel="noreferrer">Taubaté ↗</a></div></details>
      {/* Grid: Month View (Left) & Day Events Panel (Right) */}
      <div className="calendar-holiday-controls"><label>Feriados <select aria-label="Feriados" className="input" value={holidayRegion} onChange={e=>changeHolidayRegion(e.target.value as HolidayRegion)}><option value="all">Brasil + São José dos Campos + Taubaté</option><option value="national">Somente nacionais</option><option value="sjc">Brasil + SP + São José dos Campos</option><option value="taubate">Brasil + SP + Taubaté</option></select></label><small>Datas em destaque: toque no dia para ver o feriado e seus compromissos.</small></div>
      <div className="calendar-main-grid">
        {/* Month View Card */}
        <Card className="calendar-month-card" style={{ padding: 'var(--space-4)' }}>
          {/* Weekday headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 6, marginBottom: 8, textAlign: 'center' }}>
            {weekDayNames.map(day => (
              <span key={day} style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', padding: '4px 0', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="calendar-days-grid">
            {days.map(day => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const dayEvents = eventsOn(dayStr);
              const isDayToday = isToday(day);
              const dayHolidays = holidaysOn(dayStr);

              return (
                <div
                  key={dayStr}
                  className="calendar-day" role="button" tabIndex={0}
                  aria-label={`${format(day,'dd/MM/yyyy')}${dayHolidays.length ? ' · '+dayHolidays.map(h=>h.name).join(', ') : ''}`}
                  aria-pressed={isSelected}
                  onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setSelectedDate(day);}}}
                  onClick={() => setSelectedDate(day)}
                  style={{
                    height: '100%',
                    minHeight: 0,
                    minWidth: 0,
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                    padding: 6,
                    borderRadius: 'var(--border-radius-md)',
                    backgroundColor: isSelected ? 'var(--color-primary-50)' : isDayToday ? 'var(--color-neutral-100)' : 'var(--surface-bg)',
                    border: `1px solid ${isSelected ? 'var(--color-primary-500)' : isDayToday ? 'var(--color-primary-400)' : 'var(--border-color)'}`,
                    cursor: 'pointer',
                    opacity: isCurrentMonth ? 1 : 0.4,
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: isDayToday || isSelected ? 700 : 500,
                        width: 24,
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        backgroundColor: isDayToday ? 'var(--color-primary-600)' : 'transparent',
                        color: isDayToday ? '#ffffff' : 'inherit',
                      }}
                    >
                      {format(day, 'd')}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="calendar-event-count text-xs font-bold text-secondary" style={{ fontSize: '0.7rem' }}>
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  <div className="calendar-day-markers">{dayHolidays.length>0&&<span className="calendar-holiday-dot" title="Feriado" />}{dayEvents.length>0&&<span className="calendar-event-dot" title={`${dayEvents.length} compromisso(s)`}/>}</div>
                  {dayHolidays.map(h=><span className="calendar-holiday-label" key={h.name} title={`${h.name} · ${h.scope}`}>{h.name}</span>)}
                  {/* Event pills inside calendar day */}
                  <div className="calendar-event-pills" style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0, width: '100%', flex: 1, overflow: 'hidden' }}>
                    {dayEvents.slice(0, 2).map(ev => (
                      <div
                        key={ev.id}
                        title={ev.title}
                        style={{
                          backgroundColor: ev.color || 'var(--color-primary-600)',
                          color: '#ffffff',
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          height: 20,
                          lineHeight: '16px',
                          boxSizing: 'border-box',
                          padding: '2px 5px',
                          borderRadius: 4,
                          maxWidth: '100%',
                          minWidth: 0,
                          display: 'block',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                        }}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600, lineHeight: '16px', whiteSpace: 'nowrap' }}>
                        +{dayEvents.length - 2} mais
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Selected Day Agenda Panel */}
        <Card className="calendar-agenda"
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CalendarIcon size={18} className="text-primary" />
              <span>{format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}</span>
            </div>
          }
          subtitle={`${selectedDateEvents.length} eventos nesta data`}
          action={
            <Button size="sm" variant="outline" onClick={() => openCreateModal(selectedDate)}>
              <Plus size={14} /> Adicionar
            </Button>
          }
        >
          {holidaysOn(selectedDateStr).map(h=><article className="calendar-holiday-detail" key={h.name}><strong>{h.name}</strong><span>Feriado · {h.scope}</span><a href={h.source} target="_blank" rel="noreferrer">Consultar fonte oficial ↗</a></article>)}
          {selectedDateEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-secondary)' }}>
              <CalendarIcon size={36} style={{ color: 'var(--text-tertiary)', margin: '0 auto 8px' }} />
              <p className="text-sm font-semibold">Nenhum evento neste dia</p>
              <p className="text-xs text-secondary mb-3">Clique em adicionar para criar um compromisso.</p>
              <Button size="sm" variant="outline" onClick={() => openCreateModal(selectedDate)}>
                Criar Evento
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {selectedDateEvents.map(ev => (
                <div
                  key={ev.id}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--border-radius-md)',
                    backgroundColor: 'var(--surface-bg)',
                    borderLeft: `4px solid ${ev.color || 'var(--color-primary-600)'}`,
                    borderTop: '1px solid var(--border-color)',
                    borderRight: '1px solid var(--border-color)',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className="font-semibold text-sm text-primary">{ev.title}</span>
                    <Badge variant="secondary" size="sm">{ev.category}</Badge>
                  </div>

                  {ev.description && (
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {ev.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} />
                      {ev.all_day ? 'O dia todo' : `${ev.start_time || ''} - ${ev.end_time || ''}`}
                    </div>
                    {ev.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={12} /> {ev.location}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 4 }}>
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(ev)} style={{ padding: 4 }}>
                      <Edit3 size={13} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => ev.id.startsWith('workout:') ? navigate('/fitness') : setEventToDelete(ev)} style={{ padding: 4 }}>
                      <Trash2 size={13} style={{ color: '#ef4444' }} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Event Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={eventToEdit ? 'Editar Evento' : 'Novo Evento'}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, width: '100%' }}>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleSaveEvent}>Salvar Evento</Button>
          </div>
        }
      >
        <form onSubmit={handleSaveEvent} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Título do Evento</label>
            <input
              type="text"
              className="input"
              placeholder="Ex: Reunião de Alinhamento, Consulta Médica..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Descrição / Detalhes</label>
            <textarea
              className="input"
              rows={2}
              placeholder="Notas ou pauta do evento..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Categoria</label>
              <select className="input" value={category} onChange={e => setCategory(e.target.value as EventCategory)}>
                <option value="work">Trabalho</option>
                <option value="personal">Pessoal</option>
                <option value="study">Estudos</option>
                <option value="health">Saúde</option>
                <option value="fitness">Academia</option>
                <option value="spiritual">Espiritual</option>
                <option value="other">Outros</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Cor de Destaque</label>
              <input
                type="color"
                className="input"
                value={color}
                onChange={e => setColor(e.target.value)}
                style={{ height: 38, padding: 2, cursor: 'pointer' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Data Início</label>
              <input type="date" className="input" value={startDate} onChange={e => setStartDate(e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Data Término</label>
              <input type="date" className="input" value={endDate} onChange={e => setEndDate(e.target.value)} required />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              id="allDayCheckbox"
              checked={allDay}
              onChange={e => setAllDay(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: 'var(--color-primary-600)' }}
            />
            <label htmlFor="allDayCheckbox" className="text-sm font-medium">Evento de dia inteiro</label>
          </div>

          {!allDay && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Horário Início</label>
                <input type="time" className="input" value={startTime} onChange={e => setStartTime(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Horário Término</label>
                <input type="time" className="input" value={endTime} onChange={e => setEndTime(e.target.value)} />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Localização / Link</label>
            <input
              type="text"
              className="input"
              placeholder="Ex: Google Meet, Sala 402, Rua das Flores 123..."
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!eventToDelete}
        onClose={() => setEventToDelete(null)}
        onConfirm={handleDeleteEvent}
        title="Excluir Evento"
        message={`Tem certeza que deseja cancelar o evento "${eventToDelete?.title}"?`}
      />
    </div>
  );
}
