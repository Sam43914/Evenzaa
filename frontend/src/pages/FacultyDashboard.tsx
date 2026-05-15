import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, Plus, CalendarDays, BarChart2, LogOut, Zap, Loader2,
  Users, Trash2, Pencil, ChevronRight, X,
  MapPin, Clock, Hash, AlignLeft, Save, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { api } from '../api';
import { Event } from '../types';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png';

type Section = 'home' | 'launch' | 'events' | 'analytics';

const NAV = [
  { id: 'home',      label: 'Home',            icon: LayoutDashboard },
  { id: 'launch',    label: 'Launch Event',     icon: Plus },
  { id: 'events',    label: 'Events',           icon: CalendarDays },
  { id: 'analytics', label: 'Analytics',        icon: BarChart2 },
];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function isToday(d: string) {
  const t = new Date(), dt = new Date(d);
  return t.getFullYear() === dt.getFullYear() && t.getMonth() === dt.getMonth() && t.getDate() === dt.getDate();
}

// ── Delete Confirm Modal ─────────────────────────────────────────
const DeleteModal: React.FC<{ name: string; onConfirm: () => void; onClose: () => void }> = ({ name, onConfirm, onClose }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
       style={{ background: 'rgba(17,24,39,0.9)', backdropFilter: 'blur(8px)' }}>
    <div className="rounded-2xl p-8 max-w-sm w-full text-center"
         style={{ background: 'linear-gradient(180deg,#1F2937,#111827)', border: '1px solid #374151' }}>
      <AlertCircle size={36} className="mx-auto mb-4" style={{ color: '#EF4444' }} />
      <h3 className="text-[#F9FAFB] font-black text-lg mb-2">Delete Event?</h3>
      <p className="text-sm mb-6" style={{ color: '#F9FAFB' }}>
        Are you sure you want to delete "<strong className="text-[#F9FAFB]">{name}</strong>"? This cannot be undone.
      </p>
      <div className="flex gap-3">
        <button onClick={onClose} className="btn-ghost flex-1 py-2.5 text-sm rounded-xl">Cancel</button>
        <button onClick={onConfirm}
          className="flex-1 py-2.5 text-sm font-bold rounded-xl transition-all"
          style={{ background: '#EF4444', color: '#fff' }}>
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ── Edit Modal ───────────────────────────────────────────────────
const EditModal: React.FC<{ event: Event; onSave: (data: any) => void; onClose: () => void; saving: boolean }> = ({ event, onSave, onClose, saving }) => {
  const [form, setForm] = useState({
    name: event.name, venue: event.venue, date: event.date, time: event.time || '',
    description: event.description, totalSeats: String(event.totalSeats || ''),
  });

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto"
         style={{ background: 'rgba(17,24,39,0.9)', backdropFilter: 'blur(8px)' }}>
      <div className="rounded-2xl p-8 max-w-lg w-full my-4"
           style={{ background: 'linear-gradient(180deg,#1F2937,#111827)', border: '1px solid #374151' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[#F9FAFB] font-black text-lg">Edit Event</h3>
          <button onClick={onClose} style={{ color: '#F9FAFB' }}><X size={20} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="form-label">Event Name</label>
            <input className="input-field" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Date</label>
              <input type="date" className="input-field" value={form.date}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Time</label>
              <input className="input-field" value={form.time} placeholder="09:00 AM"
                onChange={e => setForm(p => ({ ...p, time: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="form-label">Venue</label>
            <input className="input-field" value={form.venue}
              onChange={e => setForm(p => ({ ...p, venue: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Total Seats</label>
            <input type="number" className="input-field" value={form.totalSeats}
              onChange={e => setForm(p => ({ ...p, totalSeats: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea className="input-field resize-none" rows={3} value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-ghost flex-1 py-2.5 text-sm rounded-xl">Cancel</button>
          <button onClick={() => onSave(form)} disabled={saving}
            className="btn-orange flex-1 py-2.5 text-sm rounded-xl">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <><Save size={14} /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Simple Bar Chart ─────────────────────────────────────────────
const BarChart: React.FC<{ data: { label: string; value: number; color?: string }[]; max: number }> = ({ data, max }) => (
  <div className="space-y-3">
    {data.map(({ label, value, color = '#7C3AED' }) => (
      <div key={label}>
        <div className="flex justify-between text-xs mb-1.5">
          <span style={{ color: '#F9FAFB' }}>{label}</span>
          <span className="font-bold text-[#F9FAFB]">{value}</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-full rounded-full transition-all duration-700 chart-bar"
               style={{ width: max > 0 ? `${Math.round((value / max) * 100)}%` : '0%', background: color }} />
        </div>
      </div>
    ))}
  </div>
);

// ── MAIN COMPONENT ───────────────────────────────────────────────
export default function FacultyDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const location = useLocation();
  const [section, setSection]   = useState<Section>((location.state as any)?.section || 'home');
  const [events, setEvents]     = useState<Event[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);
  const [editTarget, setEditTarget]     = useState<Event | null>(null);

  // ── Launch form state ─────────────────────────────────────────
  const [form, setForm] = useState({
    name: '', date: '', time: '', venue: '', description: '', totalSeats: ''
  });
  const [template, setTemplate] = useState<typeof form | null>(null);

  // ── Fetch events ──────────────────────────────────────────────
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getAllEvents();
      setEvents(data || []);
    } catch { toast.error('Failed to load events.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // ── Create event ──────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createEvent({
        ...form,
        totalSeats: parseInt(form.totalSeats) || 0,
        availableSeats: parseInt(form.totalSeats) || 0,
        facultyId: user?.id,
      });
      toast.success('Event launched successfully! 🚀');
      setForm({ name: '', date: '', time: '', venue: '', description: '', totalSeats: '' });
      fetchEvents();
      setSection('events');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create event');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete event ──────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await api.deleteEvent(deleteTarget.id);
      toast.success('Event deleted.');
      setDeleteTarget(null);
      fetchEvents();
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
    } finally {
      setSaving(false);
    }
  };

  // ── Update event ──────────────────────────────────────────────
  const handleUpdate = async (data: any) => {
    if (!editTarget) return;
    setSaving(true);
    try {
      await api.updateEvent(editTarget.id, {
        ...data,
        totalSeats: parseInt(data.totalSeats) || editTarget.totalSeats,
      });
      toast.success('Event updated!');
      setEditTarget(null);
      fetchEvents();
    } catch (err: any) {
      toast.error(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const todayEvents = events.filter(e => isToday(e.date));
  const totalRegistrations = events.reduce((s, e) => s + (e.registeredStudents?.length || 0), 0);
  const mostPopular = [...events].sort((a, b) => (b.registeredStudents?.length || 0) - (a.registeredStudents?.length || 0));

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
            <p className="text-[10px] uppercase font-bold tracking-widest mt-0.5" style={{ color: '#9CA3AF' }}>Faculty Portal</p>
          </div>
        </div>


        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1">
          <p className="section-title">Management</p>
          {NAV.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setSection(id as Section)}
              className={`nav-item w-full text-left ${section === id ? 'active' : ''}`}>
              <Icon size={18} /> {label}
            </button>
          ))}
        </nav>

        <div className="mt-auto px-3 py-4 border-t" style={{ borderColor: '#374151' }}>
          {/* Moved User info here */}
          <div className="px-2 py-3 mb-2 rounded-xl" style={{ background: 'rgba(124, 58, 237, 0.05)', border: '1px solid rgba(255,107,0,0.1)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm"
                   style={{ background: 'linear-gradient(135deg, #7C3AED, #E05E00)', color: '#fff' }}>
                {user?.name?.charAt(0).toUpperCase() || 'F'}
              </div>
              <div className="min-w-0">
                <p className="text-[#F9FAFB] font-bold text-sm truncate">{user?.name || 'Faculty'}</p>
                <span className="badge badge-orange text-[10px] px-2 py-0.5 mt-0.5 inline-flex">STAFF</span>
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
        {loading && section !== 'launch' ? (
          <div className="loading-overlay">
            <Loader2 size={40} className="animate-spin" style={{ color: '#7C3AED' }} />
          </div>
        ) : (
          <>
            {/* ── HOME ──────────────────────────────────────── */}
            {section === 'home' && (
              <div className="animate-fade-in">
                <div className="mb-8">
                  <h1 className="text-3xl font-black text-[#7C3AED]">
                    Faculty Dashboard <span>✦</span>
                  </h1>
                  <p className="mt-1 text-sm text-purple-600">
                    Manage events, track registrations, and view analytics
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  {[
                    { label: 'Total Events',      value: events.length,          icon: CalendarDays, color: '#7C3AED' },
                    { label: 'Total Registrations', value: totalRegistrations,   icon: Users,        color: '#10B981' },
                    { label: 'Today\'s Events',   value: todayEvents.length,     icon: Zap,          color: '#F59E0B' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="stat-card flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                           style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
                        <Icon size={22} style={{ color }} />
                      </div>
                      <div>
                        <p className="text-3xl font-black text-[#7C3AED]">{value}</p>
                        <p className="text-xs font-semibold text-[#A78BFA]">{label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Today's events */}
                {todayEvents.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-5 rounded-full" style={{ background: '#7C3AED' }} />
                      <h2 className="text-[#F9FAFB] font-black">Today's Events</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {todayEvents.map(ev => (
                        <div key={ev.id} className="event-card">
                          <h3 className="text-[#F9FAFB] font-black mb-1">{ev.name}</h3>
                          <div className="flex gap-4 text-xs mb-3" style={{ color: '#F9FAFB' }}>
                            <span><MapPin size={11} className="inline mr-1" />{ev.venue}</span>
                            {ev.time && <span><Clock size={11} className="inline mr-1" />{ev.time}</span>}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="badge badge-orange">
                              <Users size={10} /> {ev.registeredStudents?.length || 0} registered
                            </span>
                            <Link to={`/event/${ev.id}`} className="text-xs font-bold flex items-center gap-1"
                                  style={{ color: '#A78BFA' }}>
                              View details <ChevronRight size={12} />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent events */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-5 rounded-full" style={{ background: '#7C3AED' }} />
                      <h2 className="text-[#7C3AED] font-black">All Events</h2>
                    </div>
                    <button onClick={() => setSection('events')}
                      className="text-xs font-bold flex items-center gap-1" style={{ color: '#A78BFA' }}>
                      Manage <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {events.slice(0, 4).map(ev => (
                      <div key={ev.id} className="event-card">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-[#F9FAFB] font-black text-sm">{ev.name}</h3>
                          <span className="badge badge-blue text-[10px]">{formatDate(ev.date)}</span>
                        </div>
                        <p className="text-xs mb-3" style={{ color: '#F9FAFB' }}>{ev.venue}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-xs" style={{ color: '#D1D5DB' }}>
                            <Users size={11} className="inline mr-1" />
                            {ev.registeredStudents?.length || 0} / {ev.totalSeats || '∞'} seats
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── LAUNCH EVENT ──────────────────────────────── */}
            {section === 'launch' && (
              <div className="animate-fade-in max-w-2xl">
                <div className="mb-8">
                  <h1 className="text-3xl font-black text-purple-600">Launch New Event</h1>
                  <p className="mt-1 text-sm text-purple-600">
                    Fill in the details to create a new event
                  </p>
                </div>

                {/* Template restore */}
                {template && (
                  <div className="glass-card rounded-xl p-4 mb-5 flex items-center justify-between">
                    <span className="text-sm text-purple-600 font-medium">📋 Template saved. Restore?</span>
                    <div className="flex gap-2">
                      <button onClick={() => setForm(template)}
                        className="btn-orange px-4 py-1.5 text-xs rounded-lg">
                        Restore
                      </button>
                      <button onClick={() => setTemplate(null)}
                        className="btn-ghost px-3 py-1.5 text-xs rounded-lg">
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}

                <div className="glass-card rounded-2xl p-8">
                  <form onSubmit={handleCreate} className="space-y-5">
                    {/* Event name */}
                    <div>
                      <label className="form-label">Event Name *</label>
                      <div className="relative">
                        <Zap size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-600" />
                        <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                          className="input-field pl-10" placeholder="Annual Tech Symposium" />
                      </div>
                    </div>

                    {/* Date + Time */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Date *</label>
                        <input type="date" required value={form.date}
                          onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                          className="input-field" />
                      </div>
                      <div>
                        <label className="form-label">Time</label>
                        <div className="relative">
                          <Clock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-600" />
                          <input value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
                            className="input-field pl-10" placeholder="09:00 AM" />
                        </div>
                      </div>
                    </div>

                    {/* Venue + Seats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Venue *</label>
                        <div className="relative">
                          <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-600" />
                          <input required value={form.venue} onChange={e => setForm(p => ({ ...p, venue: e.target.value }))}
                            className="input-field pl-10" placeholder="Main Auditorium" />
                        </div>
                      </div>
                      <div>
                        <label className="form-label">Total Seats</label>
                        <div className="relative">
                          <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-600" />
                          <input type="number" min="0" value={form.totalSeats}
                            onChange={e => setForm(p => ({ ...p, totalSeats: e.target.value }))}
                            className="input-field pl-10" placeholder="100 (0 = unlimited)" />
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="form-label">Description *</label>
                      <div className="relative">
                        <AlignLeft size={15} className="absolute left-3.5 top-3.5 text-purple-600" />
                        <textarea required rows={4} value={form.description}
                          onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                          className="input-field pl-10 resize-none"
                          placeholder="Provide a comprehensive overview of the event..." />
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 pt-2">
                      <button type="submit" disabled={saving}
                        className="btn-orange flex-1 py-3.5 text-sm rounded-xl">
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <><Zap size={16} /> Launch Event</>}
                      </button>
                      <button type="button"
                        onClick={() => { setTemplate(form); toast.success('Template saved!'); }}
                        className="btn-ghost px-5 py-3.5 text-sm rounded-xl">
                        <Save size={16} />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ── EVENTS ────────────────────────────────────── */}
            {section === 'events' && (
              <div className="animate-fade-in">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-black text-purple-600">Manage Events</h1>
                    <p className="mt-1 text-sm text-purple-600">
                      {events.length} events — edit, delete or view registrations
                    </p>
                  </div>
                  <button onClick={() => setSection('launch')}
                    className="btn-orange px-5 py-2.5 text-sm rounded-xl">
                    <Plus size={16} /> New Event
                  </button>
                </div>

                <div className="space-y-4">
                  {events.map(ev => {
                    const pct = ev.totalSeats > 0
                      ? Math.round(((ev.registeredStudents?.length || 0) / ev.totalSeats) * 100) : 0;

                    return (
                      <div key={ev.id} className="event-card">
                        <div className="flex items-start gap-4">
                          {/* Date box */}
                          <div className="shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center text-center"
                               style={{ background: 'rgba(124, 58, 237, 0.15)', border: '1px solid rgba(124, 58, 237, 0.25)' }}>
                            <span className="text-[10px] font-bold uppercase leading-none text-purple-600">
                              {new Date(ev.date).toLocaleDateString('en-IN', { month: 'short' })}
                            </span>
                            <span className="text-xl font-black text-purple-600 leading-none">
                              {new Date(ev.date).getDate()}
                            </span>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-[#F9FAFB] font-black text-base truncate">{ev.name}</h3>
                              {isToday(ev.date) && <span className="badge badge-orange text-[10px]">TODAY</span>}
                            </div>
                            <div className="flex flex-wrap gap-3 text-xs mb-3 text-purple-600">
                              <span><MapPin size={11} className="inline mr-1" />{ev.venue}</span>
                              {ev.time && <span><Clock size={11} className="inline mr-1" />{ev.time}</span>}
                              <span><Users size={11} className="inline mr-1" />
                                {ev.registeredStudents?.length || 0} / {ev.totalSeats || '∞'} seats
                              </span>
                            </div>

                            {/* Seat fill bar */}
                            {ev.totalSeats > 0 && (
                              <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                <div className="h-full rounded-full"
                                     style={{
                                       width: `${pct}%`,
                                       background: pct >= 90 ? '#EF4444' : pct >= 60 ? '#F59E0B' : '#7C3AED'
                                     }} />
                              </div>
                            )}

                            <p className="text-xs line-clamp-1" style={{ color: '#D1D5DB' }}>
                              {ev.description}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 shrink-0 ml-2">
                            <Link to={`/event/${ev.id}`}
                              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all text-purple-600"
                              style={{ background: 'rgba(255,255,255,0.06)' }}
                              title="View Details">
                              <ChevronRight size={16} />
                            </Link>
                            <button onClick={() => setEditTarget(ev)}
                              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all text-purple-600"
                              style={{ background: 'rgba(59,130,246,0.15)'}}
                              title="Edit">
                              <Pencil size={15} />
                            </button>
                            <button onClick={() => setDeleteTarget(ev)}
                              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                              style={{ background: 'rgba(239,68,68,0.15)', color: '#F87171' }}
                              title="Delete">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {events.length === 0 && (
                    <div className="glass-card rounded-2xl p-12 text-center">
                      <CalendarDays size={40} className="mx-auto mb-3 text-purple-600" />
                      <p className="font-bold text-[#F9FAFB] mb-1">No events yet</p>
                      <button onClick={() => setSection('launch')}
                        className="btn-orange mt-4 px-6 py-2.5 text-sm rounded-lg inline-flex">
                        <Plus size={16} /> Launch First Event
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── ANALYTICS ─────────────────────────────────── */}
            {section === 'analytics' && (
              <div className="animate-fade-in">
                <div className="mb-8">
                  <h1 className="text-3xl font-black text-purple-600">Analytics</h1>
                  <p className="mt-1 text-sm text-purple-600">
                    Event performance and registration insights
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Event Popularity Chart */}
                  <div className="glass-card rounded-2xl p-6">
                    <h3 className="text-[#F9FAFB] font-black mb-1">Event Popularity</h3>
                    <p className="text-xs mb-5 text-purple-600">
                      Registrations per event
                    </p>
                    <BarChart
                      data={mostPopular.slice(0, 6).map(e => ({
                        label: e.name.length > 20 ? e.name.slice(0, 20) + '…' : e.name,
                        value: e.registeredStudents?.length || 0,
                        color: '#7C3AED',
                      }))}
                      max={Math.max(...events.map(e => e.registeredStudents?.length || 0), 1)}
                    />
                  </div>

                  {/* Seat fill ratio */}
                  <div className="glass-card rounded-2xl p-6">
                    <h3 className="text-[#F9FAFB] font-black mb-1">Seat Utilisation</h3>
                    <p className="text-xs mb-5 text-purple-600">
                      % of seats filled per event
                    </p>
                    <BarChart
                      data={events.filter(e => e.totalSeats > 0).slice(0, 6).map(e => ({
                        label: e.name.length > 20 ? e.name.slice(0, 20) + '…' : e.name,
                        value: Math.round(((e.registeredStudents?.length || 0) / e.totalSeats) * 100),
                        color: '#10B981',
                      }))}
                      max={100}
                    />
                  </div>
                </div>

                {/* Summary table */}
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[#F9FAFB] font-black">Registration Report</h3>
                    <button
                      onClick={() => {
                        const rows = [
                          ['Event', 'Date', 'Venue', 'Total Seats', 'Registered', 'Available', 'Fill %'],
                          ...events.map(e => [
                            e.name, e.date, e.venue,
                            e.totalSeats || 'Unlimited',
                            e.registeredStudents?.length || 0,
                            e.availableSeats,
                            e.totalSeats > 0 ? Math.round(((e.registeredStudents?.length || 0) / e.totalSeats) * 100) + '%' : 'N/A',
                          ])
                        ];
                        const csv = rows.map(r => r.join(',')).join('\n');
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url; a.download = 'evenza_report.csv'; a.click();
                        toast.success('CSV downloaded!');
                      }}
                      className="btn-ghost px-4 py-2 text-xs rounded-lg">
                      ↓ Export CSV
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ borderBottom: '1px solid #374151' }}>
                          {['Event', 'Date', 'Venue', 'Registered', 'Available', 'Fill %'].map(h => (
                            <th key={h} className="text-left pb-3 pr-4 text-xs font-bold uppercase tracking-widest"
                                style={{ color: '#9CA3AF' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {events.map(ev => {
                          const reg = ev.registeredStudents?.length || 0;
                          const pct = ev.totalSeats > 0 ? Math.round((reg / ev.totalSeats) * 100) : null;
                          return (
                            <tr key={ev.id} style={{ borderBottom: '1px solid #374151' }}>
                              <td className="py-3 pr-4 text-[#F9FAFB] font-semibold">{ev.name}</td>
                              <td className="py-3 pr-4 text-xs" style={{ color: '#F9FAFB' }}>{formatDate(ev.date)}</td>
                              <td className="py-3 pr-4 text-xs" style={{ color: '#F9FAFB' }}>{ev.venue}</td>
                              <td className="py-3 pr-4">
                                <span className="badge badge-orange">{reg}</span>
                              </td>
                              <td className="py-3 pr-4">
                                <span className={`badge ${ev.availableSeats === 0 ? 'badge-red' : 'badge-green'}`}>
                                  {ev.totalSeats > 0 ? ev.availableSeats : '∞'}
                                </span>
                              </td>
                              <td className="py-3">
                                {pct !== null ? (
                                  <span className={`badge ${pct >= 90 ? 'badge-red' : pct >= 60 ? 'badge-orange' : 'badge-green'}`}>
                                    {pct}%
                                  </span>
                                ) : <span className="text-xs" style={{ color: '#9CA3AF' }}>N/A</span>}
                              </td>
                            </tr>
                          );
                        })}
                        {events.length === 0 && (
                          <tr><td colSpan={6} className="py-8 text-center text-sm"
                                  style={{ color: '#9CA3AF' }}>No data yet</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Modals ────────────────────────────────────────────── */}
      {deleteTarget && (
        <DeleteModal name={deleteTarget.name} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />
      )}
      {editTarget && (
        <EditModal event={editTarget} onSave={handleUpdate} onClose={() => setEditTarget(null)} saving={saving} />
      )}
    </div>
  );
}
