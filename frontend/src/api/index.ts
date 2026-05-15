const BASE = {
  faculty:  'https://evenzaa-production.up.railway.app',
  student:  'https://evenzaa-production.up.railway.app',
  events:   'https://evenzaa-production.up.railway.app',
};

// ─── Generic fetch helper ────────────────────────────────────────
async function request(url: string, options: RequestInit = {}) {
  const auth = JSON.parse(localStorage.getItem('evenza_auth') || '{}');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(auth.token ? { 'Authorization': `Bearer ${auth.token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || res.statusText);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res.text();
}

// ─── API Object ──────────────────────────────────────────────────
export const api = {

  // ── Faculty Auth ──────────────────────────────────────────────
  facultyLogin: (data: { email: string; password: string }) =>
    request(`${BASE.faculty}/faculty/login`, { method: 'POST', body: JSON.stringify(data) }),

  facultyRegister: (data: any) =>
    request(`${BASE.faculty}/faculty/register`, { method: 'POST', body: JSON.stringify(data) }),

  // ── Student Auth ──────────────────────────────────────────────
  studentLogin: (data: { email: string; password: string }) =>
    request(`${BASE.student}/student/login`, { method: 'POST', body: JSON.stringify(data) }),

  studentRegister: (data: any) =>
    request(`${BASE.student}/student/register`, { method: 'POST', body: JSON.stringify(data) }),

  // ── Events ────────────────────────────────────────────────────
  getAllEvents: (): Promise<any[]> =>
    request(`${BASE.events}/events/`),

  getEventById: (id: string) =>
    request(`${BASE.events}/events/${id}`),

  createEvent: (data: any) =>
    request(`${BASE.events}/events/`, { method: 'POST', body: JSON.stringify(data) }),

  updateEvent: (id: string, data: any) =>
    request(`${BASE.events}/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteEvent: (id: string) =>
    request(`${BASE.events}/events/${id}`, { method: 'DELETE' }),

  // ── Registrations ─────────────────────────────────────────────
  studentRegisteredEvents: (rollNo: number): Promise<any[]> =>
    request(`${BASE.events}/events/student/${rollNo}`),

  studentCancelledEvents: (rollNo: number): Promise<any[]> =>
    request(`${BASE.events}/events/cancelled/${rollNo}`),

  registerForEvent: (eventId: string, rollNo: number) =>
    request(`${BASE.events}/events/register/${eventId}/${rollNo}`, { method: 'POST' }),

  cancelRegistration: (eventId: string, rollNo: number) =>
    request(`${BASE.events}/events/cancel/${eventId}/${rollNo}`, { method: 'POST' }),

  // ── Alias kept for backward-compat ───────────────────────────
  studentRegisterForEvent: (eventId: string, rollNo: number) =>
    request(`${BASE.events}/events/register/${eventId}/${rollNo}`, { method: 'POST' }),

  // ── Calendar ──────────────────────────────────────────────────
  getEventsByMonth: (month: number): Promise<any[]> =>
    request(`${BASE.events}/events/month/${month}`),
};
