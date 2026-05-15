import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Calendar, MapPin, Clock, Users, CheckCircle2,
  XCircle, Loader2, Zap, QrCode, X, AlertCircle, Hash,
  LayoutDashboard, CalendarDays, BarChart2, LogOut, Plus, BookmarkCheck, Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { Event } from '../types';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png';

// ── QR Modal ─────────────────────────────────────────────────────
const QRModal: React.FC<{ event: Event; rollNo: number; onClose: () => void }> = ({ event, rollNo, onClose }) => {
  const qrData = `EVENZA|${event.id}|${event.name}|ROLL:${rollNo}`;
  const qrUrl  = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrData)}&size=220x220&bgcolor=ffffff`;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
         style={{ background: 'rgba(17,24,39,0.9)', backdropFilter: 'blur(8px)' }}>
      <div className="rounded-2xl p-8 max-w-sm w-full text-center relative"
           style={{ background: 'linear-gradient(180deg,#1F2937,#111827)', border: '1px solid #374151' }}>
        <button onClick={onClose} className="absolute top-4 right-4" style={{ color: '#9CA3AF' }}>
          <X size={20} />
        </button>
        <Zap size={24} className="mx-auto mb-3" style={{ color: '#7C3AED' }} />
        <h3 className="text-[#F9FAFB] font-black text-lg mb-1">{event.name}</h3>
        <p className="text-xs mb-6" style={{ color: '#D1D5DB' }}>
          Check-in QR Code &bull; Roll No: {rollNo}
        </p>
        <div className="qr-container mx-auto mb-4">
          <img src={qrUrl} alt="QR Code" className="w-56 h-56 mx-auto" />
        </div>
        <p className="text-xs" style={{ color: '#9CA3AF' }}>Show this at the event venue for check-in</p>
      </div>
    </div>
  );
};

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent]           = useState<Event | null>(null);
  const [loading, setLoading]       = useState(true);
  const [actioning, setActioning]   = useState(false);
  const [isRegistered, setIsReg]    = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [showQR, setShowQR]         = useState(false);

  const fetchEvent = async () => {
    if (!id) return;
    try {
      const ev = await api.getEventById(id);
      if (ev) {
        setEvent(ev);
        if (user?.role === 'STUDENT' && user.rollNo) {
          setIsReg(ev.registeredStudents?.includes(user.rollNo) || false);
          setIsCancelled(ev.cancelledStudents?.includes(user.rollNo) || false);
        }
      }
    } catch { toast.error('Failed to load event details.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEvent(); }, [id, user]);

  const handleRegister = async () => {
    if (!id || !user?.rollNo) return;
    setActioning(true);
    try {
      const res = await api.registerForEvent(id, user.rollNo);
      toast.success(res?.message || 'Registered! 🎉');
      fetchEvent(); // re-fetch to update seat count
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally { setActioning(false); }
  };

  const handleCancel = async () => {
    if (!id || !user?.rollNo) return;
    setActioning(true);
    try {
      const res = await api.cancelRegistration(id, user.rollNo);
      toast.success(res?.message || 'Registration cancelled');
      fetchEvent();
    } catch (err: any) {
      toast.error(err.message || 'Cancel failed');
    } finally { setActioning(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={48} className="animate-spin" style={{ color: '#7C3AED' }} />
    </div>
  );

  if (!event) return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center">
        <AlertCircle size={48} className="mx-auto mb-4" style={{ color: '#9CA3AF' }} />
        <h2 className="text-[#F9FAFB] font-black text-2xl mb-2">Event Not Found</h2>
        <button onClick={() => navigate(-1)}
          className="btn-orange px-6 py-2.5 text-sm rounded-xl mt-4 inline-flex text-[#F9FAFB]">
          Go Back
        </button>
      </div>
    </div>
  );

  const filled    = event.registeredStudents?.length || 0;
  const total     = event.totalSeats;
  const available = event.availableSeats;
  const pct       = total > 0 ? Math.round((filled / total) * 100) : 0;
  const housefull = total > 0 && available <= 0;

  const dashboardPath = user?.role === 'STUDENT' ? '/student/dashboard' : '/faculty/dashboard';

  const FACULTY_NAV = [
    { id: 'home',      label: 'Home',            icon: LayoutDashboard },
    { id: 'launch',    label: 'Launch Event',     icon: Plus },
    { id: 'events',    label: 'Events',           icon: CalendarDays },
    { id: 'analytics', label: 'Analytics',        icon: BarChart2 },
  ];

  const STUDENT_NAV = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'my-events', label: 'My Events', icon: BookmarkCheck },
    { id: 'cancelled', label: 'Cancelled Events', icon: XCircle },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  ];

  const navItems = user?.role === 'FACULTY' ? FACULTY_NAV : STUDENT_NAV;

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
            <p className="text-[10px] uppercase font-bold tracking-widest mt-0.5" style={{ color: '#9CA3AF' }}>
              {user?.role === 'FACULTY' ? 'Faculty Portal' : 'Student Portal'}
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1">
          <p className="section-title">Navigation</p>
          {navItems.map(({ id, label, icon: Icon }) => (
            <Link key={id} to={dashboardPath} state={{ section: id }}
              className="nav-item w-full text-left no-underline flex items-center gap-3">
              <Icon size={18} /> {label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto px-3 py-4 border-t" style={{ borderColor: '#374151' }}>
          {/* User info */}
          <div className="px-2 py-3 mb-2 rounded-xl" style={{ background: 'rgba(124, 58, 237, 0.05)', border: '1px solid rgba(255,107,0,0.1)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm"
                   style={{ background: 'linear-gradient(135deg, #7C3AED, #E05E00)', color: '#fff' }}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-[#F9FAFB] font-bold text-sm truncate">{user?.name || 'User'}</p>
                {user?.role === 'FACULTY' ? (
                  <span className="badge badge-orange text-[10px] px-2 py-0.5 mt-0.5 inline-flex">STAFF</span>
                ) : (
                  <p className="text-[10px] font-medium truncate" style={{ color: '#D1D5DB' }}>Roll: {user?.rollNo}</p>
                )}
              </div>
            </div>
          </div>

          <button onClick={() => { logout(); navigate('/'); }}
            className="nav-item w-full text-left"
            style={{ color: 'rgba(239,68,68,0.7)' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <main className="main-content flex-1 p-8 overflow-y-auto">
        {/* Back button */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-8 text-sm font-semibold transition-colors text-[#F9FAFB]"
          style={{ color: '#F9FAFB' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#A78BFA'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#F9FAFB'}>
          <ArrowLeft size={18} /> Back
        </button>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── LEFT (event details) ──────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header card */}
            <div className="glass-card rounded-2xl p-8">
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="badge badge-orange"><Zap size={10} /> Campus Event</span>
                {housefull
                  ? <span className="badge badge-red"><AlertCircle size={10} /> Housefull</span>
                  : isRegistered
                  ? <span className="badge badge-green"><CheckCircle2 size={10} /> Registered</span>
                  : <span className="badge badge-blue">Open for Registration</span>
                }
              </div>

              <h1 className="text-3xl font-black text-[#F9FAFB] mb-6 leading-tight">
                {event.name}
              </h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: Calendar, label: 'Date', value: new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
                  { icon: Clock,    label: 'Time', value: event.time || 'TBA' },
                  { icon: MapPin,   label: 'Venue', value: event.venue },
                  { icon: Users,    label: 'Seats', value: total > 0 ? `${available} of ${total} available` : 'Unlimited' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 rounded-xl p-4 text-[#F9FAFB]"
                       style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #374151' }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                         style={{ background: 'rgba(124, 58, 237, 0.15)' }}>
                      <Icon size={18} style={{ color: '#A78BFA' }} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-0.5"
                         style={{ color: '#D1D5DB' }}>{label}</p>
                      <p className="text-[#F9FAFB] font-semibold text-sm">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-[#F9FAFB] font-black mb-4">About This Event</h2>
              <p className="text-sm leading-relaxed whitespace-pre-wrap"
                 style={{ color: '#D1D5DB' }}>
                {event.description}
              </p>
            </div>

            {/* Faculty: registered students table */}
            {user?.role === 'FACULTY' && (
              <div className="glass-card rounded-2xl p-8">
                <h2 className="text-[#F9FAFB] font-black mb-2">Registered Students</h2>
                <p className="text-xs mb-5" style={{ color: '#D1D5DB' }}>
                  {filled} student{filled !== 1 ? 's' : ''} enrolled
                </p>

                {filled > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ borderBottom: '1px solid #374151' }}>
                          {['#', 'Roll Number', 'Status'].map(h => (
                            <th key={h} className="text-left pb-3 pr-4 text-xs font-bold uppercase tracking-widest"
                                style={{ color: '#9CA3AF' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {event.registeredStudents.map((rollNo, i) => (
                          <tr key={rollNo} style={{ borderBottom: '1px solid #374151' }}>
                            <td className="py-3 pr-4 text-xs" style={{ color: '#9CA3AF' }}>{i + 1}</td>
                            <td className="py-3 pr-4">
                              <span className="flex items-center gap-2 font-bold text-[#F9FAFB]">
                                <Hash size={13} style={{ color: '#A78BFA' }} />{rollNo}
                              </span>
                            </td>
                            <td className="py-3">
                              <span className="badge badge-green"><CheckCircle2 size={10} /> Registered</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users size={32} className="mx-auto mb-2" style={{ color: '#9CA3AF' }} />
                    <p className="text-sm" style={{ color: '#9CA3AF' }}>No students enrolled yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT (action panel) ────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              {/* Seat fill card */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-[#F9FAFB] font-black mb-4">Enrollment</h3>

                {total > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-2">
                      <span style={{ color: '#9CA3AF' }}>
                        <Users size={11} className="inline mr-1" />{filled} registered
                      </span>
                      <span style={{ color: '#9CA3AF' }}>{pct}% filled</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div className="h-full rounded-full transition-all"
                           style={{
                             width: `${pct}%`,
                             background: pct >= 90 ? '#EF4444' : pct >= 60 ? '#F59E0B' : '#10B981'
                           }} />
                    </div>
                    <p className="text-xs mt-2 font-bold"
                       style={{ color: housefull ? '#F87171' : '#34D399' }}>
                      {housefull ? '⚠ Housefull!' : `${available} seats remaining`}
                    </p>
                  </div>
                )}

                {/* Student actions */}
                {user?.role === 'STUDENT' && (
                  <div className="space-y-3">
                    {isRegistered ? (
                      <>
                        <div className="rounded-xl p-3 text-center text-sm font-bold"
                             style={{ background: 'rgba(16,185,129,0.12)', color: '#34D399', border: '1px solid rgba(16,185,129,0.2)' }}>
                          <CheckCircle2 size={16} className="inline mr-2" />You're registered!
                        </div>
                        <button onClick={() => setShowQR(true)}
                          className="btn-ghost w-full py-3 text-sm rounded-xl">
                          <QrCode size={16} /> View QR Code
                        </button>
                        <button onClick={handleCancel} disabled={actioning}
                          className="w-full py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                          style={{ background: 'rgba(239,68,68,0.12)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                          {actioning ? <Loader2 size={16} className="animate-spin" />
                            : <><XCircle size={16} /> Cancel Registration</>}
                        </button>
                      </>
                    ) : isCancelled ? (
                      <>
                        <div className="rounded-xl p-3 text-center text-xs font-semibold"
                             style={{ background: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.15)' }}>
                          You previously cancelled this event.
                        </div>
                        <button onClick={handleRegister} disabled={actioning || housefull}
                          className="btn-orange w-full py-3.5 text-sm rounded-xl">
                          {actioning ? <Loader2 size={16} className="animate-spin" />
                            : housefull ? 'Housefull' : 'Re-Register'}
                        </button>
                      </>
                    ) : (
                      <button onClick={handleRegister} disabled={actioning || housefull}
                        className="btn-orange w-full py-3.5 text-sm rounded-xl">
                        {actioning ? <Loader2 size={16} className="animate-spin" />
                          : housefull ? 'Housefull — No Seats' : 'Register for Event'}
                      </button>
                    )}
                  </div>
                )}

                {/* Faculty info panel */}
                {user?.role === 'FACULTY' && (
                  <div className="rounded-xl p-4 text-center"
                       style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #374151' }}>
                    <p className="text-xs font-black uppercase tracking-widest mb-1"
                       style={{ color: '#D1D5DB' }}>Faculty View</p>
                    <p className="text-3xl font-black text-[#F9FAFB]">{filled}</p>
                    <p className="text-xs mt-1" style={{ color: '#D1D5DB' }}>Total Registrations</p>
                  </div>
                )}
              </div>

              {/* Not logged in */}
              {!user && (
                <div className="glass-card rounded-2xl p-6 text-center">
                  <p className="text-[#F9FAFB] font-bold mb-3">Sign in to register</p>
                  <Link to="/" className="btn-orange w-full py-3 text-sm rounded-xl inline-flex">
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* QR Modal */}
      {showQR && event && user?.rollNo && (
        <QRModal event={event} rollNo={user.rollNo} onClose={() => setShowQR(false)} />
      )}
    </div>
  );
}
