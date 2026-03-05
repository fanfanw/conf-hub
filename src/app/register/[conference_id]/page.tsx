'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createRegistration, getConferenceById, type Conference } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';

export default function RegisterPage() {
  const { conference_id } = useParams<{ conference_id: string }>();
  const router = useRouter();

  const [conference, setConference] = useState<Conference | null>(null);
  const [form, setForm] = useState({ name: '', email: '', organization: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getConferenceById(conference_id)
      .then(setConference)
      .catch(() => router.push('/conferences'));
  }, [conference_id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createRegistration({ conference_id, ...form });
      setSuccess(true);
    } catch (err: any) {
      if (err?.code === '23505') {
        setError('This email is already registered for this conference.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="scale-in" style={{ textAlign: 'center', maxWidth: '440px' }}>
            <div style={{ marginBottom: '24px' }}>
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{ display: 'block', margin: '0 auto' }}>
                <circle cx="40" cy="40" r="36" stroke="rgba(52,211,153,0.3)" strokeWidth="4" />
                <circle cx="40" cy="40" r="36" stroke="#34d399" strokeWidth="4"
                  strokeDasharray="226" strokeDashoffset="0" />
                <polyline points="25,41 35,51 55,30" stroke="#34d399" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                  strokeDasharray="50" strokeDashoffset="0" />
              </svg>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
              You&apos;re In! 🎉
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginBottom: '8px' }}>
              Successfully registered for
            </p>
            <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '18px', marginBottom: '32px' }}>
              {conference?.title}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>
              A confirmation has been sent to <strong style={{ color: '#fff' }}>{form.email}</strong>
            </p>
            <Link href="/conferences" className="btn-primary" style={{ textDecoration: 'none' }}>
              ← Browse More Conferences
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '520px', margin: '0 auto', padding: '48px 20px' }}>
        <Link href={`/conference/${conference_id}`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '32px' }}>
          ← Back to Conference
        </Link>

        <div className="fade-up">
          {conference && (
            <div style={{ marginBottom: '32px' }}>
              <p style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                Registration
              </p>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>
                {conference.title}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
                📍 {conference.location} · {new Date(conference.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Full Name *
              </label>
              <input
                className="input"
                type="text"
                placeholder="Jane Smith"
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Email Address *
              </label>
              <input
                className="input"
                type="email"
                placeholder="jane@company.com"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Organization *
              </label>
              <input
                className="input"
                type="text"
                placeholder="Acme Corp"
                required
                value={form.organization}
                onChange={e => setForm(f => ({ ...f, organization: e.target.value }))}
              />
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 16px', color: '#f87171', fontSize: '14px' }}>
                {error}
              </div>
            )}

            <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '8px', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Registering…' : 'Complete Registration →'}
            </button>
          </form>
        </div>
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
