import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, Calendar, BookmarkCheck, XCircle, CalendarDays,
  LogOut, Zap, Bell, Search, ChevronRight, CheckCircle2, AlertCircle,
  Loader2, Users, MapPin, Clock, QrCode, X, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api';
import { Event } from '../types';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png';

// ── Sidebar nav items ────────────────────────────────────────────
const NAV = [
  { id: 'home', label: 'Home', icon: LayoutDashboard },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'my-events', label: 'My Events', icon: BookmarkCheck },
  { id: 'cancelled', label: 'Cancelled Events', icon: XCircle },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
];

type Section = 'home' | 'events' | 'my-events' | 'cancelled' | 'calendar';

// ── Helpers ──────────────────────────────────────────────────────
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function isToday(d: string) {
  const today = new Date(); const dt = new Date(d);
  return today.getFullYear() === dt.getFullYear() && today.getMonth() === dt.getMonth() && today.getDate() === dt.getDate();
}

// ── QR Modal ─────────────────────────────────────────────────────
const QRModal: React.FC<{ event: Event; rollNo: number; onClose: () => void }> = ({ event, rollNo, onClose }) => {
  const qrData = `EVENZA|${event.id}|${event.name}|ROLL:${rollNo}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrData)}&size=200x200&bgcolor=ffffff`;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(17,24,39,0.9)', backdropFilter: 'blur(8px)' }}>
      <div className="rounded-2xl p-8 max-w-sm w-full text-center relative"
        style={{ background: 'linear-gradient(180deg,#1F2937,#111827)', border: '1px solid rgba(124, 58, 237, 0.1)' }}>
        <button onClick={onClose} className="absolute top-4 right-4" style={{ color: '#F9FAFB' }}>
          <X size={20} />
        </button>
        <Zap size={24} className="mx-auto mb-3" style={{ color: '#7C3AED' }} />
        <h3 className="text-[#F9FAFB] font-black text-lg mb-1">{event.name}</h3>
        <p className="text-xs mb-6" style={{ color: '#D1D5DB' }}>Check-in QR Code • Roll No: {rollNo}</p>
        <div className="qr-container mx-auto mb-4 inline-block">
          <img src={qrUrl} alt="QR Code" className="w-48 h-48" />
        </div>
        <p className="text-xs" style={{ color: '#9CA3AF' }}>Show this at the event venue</p>
      </div>
    </div>
  );
};

