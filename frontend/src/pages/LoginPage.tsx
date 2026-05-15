import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Hash, ArrowRight, Loader2, Eye, EyeOff, GraduationCap, Briefcase, Zap, Calendar, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png';
import heroImage from '../assets/image.png';

type Tab = 'student' | 'faculty';
type View = 'login' | 'register';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  const [tab, setTab] = useState<Tab>(searchParams.get('tab') === 'faculty' ? 'faculty' : 'student');
  const [view, setView] = useState<View>(searchParams.get('register') ? 'register' : 'login');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // Login form
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  // Register form
  const [regForm, setRegForm] = useState({
    name: '', rollNo: '', email: '', password: '', department: '', phone: ''
  });

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'STUDENT' ? '/student/dashboard' : '/faculty/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // ── Student Login ──────────────────────────────────────────
  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.studentLogin(loginForm);
      if (res?.token && res?.student) {
        login(res.token, {
          id: res.student.id,
          name: res.student.name,
          email: res.student.email,
          role: 'STUDENT',
          rollNo: res.student.rollNo,
          department: res.student.department,
        });
        toast.success(`Welcome back, ${res.student.name}! 🎉`);
        navigate('/student/dashboard');
      } else {
        toast.error(res?.error || 'Invalid credentials');
      }
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Faculty Login ──────────────────────────────────────────
  const handleFacultyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await api.facultyLogin(loginForm);
      if (token && typeof token === 'string' && token !== 'Invalid credentials') {
        login(token, {
          id: 'faculty',
          name: loginForm.email.split('@')[0],
          email: loginForm.email,
          role: 'FACULTY',
        });
        toast.success('Faculty dashboard loaded!');
        navigate('/faculty/dashboard');
      } else {
        toast.error('Invalid credentials. Access denied.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Student Register ───────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.studentRegister({ ...regForm, rollNo: parseInt(regForm.rollNo) || 0 });
      toast.success('Account created! Please log in.');
      setView('login');
      setRegForm({ name: '', rollNo: '', email: '', password: '', department: '', phone: '' });
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'none' }}>

      {/* ── LEFT PANEL (event-themed illustration) ──────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{
          background: 'linear-gradient(160deg, #111827 0%, #1F2937 60%, #111827 100%)',
        }}
      >
        <div className="absolute inset-0 z-0 opacity-12">
          <img src={heroImage} alt="Hero" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#111827] via-transparent to-transparent" />
        </div>

        {/* Minimal Branding Overlay */}
        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-4 group">
            <div className="p-2 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 group-hover:bg-white/10 transition-all duration-500">
              <img src={logo} alt="Evenza Logo" className="w-12 h-12 object-contain" />
            </div>
            <span className="text-[#F9FAFB] text-4xl font-bold font-dancing tracking-wide">Evenza</span>
          </div>
          
          {/* <div className="space-y-4">
            <h1 className="text-6xl font-black text-[#F9FAFB] leading-tight">
              Ignite Your<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#FFA14A]">Campus Life</span>
            </h1>
            <p className="text-lg text-[#9CA3AF] max-w-sm leading-relaxed">
              The premier destination for campus events, competitions, and coordination. 
              Join the community today.
            </p>
          </div> */}
        </div>

        {/* <div className="relative z-10 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-[#7C3AED]">
          <span className="w-8 h-[1px] bg-[#7C3AED]"></span>
          <span>Department of Student Affairs</span>
        </div> */}

      </div>

      <div
        className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden"
        style={{ background: '#111827' }}
      >
        {/* Decorative Glowing Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-10 blur-[100px]"
             style={{ background: '#7C3AED' }} />
        <div className="absolute bottom-[20%] left-[-5%] w-[300px] h-[300px] rounded-full opacity-5 blur-[80px]"
             style={{ background: '#5B21B6' }} />

        <div className="w-full max-w-md relative z-10">
          {/* Glassmorphic Form Card */}
          <div className="glass-card rounded-[2rem] p-8 sm:p-10 border-white/5 shadow-2xl animate-slide-up-fade">
            
            {/* Mobile logo */}
            <div className="flex items-center gap-3 mb-10 lg:hidden justify-center text-center">
              <img src={logo} alt="Evenza Logo" className="w-10 h-10 object-contain" />
              <span className="text-[#F9FAFB] text-3xl font-bold font-dancing tracking-wide">Evenza</span>
            </div>

            {view === 'register' ? (
              /* ── REGISTER FORM ──────────────────────────────── */
              <>
                <div className="mb-10 text-center">
                  <h2 className="text-4xl font-black text-[#F9FAFB] mb-2 tracking-tight">Join Evenza</h2>
                  <p style={{ color: '#D1D5DB' }} className="text-sm font-medium">Create your student account</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="grid grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div className="col-span-2">
                      <label className="form-label mb-2 block">Full Name</label>
                      <div className="group relative">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-[#7C3AED]"
                              style={{ color: '#9CA3AF' }} />
                        <input type="text" required value={regForm.name}
                          onChange={e => setRegForm(p => ({ ...p, name: e.target.value }))}
                          className="input-field pl-12 bg-white/5 border-white/10 focus:bg-white/10 transition-all py-4" placeholder="Arjun Kumar" />
                      </div>
                    </div>

                    {/* Roll No */}
                    <div>
                      <label className="form-label mb-2 block">Roll Number</label>
                      <div className="group relative">
                        <Hash size={18} className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-[#7C3AED]"
                              style={{ color: '#9CA3AF' }} />
                        <input type="number" required value={regForm.rollNo}
                          onChange={e => setRegForm(p => ({ ...p, rollNo: e.target.value }))}
                          className="input-field pl-12 bg-white/5 border-white/10 focus:bg-white/10 transition-all py-4" placeholder="23001" />
                      </div>
                    </div>

                    {/* Department */}
                    <div>
                      <label className="form-label mb-2 block">Department</label>
                      <input type="text" required value={regForm.department}
                        onChange={e => setRegForm(p => ({ ...p, department: e.target.value }))}
                        className="input-field bg-white/5 border-white/10 focus:bg-white/10 transition-all py-4" placeholder="CSE" />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="form-label mb-2 block">Institution Email</label>
                    <div className="group relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-[#7C3AED]"
                            style={{ color: '#9CA3AF' }} />
                      <input type="email" required value={regForm.email}
                        onChange={e => setRegForm(p => ({ ...p, email: e.target.value }))}
                        className="input-field pl-12 bg-white/5 border-white/10 focus:bg-white/10 transition-all py-4" placeholder="student@ssn.edu.in" />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="form-label mb-2 block">Secure Password</label>
                    <div className="group relative">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-[#7C3AED]"
                            style={{ color: '#9CA3AF' }} />
                      <input type={showPass ? 'text' : 'password'} required value={regForm.password}
                        onChange={e => setRegForm(p => ({ ...p, password: e.target.value }))}
                        className="input-field pl-12 pr-12 bg-white/5 border-white/10 focus:bg-white/10 transition-all py-4" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPass(p => !p)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 hover:text-[#F9FAFB] transition-colors"
                        style={{ color: '#9CA3AF' }}>
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={loading}
                    className="btn-orange w-full py-4 mt-4 text-base font-bold rounded-2xl shadow-[0_8px_30px_rgb(124,58,237,0.3)] hover:shadow-[0_8px_40px_rgb(124,58,237,0.5)] transition-all">
                    {loading ? <Loader2 size={24} className="animate-spin" /> : <>Complete Registration <ArrowRight size={20} /></>}
                  </button>
                </form>

                <p className="mt-8 text-center text-sm" style={{ color: '#9CA3AF' }}>
                  Already part of Evenza?{' '}
                  <button onClick={() => setView('login')}
                    className="font-bold text-[#F9FAFB] hover:text-[#A78BFA] transition-colors underline underline-offset-4 decoration-[#7C3AED]/40 hover:decoration-[#7C3AED]">
                    Sign in here
                  </button>
                </p>
              </>
            ) : (
              /* ── LOGIN FORM ─────────────────────────────────── */
              <>
                <div className="mb-10 text-center">
                  <h2 className="text-4xl font-black text-[#F9FAFB] mb-2 tracking-tight">Welcome Back</h2>
                  <p style={{ color: '#D1D5DB' }} className="text-sm font-medium">Log in to your portal</p>
                </div>

                {/* Tabs */}
                <div className="flex rounded-2xl p-1.5 mb-10 bg-white/5 border border-white/10 backdrop-blur-sm">
                  <button
                    onClick={() => setTab('student')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${tab === 'student' ? 'text-[#F9FAFB] shadow-lg scale-[1.02]' : 'hover:bg-white/5 grayscale text-[#9CA3AF]'}`}
                    style={tab === 'student' ? { background: 'linear-gradient(135deg, #7C3AED, #5B21B6)' } : {}}>
                    <GraduationCap size={18} /> Student
                  </button>
                  <button
                    onClick={() => setTab('faculty')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${tab === 'faculty' ? 'text-[#F9FAFB] shadow-lg scale-[1.02]' : 'hover:bg-white/5 grayscale text-[#9CA3AF]'}`}
                    style={tab === 'faculty' ? { background: 'linear-gradient(135deg, #7C3AED, #5B21B6)' } : {}}>
                    <Briefcase size={18} /> Faculty
                  </button>
                </div>

                <form onSubmit={tab === 'student' ? handleStudentLogin : handleFacultyLogin} className="space-y-6">
                  {/* Email */}
                  <div>
                    <label className="form-label mb-2 block">Email Address</label>
                    <div className="group relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-[#7C3AED]"
                            style={{ color: '#9CA3AF' }} />
                      <input type="email" required value={loginForm.email}
                        onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))}
                        className="input-field pl-12 bg-white/5 border-white/10 focus:bg-white/10 transition-all py-4"
                        placeholder={tab === 'student' ? 'student@ssn.edu.in' : 'faculty@ssn.edu.in'} />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="form-label">Password</label>
                      <button type="button" className="text-[10px] uppercase font-bold tracking-widest text-[#9CA3AF] hover:text-[#7C3AED] transition-colors">Forgot?</button>
                    </div>
                    <div className="group relative">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-[#7C3AED]"
                            style={{ color: '#9CA3AF' }} />
                      <input type={showPass ? 'text' : 'password'} required value={loginForm.password}
                        onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                        className="input-field pl-12 pr-12 bg-white/5 border-white/10 focus:bg-white/10 transition-all py-4" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPass(p => !p)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 hover:text-[#F9FAFB] transition-colors"
                        style={{ color: '#9CA3AF' }}>
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={loading}
                    className="btn-orange w-full py-4 text-base font-bold shadow-[0_8px_30px_rgb(124,58,237,0.3)] hover:shadow-[0_8px_40px_rgb(124,58,237,0.5)] transition-all rounded-2xl flex items-center justify-center gap-3">
                    {loading ? <Loader2 size={24} className="animate-spin" /> : <>Sign In Now <ArrowRight size={20} /></>}
                  </button>
                </form>

                {/* Register link (student only) */}
                {tab === 'student' && (
                  <p className="mt-10 text-center text-sm" style={{ color: '#9CA3AF' }}>
                    New to Evenza?{' '}
                    <button onClick={() => setView('register')}
                      className="font-bold text-[#F9FAFB] hover:text-[#A78BFA] transition-colors underline underline-offset-4 decoration-[#7C3AED]/40 hover:decoration-[#7C3AED]">
                      Create institutional account
                    </button>
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