// ── Event Card (student view) ─────────────────────────────────────
interface EventCardProps {
  event: Event; isRegistered: boolean; isCancelled?: boolean;
  onRegister?: (id: string) => void; onCancel?: (id: string) => void; onQR?: (e: Event) => void;
  loading?: boolean;
}
const StudentEventCard: React.FC<EventCardProps> = ({ event, isRegistered, isCancelled, onRegister, onCancel, onQR, loading }) => {
  const filled = event.totalSeats > 0 ? event.registeredStudents.length : 0;
  const total = event.totalSeats || 0;
  const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
  const housefull = total > 0 && event.availableSeats <= 0;
  const todayEvent = isToday(event.date);

  return (
    <div className={`event-card group animate-fade-in relative ${todayEvent ? 'border-purple-500/40' : ''}`}>
      <div className="flex flex-wrap gap-2 mb-4">
        {todayEvent && (
          <div className="badge badge-orange animate-pulse-slow">
            <Zap size={10} /> TODAY
          </div>
        )}
        {housefull && !isRegistered && (
          <div className="badge badge-red">
            <AlertCircle size={10} /> HOUSEFULL
          </div>
        )}
        {isRegistered && (
          <div className="badge badge-green">
            <CheckCircle2 size={10} /> REGISTERED
          </div>
        )}
      </div>

      {/* Date strip */}
      <div className="flex items-start gap-4 mb-4">
        <div className="shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center text-center"
          style={{ background: 'rgba(124, 58, 237, 0.15)', border: '1px solid rgba(124, 58, 237, 0.25)' }}>
          <span className="text-xs font-bold uppercase leading-none" style={{ color: '#A78BFA' }}>
            {new Date(event.date).toLocaleDateString('en-IN', { month: 'short' })}
          </span>
          <span className="text-xl font-black text-[#F9FAFB] leading-none">
            {new Date(event.date).getDate()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[#F9FAFB] font-black text-base leading-tight truncate">{event.name}</h3>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="flex items-center gap-1 text-xs" style={{ color: '#F9FAFB' }}>
              <MapPin size={11} />{event.venue}
            </span>
            {event.time && (
              <span className="flex items-center gap-1 text-xs" style={{ color: '#F9FAFB' }}>
                <Clock size={11} />{event.time}
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="text-sm leading-relaxed mb-4 line-clamp-2" style={{ color: '#F9FAFB' }}>
        {event.description}
      </p>

      {/* Seat bar */}
      {total > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1.5" style={{ color: '#D1D5DB' }}>
            <span className="flex items-center gap-1"><Users size={11} /> {event.availableSeats} seats left</span>
            <span>{pct}% filled</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: pct >= 90 ? '#EF4444' : pct >= 60 ? '#F59E0B' : '#7C3AED'
              }} />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-2">
        {isCancelled ? (
          <button
            onClick={() => onRegister?.(event.id)}
            disabled={loading || housefull}
            className="btn-orange flex-1 py-2.5 text-xs rounded-lg disabled:opacity-50">
            {loading ? <Loader2 size={14} className="animate-spin" /> : housefull ? 'Housefull' : 'Re-Register'}
          </button>
        ) : isRegistered ? (
          <>
            <button onClick={() => onQR?.(event)}
              className="btn-ghost flex-1 py-2.5 text-xs rounded-lg flex items-center justify-center gap-1.5">
              <QrCode size={14} /> QR Code
            </button>
            <button onClick={() => onCancel?.(event.id)}
              disabled={loading}
              className="flex-1 py-2.5 text-xs rounded-lg flex items-center justify-center gap-1 font-semibold transition-all"
              style={{ background: 'rgba(239,68,68,0.12)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' }}>
              {loading ? <Loader2 size={14} className="animate-spin" /> : <><XCircle size={14} /> Cancel</>}
            </button>
          </>
        ) : (
          <button
            onClick={() => onRegister?.(event.id)}
            disabled={loading || housefull}
            className="btn-orange flex-1 py-2.5 text-xs rounded-lg disabled:opacity-50">
            {loading ? <Loader2 size={14} className="animate-spin" /> : housefull ? 'Housefull' : 'Register'}
          </button>
        )}
        <a href={`/event/${event.id}`}
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all"
          style={{ background: 'rgba(255,255,255,0.06)', color: '#F9FAFB' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#7C3AED'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#F9FAFB'; }}>
          <ChevronRight size={16} />
        </a>
      </div>
    </div>
  );
};

// ── Calendar View ─────────────────────────────────────────────────
const CalendarView: React.FC<{ events: Event[] }> = ({ events }) => {
  const today = new Date();
  const [curr, setCurr] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState<string | null>(null);

  const firstDay = new Date(curr.year, curr.month, 1).getDay();
  const daysInMonth = new Date(curr.year, curr.month + 1, 0).getDate();

  const eventDates = new Set(events.map(e => {
    const d = new Date(e.date);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }));

  const dayKey = (d: number) => `${curr.year}-${curr.month}-${d}`;

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="animate-fade-in">
      <div className="glass-card rounded-2xl p-6 mb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[#F9FAFB] font-black text-lg">{MONTHS[curr.month]} {curr.year}</h3>
          <div className="flex gap-2">
            <button onClick={() => setCurr(p => {
              const m = p.month === 0 ? 11 : p.month - 1;
              const y = p.month === 0 ? p.year - 1 : p.year;
              return { year: y, month: m };
            })} className="btn-ghost px-3 py-1.5 text-xs rounded-lg">‹ Prev</button>
            <button onClick={() => setCurr(p => {
              const m = p.month === 11 ? 0 : p.month + 1;
              const y = p.month === 11 ? p.year + 1 : p.year;
              return { year: y, month: m };
            })} className="btn-ghost px-3 py-1.5 text-xs rounded-lg">Next ›</button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map(d => (
            <div key={d} className="text-center text-xs font-bold py-2"
              style={{ color: '#9CA3AF' }}>{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const key = dayKey(day);
            const isCurrentDay = today.getFullYear() === curr.year && today.getMonth() === curr.month && today.getDate() === day;
            const hasEvent = eventDates.has(key);
            const isSelected = selected === key;

            return (
              <button key={day} onClick={() => setSelected(isSelected ? null : key)}
                className={`cal-day ${isCurrentDay ? 'today' : ''} ${hasEvent && !isCurrentDay ? 'has-event' : ''} ${isSelected ? 'ring-2' : ''}`}
                style={isSelected ? { ringColor: '#7C3AED' } : {}}>
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day events */}
      {selected && (() => {
        const [y, m, d] = selected.split('-').map(Number);
        const dayEvents = events.filter(e => {
          const dt = new Date(e.date);
          return dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d;
        });
        if (dayEvents.length === 0) return (
          <p className="text-center text-sm py-6" style={{ color: '#9CA3AF' }}>No events on this day</p>
        );
        return (
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#D1D5DB' }}>
              Events on {MONTHS[m]} {d}
            </p>
            {dayEvents.map(ev => (
              <div key={ev.id} className="glass-card rounded-xl p-4 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: '#7C3AED' }} />
                <div>
                  <p className="text-[#F9FAFB] font-bold text-sm">{ev.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#D1D5DB' }}>
                    <MapPin size={10} className="inline mr-1" />{ev.venue}
                    {ev.time && <><Clock size={10} className="inline ml-2 mr-1" />{ev.time}</>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
};

// ── MAIN COMPONENT ───────────────────────────────────────────────
export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const location = useLocation();
  const [section, setSection] = useState<Section>((location.state as any)?.section || 'home');
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [cancelledEvents, setCancelled] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [qrEvent, setQrEvent] = useState<Event | null>(null);
  const [search, setSearch] = useState('');
  const [refresh, setRefresh] = useState(false);

  // ── Fetch all data ────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (!user?.rollNo) return;
    setLoading(true);
    try {
      const [all, mine, cancelled] = await Promise.all([
        api.getAllEvents(),
        api.studentRegisteredEvents(user.rollNo),
        api.studentCancelledEvents(user.rollNo),
      ]);
      setAllEvents(all || []);
      setMyEvents(mine || []);
      setCancelled(cancelled || []);
    } catch {
      toast.error('Failed to sync data. Check backend.');
    } finally {
      setLoading(false);
    }
  }, [user?.rollNo]);

  useEffect(() => { fetchAll(); }, [fetchAll, refresh]);

  const triggerRefresh = () => setRefresh(r => !r);

  // ── Register ──────────────────────────────────────────────────
  const handleRegister = async (eventId: string) => {
    if (!user?.rollNo) return;
    setActionId(eventId);
    try {
      const res = await api.registerForEvent(eventId, user.rollNo);
      toast.success(res?.message || 'Registered! 🎉');
      triggerRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setActionId(null);
    }
  };

  // ── Cancel ────────────────────────────────────────────────────
  const handleCancel = async (eventId: string) => {
    if (!user?.rollNo) return;
    setActionId(eventId);
    try {
      const res = await api.cancelRegistration(eventId, user.rollNo);
      toast.success(res?.message || 'Registration cancelled');
      triggerRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Cancel failed');
    } finally {
      setActionId(null);
    }
  };

  const myEventIds = new Set(myEvents.map(e => e.id));
  const cancelledIds = new Set(cancelledEvents.map(e => e.id));
  const todayEvents = allEvents.filter(e => isToday(e.date));

  const filteredAll = allEvents.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.venue.toLowerCase().includes(search.toLowerCase())
  );

  // ── Simulated notification ────────────────────────────────────
  const sendNotification = () => {
    toast.success('🔔 Reminder set for your upcoming events!');
  };

  return (
    <div className="flex min-h-screen">
      {/* ── SIDEBAR ──────────────────────────────────────────── */}
      <aside className="sidebar">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-5 py-6 border-b"
          style={{ borderColor: '#374151' }}>
          <img src={logo} alt="Evenza Logo" className="w-9 h-9 object-contain" />
          <div>
            <p className="text-[#F9FAFB] font-bold text-xl font-dancing tracking-wide">Evenza</p>
            <p className="text-[10px] uppercase font-bold tracking-widest mt-0.5" style={{ color: '#9CA3AF' }}>Student Portal</p>
          </div>
        </div>


        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          <p className="section-title">Navigation</p>
          {NAV.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setSection(id as Section)}
              className={`nav-item w-full text-left ${section === id ? 'active' : ''}`}>
              <Icon size={18} />
              {label}
              {id === 'my-events' && myEvents.length > 0 && (
                <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(124, 58, 237, 0.2)', color: '#A78BFA' }}>
                  {myEvents.length}
                </span>
              )}
              {id === 'cancelled' && cancelledEvents.length > 0 && (
                <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(239,68,68,0.2)', color: '#F87171' }}>
                  {cancelledEvents.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="mt-auto px-3 py-4 space-y-2 border-t" style={{ borderColor: '#374151' }}>
          <button onClick={sendNotification} className="nav-item w-full text-left">
            <Bell size={18} /> Notifications
          </button>
          
          {/* Moved User info here */}
          <div className="px-2 py-3 mb-2 rounded-xl" style={{ background: 'rgba(124, 58, 237, 0.05)', border: '1px solid rgba(124, 58, 237, 0.1)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)', color: '#fff' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-[#F9FAFB] font-bold text-sm truncate">{user?.name}</p>
                <p className="text-[10px] font-medium truncate" style={{ color: '#D1D5DB' }}>Roll: {user?.rollNo}</p>
              </div>
            </div>
          </div>

          <button onClick={() => { logout(); navigate('/'); }}
            className="nav-item w-full text-left"
            style={{ color: 'rgba(239,68,68,0.7)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <main className="main-content flex-1 p-8">
        {loading ? (
          <div className="loading-overlay">
            <Loader2 size={40} className="animate-spin" style={{ color: '#7C3AED' }} />
            <p className="text-sm font-semibold" style={{ color: '#F9FAFB' }}>Loading your data...</p>
          </div>
        ) : (
          <>
            {/* ── HOME ──────────────────────────────────────── */}
            {section === 'home' && (
              <div className="animate-fade-in">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-black text-purple-600">
                      Welcome, <span style={{ color: '#ffae00ff' }}>{user?.name?.split(' ')[0]}</span> 👋
                    </h1>
                    <p className="mt-1 text-sm text-purple-600">
                      Here's your event activity at a glance
                    </p>
                  </div>
                  <button onClick={triggerRefresh}
                    className="btn-ghost px-3 py-2 rounded-xl text-xs text-purple-600 flex items-center gap-2 border-purple-600">
                    <RefreshCw size={14} /> Refresh
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  {[
                    { label: 'Total Events', value: allEvents.length, icon: Calendar, color: '#7C3AED' },
                    { label: 'Registered', value: myEvents.length, icon: BookmarkCheck, color: '#10B981' },
                    { label: 'Today\'s Events', value: todayEvents.length, icon: Zap, color: '#F59E0B' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="stat-card flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
                        <Icon size={22} style={{ color }} />
                      </div>
                      <div>
                        <p className="text-3xl font-black text-[#F9FAFB]">{value}</p>
                        <p className="text-xs font-semibold text-purple-600">{label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Today's events */}
                {todayEvents.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-5 rounded-full" style={{ background: '#FF6B00' }} />
                      <h2 className="text-purple-600 font-black">Today's Events</h2>
                      <span className="badge badge-orange ml-2">{todayEvents.length}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {todayEvents.map(ev => (
                        <StudentEventCard key={ev.id} event={ev}
                          isRegistered={myEventIds.has(ev.id)}
                          isCancelled={cancelledIds.has(ev.id) && !myEventIds.has(ev.id)}
                          onRegister={handleRegister} onCancel={handleCancel} onQR={setQrEvent}
                          loading={actionId === ev.id} />
                      ))}
                    </div>
                  </div>
                )}

                {/* All events preview */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-5 rounded-full" style={{ background: '#FF6B00' }} />
                      <h2 className="text-purple-600 font-black">Upcoming Events</h2>
                    </div>
                    <button onClick={() => setSection('events')}
                      className="text-xs font-bold flex items-center gap-1 transition-colors text-purple-600">
                      View All <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {allEvents.slice(0, 3).map(ev => (
                      <StudentEventCard key={ev.id} event={ev}
                        isRegistered={myEventIds.has(ev.id)}
                        isCancelled={cancelledIds.has(ev.id) && !myEventIds.has(ev.id)}
                        onRegister={handleRegister} onCancel={handleCancel} onQR={setQrEvent}
                        loading={actionId === ev.id} />
                    ))}
                  </div>
                  {allEvents.length === 0 && (
                    <div className="glass-card rounded-2xl p-12 text-center">
                      <Calendar size={40} className="mx-auto mb-3" style={{ color: '#9CA3AF' }} />
                      <p className="text-sm text-purple-600">No events available yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── EVENTS ────────────────────────────────────── */}
            {section === 'events' && (
              <div className="animate-fade-in">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-black text-purple-600">All Events</h1>
                    <p className="mt-1 text-sm text-purple-600">
                      {allEvents.length} events available — register to secure your spot
                    </p>
                  </div>
                </div>

                {/* Search */}
                <div className="relative mb-6 text-[#F9FAFB]">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600" />
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                    className="input-field pl-10" placeholder="Search events by name or venue..." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredAll.map(ev => (
                    <StudentEventCard key={ev.id} event={ev}
                      isRegistered={myEventIds.has(ev.id)}
                      isCancelled={cancelledIds.has(ev.id) && !myEventIds.has(ev.id)}
                      onRegister={handleRegister} onCancel={handleCancel} onQR={setQrEvent}
                      loading={actionId === ev.id} />
                  ))}
                  {filteredAll.length === 0 && (
                    <div className="col-span-full glass-card rounded-2xl p-12 text-center">
                      <Search size={40} className="mx-auto mb-3 text-purple-600" />
                      <p className="text-sm" style={{ color: '#9CA3AF' }}>No events match your search.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── MY EVENTS ─────────────────────────────────── */}
            {section === 'my-events' && (
              <div className="animate-fade-in">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-black text-purple-600">My Events</h1>
                    <p className="mt-1 text-sm text-purple-600">
                      {myEvents.length} events you're registered for
                    </p>
                  </div>
                  <button onClick={triggerRefresh}
                    className="btn-ghost px-3 py-2 rounded-xl text-xs flex items-center gap-2 text-[#F9FAFB]">
                    <RefreshCw size={14} /> Sync
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {myEvents.map(ev => (
                    <StudentEventCard key={ev.id} event={ev} isRegistered
                      onCancel={handleCancel} onQR={setQrEvent}
                      loading={actionId === ev.id} />
                  ))}
                  {myEvents.length === 0 && (
                    <div className="col-span-full glass-card rounded-2xl p-12 text-center">
                      <BookmarkCheck size={40} className="mx-auto mb-3 text-purple-600" />
                      <p className="font-bold text-purple-600 mb-1">No registrations yet</p>
                      <p className="text-sm text-purple-600">Browse events and register to see them here.</p>
                      <button onClick={() => setSection('events')}
                        className="btn-orange mt-4 px-6 py-2.5 text-sm rounded-lg inline-flex">
                        Browse Events
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── CANCELLED EVENTS ──────────────────────────── */}
            {section === 'cancelled' && (
              <div className="animate-fade-in">
                <div className="mb-8">
                  <h1 className="text-3xl font-black text-purple-600">Cancelled Events</h1>
                  <p className="mt-1 text-sm text-purple-600">
                    Events you cancelled — re-register if seats are still available
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {cancelledEvents.map(ev => (
                    <StudentEventCard key={ev.id} event={ev} isRegistered={false} isCancelled
                      onRegister={handleRegister} loading={actionId === ev.id} />
                  ))}
                  {cancelledEvents.length === 0 && (
                    <div className="col-span-full glass-card rounded-2xl p-12 text-center">
                      <XCircle size={40} className="mx-auto mb-3 text-purple-600" />
                      <p className="text-sm text-purple-600">No cancelled events.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── CALENDAR ──────────────────────────────────── */}
            {section === 'calendar' && (
              <div className="animate-fade-in">
                <div className="mb-8">
                  <h1 className="text-3xl font-black text-purple-600">Calendar</h1>
                  <p className="mt-1 text-sm text-purple-600">
                    Click a highlighted date to see events
                  </p>
                </div>
                <div className="max-w-xl">
                  <CalendarView events={allEvents} />
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── QR Modal ─────────────────────────────────────────── */}
      {qrEvent && user?.rollNo && (
        <QRModal event={qrEvent} rollNo={user.rollNo} onClose={() => setQrEvent(null)} />
      )}
    </div>
  );
}
